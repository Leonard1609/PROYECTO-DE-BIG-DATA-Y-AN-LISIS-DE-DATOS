import React from 'react';
import type { MatchResult } from '../services/azureFaceService';

interface MatchMetricsPanelProps {
  result: MatchResult | null;
  isProcessing: boolean;
}

export const MatchMetricsPanel: React.FC<MatchMetricsPanelProps> = ({ result, isProcessing }) => {
  if (isProcessing) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-center items-center h-full min-h-[400px]">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-white font-medium">Ejecutando inferencia en Azure ML...</p>
        <p className="text-slate-400 text-xs mt-1">Calculando vectores de similitud facial</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-center items-center h-full min-h-[400px] text-center">
        <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mb-4 text-slate-400">
          🔍
        </div>
        <h3 className="text-lg font-medium text-white mb-1">Sin análisis activo</h3>
        <p className="text-slate-400 text-sm max-w-xs">
          Active la cámara y realice una captura para evaluar la probabilidad de coincidencia y facciones.
        </p>
      </div>
    );
  }

  const { matchProbability, isMatch, confidenceThreshold, evaluatedFacials, biasWarning } = result;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between h-full space-y-6">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Análisis de Similitud</h2>
            <p className="text-xs text-slate-400">Métricas procesadas por Azure Cognitive Services</p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${
              isMatch
                ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                : 'bg-rose-950 text-rose-400 border-rose-800'
            }`}
          >
            {isMatch ? 'ACCESO AUTORIZADO' : 'ACCESO DENEGADO'}
          </span>
        </div>

        {/* Probabilidad principal */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-5">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-medium text-slate-300">Probabilidad de Coincidencia</span>
            <span
              className={`text-2xl font-bold ${isMatch ? 'text-emerald-400' : 'text-rose-400'}`}
            >
              {matchProbability}%
            </span>
          </div>
          <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-700 ${
                isMatch ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
              style={{ width: `${matchProbability}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Umbral mínimo de confianza definido: {confidenceThreshold}%
          </p>
        </div>

        {/* Desglose de Facciones */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Facciones Geométricas Evaluadas
          </h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block">Ojos</span>
              <span className="text-white font-medium">{evaluatedFacials.eyesAccuracy}% de precisión</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block">Nariz</span>
              <span className="text-white font-medium">{evaluatedFacials.noseAccuracy}% de precisión</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block">Boca</span>
              <span className="text-white font-medium">{evaluatedFacials.mouthAccuracy}% de precisión</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block">Orejas / Contorno</span>
              <span className="text-white font-medium">{evaluatedFacials.earsAccuracy}% de precisión</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerta de Sesgo o Limitación */}
      {biasWarning && (
        <div className="p-3 bg-amber-950/40 border border-amber-800/50 rounded-xl text-amber-300 text-xs">
          ⚠️ <strong>Aviso de Limitación:</strong> {biasWarning}
        </div>
      )}
    </div>
  );
};