import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileDown } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useDatasets } from '../../context/DatasetContext';
import {
  REPORT_INSIGHT_KEY,
  buildComparisonReport,
  type ComparisonReport,
  type ReportMetric,
} from '../../lib/buildComparisonReport';
import { rubroLabel } from '../../lib/catalog';
import { formatMoney, formatPct } from '../../lib/format';
import { ComparisonTrendChart } from '../../modules/charts/ComparisonTrendChart';
import { HeadToHeadChart } from '../../modules/charts/HeadToHeadChart';
import { FinancialDistributionChart } from '../../modules/charts/FinancialDistributionChart';

function readStoredInsight(): string | null {
  try {
    return sessionStorage.getItem(REPORT_INSIGHT_KEY);
  } catch {
    return null;
  }
}

function buildBusinessPdf(report: ComparisonReport) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  const maxHeight = pageHeight - 20;
  let y = 16;

  const ensureSpace = (height = 16) => {
    if (y + height > maxHeight) {
      doc.addPage();
      y = 16;
    }
  };

  const addTitle = (title: string) => {
    ensureSpace(12);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(title, margin, y);
    y += 8;
  };

  const addText = (text: string, fontSize = 10, bold = false) => {
    ensureSpace(8);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, contentWidth);
    const lineHeight = fontSize + 1.4;
    if (y + lines.length * lineHeight > maxHeight) {
      doc.addPage();
      y = 16;
    }
    doc.text(lines, margin, y);
    y += lines.length * lineHeight;
  };

  doc.setFillColor(19, 47, 86);
  doc.rect(0, 0, pageWidth, 26, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('NEXUS · Big Data & Analítica', margin, 12);
  doc.setFontSize(11);
  doc.text('Informe de comparación competitiva', margin, 20);

  y = 34;
  doc.setTextColor(0, 0, 0);

  addTitle('1. Resumen ejecutivo');
  addText(`${report.winner} lidera la comparación con una ventaja final de ${formatMoney(Math.abs(report.diffEnd))} en ${report.metricLabel.toLowerCase()}.`);
  addText(report.winnerReason);
  addText(report.insight);

  addTitle('2. Entidades analizadas');
  addText(`${report.mine.name} (${report.mine.filename}) · Rubro: ${rubroLabel(report.mine.rubro)} · Metodología: ${report.mine.metodologia} · Filas: ${report.mine.rows.length}`);
  addText(`${report.competitor.name} (${report.competitor.filename}) · Rubro: ${rubroLabel(report.competitor.rubro)} · Metodología: ${report.competitor.metodologia} · Filas: ${report.competitor.rows.length}`);

  addTitle('3. Indicadores financieros');
  addText(`Métrica base: ${report.metricLabel} · Periodo: ${report.chartLabels[0] ?? 'A'} → ${report.chartLabels.at(-1) ?? 'B'}`);
  addText(`Ingresos: ${report.mine.name} ${formatMoney(report.mineFin.ingresos)} · ${report.competitor.name} ${formatMoney(report.compFin.ingresos)}`);
  addText(`Costos: ${report.mine.name} ${formatMoney(report.mineFin.costos)} · ${report.competitor.name} ${formatMoney(report.compFin.costos)}`);
  addText(`Ganancia neta: ${report.mine.name} ${formatMoney(report.mineFin.gananciaNeta)} · ${report.competitor.name} ${formatMoney(report.compFin.gananciaNeta)}`);
  addText(`Margen: ${report.mine.name} ${formatPct(report.mineFin.margen)} · ${report.competitor.name} ${formatPct(report.compFin.margen)}`);

  addTitle('4. Evolución por periodo');
  addText(`Periodo A: ${formatMoney(report.mineStart)} (${report.mine.name}) vs ${formatMoney(report.compStart)} (${report.competitor.name})`);
  addText(`Periodo B: ${formatMoney(report.mineEnd)} (${report.mine.name}) vs ${formatMoney(report.compEnd)} (${report.competitor.name})`);
  addText(`Variación A→B: ${report.mine.name} ${report.mineGrowth != null ? `${report.mineGrowth >= 0 ? '+' : ''}${formatPct(Math.abs(report.mineGrowth) / 100)}` : '—'} · ${report.competitor.name} ${report.compGrowth != null ? `${report.compGrowth >= 0 ? '+' : ''}${formatPct(Math.abs(report.compGrowth) / 100)}` : '—'}`);

  addTitle('5. Documentación técnica de software');
  for (const item of report.engineeringDocumentation) {
    addText(`• ${item}`);
  }

  addTitle('6. Recomendaciones');
  for (const rec of report.recommendations) {
    addText(`• ${rec}`);
  }

  addTitle('7. Metadatos');
  addText(`Generado el ${report.generatedAt} · Año A: ${report.yearA} · Año B: ${report.yearB}`);
  addText(`Nota de periodo: ${report.periodNote}`);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text('NEXUS ERP · Módulo Big Data & Analítica · Documento generado automáticamente', margin, pageHeight - 8);

  doc.save(`nexus-reporte-${report.mine.name}-${report.competitor.name}.pdf`);
}

