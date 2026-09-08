import React from 'react';
import { Bot, Layers, BookOpen, Sun, Moon, Repeat, Stethoscope, Play } from 'lucide-react';

export type AppTabType = 'builder' | 'converter' | 'looping' | 'auditor' | 'e2e' | 'templates';

interface NavbarProps {
  activeTab?: AppTabType;
  onSelectTab?: (tab: AppTabType) => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab = 'builder',
  onSelectTab,
  theme = 'dark',
  onToggleTheme
}) => {
  return (
    <header className="sticky top-0 z-50 bg-[#020b18]/90 backdrop-blur-xl border-b border-[#0066FF]/20 text-white shadow-xl transition-all">
      <div className="max-w-[1700px] w-full mx-auto px-4 sm:px-8 lg:px-12 h-16 flex items-center justify-between gap-4">

        {}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0052FF] to-[#00D2FF] p-0.5 shadow-md shadow-[#0066FF]/30 flex items-center justify-center">
              <div className="w-full h-full bg-[#020b18] rounded-[10px] flex items-center justify-center">
                <svg className="w-4.5 h-4.5 text-[#0066FF]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L13.8 8.2L20.2 6.4L15.6 11L21.8 12.8L15.6 14.6L20.2 19.2L13.8 17.4L12 23.6L10.2 17.4L3.8 19.2L8.4 14.6L2.2 12.8L8.4 11L3.8 6.4L10.2 8.2L12 2Z" />
                </svg>
              </div>
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black tracking-tight text-white font-sans">
                fortics
              </span>
              <span className="text-xs font-bold text-[#00D2FF] tracking-wider uppercase">
                Studio
              </span>
            </div>
          </div>
        </div>

        {}
        <div className="flex items-center gap-3">
          {onSelectTab && (
            <nav className="flex items-center bg-[#061325]/90 p-1 rounded-full border border-[#0066FF]/25 shadow-inner">
              <button
                type="button"
                onClick={() => onSelectTab('builder')}
                className={`px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'builder'
                    ? 'bg-[#0066FF] text-white shadow-lg shadow-[#0066FF]/40'
                    : 'text-slate-300 hover:text-white hover:bg-[#0066FF]/10'
                  }`}
              >
                <Bot className="w-4 h-4" />
                <span>Criador</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('converter')}
                className={`px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'converter'
                    ? 'bg-[#0066FF] text-white shadow-lg shadow-[#0066FF]/40'
                    : 'text-slate-300 hover:text-white hover:bg-[#0066FF]/10'
                  }`}
              >
                <Layers className="w-4 h-4" />
                <span>Conversor</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('looping')}
                className={`px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'looping'
                    ? 'bg-gradient-to-r from-[#0052FF] to-[#00D2FF] text-white shadow-lg shadow-[#0066FF]/40'
                    : 'text-slate-300 hover:text-[#00D2FF] hover:bg-[#0066FF]/10'
                  }`}
              >
                <Repeat className="w-4 h-4 text-[#00D2FF]" />
                <span>Looping</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('auditor')}
                className={`px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'auditor'
                    ? 'bg-[#00D2FF] text-slate-950 font-black shadow-lg shadow-[#00D2FF]/40'
                    : 'text-slate-300 hover:text-[#00D2FF] hover:bg-[#0066FF]/10'
                  }`}
              >
                <Stethoscope className="w-4 h-4" />
                <span>Auditor IA</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('e2e')}
                className={`px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'e2e'
                    ? 'bg-gradient-to-r from-[#0052FF] to-[#00D2FF] text-white shadow-lg shadow-[#0066FF]/40'
                    : 'text-slate-300 hover:text-[#00D2FF] hover:bg-[#0066FF]/10'
                  }`}
              >
                <Play className="w-3.5 h-3.5 fill-current text-[#00D2FF]" />
                <span>Teste E2E</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('templates')}
                className={`px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'templates'
                    ? 'bg-[#0066FF] text-white shadow-lg shadow-[#0066FF]/40'
                    : 'text-slate-300 hover:text-white hover:bg-[#0066FF]/10'
                  }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Guia</span>
              </button>
            </nav>
          )}

          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              className="p-2.5 rounded-full bg-[#061325]/90 hover:bg-[#0066FF]/20 border border-[#0066FF]/30 text-slate-200 hover:text-white transition-all cursor-pointer shadow-md flex items-center justify-center"
              title={theme === 'dark' ? 'Mudar para Tema Claro (Branco)' : 'Mudar para Tema Escuro (Dark)'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-300 animate-fadeIn" />
              ) : (
                <Moon className="w-4 h-4 text-[#0066FF] animate-fadeIn" />
              )}
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
