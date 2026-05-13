import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email }
    });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id }
    });
  }

  createRefreshToken(data: Prisma.RefreshTokenUncheckedCreateInput) {
    return this.prisma.refreshToken.create({
      data
    });
  }

  findRefreshTokenById(id: string) {
    return this.prisma.refreshToken.findUnique({
      where: { id }
    });
  }

  revokeRefreshToken(id: string) {
    return this.prisma.refreshToken.update({
      where: { id },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  toProfile(user: User) {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      documentNumber: user.documentNumber,
      medicalLicense: user.medicalLicense,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }
}
