## PRUEBA TECNICA 

## 1. Stack obligatorio

### Backend

- `NestJS`
- `Prisma ORM`
- `PostgreSQL`
- Autenticación con `JWT + refresh tokens`
- `RBAC` con `Guards` y `Decorators`

### Frontend

- `Next.js` (`App Router` o `Pages`)
- `React`
- `TypeScript`
- `TailwindCSS`

### Infra sugerida

- Backend en `Railway` o `Render`
- Base de datos en `Railway PostgreSQL`
- Frontend en `Vercel`

---

## 2. Objetivo

Construir un **MVP simple y sólido** de un sistema de prescripciones con 3 roles:

- `Médico`
- `Paciente`
- `Admin`

### Flujo principal

- El médico crea prescripciones asociadas a un paciente.
- Los ítems de la prescripción se digitan manualmente.
- No hay CRUD de productos.
- El paciente ve sus prescripciones.
- El paciente puede marcarlas como `consumidas`.
- El paciente puede descargarlas en `PDF`.
- El admin ve métricas totales y por estado.

---

## 3. Requerimientos funcionales

### Roles

#### Admin

- Visualiza métricas:
  - número de pacientes
  - número de médicos
  - número de prescripciones
  - prescripciones por estado
  - prescripciones por día
- Plus opcional: crea usuarios y asigna roles

#### Médico

- Crea prescripciones para un paciente existente o por email del paciente
- Lista y ve el detalle de sus propias prescripciones

#### Paciente

- Lista y ve el detalle de sus prescripciones
- Cambia el estado de `pending` a `consumed`
- Descarga el PDF de la prescripción

### Flujo mínimo esperado

1. Autenticación por `email/password`
2. Un médico crea una prescripción para un paciente con inputs libres para ítems
3. El paciente ve su bandeja de prescripciones, puede marcar como consumida y descargar PDF
4. El admin visualiza métricas

### Estados

- `Prescription`: `pending | consumed`
- `PrescriptionItem`: no requiere estado; solo nombre, dosis, cantidad e indicaciones

---

## 4. Requerimientos técnicos

### Autenticación y autorización

- `JWT` de acceso + `refresh token`
- Rotación de refresh token recomendada
- Almacenamiento seguro:
  - `HTTP-Only cookies` si usas cookies
  - o `Bearer token` si lo manejas por cabecera
- `RBAC` con guards y `@Roles('admin' | 'doctor' | 'patient')`
- Rutas protegidas según rol, tanto en API como en frontend

### Validación y seguridad

- Validación de DTOs con `class-validator`
- Serialización con `class-transformer`
- Manejo estándar de errores con filtros y códigos HTTP correctos
- Seguridad básica:
  - `Helmet`
  - `CORS`
  - rate limiting básico

### Datos y base de datos

- `PostgreSQL` con `Prisma`
- Relaciones correctas
- Índices en campos de búsqueda frecuentes
- Migraciones con `prisma migrate`
- `seed` con datos de ejemplo

### Features mínimas

- Paginación y filtros en listados por estado y fecha
- Ordenamiento:
  - `createdAt DESC` por defecto
  - parametrizable
- Soft delete opcional para usuarios y prescripciones
- PDF de una prescripción generado desde el backend

### Testing

- Backend: al menos tests unitarios de servicios o `e2e` básicos con `Jest` + `Supertest` o `Pactum`
- Frontend: prueba mínima de un componente o hook crítico

---

## 5. API: contratos mínimos

### Auth

- `POST /auth/register`
  - opcional si no haces panel de admin
  - crea usuario `patient` o `doctor`
  - en la corrección se aceptan seeds
- `POST /auth/login` → `{ accessToken, refreshToken }`
- `POST /auth/refresh` → `{ accessToken }`
- `GET /auth/profile` → usuario y rol

### Usuarios

Mínimo para admin. Puede omitirse si usas seeds.

- `GET /users?role=doctor|patient&query=...`
- `POST /users`

