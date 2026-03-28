"use client";

import { useCallback } from "react";
import {
  useConnection,
  type SharedConnectionData,
} from "./ConnectionContext";

type CrownCredentials = {
  email: string;
  password: string;
};

type CrownDevice = {
  deviceId: string;
};

type CrownClient = {
  login?: (credentials: CrownCredentials) => Promise<void>;
  getDevices?: () => Promise<unknown[]>;
  selectDevice?: (
    selector: (devices: CrownDevice[]) => CrownDevice | undefined
  ) => Promise<unknown>;
};

export interface UnifiedConnectionService extends SharedConnectionData {
  info: SharedConnectionData;
  socket: WebSocket | null;
  notionClient: unknown | null;
  connectWebSocket: (url: string) => Promise<void>;
  disconnectWebSocket: () => void;
  sendWebSocketMessage: (message: string) => void;
  loginCrown: (email: string, password: string) => Promise<void>;
  logoutCrown: () => Promise<void>;
  getCrownDevices: () => Promise<unknown[]>;
  selectCrownDevice: (deviceId: string) => Promise<void>;
  lastWebSocketMessage: string | null;
}

export const useUnifiedConnection = (): UnifiedConnectionService => {
  const {
    mode,
    selectedDeviceContext,
    stateContext,
    charging,
    battery,
    isConnected,
    lastMessage,
    error,
    socket,
    connect,
    disconnect,
    notion,
    user,
    selectedDevice,
    status,
    loadingUser,
    lastSelectedDeviceId,
    logoutNotion,
    setLastSelectedDeviceId,
  } = useConnection();

  const shared: SharedConnectionData = {
    mode,
    selectedDeviceContext,
    stateContext,
    charging,
    battery,
    isConnected,
    lastMessage,
    error,
    notion,
    user,
    selectedDevice,
    status,
    loadingUser,
    lastSelectedDeviceId,
  };

  const notionClient = notion as CrownClient | null;

  const connectWebSocket = useCallback(
    async (url: string) => {
      if (shared.mode === "crown") {
        await logoutNotion();
      }

      connect(url);
    },
    [connect, logoutNotion, shared.mode]
  );

  const disconnectWebSocket = useCallback(() => {
    disconnect();
  }, [disconnect]);

  const sendWebSocketMessage = useCallback(
    (message: string) => {
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        throw new Error("WebSocket no está conectado");
      }

      socket.send(message);
    },
    [socket]
  );

  const loginCrown = useCallback(
    async (email: string, password: string) => {
      if (shared.mode === "websocket") {
        disconnect();
      }

      if (!notionClient?.login) {
        throw new Error("Notion client is not initialized yet");
      }

      await notionClient.login({ email, password });
    },
    [disconnect, notionClient, shared.mode]
  );

  const getCrownDevices = useCallback(async () => {
    if (!notionClient?.getDevices) {
      return [];
    }

    return notionClient.getDevices();
  }, [notionClient]);

  const selectCrownDevice = useCallback(
    async (deviceId: string) => {
      if (!notionClient?.selectDevice) {
        throw new Error("Notion selectDevice is not available");
      }

      await notionClient.selectDevice((devices) =>
        devices.find((device) => device.deviceId === deviceId)
      );
      setLastSelectedDeviceId(deviceId);
    },
    [notionClient, setLastSelectedDeviceId]
  );

  const logoutCrown = useCallback(async () => {
    await logoutNotion();
  }, [logoutNotion]);

  return {
    ...shared,
    info: shared,
    socket,
    notionClient,
    connectWebSocket,
    disconnectWebSocket,
    sendWebSocketMessage,
    loginCrown,
    logoutCrown,
    getCrownDevices,
    selectCrownDevice,
    lastWebSocketMessage: shared.lastMessage,
  };
};
