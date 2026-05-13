import { RoutePlaceholder } from "@/components/layout/route-placeholder";

export default function PatientPrescriptionsPage() {
  return (
    <RoutePlaceholder
      role="patient"
      title="Bandeja del paciente"
      description="Espacio inicial para listar prescripciones, descargarlas en PDF y marcarlas como consumidas."
      bullets={[
        "Listado de prescripciones propias",
        "Filtro por estado y paginacion",
        "Acciones de consumir y descargar PDF",
      ]}
    />
  );
}
