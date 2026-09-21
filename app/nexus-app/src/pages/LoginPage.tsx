import React, { useState } from 'react';
import { BrandSidebar } from '../shared/components/login/BrandSidebar';
import { EmailCheckStep } from '../shared/components/login/EmailCheckStep';
import { PasswordInputStep } from '../shared/components/login/PasswordInputStep';
import { RequestFormStep } from '../shared/components/login/RequestFormStep';
import { RequestActivationStep, StatusScreen } from '../shared/components/login/StatusScreens';
import { API_URL } from '../config/api';

const API_BASE_URL = API_URL;

interface LoginPageProps {
  onLoginSuccess: (email: string, usuarioData?: any) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [step, setStep] = useState<
    'EMAIL_CHECK' | 'PASSWORD_INPUT' | 'REQUEST_FORM' | 'INVITATION_FORM' | 'REQUEST_ACTIVATION' | 'REQUEST_SENT' | 'PENDING_REVIEW'
  >('EMAIL_CHECK');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [requestData, setRequestData] = useState({
    nombres: '',
    apellidos: '',
    telefono: '',
    direccion: '',
    nivelEducacion: ''
  });

  // 1. Validar Correo
  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || loading) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/solicitudes/validar-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Error al validar el correo.');
        return;
      }

      // Evaluar la propiedad 'tipo' devuelta por server.js
      if (data.tipo === 'CORP_ACTIVO') {
        setStep('PASSWORD_INPUT');
      } else if (data.tipo === 'CORP_PRE_APROBADO') {
        setStep('REQUEST_ACTIVATION');
      } else if (data.tipo === 'CORP_PENDIENTE_ACTIVACION') {
        setStatusMessage(data.message || 'Tu solicitud de activación ya está en proceso.');
        setStep('PENDING_REVIEW');
      } else if (data.tipo === 'GMAIL_NUEVO') {
        setStep('REQUEST_FORM');
      }
    } catch (error) {
      console.error('Error al validar correo:', error);
      alert('Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Solicitar Activación
  const handleRequestActivation = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/solicitudes/solicitar-activacion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_corporativo: email.trim() })
      });

      const data = await response.json();

      if (response.ok) {
        setStatusMessage(data.message || 'Solicitud enviada al administrador.');
        setStep('PENDING_REVIEW');
      } else {
        alert(data.error || 'No se pudo procesar la activación.');
      }
    } catch (error) {
      console.error('Error al solicitar activación:', error);
      alert('Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Autenticación / Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || loading) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        localStorage.setItem(
          'nexus_session',
          JSON.stringify({
            email: email.trim(),
            usuario: data.usuario,
            authenticatedAt: new Date().toISOString()
          })
        );
        onLoginSuccess(email, data.usuario);
      } else {
        alert(data.error || 'Contraseña incorrecta.');
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      alert('Error de conexión al autenticar.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Guardar Solicitud Inicial
  const handleSaveRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const payload = {
      email_personal: email.trim(),
      nombres: requestData.nombres,
      apellidos: requestData.apellidos,
      telefono: requestData.telefono,
      direccion: requestData.direccion,
      nivel_educacion: requestData.nivelEducacion
    };

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/solicitudes/crear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setStep('REQUEST_SENT');
      } else {
        alert(`Error: ${data.error || 'No se pudo guardar la solicitud'}`);
      }
    } catch (error) {
      console.error('Error al guardar datos:', error);
      alert('Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-6 md:p-12 font-sans relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <BrandSidebar />

        <div className="lg:col-span-5">
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
            {step === 'EMAIL_CHECK' && (
              <EmailCheckStep
                email={email}
                setEmail={setEmail}
                loading={loading}
                onSubmit={handleCheckEmail}
              />
            )}

            {step === 'REQUEST_ACTIVATION' && (
              <RequestActivationStep
                email={email}
                loading={loading}
                onActivate={handleRequestActivation}
              />
            )}

            {step === 'PASSWORD_INPUT' && (
              <PasswordInputStep
                email={email}
                password={password}
                setPassword={setPassword}
                loading={loading}
                onSubmit={handleLoginSubmit}
                onBack={() => setStep('EMAIL_CHECK')}
              />
            )}

            {(step === 'REQUEST_FORM' || step === 'INVITATION_FORM') && (
              <RequestFormStep
                isInvitation={step === 'INVITATION_FORM'}
                email={email}
                requestData={requestData}
                setRequestData={setRequestData}
                loading={loading}
                onSubmit={handleSaveRequest}
                onCancel={() => setStep('EMAIL_CHECK')}
              />
            )}

            {(step === 'REQUEST_SENT' || step === 'PENDING_REVIEW') && (
              <StatusScreen
                type={step}
                statusMessage={statusMessage}
                onBack={() => setStep('EMAIL_CHECK')}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};