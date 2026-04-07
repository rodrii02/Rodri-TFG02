'use client'

import React, { startTransition, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useWavesurfer } from '@wavesurfer/react';
import TimelinePlugin from 'wavesurfer.js/dist/plugins/timeline.js';
import { Button } from 'primereact/button';
import { ColorPicker } from 'primereact/colorpicker';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Dialog } from 'primereact/dialog';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { Chart } from 'primereact/chart';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { LayoutContext } from '@/layout/context/layoutcontext';

const audioUrls = ['/layout/audio/OneRepublic_I_Aint_Worried.mp3'];
type RgbColor = { r: number; g: number; b: number };
type AudioThemeColors = {
  primary: string;
  second: string;
  text: string;
  grid: string;
  canvas: string;
  wave: string;
};

const getAudioThemeFallback = (isDarkMode: boolean): AudioThemeColors => isDarkMode ? {
  primary: '#15548b',
  second: '#2c6fa8',
  text: '#e8eff7',
  grid: '#1b2a3d',
  canvas: '#0c1420',
  wave: '#ffffff',
} : {
  primary: '#003865',
  second: '#1b5a8c',
  text: '#4b5563',
  grid: '#dee2e6',
  canvas: '#ffffff',
  wave: '#003865',
};

const Audiopage = () => {
  const { layoutConfig } = useContext(LayoutContext);
  const isDarkMode = layoutConfig.colorScheme === 'dark';
  const [noiseHistory, setNoiseHistory] = useState<number[]>([]); // 📌 Guarda los valores de ruido
  const noiseHistoryRef = useRef<number[]>([]); // 📌 useRef para almacenar valores sin re-renderizar
  const toast = useRef<Toast>(null);
  const [visible, setVisible] = useState(false);
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


  const op = useRef<OverlayPanel>(null);
  const [colorRuido] = useState<RgbColor>({ r: 151, g: 18, b: 47 });
  const [themeColors, setThemeColors] = useState<AudioThemeColors>(() => getAudioThemeFallback(isDarkMode));

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const root = getComputedStyle(document.documentElement);

    startTransition(() => {
      setThemeColors({
        primary: root.getPropertyValue('--primary-color').trim(),
        second: root.getPropertyValue('--second-color').trim(),
        text: root.getPropertyValue('--text-color').trim(),
        grid: root.getPropertyValue('--surface-border').trim(),
        canvas: root.getPropertyValue('--surface-card').trim(),
        wave: isDarkMode ? '#ffffff' : root.getPropertyValue('--primary-color').trim(),
      });
    });
  }, [isDarkMode]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [addNoise, setAddNoise] = useState(false);
  const noiseLevelRef = useRef(0.5);

  const rgbToString = (color: RgbColor, alpha = 0.8) => `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;

  // Inicializamos Wavesurfer con las configuraciones necesarias
  const { wavesurfer } = useWavesurfer({
    container: containerRef,
    height: 150,
    waveColor: themeColors.second,
    progressColor: themeColors.primary,
    url: audioUrls[0],
    plugins: useMemo(() => {
      if (typeof document === 'undefined') return [];
      return [TimelinePlugin.create()];
    }, []),
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const noiseGainRef = useRef<GainNode | null>(null);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // 🔹 Separar los analizadores de audio y ruido
  const analyserAudioRef = useRef<AnalyserNode | null>(null); // Analiza la canción
  const analyserNoiseRef = useRef<AnalyserNode | null>(null); // Analiza el ruido blanco

  useEffect(() => {
    if (wavesurfer && !audioContextRef.current) {
      const audioContext = new AudioContext();
      const mediaElement = wavesurfer.getMediaElement();
      const audioSource = audioContext.createMediaElementSource(mediaElement);

      // 🔹 Analizador para la canción
      analyserAudioRef.current = audioContext.createAnalyser();
      analyserAudioRef.current.fftSize = 2048;
      audioSource.connect(analyserAudioRef.current);
      analyserAudioRef.current.connect(audioContext.destination);

      // 🔹 Analizador para el ruido
      analyserNoiseRef.current = audioContext.createAnalyser();
      analyserNoiseRef.current.fftSize = 2048;
      noiseGainRef.current = audioContext.createGain();
      noiseGainRef.current.gain.value = 0; // Iniciar con el ruido apagado
      noiseGainRef.current.connect(analyserNoiseRef.current);
      analyserNoiseRef.current.connect(audioContext.destination);

      audioContextRef.current = audioContext;
    }
  }, [wavesurfer]);

  // 🔹 Función para generar ruido blanco real
  const generateNoise = () => {
    if (!audioContextRef.current) return;

    const audioContext = audioContextRef.current;

    if (noiseSourceRef.current) {
      noiseSourceRef.current.stop();
      noiseSourceRef.current.disconnect();
    }

    noiseGainRef.current!.gain.value = noiseLevelRef.current;

    const bufferSize = audioContext.sampleRate * 2;
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * noiseLevelRef.current;
    }

    const noiseSource = audioContext.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    if (noiseGainRef.current) {
      noiseSource.connect(noiseGainRef.current);
      if (analyserNoiseRef.current) {
        noiseGainRef.current.connect(analyserNoiseRef.current); // 🔹 Conectar el ruido al analizador
      }
    }
    
    noiseSource.start();
    noiseSourceRef.current = noiseSource;
  };

  // 🔹 Dibujar la señal de la canción y el ruido
  useEffect(() => {
    if (!canvasRef.current || !analyserAudioRef.current || !analyserNoiseRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 600;
    canvas.height = 200;

    const bufferLength = analyserAudioRef.current.frequencyBinCount;
    const dataArrayAudio = new Uint8Array(bufferLength);
    const noiseDataArray = new Uint8Array(bufferLength);
    let animationFrameId: number;

    const draw = () => {
      animationFrameId = requestAnimationFrame(draw);

      ctx.fillStyle = themeColors.canvas;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      // 🔹 Dibujar la onda de la canción
      analyserAudioRef.current!.getByteTimeDomainData(dataArrayAudio);
      ctx.lineWidth = 2;
      ctx.strokeStyle = themeColors.wave;
      ctx.beginPath();

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArrayAudio[i] / 255.0;
        const y = canvas.height - v * canvas.height

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }
      ctx.stroke();

      // 🔹 Dibujar la onda del ruido
      if (addNoise) {
        analyserNoiseRef.current!.getByteTimeDomainData(noiseDataArray);
        ctx.strokeStyle = rgbToString(colorRuido);
        ctx.beginPath();
        x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = noiseDataArray[i] / 255.0;
          const y = canvas.height - v * canvas.height

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          x += sliceWidth;
        }
        ctx.stroke();
      }
    };

    draw();

    return () => cancelAnimationFrame(animationFrameId);
  }, [addNoise, colorRuido, themeColors.canvas, themeColors.wave]);

  const togglePlay = () => {
    if (!wavesurfer) return;

    if (isPlaying) {
      wavesurfer.pause();
      noiseGainRef.current!.gain.value = 0;
      setNoiseHistory([...noiseHistoryRef.current]);
      setAddNoise(false);
      // setVisible(true);
      confirm1()
    } else {
      wavesurfer.play();
      generateNoise();
      setAddNoise(true);
      noiseHistoryRef.current = []; // 🗑 Limpiar historial al iniciar
    }

    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    if (visible) {
      setNoiseHistory([...noiseHistoryRef.current]); // 🔹 Sincroniza cuando se abre el Dialog
    }
  }, [visible]);
  
  // 🔹 Cambiar el nivel de ruido dinámicamente cada segundo
  useEffect(() => {
    if (!addNoise || !noiseGainRef.current) return;

    const interval = setInterval(() => {
      const newNoiseLevel = Math.random() * (0.5 - 0.01) + 0.01; // Rango entre 0.01 y 0.5
      noiseLevelRef.current = newNoiseLevel;
      noiseGainRef.current!.gain.setValueAtTime(newNoiseLevel, audioContextRef.current!.currentTime);
      noiseHistoryRef.current.push(newNoiseLevel);

    }, 1000);

    return () => clearInterval(interval);
  }, [addNoise]);

  const chartData = useMemo(() => ({
    labels: noiseHistory.map((_, i) => `S ${i + 1}`),
    datasets: [
      {
        label: 'Nivel de Ruido',
        data: noiseHistory,
        borderColor: 'rgb(151, 18, 47)',
        backgroundColor: 'rgb(151, 18, 47)',
        fill: false,
        tension: 0.4,
      },
    ],
  }), [noiseHistory]);

  // 📊 **Opciones de la gráfica**
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: themeColors.text } },
    },
    scales: {
      x: { ticks: { color: themeColors.text }, grid: { color: themeColors.grid } },
      y: { ticks: { color: themeColors.text }, grid: { color: themeColors.grid } },
    },
  }), [themeColors.grid, themeColors.text]);

  const exportToExcel = () => {
    const data = noiseHistory.map((value, index) => ({
      Segundo: `Sec${index + 1}`,
      Ruido: value,
    }));
  
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ruido');
  
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'niveles_ruido.xlsx');
  };
  
  return (
    <div className="card overflow-y flex flex-column gap-2" style={{ height: 'calc(100vh - 9rem)' }}>
      <h4>Forma de onda de la canción</h4>
      <div ref={containerRef} />
      <div className='flex gap-2'>
        <h4>Espectrograma en tiempo real</h4>
        <div>
          <i className="pi pi-info-circle"
                  style={{ fontSize: '2rem', cursor: 'pointer', color: 'var(--primary-color)' }}
                  onMouseEnter={(e) => op.current?.show(e, e.currentTarget)} // Mostrar el ColorPicker al pasar el mouse
                  onMouseLeave={() => op.current?.hide()} // Ocultar cuando se retira el mouse
                />
        </div>
        <OverlayPanel ref={op}>
            <div className='flex align-items-center gap-2'>
              <ColorPicker format="rgb" value={colorRuido}/>
              <label>Este es el color del ruido</label>
            </div>
            <div className='flex align-items-center gap-2'>
              <ColorPicker format="hex" value={themeColors.wave}/>
              <label>Este es el color de la canción</label>
            </div>
        </OverlayPanel>
      </div>
      <canvas ref={canvasRef} style={{ marginBottom: '1em', border: '2px solid var(--primary-color)', width: '50%', borderRadius: '5px', height: '200px', background: 'var(--surface-card)' }} />

      <div className="flex gap-2">
        <Button onClick={togglePlay}>{isPlaying ? 'Stop' : 'Play'}</Button>
      </div>
      <Toast ref={toast} />
      <ConfirmDialog />
      <Dialog header="GRAFICO DE RUIDO" visible={visible} style={{ width: 'min(92vw, 900px)' }} breakpoints={{ '960px': '92vw', '641px': '96vw' }} onHide={() => {if (!visible) return; setVisible(false); }}>
        <div className="flex justify-content-end mt-3">
          <Button
            className='bg-primary'
            label="Exportar a Excel"
            icon="pi pi-file-excel"
            onClick={exportToExcel}
          />
        </div>
        <div style={{ width: '100%', height: 'min(60vh, 420px)' }}>
          <Chart type="line" data={chartData} options={chartOptions} style={{ width: '100%', height: '100%' }} />
        </div>

      </Dialog>
    </div>

  );
};

export default Audiopage;
