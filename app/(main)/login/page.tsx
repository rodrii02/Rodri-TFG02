// app/login/page.tsx
'use client';
import 'regenerator-runtime/runtime';

import React, { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { InputText } from "primereact/inputtext";
import { Button } from 'primereact/button';
import { useMessage } from '@/layout/context/messagecontext';
import { notion, useNotion } from '@/demo/service/NotionService';
import { classNames } from 'primereact/utils';
import { LayoutContext } from '@/layout/context/layoutcontext';
import { Password } from 'primereact/password';
import styles from './index.module.scss';

const LoginPage = () => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { showMessage } = useMessage();
  const { user, loadingUser } = useNotion();
  const { layoutConfig } = useContext(LayoutContext);

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
  

  // return (
  //   <div className='flex h-screen w-screen justify-content-center align-items-center'>
  //     <div className="card flex flex-column gap-4 w-8 h-8 justify-content-center align-items-center" style={{
  //                       background: 'linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)'
  //                   }}>
  //       <h2>Iniciar Sesión</h2>
  //       <form onSubmit={login} className='flex flex-column gap-2'>
  //         <div className="flex flex-column gap-2">
  //           <label htmlFor="username" className='font-bold'>Username</label>
  //           <InputText
  //             placeholder='Username'
  //             id="username"
  //             aria-describedby="username-help"
  //             value={email}
  //             onChange={(e) => setEmail(e.target.value)}
  //           />
  //         </div>
  //         <div className="flex flex-column gap-2">
  //           <label htmlFor="password" className='font-bold'>Password</label>
  //           <InputText
  //             placeholder='Password'
  //             type="password"
  //             id="password"
  //             value={password}
  //             onChange={(e) => setPassword(e.target.value)}
  //           />
  //         </div>
  //         <div className="flex flex-column gap-2">
  //           <Button type="submit" label="Iniciar sesión" disabled={isLoggingIn} loading={isLoggingIn}/>
  //         </div>
  //       </form>
  //     </div>
  //   </div>
  // );

    return (
        <div className='flex h-screen w-screen justify-content-center align-items-center'>
            <div className="flex flex-column align-items-center justify-content-center">
                <div
                    style={{
                        borderRadius: '56px',
                        padding: '0.3rem',
                        background: 'linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)'
                    }}
                >
                    <div className="w-full surface-card py-8 px-5 sm:px-8" style={{ borderRadius: '53px' }}>
                        <div className="text-center mb-5">
                            <div className="text-900 text-3xl font-bold mb-3">LOGIN</div>
                        </div>

                        <div>
                            <label htmlFor="email1" className="block text-900 text-xl font-bold mb-2">
                                Email
                            </label>
                            <InputText id="email1" type="text" placeholder="Email" className="w-full mb-5" style={{ padding: '1rem' }} 
                            value={email}onChange={(e) => setEmail(e.target.value)}
                            />

                            <label htmlFor="password1" className="block text-900 font-bold text-xl mb-2">
                                Password
                            </label>
                            <InputText
                            placeholder='Password'
                            className='w-full mb-5'
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />                            
                          <Button label="Sign In" className="w-full p-3 text-xl" onClick={login}></Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
