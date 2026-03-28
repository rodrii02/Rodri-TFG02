"use client";

import styles from "./index.module.scss";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useState } from "react";
import { useMessage } from "@/layout/context/messagecontext";
import { Checkbox } from "primereact/checkbox";
import Link from "next/dist/client/link";
import "regenerator-runtime/runtime";
import { useUnifiedConnection } from "@/service/UnifiedConnectionService";

const BackgroundLayout = ({
  styles,
  children,
}: {
  styles: any;
  children: React.ReactNode;
}) => (
  <div className={styles.page}>
    <div className={styles.background} aria-hidden="true">
      <video autoPlay muted loop playsInline className={styles.bgVideo}>
        <source src="/layout/videos/fondoCerebro.mov" type="video/mp4" />
        Tu navegador no soporta el tag de video.
      </video>
    </div>
    <div className={styles.content}>{children}</div>
  </div>
);

const VisualPanel = ({
  styles,
  title,
  description,
  buttonLabel,
  buttonIcon,
  positionbuttonIcon,
  onButtonClick,
}: {
  styles: any;
  title: string;
  description: string;
  buttonLabel: string;
  buttonIcon: string;
  positionbuttonIcon: "left" | "right";
  onButtonClick: () => void;
}) => (
  <section className={styles.visualPanel}>
    <div className="flex justify-content-center mb-2">
      <label className="block text-3xl md:text-6xl font-bold text-center text-white">
        {title}
      </label>
    </div>

    <p className="mb-1 md:mb-4 text-center text-200">{description}</p>

    <div className="flex justify-content-center">
      <Button
        label={buttonLabel}
        className="p-button-secondary p-button-rounded"
        icon={buttonIcon}
        iconPos={positionbuttonIcon}
        onClick={onButtonClick}
      />
    </div>
  </section>
);

