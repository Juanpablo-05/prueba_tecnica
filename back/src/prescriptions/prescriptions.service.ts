import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import {
  PrescriptionStatus,
  Prisma,
  Role,
} from '@prisma/client';
import PDFDocument from 'pdfkit';
import type { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import type { TokenPayload } from '../auth/types/token-payload.type';
import { ConsumePrescriptionDto } from './dto/consume-prescription.dto';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { ListPrescriptionsQueryDto } from './dto/list-prescriptions-query.dto';

const prescriptionInclude = {
  doctor: {
    select: {
      id: true,
      fullName: true,
      email: true,
      documentNumber: true,
      medicalLicense: true,
    },
  },
  patient: {
    select: {
      id: true,
      fullName: true,
      email: true,
      documentNumber: true,
    },
  },
  items: {
    orderBy: {
      createdAt: 'asc',
    },
  },
} satisfies Prisma.PrescriptionInclude;

type PrescriptionWithRelations = Prisma.PrescriptionGetPayload<{
  include: typeof prescriptionInclude;
}>;
type PdfDocument = InstanceType<typeof PDFDocument>;

@Injectable()
export class PrescriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async createPrescription(
    user: TokenPayload,
    createPrescriptionDto: CreatePrescriptionDto,
  ) {
    const patient = await this.prisma.user.findFirst({
      where: {
        id: createPrescriptionDto.patientId,
        role: Role.PATIENT,
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const prescription = await this.prisma.prescription.create({
      data: {
        doctorId: user.sub,
        patientId: patient.id,
        notes: createPrescriptionDto.notes,
        items: {
          create: createPrescriptionDto.items.map((item) => ({
            name: item.name,
            dosage: item.dosage,
            quantity: item.quantity,
            instructions: item.instructions,
          })),
        },
      },
      include: prescriptionInclude,
    });

    return this.mapPrescription(prescription);
  }

  async getDoctorPrescriptions(
    user: TokenPayload,
    query: ListPrescriptionsQueryDto,
  ) {
    const where: Prisma.PrescriptionWhereInput = {
      doctorId: user.sub, 
      status: query.status,
      createdAt: this.buildCreatedAtFilter(query.from, query.to),
    };

    return this.findManyPrescriptions(where, query);
  }

  async getAdminPrescriptions(query: ListPrescriptionsQueryDto) {
    const where: Prisma.PrescriptionWhereInput = {
      doctorId: query.doctorId,
      patientId: query.patientId,
      status: query.status,
      createdAt: this.buildCreatedAtFilter(query.from, query.to),
    };

    return this.findManyPrescriptions(where, query);
  }

  async getPatientPrescriptions(
    user: TokenPayload,
    query: ListPrescriptionsQueryDto,
  ) {
    const where: Prisma.PrescriptionWhereInput = {
      patientId: user.sub,
      status: query.status,
      createdAt: this.buildCreatedAtFilter(query.from, query.to),
    };

    return this.findManyPrescriptions(where, query);
  }

  async getPrescriptionById(user: TokenPayload, prescriptionId: string) {
    const prescription = await this.findPrescriptionOrFail(prescriptionId);

    this.assertCanAccessPrescription(user, prescription);

    return this.mapPrescription(prescription);
  }

  async consumePrescription(
    user: TokenPayload,
    prescriptionId: string,
    consumeDto: ConsumePrescriptionDto,
  ) {
    if (!consumeDto.consumed) {
      throw new BadRequestException(
        'The consume endpoint only accepts consumed=true',
      );
    }

    const prescription = await this.findPrescriptionOrFail(prescriptionId);

    if (prescription.patientId !== user.sub) {
      throw new ForbiddenException(
        'You can only consume your own prescriptions',
      );
    }

    if (prescription.status === PrescriptionStatus.CONSUMED) {
      throw new ConflictException('Prescription is already consumed');
    }

    const updatedPrescription = await this.prisma.prescription.update({
      where: {
        id: prescriptionId,
      },
      data: {
        status: PrescriptionStatus.CONSUMED,
        consumedAt: new Date(),
      },
      include: prescriptionInclude,
    });

    return this.mapPrescription(updatedPrescription);
  }

  async getPrescriptionPdf(
    user: TokenPayload,
    prescriptionId: string,
    response: Response,
  ) {
    const prescription = await this.findPrescriptionOrFail(prescriptionId);

    if (prescription.patientId !== user.sub) {
      throw new ForbiddenException(
        'You can only access the PDF for your own prescriptions',
      );
    }

    const pdfBuffer = await this.buildPrescriptionPdfBuffer(prescription);
    const fileName = `prescription-${prescription.id}.pdf`;

    response.set({
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': pdfBuffer.byteLength.toString(),
      'Content-Type': 'application/pdf',
    });

    return new StreamableFile(pdfBuffer);
  }

  private async findManyPrescriptions(
    where: Prisma.PrescriptionWhereInput,
    query: ListPrescriptionsQueryDto,
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const orderDirection =
      query.order?.toLowerCase() === 'asc' ? 'asc' : 'desc';

    const [total, rows] = await Promise.all([
      this.prisma.prescription.count({ where }),
      this.prisma.prescription.findMany({
        where,
        include: prescriptionInclude,
        orderBy: {
          createdAt: orderDirection,
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      data: rows.map((row) => this.mapPrescription(row)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  private async findPrescriptionOrFail(prescriptionId: string) {
    const prescription = await this.prisma.prescription.findUnique({
      where: {
        id: prescriptionId,
      },
      include: prescriptionInclude,
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    return prescription;
  }

  private assertCanAccessPrescription(
    user: TokenPayload,
    prescription: PrescriptionWithRelations,
  ) {
    if (user.role === Role.ADMIN) {
      return;
    }

    if (user.role === Role.DOCTOR && prescription.doctorId === user.sub) {
      return;
    }

    if (user.role === Role.PATIENT && prescription.patientId === user.sub) {
      return;
    }

    throw new ForbiddenException(
      'You do not have access to this prescription',
    );
  }

  private buildCreatedAtFilter(from?: string, to?: string) {
    const filter: Prisma.DateTimeFilter = {};

    if (from) {
      filter.gte = new Date(`${from}T00:00:00.000Z`);
    }

    if (to) {
      filter.lte = new Date(`${to}T23:59:59.999Z`);
    }

    return Object.keys(filter).length ? filter : undefined;
  }

  private mapPrescription(prescription: PrescriptionWithRelations) {
    return {
      id: prescription.id,
      status: prescription.status,
      notes: prescription.notes,
      consumedAt: prescription.consumedAt,
      createdAt: prescription.createdAt,
      updatedAt: prescription.updatedAt,
      doctor: prescription.doctor,
      patient: prescription.patient,
      items: prescription.items.map((item) => ({
        id: item.id,
        name: item.name,
        dosage: item.dosage,
        quantity: item.quantity,
        instructions: item.instructions,
        createdAt: item.createdAt,
      })),
    };
  }

  private buildPrescriptionPdfBuffer(
    prescription: PrescriptionWithRelations,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const document = new PDFDocument({
        margin: 48,
        size: 'A4',
      });
      const chunks: Buffer[] = [];

      document.on('data', (chunk) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      });
      document.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      document.on('error', reject);

      const muted = '#5F6F82';
      const ink = '#1D2A38';
      const accent = '#1652B5';
      const lightBorder = '#D7DEE7';
      let y = 48;

      document
        .fillColor(accent)
        .fontSize(12)
        .text('PRESCRIPTION HUB', 48, y, { align: 'left' });

      y += 22;

      document
        .fillColor(ink)
        .fontSize(24)
        .text('Prescripcion medica', 48, y);

      y += 34;

      document
        .lineWidth(1)
        .strokeColor(lightBorder)
        .moveTo(48, y)
        .lineTo(547, y)
        .stroke();

      y += 18;

      this.drawKeyValue(document, 'Codigo', prescription.id, 48, y);
      this.drawKeyValue(
        document,
        'Fecha',
        this.formatDate(prescription.createdAt),
        305,
        y,
      );

      y += 42;

      document.fillColor(ink).fontSize(14).text('Paciente', 48, y);
      document.fillColor(ink).fontSize(14).text('Medico', 305, y);

      y += 20;

      this.drawProfileBlock(
        document,
        [
          prescription.patient.fullName,
          prescription.patient.email,
          `Documento: ${prescription.patient.documentNumber ?? 'No registrado'}`,
        ],
        48,
        y,
      );

      this.drawProfileBlock(
        document,
        [
          prescription.doctor.fullName,
          prescription.doctor.email,
          `Documento: ${prescription.doctor.documentNumber ?? 'No registrado'}`,
          `Licencia: ${prescription.doctor.medicalLicense ?? 'No registrada'}`,
        ],
        305,
        y,
      );

      y += 96;

      document.fillColor(ink).fontSize(14).text('Estado y notas', 48, y);

      y += 20;

      this.drawKeyValue(
        document,
        'Estado',
        this.mapStatusLabel(prescription.status),
        48,
        y,
      );
      this.drawKeyValue(
        document,
        'Consumida',
        prescription.consumedAt
          ? this.formatDate(prescription.consumedAt)
          : 'Pendiente',
        305,
        y,
      );

      y += 38;

      document
        .fillColor(muted)
        .fontSize(10)
        .text('Notas', 48, y);
      document
        .fillColor(ink)
        .fontSize(11)
        .text(prescription.notes?.trim() || 'Sin notas registradas.', 48, y + 14, {
          width: 499,
        });

      y = Math.max(y + 56, document.y + 20);

      document.fillColor(ink).fontSize(14).text('Items prescritos', 48, y);
      y += 18;

      for (const [index, item] of prescription.items.entries()) {
        const top = y;
        document
          .roundedRect(48, top, 499, 72, 12)
          .lineWidth(1)
          .strokeColor(lightBorder)
          .stroke();

        document
          .fillColor(accent)
          .fontSize(10)
          .text(`ITEM ${index + 1}`, 62, top + 10);

        document
          .fillColor(ink)
          .fontSize(12)
          .text(item.name, 62, top + 26);

        const dosage = item.dosage ?? 'No especificada';
        const quantity =
          typeof item.quantity === 'number' ? item.quantity.toString() : 'No definida';
        const instructions = item.instructions ?? 'Sin indicaciones';

        document
          .fillColor(muted)
          .fontSize(10)
          .text(`Dosis: ${dosage}`, 62, top + 44, { width: 160 });
        document
          .fillColor(muted)
          .fontSize(10)
          .text(`Cantidad: ${quantity}`, 235, top + 44, { width: 90 });
        document
          .fillColor(muted)
          .fontSize(10)
          .text(`Indicaciones: ${instructions}`, 335, top + 44, {
            width: 190,
          });

        y += 84;

        if (y > 730 && index < prescription.items.length - 1) {
          document.addPage();
          y = 48;
        }
      }

      document.end();
    });
  }

  private drawKeyValue(
    document: PdfDocument,
    label: string,
    value: string,
    x: number,
    y: number,
  ) {
    document.fillColor('#5F6F82').fontSize(10).text(label, x, y);
    document.fillColor('#1D2A38').fontSize(12).text(value, x, y + 14, {
      width: 210,
    });
  }

  private drawProfileBlock(
    document: PdfDocument,
    lines: string[],
    x: number,
    y: number,
  ) {
    let currentY = y;

    for (const line of lines) {
      document.fillColor('#1D2A38').fontSize(11).text(line, x, currentY, {
        width: 220,
      });
      currentY += 15;
    }
  }

  private formatDate(date: Date) {
    return date.toLocaleString('es-CO', {
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  private mapStatusLabel(status: PrescriptionStatus) {
    switch (status) {
      case PrescriptionStatus.CONSUMED:
        return 'Consumida';
      case PrescriptionStatus.PENDING:
      default:
        return 'Pendiente';
    }
  }
}
