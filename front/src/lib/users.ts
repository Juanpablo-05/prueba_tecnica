import { api } from "@/lib/api";
import type { PatientDirectoryItem } from "@/types/users";

export async function listPatients() {
  const response = await api.get<PatientDirectoryItem[]>("/users/patients");
  return response.data;
}