### Pacientes / Doctores

Solo si separas perfiles.

- `GET /patients`
- `GET /doctors`

Ambos con paginación y filtros simples.

### Médico

- `POST /prescriptions`

```json
{
  "patientId": "...",
  "notes": "...",
  "items": [
    {
      "name": "Amoxicilina 500mg",
      "dosage": "1 c/8h",
      "quantity": 15,
      "instructions": "Después de comer"
    }
  ]
}
```

- `GET /prescriptions?mine=true&status=&from=&to=&page=&limit=&order=`
- `GET /prescriptions/:id`

### Paciente

- `GET /me/prescriptions?status=&page=&limit=`
- `PUT /prescriptions/:id/consume`
  - marca como consumida si pertenece al paciente
- `GET /prescriptions/:id/pdf`
  - descarga PDF si pertenece al paciente

### Admin

- `GET /admin/prescriptions?status=&doctorId=&patientId=&from=&to=&page=&limit=`

### Métricas

- `GET /admin/metrics?from=&to=`

```json
{
  "totals": {
    "doctors": 10,
    "patients": 120,
    "prescriptions": 560
  },
  "byStatus": {
    "pending": 120,
    "consumed": 440
  },
  "byDay": [
    { "date": "2025-10-25", "count": 20 }
  ],
  "topDoctors": [
    { "doctorId": "...", "count": 50 }
  ]
}
```

### Reglas de acceso

- `Doctor`: solo ve y gestiona sus prescripciones
- `Paciente`: solo ve y gestiona sus prescripciones
- `Admin`: acceso a todo y a métricas

### Errores

Respuestas consistentes:

```json
{
  "message": "string",
  "code": "string",
  "details": {}
}
```

Códigos esperados:

- `400`
- `401`
- `403`
- `404`
- `409`
- `500`

---

## 6. Frontend: páginas mínimas

### Autenticación

- `/login`
  - email/password
  - guarda tokens y perfil

### Médico

- `/doctor/prescriptions`
  - listado
  - filtros por estado/fecha
  - paginado
- `/doctor/prescriptions/new`
  - formulario con ítems dinámicos `add/remove`
- `/doctor/prescriptions/[id]`
  - detalle

### Paciente

- `/patient/prescriptions`
  - listado
  - acciones:
    - marcar consumida
    - descargar PDF
- `/patient/prescriptions/[id]`
  - detalle

### Admin

- `/admin/dashboard`
  - tarjetas
  - gráficos simples con `Recharts` o `Chart.js`

#### Contenido mínimo del dashboard

- Totales: doctores, pacientes, prescripciones
- Por estado
- Serie por día de los últimos 30 días
- Plus opcional: top médicos por volumen

### UX/UI

- Responsive con grid/cards
- Estados de carga, error y vacío
- Toasts para acciones:
  - creado
  - consumido
  - error
- Protección de rutas por rol
- Persistencia de filtros en query string

---

## 7. PDF de prescripción

### Endpoint

- `GET /prescriptions/:id/pdf`

### Debe contener

- datos del paciente
- datos del médico
- fecha
- código
- lista de ítems:
  - nombre
  - dosis
  - cantidad
  - instrucciones
- estado

### Tecnología libre

- `pdfkit`
- `puppeteer` o `playwright` con plantilla HTML
- `html-pdf`

### Plus

- QR con el código para abrir `/patient/prescriptions/:id`

---

## 8. Semillas y credenciales de prueba

Script esperado:

- `prisma/seed.ts`

Debe crear:

- `1 admin`: `admin@test.com / admin123`
- `1 médico`: `dr@test.com / dr123`
- `1 paciente`: `patient@test.com / patient123`
- `5 a 10` prescripciones de ejemplo entre `pending` y `consumed`

> Se acepta no tener UI de creación de usuarios si existen seeds.

---

## 9. Variables de entorno

### Backend `.env`

