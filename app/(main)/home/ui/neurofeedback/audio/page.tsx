'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useWavesurfer } from '@wavesurfer/react'
import TimelinePlugin from 'wavesurfer.js/dist/plugins/timeline.js'
import { Button } from 'primereact/button'
import { Tooltip } from 'primereact/tooltip';
import { ColorPicker } from 'primereact/colorpicker'
import { OverlayPanel } from 'primereact/overlaypanel'
        

const audioUrls = ['/layout/audio/OneRepublic_I_Aint_Worried.mp3']

const Audiopage = () => {
  const op = useRef<OverlayPanel>(null); // Referencia para el OverlayPanel
  const [colorRuido, setColorRuido] = useState({ r: 151, g: 18, b: 47 });
  const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim()
  const secondColor = getComputedStyle(document.documentElement).getPropertyValue('--second-color').trim()

  // Referencia para almacenar el contenedor donde se renderizará Wavesurfer
  const containerRef = useRef<HTMLDivElement | null>(null)

  // Referencia para almacenar el canvas donde se dibujará el espectrograma
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Estado para controlar si el audio está en reproducción o en pausa
  const [isPlaying, setIsPlaying] = useState(false)

  // Estado para activar o desactivar la adición de ruido blanco al audio
  const [addNoise, setAddNoise] = useState(false)

  // Estado que almacena el nivel de ruido blanco que se aplicará al audio
  const [noiseLevel, setNoiseLevel] = useState(0.1)

  // Inicializamos Wavesurfer con las configuraciones necesarias
  const { wavesurfer } = useWavesurfer({
    container: containerRef, // Referencia al contenedor donde se renderizará Wavesurfer
    height: 150, // Altura de la onda de audio
    waveColor: secondColor, // Color de la onda de audio
    progressColor: primaryColor, // Color de la parte reproducida de la onda
    url: audioUrls[0], // URL del archivo de audio que se cargará
    plugins: useMemo(() => [TimelinePlugin.create()], []), // Agregamos el plugin de línea de tiempo
  })

  // Referencia para el contexto de audio, utilizado para manejar el procesamiento de audio
  const audioContextRef = useRef<AudioContext | null>(null)

  // Referencia para el nodo de ganancia, que controla el volumen del ruido blanco
  const noiseGainRef = useRef<GainNode | null>(null)

  // Referencia para la fuente de ruido blanco, que genera el sonido aleatorio
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null)

  // Referencia para el analizador de audio, que se usa para visualizar la onda del sonido en el canvas
  const analyserAudioRef = useRef<AnalyserNode | null>(null)

  // useEffect que se ejecuta cuando Wavesurfer está disponible
  useEffect(() => {
    // Si Wavesurfer está listo y aún no hemos inicializado el contexto de audio
    if (wavesurfer && !audioContextRef.current) {
      // Creamos un nuevo contexto de audio para manejar el procesamiento de sonido
      const audioContext = new AudioContext()

      // Obtenemos el elemento de audio desde Wavesurfer
      const mediaElement = wavesurfer.getMediaElement()

      // Creamos un nodo fuente de audio a partir del elemento de audio
      const audioSource = audioContext.createMediaElementSource(mediaElement)

      // Creamos un analizador de audio para visualizar la señal de sonido
      analyserAudioRef.current = audioContext.createAnalyser()
      // 2048 es un buen balance entre precisión y rendimiento.
      // Cuanto mayor es el valor, más detalle hay en las frecuencias, pero usa más CPU.
      // Cuanto menor, más rápida es la respuesta, pero con menos detalle.
      analyserAudioRef.current.fftSize = 2048 // Definimos la resolución del análisis FFT (Fast Fourier Transform)

      // Conectamos el nodo fuente al analizador de audio
      audioSource.connect(analyserAudioRef.current)

      // Conectamos el analizador al destino final (parlantes o audífonos)
      analyserAudioRef.current.connect(audioContext.destination)

      // Creamos un nodo de ganancia para manejar el volumen del ruido blanco
      noiseGainRef.current = audioContext.createGain()
      noiseGainRef.current.gain.value = 0 // Inicialmente el ruido está apagado

      // Conectamos el nodo de ganancia al destino final
      noiseGainRef.current.connect(audioContext.destination)

      // Guardamos la referencia del contexto de audio
      audioContextRef.current = audioContext
    }
  }, [wavesurfer]) // Se ejecuta cada vez que `wavesurfer` cambia

  // Función para generar ruido blanco y añadirlo al audio
  const generateNoise = () => {
    // Si el contexto de audio no está inicializado, salir de la función
    if (!audioContextRef.current) return

    // Obtener el contexto de audio
    const audioContext = audioContextRef.current

    // Si ya existe una fuente de ruido, detenerla antes de generar una nueva
    if (noiseSourceRef.current) {
      noiseSourceRef.current.stop() // Detiene la reproducción del ruido actual
      noiseSourceRef.current.disconnect() // Desconecta el nodo del contexto de audio
    }

    // 📢 Asegurar que el nodo de ganancia (volumen) del ruido esté configurado correctamente
    if (!noiseGainRef.current) {
      noiseGainRef.current = audioContext.createGain() // Crear un nodo de ganancia
      noiseGainRef.current.connect(audioContext.destination) // Conectarlo a la salida de audio
    }

    // 🔊 Ajustar el volumen del ruido blanco al nivel definido
    noiseGainRef.current.gain.value = noiseLevel

    // Determinar el tamaño del buffer para el ruido (2 segundos de duración)
    const bufferSize = audioContext.sampleRate * 2

    // Crear un buffer de audio con 1 canal, duración `bufferSize`, y la frecuencia de muestreo del contexto
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate)

    // Obtener el canal de datos del buffer para llenarlo con ruido aleatorio
    const output = noiseBuffer.getChannelData(0)

    // 🎵 Generar ruido blanco aleatorio llenando el buffer con valores entre -1 y 1
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * noiseLevel
    }

    // Crear una fuente de audio para reproducir el buffer de ruido
    const noiseSource = audioContext.createBufferSource()
    noiseSource.buffer = noiseBuffer // Asignar el buffer de ruido
    noiseSource.loop = true // Hacer que el ruido se reproduzca en bucle

    // Conectar la fuente de ruido al nodo de ganancia para controlar su volumen
    noiseSource.connect(noiseGainRef.current)

    // 📢 Iniciar la reproducción del ruido blanco
    noiseSource.start()

    // Guardar la referencia de la fuente de ruido para poder detenerla después si es necesario
    noiseSourceRef.current = noiseSource
  }

  // useEffect que dibuja la onda del audio en un canvas y agrega ruido blanco si está activado
  useEffect(() => {
    // Si el canvas o el analizador de audio no están disponibles, salir de la función
    if (!canvasRef.current || !analyserAudioRef.current) return

    // Obtener la referencia del canvas donde se dibujará la visualización
    const canvas = canvasRef.current

    // Obtener el contexto 2D del canvas para poder dibujar
    const ctx = canvas.getContext('2d')

    // Si no se pudo obtener el contexto, salir de la función
    if (!ctx) return

    // Definir el tamaño del canvas
    canvas.width = 600
    canvas.height = 200

    // Obtener la cantidad de datos que el analizador de audio va a devolver
    const bufferLength = analyserAudioRef.current.frequencyBinCount

    // Crear un array para almacenar los datos del dominio del tiempo (la forma de onda)
    const dataArrayAudio = new Uint8Array(bufferLength)

    // Función que dibuja la visualización en el canvas
    const draw = () => {
      // Llamar a esta función en el siguiente frame de animación para hacer que el dibujo sea dinámico
      requestAnimationFrame(draw)

      // Obtener los datos de la onda de audio en tiempo real
      analyserAudioRef.current!.getByteTimeDomainData(dataArrayAudio)

      // Limpiar el canvas y establecer el fondo en negro
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Determinar el ancho de cada segmento de la onda a dibujar
      let sliceWidth = canvas.width / bufferLength
      let x = 0

      // Configurar el color y grosor de la línea de la onda de audio
      ctx.lineWidth = 2
      ctx.strokeStyle = primaryColor // Color verde
      ctx.beginPath()

      // Recorrer los datos del audio y dibujar la onda en el canvas
      for (let i = 0; i < bufferLength; i++) {
        // Normalizar los valores para ajustarlos al tamaño del canvas
        let v = dataArrayAudio[i] / 255.0
        let y = canvas.height - v * canvas.height

        // Dibujar la línea de la onda
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }

        x += sliceWidth
      }

      ctx.stroke() // Finalizar el dibujo de la onda de audio

      // 🔹 Si el ruido blanco está activado, dibujarlo encima de la onda
      if (addNoise) {
        x = 0
        ctx.strokeStyle = rgbToString(colorRuido) // Rojo con 50% de transparencia
        ctx.beginPath()

        for (let i = 0; i < bufferLength; i++) {
          // Generar valores aleatorios para simular el ruido blanco
          let randomNoise = (Math.random() * 2 - 1) * noiseLevel
          let y = canvas.height - ((randomNoise + 1) / 2) * canvas.height

          // Dibujar el ruido como una línea encima de la onda de audio
          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }

          x += sliceWidth
        }

        ctx.stroke() // Finalizar el dibujo del ruido blanco
      }
    }

    draw() // Iniciar la animación de la visualización
  }, [addNoise, noiseLevel]) // Se vuelve a ejecutar cuando cambia `addNoise` o `noiseLevel`


  useEffect(() => {
    if (!addNoise || !noiseGainRef.current) return

    const interval = setInterval(() => {
      const newNoiseLevel = Math.random() * (0.5 - 0.01) + 0.01
      setNoiseLevel(newNoiseLevel)
      noiseGainRef.current!.gain.setValueAtTime(newNoiseLevel, audioContextRef.current!.currentTime)
    }, 1000)

    return () => clearInterval(interval)
  }, [addNoise])

  const togglePlay = () => {
    if (!wavesurfer) return

    if (isPlaying) {
      wavesurfer.pause()
      noiseGainRef.current!.gain.value = 0
      setAddNoise(false)
    } else {
      wavesurfer.play()
      generateNoise() // 🔊 Asegurar que el ruido también se reproduzca
      setAddNoise(true)
    }

    setIsPlaying(!isPlaying)
  }

  const rgbToString = (color: any) => `rgb(${color.r}, ${color.g}, ${color.b}, 0.8)`;



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
    </div>
  )
}

export default Audiopage
