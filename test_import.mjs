import XLSX from './node_modules/.pnpm/xlsx@0.18.5/node_modules/xlsx/xlsx.mjs';
import { readFileSync } from 'fs';

const buffer = readFileSync('/home/ubuntu/upload/-SEMAFOROHSA-.xlsx');
const workbook = XLSX.read(buffer, { type: "buffer" });

console.log('Hojas en el Excel:');
workbook.SheetNames.forEach((name, i) => {
  console.log(`${i + 1}. "${name}"`);
});

const SHEET_MODULE_MAP = {
  "PROCESOS Y PRACTICAS": "procesos_practicas",
  "INF LOGOS": "inf_logos",
  "REVOCATORIAS": "revocatorias",
  "INF ORDINARIOS": "inf_ordinarios",
  "SALVAMENTOS Y ACLARACIONES P": "salvamentos",
  "ARCHIVADOS": "archivados",
  "ARCHIVADOS ": "archivados",
};

console.log('\n=== Procesando hojas ===');
for (const sheetName of workbook.SheetNames) {
  const upperName = sheetName.trim().toUpperCase();
  let modulo;
  
  for (const [key, val] of Object.entries(SHEET_MODULE_MAP)) {
    if (upperName.includes(key.toUpperCase())) {
      modulo = val;
      break;
    }
  }

  if (!modulo) {
    console.log(`❌ Hoja "${sheetName}" NO tiene módulo asignado`);
    continue;
  }

  const sheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  console.log(`✓ Hoja "${sheetName}" → módulo: ${modulo}, registros: ${jsonData.length}`);
  
  if (modulo === 'salvamentos') {
    console.log('  Headers:', Object.keys(jsonData[0] || {}));
  }
}
