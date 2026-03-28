"use client";
import "regenerator-runtime/runtime";

/* eslint-disable @next/next/no-img-element */
import { classNames } from "primereact/utils";
import React, {
  forwardRef,
  useContext,
  useImperativeHandle,
  useRef,
} from "react";
import { OverlayPanel } from "primereact/overlaypanel";
import { LayoutContext } from "./context/layoutcontext";
import { useRouter } from "next/navigation";
import { useUnifiedConnection } from "@/service/UnifiedConnectionService";
import { useDeviceDialog } from "@/service/devicecontext";

const AppTopbar = forwardRef<any>((_, ref) => {
  const { layoutState, onMenuToggle, showProfileSidebar } =
    useContext(LayoutContext);
  const menubuttonRef = useRef(null);
  const topbarmenuRef = useRef(null);
  const topbarmenubuttonRef = useRef(null);

  const {
    info,
    disconnectWebSocket,
    logoutCrown,
  } = useUnifiedConnection();
  const { showDeviceDialog } = useDeviceDialog();

  const overlayPanelRef = useRef<OverlayPanel>(null); // Referencia para el OverlayPanel
  // const { showDeviceDialog } = useDeviceDialog();
  const router = useRouter();

  const cloudColor = info.stateContext === "online" ? "limegreen" : "crimson";
  
  function logOut() {
    if (info.mode === "crown") {
      // 🔒 Si es Crown, cerrar sesión de Notion
      logoutCrown().then(() => {
        router.push("/");
      });
    } else {
      disconnectWebSocket()
      router.push("/");
    }
  }
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
    topbarmenubutton: topbarmenubuttonRef.current,
  }));

  return (
    <div className="layout-topbar">
      <a className="layout-topbar-logo">
        <img src={`/layout/images/HeaderLogoSF.svg`} alt="logo" />
        {/* <span>NEUROAPP</span> */}
      </a>

      {/* Botón de navegación principal */}
      <button
        ref={menubuttonRef}
        type="button"
        className="p-link layout-menu-button layout-topbar-button"
        onClick={onMenuToggle}
      >
        <i className="pi pi-bars" />
      </button>

      {/* Botón de menú (tres puntitos) */}
      <button
        ref={topbarmenubuttonRef}
        type="button"
        className="p-link layout-topbar-menu-button layout-topbar-button"
        onClick={showProfileSidebar}
      >
        <i className="pi pi-ellipsis-v" />
      </button>

      <div
        ref={topbarmenuRef}
        className={classNames("layout-topbar-menu", {
          "layout-topbar-menu-mobile-active": layoutState.profileSidebarVisible,
        })}
      >
        {/* <Button
          icon="pi pi-sign-out"
          label="Cambiar Modo"
          onClick={handleChangeMode}
        /> */}

        <button
          type="button"
          className="p-link layout-topbar-button"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <i className="pi pi-user"></i>
          <span>Configuración</span>
        </button>

        {/* OverlayPanel */}
        <OverlayPanel ref={overlayPanelRef}>
          <div className="flex flex-column gap-2">
            <div>
              <h5 className="mb-0">
                {info.selectedDeviceContext ? info.selectedDeviceContext : "Unknown"}
              </h5>
            </div>
            <div className="flex align-items-center gap-2">
              <i className="pi pi-cloud" style={{ color: cloudColor }} />
              <span>
                {info.stateContext === "online" ? "Online" : "Offline"}
                {info.charging ? " (Charging)" : ""}
              </span>
            </div>
            {info.mode === "crown" && (
              <div className="flex align-items-center gap-2">
                <i className="pi pi-bolt" />
                <span>
                  {info.charging ? " (Charging)" : ""}
                  {info.battery ? `${info.battery}%` : ""}
                </span>
              </div>
            )}
          </div>
        </OverlayPanel>

        {info.mode === "crown" && (
          <button
            type="button"
            className="p-link layout-topbar-button"
            onClick={showDeviceDialog}
          >
            <i className="pi pi-cog"></i>
            <span>{info.selectedDeviceContext ?? "Dispositivo"}</span>
          </button>
        )}

        <button
          type="button"
          className="p-link layout-topbar-button"
          onClick={logOut} 
        > 
        <i className="pi pi-sign-out"></i>
          <span>Log out</span>
        </button>
      </div>
    </div>
  );
});

AppTopbar.displayName = "AppTopbar";

export default AppTopbar;
