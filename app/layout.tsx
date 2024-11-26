// app/layout.tsx
'use client';
import { LayoutProvider } from '../layout/context/layoutcontext';
import { PrimeReactProvider } from 'primereact/api';
import 'primereact/resources/primereact.css';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import '../styles/layout/layout.scss';
import { MessageProvider } from '@/layout/context/messagecontext';
import { ProvideNotion } from '@/demo/service/NotionService';
import 'regenerator-runtime/runtime';


interface RootLayoutProps {
    children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link id="theme-css" href={`/themes/lara-dark-blue/theme.css`} rel="stylesheet"></link>
            </head>
            <body>
                <PrimeReactProvider>
                    <LayoutProvider>
                        <MessageProvider>
                        <ProvideNotion>
                            {children}
                        </ProvideNotion>
                        </MessageProvider>
                    </LayoutProvider>
                </PrimeReactProvider>
            </body>
        </html>
    );
}