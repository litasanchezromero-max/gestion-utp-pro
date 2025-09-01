import React from 'react';

interface HeaderProps {
    onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onExport: () => void;
    isExporting: boolean;
    isImporting: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onImport, onExport, isExporting, isImporting }) => {
    const importInputRef = React.useRef<HTMLInputElement>(null);

    return (
        <header className="sticky top-0 z-30 w-full p-4 bg-white/60 backdrop-blur-lg border-b border-white/30">
            <div className="flex items-center justify-between">
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">Panel de Jefatura UTP</h1>
                <div className="flex items-center space-x-2">
                     <input
                        type="file"
                        accept=".pdf"
                        onChange={onImport}
                        className="hidden"
                        ref={importInputRef}
                        disabled={isImporting}
                    />
                    <button onClick={() => importInputRef.current?.click()} disabled={isImporting} className="px-4 py-2 text-sm font-medium text-sky-700 bg-sky-100 rounded-lg hover:bg-sky-200 transition-colors disabled:bg-gray-300 disabled:cursor-wait">
                        {isImporting ? 'Importando...' : 'Importar PDF'}
                    </button>
                    <button onClick={onExport} disabled={isExporting} className="px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-100 rounded-lg hover:bg-emerald-200 transition-colors disabled:bg-gray-300 disabled:cursor-wait">
                        {isExporting ? 'Exportando...' : 'Exportar PDF'}
                    </button>
                </div>
            </div>
        </header>
    );
};