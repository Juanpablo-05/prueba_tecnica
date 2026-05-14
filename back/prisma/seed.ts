import { PrismaClient, PrescriptionStatus, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function buildPasswordHash(password: string) {
  return bcrypt.hash(password, 10);
}

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(10, 0, 0, 0);
  return date;
}

async function main() {
  const [adminPassword, doctorPassword, patientPassword] = await Promise.all([
    buildPasswordHash('admin123'),
    buildPasswordHash('dr123'),
    buildPasswordHash('patient123'),
  ]);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {
      fullName: 'Admin Principal',
      passwordHash: adminPassword,
      role: Role.ADMIN,
      isActive: true,
    },
    create: {
      fullName: 'Admin Principal',
      email: 'admin@test.com',
      passwordHash: adminPassword,
      role: Role.ADMIN,
      isActive: true,
    },
  });

  const doctor = await prisma.user.upsert({
    where: { email: 'dr@test.com' },
    update: {
      fullName: 'Dra. Camila Herrera',
      passwordHash: doctorPassword,
      role: Role.DOCTOR,
      documentNumber: '1020304050',
      medicalLicense: 'MED-00125',
      isActive: true,
    },
    create: {
      fullName: 'Dra. Camila Herrera',
      email: 'dr@test.com',
      passwordHash: doctorPassword,
      role: Role.DOCTOR,
      documentNumber: '1020304050',
      medicalLicense: 'MED-00125',
      isActive: true,
    },
  });

  const patient = await prisma.user.upsert({
    where: { email: 'patient@test.com' },
    update: {
      fullName: 'Juan Perez',
      passwordHash: patientPassword,
      role: Role.PATIENT,
      documentNumber: '1098765432',
      isActive: true,
    },
    create: {
      fullName: 'Juan Perez',
      email: 'patient@test.com',
      passwordHash: patientPassword,
      role: Role.PATIENT,
      documentNumber: '1098765432',
      isActive: true,
    },
  });

  await prisma.refreshToken.deleteMany();
  await prisma.prescriptionItem.deleteMany();
  await prisma.prescription.deleteMany();

  const prescriptions = [
    {
      status: PrescriptionStatus.PENDING,
      createdAt: daysAgo(14),
      notes: 'Tomar suficiente agua durante el tratamiento.',
      items: [
        {
          name: 'Amoxicilina 500 mg',
          dosage: '1 cada 8 horas',
          quantity: 15,
          instructions: 'Despues de comer',
        },
        {
          name: 'Acetaminofen 500 mg',
          dosage: '1 cada 12 horas',
          quantity: 10,
          instructions: 'Solo si hay dolor o fiebre',
        },
      ],
    },
    {
      status: PrescriptionStatus.CONSUMED,
      createdAt: daysAgo(12),
      notes: 'Control en siete dias.',
      items: [
        {
          name: 'Ibuprofeno 400 mg',
          dosage: '1 cada 8 horas',
          quantity: 12,
          instructions: 'Tomar con alimentos',
        },
      ],
    },
    {
      status: PrescriptionStatus.PENDING,
      createdAt: daysAgo(9),
      notes: 'Reposo por 48 horas y vigilancia de sintomas.',
      items: [
        {
          name: 'Loratadina 10 mg',
          dosage: '1 al dia',
          quantity: 7,
          instructions: 'En la noche',
        },
      ],
    },
    {
      status: PrescriptionStatus.CONSUMED,
      createdAt: daysAgo(7),
      notes: 'Volver si persiste el dolor.',
      items: [
        {
          name: 'Naproxeno 250 mg',
          dosage: '1 cada 12 horas',
          quantity: 8,
          instructions: 'Tomar despues del desayuno y la cena',
        },
        {
          name: 'Omeprazol 20 mg',
          dosage: '1 al dia',
          quantity: 8,
          instructions: 'Antes del desayuno',
        },
      ],
    },
    {
      status: PrescriptionStatus.PENDING,
      createdAt: daysAgo(4),
      notes: 'Reforzar hidratacion y descanso.',
      items: [
        {
          name: 'Vitamina C 500 mg',
          dosage: '1 cada 24 horas',
          quantity: 5,
          instructions: 'Despues del almuerzo',
        },
      ],
    },
    {
      status: PrescriptionStatus.PENDING,
      createdAt: daysAgo(1),
      notes: 'Seguimiento virtual en tres dias.',
      items: [
        {
          name: 'Salbutamol inhalador',
          dosage: '2 inhalaciones cada 8 horas',
          quantity: 1,
          instructions: 'Usar solo ante dificultad respiratoria',
        },
        {
          name: 'Acetaminofen 500 mg',
          dosage: '1 cada 8 horas',
          quantity: 9,
          instructions: 'Solo si presenta fiebre',
        },
      ],
    },
  ];

  for (const prescription of prescriptions) {
    await prisma.prescription.create({
      data: {
        doctorId: doctor.id,
        patientId: patient.id,
        status: prescription.status,
        notes: prescription.notes,
        createdAt: prescription.createdAt,
        consumedAt:
          prescription.status === PrescriptionStatus.CONSUMED
            ? new Date(prescription.createdAt.getTime() + 4 * 60 * 60 * 1000)
            : undefined,
        items: {
          create: prescription.items,
        },
      },
    });
  }

  console.log('Seed completed');
  console.log(`Admin: ${admin.email} / admin123`);
  console.log(`Doctor: ${doctor.email} / dr123`);
  console.log(`Patient: ${patient.email} / patient123`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
