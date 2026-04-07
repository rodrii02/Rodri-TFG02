"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { useMessage } from "@/layout/context/messagecontext";
import {
  useUnifiedConnection,
  type WebSocketConnectionCheck,
} from "./UnifiedConnectionService";

type WebSocketDialogContextValue = {
  visible: boolean;
  showWebSocketDialog: () => void;
};

const WebSocketDialogContext =
  createContext<WebSocketDialogContextValue | null>(null);

export const WebSocketConnectionFeedback = ({
  result,
  currentUrl,
}: {
  result: WebSocketConnectionCheck | null;
  currentUrl: string;
}) => {
  if (!result || result.url !== currentUrl.trim()) return null;

  if (result.canConnect) {
    return (
      <div className="mt-2 gap-1 flex align-items-center justify-content-left">
        <i
          className="pi pi-check"
          style={{ fontSize: "1.5rem", color: "var(--green-500)" }}
        ></i>
        <p className="text-green-500">Conexión exitosa</p>
      </div>
    );
  }

  return (
    <div className="mt-2 gap-1 flex align-items-center justify-content-left">
      <i
        className="pi pi-times"
        style={{ fontSize: "1.5rem", color: "var(--red-500)" }}
      ></i>
      <p className="text-red-500"> {result.message}</p>
    </div>
  );
};

export const WebSocketDialogProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { info, connectWebSocket, testWebSocketConnection } =
    useUnifiedConnection();
  const { showMessage } = useMessage();
  const [visible, setVisible] = useState(false);
  const [draftUrl, setDraftUrl] = useState(info.selectedDeviceContext || "");
  const [submitting, setSubmitting] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connectionCheck, setConnectionCheck] =
    useState<WebSocketConnectionCheck | null>(null);

  const updateDraftUrl = (nextUrl: string) => {
    setDraftUrl(nextUrl);
    setConnectionCheck(null);
  };

  const showWebSocketDialog = useCallback(() => {
    setDraftUrl(info.selectedDeviceContext || "");
    setConnectionCheck(null);
    setVisible(true);
  }, [info.selectedDeviceContext]);

  const validateUrl = () => {
    const nextUrl = draftUrl.trim();

    if (!nextUrl.startsWith("ws://") && !nextUrl.startsWith("wss://")) {
      showMessage({
        severity: "warn",
        summary: "URL WebSocket no válida",
        detail: "La URL debe comenzar con ws:// o wss://",
        life: 2500,
      });
      return null;
    }
    return nextUrl;
  };

  const testConnection = async () => {
    const nextUrl = validateUrl();
    if (!nextUrl) return;

    setSubmitting(true);
    try {
      const result = await testWebSocketConnection(nextUrl);
      setConnectionCheck(result);
      showMessage({
        severity: result.canConnect ? "success" : "error",
        summary: result.canConnect
          ? "Conexión WebSocket correcta"
          : "Error de WebSocket",
        detail: result.canConnect ? nextUrl : result.message,
        life: result.canConnect ? 2000 : 2500,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const connect = async () => {
    const nextUrl = validateUrl();

    if (
      !nextUrl ||
      connectionCheck?.url !== nextUrl ||
      !connectionCheck.canConnect
    ) {
      return;
    }

    setConnecting(true);
    try {
      const connected = await connectWebSocket(nextUrl);
      if (connected) {
        showMessage({
          severity: "success",
          summary: "WebSocket conectado",
          detail: nextUrl,
          life: 2000,
        });
        setVisible(false);
      } else {
        setConnectionCheck({
          url: nextUrl,
          canConnect: false,
          message: connectionCheck.message,
        });
        showMessage({
          severity: "error",
          summary: "Error de WebSocket",
          detail: connectionCheck.message,
          life: 2500,
        });
      }
    } finally {
      setConnecting(false);
    }
  };

  const normalizedDraftUrl = draftUrl.trim();
  const canConnect =
    connectionCheck?.url === normalizedDraftUrl && connectionCheck.canConnect;

  return (
    <WebSocketDialogContext.Provider value={{ visible, showWebSocketDialog }}>
      {children}
      <Dialog
        header="Cambia la direccion del servidor Websocket."
        visible={visible}
        style={{ width: "min(25vw, 620px)" }}
        breakpoints={{ "960px": "92vw", "641px": "96vw" }}
        onHide={() => setVisible(false)}
      >
        <InputText
          id="topbarWebSocketUrl"
          value={draftUrl}
          className="w-full"
          onChange={(event) => updateDraftUrl(event.target.value)}
        />

        <div className="flex flex-column md:flex-row gap-2 mt-3">
          <Button
            label="Probar Conexión"
            className="p-button-secondary p-button-outlined w-full"
            onClick={testConnection}
            loading={submitting}
            disabled={draftUrl.trim() === ""}
          />
          <Button
            label="Conectar Sesión"
            className="p-button-primary w-full"
            onClick={connect}
            loading={connecting}
            disabled={!canConnect}
          />
        </div>

        <WebSocketConnectionFeedback
          result={connectionCheck}
          currentUrl={draftUrl}
        />
      </Dialog>
    </WebSocketDialogContext.Provider>
  );
};

export const useWebSocketDialog = () => {
  const context = useContext(WebSocketDialogContext);
  if (!context) {
    throw new Error(
      "useWebSocketDialog must be used within WebSocketDialogProvider"
    );
  }
  return context;
};
