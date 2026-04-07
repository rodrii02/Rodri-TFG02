"use client";

import React, { startTransition, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Image } from "primereact/image";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Chart } from "primereact/chart";
import { classNames } from "primereact/utils";
import { LayoutContext } from "@/layout/context/layoutcontext";
import styles from "./index.module.scss";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { useUnifiedConnection } from "@/service/UnifiedConnectionService";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

type ChartThemeColors = {
  primary: string;
  text: string;
  grid: string;
};

const getChartThemeFallback = (isDarkMode: boolean): ChartThemeColors => isDarkMode
  ? { primary: "#15548b", text: "#e8eff7", grid: "#1b2a3d" }
  : { primary: "#003865", text: "#4b5563", grid: "#dee2e6" };

const ImagePage = () => {
  const { layoutConfig, layoutState } = useContext(LayoutContext);
  const isDarkMode = layoutConfig.colorScheme === "dark";
  const [blurLevel, setBlurLevel] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(false);
  const [windowWidth, setWindowWidth] = useState<number | null>(null);

  const blurHistoryRef = useRef<number[]>([]);
  const [blurHistory, setBlurHistory] = useState<number[]>([]);
  const [chartColors, setChartColors] = useState<ChartThemeColors>(() => getChartThemeFallback(isDarkMode));

  const { lastMessage } = useUnifiedConnection();

  const toast = useRef<Toast>(null);

  // Función para aceptar o rechazar el diálogo de confirmación
  const accept = () => {
    setVisible(true);
  };

  const reject = () => {
    setVisible(false);
  };

  const confirm1 = () => {
    confirmDialog({
      message: "Quieres ver los resultados?",
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",
      defaultFocus: "accept",
      accept,
      reject,
    });
  };

  useEffect(() => {
    //Solo deben usarse dentro de useEffect o tras comprobar que estás en el cliente.

    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize(); // ← set inicial al montar
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // useInterval(() => {
  //     const random = Math.random() * 4;
  //     setBlurLevel(random);
  //     blurHistoryRef.current.push(random); // Guardar sin renderizar
  //     setSeconds((prev) => prev + 1);
  // }, 1000, active);

  useEffect(() => {
    if (!active || !lastMessage) return;

    try {
      const data = JSON.parse(lastMessage);
      if (typeof data.concentracion === "number") {
        // const value = Math.min(Math.max(data.concentracion, 0), 4); // Clamp 0-4
        startTransition(() => {
          setBlurLevel(data.concentracion);
          blurHistoryRef.current.push(data.concentracion); // Guardar en ref sin re-render
          setSeconds((prev) => prev + 1);
        });
      }
    } catch (error) {
      console.error("❌ Error procesando mensaje WS:", error);
    }
  }, [lastMessage, active]);

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

  const imageMaxWidth = layoutState.staticMenuDesktopInactive ? "55%" : "70%";

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const root = getComputedStyle(document.documentElement);

    startTransition(() => {
      setChartColors({
        primary: root.getPropertyValue("--primary-color").trim(),
        text: root.getPropertyValue("--text-color").trim(),
        grid: root.getPropertyValue("--surface-border").trim(),
      });
    });
  }, [isDarkMode]);

  const chartData = useMemo(() => ({
    labels: blurHistory.map((_, i) => `S${i + 1}`),
    datasets: [
      {
        label: "Nivel de Desenfoque",
        data: blurHistory,
        borderColor: chartColors.primary,
        backgroundColor: chartColors.primary,
        fill: false,
        tension: 0.3,
      },
    ],
  }), [blurHistory, chartColors.primary]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: chartColors.text } },
    },
    scales: {
      x: { ticks: { color: chartColors.text }, grid: { color: chartColors.grid } },
      y: { ticks: { color: chartColors.text }, grid: { color: chartColors.grid } },
    },
  }), [chartColors.grid, chartColors.text]);

  const exportToExcel = () => {
    const data = blurHistory.map((value, index) => ({
      Segundo: `S${index + 1}`,
      Desenfoque: value,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Imagen");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "resultados_imagen.xlsx");
  };

  return (
    <div className="card overflow-y" style={{ height: "calc(100vh - 9rem)" }}>
      <div
        className={classNames(
          "flex flex-column align-items-center",
          styles.image
        )}
      >
        <Image
          src="/layout/images/neurofeedback/imageCalm.jpeg"
          alt="Calm Image"
          width="100%"
          className={styles["responsive-image"]}
          style={{
            maxWidth:
              windowWidth && windowWidth > 991 ? imageMaxWidth : undefined,
            height: "auto",
            filter: `blur(${blurLevel}px)`,
            transition: "filter 0.5s ease, max-width 0.5s ease",
          }}
        />
        <div className="flex flex-column align-items-center">
          <div className="mb-2 font-bold text-4xl">{seconds}</div>
          <div className="flex gap-2">
            <Button
              className={classNames("w-8rem", { "p-button-danger": active })}
              onClick={toggleSession}
              label={active ? "Stop" : "Resume"}
            />
            <Button icon="pi pi-refresh" onClick={resetSession} />
          </div>
        </div>
      </div>

      <Toast ref={toast} />
      <ConfirmDialog />
      <Dialog
        header="Gráfico de desenfoque"
        visible={visible}
        style={{ width: "min(92vw, 900px)" }}
        breakpoints={{ "960px": "92vw", "641px": "96vw" }}
        onHide={() => {
          if (!visible) return;
          setVisible(false);
        }}
      >
        <div className="flex justify-content-end mb-3">
          <Button
            className="bg-primary"
            label="Exportar a Excel"
            icon="pi pi-file-excel"
            onClick={exportToExcel}
          />
        </div>
        <div style={{ width: "100%", height: "min(60vh, 420px)" }}>
          <Chart type="line" data={chartData} options={chartOptions} style={{ width: "100%", height: "100%" }} />
        </div>
      </Dialog>
    </div>
  );
};

export default ImagePage;