export const ReportePage: React.FC = () => {
  const { datasets } = useDatasets();
  const [params] = useSearchParams();

  const mine = datasets.find((d) => d.id === params.get('mine')) ?? datasets.find((d) => d.isMine) ?? datasets[0];
  const competitor =
    datasets.find((d) => d.id === params.get('competitor')) ?? datasets.find((d) => d.id !== mine?.id);

  const metric = (params.get('metric') as ReportMetric) || 'ganancia';
  const yearA = params.get('yearA') ? Number(params.get('yearA')) : null;
  const yearB = params.get('yearB') ? Number(params.get('yearB')) : null;
  const storedInsight = useMemo(() => readStoredInsight(), []);

  const report = useMemo(() => {
    if (!mine || !competitor) return null;
    return buildComparisonReport(mine, competitor, metric, yearA, yearB, storedInsight);
  }, [mine, competitor, metric, yearA, yearB, storedInsight]);

  const handleDownloadPdf = () => {
    if (!report) return;
    buildBusinessPdf(report);
  };

  if (!report) {
    return (
      <div className="max-w-5xl nx-card p-8">
        <h1 className="nx-title text-2xl font-bold">Reporte comparativo</h1>
        <p className="nx-subtitle mt-2">Seleccioná dos datasets en Análisis y generá el reporte desde ahí.</p>
      </div>
    );
  }

  const { mineFin, compFin } = report;

  return (
    <div className="max-w-5xl space-y-6 pb-12">
      <div className="flex items-center justify-between gap-4 no-print">
        <div>
          <p className="text-xs text-blue-500 uppercase tracking-widest font-semibold">Salida ejecutiva</p>
          <h1 className="font-display nx-title text-4xl font-extrabold">Reporte comparativo</h1>
          <p className="nx-subtitle mt-2">Documentación PDF de la comparación entre datasets.</p>
        </div>
        <button className="nx-btn" onClick={handleDownloadPdf}>
          <FileDown size={17} /> Generar PDF
        </button>
      </div>

      <section id="bigdata-report" className="report-document space-y-6">
        {/* Portada / encabezado */}
        <header className="report-cover">
          <p className="report-brand">NEXUS · Big Data & Analítica</p>
          <h1 className="report-title">Informe de comparación competitiva</h1>
          <p className="report-meta">
            Generado el {report.generatedAt} · Métrica: {report.metricLabel} · Periodo {report.chartLabels[0] ?? 'A'} →{' '}
            {report.chartLabels.at(-1) ?? 'B'}
          </p>
          <p className="report-meta-sub">{report.periodNote}</p>
        </header>

        {/* Resumen ejecutivo */}
        <article className="report-section">
          <h2 className="report-section-title">1. Resumen ejecutivo</h2>
          <div className="report-highlight">
            <p className="report-lead">
              <strong>{report.winner}</strong> lidera la comparación al cierre del periodo.
            </p>
            <p className="report-body">{report.winnerReason}</p>
          </div>
          <p className="report-body mt-4">{report.insight}</p>
        </article>

        {/* Empresas comparadas */}
        <article className="report-section">
          <h2 className="report-section-title">2. Empresas analizadas</h2>
          <div className="report-grid-2">
            <div className="report-box report-box-blue">
              <p className="report-label">Mi empresa (base)</p>
              <p className="report-name">{report.mine.name}</p>
              <ul className="report-list">
                <li>Archivo: {report.mine.filename}</li>
                <li>Rubro: {rubroLabel(report.mine.rubro)}</li>
                <li>Metodología: {report.mine.metodologia}</li>
                <li>Registros: {report.mine.rows.length.toLocaleString('es-AR')}</li>
              </ul>
            </div>
            <div className="report-box report-box-amber">
              <p className="report-label">Competencia</p>
              <p className="report-name">{report.competitor.name}</p>
              <ul className="report-list">
                <li>Archivo: {report.competitor.filename}</li>
                <li>Rubro: {rubroLabel(report.competitor.rubro)}</li>
                <li>Metodología: {report.competitor.metodologia}</li>
                <li>Registros: {report.competitor.rows.length.toLocaleString('es-AR')}</li>
              </ul>
            </div>
          </div>
        </article>

        {/* KPIs financieros totales */}
        <article className="report-section">
          <h2 className="report-section-title">3. Indicadores financieros (totales del dataset)</h2>
          <table className="report-table">
            <thead>
              <tr>
                <th>Indicador</th>
                <th>Mi empresa</th>
                <th>Competencia</th>
                <th>Diferencia</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Ingresos', mineFin.ingresos, compFin.ingresos],
                ['Costos', mineFin.costos, compFin.costos],
                ['Ganancia neta', mineFin.gananciaNeta, compFin.gananciaNeta],
                ['Margen', mineFin.margen, compFin.margen, true],
              ].map(([label, a, b, isPct]) => {
                const va = Number(a);
                const vb = Number(b);
                const diff = va - vb;
                return (
                  <tr key={String(label)}>
                    <td>{label}</td>
                    <td>{isPct ? formatPct(va) : formatMoney(va)}</td>
                    <td>{isPct ? formatPct(vb) : formatMoney(vb)}</td>
                    <td className={diff >= 0 ? 'report-positive' : 'report-negative'}>
                      {isPct ? formatPct(Math.abs(diff)) : formatMoney(Math.abs(diff))}
                      {diff >= 0 ? ' ▲' : ' ▼'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </article>

        {/* Evolución periodo A → B */}
        <article className="report-section report-page-break">
          <h2 className="report-section-title">4. Evolución incremental (Periodo A → B)</h2>
          <p className="report-body mb-4">
            Comparación de <strong>{report.metricLabel.toLowerCase()}</strong> en el inicio y cierre del periodo
            analizado.
          </p>
          <table className="report-table mb-6">
            <thead>
              <tr>
                <th>Empresa</th>
                <th>Periodo A (inicio)</th>
                <th>Periodo B (cierre)</th>
                <th>Variación A→B</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{report.mine.name}</td>
                <td>{formatMoney(report.mineStart)}</td>
                <td>{formatMoney(report.mineEnd)}</td>
                <td>
                  {report.mineGrowth != null
                    ? `${report.mineGrowth >= 0 ? '+' : ''}${formatPct(Math.abs(report.mineGrowth) / 100)}`
                    : '—'}
                </td>
              </tr>
              <tr>
                <td>{report.competitor.name}</td>
                <td>{formatMoney(report.compStart)}</td>
                <td>{formatMoney(report.compEnd)}</td>
                <td>
                  {report.compGrowth != null
                    ? `${report.compGrowth >= 0 ? '+' : ''}${formatPct(Math.abs(report.compGrowth) / 100)}`
                    : '—'}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="report-grid-2 report-charts">
            <div className="report-chart-box">
              <p className="report-chart-caption">Mi empresa — evolución</p>
              <ComparisonTrendChart
                labels={report.chartLabels}
                metricLabel={report.metricLabel}
                series={[{ label: report.mine.name, color: '#2563eb', values: report.mineTrend }]}
              />
            </div>
            <div className="report-chart-box">
              <p className="report-chart-caption">Competencia — evolución</p>
              <ComparisonTrendChart
                labels={report.chartLabels}
                metricLabel={report.metricLabel}
                series={[{ label: report.competitor.name, color: '#d97706', values: report.compTrend }]}
              />
            </div>
          </div>
        </article>

        {/* Comparativa central */}
        <article className="report-section">
          <h2 className="report-section-title">5. ¿Por qué un dataset es mejor que el otro?</h2>
          <HeadToHeadChart
            mineName={report.mine.name}
            compName={report.competitor.name}
            mineA={report.mineStart}
            mineB={report.mineEnd}
            compA={report.compStart}
            compB={report.compEnd}
            mineGrowth={report.mineGrowth}
            compGrowth={report.compGrowth}
            metricLabel={report.metricLabel}
          />
        </article>

        {/* Distribución financiera */}
        <article className="report-section report-page-break">
          <h2 className="report-section-title">6. Distribución financiera por empresa</h2>
          <div className="report-grid-2 report-charts">
            <div className="report-chart-box">
              <p className="report-chart-caption">{report.mine.name}</p>
              {mineFin.basis !== 'sin_dinero' ? (
                <FinancialDistributionChart
                  ingresos={mineFin.ingresos}
                  costos={mineFin.costos}
                  ganancia={mineFin.gananciaNeta}
                />
              ) : (
                <p className="report-body">Sin datos financieros.</p>
              )}
            </div>
            <div className="report-chart-box">
              <p className="report-chart-caption">{report.competitor.name}</p>
              {compFin.basis !== 'sin_dinero' ? (
                <FinancialDistributionChart
                  ingresos={compFin.ingresos}
                  costos={compFin.costos}
                  ganancia={compFin.gananciaNeta}
                />
              ) : (
                <p className="report-body">Sin datos financieros.</p>
              )}
            </div>
          </div>
        </article>

        {/* Documentación técnica tipo ingeniería de software */}
        <article className="report-section">
          <h2 className="report-section-title">7. Documentación técnica de software</h2>
          <div className="report-grid-2">
            <div className="report-box report-box-blue">
              <p className="report-label">Arquitectura del análisis</p>
              <ul className="report-list report-list-bullets">
                <li>Entrada: CSV de datasets.</li>
                <li>Validación: columnas, métricas financieras y series temporales.</li>
                <li>Transformación: preparación del dataset y cálculo de KPIs.</li>
                <li>Comparación: cierre A → B y análisis head-to-head.</li>
              </ul>
            </div>
            <div className="report-box report-box-amber">
              <p className="report-label">Módulo de datos</p>
              <ul className="report-list report-list-bullets">
                <li>Base principal: {report.mine.name}</li>
                <li>Competencia: {report.competitor.name}</li>
                <li>Métrica analítica: {report.metricLabel}</li>
                <li>Período: {report.chartLabels[0] ?? 'A'} → {report.chartLabels.at(-1) ?? 'B'}</li>
              </ul>
            </div>
          </div>
          <div className="report-body mt-4">
            <ol className="report-list-bullets">
              {report.engineeringDocumentation.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ol>
          </div>
        </article>

        {/* Recomendaciones */}
        <article className="report-section">
          <h2 className="report-section-title">8. Conclusiones y recomendaciones</h2>
          <ul className="report-list report-list-bullets">
            {report.recommendations.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </article>

        <footer className="report-footer">
          <p>NEXUS ERP · Módulo Big Data & Analítica · Documento generado automáticamente</p>
          <p className="report-footer-sub">
            {report.mine.name} vs {report.competitor.name} · {report.generatedAt}
          </p>
        </footer>
      </section>
    </div>
  );
};
