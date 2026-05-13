import { Injectable } from '@nestjs/common';
import type { TokenPayload } from '../auth/types/token-payload.type';
import { ConsumePrescriptionDto } from './dto/consume-prescription.dto';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';

@Injectable()
export class PrescriptionsService {
  buildDoctorCreatePreview(
    user: TokenPayload,
    createPrescriptionDto: CreatePrescriptionDto,
  ) {
    return {
      actor: user,
      message:
        'RBAC activo: solo DOCTOR puede crear prescripciones. La persistencia real se implementara en la siguiente fase.',
      payloadPreview: createPrescriptionDto,
    };
  }

  buildListPreview(
    user: TokenPayload,
    filters: Record<string, string | null>,
  ) {
    return {
      actor: user,
      filters,
      message:
        'RBAC activo: esta ruta permite acceso a DOCTOR y ADMIN.',
    };
  }

  buildPatientListPreview(
    user: TokenPayload,
    filters: Record<string, string | null>,
  ) {
    return {
      actor: user,
      filters,
      message:
        'RBAC activo: solo PATIENT puede consultar su bandeja /me/prescriptions.',
    };
  }

  buildDetailPreview(user: TokenPayload, prescriptionId: string) {
    return {
      actor: user,
      message:
        'RBAC activo: ADMIN, DOCTOR y PATIENT pueden llegar a esta ruta. La validacion de pertenencia por registro se implementara junto al CRUD real.',
      prescriptionId,
    };
  }

  buildConsumePreview(
    user: TokenPayload,
    prescriptionId: string,
    consumeDto: ConsumePrescriptionDto,
  ) {
    return {
      actor: user,
      message:
        'RBAC activo: solo PATIENT puede consumir una prescripcion.',
      payloadPreview: consumeDto,
      prescriptionId,
    };
  }

  buildPdfPreview(user: TokenPayload, prescriptionId: string) {
    return {
      actor: user,
      message:
        'RBAC activo: solo PATIENT puede pedir el PDF en esta fase.',
      prescriptionId,
    };
  }
}
