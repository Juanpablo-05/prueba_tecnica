import { PrescriptionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AdminService } from './admin.service';

describe('AdminService', () => {
  let service: AdminService;
  let prisma: {
    user: {
      count: jest.Mock;
      findMany: jest.Mock;
    };
    prescription: {
      count: jest.Mock;
      groupBy: jest.Mock;
      findMany: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      user: {
        count: jest.fn(),
        findMany: jest.fn(),
      },
      prescription: {
        count: jest.fn(),
        groupBy: jest.fn(),
        findMany: jest.fn(),
      },
    };

    service = new AdminService(prisma as unknown as PrismaService);
  });

  it('aggregates totals, status, daily series and top doctors', async () => {
    prisma.user.count.mockResolvedValueOnce(2).mockResolvedValueOnce(8);
    prisma.prescription.count.mockResolvedValue(14);
    prisma.prescription.groupBy
      .mockResolvedValueOnce([
        { status: PrescriptionStatus.PENDING, _count: { _all: 5 } },
        { status: PrescriptionStatus.CONSUMED, _count: { _all: 9 } },
      ])
      .mockResolvedValueOnce([{ doctorId: 'doctor-1', _count: { _all: 11 } }]);
    prisma.prescription.findMany.mockResolvedValue([
      { createdAt: new Date('2026-05-10T08:00:00.000Z') },
      { createdAt: new Date('2026-05-10T10:00:00.000Z') },
      { createdAt: new Date('2026-05-11T09:00:00.000Z') },
    ]);
    prisma.user.findMany.mockResolvedValue([
      {
        id: 'doctor-1',
        fullName: 'Dra. Camila Herrera',
        email: 'dr@test.com',
      },
    ]);

    const result = await service.getMetrics({
      from: '2026-05-01',
      to: '2026-05-14',
    });

    expect(prisma.prescription.count).toHaveBeenCalledWith({
      where: {
        createdAt: {
          gte: new Date('2026-05-01T00:00:00.000Z'),
          lte: new Date('2026-05-14T23:59:59.999Z'),
        },
      },
    });
    expect(result).toEqual({
      filters: {
        from: '2026-05-01',
        to: '2026-05-14',
      },
      totals: {
        doctors: 2,
        patients: 8,
        prescriptions: 14,
      },
      byStatus: {
        pending: 5,
        consumed: 9,
      },
      byDay: [
        { date: '2026-05-10', count: 2 },
        { date: '2026-05-11', count: 1 },
      ],
      topDoctors: [
        {
          doctorId: 'doctor-1',
          count: 11,
          fullName: 'Dra. Camila Herrera',
          email: 'dr@test.com',
        },
      ],
    });
  });

  it('returns empty derived collections when there are no prescriptions', async () => {
    prisma.user.count.mockResolvedValueOnce(1).mockResolvedValueOnce(1);
    prisma.prescription.count.mockResolvedValue(0);
    prisma.prescription.groupBy.mockResolvedValueOnce([]).mockResolvedValueOnce([]);
    prisma.prescription.findMany.mockResolvedValue([]);

    const result = await service.getMetrics({});

    expect(prisma.user.findMany).not.toHaveBeenCalled();
    expect(result.byStatus).toEqual({
      pending: 0,
      consumed: 0,
    });
    expect(result.byDay).toEqual([]);
    expect(result.topDoctors).toEqual([]);
  });
});
