// /** @type {import('next').NextConfig} */
// //Este archivo permite a Next.js ajustar su configuración global para cumplir 
// //con los requisitos específicos de tu proyecto.
// const nextConfig = {}

// module.exports = nextConfig


/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    css: {
      lightningcss: false, // 🔧 desactiva Lightning CSS para evitar errores con light-dark()
    },
  },
  turbopack: {
    root: __dirname,
  },
};

module.exports = nextConfig;
