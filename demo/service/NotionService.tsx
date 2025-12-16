// "use client"; // Indica que este archivo se ejecuta del lado del cliente en Next.js

// import React, { useContext, createContext } from "react";
// import { useState, useEffect, useCallback } from "react";
// import { Notion } from "@neurosity/notion";
// import { useConnection } from "./ConnectionContext";

// // const {
// //   setMode,
// //   setSelectedDeviceContext,
// //   setStateContext,
// //   setCharging,
// //   setBattery,
// // } = useConnection();

// // Crea una nueva instancia del SDK de Notion para interactuar con el dispositivo Neurosity Crown
// export const notion = new Notion({
//   autoSelectDevice: false, // Desactiva la selección automática de dispositivos; la selección será manual
// });

// // Define el estado inicial para el contexto de Notion
// const initialState = {
//   selectedDevice: null, // Dispositivo actualmente seleccionado
//   status: null, // Estado del dispositivo (conectado, desconectado, etc.)
//   user: null, // Información del usuario autenticado
//   loadingUser: true, // Indica si el proceso de carga de autenticación del usuario está en progreso
// };

// // Crea un contexto para compartir el estado de Notion en toda la aplicación
// export const NotionContext = createContext<any>(null);

// // Hook personalizado para acceder al contexto de Notion desde otros componentes
// export const useNotion = () => {
//   return useContext(NotionContext); // Retorna el valor actual del contexto
// };

// // Proveedor del contexto que envuelve a los componentes hijos y proporciona el estado y funciones de Notion
// export const ProvideNotion = ({ children }: any) => {
//   const notionProvider = useProvideNotion(); // Obtiene el estado y las funciones de Notion

//   return (
//     <NotionContext.Provider value={notionProvider}>
//       {children} {/* Proporciona el contexto a los componentes hijos */}
//     </NotionContext.Provider>
//   );
// };

// // Hook que encapsula la lógica del contexto de Notion
// function useProvideNotion() {

//   const {
//     setMode,
//     setSelectedDeviceContext,
//     setStateContext,
//     setCharging,
//     setBattery,
//   } = useConnection();
  
//   // Recupera el último dispositivo seleccionado del localStorage al cargar la página
//   const [lastSelectedDeviceId, setLastSelectedDeviceId] = useState<
//     string | null
//   >(() => {
//     if (typeof window !== "undefined") {
//       return localStorage.getItem("deviceId"); // Intenta recuperar el ID del dispositivo almacenado
//     }
//     return null; // Retorna null si no hay ventana disponible (servidor)
//   });

//   // Efecto para inicializar el ID del dispositivo seleccionado desde el localStorage
//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       const storedDeviceId = localStorage.getItem("deviceId");
//       setLastSelectedDeviceId(storedDeviceId);
//     }
//   }, []);

//   // Estado general del contexto, inicializado con el estado inicial
//   const [state, setState] = useState({
//     ...initialState, // Copia el estado inicial
//   });

//   const { user, selectedDevice } = state; // Extrae `user` y `selectedDevice` del estado

//   // Función para establecer el dispositivo seleccionado
//   const setSelectedDevice = useCallback((selectedDevice: any) => {
//     setState((state) => ({
//       ...state,
//       selectedDevice,
//     }));
//   }, []);

//   // Selecciona un dispositivo cuando el usuario está autenticado y no hay uno seleccionado
//   useEffect(() => {
//     if (user && !selectedDevice) {
//       notion.selectDevice((devices: any[]) => {
//         console.log("Último dispositivo:", lastSelectedDeviceId);
//         return lastSelectedDeviceId
//           ? devices.find(
//               (device: any) => device.deviceId === lastSelectedDeviceId
//             ) // Selecciona el último dispositivo si está disponible
//           : devices[0]; // Selecciona el primer dispositivo disponible
//       });
//     }
//   }, [user, lastSelectedDeviceId, selectedDevice]);

//   // Se suscribe al estado del dispositivo seleccionado y actualiza el estado global
//   useEffect(() => {
//     if (!selectedDevice) return;

