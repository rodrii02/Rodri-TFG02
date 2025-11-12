'use client';

import React, { createContext, useContext, useState } from 'react';

type ConnectionMode = 'crown' | 'websocket' | null;
type ConnectionState = 'online' | 'offline' | null;

interface ConnectionInfo {
    mode: ConnectionMode;
    //   username?: string;
    selectedDevice?: string | null;   // Nickname (Crown) o WS host
    state?: ConnectionState;

    // Solo Crown
    charging?: boolean;
    battery?: number;

    // Setters
    setMode: (mode: ConnectionMode) => void;
    //   setUsername: (name: string) => void;
    setSelectedDevice: (device: string | null) => void;
    setState: (state: ConnectionState) => void;
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
    const [username, setUsername] = useState<string>();
    const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
    const [state, setState] = useState<ConnectionState>(null);

    const [charging, setCharging] = useState<boolean>(false);
    const [battery, setBattery] = useState<number>();

    return (
        <ConnectionContext.Provider
            value={{
                mode,
                // username,
                selectedDevice,
                state,
                charging,
                battery,
                setMode,
                // setUsername,
                setSelectedDevice,
                setState,
                setCharging,
                setBattery
            }}
        >
            {children}
        </ConnectionContext.Provider>
    );
};
