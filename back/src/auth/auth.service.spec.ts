import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Role, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: {
    findByEmail: jest.Mock;
    findById: jest.Mock;
    findRefreshTokenById: jest.Mock;
    revokeRefreshToken: jest.Mock;
    createRefreshToken: jest.Mock;
    toProfile: jest.Mock;
  };
  let jwtService: {
    signAsync: jest.Mock;
  };
  let configService: {
    get: jest.Mock;
  };

  const user: User = {
    id: 'doctor-1',
    fullName: 'Dra. Camila Herrera',
    email: 'dr@test.com',
    passwordHash: 'stored-password-hash',
    role: Role.DOCTOR,
    documentNumber: '1020304050',
    medicalLicense: 'MED-00125',
    isActive: true,
    createdAt: new Date('2026-05-01T10:00:00.000Z'),
    updatedAt: new Date('2026-05-01T10:00:00.000Z'),
  };

  beforeEach(() => {
    const mockedBcrypt = jest.mocked(bcrypt);

    usersService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      findRefreshTokenById: jest.fn(),
      revokeRefreshToken: jest.fn(),
      createRefreshToken: jest.fn(),
      toProfile: jest.fn(),
    };
    jwtService = {
      signAsync: jest.fn(),
    };
    configService = {
      get: jest.fn((key: string) => {
        const values: Record<string, string> = {
          JWT_ACCESS_SECRET: 'access-secret',
          JWT_ACCESS_TTL: '900s',
          JWT_REFRESH_SECRET: 'refresh-secret',
          JWT_REFRESH_TTL: '7d',
        };

        return values[key];
      }),
    };

    service = new AuthService(
      usersService as unknown as UsersService,
      jwtService as unknown as JwtService,
      configService as unknown as ConfigService,
    );

    mockedBcrypt.compare.mockReset();
    mockedBcrypt.hash.mockReset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('logs in an active user and returns tokens plus profile', async () => {
    const mockedBcrypt = jest.mocked(bcrypt);
    const expectedProfile = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    };

    usersService.findByEmail.mockResolvedValue(user);
    usersService.toProfile.mockReturnValue(expectedProfile);
    jwtService.signAsync
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');
    usersService.createRefreshToken.mockResolvedValue(undefined);
    mockedBcrypt.compare.mockResolvedValue(true as never);
    mockedBcrypt.hash.mockResolvedValue('hashed-refresh-token' as never);

    const result = await service.login({
      email: user.email,
      password: 'dr123',
    });

    expect(usersService.findByEmail).toHaveBeenCalledWith(user.email);
    expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
    expect(usersService.createRefreshToken).toHaveBeenCalledWith({
      id: expect.any(String),
      userId: user.id,
      tokenHash: 'hashed-refresh-token',
      expiresAt: expect.any(Date),
    });
    expect(result).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: expectedProfile,
    });
  });

  it('rejects login when the password is invalid', async () => {
    const mockedBcrypt = jest.mocked(bcrypt);
    usersService.findByEmail.mockResolvedValue(user);
    mockedBcrypt.compare.mockResolvedValue(false as never);

    await expect(
      service.login({
        email: user.email,
        password: 'wrong-password',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(jwtService.signAsync).not.toHaveBeenCalled();
    expect(usersService.createRefreshToken).not.toHaveBeenCalled();
  });
});
