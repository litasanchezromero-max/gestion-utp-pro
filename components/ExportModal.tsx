import React, { useState } from 'react';
import { Modal } from './Modal';
import { Teacher } from '../types';

type ExportConfig = { type: 'all' } | { type: 'teacher', teacherId: string };

interface ExportModalProps {
  teachers: Teacher[];
  onClose: () => void;
  onGenerate: (config: ExportConfig) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ teachers, onClose, onGenerate }) => {
  const [exportType, setExportType] = useState<'all' | 'teacher'>('all');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(teachers[0]?.id || '');

  const handleGenerateClick = () => {
    if (exportType === 'teacher' && !selectedTeacherId) {
      alert('Por favor, seleccione un docente.');
      return;
    }
    const config = exportType === 'all' 
      ? { type: 'all' as const } 
      : { type: 'teacher' as const, teacherId: selectedTeacherId };
    onGenerate(config);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Generar Reporte PDF">
      <div className="space-y-6 p-2">
        <div>
          <label htmlFor="reportType" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Reporte</label>
          <select 
            id="reportType"
            value={exportType} 
            onChange={e => setExportType(e.target.value as 'all' | 'teacher')}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#A3DFFF] focus:border-transparent"
          >
            <option value="all">Reporte Completo (Todos los registros)</option>
            <option value="teacher">Reporte por Docente</option>
          </select>
        </div>

        {exportType === 'teacher' && (
          <div>
            <label htmlFor="teacherSelect" className="block text-sm font-medium text-gray-700 mb-1">Seleccione Docente</label>
            <select 
              id="teacherSelect"
              value={selectedTeacherId} 
              onChange={e => setSelectedTeacherId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#A3DFFF] focus:border-transparent"
            >
              {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        )}

        <div className="flex justify-end pt-4 space-x-3">
          <button type="button" onClick={onClose} className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">Cancelar</button>
          <button type="button" onClick={handleGenerateClick} className="px-6 py-2 text-white bg-sky-500 rounded-lg hover:bg-sky-600 transition-colors shadow-md hover:shadow-lg">Generar</button>
        </div>
      </div>
    </Modal>
  );
};
