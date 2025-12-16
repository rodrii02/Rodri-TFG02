// /** @type {import('next').NextConfig} */
// //Este archivo permite a Next.js ajustar su configuración global para cumplir 
// //con los requisitos específicos de tu proyecto.
// const nextConfig = {}

// module.exports = nextConfig


/** @type {import('next').NextConfig} */
const nextConfig = {
    turbopack: {
      root: __dirname,  // 👈 fuerza a Next a usar ESTA carpeta como root
    },
  };
  
  module.exports = nextConfig;
  