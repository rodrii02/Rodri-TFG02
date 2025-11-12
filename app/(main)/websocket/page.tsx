'use client';

import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import React, { useState } from 'react';

const WebSocketConfig = () => {
    const [webSocketUrl, setWebSocketUrl] = useState('');
  const router = useRouter();

    const handleConnect = () => {
        // Aquí puedes implementar la lógica para conectar al WebSocket
        console.log('Connecting to WebSocket:', webSocketUrl);
        router.push('/home'); // Redirige a la aplicación principal
    };

    return (
        <div className="flex flex-column align-items-center justify-content-center" style={{ height: '100vh' }}>
            <h1>Configurar WebSocket</h1>
            <div className="p-fluid">
                <div className="field">
                    <label htmlFor="webSocketUrl">Dirección del WebSocket</label>
                    <InputText id="webSocketUrl" value={webSocketUrl} onChange={(e) => setWebSocketUrl(e.target.value)} />
                </div>
                <Button label="Conectar" className="p-button-primary mt-3" onClick={handleConnect} />
            </div>
        </div>
    );
};

export default WebSocketConfig;