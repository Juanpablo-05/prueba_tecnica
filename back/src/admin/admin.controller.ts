import { Controller, Get, Post, Query, UseGuards, Body } from '@nestjs/common';
import { Role } from '../common/enums/role.enum';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PrescriptionsService } from '../prescriptions/prescriptions.service';
import { ListPrescriptionsQueryDto } from '../prescriptions/dto/list-prescriptions-query.dto';
import { AdminMetricsQueryDto } from './dto/admin-metrics-query.dto';
import {AdminCreateUserDto} from './dto/admin-create-user.dto';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly prescriptionsService: PrescriptionsService,
  ) {}

  @Get('prescriptions')
  getPrescriptions(@Query() query: ListPrescriptionsQueryDto) {
    return this.prescriptionsService.getAdminPrescriptions(query);
  }

  @Get('metrics')
  getMetrics(@Query() query: AdminMetricsQueryDto) {
    return this.adminService.getMetrics(query);
  }

  @Post('create/user')
  async createUser(@Body() userData: AdminCreateUserDto) {
    return await this.adminService.createUser(userData);
  }
}