```env
DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public"
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
JWT_ACCESS_TTL=900s
JWT_REFRESH_TTL=7d
APP_ORIGIN=https://frontend-url
```

### Frontend `.env.local`

```env
NEXT_PUBLIC_API_BASE_URL=https://backend-url
```

---

## 10. Estructura sugerida

### Backend

```text
src/
  main.ts
  app.module.ts
  auth/
    auth.module.ts
    auth.controller.ts
    auth.service.ts
    jwt.strategy.ts
    refresh.strategy.ts
    roles.guard.ts
  users/
    users.module.ts
    users.controller.ts
    users.service.ts
  patients/
  doctors/
  prescriptions/
    prescriptions.module.ts
    prescriptions.controller.ts
    prescriptions.service.ts
    dto/
  common/
    guards/
    interceptors/
    filters/
  prisma/
    prisma.module.ts
    prisma.service.ts
```

### Frontend

```text
src/
  app/ (o pages/)
    login/
    doctor/prescriptions/
      page.tsx
      new/
      [id]/
    patient/prescriptions/
      page.tsx
      [id]/
    admin/
  components/
  lib/ (fetcher, auth, guards)
  store/ (Zustand/Redux)
```

---

## 11. Entregables

### 1. Repositorio GitHub

- Mono-repo o dos repos
- Código fuente, migraciones y seed
- `README` con:
  - setup local
  - Docker opcional
  - variables de entorno
  - scripts
  - cómo correr migraciones y seed
  - cuentas de prueba

### 2. Despliegue funcionando

- URLs de frontend y API en el `README`

### 3. Documentación

- Decisiones técnicas:
  - autenticación
  - RBAC
  - generación de PDF
  - paginación
  - etc.
- Endpoints con `OpenAPI/Swagger` preferiblemente

### 4. Testing

- Comandos de test
- Reporte de coverage si aplica

---

## 12. Criterios de evaluación

- `Funcionalidad (35%)`
  - flujos completos por rol
  - PDF
  - filtros y paginación
  - métricas
- `Calidad de código (25%)`
  - módulos claros
  - DTOs y validación
  - manejo de errores
  - consistencia en TypeScript
- `Arquitectura (20%)`
  - separación de capas
  - guards y strategies
  - Prisma bien usado
  - índices
- `UX/UI (15%)`
  - responsive
  - estados de carga/error/vacío
  - toasts
  - DX del frontend
- `Testing (5%)`
  - mínimos que cubran lo crítico

---

## 13. Plus opcionales

- Swagger en `/docs`
- colección de `Postman` o `Insomnia`
- PDF con QR y firma/cédula del médico
- Auditoría con tabla de `audit_logs` para cambios de estado
- Notificaciones por email al crear prescripción
- Búsqueda avanzada por nombre de ítem y notas
- Tema `dark/light` con preferencia persistida
- `SSE` o `WebSocket` para métricas en vivo

---

## 14. Checklist de aceptación

- Login funciona y devuelve perfil/rol
- Guards y decorators de roles operativos
- Médico crea prescripción con ítems manuales
- Paciente ve solo las suyas, puede consumir y descargar PDF
- Admin ve métricas con filtros de fecha
- Listados con paginación, filtros y orden
- Migraciones y seed corren sin errores
- `README` suficiente para levantar el proyecto en menos de 15 minutos

---

## 15. Ejemplos de DTOs

### `create-prescription.dto.ts`

```ts
export class CreatePrescriptionDto {
  patientId: string;
  notes?: string;
  items: {
    name: string;
    dosage?: string;
    quantity?: number;
    instructions?: string;
  }[];
}
```

### `consume-prescription.dto.ts`

```ts
export class ConsumePrescriptionDto {
  consumed: boolean; // true
}
```

---

## 16. Consideraciones finales

- No se exige catálogo de productos: los ítems se escriben a mano
- Puedes registrar pacientes y médicos vía seed
- El panel de admin para crear usuarios es plus
- Mantén el alcance en `MVP`
- El plus suma puntos solo si el core está bien hecho

