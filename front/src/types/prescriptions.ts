export type PrescriptionStatus = "PENDING" | "CONSUMED";

export type PrescriptionOrder = "asc" | "desc";

export type PrescriptionPerson = {
  id: string;
  fullName: string;
  email: string;
  documentNumber: string | null;
};

export type PrescriptionDoctor = PrescriptionPerson & {
  medicalLicense: string | null;
};

export type PrescriptionItem = {
  id: string;
  name: string;
  dosage: string | null;
  quantity: number | null;
  instructions: string | null;
  createdAt: string;
};

export type Prescription = {
  id: string;
  status: PrescriptionStatus;
  notes: string | null;
  consumedAt: string | null;
  createdAt: string;
  updatedAt: string;
  doctor: PrescriptionDoctor;
  patient: PrescriptionPerson;
  items: PrescriptionItem[];
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: PaginationMeta;
};

export type PrescriptionFilters = {
  doctorId?: string;
  from?: string;
  limit?: number;
  order?: PrescriptionOrder;
  page?: number;
  patientId?: string;
  status?: PrescriptionStatus;
  to?: string;
};

export type CreatePrescriptionInput = {
  patientId: string;
  notes?: string;
  items: Array<{
    name: string;
    dosage?: string;
    quantity?: number;
    instructions?: string;
  }>;
};
