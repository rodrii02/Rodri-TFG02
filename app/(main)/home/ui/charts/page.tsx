// 'use client';

// import { useEffect, useState } from 'react';
// import { useWebSocket } from '@/demo/service/WebSocketService';
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
// } from 'chart.js';
// import { Bar } from 'react-chartjs-2';

// ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// const DIRECTIONS = ['arriba', 'abajo', 'izquierda', 'derecha'];

// type Direction = typeof DIRECTIONS[number];

// export default function VisualizacionWebSocket() {
//   const { lastMessage, isConnected, connect } = useWebSocket();

//   const [counts, setCounts] = useState<Record<Direction, number>>({
//     arriba: 0,
//     abajo: 0,
//     izquierda: 0,
//     derecha: 0,
//   });

//   // Escuchar nuevos mensajes
//   useEffect(() => {
//     if (!lastMessage) return;

//     try {
//       const data = JSON.parse(lastMessage);
//       const marker = data.marker as Direction;

//       if (['arriba', 'abajo', 'izquierda', 'derecha'].includes(marker)) {
//         setCounts(prev => ({
//           ...prev,
//           [marker]: prev[marker] + 1, // ✅ ahora TS está feliz
//         }));
//       }
//     } catch (e) {
//       console.error('Error parseando mensaje:', lastMessage);
//     }
//   }, [lastMessage]);

//   const chartData = {
//     labels: DIRECTIONS,
//     datasets: [
//       {
//         label: 'Frecuencia de movimiento',
//         data: DIRECTIONS.map((dir) => counts[dir]),
//         backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#AB47BC'],
//       },
//     ],
//   };

//   const chartOptions = {
//     responsive: true,
//     plugins: {
//       legend: {
//         position: 'top' as const,
//       },
//       title: {
//         display: true,
//         text: 'Movimientos recibidos por WebSocket',
//       },
//     },
//   };

//   return (
//     <div className="p-4">
//       <h2 className="text-2xl font-bold mb-4">Visualización de WebSocket</h2>

//       {!isConnected && <p className="text-red-500">⛔ No conectado al WebSocket</p>}
//       {isConnected && <p className="text-green-500">🟢 Conectado al WebSocket</p>}

//       <Bar data={chartData} options={chartOptions} />
//     </div>
//   );
// }

"use client";

import { startTransition, useContext, useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useUnifiedConnection } from "@/service/UnifiedConnectionService";
import "regenerator-runtime/runtime";
import { LayoutContext } from "@/layout/context/layoutcontext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

// Direcciones válidas
const DIRECTIONS = ["arriba", "abajo", "izquierda", "derecha"] as const;
type Direction = (typeof DIRECTIONS)[number];
type ChartThemeColors = {
  primary: string;
  text: string;
  grid: string;
};

const getChartThemeFallback = (isDarkMode: boolean): ChartThemeColors => isDarkMode
  ? { primary: "#15548b", text: "#e8eff7", grid: "#1b2a3d" }
  : { primary: "#003865", text: "#4b5563", grid: "#dee2e6" };

// 🔑 Labels MUTABLES para Chart.js
const DIRECTION_LABELS: string[] = [...DIRECTIONS];

export default function HorizontalGraphWebSocketPage() {
  const { layoutConfig } = useContext(LayoutContext);
  const isDarkMode = layoutConfig.colorScheme === "dark";
  const { lastMessage, isConnected, connectWebSocket } = useUnifiedConnection();

  const [points, setPoints] = useState<{ x: number; y: Direction }[]>([]);
  const [chartColors, setChartColors] = useState<ChartThemeColors>(() => getChartThemeFallback(isDarkMode));

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

  // 🔌 Conectar WebSocket
  useEffect(() => {
    if (!isConnected) {
      void connectWebSocket("ws://localhost:8001/ws");
    }
  }, [connectWebSocket, isConnected]);

  // 📡 Procesar mensajes
  useEffect(() => {
    if (!lastMessage) return;

    try {
      const data = JSON.parse(lastMessage);
      const direction = data.marker as Direction;

      if (DIRECTIONS.includes(direction)) {
        startTransition(() => {
          setPoints((prev) => [...prev, { x: prev.length + 1, y: direction }]);
        });
      }
    } catch (e) {
      console.error("Error parsing WS message", e);
    }
  }, [lastMessage]);

  const data = useMemo(() => ({
    datasets: [
      {
        label: "Direcciones",
        data: points,
        borderColor: chartColors.primary,
        backgroundColor: chartColors.primary,
        pointRadius: 4,
        tension: 0.2,
        showLine: true,
      },
    ],
  }), [chartColors.primary, points]);

  // ✅ Tipado correcto
  const options: ChartOptions<"line"> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,

    scales: {
      x: {
        type: "linear",
        title: {
          display: true,
          text: "Orden de llegada",
          color: chartColors.text,
        },
        ticks: {
          stepSize: 1,
          color: chartColors.text,
        },
        grid: {
          color: chartColors.grid,
        },
      },
      y: {
        type: "category",
        labels: DIRECTION_LABELS,
        title: {
          display: true,
          text: "Dirección",
          color: chartColors.text,
        },
        ticks: {
          color: chartColors.text,
        },
        grid: {
          color: chartColors.grid,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  }), [chartColors.grid, chartColors.text]);

  return (
    <div className="card overflow-y" style={{ height: "calc(100vh - 9rem)" }}>
      <div style={{ padding: 15, height: "100%", width: "100%" }}>
        <h2 className="mb-1">Señales EEG / WebSocket</h2>

        {!isConnected && (
          <p style={{ color: "red" }}>No conectado al WebSocket</p>
        )}

        <Line data={data} options={options} />
      </div>
    </div>
  );
}
