// app/login/page.tsx
"use client";
import "regenerator-runtime/runtime";

import styles from "./index.module.scss";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { useMessage } from "@/layout/context/messagecontext";
import { useNotion } from "@/demo/service/NotionService";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { showMessage } = useMessage();
  const { notion, user, loadingUser } = useNotion();

  useEffect(() => {
    if (loadingUser || user) {
      router.push("/home"); // Redirige a la página de inicio si está autenticado
    }
  });

  const login = async (e?: React.MouseEvent | React.FormEvent) => {
    e?.preventDefault();

    if (!notion) {
      showMessage({
        severity: "warn",
        summary: "Inicializando conexión",
        detail: "Espera un momento y vuelve a intentar.",
        life: 2000,
      });
      return;
    }

    try {
      await notion.login({ email, password });

      showMessage({
        severity: "success",
        summary: "Inicio de sesión exitoso",
        detail: "Redirigiendo...",
        life: 2000,
      });

      router.push("/home");
    } catch (error) {
      console.error("Error during login:", error);
      showMessage({
        severity: "error",
        summary: "Error al iniciar sesión",
        detail: "Revisa tus credenciales.",
        life: 2000,
      });
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
              <h1 className="text-blue-50 block text-6xl font-bold text-center">
                Conexión mediante Neurosity!
              </h1>
            </div>

            <p className="mb-4 text-center">
              Si desea conectarse mediante un dispositivo websocket, utilice
              esta opción.
            </p>

            <div className="flex justify-content-center">
              <Button
                label="Conectar con Websocket"
                className="p-button-secondary p-button-rounded"
                icon="pi pi-arrow-right"
                iconPos="right"
              />
            </div>
          </div>
        </div>

        <div className="col-12 md:col-6 p-6 text-center md:text-left flex align-items-center ">
          <div className="flex h-screen w-screen justify-content-center align-items-center">
            <div className="flex flex-column align-items-center justify-content-center">
              <div
                style={{
                  borderRadius: "56px",
                  padding: "0.3rem",
                  background:
                    "linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)",
                }}
              >
                <div
                  className="w-full surface-card py-8 px-5 sm:px-8"
                  style={{ borderRadius: "53px" }}
                >
                  <div className="text-center mb-5">
                    <div className="text-900 text-3xl font-bold mb-3">
                      LOGIN
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="email1"
                      className="block text-900 text-xl font-bold mb-2"
                    >
                      Email
                    </label>
                    <InputText
                      id="email1"
                      type="text"
                      placeholder="Email"
                      className="w-full mb-5"
                      style={{ padding: "1rem" }}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />

                    <label
                      htmlFor="password1"
                      className="block text-900 font-bold text-xl mb-2"
                    >
                      Password
                    </label>
                    <InputText
                      placeholder="Password"
                      className="w-full mb-5"
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                      label="Sign In"
                      className="w-full p-3 text-xl"
                      onClick={login}
                    ></Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
