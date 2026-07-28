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

Edita el archivo: `lib/data/mockCars.ts`

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

## Fase futura: Conexión a Supabase

Cuando se quiera conectar Supabase, solo hay que:

1. **Instalar el cliente**:
```bash
npm install @supabase/supabase-js
```

2. **Crear variables de entorno** (`.env.local`):
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

3. **Reemplazar la implementación** en `lib/services/cars.ts`:

```typescript
// Antes (mock):
export async function getCars(): Promise<Car[]> {
  return mockCars;
}

// Después (Supabase):
export async function getCars(): Promise<Car[]> {
  const { data } = await supabase.from('cars').select('*');
  return data ?? [];
}
```

Los componentes no necesitan ningún cambio. La arquitectura está diseñada para este cambio.

---

## Panel de administración (fase futura)

Estructura prevista para la siguiente fase:

```
app/
└── admin/
    ├── layout.tsx          # Auth guard
    ├── page.tsx            # Dashboard
    ├── coches/             # Gestión de coches
    ├── leads/              # Gestión de leads
    ├── contenido/          # Edición de textos
    └── configuracion/      # Datos de contacto
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
