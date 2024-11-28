// context/MessageContext.tsx
'use client'

import React, { createContext, useContext, useRef } from 'react';
import { Toast } from 'primereact/toast';

const MessageContext = createContext<any>(null);

export const MessageProvider = ({ children }: { children: React.ReactNode }) => {
    const toast = useRef<Toast>(null);

    const showMessage = (options: any) => {
        toast.current?.show(options);
    };

    return (
        <MessageContext.Provider value={{ showMessage }}>
            {children}
            <Toast ref={toast} position="top-right"/>
        </MessageContext.Provider>
    );
};
// Hook para acceder al contexto de mensajes
export const useMessage = () => useContext(MessageContext); 
