const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const logger = require('../../infrastructure/logging/logger');

const excelOutputPath = process.env.EXCEL_OUTPUT_PATH || './xlsx_output';

// Crear carpeta si no existe
if (!fs.existsSync(excelOutputPath)) {
  fs.mkdirSync(excelOutputPath, { recursive: true });
}

/**
 * Escribe los datos con formato (header azul, filas alternadas, columnas
 * autoajustadas, header congelado) en una hoja ya creada.
 * @param {import('exceljs').Worksheet} worksheet
 * @param {Array<Object>} datos
 */
function escribirHoja(worksheet, datos) {
  const headers = Object.keys(datos[0]);
  worksheet.addRow(headers);

  const headerRow = worksheet.getRow(1);
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4285F4' }
  };
  headerRow.font = {
    bold: true,
    color: { argb: 'FFFFFFFF' }
  };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

  // Agregar datos alternando color de filas
  datos.forEach((row, index) => {
    const values = headers.map(h => row[h] ?? '');
    worksheet.addRow(values);

    if (index % 2 === 0) {
      worksheet.getRow(index + 2).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF5F5F5' }
      };
    }
  });

  // Ajustar ancho de columnas automáticamente
  headers.forEach((header, index) => {
    let maxLength = header.length;

    datos.forEach(row => {
      const cellLength = String(row[header] ?? '').length;
      if (cellLength > maxLength) {
        maxLength = cellLength;
      }
    });

    worksheet.columns[index].width = Math.min(maxLength + 2, 50);
  });

  // Congelar header
  worksheet.views = [{ state: 'frozen', ySplit: 1 }];
}

/**
 * Genera archivo Excel con formato
 * @param {Array<Object>} datos - Array de objetos con datos
 * @param {string} nombreArchivo - Nombre exacto del archivo (ej. "Desembolsos_canal_20260630.xlsx")
 * @returns {Promise<Object>} {nombre, ruta, filas}
 */
async function generarExcel(datos, nombreArchivo) {
  try {
    if (!datos || datos.length === 0) {
      throw new Error('No hay datos para generar Excel');
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Datos');
    escribirHoja(worksheet, datos);

    // Guardar archivo
    const rutaCompleta = path.join(excelOutputPath, nombreArchivo);

    await workbook.xlsx.writeFile(rutaCompleta);

    logger.info(`✓ Excel generado: ${nombreArchivo} (${datos.length} filas)`);

    return {
      nombre: nombreArchivo,
      ruta: rutaCompleta,
      filas: datos.length
    };
  } catch (error) {
    logger.error(`Error generando Excel: ${error.message}`);
    throw error;
  }
}

/**
 * Genera un archivo Excel con varias hojas, una por cada dataset.
 * Hojas sin datos se omiten (no se puede formatear una hoja vacía).
 * @param {Array<{nombre: string, datos: Array<Object>}>} hojas
 * @param {string} nombreArchivo - Nombre exacto del archivo
 * @returns {Promise<Object>} {nombre, ruta, hojas: [{nombre, filas}]}
 */
async function generarExcelMultiHoja(hojas, nombreArchivo) {
  try {
    const hojasConDatos = (hojas || []).filter(h => h.datos && h.datos.length > 0);

    if (hojasConDatos.length === 0) {
      throw new Error('No hay datos para generar Excel');
    }

    const workbook = new ExcelJS.Workbook();

    hojasConDatos.forEach(({ nombre, datos }) => {
      const worksheet = workbook.addWorksheet(nombre.slice(0, 31)); // límite de Excel
      escribirHoja(worksheet, datos);
    });

    const rutaCompleta = path.join(excelOutputPath, nombreArchivo);
    await workbook.xlsx.writeFile(rutaCompleta);

    const resumenHojas = hojasConDatos.map(({ nombre, datos }) => ({ nombre, filas: datos.length }));
    const totalFilas = resumenHojas.reduce((acc, h) => acc + h.filas, 0);

    logger.info(`✓ Excel generado: ${nombreArchivo} (${resumenHojas.length} hojas, ${totalFilas} filas)`);

    return {
      nombre: nombreArchivo,
      ruta: rutaCompleta,
      filas: totalFilas,
      hojas: resumenHojas
    };
  } catch (error) {
    logger.error(`Error generando Excel multi-hoja: ${error.message}`);
    throw error;
  }
}

module.exports = { generarExcel, generarExcelMultiHoja };
