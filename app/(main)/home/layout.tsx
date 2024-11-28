import Layout from '@/layout/layout';
import { Metadata } from 'next';
import { Dialog } from 'primereact/dialog';

interface AppLayoutProps {
    children: React.ReactNode;
}

export const metadata: Metadata = {
    title: 'Proyecto de Neurofeedback',
    description: 'Desarrollo de una plataforma de neurofeedback para modular la actividad cerebral en tiempo real mediante electroencefalografía no invasiva.',
    robots: { index: false, follow: false },
    viewport: { initialScale: 1, width: 'device-width' },
    openGraph: {
        type: 'website',
        title: 'Neurofeedback Platform by Rodrigo Quispe Avila',
        url: 'https://example-neurofeedback.com/',
        description: 'Innovadora plataforma de neurofeedback para modular la actividad cerebral en tiempo real mediante EEG no invasivo, destinada a mejorar funciones cognitivas y objetivos terapéuticos.',
        images: ['https://example-neurofeedback.com/social-image.png'], // Cambia esta URL a la de tu imagen real
        ttl: 604800
    },
    icons: {
        icon: '/favicon.ico'
    }
};

export default function AppLayout({ children }: AppLayoutProps) {
    return (
        <Layout>{children}</Layout>
    );
}