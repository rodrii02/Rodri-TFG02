'use client'
import React, { useEffect, useState } from "react";

const EEGDisplay = () => {

    const [data, setData] = useState<any>(null);

    useEffect(() => {
        const ws = new WebSocket("ws://localhost:8000/ws");

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log("📡 Datos recibidos:", message);
            setData(message);
        };

        ws.onclose = () => {
            console.log("🔴 WebSocket desconectado");
        };

        return () => ws.close();
    }, []);

    return (
        <div className="card">
            <h2>EEG Stream en Tiempo Real</h2>
            {data ? (
                <div>
                    <p><strong>Marker:</strong> {data.marker}</p>
                    <p><strong>Timestamp:</strong> {data.timestamp.toFixed(3)}</p>
                </div>
            ) : (
                <p>Esperando datos...</p>
            )}
        </div>
    );
};

export default EEGDisplay;
