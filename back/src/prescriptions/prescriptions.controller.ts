import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { TokenPayload } from '../auth/types/token-payload.type';
import { ConsumePrescriptionDto } from './dto/consume-prescription.dto';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { ListPrescriptionsQueryDto } from './dto/list-prescriptions-query.dto';
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
    return this.prescriptionsService.createPrescription(user, createPrescriptionDto);
  }

  @Get('prescriptions')
  @Roles(Role.DOCTOR)
  getDoctorOrAdminPrescriptions(
    @CurrentUser() user: TokenPayload,
    @Query() query: ListPrescriptionsQueryDto,
  ) {
    return this.prescriptionsService.getDoctorPrescriptions(user, query);
  }

  @Get('me/prescriptions')
  @Roles(Role.PATIENT)
  getPatientPrescriptions(
    @CurrentUser() user: TokenPayload,
    @Query() query: ListPrescriptionsQueryDto,
  ) {
    return this.prescriptionsService.getPatientPrescriptions(user, query);
  }

  @Get('prescriptions/:id')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.PATIENT)
  getPrescriptionById(
    @Param('id') prescriptionId: string,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.prescriptionsService.getPrescriptionById(user, prescriptionId);
  }

  @Put('prescriptions/:id/consume')
  @Roles(Role.PATIENT)
  consumePrescription(
    @Param('id') prescriptionId: string,
    @Body() consumeDto: ConsumePrescriptionDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.prescriptionsService.consumePrescription(
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
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.prescriptionsService.getPrescriptionPdf(
      user,
      prescriptionId,
      response,
    );
  }
}
