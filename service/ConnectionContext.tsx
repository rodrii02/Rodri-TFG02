"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import 'regenerator-runtime/runtime';

export type ConnectionMode = "crown" | "websocket" | null;

export interface SharedConnectionData {
  mode: ConnectionMode;
  selectedDeviceContext: string | null;
  stateContext: string | null;
  charging: boolean;
  battery: number | null;
  isConnected: boolean | null;
  lastMessage: string | null;
  error: string | null;
  notion: unknown | null;
  user: unknown | null;
  selectedDevice: unknown | null;
  status: unknown | null;
  loadingUser: boolean;
  lastSelectedDeviceId: string | null;
}

type NotionDevice = {
  deviceId: string;
  deviceNickname?: string;
};

type NotionStatus = {
  state?: string | null;
  charging?: boolean;
  battery?: number;
};

type NotionLike = {
  disconnect?: () => void;
  logout?: () => Promise<void>;
  login?: (credentials: { email: string; password: string }) => Promise<void>;
  getDevices?: () => Promise<NotionDevice[]>;
  selectDevice: (selector: (devices: NotionDevice[]) => NotionDevice | undefined) => Promise<unknown>;
  status: () => { subscribe: (cb: (status: NotionStatus) => void) => { unsubscribe: () => void } };
  onAuthStateChanged: () => { subscribe: (cb: (user: unknown) => void) => { unsubscribe: () => void } };
  onDeviceChange: () => { subscribe: (cb: (device: NotionDevice | null) => void) => { unsubscribe: () => void } };
};

interface ConnectionInfo extends SharedConnectionData {
  socket: WebSocket | null;
  connect: (url: string) => void;
  disconnect: () => void;
  setLastSelectedDeviceId: React.Dispatch<React.SetStateAction<string | null>>;
  setSelectedDevice: (device: NotionDevice | null) => void;
  logoutNotion: () => Promise<void>;

  setMode: (mode: ConnectionMode) => void;
  setSelectedDeviceContext: (device: string | null) => void;
  setStateContext: (state: string | null) => void;
  setCharging: (charging: boolean) => void;
  setBattery: (battery: number | null) => void;
}

// Contexto global de conexión
const ConnectionContext = createContext<ConnectionInfo | null>(null);

// Hook para acceder al contexto
export const useConnection = () => {
  const context = useContext(ConnectionContext);
  if (!context) throw new Error('useConnection must be used within ConnectionProvider');
  return context;
};

export const ConnectionProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState<ConnectionMode>(null);
  const [selectedDeviceContext, setSelectedDeviceContext] = useState<string | null>(null);
  const [stateContext, setStateContext] = useState<string | null>(null);
  const [charging, setCharging] = useState<boolean>(false);
  const [battery, setBattery] = useState<number | null>(null);

  const [notion, setNotion] = useState<NotionLike | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<NotionDevice | null>(null);
  const [status, setStatus] = useState<NotionStatus | null>(null);
  const [user, setUser] = useState<unknown>(null);
  const [loadingUser, setLoadingUser] = useState<boolean>(true);
  const [lastSelectedDeviceId, setLastSelectedDeviceId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('deviceId');
    }
    return null;
  });

  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isDisconnected = useRef(false);

  const resetWebSocketState = useCallback((nextError: string | null = null) => {
    socketRef.current = null;
    setIsConnected(null);
    setMode(null);
    setSelectedDeviceContext(null);
    setStateContext('offline');
    setError(nextError);
  }, []);

  useEffect(() => {
    let isMounted = true;
    let instance: NotionLike | null = null;

    async function initNotion() {
      if (typeof window === 'undefined') return;

      const { Notion } = await import('@neurosity/notion');
      instance = new Notion({ autoSelectDevice: false }) as unknown as NotionLike;

      if (isMounted) {
        setNotion(instance);
      }
    }

    initNotion();

    return () => {
      isMounted = false;
      instance?.disconnect?.();
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLastSelectedDeviceId(localStorage.getItem('deviceId'));
    }
  }, []);

  useEffect(() => {
    if (!notion || !user || selectedDevice) return;

    notion.selectDevice((devices) => {
      return lastSelectedDeviceId
        ? devices.find((device) => device.deviceId === lastSelectedDeviceId)
        : devices[0];
    });
  }, [notion, user, selectedDevice, lastSelectedDeviceId]);

  useEffect(() => {
    if (!notion || !selectedDevice) return;

    const subscription = notion.status().subscribe((nextStatus) => {
      setStatus(nextStatus);
      setStateContext(nextStatus?.state ?? null);
      setCharging(nextStatus?.charging ?? false);
      setBattery(nextStatus?.battery ?? 0);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [notion, selectedDevice]);

  useEffect(() => {
    if (!notion) return;

    setLoadingUser(true);

    const subscription = notion.onAuthStateChanged().subscribe((authUser: unknown) => {
      setUser(authUser);
      setLoadingUser(false);
      if (authUser) {
        setMode('crown');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [notion]);

  useEffect(() => {
    if (!notion) return;

    const subscription = notion.onDeviceChange().subscribe((device) => {
      if (!device) return;

      setSelectedDevice(device);
      setSelectedDeviceContext(device.deviceNickname ?? null);

      if (typeof window !== 'undefined') {
        localStorage.setItem('deviceId', device.deviceId);
        setLastSelectedDeviceId(device.deviceId);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [notion]);

  const disconnect = useCallback(() => {
    isDisconnected.current = true;

    if (socketRef.current) {
      socketRef.current.close();
    }

    resetWebSocketState(null);
  }, [resetWebSocketState]);

  const connect = useCallback(
    (url: string) => {
      isDisconnected.current = false;

      if (socketRef.current) {
        socketRef.current.close();
      }

      try {
        const ws = new WebSocket(url);
        socketRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
          setError('none');
          setMode('websocket');
          setSelectedDeviceContext(url);
          setStateContext('online');
        };

        ws.onmessage = (event) => {
          setLastMessage(event.data);
        };

        ws.onerror = () => {
          if (isDisconnected.current || socketRef.current !== ws) {
            return;
          }

          resetWebSocketState('WebSocket connection error');
        };

        ws.onclose = () => {
          if (socketRef.current !== ws) {
            return;
          }

          if (isDisconnected.current) {
            resetWebSocketState(null);
            return;
          }

          resetWebSocketState('WebSocket cerrado inesperadamente');
        };
      } catch (errorValue) {
        const errorMessage = errorValue instanceof Error ? errorValue.message : 'Unknown websocket error';
        setError(errorMessage);
        setStateContext('offline');
      }
    },
    [resetWebSocketState]
  );

  const logoutNotion = useCallback(async () => {
    if (notion?.logout) {
      await notion.logout();
    }

    setUser(null);
    setLoadingUser(false);
    setSelectedDevice(null);
    setStatus(null);
    setMode(null);
    setSelectedDeviceContext(null);
    setStateContext(null);
    setCharging(false);
    setBattery(null);
  }, [notion]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return (
    <ConnectionContext.Provider
      value={{
        mode,
        selectedDeviceContext,
        stateContext,
        charging,
        battery,
        notion,
        selectedDevice,
        status,
        user,
        loadingUser,
        lastSelectedDeviceId,
        setLastSelectedDeviceId,
        setSelectedDevice,
        logoutNotion,
        socket: socketRef.current,
        isConnected,
        lastMessage,
        error,
        connect,
        disconnect,
        setMode,
        setSelectedDeviceContext,
        setStateContext,
        setCharging,
        setBattery,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
};
