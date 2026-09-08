import React from 'react';
import {
  SearchCode,
  CheckCircle,
  Layers,
  FileCode,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Database
} from 'lucide-react';
import { LoopDiagnosticResult, PaginationStrategyType } from './types';

interface LoopDiagnosticCardProps {
  diagnostic: LoopDiagnosticResult;
  paginationStrategy: PaginationStrategyType;
  onSelectStrategy: (strat: PaginationStrategyType) => void;
  manualTotalPages: string;
  onChangeManualTotalPages: (val: string) => void;
}

export const LoopDiagnosticCard: React.FC<LoopDiagnosticCardProps> = ({
  diagnostic,
  paginationStrategy,
  onSelectStrategy,
  manualTotalPages,
  onChangeManualTotalPages
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl text-slate-300">
      <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <SearchCode className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
              Diagnóstico de Payload & Paginação
              <span className="text-[10px] uppercase font-bold bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30">
                IA Auto-Detect
              </span>
            </h4>
            <p className="text-xs text-slate-400">Inspeção em tempo real da estrutura retornada pela API</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400">Estratégia Recomendada:</span>
          <span className="font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            {diagnostic.recommendedStrategy === 'total_pages' ? 'Por Total de Páginas' :
             diagnostic.recommendedStrategy === 'array_length' ? 'Por Quantidade (Array Length)' : 'Lote Único em Memória'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        {}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
          <div className="text-slate-400 flex items-center justify-between mb-1">
            <span className="font-medium flex items-center gap-1 text-slate-300">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Chave do Array
            </span>
            {diagnostic.arrayKeyFound ? (
              <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                <CheckCircle className="w-3 h-3" /> Encontrado
              </span>
            ) : (
              <span className="text-amber-400 flex items-center gap-1 text-[11px]">
                <AlertCircle className="w-3 h-3" /> Raiz / Indefinido
              </span>
            )}
          </div>
          <p className="text-white font-mono font-semibold text-xs truncate">
            {diagnostic.arrayPath}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {diagnostic.itemCount} itens detectados no payload de exemplo
          </p>
        </div>

        {}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
          <div className="text-slate-400 flex items-center justify-between mb-1">
            <span className="font-medium flex items-center gap-1 text-slate-300">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              Controle de Páginas
            </span>
            {diagnostic.hasTotalPagesField ? (
              <span className="text-cyan-400 font-mono text-[11px]">
                "{diagnostic.totalPagesKeyFound}": {diagnostic.totalPagesFoundValue}
              </span>
            ) : (
              <span className="text-slate-500 text-[11px]">Não detectado no JSON</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <label className="text-[11px] text-slate-400 whitespace-nowrap">Forçar páginas:</label>
            <input
              type="number"
              placeholder="Ex: 5"
              value={manualTotalPages}
              onChange={(e) => onChangeManualTotalPages(e.target.value)}
              className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>

        {}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
          <div className="text-slate-400 flex items-center gap-1 mb-1 font-medium text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Diagnóstico do Loop
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-2">
            {diagnostic.diagnosisSummary}
          </p>
        </div>
      </div>
    </div>
  );
};
