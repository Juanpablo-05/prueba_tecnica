import { PrismaClient, PrescriptionStatus, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function buildPasswordHash(password: string) {
  return bcrypt.hash(password, 10);
}

async function main() {
  const [adminPassword, doctorPassword, patientPassword] = await Promise.all([
    buildPasswordHash('admin123'),
    buildPasswordHash('dr123456'),
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

  await prisma.prescription.createMany({
    data: [
      {
        doctorId: doctor.id,
        patientId: patient.id,
        status: PrescriptionStatus.PENDING,
        notes: 'Tomar suficiente agua durante el tratamiento.',
      },
      {
        doctorId: doctor.id,
        patientId: patient.id,
        status: PrescriptionStatus.CONSUMED,
        notes: 'Control en siete dias.',
        consumedAt: new Date(),
      },
    ],
  });

  const createdPrescriptions = await prisma.prescription.findMany({
    where: {
      doctorId: doctor.id,
      patientId: patient.id,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  if (createdPrescriptions[0]) {
    await prisma.prescriptionItem.createMany({
      data: [
        {
          prescriptionId: createdPrescriptions[0].id,
          name: 'Amoxicilina 500 mg',
          dosage: '1 cada 8 horas',
          quantity: 15,
          instructions: 'Despues de comer',
        },
        {
          prescriptionId: createdPrescriptions[0].id,
          name: 'Acetaminofen 500 mg',
          dosage: '1 cada 12 horas',
          quantity: 10,
          instructions: 'Solo si hay dolor o fiebre',
        },
      ],
    });
  }

  if (createdPrescriptions[1]) {
    await prisma.prescriptionItem.createMany({
      data: [
        {
          prescriptionId: createdPrescriptions[1].id,
          name: 'Ibuprofeno 400 mg',
          dosage: '1 cada 8 horas',
          quantity: 12,
          instructions: 'Tomar con alimentos',
        },
      ],
    });
  }

  console.log('Seed completed');
  console.log(`Admin: ${admin.email} / admin123`);
  console.log(`Doctor: ${doctor.email} / dr123456`);
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
