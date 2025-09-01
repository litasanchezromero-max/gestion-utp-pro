import React, { useEffect, useMemo } from 'react';
import { AppData } from '../types';

declare const jspdf: any;
declare const html2canvas: any;

interface PdfExportProps {
  appData: AppData;
  exportConfig: { type: 'all' } | { type: 'teacher', teacherId: string };
  onFinished: () => void;
}

export const PdfExport: React.FC<PdfExportProps> = ({ appData, exportConfig, onFinished }) => {
  const { teachers, courses, subjects, contentLogs } = appData;

  const dataMap = useMemo(() => ({
    teachers: new Map(teachers.map(t => [t.id, t.name])),
    courses: new Map(courses.map(c => [c.id, c.name])),
    subjects: new Map(subjects.map(s => [s.id, s.name])),
  }), [teachers, courses, subjects]);

  const { filteredLogs, reportTitle, fileName } = useMemo(() => {
    let logs = contentLogs;
    let title = "Reporte Completo de Registro de Contenidos";
    let fName = `reporte_completo_${new Date().toISOString().split('T')[0]}.pdf`;

    if (exportConfig.type === 'teacher') {
      const teacher = teachers.find(t => t.id === exportConfig.teacherId);
      if (teacher) {
        logs = contentLogs.filter(log => log.teacherId === exportConfig.teacherId);
        title = `Reporte de Contenidos - ${teacher.name}`;
        fName = `reporte_${teacher.name.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      }
    }
    
    const sorted = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return { filteredLogs: sorted, reportTitle: title, fileName: fName };
  }, [appData, exportConfig, contentLogs, teachers]);


  useEffect(() => {
    const generatePdf = async () => {
      const reportElement = document.getElementById('pdf-export-area');
      if (!reportElement || filteredLogs.length === 0) {
          if (filteredLogs.length === 0) {
            alert("No hay registros para exportar para la selección actual.");
          }
          onFinished();
          return;
      }

      try {
        const { jsPDF } = jspdf;
        const canvas = await html2canvas(reportElement, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        const imgWidth = pdfWidth - 20; // with margin
        const imgHeight = imgWidth / ratio;
        
        let position = 10;
        pdf.setFont('Inter', 'normal');
        pdf.text(reportTitle, 10, position);
        position += 10;

        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        
        pdf.save(fileName);
      } catch(error) {
          console.error("Error al generar PDF:", error);
          alert("Hubo un error al generar el PDF. Revise la consola para más detalles.");
      } finally {
          onFinished();
      }
    };
    
    const timer = setTimeout(generatePdf, 100);

    return () => clearTimeout(timer);
  }, [onFinished, dataMap, filteredLogs, reportTitle, fileName]);

  return (
    <div style={{ position: 'fixed', left: '-9999px', top: '0', zIndex: -1 }}>
      <div id="pdf-export-area" className="bg-white p-6" style={{ width: '210mm' }}>
        <h3 className="text-xl font-bold mb-4 text-center">{reportTitle}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3">Fecha</th>
                <th scope="col" className="px-4 py-3">Docente</th>
                <th scope="col" className="px-4 py-3">Curso</th>
                <th scope="col" className="px-4 py-3">Asignatura</th>
                <th scope="col" className="px-4 py-3">Contenido</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => (
                <tr key={log.id} className="bg-white border-b">
                  <td className="px-4 py-3">{log.date}</td>
                  <td className="px-4 py-3">{dataMap.teachers.get(log.teacherId)}</td>
                  <td className="px-4 py-3">{dataMap.courses.get(log.courseId)}</td>
                  <td className="px-4 py-3">{dataMap.subjects.get(log.subjectId)}</td>
                  <td className="px-4 py-3 whitespace-pre-wrap">{log.content}</td>
                </tr>
              ))}
               {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">No hay registros para exportar.</td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};