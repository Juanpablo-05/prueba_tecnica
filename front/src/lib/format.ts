import type { PrescriptionStatus } from "@/types/prescriptions";

const dateTimeFormatter = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "medium",
  timeStyle: "short",
});

const dateFormatter = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "medium",
});

export function formatDateTime(value: string | null) {
  if (!value) {
    return "Sin registro";
  }

  return dateTimeFormatter.format(new Date(value));
}

export function formatDateOnly(value: string | null) {
  if (!value) {
    return "Sin registro";
  }

  return dateFormatter.format(new Date(value));
}

export function formatPrescriptionStatus(status: PrescriptionStatus) {
  switch (status) {
    case "CONSUMED":
      return "Consumida";
    case "PENDING":
    default:
      return "Pendiente";
  }
}

export function truncateText(value: string | null | undefined, maxLength = 120) {
  if (!value) {
    return "";
  }

  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}…`;
}
