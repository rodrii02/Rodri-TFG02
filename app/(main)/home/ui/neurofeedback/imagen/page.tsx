'use client'

import React, { useContext, useEffect, useRef, useState } from 'react';
import { Image } from 'primereact/image';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Chart } from 'primereact/chart';
import { useInterval } from 'primereact/hooks';
import { classNames } from 'primereact/utils';
import { LayoutContext } from '@/layout/context/layoutcontext';
import styles from './index.module.scss';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';

const ImagePage = () => {
    const { layoutState } = useContext(LayoutContext);
    const [blurLevel, setBlurLevel] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const [active, setActive] = useState(false);
    const [visible, setVisible] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    const blurHistoryRef = useRef<number[]>([]);
    const [blurHistory, setBlurHistory] = useState<number[]>([]);

    const toast = useRef<Toast>(null);
    
    // Función para aceptar o rechazar el diálogo de confirmación
    const accept = () => {
    setVisible(true);
    }

    const reject = () => {
    setVisible(false);
    }

    const confirm1 = () => {
        confirmDialog({
            message: 'Quieres ver los resultados?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            defaultFocus: 'accept',
            accept,
            reject
        });
    };

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useInterval(() => {
        const random = Math.random() * 4;
        setBlurLevel(random);
        blurHistoryRef.current.push(random); // Guardar sin renderizar
        setSeconds((prev) => prev + 1);
    }, 1000, active);

    const toggleSession = () => {
        setActive(!active);
        if (active) {
            // Al detener, actualiza el estado y muestra gráfico
            setBlurHistory([...blurHistoryRef.current]);
            confirm1();
            // setVisible(true);
        }
    };

    const resetSession = () => {
        setBlurLevel(0);
        setSeconds(0);
        setActive(false);
        blurHistoryRef.current = [];
        setBlurHistory([]);
    };

    const imageMaxWidth = layoutState.staticMenuDesktopInactive ? '55%' : '70%';

    const chartData = {
        labels: blurHistory.map((_, i) => `S${i + 1}`),
        datasets: [
            {
                label: 'Nivel de Desenfoque',
                data: blurHistory,
                borderColor: '#007ad9',
                backgroundColor: '#007ad9',
                fill: false,
                tension: 0.3,
            },
        ],
    };

    const chartOptions = {
        plugins: {
            legend: { labels: { color: '#000' } },
        },
        scales: {
            x: { ticks: { color: '#000' }, grid: { color: '#ddd' } },
            y: { ticks: { color: '#000' }, grid: { color: '#ddd' } },
        },
    };

    return (
        <div className="card overflow-y" style={{ height: 'calc(100vh - 9rem)' }}>
            <div className={classNames("flex flex-column align-items-center", styles.image)}>
                <Image
                    src="/layout/images/neurofeedback/imageCalm.jpeg"
                    alt="Calm Image"
                    width="100%"
                    className={styles['responsive-image']}
                    style={{
                        maxWidth: windowWidth > 991 ? imageMaxWidth : undefined,
                        height: 'auto',
                        filter: `blur(${blurLevel}px)`,
                        transition: 'filter 0.5s ease, max-width 0.5s ease',
                    }}
                />
                <div className="flex flex-column align-items-center">
                    <div className="mb-2 font-bold text-4xl">{seconds}</div>
                    <div className="flex gap-2">
                        <Button
                            className={classNames('w-8rem', { 'p-button-danger': active })}
                            onClick={toggleSession}
                            label={active ? 'Stop' : 'Resume'}
                        />
                        <Button icon="pi pi-refresh" onClick={resetSession} />
                    </div>
                </div>
            </div>

            <Toast ref={toast} />
            <ConfirmDialog />
            <Dialog header="Gráfico de desenfoque" visible={visible} style={{ width: '50vw' }} onHide={() => {if (!visible) return; setVisible(false); }}>
                <Chart type="line" data={chartData} options={chartOptions} />
            </Dialog>
        </div>
    );
};

export default ImagePage;
