import { api } from "@/lib/api";
import type { AdminMetricsResponse } from "@/types/admin";

type MetricsFilters = {
  from?: string;
  to?: string;
};

export async function getAdminMetrics(filters?: MetricsFilters) {
  const response = await api.get<AdminMetricsResponse>("/admin/metrics", {
    params: filters,
  });

  return response.data;
}
