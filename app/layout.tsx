'use client';
import { LayoutProvider } from '../layout/context/layoutcontext';
import { PrimeReactProvider } from 'primereact/api';
import 'primereact/resources/primereact.css';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import '../styles/layout/layout.scss';
import { MessageProvider } from '@/layout/context/messagecontext';
import { ConnectionProvider } from '@/service/ConnectionContext';
import { DeviceDialogProvider } from '@/service/devicecontext';
interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          id="theme-css"
          href={`/themes/lara-light-blue/theme.css`}
          rel="stylesheet"
        ></link>
      </head>
      <body>
        <PrimeReactProvider>
          <LayoutProvider>
            <MessageProvider>
              <ConnectionProvider>
                <DeviceDialogProvider>{children}</DeviceDialogProvider>
              </ConnectionProvider>
            </MessageProvider>
          </LayoutProvider>
        </PrimeReactProvider>
      </body>
    </html>
  );
}
