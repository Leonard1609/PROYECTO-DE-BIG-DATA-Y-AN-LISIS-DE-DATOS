import React, { useRef, useState, useEffect } from 'react';

interface CameraStreamProps {
  onCapture: (imageBlob: Blob) => void;
  isProcessing: boolean;
  mode: 'register' | 'verify';
}

export const CameraStream: React.FC<CameraStreamProps> = ({ onCapture, isProcessing, mode }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [streamActive, setStreamActive] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setErrorMsg(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreamActive(true);
      }
    } catch (err) {
      setErrorMsg('No se pudo acceder a la cámara. Revisa los permisos del navegador.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      setStreamActive(false);
    }
  };

  const handleTakeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          onCapture(blob);
        }
      }, 'image/jpeg');
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col h-full justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className={`h-3 w-3 rounded-full ${streamActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <h2 className="text-lg font-semibold text-white">Transmisión de Cámara</h2>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-cyan-950 text-cyan-400 border border-cyan-800">
            {mode === 'register' ? 'Modo Enrolamiento' : 'Modo Verificación'}
          </span>
        </div>

        <div className="relative aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
          {errorMsg ? (
            <div className="text-center p-4">
              <p className="text-rose-400 text-sm mb-3">{errorMsg}</p>
              <button
                onClick={startCamera}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-lg transition"
              >
                Reintentar
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
              {/* Máscara guía visual para encuadre facial */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center border-2 border-dashed border-cyan-500/30 rounded-2xl m-8">
                <div className="w-48 h-64 border-2 border-cyan-400/70 rounded-full flex flex-col justify-between py-6 items-center">
                  <div className="w-full flex justify-around px-6">
                    <div className="w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
                    <div className="w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
                  </div>
                  <div className="w-2 h-2 bg-cyan-400/50 rounded-full" />
                  <div className="w-10 h-1 bg-cyan-400/50 rounded-full" />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div className="mt-5 flex gap-3">
        <button
          onClick={handleTakeSnapshot}
          disabled={!streamActive || isProcessing}
          className="flex-1 py-3 px-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-medium rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/50"
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>Procesando en Azure...</span>
            </>
          ) : (
            <span>{mode === 'register' ? 'Capturar para Registro' : 'Verificar Coincidencia'}</span>
          )}
        </button>
      </div>
    </div>
  );
};