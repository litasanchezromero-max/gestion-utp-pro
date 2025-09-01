
import React, { useState, useMemo } from 'react';
import { AppData } from '../types';

declare const jspdf: any;
declare const html2canvas: any;

export const ReportView: React.FC<{ appData: AppData }> = ({ appData }) => {
  const { teachers, courses, subjects, contentLogs } = appData;
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState({ teacher: 'all', course: 'all', subject: 'all' });

  const dataMap = useMemo(() => ({
    teachers: new Map(teachers.map(t => [t.id, t.name])),
    courses: new Map(courses.map(c => [c.id, c.name])),
    subjects: new Map(subjects.map(s => [s.id, s.name])),
  }), [teachers, courses, subjects]);

  const filteredLogs = useMemo(() => {
    return contentLogs
      .filter(log => filter.teacher === 'all' || log.teacherId === filter.teacher)
      .filter(log => filter.course === 'all' || log.courseId === filter.course)
      .filter(log => filter.subject === 'all' || log.subjectId === filter.subject)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [contentLogs, filter]);

  const generatePdf = async () => {
    const reportElement = document.getElementById('report-area');
    if (!reportElement) return;

    setIsLoading(true);
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
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        const imgWidth = pdfWidth - 20; // with margin
        const imgHeight = imgWidth / ratio;
        
        let position = 10;
        pdf.setFont('Inter', 'normal');
        pdf.text("Reporte de Registro de Contenidos", 10, position);
        position += 10;

        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);

        pdf.save(`reporte_contenidos_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch(error) {
        console.error("Error al generar PDF:", error);
        alert("Hubo un error al generar el PDF. Revise la consola para más detalles.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-gray-800">Generar Reporte</h2>
        <button 
          onClick={generatePdf} 
          disabled={isLoading}
          className="bg-emerald-500 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-emerald-600 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Generando...' : 'Descargar PDF'}
        </button>
      </div>

      <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label className="text-sm font-medium text-gray-700">Docente</label>
                <select value={filter.teacher} onChange={e => setFilter(f => ({...f, teacher: e.target.value}))} className="w-full mt-1 p-2 border border-gray-300 rounded-md">
                    <option value="all">Todos</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
            </div>
             <div>
                <label className="text-sm font-medium text-gray-700">Curso</label>
                <select value={filter.course} onChange={e => setFilter(f => ({...f, course: e.target.value}))} className="w-full mt-1 p-2 border border-gray-300 rounded-md">
                    <option value="all">Todos</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>
             <div>
                <label className="text-sm font-medium text-gray-700">Asignatura</label>
                <select value={filter.subject} onChange={e => setFilter(f => ({...f, subject: e.target.value}))} className="w-full mt-1 p-2 border border-gray-300 rounded-md">
                    <option value="all">Todas</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            </div>
        </div>
      </div>

      <div id="report-area" className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-bold mb-4 text-center">Registro de Contenidos</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
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
                <tr key={log.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{log.date}</td>
                  <td className="px-4 py-3">{dataMap.teachers.get(log.teacherId)}</td>
                  <td className="px-4 py-3">{dataMap.courses.get(log.courseId)}</td>
                  <td className="px-4 py-3">{dataMap.subjects.get(log.subjectId)}</td>
                  <td className="px-4 py-3 whitespace-pre-wrap">{log.content}</td>
                </tr>
              ))}
               {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">No hay registros que coincidan con los filtros seleccionados.</td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
