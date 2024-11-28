'use client';

import { PrimeReactProvider } from 'primereact/api';
import { MessageProvider } from '@/layout/context/messagecontext';
import { ProvideNotion } from '@/demo/service/NotionService';
import 'primereact/resources/primereact.css';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import '../../styles/layout/layout.scss';
import 'regenerator-runtime/runtime';
import { LayoutProvider } from '../context/layoutcontext';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <PrimeReactProvider>
      <LayoutProvider>
        <MessageProvider>
          <ProvideNotion>{children}</ProvideNotion>
        </MessageProvider>
      </LayoutProvider>
    </PrimeReactProvider>
  );
}
