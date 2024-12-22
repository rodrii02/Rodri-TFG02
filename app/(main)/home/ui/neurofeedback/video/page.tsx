'use client';

import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { classNames } from 'primereact/utils';
import { useInterval } from 'primereact/hooks';

const VideoPage = () => {
    const [blurLevel, setBlurLevel] = useState(0); // Nivel de desenfoque inicial
    const [seconds, setSeconds] = useState(0);
    const [active, setActive] = useState(false);

    useInterval(
        () => {
            updateBlur();
            setSeconds((prevSecond) => (prevSecond === 59 ? 0 : prevSecond + 1));
        },
        1000,
        active
    );

    const updateBlur = () => {
        const randomNumber = Math.random() * 4; // Genera un número entre 0 y 4 con decimales
        console.log('blurLevel', randomNumber);
        setBlurLevel(randomNumber); // Actualiza el nivel de desenfoque
    };

    const resetSeconds = () => {
        setBlurLevel(0);
        setSeconds(0);
        setActive(false);
    };

    return (
        <div className="card" style={{ height: 'calc(100vh - 9rem)' }}>
            <div className="flex flex-column align-items-center">
                <div
                    style={{
                        width: '100%',
                        maxWidth: '80%',
                        aspectRatio: '16/9',
                        filter: `blur(${blurLevel}px)`, // Aplica el desenfoque dinámico
                        transition: 'filter 0.5s ease', // Transición suave
                        overflow: 'hidden',
                        borderRadius: '10px', // Opcional: Bordes redondeados
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
                        style={{
                            pointerEvents: blurLevel > 0 ? 'none' : 'auto', // Desactiva interacción si está borroso
                        }}
                    ></iframe>
                </div>
                <div className="flex flex-column align-items-center">
                    <div className="mb-2 font-bold text-4xl">{seconds}</div>
                    <div className="flex gap-2">
                        <Button
                            className={classNames('w-8rem', { 'p-button-danger': active })}
                            onClick={() => setActive(!active)}
                            label={active ? 'Stop' : 'Resume'}
                        />
                        <Button icon="pi pi-refresh" onClick={resetSeconds} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPage;
