'use client'
import React, { useContext, useEffect, useState } from 'react';
import { Image } from 'primereact/image';
import { Button } from 'primereact/button';
import { classNames } from 'primereact/utils';
import { useInterval } from 'primereact/hooks';
import { LayoutContext } from '@/layout/context/layoutcontext';


const ImagePage = () => {
    const { layoutConfig, layoutState} = useContext(LayoutContext)
    const [blurLevel, setBlurLevel] = useState(0); // Opacidad inicial de la imagen
    const [seconds, setSeconds] = useState(0);
    const [active, setActive] = useState(false);

    useInterval(
        () => {
            updateOpacity()
            setSeconds((prevSecond) => (prevSecond === 59 ? 0 : prevSecond + 1));
        },
        1000,
        active
    );

    const updateOpacity = () => {
        const randomNumber = Math.random() * 4; // Genera un número entre 0 y 4
        console.log("blurLevel", randomNumber)
        setBlurLevel(randomNumber); // Opacidad 1 si el número es bajo, 0.2 si no
    };

    const resetSeconds = () => {
        setBlurLevel(0)
        setSeconds(0)
        setActive(false)
    }

    // useEffect(() => {
    //     const imageMaxWidth = layoutState.staticMenuDesktopInactive ? '73%' : '63%';
    //     console.log(imageMaxWidth, layoutConfig, layoutState, "config")
    // })

    const imageMaxWidth = layoutState.staticMenuDesktopInactive ? '53%' : '65%';
    
    return (
        <div className="card overflow-y" style={{ height: 'calc(100vh - 9rem)'}}>
                <div className="flex flex-column align-items-center">
                    <Image
                        src="/layout/images/neurofeedback/imageCalm.jpeg" 
                        alt="Calm Image" 
                        width="100%"
                        style={{ 
                            maxWidth: '73%', 
                            height: 'auto',
                            filter: `blur(${blurLevel}px)`, // Aplica el desenfoque dinámico
                            transition: 'filter 0.5s ease' // Transición suave
                        }}
                    />
                    <div className="flex flex-column align-items-center">
                        <div className="mb-2 font-bold text-4xl">{seconds}</div>
                        <div className='flex gap-2'>
                            <Button className={classNames('w-8rem ', { 'p-button-danger': active })}
                                onClick={() => setActive(!active)} label={active ? 'Stop' : 'Resume'} />
                            <Button icon="pi pi-refresh" onClick={resetSeconds}/>
                        </div>
                    </div>
                </div>
        </div>
    );
}

export default ImagePage;
