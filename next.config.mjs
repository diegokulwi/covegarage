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
    ],
  },
  // la dirección antigua del Ibiza FR Plus (decía 2020, el coche es de 2018) sigue funcionando y lleva a la nueva
  async redirects() {
    return [
      {
        source: "/coches/seat-ibiza-fr-plus-2020",
        destination: "/coches/seat-ibiza-fr-plus-2018",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
