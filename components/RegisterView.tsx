import React, { useState } from 'react';
import { AppData, ContentLog } from '../types';
import { Modal } from './Modal';
import { RegisterForm } from './RegisterForm';

interface RegisterViewProps {
  appData: AppData;
  onAddLog: (log: ContentLog) => void;
  onAddTeacher: (name: string) => void;
  onUpdateTeacher: (teacherId: string, newName: string) => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({ appData, onAddLog, onAddTeacher, onUpdateTeacher }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Registrar Contenidos</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-[#A3DFFF] to-[#A8F1D6] text-blue-900 font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
        >
          + Nuevo Registro
        </button>
      </div>
      <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-8 text-center">
        <p className="text-gray-600">
          Aquí puedes añadir nuevos registros de contenidos de clases. Haz clic en "Nuevo Registro" para comenzar.
        </p>
        <p className="text-sm text-gray-500 mt-2">
            Cada entrada contribuye al seguimiento y cumplimiento pedagógico de la escuela.
        </p>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrar Contenido de Clase">
        <RegisterForm
          teachers={appData.teachers}
          courses={appData.courses}
          subjects={appData.subjects}
          onSave={onAddLog}
          onClose={() => setIsModalOpen(false)}
          onAddTeacher={onAddTeacher}
          onUpdateTeacher={onUpdateTeacher}
        />
      </Modal>
    </div>
  );
};