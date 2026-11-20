# AutoPremium BCN — Web de compra y venta de coches

Web profesional construida con Next.js 14, TypeScript y Tailwind CSS. Preparada para conectarse a Supabase en una fase posterior.

## Stack tecnológico

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Deploy**: Vercel
- **Base de datos futura**: Supabase

---

## Instalación y uso local

### 1. Instalar dependencias

```bash
npm install
```

### 2. Correr en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador.

### 3. Build de producción

```bash
npm run build
npm start
```

---

## Estructura del proyecto

```
app/                    # Páginas (Next.js App Router)
├── page.tsx            # Home
├── coches/
│   ├── page.tsx        # Listado de coches
│   └── [slug]/page.tsx # Ficha individual
├── vender-coche/
├── sobre-nosotros/
├── contacto/
components/
├── layout/             # Header, Footer
├── cars/               # CarCard, CarGrid, CarGallery, CarFilters, CarDetail
├── forms/              # ContactForm, CarInterestForm, SellCarForm
├── sections/           # Hero, Benefits, FeaturedCars, HowItWorks, TrustSection, FinalCTA
└── ui/                 # Button, Badge, Input
lib/
├── data/               # mockCars.ts, mockSettings.ts (datos locales)
├── services/           # cars.ts, leads.ts (capa de datos)
└── utils/              # whatsapp.ts, formatters.ts, cn.ts
types/                  # car.ts, lead.ts, settings.ts
```

---

## Deploy en Vercel

### Opción 1: Deploy desde GitHub (recomendado)

1. Sube el proyecto a un repositorio de GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/tu-usuario/tu-repo.git
git push -u origin main
```

2. Ve a [vercel.com](https://vercel.com) → **New Project** → Importa tu repositorio de GitHub.

3. Vercel detecta automáticamente Next.js. Haz clic en **Deploy**.

### Opción 2: Deploy desde CLI

```bash
npm install -g vercel
vercel
```

Sigue las instrucciones en pantalla.

---

## Personalización rápida

### Cambiar nombre de empresa, teléfono, WhatsApp, etc.

Edita el archivo: `lib/data/mockSettings.ts`

```typescript
export const siteSettings: SiteSettings = {
  nombreEmpresa: "AutoPremium BCN",    // ← cambia esto
  whatsapp: "34932000000",             // ← número sin espacios ni +
  telefono: "+34 932 000 000",         // ← número visible
  email: "info@autopremiumBCN.com",    // ← tu email
  ...
}
```

### Agregar o editar coches

Se hace desde el **panel de administración** (`admin.covegarage.com`, ver más abajo). El archivo `lib/data/mockCars.ts`
ya solo sirve como copia inicial de la base de datos y como plan B si la base de datos no está configurada: **si la base
de datos está activa, editar ese archivo no cambia la web**.

Cada coche tiene esta estructura:
```typescript
{
  id: "1",
  slug: "bmw-serie-3-2021",       // URL amigable
  marca: "BMW",
  modelo: "Serie 3 320d",
  año: 2021,
  kilometraje: 45000,
  combustible: "diésel",          // gasolina | diésel | híbrido | eléctrico
  transmision: "automático",       // manual | automático
  precio: 34900,
  imagenes: ["url-imagen-1", ...],
  estado: "disponible",           // disponible | reservado | vendido
  destacado: true,                // aparece en home
  ...
}
```

---

## Base de datos y panel de administración

### Cómo está montado

- **Base de datos**: Postgres (en Vercel, la integración de **Neon**; variable `DATABASE_URL`). Las tablas se crean solas la
  primera vez (`lib/db/schema.ts`) y se rellenan con los datos de `lib/data/*` (coches, reseñas, preguntas frecuentes).
  Desde ese momento **manda la base de datos**.
- **Web pública** (`www.covegarage.es`): sigue siendo estática y rápida. Cuando se cambia algo en el panel se llama a
  `revalidatePath("/", "layout")` y las páginas se regeneran al momento, sin esperar a un despliegue nuevo.
  Sin `DATABASE_URL` funciona como siempre con `lib/data/*` (plan B).
- **Panel** (`admin.covegarage.com`, código en `app/admin`): es el mismo proyecto de Next. `middleware.ts` reparte por dominio:
  en `admin.*` todo se sirve desde `app/admin` (las direcciones no llevan `/admin`), y en el resto de dominios `/admin` da 404.
  En local: `http://admin.localhost:3000`.
- **Acceso**: usuario + contraseña (scrypt), sesión en cookie firmada y `HttpOnly`, freno a intentos repetidos. Cada página y
  cada acción del panel comprueba la sesión (`lib/auth/session.ts`), no solo el middleware. El primer acceso se crea en `/login`
  con el código `ADMIN_SETUP_TOKEN` (cuando ya hay un usuario ese paso desaparece).
- **Fotos** subidas desde el panel: Vercel Blob (`BLOB_READ_WRITE_TOKEN`). En local se guardan en `public/uploads` (no va a git).
- **Clientes**: los 4 formularios de la web siguen enviando el correo por Formspree y además guardan una copia en la base de
  datos (`/api/leads`), que es lo que ve el panel en *Consultas* y *Clientes*.

### Variables de entorno

Ver `.env.example`. En Vercel: Project → Settings → Environment Variables (la base de datos y Blob las ponen solas sus integraciones).

### Trabajar en local

1. Tener un Postgres (por ejemplo uno local) y crear `.env.local` con `DATABASE_URL`, `ADMIN_SESSION_SECRET` y `ADMIN_SETUP_TOKEN`.
2. `npm run dev` y abrir `http://admin.localhost:3000` (crea tu acceso de prueba) y `http://localhost:3000` (la web).

### Estructura del panel

```
app/admin/
├── login/                  # Entrar / primer acceso
├── (panel)/                # Todo lo de dentro exige sesión
│   ├── page.tsx            # Resumen
│   ├── coches/             # Listado, alta y edición (fotos, estado, precio…)
│   ├── consultas/          # Bandeja de formularios de la web
│   ├── clientes/           # Fichas de clientes y su historial
│   ├── resenas/  preguntas/  cuenta/
├── actions.ts              # Acciones del servidor (todas empiezan con requireAdmin())
└── api/upload/             # Subida de fotos
lib/admin/                  # Lógica: coches, clientes, contenido, estadísticas, historial
lib/auth/                   # Contraseñas y sesión
lib/db/                     # Conexión y tablas
```

---

## Rutas disponibles

| Ruta | Descripción |
|------|-------------|
| `/` | Home con landing completa |
| `/coches` | Listado de coches con filtros |
| `/coches/[slug]` | Ficha individual de coche |
| `/vender-coche` | Formulario de venta |
| `/sobre-nosotros` | Página informativa |
| `/contacto` | Formulario y datos de contacto |
