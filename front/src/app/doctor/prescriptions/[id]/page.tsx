import { RoutePlaceholder } from "@/components/layout/route-placeholder";

export default function DoctorPrescriptionDetailPage() {
  return (
    <RoutePlaceholder
      role="doctor"
      title="Detalle de prescripcion"
      description="Pantalla reservada para revisar una prescripcion creada por el medico."
      bullets={[
        "Datos del paciente y del medico",
        "Listado de items prescritos",
        "Estado y fecha de creacion",
      ]}
    />
  );
}
