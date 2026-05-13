import { RoutePlaceholder } from "@/components/layout/route-placeholder";

export default function NewPrescriptionPage() {
  return (
    <RoutePlaceholder
      role="doctor"
      title="Nueva prescripcion"
      description="Formulario base para crear prescripciones con items dinamicos escritos manualmente."
      bullets={[
        "Seleccion de paciente",
        "Items dinamicos con nombre, dosis, cantidad e indicaciones",
        "Notas medicas opcionales",
      ]}
    />
  );
}
