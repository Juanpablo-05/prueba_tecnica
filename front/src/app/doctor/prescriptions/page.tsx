import { RoutePlaceholder } from "@/components/layout/route-placeholder";

export default function DoctorPrescriptionsPage() {
  return (
    <RoutePlaceholder
      role="doctor"
      title="Prescripciones del medico"
      description="Listado inicial para filtros por estado, fecha y paginacion."
      bullets={[
        "Vista de las prescripciones propias",
        "Filtro por estado y rango de fechas",
        "Orden por fecha de creacion descendente",
      ]}
    />
  );
}
