import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PrescriptionCard } from "./prescription-card";
import type { Prescription } from "@/types/prescriptions";

const prescriptionFixture: Prescription = {
  id: "prescription-12345678",
  status: "PENDING",
  notes:
    "Tomar suficiente agua y completar el tratamiento indicado por la medica tratante durante toda la semana.",
  consumedAt: null,
  createdAt: "2026-05-14T10:00:00.000Z",
  updatedAt: "2026-05-14T10:00:00.000Z",
  doctor: {
    id: "doctor-1",
    fullName: "Dra. Camila Herrera",
    email: "dr@test.com",
    documentNumber: "1020304050",
    medicalLicense: "MED-00125",
  },
  patient: {
    id: "patient-1",
    fullName: "Juan Perez",
    email: "patient@test.com",
    documentNumber: "1098765432",
  },
  items: [
    {
      id: "item-1",
      name: "Amoxicilina 500 mg",
      dosage: "1 cada 8 horas",
      quantity: 15,
      instructions: "Despues de comer",
      createdAt: "2026-05-14T10:00:00.000Z",
    },
    {
      id: "item-2",
      name: "Acetaminofen 500 mg",
      dosage: "1 cada 12 horas",
      quantity: 10,
      instructions: "Solo si hay fiebre",
      createdAt: "2026-05-14T10:00:00.000Z",
    },
  ],
};

describe("PrescriptionCard", () => {
  it("renders the key monitoring data for the admin perspective", () => {
    const html = renderToStaticMarkup(
      <PrescriptionCard perspective="admin" prescription={prescriptionFixture} />,
    );

    expect(html).toContain("Pendiente");
    expect(html).toContain("Dra. Camila Herrera");
    expect(html).toContain("Juan Perez");
    expect(html).toContain("Vista consolidada para monitoreo admin");
    expect(html).toContain("Tomar suficiente agua");
  });
});
