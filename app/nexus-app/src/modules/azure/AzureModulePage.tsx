import React, { useState, useEffect } from 'react';
import { DeleteModal } from './components/DeleteModal';
import { ResponsibleAIBanner } from './components/ResponsibleAIBanner';
import { CameraStream } from './components/CameraStream';
import { MatchMetricsPanel, type LandmarkInfo } from './components/MatchMetricsPanel';
import { verifyFacialIdentity, type MatchResult } from './services/azureFaceService';

interface AzureFacialRecognitionProps {
  userRole?: 'ADMIN' | 'EMPLEADO' | 'ANALISTA';
}

export const AzureFacialRecognitionPage: React.FC<AzureFacialRecognitionProps> = ({
  userRole = 'ADMIN'
}) => {
  const [camaraActiva, setCamaraActiva] = useState<boolean>(true);
  const [rostroCentrado, setRostroCentrado] = useState<boolean>(true);
  const [usandoMediaPipe, setUsandoMediaPipe] = useState<boolean>(false);

  // Registro
  const [nombreUsuario, setNombreUsuario] = useState<string>('');
  const [usuarioRegistrado, setUsuarioRegistrado] = useState<boolean>(false);
  const [usuarioRegistradoNombre, setUsuarioRegistradoNombre] = useState<string>('');
  const [registrando, setRegistrando] = useState<boolean>(false);
  const [registroListoParaGuardar, setRegistroListoParaGuardar] = useState<boolean>(false);

  // Modal Borrar
  const [mostrarModalBorrar, setMostrarModalBorrar] = useState<boolean>(false);
  const [confirmacionTexto, setConfirmacionTexto] = useState<string>('');

  // Landmarks
  const [landmarksRegistro, setLandmarksRegistro] = useState<LandmarkInfo[]>([
    { nombre: 'Ojos (Escaneo de retina y pupila)', porcentaje: 0, completado: false },
    { nombre: 'Cejas (Arcos superciliares)', porcentaje: 0, completado: false },
    { nombre: 'Nariz (Punto central y puente)', porcentaje: 0, completado: false },
    { nombre: 'Boca (Alineación de comisuras)', porcentaje: 0, completado: false },
    { nombre: 'Contorno de Cara (Estructura ósea 3D)', porcentaje: 0, completado: false },
  ]);

  // Acceso
  const [toggleAcceso, setToggleAcceso] = useState<boolean>(false);
  const [temporizador, setTemporizador] = useState<number>(15);
  const [analizandoAcceso, setAnalizandoAcceso] = useState<boolean>(false);
  const [estadoAcceso, setEstadoAcceso] = useState<'idle' | 'permitido' | 'denegado'>('idle');

  // Lectura en vivo
  const [porcentajesEnVivo, setPorcentajesEnVivo] = useState<number[]>([0, 0, 0, 0, 0]);
  const [coincidenciaGlobal, setCoincidenciaGlobal] = useState<number>(0);

  // Escaneo de Registro
  const iniciarEscaneoRegistro = () => {
    if (!camaraActiva || !rostroCentrado) return;
    setRegistrando(true);
    setRegistroListoParaGuardar(false);
    setLandmarksRegistro(landmarksRegistro.map(l => ({ ...l, porcentaje: 0, completado: false })));
  };

  useEffect(() => {
    if (!registrando) return;

    let indexActual = 0;
    let progresoCurrent = 0;

    const interval = setInterval(() => {
      if (!camaraActiva || !rostroCentrado) return;

      progresoCurrent += 10;

      setLandmarksRegistro((prev) => {
        const copia = [...prev];
        if (indexActual < copia.length) {
          copia[indexActual] = {
            ...copia[indexActual],
            porcentaje: Math.min(progresoCurrent, 100),
            completado: progresoCurrent >= 100
          };
        }
        return copia;
      });

      if (progresoCurrent >= 100) {
        progresoCurrent = 0;
        indexActual += 1;
        if (indexActual >= 5) {
          clearInterval(interval);
          setRegistrando(false);
          setRegistroListoParaGuardar(true);
        }
      }
    }, 120);

    return () => clearInterval(interval);
  }, [registrando, camaraActiva, rostroCentrado]);

  const guardarRegistro = () => {
    const nombreFinal = nombreUsuario.trim() || 'Usuario_Registrado_01';
    setUsuarioRegistradoNombre(nombreFinal);
    setUsuarioRegistrado(true);
    setRegistroListoParaGuardar(false);
  };

  const reintentarRegistro = () => {
    setRegistrando(false);
    setRegistroListoParaGuardar(false);
    setLandmarksRegistro(landmarksRegistro.map(l => ({ ...l, porcentaje: 0, completado: false })));
  };

  // Acceso en Tiempo Real
  const handleToggleAcceso = () => {
    if (!camaraActiva || !usuarioRegistrado || !rostroCentrado) return;
    const nuevoEstado = !toggleAcceso;
    setToggleAcceso(nuevoEstado);

    if (nuevoEstado) {
      setAnalizandoAcceso(true);
      setEstadoAcceso('idle');
      setTemporizador(15);
    } else {
      setAnalizandoAcceso(false);
      setEstadoAcceso('idle');
    }
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (toggleAcceso && analizandoAcceso && temporizador > 0 && camaraActiva && rostroCentrado) {
      interval = setInterval(() => {
        setTemporizador((prev) => prev - 1);
        const rasgosVivo = Array.from({ length: 5 }, () => Math.floor(Math.random() * 30) + 68);
        const promedio = Math.floor(rasgosVivo.reduce((a, b) => a + b, 0) / 5);
        setPorcentajesEnVivo(rasgosVivo);
        setCoincidenciaGlobal(promedio);
      }, 1000);
    } else if (!rostroCentrado && analizandoAcceso) {
      setPorcentajesEnVivo([0, 0, 0, 0, 0]);
      setCoincidenciaGlobal(0);
    } else if (temporizador === 0 && toggleAcceso && camaraActiva && rostroCentrado) {
      setAnalizandoAcceso(false);

      // Capturar fotograma actual del elemento <video>
      const videoElement = document.querySelector('video') as HTMLVideoElement;
      if (videoElement) {
        const canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth || 640;
        canvas.height = videoElement.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(async (blob) => {
          if (blob) {
            try {
              // Llamada a la API de Azure a través de azureFaceService.ts
              const resultado: MatchResult = await verifyFacialIdentity(blob);
              
              if (resultado.isMatch) {
                setEstadoAcceso('permitido');
                setCoincidenciaGlobal(resultado.matchProbability);
                setPorcentajesEnVivo([
                  resultado.evaluatedFacials.eyesAccuracy,
                  resultado.evaluatedFacials.noseAccuracy,
                  resultado.evaluatedFacials.mouthAccuracy,
                  resultado.evaluatedFacials.earsAccuracy,
                  resultado.matchProbability
                ]);
              } else {
                setEstadoAcceso('denegado');
              }
            } catch (err) {
              console.error('Error al verificar identidad con Azure Face API:', err);
              setEstadoAcceso('denegado');
            }
          }
        }, 'image/jpeg');
      } else {
        setEstadoAcceso('denegado');
      }
    }

    return () => clearInterval(interval);
  }, [toggleAcceso, analizandoAcceso, temporizador, coincidenciaGlobal, camaraActiva, rostroCentrado]);

  const borrarTodoElRegistro = () => {
    setUsuarioRegistrado(false);
    setUsuarioRegistradoNombre('');
    setNombreUsuario('');
    setToggleAcceso(false);
    setAnalizandoAcceso(false);
    setEstadoAcceso('idle');
    setRegistroListoParaGuardar(false);
    setPorcentajesEnVivo([0, 0, 0, 0, 0]);
    setCoincidenciaGlobal(0);
    setLandmarksRegistro(landmarksRegistro.map(l => ({ ...l, porcentaje: 0, completado: false })));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 relative">
      <DeleteModal
        isOpen={mostrarModalBorrar}
        usuarioNombre={usuarioRegistradoNombre}
        confirmacionTexto={confirmacionTexto}
        setConfirmacionTexto={setConfirmacionTexto}
        onClose={() => { setMostrarModalBorrar(false); setConfirmacionTexto(''); }}
        onConfirm={() => { borrarTodoElRegistro(); setMostrarModalBorrar(false); setConfirmacionTexto(''); }}
      />

      <ResponsibleAIBanner
        usuarioRegistrado={usuarioRegistrado}
        usuarioRegistradoNombre={usuarioRegistradoNombre}
        estadoAcceso={estadoAcceso}
        usandoMediaPipe={usandoMediaPipe}
        userRole={userRole}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <CameraStream
            camaraActiva={camaraActiva}
            setCamaraActiva={setCamaraActiva}
            rostroCentrado={rostroCentrado}
            setRostroCentrado={setRostroCentrado}
            usandoMediaPipe={usandoMediaPipe}
            setUsandoMediaPipe={setUsandoMediaPipe}
            analizandoAcceso={analizandoAcceso}
            registrando={registrando}
            temporizador={temporizador}
            usuarioRegistrado={usuarioRegistrado}
            nombreUsuario={nombreUsuario}
            setNombreUsuario={setNombreUsuario}
            registroListoParaGuardar={registroListoParaGuardar}
            toggleAcceso={toggleAcceso}
            userRole={userRole}
            onIniciarEscaneo={iniciarEscaneoRegistro}
            onGuardarRegistro={guardarRegistro}
            onReintentarRegistro={reintentarRegistro}
            onToggleAcceso={handleToggleAcceso}
            onAbrirModalBorrar={() => setMostrarModalBorrar(true)}
          />
        </div>

        <div className="lg:col-span-5">
          <MatchMetricsPanel
            usuarioRegistrado={usuarioRegistrado}
            landmarksRegistro={landmarksRegistro}
            registroListoParaGuardar={registroListoParaGuardar}
            analizandoAcceso={analizandoAcceso}
            estadoAcceso={estadoAcceso}
            coincidenciaGlobal={coincidenciaGlobal}
            porcentajesEnVivo={porcentajesEnVivo}
          />
        </div>
      </div>
    </div>
  );
};

export default AzureFacialRecognitionPage;