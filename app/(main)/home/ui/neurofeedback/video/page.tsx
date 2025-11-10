'use client'

import React, { useContext, useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { classNames } from 'primereact/utils';
import { useInterval } from 'primereact/hooks';
import { LayoutContext } from '@/layout/context/layoutcontext';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Dialog } from 'primereact/dialog';
import { Chart } from 'primereact/chart';
import styles from './index.module.scss';

const VideoPage = () => {
    const { layoutState } = useContext(LayoutContext);
    const [blurLevel, setBlurLevel] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const [active, setActive] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [visible, setVisible] = useState(false);
    const blurHistoryRef = useRef<number[]>([]);
    const [blurHistory, setBlurHistory] = useState<number[]>([]);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useInterval(() => {
        const random = Math.random() * 4;
        setBlurLevel(random);
        blurHistoryRef.current.push(random);
        setSeconds((prev) => (prev === 59 ? 0 : prev + 1));
    }, 1000, active);

    const accept = () => {
        setVisible(true);
    };

    const reject = () => {
        setVisible(false);
    };

    const confirm1 = () => {
        confirmDialog({
            message: 'Quieres ver los resultados?',
            header: 'Confirmación',
            icon: 'pi pi-exclamation-triangle',
            defaultFocus: 'accept',
            accept,
            reject
        });
    };

    const toggleSession = () => {
        setActive(!active);
        if (active) {
            setBlurHistory([...blurHistoryRef.current]);
            confirm1();
        }
    };

    const resetSession = () => {
        setBlurLevel(0);
        setSeconds(0);
        setActive(false);
        blurHistoryRef.current = [];
        setBlurHistory([]);
    };

    const imageMaxWidth = layoutState.staticMenuDesktopInactive ? '65%' : '85%';

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
            <div className={classNames("flex flex-column align-items-center", styles.video)}>
                <div
                    className={classNames(styles['responsive-iframe'])}
                    style={{
                        width: '100%',
                        aspectRatio: '16/9',
                        maxWidth: windowWidth > 991 ? imageMaxWidth : undefined,
                        height: 'auto',
                        filter: `blur(${blurLevel}px)`,
                        transition: 'filter 0.5s ease, max-width 0.5s ease',
                        overflow: 'hidden',
                        borderRadius: '10px',
                    }}
                >
                    <iframe
                        width="100%"
                        height="100%"
                        src="https://www.youtube.com/embed/fOW8Y09GVek"
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ width: '100%', height: '100%' }}
                    ></iframe>
                </div>
                <div className="flex flex-column align-items-center">
                    <div className="mb-2 font-bold text-4xl">{seconds}</div>
                    <div className='flex gap-2'>
                        <Button className={classNames('w-8rem', { 'p-button-danger': active })}
                            onClick={toggleSession}
                            label={active ? 'Stop' : 'Resume'} />
                        <Button icon="pi pi-refresh" onClick={resetSession} />
                    </div>
                </div>
            </div>
            <ConfirmDialog />
            <Dialog header="Gráfico de desenfoque" visible={visible} style={{ width: '50vw' }} onHide={() => setVisible(false)}>
                <Chart type="line" data={chartData} options={chartOptions} />
            </Dialog>
        </div>
    );
};

export default VideoPage;
