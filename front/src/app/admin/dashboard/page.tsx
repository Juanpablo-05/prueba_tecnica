import { RoutePlaceholder } from "@/components/layout/route-placeholder";

export default function AdminDashboardPage() {
  return (
    <RoutePlaceholder
      role="admin"
      title="Dashboard de administracion"
      description="Base inicial para tarjetas de metricas, graficas por estado y filtros por fecha."
      bullets={[
        "Totales de medicos, pacientes y prescripciones",
        "Serie diaria para ultimos 30 dias",
        "Top medicos por volumen como plus opcional",
      ]}
    />
  );
}