//     const subscription = notion.status().subscribe((status) => {
//       setState((state: any) => ({ ...state, status })); // Actualiza el estado del dispositivo

//       // ✅ actualizar el contexto global
//       setStateContext(status?.state ?? null);
//       setCharging(status?.charging ?? false);
//       setBattery(status?.battery ?? 0);
//     });

//     return () => {
//       subscription.unsubscribe(); // Limpia la suscripción cuando cambia el dispositivo
//     };
//   }, [selectedDevice]);

//   // Maneja los cambios en la autenticación del usuario
//   useEffect(() => {
//     setState((state) => ({ ...state, loadingUser: true }));

//     const subscription = notion.onAuthStateChanged().subscribe((user) => {
//       setState((state) => ({
//         ...state,
//         user, // Actualiza el usuario autenticado
//         loadingUser: false,
//       }));

//       if (user) {
//         setMode("crown"); // ✅ establecer modo en el context global
//       }
//     });

//     return () => {
//       subscription.unsubscribe(); // Limpia la suscripción al desmontar
//     };
//   }, []);

//   // Maneja cambios en el dispositivo seleccionado
//   useEffect(() => {
//     const sub = notion.onDeviceChange().subscribe((selectedDevice) => {
//       setSelectedDevice(selectedDevice);
//       setSelectedDeviceContext(selectedDevice.deviceNickname); // ✅ en context

//       if (typeof window !== "undefined") {
//         localStorage.setItem("deviceId", selectedDevice.deviceId); // Guarda el ID del dispositivo en localStorage
//         setLastSelectedDeviceId(selectedDevice.deviceId);
//       }
//     });

//     return () => {
//       sub.unsubscribe(); // Limpia la suscripción al desmontar
//     };
//   }, [setSelectedDevice]);

//   // Función para cerrar sesión en Notion
//   const logoutNotion = useCallback(async () => {
//     await notion.logout(); // Espera a que se cierre sesión

//     setState({ ...initialState, loadingUser: false });

//     // Limpiar contexto global
//     setMode(null);
//     setSelectedDevice(null);
//     setStateContext(null);
//     setCharging(false);
//     setBattery(0);
//   }, []);

//   // Retorna el estado y las funciones que estarán disponibles a través del contexto
//   return {
//     ...state, // Incluye el estado actual
//     notion, // Proporciona la instancia de Notion
//     lastSelectedDeviceId, // ID del último dispositivo seleccionado
//     setLastSelectedDeviceId, // Función para actualizar el ID del último dispositivo seleccionado
//     logoutNotion, // Función para cerrar sesión
//     setSelectedDevice, // Función para establecer un dispositivo seleccionado
//   };
// }

"use client"; // Este archivo solo se ejecuta en el cliente

import React, { useContext, createContext } from "react";
import { useState, useEffect, useCallback } from "react";
import { useConnection } from "./ConnectionContext";

// ❌ ELIMINAMOS ESTA LÍNEA
// import { Notion } from "@neurosity/notion";

// ❌ ELIMINAMOS TAMBIÉN ESTO (NO SE PUEDE INSTANCIAR A NIVEL DE MÓDULO)
// export const notion = new Notion({
//   autoSelectDevice: false,
// });

// Define el estado inicial para el contexto de Notion
const initialState = {
  selectedDevice: null,
  status: null,
  user: null,
  loadingUser: true,
};

// Crea un contexto para compartir el estado de Notion en toda la aplicación
export const NotionContext = createContext<any>(null);

// Hook personalizado para acceder al contexto de Notion desde otros componentes
export const useNotion = () => {
  return useContext(NotionContext);
};

// Proveedor del contexto
export const ProvideNotion = ({ children }: any) => {
  const notionProvider = useProvideNotion();

  return (
    <NotionContext.Provider value={notionProvider}>
      {children}
    </NotionContext.Provider>
  );
};

