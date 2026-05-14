
type RoutePlaceholderProps = {
  role: "admin" | "doctor" | "patient";
  title: string;
  description: string;
  bullets: string[];
};

const roleAccent: Record<RoutePlaceholderProps["role"], string> = {
  admin: "bg-amber-500/15 text-amber-800 border-amber-200",
  doctor: "bg-blue-500/15 text-blue-800 border-blue-200",
  patient: "bg-emerald-500/15 text-emerald-800 border-emerald-200",
};

export function RoutePlaceholder({
  role,
  title,
  description,
  bullets,
}: RoutePlaceholderProps) {

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 px-6 py-10 lg:px-10">
      <section className="glass-panel w-full rounded-4xl p-8 lg:p-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="section-label">Ruta Base</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
              {title}
            </h1>
          </div>
          <span
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] ${roleAccent[role]}`}
          >
            {role}
          </span>
        </div>

        <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
          {description}
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {bullets.map((bullet) => (
            <div
              key={bullet}
              className="rounded-3xl border border-slate-200 bg-white/80 p-5"
            >
              <p className="text-sm leading-7 text-slate-700">{bullet}</p>
              
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
