'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const { Neurosity } = require('@neurosity/sdk');

const DashboardPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Verificar si el usuario está autenticado en localStorage
    const authStatus = localStorage.getItem('isAuthenticated');

    if (authStatus === 'true') {
      setIsAuthenticated(true);
      router.push('/home'); // Redirige a la página de inicio si está autenticado
    } else {
      setIsAuthenticated(false);
      router.push('/login'); // Redirige a la página de login si no está autenticado
    }
  }, []);

  return null; // No se muestra contenido mientras se redirige
};

export default DashboardPage;
