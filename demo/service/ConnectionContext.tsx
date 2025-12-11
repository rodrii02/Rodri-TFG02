'use client';

import React, { createContext, useContext, useState } from 'react';

type ConnectionMode = 'crown' | 'websocket' | null;

interface ConnectionInfo {
    mode: ConnectionMode;
    //   username?: string;
    selectedDeviceContext?: string | null;   // Nickname (Crown) o WS host
    stateContext?: string | null;

    // Solo Crown
    charging?: boolean;
    battery?: number;

    // Setters
    setMode: (mode: ConnectionMode) => void;
    //   setUsername: (name: string) => void;
    setSelectedDeviceContext: (device: string | null) => void;
    setStateContext: (state: string | null) => void;
    setCharging: (charging: boolean) => void;
    setBattery: (battery: number) => void;
}

const ConnectionContext = createContext<ConnectionInfo | null>(null);

export const useConnection = () => {
    const context = useContext(ConnectionContext);
    if (!context) throw new Error('useConnection must be used within ConnectionProvider');
    return context;
};

export const ConnectionProvider = ({ children }: { children: React.ReactNode }) => {
    const [mode, setMode] = useState<ConnectionMode>(null);
    // const [username, setUsername] = useState<string>();
    const [selectedDeviceContext, setSelectedDeviceContext] = useState<string | null>(null);
    const [stateContext, setStateContext] = useState<string | null>(null);

    const [charging, setCharging] = useState<boolean>(false);
    const [battery, setBattery] = useState<number>();

    return (
        <ConnectionContext.Provider
            value={{
                mode,
                // username,
                selectedDeviceContext,
                stateContext,
                charging,
                battery,
                setMode,
                // setUsername,
                setSelectedDeviceContext,
                setStateContext,
                setCharging,
                setBattery
            }}
        >
            {children}
        </ConnectionContext.Provider>
    );
};
