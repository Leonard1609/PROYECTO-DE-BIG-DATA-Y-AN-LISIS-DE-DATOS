import { useState, useEffect } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { FileText, FileSpreadsheet, Table, Upload, Trash2, Eye, Download } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const LOCAL_DOCS_KEY = 'nexus-documentos-local-cache';

function readLocalDocs(): StoredFile[] {
  try {
    const raw = localStorage.getItem(LOCAL_DOCS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StoredFile[];
  } catch {
    return [];
  }
}

function saveLocalDocs(docs: StoredFile[]) {
  try {
    localStorage.setItem(LOCAL_DOCS_KEY, JSON.stringify(docs));
  } catch {
    // storage puede estar lleno, pero UI no debe romperse
  }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('No se pudo convertir el archivo a URL local'));
    reader.readAsDataURL(file);
  });
}

interface StoredFile {
  name: string;
  folder: string;
  url: string;
  size: number;
  type: 'pdf' | 'csv' | 'excel' | 'other';
}

// Utilidad para limpiar el timestamp del nombre
const formatFileName = (rawName: string): string => {
  return rawName.replace(/^\d+[-_]/, '');
};

// Utilidad para formatear el tamaño
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function DocumentUploader() {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedDocs, setUploadedDocs] = useState<StoredFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const getFileType = (fileName: string): 'pdf' | 'csv' | 'excel' | 'other' => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (ext === 'csv') return 'csv';
    if (ext === 'xlsx' || ext === 'xls') return 'excel';
    return 'other';
  };

  const loadStoredDocuments = async () => {
    if (!isSupabaseConfigured) {
      setUploadedDocs(readLocalDocs());
      return;
    }

    try {
      const folders = ['informes', 'datasets'];
      const docs: StoredFile[] = [];

      for (const folder of folders) {
        const { data, error } = await supabase.storage.from('documentos').list(folder, {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' },
        });

        if (!error && data) {
          data.forEach((file) => {
            if (file.name !== '.emptyFolderPlaceholder') {
              const { data: publicData } = supabase.storage
                .from('documentos')
                .getPublicUrl(`${folder}/${file.name}`);

              docs.push({
                name: file.name,
                folder,
                url: publicData.publicUrl,
                size: typeof file.metadata?.size === 'number' ? file.metadata.size : 0,
                type: getFileType(file.name),
              });
            }
          });
        }
      }

      const cached = readLocalDocs();
      setUploadedDocs([...cached, ...docs]);
    } catch {
      setUploadedDocs(readLocalDocs());
    }
  };

  useEffect(() => {
    void loadStoredDocuments();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleUploadAll = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);

    const docs = readLocalDocs();

    try {
      if (!isSupabaseConfigured) {
        for (const file of selectedFiles) {
          const fileType = getFileType(file.name);
          const folder = fileType === 'pdf' ? 'informes' : 'datasets';
          const dataUrl = await fileToDataUrl(file);
          const doc: StoredFile = {
            name: file.name,
            folder,
            url: dataUrl,
            size: file.size,
            type: fileType,
          };
          docs.unshift(doc);
        }
        saveLocalDocs(docs);
        setUploadedDocs(docs);
      } else {
        for (const file of selectedFiles) {
          const fileType = getFileType(file.name);
          const folder = fileType === 'pdf' ? 'informes' : 'datasets';
          const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
          const filePath = `${folder}/${Date.now()}_${safeName}`;

          try {
            const { error } = await supabase.storage.from('documentos').upload(filePath, file, {
              contentType: file.type || 'application/octet-stream',
              cacheControl: '3600',
              upsert: false,
            });

            if (error) {
              throw error;
            }
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'No se pudo subir el archivo con Supabase.';
            const dataUrl = await fileToDataUrl(file);
            const doc: StoredFile = {
              name: file.name,
              folder,
              url: dataUrl,
              size: file.size,
              type: fileType,
            };
            docs.unshift(doc);
            saveLocalDocs(docs);
            console.warn(`Supabase storage fetch/upload falló para ${file.name}: ${errorMessage}. Guardado localmente.`);
          }
        }

        await loadStoredDocuments();
      }
    } catch {
      alert('No se pudo completar la carga de documentos. Reintenta o revisa el almacenamiento de archivos.');
    } finally {
      setUploading(false);
      setSelectedFiles([]);
    }
  };

  const handleDelete = async (folder: string, fileName: string) => {
    if (!confirm(`¿Eliminar ${formatFileName(fileName)}?`)) return;

    if (!isSupabaseConfigured) {
      const docs = readLocalDocs().filter((doc) => doc.name !== fileName || doc.folder !== folder);
      saveLocalDocs(docs);
      setUploadedDocs(docs);
      return;
    }

    try {
      const { error } = await supabase.storage.from('documentos').remove([`${folder}/${fileName}`]);
      if (error) {
        throw error;
      }
      if (previewUrl?.includes(fileName)) setPreviewUrl(null);
      await loadStoredDocuments();
    } catch (err) {
      alert('Error al eliminar: ' + (err instanceof Error ? err.message : 'No se pudo eliminar.'));
    }
  };

  const handleDownload = async (doc: StoredFile) => {
    try {
      const safeName = formatFileName(doc.name);
      if (doc.url.startsWith('data:')) {
        const anchor = document.createElement('a');
        anchor.href = doc.url;
        anchor.download = safeName;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        return;
      }

      try {
        const response = await fetch(doc.url);
        if (!response.ok) throw new Error('No se pudo recuperar el archivo.');
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = blobUrl;
        anchor.download = safeName;
        anchor.rel = 'noopener noreferrer';
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        window.setTimeout(() => URL.revokeObjectURL(blobUrl), 250);
      } catch {
        const anchor = document.createElement('a');
        anchor.href = doc.url;
        anchor.download = safeName;
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
      }
    } catch {
      alert('No se pudo descargar el archivo en este navegador.');
    }
  };

  return (
    <div className={`p-6 ${isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'} rounded-xl max-w-5xl mx-auto shadow-lg space-y-6 border`}>
      <div>
        <h2 className={`text-xl font-bold ${isLight ? 'text-blue-700' : 'text-blue-400'}`}>Gestión y Carga Documental</h2>
        <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'} mt-1`}>
          Sube múltiples archivos simultáneamente (PDF, CSV, Excel) y mantenlos guardados en la plataforma.
        </p>
      </div>

      <div className={`border-2 border-dashed ${isLight ? 'border-slate-300 hover:border-blue-500 bg-slate-50' : 'border-slate-700 hover:border-blue-500 bg-slate-950/50'} rounded-lg p-6 text-center transition-colors`}>
        <input
          type="file"
          id="fileInput"
          multiple
          accept=".pdf,.csv,.xlsx,.xls,application/pdf,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          onChange={handleFileChange}
          className="hidden"
        />
        <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center justify-center space-y-2">
          <Upload className={`w-10 h-10 ${isLight ? 'text-slate-500 hover:text-blue-500' : 'text-slate-400 hover:text-blue-400'}`} />
          <span className={`text-sm ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
            {selectedFiles.length > 0
              ? `${selectedFiles.length} archivo(s) seleccionado(s)`
              : 'Haz clic o arrastra para seleccionar varios archivos (PDF, CSV, Excel)'}
          </span>
        </label>
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <p className={`text-xs font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-wider`}>Archivos por subir:</p>
          <ul className={`p-3 rounded-lg border ${isLight ? 'bg-slate-50 border-slate-200 divide-slate-200' : 'bg-slate-950 border-slate-800 divide-slate-800'} divide-y text-sm`}>
            {selectedFiles.map((f, i) => (
              <li key={i} className={`py-2 flex items-center justify-between ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                <span className="truncate max-w-md">{f.name}</span>
                <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-500'} font-mono font-medium`}>
                  {formatFileSize(f.size)}
                </span>
              </li>
            ))}
          </ul>
          <button
            onClick={handleUploadAll}
            disabled={uploading}
            className={`w-full py-3 ${isLight ? 'bg-blue-700 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-500'} disabled:bg-slate-700 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 text-white`}
          >
            {uploading ? 'Guardando en la nube...' : `Subir ${selectedFiles.length} documento(s)`}
          </button>
        </div>
      )}

      {previewUrl && (
        <div className={`p-4 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'} border rounded-lg space-y-3`}>
          <div className="flex items-center justify-between">
            <h3 className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'} text-sm flex items-center gap-2`}>
              <Eye size={16} className="text-blue-400" /> Previsualizando Documento
            </h3>
            <button
              onClick={() => setPreviewUrl(null)}
              className={`text-xs ${isLight ? 'text-slate-600 hover:text-slate-900 bg-slate-200' : 'text-slate-400 hover:text-white bg-slate-800'} px-2 py-1 rounded`}
            >
              Cerrar Vista Previa
            </button>
          </div>
          <iframe src={previewUrl} className={`w-full h-[500px] border-none rounded-lg ${isLight ? 'bg-white' : 'bg-slate-900'}`} title="PDF Preview" />
        </div>
      )}

      <div className={`space-y-4 pt-4 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
        <h3 className={`text-md font-bold ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
          Documentos Guardados en la Plataforma ({uploadedDocs.length})
        </h3>

        {uploadedDocs.length === 0 ? (
          <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-slate-500'} italic`}>No hay documentos almacenados aún.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {uploadedDocs.map((doc, idx) => (
              <div
                key={idx}
                className={`p-4 ${isLight ? 'bg-slate-50 border-slate-200 hover:border-blue-500' : 'bg-slate-950 border-slate-800 hover:border-slate-700'} border rounded-lg flex items-center justify-between gap-3 shadow-sm`}
              >
                <div className="flex items-center gap-3 truncate">
                  {doc.type === 'pdf' && <FileText className="w-7 h-7 text-red-400 shrink-0" />}
                  {doc.type === 'csv' && <Table className="w-7 h-7 text-amber-400 shrink-0" />}
                  {doc.type === 'excel' && <FileSpreadsheet className="w-7 h-7 text-emerald-400 shrink-0" />}
                  {doc.type === 'other' && <FileText className="w-7 h-7 text-slate-400 shrink-0" />}

                  <div className="truncate">
                    <p className={`text-sm font-medium ${isLight ? 'text-slate-900' : 'text-slate-200'} truncate`} title={formatFileName(doc.name)}>
                      {formatFileName(doc.name)}
                    </p>
                    <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-500'} uppercase font-mono`}>
                      {doc.type} • {formatFileSize(doc.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {doc.type === 'pdf' && (
                    <button
                      onClick={() => setPreviewUrl(doc.url)}
                      className={`p-2 rounded ${isLight ? 'hover:bg-slate-200 text-slate-600 hover:text-blue-600' : 'hover:bg-slate-800 text-slate-400 hover:text-blue-400'}`}
                      title="Previsualizar PDF"
                    >
                      <Eye size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDownload(doc)}
                    className={`p-2 rounded ${isLight ? 'hover:bg-slate-200 text-slate-600 hover:text-emerald-600' : 'hover:bg-slate-800 text-slate-400 hover:text-emerald-400'}`}
                    title="Descargar archivo"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(doc.folder, doc.name)}
                    className={`p-2 rounded ${isLight ? 'hover:bg-slate-200 text-slate-600 hover:text-red-500' : 'hover:bg-slate-800 text-slate-400 hover:text-red-400'}`}
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}