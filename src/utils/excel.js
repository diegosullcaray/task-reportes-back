const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

const excelOutputPath = process.env.EXCEL_OUTPUT_PATH || './xlsx_output';

// Crear carpeta si no existe
if (!fs.existsSync(excelOutputPath)) {
  fs.mkdirSync(excelOutputPath, { recursive: true });
}

/**
 * Genera archivo Excel con formato
 * @param {Array<Object>} datos - Array de objetos con datos
 * @param {string} nombreReporte - Nombre del reporte
 * @returns {Promise<Object>} {nombre, ruta, filas}
 */
async function generarExcel(datos, nombreReporte) {
  try {
    if (!datos || datos.length === 0) {
      throw new Error('No hay datos para generar Excel');
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Datos');

    // Headers a partir de las claves de la primera fila
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

    // Guardar archivo
    const fecha = new Date().toISOString().split('T')[0];
    const timestamp = Date.now();
    const nombreArchivo = `${nombreReporte}_${fecha}_${timestamp}.xlsx`;
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

module.exports = { generarExcel };
