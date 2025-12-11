"use client";

import { useWebSocket } from "@/demo/service/WebSocketService";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { Galleria } from "primereact/galleria";
import { InputText } from "primereact/inputtext";
import React, { useState, useEffect } from "react";

const images = [
  { itemImageSrc: "/layout/images/login/eegElectrodos.jpg" },
  { itemImageSrc: "/layout/images/login/eeg4.png" },
  { itemImageSrc: "/layout/images/login/eeg5.png" },

];

const WebSocketConfig = () => {
  const [webSocketUrl, setWebSocketUrl] = useState("");
  const router = useRouter();

  const { connect, isConnected, error } = useWebSocket();

  const handleTestConnection = () => {
    if (
      !webSocketUrl.startsWith("ws://") &&
      !webSocketUrl.startsWith("wss://")
    ) {
      alert("La URL debe comenzar con ws:// o wss://");
      return;
    }

    connect(webSocketUrl);
  };

  const handleConnect = () => {
    if (isConnected) {
      router.push("/home");
    }
  };

  return (
    <div style={{ height: "100vh" }}>
      <div className="grid grid-nogutter surface-0 text-800 w-full h-full">
        <div className="col-12 md:col-6 overflow-hidden">
          <Galleria
            value={images}
            numVisible={1}
            circular
            autoPlay
            transitionInterval={2500}
            showThumbnails={false}
            showItemNavigators={false}
            showIndicators // 👈 activa los puntos
            indicatorsPosition="bottom" // opcional (bottom por defecto)
            item={(item) => (
              <img
                src={item.itemImageSrc}
                alt="hero"
                style={{
                  width: "97%",
                  aspectRatio: "1/1",
                  objectFit: "cover",
                  clipPath: "polygon(0 0, 92% 0%, 100% 100%, 0 100%)",
                }}
              />
            )}
          />
        </div>
        <div className="col-12 md:col-6 p-6 text-center md:text-left flex align-items-center ">
          <section className="w-full flex flex-column align-items-center">
            <span className="block text-5xl font-bold mb-1">
              Configurar WebSocket
            </span>
            {/* <h1>Configurar WebSocket</h1> */}
            <div className="p-fluid" style={{ width: "300px" }}>
              <div className="field">
                <label htmlFor="webSocketUrl">Dirección WebSocket</label>
                <InputText
                  id="webSocketUrl"
                  value={webSocketUrl}
                  onChange={(e) => {
                    setWebSocketUrl(e.target.value);
                  }}
                  placeholder="ws://localhost:3000"
                />
              </div>

              <div className="flex gap-2 mt-3">
                <Button
                  label="Probar conexión"
                  className="p-button-secondary"
                  onClick={handleTestConnection}
                />
                <Button
                  label="Conectar"
                  className="p-button-primary"
                  onClick={handleConnect}
                  disabled={!isConnected}
                />
              </div>

              {/* Estado de prueba */}
              {error === "none" && (
                <p className="mt-3 text-green-500">✅ Conexión exitosa</p>
              )}
              {error !== "none" && error !== null && (
                <p className="mt-3 text-red-500">❌ Error al conectar</p>
              )}
              {error !== "none" && error !== null && (
                <p className="mt-2 text-red-500">{error}</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default WebSocketConfig;
