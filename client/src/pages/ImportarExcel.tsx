import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Upload, FileSpreadsheet, AlertTriangle, CheckCircle, Trash2, Plus } from "lucide-react";
import * as XLSX from "xlsx";

interface ParsedRecord {
  modulo: string;
  abogado?: string;
  tema?: string;
  sujeto?: string;
  elecciones?: string;
  lugar?: string;
  radicadoCne?: string;
  etapaOf?: string;
  etapaIp?: string;
  etapaFc?: string;
  etapaPr?: string;
  etapaAc?: string;
  etapaDf?: string;
  etapaRc?: string;
  etapa?: string;
  estado?: string;
  fechaRecibido?: string;
  diasDespacho?: number;
  diasEtapa?: number;
  devuelto?: number;
  enEstudioAbogado?: string;
  devueltoEstudio?: string;
  dianaRamos?: string;
  drLaureano?: string;
  drUriel?: string;
  enTerminos?: string;
  enSala?: string;
  enFirmas?: string;
  notifContinuaProceso?: string;
  notifSigueArchivo?: string;
  interponeRecursoArchivo?: string;
  pausa?: string;
  observaciones?: string;
  color?: string;
  anio?: number;
  fechaArchivo?: string;
  tipoSalvamento?: string;
  ponente?: string;
  resolucion?: string;
  semaforoDias?: number;
  [key: string]: any;
}

// Map sheet names to module names
const SHEET_MODULE_MAP: Record<string, string> = {
  "PROCESOS Y PRACTICAS": "procesos_practicas",
  "PROCESOS Y PRÁCTICAS": "procesos_practicas",
  "INF LOGOS": "inf_logos",
  "REVOCATORIAS": "revocatorias",
  "INF ORDINARIOS": "inf_ordinarios",
  "SALVAMENTOS Y ACLARACIONES P": "salvamentos",
  "SALVAMENTOS Y ACLARACIONES": "salvamentos",
  "SALVAMENTOS": "salvamentos",
  "ACLARACIONES": "salvamentos",
  "ARCHIVADOS": "archivados",
  "ARCHIVADOS ": "archivados",
};

// Map column headers to field names - using Map to allow duplicate handling
const COLUMN_MAP_ENTRIES: [string, string][] = [
  ["ABOGADO", "abogado"],
  ["TEMA", "tema"],
  ["SUJETO", "sujeto"],
  ["ELECCIONES Y/O CATEGORIA", "elecciones"],
  ["ELECCIONES", "elecciones"],
  ["CATEGORIA", "elecciones"],
  ["NOMBRE", "sujeto"],
  ["LUGAR", "lugar"],
  ["No. RADICADO CNE", "radicadoCne"],
  ["NO. RADICADO CNE", "radicadoCne"],
  ["RADICADO CNE", "radicadoCne"],
  ["RADICADO", "radicadoCne"],
  ["OFICIO", "etapaOf"],
  ["OF", "etapaOf"],
  ["IND. PRELIMINAR", "etapaIp"],
  ["IP", "etapaIp"],
  ["FOR. CARGOS", "etapaFc"],
  ["FC", "etapaFc"],
  ["PRUEBAS", "etapaPr"],
  ["PR", "etapaPr"],
  ["P", "etapaPr"],
  ["ALE. CONCLUSI\u00d3N", "etapaAc"],
  ["AC", "etapaAc"],
  ["DECISI\u00d3N FINAL", "etapaDf"],
  ["DF", "etapaDf"],
  ["RECURSO", "etapaRc"],
  ["R", "etapaRc"],
  ["RC", "etapaRc"],
  ["ETAPA", "etapa"],
  ["ESTADO", "estado"],
  ["FECHA RECIBIDO / REPARTO", "fechaRecibido"],
  ["FECHA RECIBIDO", "fechaRecibido"],
  ["DIAS EN DESPACHO", "diasDespacho"],
  ["D\u00cdAS EN DESPACHO", "diasDespacho"],
  ["DIAS EN ETAPA", "diasEtapa"],
  ["D\u00cdAS EN ETAPA", "diasEtapa"],
  ["# DE VECES QUE SE A DEVUELTO", "devuelto"],
  ["# DE VECES QUE SE HA DEVUELTO", "devuelto"],
  ["# VECES QUE SE HA DEVUELTO", "devuelto"],
  ["# DE VECES DEVUELTO", "devuelto"],
  ["# VECES DEVUELTO", "devuelto"],
  ["EN ESTUDIO POR EL ABOGADO", "enEstudioAbogado"],
  ["DEVUELTO - EN ESTUDIO POR EL ABOGADO", "devueltoEstudio"],
  ["DIANA RAMOS", "dianaRamos"],
  ["DR LAUREANO", "drLaureano"],
  ["DR URIEL", "drUriel"],
  ["EN T\u00c9RMINOS", "enTerminos"],
  ["EN SALA", "enSala"],
  ["EN FIRMAS", "enFirmas"],
  ["EN NOTIFICACI\u00d3N CONTINUA PROCESO", "notifContinuaProceso"],
  ["EN NOTIFICACI\u00d3N SIGUE ARCHIVO", "notifSigueArchivo"],
  ["INTERPONE RECURSO - ARCHIVO", "interponeRecursoArchivo"],
  ["PAUSA", "pausa"],
  ["OBSERVACIONES", "observaciones"],
  ["FECHA DE ARCHIVO", "fechaArchivo"],
  ["FECHA ARCHIVO", "fechaArchivo"],
  ["RESPONSABLE", "abogado"],
  ["PONENTE", "ponente"],
  ["EXPEDIENTE", "radicadoCne"],
  ["No. de RESOLUCI\u00d3N", "resolucion"],
  ["NO. DE RESOLUCI\u00d3N", "resolucion"],
  ["NO. RESOLUCI\u00d3N", "resolucion"],
  ["NO. DE RESOLUCION", "resolucion"],
  ["RESOLUCI\u00d3N", "resolucion"],
  ["RESOLUCION", "resolucion"],
  ["S\u00c9MAFORO/DIAS EN DESPACHO", "semaforoDias"],
  ["SEM\u00c1FORO/DIAS EN DESPACHO", "semaforoDias"],
  ["SEMAFORO/DIAS EN DESPACHO", "semaforoDias"],
  ["SEMAFORO", "semaforoDias"],
  ["EN EL ABOGADO", "enAbogado"],
  ["DEVUELTO AL ABOGADO", "devueltoAbogado"],
  ["# EPX", "numero"],
];
const COLUMN_MAP = new Map<string, string>(COLUMN_MAP_ENTRIES);

