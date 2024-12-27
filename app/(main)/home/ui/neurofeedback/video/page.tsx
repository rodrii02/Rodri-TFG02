'use client'
import React, { useContext, useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { classNames } from 'primereact/utils';
import { useInterval } from 'primereact/hooks';
import { LayoutContext } from '@/layout/context/layoutcontext';
import styles from './index.module.scss';

const ImagePage = () => {
    const { layoutState } = useContext(LayoutContext);
    const [blurLevel, setBlurLevel] = useState(0); // Opacidad inicial de la imagen
    const [seconds, setSeconds] = useState(0);
    const [active, setActive] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useInterval(
        () => {
            updateOpacity();
            setSeconds((prevSecond) => (prevSecond === 59 ? 0 : prevSecond + 1));
        },
        1000,
        active
    );

    const updateOpacity = () => {
        const randomNumber = Math.random() * 4; // Genera un número entre 0 y 4
        console.log("blurLevel", randomNumber);
        setBlurLevel(randomNumber); // Opacidad 1 si el número es bajo, 0.2 si no
    };

    const resetSeconds = () => {
        setBlurLevel(0);
        setSeconds(0);
        setActive(false);
    };

    const imageMaxWidth = layoutState.staticMenuDesktopInactive ? '65%' : '85%';

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
                        filter: `blur(${blurLevel}px)`, // Aplica el desenfoque dinámico
                        transition: 'filter 0.5s ease, max-width 0.5s ease', // Transición suave
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
                            onClick={() => setActive(!active)} label={active ? 'Stop' : 'Resume'} />
                        <Button icon="pi pi-refresh" onClick={resetSeconds} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImagePage;