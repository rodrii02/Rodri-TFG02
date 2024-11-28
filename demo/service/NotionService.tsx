'use client'
import React, { useContext, createContext } from "react";
import { useState, useEffect, useCallback } from "react";
import { Notion } from "@neurosity/notion";

// Crea una nueva instancia del SDK de Notion para interactuar con el dispositivo Neurosity Crown
export const notion = new Notion({
  autoSelectDevice: false // Desactiva la selección automática de dispositivos; la selección se realizará manualmente
});

// Define el estado inicial para el contexto de Notion
const initialState = {
  selectedDevice: null, // Almacena el dispositivo actualmente seleccionado
  status: null,          // Almacena el estado actual del dispositivo
  user: null,            // Almacena el usuario autenticado
  loadingUser: true      // Indica si la carga de autenticación del usuario está en progreso
};

// Crea un contexto para gestionar y compartir el estado relacionado con Notion en todos los componentes
export const NotionContext = createContext<any>(null);

// Hook para acceder a NotionContext en otros componentes
export const useNotion = () => {
  return useContext(NotionContext);
};

// Componente proveedor que envuelve a sus hijos con NotionContext y les proporciona su estado y funciones
export function ProvideNotion({ children }: any) {
  const notionProvider = useProvideNotion(); // Llama a `useProvideNotion` para obtener el estado y las funciones de Notion

  return (
    <NotionContext.Provider value={notionProvider}>
      {children}
    </NotionContext.Provider>
  );
}

// Hook que gestiona la lógica del contexto de Notion y proporciona el estado y las funciones
function useProvideNotion() {
  // Estado para almacenar el ID del último dispositivo seleccionado en localStorage, o `null` si no hay ninguno
  // const [lastSelectedDeviceId, setLastSelectedDeviceId] = useState<string | null>(
  //   localStorage.getItem("deviceId")
  // );

  const [lastSelectedDeviceId, setLastSelectedDeviceId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedDeviceId = localStorage.getItem("deviceId");
      setLastSelectedDeviceId(storedDeviceId);
    }
  }, []);

  // Estado para almacenar el estado actual del contexto de Notion
  const [state, setState] = useState({
    ...initialState // Copia el estado inicial
  });

  // Extrae `user` y `selectedDevice` del estado actual para un fácil acceso
  const { user, selectedDevice } = state;

  // Función para actualizar el dispositivo seleccionado en el estado de Notion
  const setSelectedDevice = useCallback((selectedDevice: any) => {
    setState((state) => ({
      ...state,
      selectedDevice
    }));
  }, []);

  // Efecto para seleccionar un dispositivo automáticamente si hay un usuario autenticado y no hay un dispositivo seleccionado
  useEffect(() => {
    if (user && !selectedDevice) {
        notion.selectDevice((devices: any[]) => {
            console.log("Ultimo dispositivo:", lastSelectedDeviceId);
            return lastSelectedDeviceId
                ? devices.find((device: any) => device.deviceId === lastSelectedDeviceId)
                : devices[0] as string; // Selecciona el primer dispositivo si no hay un `lastSelectedDeviceId`
        });
    }
  }, [user, lastSelectedDeviceId, selectedDevice]);

  // Efecto para suscribirse al estado del dispositivo seleccionado y actualizar `status` en el estado de Notion
  useEffect(() => {
    if (!selectedDevice) {
      return; // Si no hay dispositivo seleccionado, no hace nada
    }

    const subscription = notion.status().subscribe((status) => {
      setState((state: any) => ({ ...state, status }));
    });

    return () => {
      subscription.unsubscribe(); // Cancela la suscripción cuando el dispositivo cambia o el componente se desmonta
    };
  }, [selectedDevice]);

  // Efecto para monitorear el estado de autenticación del usuario y actualizar `user` en el estado de Notion
  useEffect(() => {
    setState((state) => ({ ...state, loadingUser: true }));

    const subscription = notion
      .onAuthStateChanged()
      .subscribe((user) => {
        setState((state) => ({
          ...state,
          user,
          loadingUser: false
        }));
      });

    return () => {
      subscription.unsubscribe(); // Cancela la suscripción cuando el componente se desmonta
    };
  }, []);

  // Efecto para manejar el cambio de dispositivos y actualizar `selectedDevice` y `lastSelectedDeviceId`
  useEffect(() => {
    const sub = notion.onDeviceChange().subscribe((selectedDevice) => {
      setSelectedDevice(selectedDevice);
  
      if (typeof window !== "undefined") {
        localStorage.setItem("deviceId", selectedDevice.deviceId);
        setLastSelectedDeviceId(selectedDevice.deviceId);
      }
    });
  
    return () => {
      sub.unsubscribe();
    };
  }, [setSelectedDevice]);
  

  // Función para cerrar sesión en Notion y restablecer el estado de Notion al estado inicial
  const logoutNotion = useCallback(() => {
    return new Promise((resolve) => {
      notion.logout().then(resolve); // Llama a `logout` y luego resuelve la promesa
      setState({ ...initialState, loadingUser: false }); // Restablece el estado al inicial
    });
  }, []);

  // Retorna el estado y las funciones necesarias para manejar Notion a través del contexto
  return {
    ...state,                // Retorna el estado de Notion (user, status, selectedDevice, etc.)
    lastSelectedDeviceId,    // Retorna el ID del último dispositivo seleccionado
    setLastSelectedDeviceId, // Función para actualizar el ID del último dispositivo en localStorage
    logoutNotion,            // Función para cerrar sesión en Notion
    setSelectedDevice        // Función para actualizar el dispositivo seleccionado
  };
}
