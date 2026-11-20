import { NextResponse, type NextRequest } from "next/server";

/**
 * Reparte el tráfico entre la web pública y el panel de administración.
 *
 *  - admin.covegarage.com (y admin.localhost en local): todo lo que se pida se sirve desde app/admin/*
 *    (las direcciones del navegador no llevan "/admin": /coches, /clientes, /login…).
 *  - Cualquier otro dominio (www.covegarage.com, *.vercel.app…): el panel no existe, /admin devuelve 404.
 *
 * Solo se ejecuta para el dominio del panel y para /admin/*; el resto de la web pública no pasa por aquí.
 * Aquí NO se comprueba la sesión: eso lo hace cada página y cada acción del panel (lib/auth/session.ts).
 */

function isAdminHost(host: string | null): boolean {
  const h = (host ?? "").toLowerCase().split(":")[0];
  return h === "admin.covegarage.com" || h === "admin.localhost";
}

function withPanelHeaders(res: NextResponse): NextResponse {
  res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  res.headers.set("Cache-Control", "no-store");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Content-Security-Policy", "frame-ancestors 'none'");
  res.headers.set("Referrer-Policy", "same-origin");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return res;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdminHost(req.headers.get("host"))) {
    // Archivos de /public (logo, fotos de los coches…): se sirven tal cual, también en el dominio del panel.
    if (/\.[a-z0-9]{2,5}$/i.test(pathname) && pathname !== "/robots.txt") return NextResponse.next();

    const url = req.nextUrl.clone();
    if (isAdminPath) {
      // /admin/... no se sirve tal cual en el dominio del panel: se limpia la dirección.
      url.pathname = pathname.replace(/^\/admin/, "") || "/";
      return withPanelHeaders(NextResponse.redirect(url));
    }
    url.pathname = `/admin${pathname === "/" ? "" : pathname}`;
    return withPanelHeaders(NextResponse.rewrite(url));
  }

  if (isAdminPath) {
    // En la web pública el panel no existe: se muestra la página "no encontrada" de siempre.
    const url = req.nextUrl.clone();
    url.pathname = "/__no-existe__";
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Todo lo que se pida en el dominio del panel (menos los archivos estáticos de Next y los iconos de la web).
    {
      source: "/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png).*)",
      has: [{ type: "host", value: "(admin\\.covegarage\\.com|admin\\.localhost)" }],
    },
    // En cualquier dominio, /admin/* (para esconderlo fuera del dominio del panel).
    "/admin/:path*",
  ],
};
