// app/login/page.tsx
'use client';
import 'regenerator-runtime/runtime';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { InputText } from "primereact/inputtext";
import { Button } from 'primereact/button';
import { useMessage } from '@/layout/context/messagecontext';
import { notion, useNotion } from '@/demo/service/NotionService';

const LoginPage = () => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { showMessage } = useMessage();
  const { user, loadingUser } = useNotion();

  useEffect(() => {
    if (loadingUser || user) {
      router.push('/home'); // Redirige a la página de inicio si está autenticado
    }
  })
  
  // Función de login para manejar el inicio de sesión en el envío del formulario
  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const auth = await notion
        .login({ email, password })
          showMessage({
            severity: 'success',
            summary: 'Inicio de sesión exitoso',
            detail: 'Redirigiendo...',
            life: 2000
          });
        router.push('/home');
        setIsLoggingIn(false)
    } catch (error) {
      showMessage({
        severity: 'error',
        summary: 'Error al iniciar sesion',
        detail: 'Redirigiendo...',
        life: 2000
      });
    }

  };
  

  return (
    <div className='flex h-screen w-screen justify-content-center align-items-center'>
      <div className="card flex flex-column gap-4 w-8 h-8 justify-content-center align-items-center">
        <h2>Iniciar Sesión</h2>
        <form onSubmit={login} className='flex flex-column gap-2'>
          <div className="flex flex-column gap-2">
            <label htmlFor="username">Username</label>
            <InputText
              id="username"
              aria-describedby="username-help"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-column gap-2">
            <label htmlFor="password">Password</label>
            <InputText
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex flex-column gap-2">
            <Button type="submit" label="Iniciar sesión" disabled={isLoggingIn} loading={isLoggingIn}/>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
