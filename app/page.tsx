'use client';

import React from 'react';
import { Button } from 'primereact/button';
import { useRouter } from 'next/navigation'; // ✅ CORRECTO para App Router

const ModeSelection = () => {
  const router = useRouter();

  const handleNeurosity = () => {
    router.push('/login'); // o '/crown' si tienes esa ruta
  };

  const handleWebSocket = () => {
    router.push('/websocket'); // Asegúrate que exista
  };

  const handlePrueba = () => { 
    router.push('/prueba'); // Asegúrate que exista
  }

  return (
    <div
      className="flex flex-column align-items-center justify-content-center"
      style={{ height: '100vh' }}
    >
      <h1>Selecciona el modo de EEG</h1>
      <div className="flex gap-3">
        <Button label="Neurosity" className="p-button-primary" onClick={handleNeurosity} />
        <Button label="WebSocket" className="p-button-secondary" onClick={handleWebSocket} />
        <Button label="Prueba" className="p-button-secondary" onClick={handlePrueba} />

      </div>
    </div>
  );
};

export default ModeSelection;
