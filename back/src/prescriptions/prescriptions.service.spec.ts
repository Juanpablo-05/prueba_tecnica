import {
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrescriptionStatus, Role } from '@prisma/client';
import type { TokenPayload } from '../auth/types/token-payload.type';
import { PrismaService } from '../prisma/prisma.service';
import { PrescriptionsService } from './prescriptions.service';

describe('PrescriptionsService', () => {
  let service: PrescriptionsService;
  let prisma: {
    user: {
      findFirst: jest.Mock;
    };
    prescription: {
      findUnique: jest.Mock;
      update: jest.Mock;
      count: jest.Mock;
      findMany: jest.Mock;
      create: jest.Mock;
    };
  };

  const patientUser: TokenPayload = {
    sub: 'patient-1',
    email: 'patient@test.com',
    role: Role.PATIENT,
  };

  beforeEach(() => {
    prisma = {
      user: {
        findFirst: jest.fn(),
      },
      prescription: {
        findUnique: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
      },
    };

    service = new PrescriptionsService(prisma as unknown as PrismaService);
  });

  it('marks a patient prescription as consumed', async () => {
    const pendingPrescription = buildPrescription();
    const consumedAt = new Date('2026-05-14T11:00:00.000Z');

    prisma.prescription.findUnique.mockResolvedValue(pendingPrescription);
    prisma.prescription.update.mockResolvedValue(
      buildPrescription({
        status: PrescriptionStatus.CONSUMED,
        consumedAt,
      }),
    );

    const result = await service.consumePrescription(
      patientUser,
      pendingPrescription.id,
      { consumed: true },
    );

    expect(prisma.prescription.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: pendingPrescription.id,
        },
        data: expect.objectContaining({
          status: PrescriptionStatus.CONSUMED,
          consumedAt: expect.any(Date),
        }),
      }),
    );
    expect(result.status).toBe(PrescriptionStatus.CONSUMED);
    expect(result.consumedAt).toEqual(consumedAt);
  });

  it('rejects consume requests when consumed=false', async () => {
    await expect(
      service.consumePrescription(patientUser, 'prescription-1', {
        consumed: false,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prisma.prescription.findUnique).not.toHaveBeenCalled();
  });

  it('rejects consuming a prescription owned by another patient', async () => {
    prisma.prescription.findUnique.mockResolvedValue(
      buildPrescription({
        patientId: 'patient-2',
      }),
    );

    await expect(
      service.consumePrescription(patientUser, 'prescription-1', {
        consumed: true,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(prisma.prescription.update).not.toHaveBeenCalled();
  });
});

function buildPrescription(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'prescription-1',
    doctorId: 'doctor-1',
    patientId: 'patient-1',
    status: PrescriptionStatus.PENDING,
    notes: 'Tomar suficiente agua',
    consumedAt: null,
    createdAt: new Date('2026-05-10T10:00:00.000Z'),
    updatedAt: new Date('2026-05-10T10:00:00.000Z'),
    doctor: {
      id: 'doctor-1',
      fullName: 'Dra. Camila Herrera',
      email: 'dr@test.com',
      documentNumber: '1020304050',
      medicalLicense: 'MED-00125',
    },
    patient: {
      id: 'patient-1',
      fullName: 'Juan Perez',
      email: 'patient@test.com',
      documentNumber: '1098765432',
    },
    items: [
      {
        id: 'item-1',
        name: 'Acetaminofen 500 mg',
        dosage: '1 cada 8 horas',
        quantity: 10,
        instructions: 'Despues de comer',
        createdAt: new Date('2026-05-10T10:00:00.000Z'),
      },
    ],
    ...overrides,
  };
}
