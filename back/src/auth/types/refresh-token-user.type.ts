import { Role } from '@prisma/client';

export type RefreshTokenUser = {
  sub: string;
  email: string;
  role: Role;
  jti: string;
  refreshToken: string;
};
