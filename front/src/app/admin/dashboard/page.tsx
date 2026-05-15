"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageShell } from "@/components/layout/page-shell";
import { PrescriptionCard } from "@/components/prescriptions/prescription-card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { getAdminMetrics } from "@/lib/admin";
import { getApiErrorMessage } from "@/lib/errors";
import { listAdminPrescriptions } from "@/lib/prescriptions";
import { buildSearchString } from "@/lib/query-string";
import { ROUTES } from "@/lib/routes";

const statusChartColors = ["#D97706", "#0F766E"];

export default function AdminDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const from = searchParams.get("from") ?? undefined;
  const to = searchParams.get("to") ?? undefined;

  const metricsQuery = useQuery({
    queryKey: ["admin-metrics", { from, to }],
    queryFn: () => getAdminMetrics({ from, to }),
  });

  const prescriptionsQuery = useQuery({
    queryKey: ["admin-prescriptions", { from, to }],
    queryFn: () =>
      listAdminPrescriptions({
        from,
        limit: 6,
        order: "desc",
        page: 1,
        to,
      }),
  });

  const handleFilterSubmit = (formData: FormData) => {
    const nextFrom = formData.get("from")?.toString();
    const nextTo = formData.get("to")?.toString();

    router.replace(
      buildSearchString(ROUTES.adminDashboard, {
        from: nextFrom,
        to: nextTo,
      }),
    );
  };

  const clearFilter = () => {
    router.replace(ROUTES.adminDashboard);
  };

  const statusChartData = metricsQuery.data
    ? [
        { name: "Pendientes", value: metricsQuery.data.byStatus.pending },
        { name: "Consumidas", value: metricsQuery.data.byStatus.consumed },
      ]
    : [];

  return (
    <PageShell
      eyebrow="Admin"
      title="Bienvenido al aplicativo. Este es el resumen general del sistema."
      description="Desde aqui revisas las metricas clave, el estado de las prescripciones y la actividad reciente de toda la plataforma."
    >
      <section className="glass-panel rounded-[34px] p-6">
        <form
          className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            handleFilterSubmit(new FormData(event.currentTarget));
          }}
        >
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Desde
            <input
              type="date"
              name="from"
              defaultValue={from}
              className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 outline-none transition focus:border-slate-400"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Hasta
            <input
              type="date"
              name="to"
              defaultValue={to}
              className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 outline-none transition focus:border-slate-400"
            />
          </label>

          <section className="flex items-end gap-3">
            <button
              type="submit"
              className="rounded-2xl border border-slate-300 bg-white/85 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-white"
            >
              Aplicar rango
            </button>

            <button
              type="button"
              onClick={clearFilter}
              className="rounded-2xl border border-slate-300 bg-white/85 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-white"
            >
              Limpiar filtro
            </button>

            <button type="button" onClick={() => router.push(ROUTES.newUser)} className="ml-auto rounded-2xl bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700 transition-colors">
              Crear usuario
              
            </button>
          </section>
        </form>

      
      </section>

      {metricsQuery.isLoading ? (
        <section className="glass-panel rounded-[34px] p-8 text-sm text-slate-600">
          Cargando metricas del dashboard...
        </section>
      ) : null}

      {metricsQuery.isError ? (
        <section className="glass-panel rounded-[34px] p-8">
          <p className="text-lg font-semibold text-slate-900">
            No pudimos cargar las metricas.
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {getApiErrorMessage(
              metricsQuery.error,
              "Intenta de nuevo en unos segundos.",
            )}
          </p>
        </section>
      ) : null}

      {metricsQuery.data ? (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            <StatCard
              label="Medicos activos"
              value={metricsQuery.data.totals.doctors}
              helper="Usuarios con rol doctor y estado activo"
            />
            <StatCard
              label="Pacientes activos"
              value={metricsQuery.data.totals.patients}
              tone="accent"
              helper="Base actual disponible para prescripciones"
            />
            <StatCard
              label="Prescripciones"
              value={metricsQuery.data.totals.prescriptions}
              tone="success"
              helper="Total en el rango de fechas aplicado"
            />
          </section>

          <section className="grid items-start gap-5 xl:grid-cols-[1.2fr_0.8fr]">
            <article className="glass-panel rounded-[34px] p-6">
              <p className="section-label">Serie diaria</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
                Evolucion de recetas creadas
              </h2>
              <div className="mt-6 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metricsQuery.data.byDay}>
                    <defs>
                      <linearGradient
                        id="prescriptionArea"
                        x1="0"
                        x2="0"
                        y1="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#1652B5"
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="100%"
                          stopColor="#1652B5"
                          stopOpacity={0.04}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#D7DEE7" />
                    <XAxis dataKey="date" stroke="#5F6F82" />
                    <YAxis allowDecimals={false} stroke="#5F6F82" />
                    <Tooltip />
                    <Area
                      dataKey="count"
                      stroke="#1652B5"
                      fill="url(#prescriptionArea)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="glass-panel rounded-[34px] p-6">
              <p className="section-label">Distribucion</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
                Estado de las prescripciones
              </h2>
              <div className="mt-6 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      dataKey="value"
                      innerRadius={60}
                      outerRadius={92}
                      paddingAngle={5}
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={
                            statusChartColors[index % statusChartColors.length]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid gap-3">
                {statusChartData.map((item, index) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/80 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: statusChartColors[index] }}
                      />
                      <span className="text-sm font-medium text-slate-700">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="grid items-start gap-5 xl:grid-cols-[0.95fr_1.05fr]">
            <article className="glass-panel self-start rounded-[34px] p-6">
              <p className="section-label">Top medicos</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
                Volumen de prescripciones
              </h2>

              {metricsQuery.data.topDoctors.length > 0 ? (
                <>
                  <div className="mt-6 h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={metricsQuery.data.topDoctors}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#D7DEE7" />
                        <XAxis
                          dataKey="fullName"
                          stroke="#5F6F82"
                          tickFormatter={(value) => "Dr. " + value?.split(" ")[0]}
                        />
                        <YAxis allowDecimals={false} stroke="#5F6F82" />
                        <Tooltip />
                        <Bar dataKey="count" fill="#D97706" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-4 grid gap-3">
                    {metricsQuery.data.topDoctors.map((doctor) => (
                      <div
                        key={doctor.doctorId}
                        className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3"
                      >
                        <p className="font-semibold text-slate-900">
                          {doctor.fullName ?? "Medico sin nombre"}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {doctor.email ?? "Sin correo"} · {doctor.count}{" "}
                          prescripciones
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="mt-6">
                  <EmptyState
                    title="Todavia no hay suficiente data de medicos"
                    description="Cuando varios doctores creen recetas, aqui veras el ranking por volumen sin romper el layout del dashboard."
                  />
                </div>
              )}
            </article>

            <article className="glass-panel self-start rounded-[34px] p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="section-label">Actividad reciente</p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
                    Ultimas prescripciones del sistema
                  </h2>
                </div>  
              </div>

              {prescriptionsQuery.isLoading ? (
                <p className="mt-6 text-sm text-slate-600">
                  Cargando listado global...
                </p>
              ) : null}

              {prescriptionsQuery.isError ? (
                <p className="mt-6 text-sm text-slate-600">
                  {getApiErrorMessage(
                    prescriptionsQuery.error,
                    "No pudimos cargar el listado global.",
                  )}
                </p>
              ) : null}

              {prescriptionsQuery.data && prescriptionsQuery.data.data.length > 0 ? (
                <div className="mt-6 grid max-h-176 gap-4 overflow-y-auto pr-2 overflow-scrollbar border-slate-200 ">
                  {prescriptionsQuery.data.data.map((prescription) => (
                    <PrescriptionCard
                      key={prescription.id}
                      perspective="admin"
                      prescription={prescription}
                    />
                  ))}
                </div>
              ) : null}

              {prescriptionsQuery.data && prescriptionsQuery.data.data.length === 0 ? (
                <div className="mt-6">
                  <EmptyState
                    title="No hay prescripciones en este rango"
                    description="Ajusta las fechas o crea nuevas prescripciones para poblar la actividad reciente del sistema."
                  />
                </div>
              ) : null}
            </article>
          </section>
        </>
      ) : null}
    </PageShell>
  );
}