> Demuestra tu capacidad técnica y de liderazgo creando una solución completa y profesional.

---

## 17. Plan de ejecución, paso a paso

### Fase 1. Setup del proyecto 
 
- Inicializar:
  - backend con `NestJS`
  - frontend con `Next.js + TypeScript + Tailwind`
- Configurar:
  - `ESLint`
  - `Prettier`
  - variables de entorno
  - conexión a PostgreSQL
  - `Prisma`

### Fase 2. Modelo de datos y Prisma 

- Definir modelos base:
  - `User`
  - `RefreshToken`
  - `Prescription`
  - `PrescriptionItem`
- Definir enums:
  - `Role`
  - `PrescriptionStatus`
- Crear relaciones, índices y migración inicial
- Preparar `seed.ts` con usuarios y prescripciones de ejemplo

### Fase 3. Autenticación y autorización 

- Implementar `login`
- Implementar `refresh token`
- Implementar `profile`
- Crear estrategias y guards:
  - `JwtStrategy`
  - `RefreshStrategy`
  - `JwtAuthGuard`
  - `RolesGuard`
- Crear decorador `@Roles()`
- Proteger rutas por rol

### Fase 4. Backend del core de negocio 

- Módulo de prescripciones
- Endpoints para médico:
  - crear prescripción
  - listar sus prescripciones
  - ver detalle
- Endpoints para paciente:
  - listar sus prescripciones
  - ver detalle
  - marcar como consumida
  - descargar PDF
- Endpoints para admin:
  - listar prescripciones globales
  - consultar métricas

### Fase 5. PDF de prescripción 

- Generar PDF desde backend
- Incluir:
  - datos del paciente
  - datos del médico
  - fecha
  - estado
  - ítems
- Validar acceso:
  - paciente solo descarga las suyas
  - admin puede acceder si decides habilitarlo

### Fase 6. Frontend de autenticación 

- Crear `/login`
- Guardar tokens y perfil
- Crear lógica de sesión
- Redirigir según rol:
  - `admin`
  - `doctor`
  - `patient`
- Proteger rutas en frontend

### Fase 7. Frontend del médico 

- `/doctor/prescriptions`
  - tabla o cards
  - filtros
  - paginación
- `/doctor/prescriptions/new`
  - formulario
  - ítems dinámicos
- `/doctor/prescriptions/[id]`
  - detalle de la prescripción

### Fase 8. Frontend del paciente 

- `/patient/prescriptions`
  - listado
  - filtros básicos
  - acción de consumir
  - acción de descargar PDF
- `/patient/prescriptions/[id]`
  - detalle

### Fase 9. Frontend del admin 

- `/admin/dashboard`
- Tarjetas de métricas
- Gráfico por estado
- Gráfico por día
- Filtros por fecha

### Fase 10. Calidad mínima obligatoria

- Validación de DTOs
- Manejo consistente de errores
- Estados de carga, vacío y error en frontend
- Toasts para acciones clave
- Orden y paginación funcionando

### Fase 11. Testing y documentación

- Backend:
  - tests de auth
  - test de creación de prescripción o cambio a consumida
- Frontend:
  - al menos un test de componente o hook
- Documentar en `README`:
  - setup
  - variables
  - migraciones
  - seed
  - credenciales
  - URLs desplegadas si alcanzas a publicar


### Checklist de avance rápido

- [✔] Proyecto inicializado
- [✔] Prisma conectado a PostgreSQL
- [✔] Migración inicial creada
- [✔] Seed funcionando
- [✔] Login funcionando
- [✔] Refresh token funcionando
- [✔] Guards y roles funcionando
- [✔] Médico crea prescripción
- [✔] Paciente lista sus prescripciones
- [✔] Paciente marca como consumida
- [✔] Paciente descarga PDF
- [✔] Admin visualiza métricas
- [✔] Frontend responsive básico
- [✔] README listo

