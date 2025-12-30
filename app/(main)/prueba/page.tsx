"use client";

import { useNotion } from "@/demo/service/NotionService";
import styles from "./index.module.scss";
import { useWebSocket } from "@/demo/service/WebSocketService";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useState } from "react";
import { useMessage } from "@/layout/context/messagecontext";
import { Checkbox } from "primereact/checkbox";

const BackgroundLayout = ({
  styles,
  children,
}: {
  styles: any;
  children: React.ReactNode;
}) => (
  <div className={styles.page}>
    <div className={styles.background} aria-hidden="true">
      <WavesBackground styles={styles} />
      {/* <video autoPlay loop muted playsInline className={styles.bgVideo}>
        <source src="/layout/videos/cerebroT.mov" type="video/mp4" />
      </video> */}
    </div>
    <div className={styles.content}>{children}</div>
  </div>
);

const VisualPanel2 = ({
  styles,
  title,
  description,
  buttonLabel,
  onButtonClick,
}: {
  styles: any;
  title: string;
  description: string;
  buttonLabel: string;
  onButtonClick: () => void;
}) => (
  <section className={styles.visualPanel}>
    <div className="flex justify-content-center mb-2">
      <label className=" block text-6xl font-bold text-center text-white">
        {title}
      </label>
    </div>

    <p className="mb-4 text-center text-primary text-white	">{description}</p>

    <div className="flex justify-content-center">
      <Button
        label={buttonLabel}
        className="p-button-secondary p-button-rounded"
        icon="pi pi-arrow-right"
        iconPos="right"
        onClick={onButtonClick}
      />
    </div>
  </section>
);

const WavesBackground = ({ styles }: { styles: any }) => (
  // <div className={styles.waveContainer} aria-hidden="true">
  //   <svg
  //     className={`${styles.wave} ${styles.wave1}`}
  //     viewBox="0 0 1440 320"
  //     preserveAspectRatio="none"
  //   >
  //     <path
  //       fill="#033351"
  //       fillOpacity="1"
  //       d="M0,256L80,266.7C160,277,320,299,480,282.7C640,267,800,213,960,197.3C1120,181,1280,203,1360,213.3L1440,224V320H0Z"
  //     >
  //       <animate
  //         attributeName="d"
  //         dur="10s"
  //         repeatCount="indefinite"
  //         values="
  //         M0,256L80,266.7C160,277,320,299,480,282.7C640,267,800,213,960,197.3C1120,181,1280,203,1360,213.3L1440,224V320H0Z;
  //         M0,240L80,226.7C160,213,320,197,480,202.7C640,208,800,245,960,256C1120,267,1280,245,1360,229.3L1440,213V320H0Z;
  //         M0,256L80,266.7C160,277,320,299,480,282.7C640,267,800,213,960,197.3C1120,181,1280,203,1360,213.3L1440,224V320H0Z;
  //       "
  //       />
  //     </path>
  //   </svg>

  //   <svg
  //     className={`${styles.wave} ${styles.wave2}`}
  //     viewBox="0 0 1440 320"
  //     preserveAspectRatio="none"
  //   >
  //     <path
  //       fill="#004D8B"
  //       fillOpacity="1"
  //       d="M0,288L80,272C160,256,320,224,480,208C640,192,800,192,960,213.3C1120,235,1280,277,1360,293.3L1440,309V320H0Z"
  //     >
  //       <animate
  //         attributeName="d"
  //         dur="10s"
  //         repeatCount="indefinite"
  //         values="
  //         M0,256L80,266.7C160,277,320,299,480,282.7C640,267,800,213,960,197.3C1120,181,1280,203,1360,213.3L1440,224V320H0Z;
  //         M0,240L80,226.7C160,213,320,197,480,202.7C640,208,800,245,960,256C1120,267,1280,245,1360,229.3L1440,213V320H0Z;
  //         M0,256L80,266.7C160,277,320,299,480,282.7C640,267,800,213,960,197.3C1120,181,1280,203,1360,213.3L1440,224V320H0Z;
  //       "
  //       />
  //     </path>
  //   </svg>

  //   <svg
  //     className={`${styles.wave} ${styles.wave3}`}
  //     viewBox="0 0 1440 320"
  //     preserveAspectRatio="none"
  //   >
  //     <path
  //       fill="#043858"
  //       fillOpacity="1"
  //       d="M0,288L80,272C160,256,320,224,480,224C640,224,800,256,960,261.3C1120,267,1280,245,1360,234.7L1440,224V320H0Z"
  //     >
  //       <animate
  //         attributeName="d"
  //         dur="10s"
  //         repeatCount="indefinite"
  //         values="
  //         M0,256L80,266.7C160,277,320,299,480,282.7C640,267,800,213,960,197.3C1120,181,1280,203,1360,213.3L1440,224V320H0Z;
  //         M0,240L80,226.7C160,213,320,197,480,202.7C640,208,800,245,960,256C1120,267,1280,245,1360,229.3L1440,213V320H0Z;
  //         M0,256L80,266.7C160,277,320,299,480,282.7C640,267,800,213,960,197.3C1120,181,1280,203,1360,213.3L1440,224V320H0Z;
  //       "
  //       />
  //     </path>
  //   </svg>
  // </div>
  <div></div>
);

