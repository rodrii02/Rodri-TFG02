'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useWavesurfer } from '@wavesurfer/react';
import TimelinePlugin from 'wavesurfer.js/dist/plugins/timeline.js';
import { Button } from 'primereact/button';
import { ColorPicker } from 'primereact/colorpicker';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Dialog } from 'primereact/dialog';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { ChartData, ChartOptions } from 'chart.js';
import { Chart } from 'primereact/chart';

const audioUrls = ['/layout/audio/OneRepublic_I_Aint_Worried.mp3'];

const Audiopage = () => {
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
  const [colorRuido, setColorRuido] = useState({ r: 151, g: 18, b: 47 });

  const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
  const secondColor = getComputedStyle(document.documentElement).getPropertyValue('--second-color').trim();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [addNoise, setAddNoise] = useState(false);
  const [noiseLevel, setNoiseLevel] = useState(0.5);

  // Inicializamos Wavesurfer con las configuraciones necesarias
  const { wavesurfer } = useWavesurfer({
    container: containerRef,
    height: 150,
    waveColor: secondColor,
    progressColor: primaryColor,
    url: audioUrls[0],
    plugins: useMemo(() => [TimelinePlugin.create()], []),
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

    noiseGainRef.current!.gain.value = noiseLevel;

    const bufferSize = audioContext.sampleRate * 2;
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * noiseLevel;
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

    const draw = () => {
      requestAnimationFrame(draw);

      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      let sliceWidth = canvas.width / bufferLength;
      let x = 0;

      // 🔹 Dibujar la onda de la canción
      analyserAudioRef.current!.getByteTimeDomainData(dataArrayAudio);
      ctx.lineWidth = 2;
      ctx.strokeStyle = primaryColor;
      ctx.beginPath();

      for (let i = 0; i < bufferLength; i++) {
        let v = dataArrayAudio[i] / 255.0;
        let y = canvas.height - v * canvas.height

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
          let v = noiseDataArray[i] / 255.0;
          let y = canvas.height - v * canvas.height

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
  }, [addNoise, noiseLevel]);

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
      setNoiseLevel(newNoiseLevel);
      noiseGainRef.current!.gain.setValueAtTime(newNoiseLevel, audioContextRef.current!.currentTime);
      console.log('Nivel de ruido:', newNoiseLevel);
      noiseHistoryRef.current.push(newNoiseLevel);

    }, 1000);

    return () => clearInterval(interval);
  }, [addNoise, visible]);

  const chartData = {
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
  };

  // 📊 **Opciones de la gráfica**
  const chartOptions = {
    plugins: {
      legend: { labels: { color: '#000' } },
    },
    scales: {
      x: { ticks: { color: '#000' }, grid: { color: '#ddd' } },
      y: { ticks: { color: '#000' }, grid: { color: '#ddd' } },
    },
  };

  const rgbToString = (color: any, alpha = 0.8) => `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;

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
              <ColorPicker format="hex" value={primaryColor}/>
              <label>Este es el color de la canción</label>
            </div>
        </OverlayPanel>
      </div>
      <canvas ref={canvasRef} style={{ marginBottom: '1em', border: '2px solid var(--primary-color)', width: '50%', borderRadius: '5px', height: '200px'}} />

      <div className="flex gap-2">
        <Button onClick={togglePlay}>{isPlaying ? 'Stop' : 'Play'}</Button>
      </div>
      <Toast ref={toast} />
      <ConfirmDialog />
      <Dialog header="GRAFICO DE RUIDO" visible={visible} style={{ width: '50vw' }} onHide={() => {if (!visible) return; setVisible(false); }}>
        <Chart type="line" data={chartData} options={chartOptions}></Chart>
      </Dialog>
    </div>

  );
};

export default Audiopage;
