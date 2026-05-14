import { api } from "@/lib/api";
import type {
  CreatePrescriptionInput,
  PaginatedResponse,
  Prescription,
  PrescriptionFilters,
} from "@/types/prescriptions";

function buildPrescriptionParams(filters?: PrescriptionFilters) {
  if (!filters) {
    return undefined;
  }

  const params: Record<string, string | number> = {};

  if (filters.status) {
    params.status = filters.status;
  }

  if (filters.from) {
    params.from = filters.from;
  }

  if (filters.to) {
    params.to = filters.to;
  }

  if (filters.page) {
    params.page = filters.page;
  }

  if (filters.limit) {
    params.limit = filters.limit;
  }

  if (filters.order) {
    params.order = filters.order;
  }

  if (filters.doctorId) {
    params.doctorId = filters.doctorId;
  }

  if (filters.patientId) {
    params.patientId = filters.patientId;
  }

  return params;
}

export async function listDoctorPrescriptions(filters?: PrescriptionFilters) {
  const response = await api.get<PaginatedResponse<Prescription>>("/prescriptions", {
    params: buildPrescriptionParams(filters),
  });

  return response.data;
}

export async function listPatientPrescriptions(filters?: PrescriptionFilters) {
  const response = await api.get<PaginatedResponse<Prescription>>("/me/prescriptions", {
    params: buildPrescriptionParams(filters),
  });

  return response.data;
}

export async function listAdminPrescriptions(filters?: PrescriptionFilters) {
  const response = await api.get<PaginatedResponse<Prescription>>(
    "/admin/prescriptions",
    {
      params: buildPrescriptionParams(filters),
    },
  );

  return response.data;
}

export async function getPrescriptionById(id: string) {
  const response = await api.get<Prescription>(`/prescriptions/${id}`);
  return response.data;
}

export async function createPrescription(payload: CreatePrescriptionInput) {
  const response = await api.post<Prescription>("/prescriptions", payload);
  return response.data;
}

export async function consumePrescription(id: string) {
  const response = await api.put<Prescription>(`/prescriptions/${id}/consume`, {
    consumed: true,
  });

  return response.data;
}

function getFileNameFromHeaders(contentDisposition?: string) {
  if (!contentDisposition) {
    return "prescription.pdf";
  }

  const match = contentDisposition.match(/filename="?([^"]+)"?/i);
  return match?.[1] ?? "prescription.pdf";
}

export async function downloadPrescriptionPdf(id: string) {
  const response = await api.get<Blob>(`/prescriptions/${id}/pdf`, {
    responseType: "blob",
  });

  const blob = new Blob([response.data], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = getFileNameFromHeaders(response.headers["content-disposition"]);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
}
