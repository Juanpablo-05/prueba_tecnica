import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { TokenPayload } from '../auth/types/token-payload.type';
import { ConsumePrescriptionDto } from './dto/consume-prescription.dto';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { PrescriptionsService } from './prescriptions.service';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class PrescriptionsController {
  constructor(
    private readonly prescriptionsService: PrescriptionsService,
  ) {}

  @Post('prescriptions')
  @Roles(Role.DOCTOR)
  createPrescription(
    @Body() createPrescriptionDto: CreatePrescriptionDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.prescriptionsService.buildDoctorCreatePreview(
      user,
      createPrescriptionDto,
    );
  }

  @Get('prescriptions')
  @Roles(Role.DOCTOR, Role.ADMIN)
  getDoctorOrAdminPrescriptions(
    @CurrentUser() user: TokenPayload,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.prescriptionsService.buildListPreview(user, {
      limit: limit ?? null,
      page: page ?? null,
      status: status ?? null,
    });
  }

  @Get('me/prescriptions')
  @Roles(Role.PATIENT)
  getPatientPrescriptions(
    @CurrentUser() user: TokenPayload,
    @Query('status') status?: string,
  ) {
    return this.prescriptionsService.buildPatientListPreview(user, {
      status: status ?? null,
    });
  }

  @Get('prescriptions/:id')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.PATIENT)
  getPrescriptionById(
    @Param('id') prescriptionId: string,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.prescriptionsService.buildDetailPreview(user, prescriptionId);
  }

  @Put('prescriptions/:id/consume')
  @Roles(Role.PATIENT)
  consumePrescription(
    @Param('id') prescriptionId: string,
    @Body() consumeDto: ConsumePrescriptionDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.prescriptionsService.buildConsumePreview(
      user,
      prescriptionId,
      consumeDto,
    );
  }

  @Get('prescriptions/:id/pdf')
  @Roles(Role.PATIENT)
  getPrescriptionPdf(
    @Param('id') prescriptionId: string,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.prescriptionsService.buildPdfPreview(user, prescriptionId);
  }
}
