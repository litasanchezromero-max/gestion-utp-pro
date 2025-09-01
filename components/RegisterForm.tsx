import React, { useState } from 'react';
import { Teacher, Course, Subject, ContentLog } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { Modal } from './Modal';

interface RegisterFormProps {
  teachers: Teacher[];
  courses: Course[];
  subjects: Subject[];
  onSave: (log: ContentLog) => void;
  onClose: () => void;
  onAddTeacher: (name: string) => void;
  onUpdateTeacher: (teacherId: string, newName: string) => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ teachers, courses, subjects, onSave, onClose, onAddTeacher, onUpdateTeacher }) => {
  const [teacherId, setTeacherId] = useState<string>(teachers[0]?.id || '');
  const [courseId, setCourseId] = useState<string>(courses[0]?.id || '');
  const [subjectId, setSubjectId] = useState<string>(subjects[0]?.id || '');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [content, setContent] = useState<string>('');
  const [observations, setObservations] = useState<string>('');
  const [error, setError] = useState<string>('');
  
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [teacherToEdit, setTeacherToEdit] = useState<Teacher | null>(null);
  const [teacherNameInput, setTeacherNameInput] = useState('');

  const handleOpenTeacherModal = (teacher: Teacher | null) => {
    setTeacherToEdit(teacher);
    setTeacherNameInput(teacher ? teacher.name : '');
    setIsTeacherModalOpen(true);
  };

  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherNameInput.trim()) {
      alert('El nombre del docente no puede estar vacío.');
      return;
    }
    if (teacherToEdit) {
      onUpdateTeacher(teacherToEdit.id, teacherNameInput.trim());
    } else {
      onAddTeacher(teacherNameInput.trim());
    }
    setIsTeacherModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherId || !courseId || !subjectId || !date || !content) {
      setError('Por favor, complete todos los campos obligatorios.');
      return;
    }
    setError('');
    const newLog: ContentLog = {
      id: uuidv4(),
      teacherId,
      courseId,
      subjectId,
      date,
      content,
      observations,
    };
    onSave(newLog);
    onClose();
  };
  
  const InputField: React.FC<{label: string; children: React.ReactNode}> = ({label, children}) => (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        {children}
      </div>
  );

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-500 text-sm bg-red-100 p-3 rounded-lg">{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Docente">
            <div className="flex items-center space-x-2">
                <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#A3DFFF] focus:border-transparent">
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <button type="button" onClick={() => handleOpenTeacherModal(null)} className="p-2 bg-sky-100 text-sky-700 rounded-md hover:bg-sky-200 transition-colors" title="Añadir nuevo docente">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                </button>
                <button type="button" onClick={() => {
                    const selectedTeacher = teachers.find(t => t.id === teacherId);
                    if (selectedTeacher) handleOpenTeacherModal(selectedTeacher);
                  }}
                  disabled={!teacherId}
                  className="p-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title="Editar docente seleccionado">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-1.172 1.172-2.828-2.828 1.172-1.172zM11.172 6l-6.586 6.586V16h3.414L14.586 9.414 11.172 6z" /></svg>
                </button>
            </div>
          </InputField>
          <InputField label="Fecha">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#A3DFFF] focus:border-transparent" />
          </InputField>
          <InputField label="Curso">
            <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#A3DFFF] focus:border-transparent">
              {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </InputField>
          <InputField label="Asignatura">
            <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#A3DFFF] focus:border-transparent">
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </InputField>
        </div>
        <InputField label="Contenido Registrado">
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#A3DFFF] focus:border-transparent" placeholder="Describa el contenido de la clase..."></textarea>
        </InputField>
        <InputField label="Observaciones (Opcional)">
          <textarea value={observations} onChange={(e) => setObservations(e.target.value)} rows={2} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#A3DFFF] focus:border-transparent" placeholder="Observaciones adicionales..."></textarea>
        </InputField>
        <div className="flex justify-end pt-4 space-x-3">
          <button type="button" onClick={onClose} className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">Cancelar</button>
          <button type="submit" className="px-6 py-2 text-white bg-sky-500 rounded-lg hover:bg-sky-600 transition-colors shadow-md hover:shadow-lg">Guardar Registro</button>
        </div>
      </form>

      <Modal isOpen={isTeacherModalOpen} onClose={() => setIsTeacherModalOpen(false)} title={teacherToEdit ? 'Editar Docente' : 'Añadir Nuevo Docente'}>
        <form onSubmit={handleSaveTeacher} className="space-y-4">
          <div>
            <label htmlFor="teacherName" className="block text-sm font-medium text-gray-700 mb-1">Nombre del Docente</label>
            <input 
              id="teacherName"
              type="text"
              value={teacherNameInput}
              onChange={(e) => setTeacherNameInput(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#A3DFFF] focus:border-transparent"
              required
              autoFocus
            />
          </div>
          <div className="flex justify-end pt-4 space-x-3">
            <button type="button" onClick={() => setIsTeacherModalOpen(false)} className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">Cancelar</button>
            <button type="submit" className="px-6 py-2 text-white bg-sky-500 rounded-lg hover:bg-sky-600 transition-colors">Guardar</button>
          </div>
        </form>
      </Modal>
    </>
  );
};