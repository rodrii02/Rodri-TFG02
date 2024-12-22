'use client'; // Indica que este archivo se ejecuta del lado del cliente en Next.js

import React, { useContext, createContext } from "react";
import { useState, useEffect, useCallback } from "react";
import { Notion } from "@neurosity/notion";

// Crea una nueva instancia del SDK de Notion para interactuar con el dispositivo Neurosity Crown
export const notion = new Notion({
  autoSelectDevice: false // Desactiva la selección automática de dispositivos; la selección será manual
});

// Define el estado inicial para el contexto de Notion
const initialState = {
  selectedDevice: null, // Dispositivo actualmente seleccionado
  status: null,         // Estado del dispositivo (conectado, desconectado, etc.)
  user: null,           // Información del usuario autenticado
  loadingUser: true     // Indica si el proceso de carga de autenticación del usuario está en progreso
};

// Crea un contexto para compartir el estado de Notion en toda la aplicación
export const NotionContext = createContext<any>(null);

// Hook personalizado para acceder al contexto de Notion desde otros componentes
export const useNotion = () => {
  return useContext(NotionContext); // Retorna el valor actual del contexto
};

// Proveedor del contexto que envuelve a los componentes hijos y proporciona el estado y funciones de Notion
export const ProvideNotion = ({ children }: any) => {
  const notionProvider = useProvideNotion(); // Obtiene el estado y las funciones de Notion

  return (
    <NotionContext.Provider value={notionProvider}>
      {children} {/* Proporciona el contexto a los componentes hijos */}
    </NotionContext.Provider>
  );
};

// Hook que encapsula la lógica del contexto de Notion
function useProvideNotion() {
  // Recupera el último dispositivo seleccionado del localStorage al cargar la página
  const [lastSelectedDeviceId, setLastSelectedDeviceId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("deviceId"); // Intenta recuperar el ID del dispositivo almacenado
    }
    return null; // Retorna null si no hay ventana disponible (servidor)
  });

  // Efecto para inicializar el ID del dispositivo seleccionado desde el localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedDeviceId = localStorage.getItem("deviceId");
      setLastSelectedDeviceId(storedDeviceId);
    }
  }, []);

  // Estado general del contexto, inicializado con el estado inicial
  const [state, setState] = useState({
    ...initialState // Copia el estado inicial
  });

  const { user, selectedDevice } = state; // Extrae `user` y `selectedDevice` del estado

  // Función para establecer el dispositivo seleccionado
  const setSelectedDevice = useCallback((selectedDevice: any) => {
    setState((state) => ({
      ...state,
      selectedDevice
    }));
  }, []);

  // Selecciona un dispositivo cuando el usuario está autenticado y no hay uno seleccionado
  useEffect(() => {
    if (user && !selectedDevice) {
      notion.selectDevice((devices: any[]) => {
        console.log("Último dispositivo:", lastSelectedDeviceId);
        return lastSelectedDeviceId
          ? devices.find((device: any) => device.deviceId === lastSelectedDeviceId) // Selecciona el último dispositivo si está disponible
          : devices[0]; // Selecciona el primer dispositivo disponible
      });
    }
  }, [user, lastSelectedDeviceId, selectedDevice]);

  // Se suscribe al estado del dispositivo seleccionado y actualiza el estado global
  useEffect(() => {
    if (!selectedDevice) return;

    const subscription = notion.status().subscribe((status) => {
      setState((state: any) => ({ ...state, status })); // Actualiza el estado del dispositivo
    });

    return () => {
      subscription.unsubscribe(); // Limpia la suscripción cuando cambia el dispositivo
    };
  }, [selectedDevice]);

  // Maneja los cambios en la autenticación del usuario
  useEffect(() => {
    setState((state) => ({ ...state, loadingUser: true }));

    const subscription = notion.onAuthStateChanged().subscribe((user) => {
      setState((state) => ({
        ...state,
        user, // Actualiza el usuario autenticado
        loadingUser: false
      }));
    });

    return () => {
      subscription.unsubscribe(); // Limpia la suscripción al desmontar
    };
  }, []);

  // Maneja cambios en el dispositivo seleccionado
  useEffect(() => {
    const sub = notion.onDeviceChange().subscribe((selectedDevice) => {
      setSelectedDevice(selectedDevice);

      if (typeof window !== "undefined") {
        localStorage.setItem("deviceId", selectedDevice.deviceId); // Guarda el ID del dispositivo en localStorage
        setLastSelectedDeviceId(selectedDevice.deviceId);
      }
    });

    return () => {
      sub.unsubscribe(); // Limpia la suscripción al desmontar
    };
  }, [setSelectedDevice]);

  // Función para cerrar sesión en Notion
  const logoutNotion = useCallback(() => {
    return new Promise<void>((resolve) => {
      notion.logout().then(resolve); // Llama al método de logout del SDK
      setState({ ...initialState, loadingUser: false }); // Reinicia el estado a su valor inicial
    });
  }, []);

  // Retorna el estado y las funciones que estarán disponibles a través del contexto
  return {
    ...state, // Incluye el estado actual
    notion, // Proporciona la instancia de Notion
    lastSelectedDeviceId, // ID del último dispositivo seleccionado
    setLastSelectedDeviceId, // Función para actualizar el ID del último dispositivo seleccionado
    logoutNotion, // Función para cerrar sesión
    setSelectedDevice // Función para establecer un dispositivo seleccionado
  };
}
