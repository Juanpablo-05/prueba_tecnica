# Prescription Hub

Sistema MVP de prescripciones medicas construido para una prueba tecnica. El repositorio incluye un backend en NestJS + Prisma + PostgreSQL y un frontend en Next.js con TypeScript y TailwindCSS.

## Stack

- Backend: NestJS, Prisma ORM, PostgreSQL, JWT, refresh tokens, RBAC, PDFKit, Swagger
- Frontend: Next.js App Router, React, TypeScript, TailwindCSS, React Query, React Hook Form, Zod

## Funcionalidades implementadas

- Login con `accessToken` + `refreshToken`
- Proteccion de rutas y permisos por rol (`ADMIN`, `DOCTOR`, `PATIENT`)
- Medico: crea prescripciones con items manuales, lista sus registros y ve el detalle
- Paciente: lista sus prescripciones, consulta detalle, marca una prescripcion como consumida y descarga el PDF
- Admin: consulta metricas, listado global de prescripciones y crea usuarios
- Filtros por estado/fecha, paginacion y persistencia de filtros en query string
- Documentacion interactiva de la API con Swagger

## Estructura

```text
back/   API NestJS + Prisma
front/  Aplicacion Next.js
guia.md Requerimientos originales de la prueba
```

## Variables de entorno

Backend en `back/.env`:

```env
PORT=3001
DATABASE_URL="postgresql://postgres:123456@localhost:5432/prueba_tecnica?schema=public"
JWT_ACCESS_SECRET="replace-with-a-secure-access-secret"
JWT_REFRESH_SECRET="replace-with-a-secure-refresh-secret"
JWT_ACCESS_TTL="900s"
JWT_REFRESH_TTL="7d"
APP_ORIGIN="http://localhost:3000"
```

Frontend en `front/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL="http://localhost:3001/api"
```

Tambien puedes copiar desde `back/.env.example` y `front/.env.example`.

## Instalacion y arranque

1. Instala dependencias:

```bash
cd back
npm install

cd ../front
npm install
```

2. Configura las variables de entorno:

```bash
cd back
cp .env.example .env

cd ../front
cp .env.example .env.local
```

3. Ejecuta migraciones y seed:

```bash
cd back
npx prisma migrate dev
npm run prisma:seed
```

4. Levanta el backend:

```bash
cd back
npm run start:dev
```

5. Levanta el frontend en otra terminal:

```bash
cd front
npm run dev
```

## URLs locales

- Frontend: `http://localhost:3000`
- API REST: `http://localhost:3001/api`
- Swagger: `http://localhost:3001/docs`

## Credenciales de prueba

- Admin: `admin@test.com / admin123`
- Doctor: `dr@test.com / dr123`
- Paciente: `patient@test.com / patient123`

El seed crea 6 prescripciones de ejemplo mezclando estados `PENDING` y `CONSUMED`.

## Scripts utiles

Backend:

- `npm run start:dev`
- `npm run build`
- `npm run test`
- `npm run prisma:seed`

Frontend:

- `npm run dev`
- `npm run build`
- `npm run typecheck`
- `npm run test`

## Endpoints principales

- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/profile`
- `GET /api/users/patients`
- `POST /api/prescriptions`
- `GET /api/prescriptions`
- `GET /api/me/prescriptions`
- `GET /api/prescriptions/:id`
- `PUT /api/prescriptions/:id/consume`
- `GET /api/prescriptions/:id/pdf`
- `GET /api/admin/prescriptions`
- `GET /api/admin/metrics`
- `POST /api/admin/create/user`

## Decisiones tecnicas

- Autenticacion: tokens JWT con rotacion de refresh token y validacion del refresh almacenado en base de datos.
- Autorizacion: guards de NestJS + decorador `@Roles()` para controlar acceso por rol en la API.
- PDF: generado desde backend con `pdfkit` para evitar depender del cliente y proteger el acceso.
- Paginacion y filtros: todos los listados devuelven `meta` con pagina, limite, total y totalPages.
- Frontend: sesion centralizada en un provider con React Query para llamadas a la API.

## Testing

- Backend: pruebas unitarias de auth, metricas de admin y consumo de prescripciones.
- Frontend: pruebas del helper de query string y del componente `PrescriptionCard`, que es una pieza critica del listado por rol.

Ejecuta:

```bash
cd back
npm run test

cd ../front
npm run test
```

## Despliegue

- Frontend: pendiente de publicar
- Backend: pendiente de publicar

