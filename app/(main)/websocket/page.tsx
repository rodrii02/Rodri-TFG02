"use client";

import styles from "./index.module.scss";
import { useWebSocket } from "@/demo/service/WebSocketService";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useState } from "react";

// const images = [
//   { itemImageSrc: "/layout/images/login/eegElectrodos.jpg" },
//   { itemImageSrc: "/layout/images/login/eeg4.png" },
//   { itemImageSrc: "/layout/images/login/eeg.png" },
// ];

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
        <div
          className={`${styles.loginRight} col-12 md:col-6 p-6 text-center flex align-items-center justify-content-center`}
        >
          {/* WAVES DE FONDO */}
          <div className={styles.waveContainer}>
            {/* Wave 1 (más oscura, al fondo) #033351*/}
            <svg
              className={`${styles.wave} ${styles.wave1}`}
              viewBox="0 0 1440 320"
              preserveAspectRatio="none"
            >
              <path
                fill="#033351"
                fillOpacity="1"
                d="M0,256L80,266.7C160,277,320,299,480,282.7C640,267,800,213,960,197.3C1120,181,1280,203,1360,213.3L1440,224V320H0Z"
              >
                <animate
                  attributeName="d"
                  dur="10s"
                  repeatCount="indefinite"
                  values="
            M0,256L80,266.7C160,277,320,299,480,282.7C640,267,800,213,960,197.3C1120,181,1280,203,1360,213.3L1440,224V320H0Z;
            M0,240L80,226.7C160,213,320,197,480,202.7C640,208,800,245,960,256C1120,267,1280,245,1360,229.3L1440,213V320H0Z;
            M0,256L80,266.7C160,277,320,299,480,282.7C640,267,800,213,960,197.3C1120,181,1280,203,1360,213.3L1440,224V320H0Z;
          "
                />
              </path>
            </svg>

            {/* Wave 2 (color medio) 024976*/}

            <svg
              className={`${styles.wave} ${styles.wave2}`}
              viewBox="0 0 1440 320"
              preserveAspectRatio="none"
            >
              <path
                fill="#004D8B"
                fillOpacity="1"
                d="M0,288L80,272C160,256,320,224,480,208C640,192,800,192,960,213.3C1120,235,1280,277,1360,293.3L1440,309V320H0Z"
              >
                <animate
                  attributeName="d"
                  dur="10s"
                  repeatCount="indefinite"
                  values="
            M0,256L80,266.7C160,277,320,299,480,282.7C640,267,800,213,960,197.3C1120,181,1280,203,1360,213.3L1440,224V320H0Z;
            M0,240L80,226.7C160,213,320,197,480,202.7C640,208,800,245,960,256C1120,267,1280,245,1360,229.3L1440,213V320H0Z;
            M0,256L80,266.7C160,277,320,299,480,282.7C640,267,800,213,960,197.3C1120,181,1280,203,1360,213.3L1440,224V320H0Z;
          "
                />
              </path>
            </svg>

            {/* Wave 3 (la más clara, arriba del todo) */}
            <svg
              className={`${styles.wave} ${styles.wave3}`}
              viewBox="0 0 1440 320"
              preserveAspectRatio="none"
            >
              <path
                fill="#043858"
                fillOpacity="1"
                d="M0,288L80,272C160,256,320,224,480,224C640,224,800,256,960,261.3C1120,267,1280,245,1360,234.7L1440,224V320H0Z"
              >
                <animate
                  attributeName="d"
                  dur="10s"
                  repeatCount="indefinite"
                  values="
            M0,256L80,266.7C160,277,320,299,480,282.7C640,267,800,213,960,197.3C1120,181,1280,203,1360,213.3L1440,224V320H0Z;
            M0,240L80,226.7C160,213,320,197,480,202.7C640,208,800,245,960,256C1120,267,1280,245,1360,229.3L1440,213V320H0Z;
            M0,256L80,266.7C160,277,320,299,480,282.7C640,267,800,213,960,197.3C1120,181,1280,203,1360,213.3L1440,224V320H0Z;
          "
                />
              </path>
            </svg>
          </div>

          {/* CONTENIDO ENCIMA DE LAS WAVES */}
          <div className={styles.loginRightContent}>
            <div className="flex justify-content-center mb-2">
              <label className="text-blue-50 block text-6xl font-bold text-center">
                Conexión mediante WebSocket!
              </label>
            </div>

            <p className="mb-4 text-center">
              Si desea conectarse mediante un dispositivo Neurosity, utilice
              esta opción.
            </p>

            <div className="flex justify-content-center">
              <Button
                label="Conectar con Neurosity"
                className="p-button-secondary p-button-rounded"
                icon="pi pi-arrow-right"
                iconPos="right"
              />
            </div>
          </div>
        </div>

        <div className="col-12 md:col-6 p-6 text-center md:text-left flex align-items-center ">
          <section className="w-full flex flex-column align-items-center">
            <label className="block text-4xl font-bold text-center">
              Configurar WebSocket
            </label>
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
                  className="p-button-secondary p-button-outlined"
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
