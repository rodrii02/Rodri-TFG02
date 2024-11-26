'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useNotion } from '@/demo/service/NotionService';

const DashboardPage = () => {
  const router = useRouter();
  const { user, loadingUser } = useNotion();

  useEffect(() => {
    if (!loadingUser && !user) {
      router.push('/login'); // Redirige a la página de inicio si está autenticado
    }
    if (loadingUser || user) {
      router.push('/home'); // Redirige a la página de inicio si está autenticado
    }
  }, [user, loadingUser]);

};

export default DashboardPage;
