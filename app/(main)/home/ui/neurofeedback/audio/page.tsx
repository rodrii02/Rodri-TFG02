'use client'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useWavesurfer } from '@wavesurfer/react'
import TimelinePlugin from 'wavesurfer.js/dist/plugins/timeline.js'
import { Button } from 'primereact/button'
import WaveSurfer from 'wavesurfer.js'

const audioUrls = ['/layout/audio/OneRepublic_I_Aint_Worried.mp3']

const formatTime = (seconds: any) =>
  [seconds / 60, seconds % 60]
    .map((v) => `0${Math.floor(v)}`.slice(-2))
    .join(':')

const Audiopage = () => {
  const containerRef = useRef<HTMLDivElement | null>(null) // Contenedor de WaveSurfer principal
  const noiseContainerRef = useRef<HTMLDivElement | null>(null) // Contenedor para el ruido
  const [urlIndex, setUrlIndex] = useState(0) // Índice de la canción actual
  const [addNoise, setAddNoise] = useState(false) // Estado que controla si el ruido está activo
  const primaryColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--primary-color')
    .trim()
    const secondColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--second-color')
    .trim()
  const noiseColor = 'rgba(255, 0, 0, 0.3)' // Color del ruido

  const { wavesurfer, isPlaying, currentTime } = useWavesurfer({
    container: containerRef, // Contenedor para el WaveSurfer principal
    height: 150, // Altura de la onda
    waveColor: primaryColor, // Color de la onda principal
    progressColor: secondColor, // Color del progreso
    url: audioUrls[urlIndex], // URL del archivo de audio principal
    plugins: useMemo(() => [TimelinePlugin.create()], []), // Plugin de línea de tiempo
  })

  const noiseWaveSurferRef = useRef<WaveSurfer | null>(null) // Referencia al WaveSurfer del ruido
  const audioContextRef = useRef<AudioContext | null>(null) // Referencia al AudioContext
  const noiseGainRef = useRef<GainNode | null>(null) // Nodo Gain para controlar la intensidad del ruido
  const noiseBufferRef = useRef<AudioBuffer | null>(null) // Buffer de ruido blanco

  // Configura el AudioContext y genera el buffer de ruido
  useEffect(() => {
    if (wavesurfer && !audioContextRef.current) {
      const audioContext = new AudioContext()
      const mediaElement = wavesurfer.getMediaElement() // Elemento de audio principal

      // Crea un nodo de fuente para el audio principal
      const audioSource = audioContext.createMediaElementSource(mediaElement)

      // Crea un nodo Gain para controlar el volumen del audio
      const gainNode = audioContext.createGain()
      gainNode.gain.value = 1

      // Conecta el audio al GainNode y al destino
      audioSource.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // Configura el ruido
      const noiseGain = audioContext.createGain()
      noiseGain.gain.value = 0 // El ruido comienza desactivado
      noiseGain.connect(audioContext.destination)

      audioContextRef.current = audioContext
      noiseGainRef.current = noiseGain

      // Genera el buffer de ruido
      const duration = mediaElement.duration || 10 // Duración predeterminada si no está disponible
      const noiseBuffer = generateNoiseBuffer(audioContext, duration)
      noiseBufferRef.current = noiseBuffer

      // Configura WaveSurfer para el ruido
      noiseWaveSurferRef.current = WaveSurfer.create({
        container: noiseContainerRef.current!,
        height: 150, // Altura igual a la del WaveSurfer principal
        waveColor: noiseColor, // Color del ruido
        progressColor: 'rgba(255, 0, 0, 0.8)', // Progreso del ruido
      })

      // Genera un archivo WAV para el ruido y lo carga en el WaveSurfer del ruido
      const noiseUrl = generateNoiseFile(noiseBuffer, audioContext)
      noiseWaveSurferRef.current.load(noiseUrl)
    }
  }, [wavesurfer])

  // Genera un buffer de ruido blanco
  const generateNoiseBuffer = (audioContext: AudioContext, duration: number) => {
    const bufferSize = audioContext.sampleRate * duration // Tamaño del buffer basado en la duración
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate)
    const output = noiseBuffer.getChannelData(0)

    // Llena el buffer con valores aleatorios entre -1 y 1
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1
    }

    return noiseBuffer
  }

  // Genera un archivo WAV a partir del buffer de ruido
  const generateNoiseFile = (buffer: AudioBuffer, audioContext: AudioContext) => {
    const numOfChan = buffer.numberOfChannels
    const length = buffer.length * numOfChan * 2 + 44
    const bufferData = new ArrayBuffer(length)
    const view = new DataView(bufferData)

    // Encabezado WAV
    writeWAVHeader(view, buffer)

    // Datos PCM
    let offset = 44
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      const channel = buffer.getChannelData(i)
      for (let j = 0; j < channel.length; j++, offset += 2) {
        const sample = Math.max(-1, Math.min(1, channel[j]))
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true)
      }
    }

    return URL.createObjectURL(new Blob([bufferData], { type: 'audio/wav' }))
  }

  const writeWAVHeader = (view: DataView, buffer: AudioBuffer) => {
    const numOfChan = buffer.numberOfChannels
    const length = buffer.length * numOfChan * 2 + 44

    writeUTFBytes(view, 0, 'RIFF')
    view.setUint32(4, length - 8, true)
    writeUTFBytes(view, 8, 'WAVE')
    writeUTFBytes(view, 12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)
    view.setUint16(22, numOfChan, true)
    view.setUint32(24, buffer.sampleRate, true)
    view.setUint32(28, buffer.sampleRate * numOfChan * 2, true)
    view.setUint16(32, numOfChan * 2, true)
    view.setUint16(34, 16, true)
    writeUTFBytes(view, 36, 'data')
    view.setUint32(40, length - 44, true)
  }

  const writeUTFBytes = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }

  // Alterna el estado del ruido
  const toggleNoise = useCallback(() => {
    if (addNoise) {
      noiseWaveSurferRef.current?.pause()
      setAddNoise(false)
    } else {
      noiseWaveSurferRef.current?.play()
      setAddNoise(true)
    }
  }, [addNoise])

  return (
    <div className="card">
      {/* Visualización del audio principal */}
      <div ref={containerRef} style={{ marginBottom: '1em' }} />

      {/* Visualización del ruido */}
      <div ref={noiseContainerRef} />

      <p className="text-sm font-bold text-900 mb-3">
        Current time: {formatTime(currentTime)}
      </p>

      <div style={{ margin: '1em 0', display: 'flex', gap: '1em' }}>
        <Button onClick={() => setUrlIndex((index) => (index + 1) % audioUrls.length)}>Change audio</Button>
        <Button onClick={() => wavesurfer?.playPause()} style={{ minWidth: '5em' }}>
          {isPlaying ? 'Pause' : 'Play'}
        </Button>
        <Button onClick={toggleNoise} style={{ minWidth: '5em' }}>
          {addNoise ? 'Remove Noise' : 'Add Noise'}
        </Button>
      </div>
    </div>
  )
}

export default Audiopage
