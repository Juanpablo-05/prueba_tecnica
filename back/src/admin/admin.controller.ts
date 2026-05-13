import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Role } from '../common/enums/role.enum';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  @Get('metrics')
  getMetrics(@Query('from') from?: string, @Query('to') to?: string) {
    return {
      message:
        'RBAC activo: solo ADMIN puede consultar esta ruta. Las metricas reales se implementaran en la fase de negocio.',
      filters: {
        from: from ?? null,
        to: to ?? null,
      },
      roleRequired: Role.ADMIN,
    };
  }
}
