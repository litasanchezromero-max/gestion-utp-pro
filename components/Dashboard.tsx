
import React from 'react';
import { Teacher, ContentLog } from '../types';
import { GlassCard } from './GlassCard';
import { ProgressBar } from './ProgressBar';

interface DashboardProps {
  teachers: Teacher[];
  contentLogs: ContentLog[];
}

const calculateProgress = (teacherId: string, logs: ContentLog[]): number => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const teacherLogsInLast30Days = logs.filter(
    (log) => log.teacherId === teacherId && new Date(log.date) >= thirtyDaysAgo
  ).length;
  
  // Assuming 20 working days in the last 30 days as a baseline for 100%
  const progress = (teacherLogsInLast30Days / 20) * 100;

  return Math.min(100, progress);
};


export const Dashboard: React.FC<DashboardProps> = ({ teachers, contentLogs }) => {
    const totalLogs = contentLogs.length;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentLogsCount = contentLogs.filter(log => new Date(log.date) >= thirtyDaysAgo).length;


  return (
    <div className="p-4 md:p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Resumen de Cumplimiento</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <GlassCard className='p-6'>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Registros Totales</h3>
            <p className="text-4xl font-bold text-sky-600">{totalLogs}</p>
        </GlassCard>
        <GlassCard className='p-6'>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Registros (Últimos 30 días)</h3>
            <p className="text-4xl font-bold text-emerald-600">{recentLogsCount}</p>
        </GlassCard>
      </div>

      <h3 className="text-2xl font-bold text-gray-800 mb-6">Progreso por Docente</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {teachers.map((teacher) => {
          const progress = calculateProgress(teacher.id, contentLogs);
          return (
            <GlassCard key={teacher.id} className="p-6 flex flex-col justify-between">
              <div>
                <h4 className="text-xl font-semibold text-gray-800 truncate">{teacher.name}</h4>
                <p className="text-sm text-gray-500 mb-4">Cumplimiento mensual estimado</p>
              </div>
              <div>
                <ProgressBar percentage={progress} />
                <p className="text-right font-semibold text-gray-700 mt-2">{progress.toFixed(0)}%</p>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};
