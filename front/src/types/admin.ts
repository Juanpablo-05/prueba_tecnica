export type AdminMetricsResponse = {
  filters: {
    from: string | null;
    to: string | null;
  };
  totals: {
    doctors: number;
    patients: number;
    prescriptions: number;
  };
  byStatus: {
    pending: number;
    consumed: number;
  };
  byDay: Array<{
    date: string;
    count: number;
  }>;
  topDoctors: Array<{
    doctorId: string;
    count: number;
    fullName: string | null;
    email: string | null;
  }>;
};

export type AdminCreateUserRequest = {
  fullName: string;
  document: string;
  email: string;
  password: string;
  role: "DOCTOR" | "PATIENT";
  isActive: boolean;
  medicalLicenseNumber: string | "N/A";
};