// app/login/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { InputText } from "primereact/inputtext";
import { Button } from 'primereact/button';
import { useMessage } from '@/layout/context/messagecontext';
import { Neurosity } from "@neurosity/sdk";

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { showMessage } = useMessage();

  // Asegúrate de inicializar neurosity con deviceId
  const neurosity = new Neurosity({});


  const main = async () => {
    await neurosity
      .login({
        email,
        password
      })
      .catch((error) => {
        console.log(error);
        throw new Error(error);
      });
    console.log("Logged in");
  };  
  // Función para manejar el login
  const login = async () => {
    try {
      console.log("Iniciando sesión con", email, password);
      await neurosity.login({ email, password });
      
      // Si no lanza error, mostramos mensaje de éxito y redirigimos
      showMessage({
        severity: 'success',
        summary: 'Login Exitoso',
        detail: 'Inicio de sesión completado.',
        life: 2000
      });
      localStorage.setItem('isAuthenticated', 'true');
      router.push('/home');
    } catch (error) {
      // Si la autenticación falla
      console.error("Error en la autenticación:", error);
      showMessage({
        severity: 'error',
        summary: 'Error de Autenticación',
        detail: 'Por favor, verifica tus credenciales.',
        life: 4000
      });
    }
  };

  // Manejador del formulario
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login();
  };

  return (
    <div className='flex h-screen w-screen justify-content-center align-items-center'>
      <div className="card flex flex-column gap-4 w-8 h-8 justify-content-center align-items-center">
        <h2>Iniciar Sesión</h2>
        <form className='flex flex-column gap-2'>
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
            <Button type="submit" label="Iniciar sesión" onClick={main}/>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