const WebSocketForm = ({
  webSocketUrl,
  setWebSocketUrl,
  isConnected,
  error,
  onTest,
  onConnect,
}: {
  webSocketUrl: string;
  setWebSocketUrl: (v: string) => void;
  isConnected: boolean;
  error: string | null;
  onTest: () => void;
  onConnect: () => void;
}) => (
  <div className="col-12 p-3 md:col-6 md:p-6 flex align-items-center justify-content-center bg-white border-round-xs">
    <section className="w-full flex flex-column align-items-center">
      <div className="w-12 lg:w-9">
        <div className="w-full surface-card py-3 px-3 md:px-5 md:py-8 shadow-7 border-round-md">
          <div className="text-center mb-2 md:mb-5">
            <div className="text-black-alpha-90 text-3xl font-bold mb-3">
              Configurar WebSocket
            </div>
          </div>

          <div>
            <label
              htmlFor="email1"
              className="block text-900 text-xl font-bold mb-2"
            >
              Dirección WebSocket
            </label>
            <InputText
              id="webSocketUrl"
              value={webSocketUrl}
              className="w-full"
              onChange={(e) => setWebSocketUrl(e.target.value)}
              placeholder="ws://localhost:3000"
            />
          </div>
          <div className="flex gap-2 mt-3">
            <Button
              label="Probar Conexión"
              className="p-button-secondary p-button-outlined w-full"
              onClick={onTest}
              disabled={webSocketUrl.trim() === ""}
            />
            <Button
              label="Conectar Sesión"
              className="p-button-primary w-full"
              onClick={onConnect}
              disabled={!isConnected}
            />
          </div>

          {error === "none" && (
            <div className="mt-2 gap-1 flex align-items-center justify-content-left">
              <i
                className="pi pi-check"
                style={{ fontSize: "1.5rem", color: "var(--green-500)" }}
              ></i>
              <p className="text-green-500">Conexión exitosa</p>
            </div>
          )}

          {error && error !== "none" && (
            <div className="mt-2 gap-1 flex align-items-center justify-content-left">
              <i
                className="pi pi-times"
                style={{ fontSize: "1.5rem", color: "var(--red-500)" }}
              ></i>
              <p className="text-red-500"> {error}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  </div>
);

const NeurosityLoginForm = ({
  email,
  setEmail,
  password,
  setPassword,
  onLogin,
  checked,
  setChecked,
  isLoading,
  error,
}: {
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  onLogin: () => void;
  checked: boolean;
  setChecked: (v: boolean) => void;
  isLoading?: boolean;
  error?: string | null;
}) => (
  <div className="col-12 p-3 md:col-6 md:p-6 flex align-items-center justify-content-center bg-white border-round-xs flex-order-1 md:flex-order-0">
    <section className="w-full flex flex-column align-items-center">
      <div className="w-12 lg:w-9">
        <div className="w-full surface-card py-3 px-3 md:px-5 md:py-8 shadow-7 border-round-md">
          <div className="text-center mb-2 md:mb-5">
            <div className="text-black-alpha-90 text-3xl font-bold mb-3">
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
              className="w-full mb-2 md:mb-5"
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
              className="w-full mb-2 md:mb-5"
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="flex align-items-center justify-content-between mb-4 md:mb-6">
              <div className="flex align-items-center">
                <Checkbox
                  id="rememberme"
                  onChange={(e) => setChecked(e.checked ?? false)}
                  checked={checked}
                  className="mr-2"
                />
                <label
                  htmlFor="rememberme"
                  className="text-sm font-normal md:text-base md:font-medium"
                >
                  Remember me
                </label>
              </div>
              <Link
                href="https://console.neurosity.co/forgot-password"
                passHref
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-normal md:text-base md:font-medium no-underline ml-2 text-blue-500 text-right cursor-pointer"
              >
                Forgot your password?
              </Link>
            </div>
            <Button
              label="Sign In"
              className="w-full p-3 text-xl"
              onClick={onLogin}
              icon="pi pi-user"
            ></Button>
          </div>
        </div>
      </div>
    </section>
  </div>
);

const copy = {
  websocket: {
    title: "Conexión mediante WebSocket!",
    description:
      "Si desea conectarse mediante un dispositivo Neurosity, utilice esta opción.",
    buttonLabel: "Conectar con Neurosity",
    next: "neurosity" as const,
  },
  neurosity: {
    title: "Conexión mediante Neurosity!",
    description:
      "Si desea conectarse mediante un dispositivo WebSocket, utilice esta opción.",
    buttonLabel: "Conectar con WebSocket",
    next: "websocket" as const,
  },
};

const WebSocketConfig = () => {
  const router = useRouter();
  const { showMessage } = useMessage();

  //Estado para websocket
  const [webSocketUrl, setWebSocketUrl] = useState("");

  //Estado para crown
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [checked, setChecked] = useState(false);

  //   const { connectWebSocket, notion, isConnected, error, logoutNotion } = useConnection();

  const [mode, setMode] = useState<"crown" | "websocket">("websocket");

  const {
    info,
    error,
    connectWebSocket,
    loginCrown,
    logoutCrown,
  } = useUnifiedConnection();

  const handleTestConnection = () => {
    if (
      !webSocketUrl.startsWith("ws://") &&
      !webSocketUrl.startsWith("wss://")
    ) {
      alert("La URL debe comenzar con ws:// o wss://");
      return;
    }

    connectWebSocket(webSocketUrl);
  };

  const handleConnect = () => {
    if (info.stateContext === "online") {
      router.push("/home");
    }
  };

  const login = async (e?: React.MouseEvent | React.FormEvent) => {
    e?.preventDefault();

    try {
      await loginCrown(email, password);

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
    <BackgroundLayout styles={styles}>
      <div
        className={`grid grid-nogutter w-full h-full ${styles.formItem} ${
          mode === "websocket" ? styles.visible : styles.hidden
        }`}
      >
        <div className="col-12 md:col-6 p-6 flex align-items-center justify-content-center">
          <VisualPanel
            styles={styles}
            title={copy.websocket.title}
            description={copy.websocket.description}
            buttonLabel={copy.websocket.buttonLabel}
            buttonIcon="pi pi-arrow-left"
            positionbuttonIcon="left"
            onButtonClick={() => setMode("crown")}
          />

          {/* <Button
            label="Conectar Sesión"
            className="p-button-primary w-full"
            onClick={logoutCrown}
          ></Button> */}
        </div>

        <WebSocketForm
          webSocketUrl={webSocketUrl}
          setWebSocketUrl={setWebSocketUrl}
          isConnected={!!info && info.stateContext === "online"}
          error={error}
          onTest={handleTestConnection}
          onConnect={handleConnect}
        />
      </div>

      <div
        className={`grid grid-nogutter w-full h-full ${styles.formItem} ${
          mode === "crown" ? styles.visible : styles.hidden
        }`}
      >
        <NeurosityLoginForm
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          onLogin={login}
          checked={checked}
          setChecked={setChecked}
        />

        <div className="col-12 md:col-6 p-6 flex align-items-center justify-content-center">
          <VisualPanel
            styles={styles}
            title={copy.neurosity.title}
            description={copy.neurosity.description}
            buttonLabel={copy.neurosity.buttonLabel}
            buttonIcon="pi pi-arrow-right"
            positionbuttonIcon="right"
            onButtonClick={() => setMode("websocket")}
          />
        </div>
      </div>
    </BackgroundLayout>
  );
};

export default WebSocketConfig;
