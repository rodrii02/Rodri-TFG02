import { useRef, useState, createContext, useContext } from "react";
import { useConnection } from "./ConnectionContext";

export const WebSocketContext = createContext<any>(null);

export const useWebSocket = () => {
  return useContext(WebSocketContext); // Retorna el valor actual del contexto
};

export const WebSocketProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { setMode, setSelectedDeviceContext, setStateContext } =
    useConnection(); // ✅ Aquí sincronizas el estado global

  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState<Boolean | null>(null);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  //error depende del valor puede ser none, null, o un mensaje de error
  //Se usara null para indicar desconexion intencional
  // none para indicar que no hay error
  // un mensaje de error para indicar un error ya sea desconexión inesperada o error de conexión
  const isDesconnected = useRef(false);

  const connect = (url: string) => {
    isDesconnected.current = false;

    if (socketRef.current) {
      socketRef.current.close();
    }

    try {
      const ws = new WebSocket(url);
      socketRef.current = ws;

      ws.onopen = () => {
        console.log("[WebSocket] Connected");
        setIsConnected(true);
        setError('none');

        // 🔄 Actualiza el contexto global
        setMode("websocket");
        setSelectedDeviceContext(url);
        setStateContext("online");
      };

      ws.onmessage = (event) => {
        console.log("[WebSocket] Message:", event.data);
        setLastMessage(event.data);
      };

      ws.onerror = (err) => {
        console.error("[WebSocket] Error:", err);
        setError("WebSocket connection error");
        disconnect();
      };

      ws.onclose = () => {
        console.log("[WebSocket] Disconnected");
        if (isDesconnected.current) {
          setError(null);
        } else {
          setError("WebSocket Cerrado inesperadamente");
        }
        disconnect();
      };
    } catch (err: any) {
      console.error("[WebSocket] Connection exception:", err.message);
      setError(err.message);

      setStateContext("offline");
    }
  };

  const disconnect = () => {
    // 👇 A partir de aquí, ningún handler de este socket debería hacer nada
    isDesconnected.current = true;

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setIsConnected(null);
    // setError(null);

    setMode(null);
    setSelectedDeviceContext(null);
    setStateContext("offline");
  };

  return (
    <WebSocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        connect,
        disconnect,
        lastMessage,
        error,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};
