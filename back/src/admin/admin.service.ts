import { Injectable } from '@nestjs/common';
import { PrescriptionStatus, Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AdminMetricsQueryDto } from './dto/admin-metrics-query.dto';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getMetrics(query: AdminMetricsQueryDto) {
    const where: Prisma.PrescriptionWhereInput = {
      createdAt: this.buildCreatedAtFilter(query.from, query.to),
    };

    const [
      doctors,
      patients,
      prescriptions,
      byStatusRows,
      topDoctorRows,
      dailyRows,
    ] = await Promise.all([
      this.prisma.user.count({
        where: {
          role: Role.DOCTOR,
          isActive: true,
        },
      }),
      this.prisma.user.count({
        where: {
          role: Role.PATIENT,
          isActive: true,
        },
      }),
      this.prisma.prescription.count({ where }),
      this.prisma.prescription.groupBy({
        by: ['status'],
        where,
        _count: {
          _all: true,
        },
      }),
      this.prisma.prescription.groupBy({
        by: ['doctorId'],
        where,
        _count: {
          _all: true,
        },
        orderBy: {
          _count: {
            doctorId: 'desc',
          },
        },
        take: 5,
      }),
      this.prisma.prescription.findMany({
        where,
        select: {
          createdAt: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      }),
    ]);

    const topDoctorIds = topDoctorRows.map((row) => row.doctorId);
    const topDoctors = topDoctorIds.length
      ? await this.prisma.user.findMany({
          where: {
            id: {
              in: topDoctorIds,
            },
          },
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        })
      : [];

    const topDoctorsMap = new Map(
      topDoctors.map((doctor) => [doctor.id, doctor]),
    );

    return {
      filters: {
        from: query.from ?? null,
        to: query.to ?? null,
      },
      totals: {
        doctors,
        patients,
        prescriptions,
      },
      byStatus: {
        pending:
          byStatusRows.find((row) => row.status === PrescriptionStatus.PENDING)
            ?._count._all ?? 0,
        consumed:
          byStatusRows.find((row) => row.status === PrescriptionStatus.CONSUMED)
            ?._count._all ?? 0,
      },
      byDay: this.buildDailySeries(dailyRows),
      topDoctors: topDoctorRows.map((row) => ({
        doctorId: row.doctorId,
        count: row._count._all,
        fullName: topDoctorsMap.get(row.doctorId)?.fullName ?? null,
        email: topDoctorsMap.get(row.doctorId)?.email ?? null,
      })),
    };
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

  private buildDailySeries(rows: { createdAt: Date }[]) {
    const counter = new Map<string, number>();

    for (const row of rows) {
      const date = row.createdAt.toISOString().slice(0, 10);
      counter.set(date, (counter.get(date) ?? 0) + 1);
    }

    return [...counter.entries()].map(([date, count]) => ({
      date,
      count,
    }));
  }

  async createUser(userData: AdminCreateUserDto) {
    try {

      if (!userData.password) { 
        throw new Error('La contraseña es obligatoria');
      }
      

      const passwordHash = await bcrypt.hash(userData.password, 10);
      return await this.prisma.user.create({
        data: {
          fullName: userData.fullName,
          documentNumber: userData.document,
          email: userData.email,
          passwordHash: passwordHash,
          role: userData.role,
          isActive: userData.isActive ?? true,
          medicalLicense: userData.medicalLicenseNumber,
        },
      });
    } catch (error) {
      
      console.error('Error:', error);
      throw error;
    }
  }
}
