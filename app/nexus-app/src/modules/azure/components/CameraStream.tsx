import React, { useRef, useEffect } from 'react';
import { Target, Power, AlertCircle, Clock, Scan, UserPlus, Save, RotateCcw, Lock, ToggleRight, ToggleLeft, ShieldAlert, Trash2, Camera } from 'lucide-react';

// Declaración para extender la interfaz de Window y silenciar los errores ts(2339)
declare global {
  interface Window {
    FaceMesh?: any;
    Camera?: any;
  }
}

interface CameraStreamProps {
  camaraActiva: boolean;
  setCamaraActiva: (val: boolean) => void;
  rostroCentrado: boolean;
  setRostroCentrado: (val: boolean) => void;
  usandoMediaPipe: boolean;
  setUsandoMediaPipe: (val: boolean) => void;
  analizandoAcceso: boolean;
  registrando: boolean;
  temporizador: number;
  usuarioRegistrado: boolean;
  nombreUsuario: string;
  setNombreUsuario: (val: string) => void;
  registroListoParaGuardar: boolean;
  toggleAcceso: boolean;
  userRole?: string;
  onIniciarEscaneo: () => void;
  onGuardarRegistro: () => void;
  onReintentarRegistro: () => void;
  onToggleAcceso: () => void;
  onAbrirModalBorrar: () => void;
}