function parseSheet(sheetData: any[], modulo: string): ParsedRecord[] {
  if (!sheetData || sheetData.length === 0) return [];
  
  const headers = Object.keys(sheetData[0]);
  const records: ParsedRecord[] = [];

  for (const row of sheetData) {
    const record: ParsedRecord = { modulo };
    let hasData = false;

    for (const header of headers) {
      const cleanHeader = header.trim().toUpperCase();
      const fieldName = COLUMN_MAP.get(cleanHeader);
      if (fieldName && row[header] != null && row[header] !== "") {
        hasData = true;
        const val = row[header];
        if (fieldName === "diasDespacho" || fieldName === "diasEtapa" || fieldName === "devuelto" || fieldName === "semaforoDias" || fieldName === "anio" || fieldName === "numero") {
          record[fieldName] = typeof val === "number" ? val : parseInt(String(val)) || undefined;
        } else {
          record[fieldName] = String(val).trim();
        }
      }
    }

    if (hasData && (record.abogado || record.tema || record.radicadoCne || record.sujeto || record.ponente || record.resolucion)) {
      records.push(record);
    }
  }

  return records;
}

export default function ImportarExcel() {
  const [parsedData, setParsedData] = useState<{ modulo: string; moduleName: string; records: ParsedRecord[] }[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [replaceAll, setReplaceAll] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ success: boolean; count: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const uploadMutation = trpc.importar.upload.useMutation();
  const utils = trpc.useUtils();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setUploadResult(null);
    setParsedData([]);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });

      const results: { modulo: string; moduleName: string; records: ParsedRecord[] }[] = [];

      for (const sheetName of workbook.SheetNames) {
        const upperName = sheetName.trim().toUpperCase();
        let modulo: string | undefined;
        
        for (const [key, val] of Object.entries(SHEET_MODULE_MAP)) {
          if (upperName.includes(key.toUpperCase())) {
            modulo = val;
            break;
          }
        }

        if (!modulo) continue;

        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        const records = parseSheet(jsonData, modulo);

        if (records.length > 0) {
          const moduleNames: Record<string, string> = {
            procesos_practicas: "Procesos y Prácticas",
            inf_logos: "Inf. Logos",
            revocatorias: "Revocatorias",
            inf_ordinarios: "Inf. Ordinarios",
            salvamentos: "Salvamentos",
            archivados: "Archivados",
          };
          results.push({
            modulo,
            moduleName: moduleNames[modulo] || modulo,
            records,
          });
        }
      }

      setParsedData(results);
      if (results.length === 0) {
        toast.error("No se encontraron hojas reconocidas en el archivo. Asegúrese de que las hojas se llamen: PROCESOS Y PRACTICAS, INF LOGOS, REVOCATORIAS, INF ORDINARIOS, SALVAMENTOS Y ACLARACIONES P, ARCHIVADOS");
      } else {
        const total = results.reduce((sum, r) => sum + r.records.length, 0);
        toast.success(`Se encontraron ${total} registros en ${results.length} hojas`);
      }
    } catch (err) {
      toast.error("Error al leer el archivo Excel");
      console.error(err);
    }
  };

  const handleUpload = async () => {
    if (parsedData.length === 0) return;

    setUploading(true);
    try {
      const allRecords = parsedData.flatMap(d => d.records) as any[];
      
      // Send in batches of 200 to avoid payload limits
      let totalCount = 0;
      const batchSize = 200;
      
      for (let i = 0; i < allRecords.length; i += batchSize) {
        const batch = allRecords.slice(i, i + batchSize);
        const result = await uploadMutation.mutateAsync({
          records: batch,
          replaceAll: i === 0 ? replaceAll : false, // Only replace on first batch
        });
        totalCount += result.count;
      }

      setUploadResult({ success: true, count: totalCount });
      utils.expedientes.list.invalidate();
      utils.dashboard.stats.invalidate();
      toast.success(`Se importaron ${totalCount} registros exitosamente`);
    } catch (err) {
      toast.error("Error al importar los datos");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const totalRecords = parsedData.reduce((sum, d) => sum + d.records.length, 0);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-[#1B3A5C] flex items-center justify-center">
          <Upload className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1B3A5C]">Importación Masiva de Excel</h1>
          <p className="text-sm text-gray-500">Cargue un archivo Excel para actualizar la base de datos completa</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 space-y-6">
        {/* Instrucciones */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Instrucciones</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>1. El archivo Excel debe tener hojas con los nombres: <strong>PROCESOS Y PRACTICAS</strong>, <strong>INF LOGOS</strong>, <strong>REVOCATORIAS</strong>, <strong>INF ORDINARIOS</strong>, <strong>SALVAMENTOS Y ACLARACIONES P</strong>, <strong>ARCHIVADOS</strong></li>
            <li>2. Cada hoja debe tener los encabezados en la primera fila (ABOGADO, TEMA, SUJETO, etc.)</li>
            <li>3. Puede elegir si reemplazar toda la base de datos o agregar los nuevos registros</li>
          </ul>
        </div>

        {/* Selector de archivo */}
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-[#1B3A5C] hover:bg-gray-50 transition-colors"
        >
          <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          {fileName ? (
            <div>
              <p className="text-lg font-semibold text-[#1B3A5C]">{fileName}</p>
              <p className="text-sm text-gray-500 mt-1">Haga clic para cambiar el archivo</p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-semibold text-gray-600">Haga clic para seleccionar un archivo Excel</p>
              <p className="text-sm text-gray-400 mt-1">Formatos aceptados: .xlsx, .xls</p>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Resultados del parsing */}
        {parsedData.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">Registros encontrados:</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {parsedData.map((d) => (
                <div key={d.modulo} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="font-semibold text-[#1B3A5C]">{d.moduleName}</p>
                  <p className="text-2xl font-bold text-gray-800">{d.records.length}</p>
                  <p className="text-xs text-gray-500">registros</p>
                </div>
              ))}
            </div>
            <div className="bg-[#1B3A5C] text-white rounded-lg p-4 text-center">
              <p className="text-sm">Total de registros a importar</p>
              <p className="text-3xl font-bold">{totalRecords}</p>
            </div>

            {/* Opciones */}
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={replaceAll}
                    onChange={(e) => setReplaceAll(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="font-semibold text-red-800">Reemplazar toda la base de datos</span>
                </label>
                <p className="text-xs text-red-600 mt-1">
                  {replaceAll
                    ? "⚠️ TODOS los expedientes actuales serán eliminados y reemplazados por los del archivo"
                    : "Los nuevos registros se agregarán a los existentes sin eliminar nada"}
                </p>
              </div>
            </div>

            {/* Botón importar */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setParsedData([]); setFileName(""); setUploadResult(null); }}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
              >
                <Trash2 className="w-4 h-4" />
                Cancelar
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="flex items-center gap-2 px-6 py-3 bg-[#1B3A5C] text-white rounded-lg hover:bg-[#2a4f7a] transition-colors font-semibold disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Importando...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    {replaceAll ? "Reemplazar e Importar" : "Agregar Registros"}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Resultado de la importación */}
        {uploadResult && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
            <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
            <div>
              <p className="font-semibold text-green-800">Importación exitosa</p>
              <p className="text-sm text-green-700">Se importaron {uploadResult.count} registros correctamente</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
