import ClientProviders from '@/layout/providers/ClientProviders';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NEUROAPP',
  description: 'NEUROAPP es una plataforma de entrenamiento neurofeedback diseñada para usuarios de dispositivos EEG.',
  robots: { index: false, follow: false },
  viewport: { initialScale: 1, width: 'device-width' },
  openGraph: {
    type: 'website',
    title: 'NEUROAPP - Plataforma Neurofeedback',
    url: 'https://neuroapp.example.com/',
    description: 'Explora NEUROAPP, la plataforma neurofeedback basada en dispositivos EEG para investigación y mejoramiento cognitivo.',
    images: ['https://neuroapp.example.com/static/social/neuroapp-banner.png'],
    ttl: 604800,
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link id="theme-css" href={`/themes/lara-light-blue/theme.css`} rel="stylesheet"></link>
      </head>
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