const VisualPanel = ({
  styles,
  side = "right",
  title,
  description,
  buttonLabel,
  onButtonClick,
}: {
  styles: any;
  side?: "left" | "right";
  title: string;
  description: string;
  buttonLabel: string;
  onButtonClick: () => void;
}) => {
  const panelClass = side === "left" ? styles.loginLeft : styles.loginRight;

  return (
    <div
      className={`${panelClass} col-12 md:col-6 p-6 text-center flex align-items-center justify-content-center`}
    >
      <WavesBackground styles={styles} />

      <div className={styles.loginRightContent}>
        <div className="flex justify-content-center mb-2">
          <label className="text-blue-50 block text-6xl font-bold text-center">
            {title}
          </label>
        </div>

        <p className="mb-4 text-center">{description}</p>

        <div className="flex justify-content-center">
          <Button
            label={buttonLabel}
            className="p-button-secondary p-button-rounded"
            icon="pi pi-arrow-right"
            iconPos="right"
            onClick={onButtonClick}
          />
        </div>
      </div>
    </div>
  );
};

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
  <div className="col-12 md:col-6 p-6 text-center md:text-left flex align-items-center bg-white border-round-xs shadow-2">
    <section className="w-full flex flex-column align-items-center">
      <label className="block text-4xl font-bold text-center">
        Configurar WebSocket
      </label>

      <div className="p-fluid" style={{ width: "300px" }}>
        <div className="field">
          <label htmlFor="webSocketUrl">Dirección WebSocket</label>
          <InputText
            id="webSocketUrl"
            value={webSocketUrl}
            onChange={(e) => setWebSocketUrl(e.target.value)}
            placeholder="ws://localhost:3000"
          />
        </div>

        <div className="flex gap-2 mt-3">
          <Button
            label="Probar conexión"
            className="p-button-secondary p-button-outlined"
            onClick={onTest}
            disabled={webSocketUrl.trim() === ""}
          />
          <Button
            label="Conectar"
            className="p-button-primary"
            onClick={onConnect}
            disabled={!isConnected}
          />
        </div>

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
  <div className="col-12 md:col-6 p-6 flex align-items-center justify-content-center bg-white border-round-xs shadow-2">
    <section className="w-full flex flex-column align-items-center">
      <div>
        <div
          className="w-full surface-card py-8 px-5 sm:px-8 shadow-2 border-round"
          style={{ borderRadius: "53px" }}
        >
          <div className="text-center mb-5">
            <div className="text-900 text-3xl font-bold mb-3">LOGIN</div>
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

            <div className="flex align-items-center justify-content-between mb-6">
              <div className="flex align-items-center">
                <Checkbox
                  id="rememberme"
                  onChange={(e) => setChecked(e.checked ?? false)}
                  checked={checked}
                  className="mr-2"
                />
                <label htmlFor="rememberme">Remember me</label>
              </div>
              <a className="font-medium no-underline ml-2 text-blue-500 text-right cursor-pointer">
                Forgot your password?
              </a>
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
  const [webSocketUrl, setWebSocketUrl] = useState("");
  const [mode, setMode] = useState<"websocket" | "neurosity">("websocket");

  const { connect, isConnected, error } = useWebSocket();
  const { notion, user, loadingUser } = useNotion();

  const { showMessage } = useMessage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [checked, setChecked] = useState(false);

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

  const c = copy[mode];

  const left =
    mode === "websocket" ? (
      <VisualPanel
        styles={styles}
        side="left"
        title={c.title}
        description={c.description}
        buttonLabel={c.buttonLabel}
        onButtonClick={() => setMode(c.next)}
      />
    ) : (
      // TODO: aquí irá tu login de Neurosity

      <NeurosityLoginForm
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        onLogin={login}
        checked={checked}
        setChecked={setChecked}
      />
    );

  const right =
    mode === "websocket" ? (
      <WebSocketForm
        webSocketUrl={webSocketUrl}
        setWebSocketUrl={setWebSocketUrl}
        isConnected={!!isConnected}
        error={error}
        onTest={handleTestConnection}
        onConnect={handleConnect}
      />
    ) : (
      <VisualPanel
        styles={styles}
        side="right"
        title={c.title}
        description={c.description}
        buttonLabel={c.buttonLabel}
        onButtonClick={() => setMode(c.next)}
      />
    );

  return (
    // <div style={{ height: "100vh" }}>
    //   <div className="grid grid-nogutter text-800 w-full h-full">
    //     {left}
    //     {right}
    //   </div>
    // </div>
    <BackgroundLayout styles={styles}>
      <div className="grid grid-nogutter w-full h-full">
        {mode === "websocket" ? (
          <>
            <div className="col-12 md:col-6 p-6 flex align-items-center justify-content-center">
              <VisualPanel2
                styles={styles}
                title={copy.websocket.title}
                description={copy.websocket.description}
                buttonLabel={copy.websocket.buttonLabel}
                onButtonClick={() => setMode(copy.websocket.next)}
              />
            </div>

            <WebSocketForm
              webSocketUrl={webSocketUrl}
              setWebSocketUrl={setWebSocketUrl}
              isConnected={!!isConnected}
              error={error}
              onTest={handleTestConnection}
              onConnect={handleConnect}
            />
          </>
        ) : (
          <>
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
              <VisualPanel2
                styles={styles}
                title={copy.neurosity.title}
                description={copy.neurosity.description}
                buttonLabel={copy.neurosity.buttonLabel}
                onButtonClick={() => setMode(copy.neurosity.next)}
              />
            </div>
          </>
        )}
      </div>
    </BackgroundLayout>
  );
};

export default WebSocketConfig;