// Hook que encapsula la lógica del contexto de Notion
function useProvideNotion() {
  const {
    setMode,
    setSelectedDeviceContext,
    setStateContext,
    setCharging,
    setBattery,
  } = useConnection();

  // ✅ AHORA notion ES PARTE DEL ESTADO, NO UNA VARIABLE GLOBAL
  const [notion, setNotion] = useState<any | null>(null);

  // ✅ Instanciamos Notion SOLO en cliente, con import dinámico
  useEffect(() => {
    let isMounted = true;

    async function initNotion() {
      if (typeof window === "undefined") return;

      const { Notion } = await import("@neurosity/notion");
      const instance = new Notion({
        autoSelectDevice: false,
      });

      if (isMounted) {
        setNotion(instance);
      }
    }

    initNotion();

    return () => {
      isMounted = false;
      if (notion && typeof notion.disconnect === "function") {
        notion.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recupera el último dispositivo seleccionado del localStorage al cargar la página
  const [lastSelectedDeviceId, setLastSelectedDeviceId] = useState<string | null>(
    () => {
      if (typeof window !== "undefined") {
        return localStorage.getItem("deviceId");
      }
      return null;
    }
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedDeviceId = localStorage.getItem("deviceId");
      setLastSelectedDeviceId(storedDeviceId);
    }
  }, []);

  // Estado general del contexto
  const [state, setState] = useState({
    ...initialState,
  });

  const { user, selectedDevice } = state;

  const setSelectedDevice = useCallback((selectedDevice: any) => {
    setState((state) => ({
      ...state,
      selectedDevice,
    }));
  }, []);

  // ✅ Solo selecciona dispositivo si YA tenemos notion
  useEffect(() => {
    if (!notion) return;
    if (user && !selectedDevice) {
      notion.selectDevice((devices: any[]) => {
        console.log("Último dispositivo:", lastSelectedDeviceId);
        return lastSelectedDeviceId
          ? devices.find(
              (device: any) => device.deviceId === lastSelectedDeviceId
            )
          : devices[0];
      });
    }
  }, [user, lastSelectedDeviceId, selectedDevice, notion]);

  // Se suscribe al estado del dispositivo seleccionado
  useEffect(() => {
    if (!selectedDevice || !notion) return;

    const subscription = notion.status().subscribe((status: any) => {
      setState((state: any) => ({ ...state, status }));

      setStateContext(status?.state ?? null);
      setCharging(status?.charging ?? false);
      setBattery(status?.battery ?? 0);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedDevice, notion, setBattery, setCharging, setStateContext]);

  // Maneja la autenticación del usuario
  useEffect(() => {
    if (!notion) return;

    setState((state) => ({ ...state, loadingUser: true }));

    const subscription = notion.onAuthStateChanged().subscribe((user: any) => {
      setState((state) => ({
        ...state,
        user,
        loadingUser: false,
      }));

      if (user) {
        setMode("crown");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [notion, setMode]);

  // Maneja cambios en el dispositivo seleccionado
  useEffect(() => {
    if (!notion) return;

    const sub = notion.onDeviceChange().subscribe((selectedDevice: any) => {
      setSelectedDevice(selectedDevice);
      setSelectedDeviceContext(selectedDevice.deviceNickname);

      if (typeof window !== "undefined") {
        localStorage.setItem("deviceId", selectedDevice.deviceId);
        setLastSelectedDeviceId(selectedDevice.deviceId);
      }
    });

    return () => {
      sub.unsubscribe();
    };
  }, [notion, setSelectedDevice, setSelectedDeviceContext]);

  // Función para cerrar sesión en Notion
  const logoutNotion = useCallback(async () => {
    if (notion) {
      await notion.logout();
    }

    setState({ ...initialState, loadingUser: false });

    setMode(null);
    setSelectedDevice(null);
    setStateContext(null);
    setCharging(false);
    setBattery(0);
  }, [notion, setBattery, setCharging, setMode, setSelectedDevice, setStateContext]);

  return {
    ...state,
    notion,
    lastSelectedDeviceId,
    setLastSelectedDeviceId,
    logoutNotion,
    setSelectedDevice,
  };
}
