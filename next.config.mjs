/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdn.wallapop.com",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      // fotos que se suben desde el panel de administración (Vercel Blob)
      {
        protocol: "https",
        hostname: "**.public.blob.vercel-storage.com",
      },
    ],
  },
  // la dirección del Ibiza FR Plus que decía 2018 (el coche es de 2020) sigue funcionando y lleva a la buena
  async redirects() {
    return [
      {
        source: "/coches/seat-ibiza-fr-plus-2018",
        destination: "/coches/seat-ibiza-fr-plus-2020",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
