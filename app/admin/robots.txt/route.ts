// robots.txt del dominio del panel: que ningún buscador lo indexe.
export function GET() {
  return new Response("User-agent: *\nDisallow: /\n", { headers: { "content-type": "text/plain; charset=utf-8" } });
}
