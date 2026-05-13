import { RoutePlaceholder } from "@/components/layout/route-placeholder";

export default function PatientPrescriptionDetailPage() {
  return (
    <RoutePlaceholder
      role="patient"
      title="Detalle de prescripcion"
      description="Vista reservada para revisar una prescripcion propia con sus items y estado."
      bullets={[
        "Resumen de medicamentos e indicaciones",
        "Estado actual de la prescripcion",
        "Acciones de descarga y consumo",
      ]}
    />
  );
}
