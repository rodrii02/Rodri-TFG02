'use client';
import { LayoutProvider } from '../layout/context/layoutcontext';
import { PrimeReactProvider } from 'primereact/api';
import 'primereact/resources/primereact.css';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import '../styles/layout/layout.scss';
import { MessageProvider } from '@/layout/context/messagecontext';
import { ConnectionProvider } from '@/demo/service/ConnectionContext';
import { ProvideNotion } from '@/demo/service/NotionService';
import { WebSocketProvider } from '@/demo/service/WebSocketService';
import { DeviceDialogProvider } from '@/layout/context/devicecontext';
interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          id="theme-css"
          href={`/themes/lara-light-blue/theme2.css`}
          rel="stylesheet"
        ></link>
      </head>
      <body>
        <PrimeReactProvider>
          <LayoutProvider>
            <MessageProvider>
              <ConnectionProvider>
                <WebSocketProvider>
                <ProvideNotion>
                  <DeviceDialogProvider>{children}</DeviceDialogProvider>
                </ProvideNotion>
                </WebSocketProvider>
              </ConnectionProvider>
            </MessageProvider>
          </LayoutProvider>
        </PrimeReactProvider>
      </body>
    </html>
  );
}
