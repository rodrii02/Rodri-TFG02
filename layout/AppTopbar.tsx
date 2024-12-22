/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { classNames } from 'primereact/utils';
import React, { forwardRef, useContext, useEffect, useImperativeHandle, useRef } from 'react';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Tooltip } from 'primereact/tooltip'; // Importamos el Tooltip
import { AppTopbarRef } from '@/types';
import { LayoutContext } from './context/layoutcontext';
import { useNotion } from '@/demo/service/NotionService';
import { useRouter } from 'next/navigation';
import { useDeviceDialog } from './context/devicecontext';

const AppTopbar = forwardRef<AppTopbarRef>((props, ref) => {
    const { layoutConfig, layoutState, onMenuToggle, showProfileSidebar } = useContext(LayoutContext);
    const menubuttonRef = useRef(null);
    const topbarmenuRef = useRef(null);
    const topbarmenubuttonRef = useRef(null);
    const { logoutNotion, status, selectedDevice, notion } = useNotion(); // Obtener el estado del dispositivo
    const overlayPanelRef = useRef<OverlayPanel>(null); // Referencia para el OverlayPanel
    const { showDeviceDialog } = useDeviceDialog();
    const router = useRouter();

    const { state, charging, battery } = status || {};

    function logOut() {
        logoutNotion().then(() => {
            router.push("/login");
        });
    }
    
    const cloudColor = state === 'online' ? 'limegreen' : 'crimson';
    
    const handleMouseEnter = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (overlayPanelRef.current) {
            overlayPanelRef.current.show(event, event.currentTarget); // Mostrar el OverlayPanel
        }
    };
    
    const handleMouseLeave = () => {
        if (overlayPanelRef.current) {
            overlayPanelRef.current.hide(); // Ocultar el OverlayPanel
        }
    };
    
    useImperativeHandle(ref, () => ({
        menubutton: menubuttonRef.current,
        topbarmenu: topbarmenuRef.current,
        topbarmenubutton: topbarmenubuttonRef.current
    }));

    return (
        <div className="layout-topbar">
            <Link href="/" className="layout-topbar-logo">
                <img src={`/layout/images/logo.webp`} width="47.22px" height={'35px'} alt="logo" />
                <span>NEUROAPP</span>
            </Link>

            {/* Botón de navegación principal */}
            <button ref={menubuttonRef} type="button" className="p-link layout-menu-button layout-topbar-button" onClick={onMenuToggle}>
                <i className="pi pi-bars" />
            </button>

            {/* Botón de menú (tres puntitos) */}
            <button ref={topbarmenubuttonRef} type="button" className="p-link layout-topbar-menu-button layout-topbar-button" onClick={showProfileSidebar}>
                <i className="pi pi-ellipsis-v" />
            </button>

            <div ref={topbarmenuRef} className={classNames('layout-topbar-menu', { 'layout-topbar-menu-mobile-active': layoutState.profileSidebarVisible })}>
                <button type="button" className="p-link layout-topbar-button" 
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave} >
                    <i className="pi pi-user"></i>
                    <span>Configuración</span>
                </button>

                {/* OverlayPanel */}
                <OverlayPanel ref={overlayPanelRef}>
                    <div className="flex flex-column gap-2">
                        <div>
                            <h5 className='mb-0'>{selectedDevice? selectedDevice.deviceNickname: 'Unknown'}</h5>
                        </div>
                        <div className='flex align-items-center gap-2'>
                            <i className="pi pi-cloud" style={{ color: cloudColor}}/>
                            <span>
                                {state === "online" ? "Online" : "Offline"}
                                {charging ? " (Charging)" : ""}
                            </span>
                        </div>
                        <div className='flex align-items-center gap-2'>
                            <i className="pi pi-bolt"/>
                            <span>
                                {charging ? " (Charging)" : ""}
                                {battery ? `${battery}%` : ""}
                            </span>
                        </div>
                    </div>
                </OverlayPanel>

                <button type="button" className="p-link layout-topbar-button" onClick={showDeviceDialog}>
                    <i className="pi pi-cog"></i>
                    <span>Info</span>
                </button>

                <button type="button" className="p-link layout-topbar-button" onClick={logOut}>
                    <i className="pi pi-sign-out"></i>
                    <span>Log out</span>
                </button>
            </div>
        </div>
    );
});

AppTopbar.displayName = 'AppTopbar';

export default AppTopbar;
