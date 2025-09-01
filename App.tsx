import React, { useState, useCallback, useEffect } from 'react';
import { AppData, AppView, ContentLog, Teacher, Course, Subject } from './types';
import { INITIAL_DATA } from './data/initialData';
import { Logo } from './components/Logo';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Dashboard } from './components/Dashboard';
import { RegisterView } from './components/RegisterView';
import { ReportView } from './components/ReportView';
import { PdfExport } from './components/PdfExport';
import { ExportModal } from './components/ExportModal';
import { LoadingSpinner } from './components/LoadingSpinner';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenAI, Type } from "@google/genai";
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from './firebase/config';


const NavItem: React.FC<{
  icon: JSX.Element;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col md:flex-row items-center justify-center md:justify-start w-full md:w-auto p-3 md:px-4 md:py-3 rounded-lg transition-all duration-200 ${
      isActive
        ? 'bg-sky-100 text-sky-700'
        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
    }`}
  >
    <div className="w-6 h-6 mb-1 md:mb-0 md:mr-3">{icon}</div>
    <span className="text-xs md:text-base font-medium">{label}</span>
  </button>
);

type ExportConfig = { type: 'all' } | { type: 'teacher', teacherId: string };

const App: React.FC = () => {
  const [appData, setAppData] = useState<AppData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<AppView>('dashboard');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportConfig, setExportConfig] = useState<ExportConfig | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  
  useEffect(() => {
    const docRef = doc(db, 'utp-data', 'singleton');

    const unsubscribe = onSnapshot(docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setAppData(docSnap.data() as AppData);
        } else {
          console.log("Documento no encontrado. Creando base de datos con datos iniciales.");
          setDoc(docRef, INITIAL_DATA).catch(e => {
            console.error("Error al inicializar la base de datos: ", e);
            setError("No se pudo inicializar la base de datos.");
          });
          setAppData(INITIAL_DATA);
        }
        setIsLoading(false);
      },
      (err) => {
        console.error("Error al obtener datos de Firestore: ", err);
        setError("No se pudo conectar a la base de datos. Verifique su conexión y la configuración.");
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const updateCloudData = useCallback(async (dataToUpdate: AppData) => {
    try {
      const docRef = doc(db, 'utp-data', 'singleton');
      await setDoc(docRef, dataToUpdate);
    } catch (err) {
      console.error("Error al actualizar datos en Firestore: ", err);
      alert("Hubo un error al guardar los datos. Por favor, intente de nuevo.");
    }
  }, []);

  const addContentLog = useCallback((newLog: ContentLog) => {
    if (!appData) return;
    const newAppData = { ...appData, contentLogs: [...appData.contentLogs, newLog] };
    updateCloudData(newAppData);
  }, [appData, updateCloudData]);

  const handleAddTeacher = useCallback((name: string) => {
    if (!appData) return;
    const newTeacher = { id: uuidv4(), name };
    const newAppData = { ...appData, teachers: [...appData.teachers, newTeacher] };
    updateCloudData(newAppData);
  }, [appData, updateCloudData]);

  const handleUpdateTeacher = useCallback((teacherId: string, newName: string) => {
    if (!appData) return;
    const newAppData = {
      ...appData,
      teachers: appData.teachers.map(t =>
        t.id === teacherId ? { ...t, name: newName } : t
      ),
    };
    updateCloudData(newAppData);
  }, [appData, updateCloudData]);


  const handleExport = () => {
    if (!appData || appData.contentLogs.length === 0) {
        alert("No hay datos para exportar.");
        return;
    }
    setIsExportModalOpen(true);
  };

  const handleGenerateExport = (config: ExportConfig) => {
    setExportConfig(config);
    setIsExportModalOpen(false);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !appData) return;

    setIsImporting(true);
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);

    fileReader.onload = async (e) => {
        try {
            if (typeof e.target?.result !== 'string') {
                throw new Error("No se pudo leer el archivo.");
            }

            const base64Data = e.target.result.split(',')[1];
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const responseSchema = {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        date: { type: Type.STRING, description: "Fecha en formato YYYY-MM-DD" },
                        teacher: { type: Type.STRING, description: "Nombre completo del docente" },
                        course: { type: Type.STRING, description: "Nombre del curso" },
                        subject: { type: Type.STRING, description: "Nombre de la asignatura" },
                        content: { type: Type.STRING, description: "Descripción del contenido registrado" },
                    },
                    required: ["date", "teacher", "course", "subject", "content"],
                },
            };

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: {
                    parts: [
                        { text: `Analiza el documento PDF adjunto que contiene una tabla con registros de contenido de clases. Extrae la información de cada fila de la tabla y devuélvela como un array de objetos JSON. Cada objeto debe representar una fila y ajustarse al esquema proporcionado. Ignora cualquier otra información en el PDF que no sea la tabla de registros.` },
                        { inlineData: { mimeType: 'application/pdf', data: base64Data } },
                    ],
                },
                config: { responseMimeType: "application/json", responseSchema: responseSchema },
            });
            
            const extractedLogs = JSON.parse(response.text) as { date: string; teacher: string; course: string; subject: string; content: string; }[];
            
            const currentData = appData;
            const newTeachers = [...currentData.teachers];
            const newCourses = [...currentData.courses];
            const newSubjects = [...currentData.subjects];
            const newContentLogs = [...currentData.contentLogs];

            const findOrCreate = (collection: (Teacher | Course | Subject)[], name: string): Teacher | Course | Subject => {
                let item = collection.find(i => i.name.trim().toLowerCase() === name.trim().toLowerCase());
                if (!item) {
                    item = { id: uuidv4(), name: name.trim() };
                    (collection as any[]).push(item);
                }
                return item;
            };

            for (const log of extractedLogs) {
                if(!log.teacher || !log.course || !log.subject || !log.content) continue;

                const teacher = findOrCreate(newTeachers, log.teacher) as Teacher;
                const course = findOrCreate(newCourses, log.course) as Course;
                const subject = findOrCreate(newSubjects, log.subject) as Subject;

                const logExists = newContentLogs.some(l => 
                    l.date === log.date && 
                    l.teacherId === teacher.id && 
                    l.courseId === course.id && 
                    l.subjectId === subject.id &&
                    l.content.trim() === log.content.trim()
                );

                if (!logExists) {
                    newContentLogs.push({
                        id: uuidv4(),
                        teacherId: teacher.id,
                        courseId: course.id,
                        subjectId: subject.id,
                        date: log.date,
                        content: log.content,
                    });
                }
            }
            
            await updateCloudData({ teachers: newTeachers, courses: newCourses, subjects: newSubjects, contentLogs: newContentLogs });

            alert("Datos importados con éxito desde el PDF.");
        } catch (err) {
            console.error("Error al procesar el PDF con la IA:", err);
            alert("Error al procesar el PDF. Asegúrese de que el formato es correcto y contiene una tabla válida. Revise la consola para más detalles.");
        } finally {
            setIsImporting(false);
            if (event.target) event.target.value = ''; // Reset file input
        }
    };
    
    fileReader.onerror = () => {
        alert("Error al leer el archivo.");
        setIsImporting(false);
        if (event.target) event.target.value = '';
    };
  };

  const renderActiveView = () => {
    if (!appData) return null;
    switch (activeView) {
      case 'dashboard':
        return <Dashboard teachers={appData.teachers} contentLogs={appData.contentLogs} />;
      case 'register':
        return <RegisterView 
                  appData={appData} 
                  onAddLog={addContentLog} 
                  onAddTeacher={handleAddTeacher}
                  onUpdateTeacher={handleUpdateTeacher}
                />;
      case 'report':
        return <ReportView appData={appData} />;
      default:
        return <Dashboard teachers={appData.teachers} contentLogs={appData.contentLogs} />;
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Cargando datos desde la nube..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-red-50 text-red-700 p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Error de Conexión</h2>
        <p>{error}</p>
        <p className="mt-4 text-sm">Por favor, refresque la página para intentarlo de nuevo.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f4f8]">
      {isExportModalOpen && appData && (
        <ExportModal 
          teachers={appData.teachers}
          onClose={() => setIsExportModalOpen(false)}
          onGenerate={handleGenerateExport}
        />
      )}
      {exportConfig && appData && <PdfExport appData={appData} exportConfig={exportConfig} onFinished={() => setExportConfig(null)} />}
      <div className="flex flex-1 flex-col md:flex-row">
        {/* Sidebar */}
        <nav className="fixed bottom-0 md:relative w-full md:w-64 bg-white/70 backdrop-blur-xl border-t md:border-t-0 md:border-r border-white/30 z-40">
          <div className="hidden md:flex flex-col items-center p-6 border-b border-gray-200">
            <Logo className="h-16 w-16" />
            <h2 className="text-xl font-bold text-gray-800 mt-2">Gestión UTP</h2>
          </div>
          <div className="flex md:flex-col justify-around md:justify-start p-2 md:p-4 md:space-y-2">
            <NavItem
              label="Dashboard"
              isActive={activeView === 'dashboard'}
              onClick={() => setActiveView('dashboard')}
              icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>}
            />
            <NavItem
              label="Registrar"
              isActive={activeView === 'register'}
              onClick={() => setActiveView('register')}
              icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
            />
            <NavItem
              label="Reportes"
              isActive={activeView === 'report'}
              onClick={() => setActiveView('report')}
              icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
            />
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 flex flex-col pb-16 md:pb-0">
          <Header onImport={handleImport} onExport={handleExport} isExporting={exportConfig !== null} isImporting={isImporting} />
          <div className="flex-1 overflow-y-auto">
            {renderActiveView()}
          </div>
        </main>
      </div>
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
};

export default App;