export const CameraStream: React.FC<CameraStreamProps> = ({
  camaraActiva,
  setCamaraActiva,
  rostroCentrado,
  setRostroCentrado,
  usandoMediaPipe,
  setUsandoMediaPipe,
  analizandoAcceso,
  registrando,
  temporizador,
  usuarioRegistrado,
  nombreUsuario,
  setNombreUsuario,
  registroListoParaGuardar,
  toggleAcceso,
  userRole,
  onIniciarEscaneo,
  onGuardarRegistro,
  onReintentarRegistro,
  onToggleAcceso,
  onAbrirModalBorrar
}) => {
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const faceMeshRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const isDestroyedRef = useRef<boolean>(false);

  const strokeColor = !rostroCentrado
    ? '#f59e0b'
    : analizandoAcceso
    ? '#38bdf8'
    : registrando
    ? '#22c55e'
    : '#34d399';

  const strokeColorRef = useRef<string>(strokeColor);
  useEffect(() => {
    strokeColorRef.current = strokeColor;
  }, [strokeColor]);

  useEffect(() => {
    isDestroyedRef.current = false;

    if (!camaraActiva) {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
      return;
    }

    const cargarMediaPipe = async () => {
      try {
        if (!window.FaceMesh) {
          await new Promise<void>((resolve, reject) => {
            if (document.querySelector('script[src*="camera_utils"]')) {
              const check = setInterval(() => { if (window.Camera) { clearInterval(check); resolve(); } }, 50);
              return;
            }
            const script1 = document.createElement('script');
            script1.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js';
            script1.crossOrigin = 'anonymous';
            script1.onload = () => resolve();
            script1.onerror = reject;
            document.body.appendChild(script1);
          });

          await new Promise<void>((resolve, reject) => {
            if (document.querySelector('script[src*="face_mesh"]')) {
              const check = setInterval(() => { if (window.FaceMesh) { clearInterval(check); resolve(); } }, 50);
              return;
            }
            const script2 = document.createElement('script');
            script2.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js';
            script2.crossOrigin = 'anonymous';
            script2.onload = () => resolve();
            script2.onerror = reject;
            document.body.appendChild(script2);
          });
        }

        if (isDestroyedRef.current) return;

        if (window.FaceMesh && videoElementRef.current && canvasRef.current) {
          const faceMeshInstance = new window.FaceMesh({
            locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
          });

          faceMeshInstance.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
          });

          faceMeshInstance.onResults((results: any) => {
            if (isDestroyedRef.current) return;
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            ctx.save();
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
              setRostroCentrado(true);
              setUsandoMediaPipe(true);

              const landmarks = results.multiFaceLandmarks[0];
              const w = canvas.width;
              const h = canvas.height;

              ctx.strokeStyle = strokeColorRef.current;
              ctx.lineWidth = 1;
              ctx.globalAlpha = 0.75;

              const indicesMalla = [
                [10, 338], [338, 297], [297, 332], [332, 284], [284, 251], [251, 389], [389, 356], [356, 454], [454, 323], [323, 361], [361, 288], [288, 397], [397, 365], [365, 379], [379, 378], [378, 400], [400, 377], [377, 152], [152, 148], [148, 176], [176, 149], [149, 150], [150, 136], [136, 172], [172, 58], [58, 132], [132, 93], [93, 234], [234, 127], [127, 162], [162, 21], [21, 54], [54, 103], [103, 67], [67, 109], [109, 10],
                [70, 63], [63, 105], [105, 66], [66, 107], [336, 296], [296, 334], [334, 293], [293, 300],
                [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246, 33],
                [263, 249, 390, 373, 374, 380, 381, 382, 362, 398, 384, 385, 386, 387, 388, 466, 263],
                [168, 6], [6, 197], [197, 195], [195, 5], [5, 4], [4, 1], [1, 19], [19, 94], [94, 2],
                [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95, 185, 61],
                [130, 247], [247, 30], [30, 29], [29, 27], [27, 28], [28, 56], [56, 190], [359, 467], [467, 260], [260, 259], [259, 257], [257, 258], [258, 286], [286, 414]
              ];

              indicesMalla.forEach((linea: number[]) => {
                ctx.beginPath();
                for (let i = 0; i < linea.length - 1; i++) {
                  const pt1 = landmarks[linea[i]];
                  const pt2 = landmarks[linea[i + 1]];
                  if (pt1 && pt2) {
                    ctx.moveTo((1 - pt1.x) * w, pt1.y * h);
                    ctx.lineTo((1 - pt2.x) * w, pt2.y * h);
                  }
                }
                ctx.stroke();
              });

              const puntosClave = [4, 33, 263, 61, 291, 152, 10, 151, 197, 172, 397];
              ctx.fillStyle = strokeColorRef.current;
              ctx.globalAlpha = 1.0;
              puntosClave.forEach((idx) => {
                const pt = landmarks[idx];
                if (pt) {
                  ctx.beginPath();
                  ctx.arc((1 - pt.x) * w, pt.y * h, 3.5, 0, 2 * Math.PI);
                  ctx.fill();
                }
              });
            } else {
              setRostroCentrado(false);
            }
            ctx.restore();
          });

          faceMeshRef.current = faceMeshInstance;

          if (window.Camera && videoElementRef.current) {
            const cameraInstance = new window.Camera(videoElementRef.current, {
              onFrame: async () => {
                if (!isDestroyedRef.current && videoElementRef.current && faceMeshRef.current) {
                  try {
                    await faceMeshRef.current.send({ image: videoElementRef.current });
                  } catch {}
                }
              },
              width: 1280,
              height: 720
            });
            cameraRef.current = cameraInstance;
            cameraInstance.start();
          }
        }
      } catch {
        if (!isDestroyedRef.current) {
          setUsandoMediaPipe(false);
          navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } })
            .then((stream) => {
              if (isDestroyedRef.current) return;
              mediaStreamRef.current = stream;
              if (videoElementRef.current) {
                videoElementRef.current.srcObject = stream;
              }
            })
            .catch(() => setCamaraActiva(false));
        }
      }
    };

    cargarMediaPipe();

    return () => {
      isDestroyedRef.current = true;
      if (cameraRef.current) cameraRef.current.stop();
      if (faceMeshRef.current) faceMeshRef.current.close();
    };
  }, [camaraActiva]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${camaraActiva ? (rostroCentrado ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-ping') : 'bg-rose-500'}`} />
            <h2 className="font-semibold text-slate-200">Transmisión de Cámara & Tracking 3D</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setRostroCentrado(!rostroCentrado)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition border ${
                rostroCentrado 
                  ? 'bg-slate-800 text-emerald-400 border-emerald-500/30 hover:bg-slate-700' 
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              {rostroCentrado ? 'Rostro Centrado (OK)' : 'Rostro Descentrado'}
            </button>

            <button
              onClick={() => setCamaraActiva(!camaraActiva)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                camaraActiva 
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30' 
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              {camaraActiva ? 'Desactivar Cámara' : 'Activar Cámara'}
            </button>
          </div>
        </div>

        <div className="relative w-full aspect-video bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center">
          {camaraActiva ? (
            <>
              <video
                ref={videoElementRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />

              <canvas
                ref={canvasRef}
                width={1280}
                height={720}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />

              {!rostroCentrado && (
                <div className="absolute inset-x-0 bottom-4 mx-auto w-11/12 bg-amber-950/90 border border-amber-500 text-amber-200 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xl backdrop-blur-md">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
                  <span>Rostro fuera de encuadre. Acorate frente a la cámara para ajustar la malla.</span>
                </div>
              )}

              {analizandoAcceso && rostroCentrado && (
                <div className="absolute top-3 right-3 bg-slate-900/90 border border-amber-500/40 text-amber-300 px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-2 shadow-lg">
                  <Clock className="w-4 h-4 animate-spin text-amber-400" />
                  Analizando en vivo: {temporizador}s
                </div>
              )}

              <div className="absolute top-3 left-3 bg-slate-900/80 border border-slate-700 text-slate-300 px-2.5 py-1 rounded text-[11px] font-mono flex items-center gap-1.5">
                <Scan className="w-3.5 h-3.5 text-cyan-400" />
                {usandoMediaPipe ? 'MediaPipe Dynamic Mesh (468 Puntos)' : 'Malla Proporcional SVG HD'}
              </div>
            </>
          ) : (
            <div className="text-center p-6 text-slate-500">
              <Camera className="w-12 h-12 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-semibold">La cámara está desactivada</p>
              <p className="text-xs text-slate-600 mt-1">Active la transmisión para habilitar el reconocimiento biométrico</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-800">
        {!usuarioRegistrado ? (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Área de Texto: Nombre o ID de Usuario a Registrar
              </label>
              <input
                type="text"
                placeholder="Ej: Juan Pérez / ID-8821"
                value={nombreUsuario}
                onChange={(e) => setNombreUsuario(e.target.value)}
                disabled={registrando || registroListoParaGuardar || !camaraActiva}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 disabled:opacity-50"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              {!registroListoParaGuardar ? (
                <button
                  disabled={!camaraActiva || registrando || !rostroCentrado}
                  onClick={onIniciarEscaneo}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-xs transition ${
                    !camaraActiva
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                      : !rostroCentrado
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 cursor-not-allowed'
                      : registrando
                      ? 'bg-cyan-500 text-slate-950 animate-pulse'
                      : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  {!camaraActiva
                    ? 'CÁMARA REQUERIDA PARA REGISTRO'
                    : !rostroCentrado
                    ? 'ALINEE ROSTRO EN LA MALLA'
                    : registrando
                    ? 'ESCANEANDO ROSTRO...'
                    : 'INICIAR REGISTRO (0% a 100%)'}
                </button>
              ) : (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={onGuardarRegistro}
                    className="flex-1 sm:flex-initial flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs transition"
                  >
                    <Save className="w-4 h-4" />
                    GUARDAR REGISTRO
                  </button>
                  <button
                    onClick={onReintentarRegistro}
                    className="flex-1 sm:flex-initial flex items-center gap-2 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold text-xs transition"
                  >
                    <RotateCcw className="w-4 h-4" />
                    REINTENTAR
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-300 block flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  Palanca de Acceso (Verificación 15s):
                </span>
                <span className="text-[11px] text-slate-500">
                  {!camaraActiva
                    ? 'Cámara desactivada. No se puede iniciar verificación.'
                    : !rostroCentrado
                    ? 'Rostro fuera de malla. Centrar para analizar.'
                    : toggleAcceso
                    ? 'Analizando rasgos biométricos...'
                    : 'Activa la palanca para solicitar acceso'}
                </span>
              </div>

              <button
                disabled={!camaraActiva || !rostroCentrado}
                onClick={onToggleAcceso}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition ${
                  !camaraActiva || !rostroCentrado
                    ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500'
                    : toggleAcceso
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {toggleAcceso ? <ToggleRight className="w-6 h-6 text-slate-950" /> : <ToggleLeft className="w-6 h-6 text-slate-400" />}
                {toggleAcceso ? 'ACCEDIENDO (ACTIVADO)' : 'ACCEDER (DESACTIVADO)'}
              </button>
            </div>

            {userRole === 'ADMIN' && (
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-rose-300/80 font-medium flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  Gestión de Credencial Biométrica (Admin):
                </span>
                <button
                  onClick={onAbrirModalBorrar}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 rounded-lg transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Borrar Vector Biométrico
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};