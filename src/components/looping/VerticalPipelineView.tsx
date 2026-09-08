import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Repeat,
  Sparkles,
  Cable,
  Plus,
  Trash2,
  CheckCircle2,
  CheckCircle,
  Eye,
  Settings2,
  Sliders,
  ChevronDown,
  ChevronUp,
  CornerLeftUp,
  RotateCcw,
  Zap,
  LayoutList,
  Columns,
  Moon,
  Sun,
  Bot,
  MessageSquareQuote,
  Edit3
} from 'lucide-react';
import { NodeDefinition, PipelineOrientationType } from './types';

interface VerticalPipelineViewProps {
  initialNodes: NodeDefinition[];
  loopNodes: NodeDefinition[];
  selectedNodeKey: string;
  onSelectNode: (key: string) => void;
  onMoveInitialNode: (index: number, direction: 'up' | 'down') => void;
  onMoveLoopNode: (index: number, direction: 'up' | 'down') => void;
  onRemoveOptionalNode: (key: string) => void;
  loopTargetLabel: string;
  onChangeLoopTargetLabel?: (newLabel: string) => void;
  orientation: PipelineOrientationType;
  onToggleOrientation: () => void;
  
  hasAuthStep: boolean;
  onToggleAuthStep: () => void;
  hasSecondaryApi: boolean;
  onToggleSecondaryApi: () => void;
  hasDatabaseStep: boolean;
  onToggleDatabaseStep: () => void;
  
  aiInstructions?: Record<string, string>;
  onUpdateAiInstruction?: (nodeKey: string, text: string) => void;
}

export const VerticalPipelineView: React.FC<VerticalPipelineViewProps> = ({
  initialNodes = [],
  loopNodes = [],
  selectedNodeKey,
  onSelectNode,
  onMoveInitialNode,
  onMoveLoopNode,
  onRemoveOptionalNode,
  loopTargetLabel,
  onChangeLoopTargetLabel,
  orientation,
  onToggleOrientation,
  hasAuthStep,
  onToggleAuthStep,
  hasSecondaryApi,
  onToggleSecondaryApi,
  hasDatabaseStep,
  onToggleDatabaseStep,
  aiInstructions = {},
  onUpdateAiInstruction = (_nodeKey: string, _text: string) => {}
}) => {
  const [expandedAiCards, setExpandedAiCards] = useState<Record<string, boolean>>({});
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [tempLabel, setTempLabel] = useState(loopTargetLabel);

  const toggleExpandAi = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedAiCards(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveLabel = () => {
    if (tempLabel.trim() && onChangeLoopTargetLabel) {
      onChangeLoopTargetLabel(tempLabel.trim());
    }
    setIsEditingLabel(false);
  };

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 px-4 shadow-md">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <LayoutList className="w-4 h-4 text-cyan-400" />
            Fluxo Vertical de Execução:
          </span>
          <span className="text-xs font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <ArrowDown className="w-3 h-3 text-cyan-400 animate-bounce" />
            De Cima para Baixo
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {}
          {!hasAuthStep && (
            <button
              type="button"
              onClick={onToggleAuthStep}
              className="text-xs font-medium bg-slate-800 hover:bg-slate-700 text-blue-300 border border-blue-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-sm"
            >
              <Plus className="w-3 h-3 text-blue-400" /> + Auth Token
            </button>
          )}

          {!hasSecondaryApi && (
            <button
              type="button"
              onClick={onToggleSecondaryApi}
              className="text-xs font-medium bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-sm"
            >
              <Plus className="w-3 h-3 text-purple-400" /> + Consulta Extra
            </button>
          )}

          {!hasDatabaseStep && (
            <button
              type="button"
              onClick={onToggleDatabaseStep}
              className="text-xs font-medium bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-sm"
            >
              <Plus className="w-3 h-3 text-amber-400" /> + Gravação em Banco
            </button>
          )}
        </div>
      </div>

      {}
      <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-5 shadow-xl relative">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold flex items-center justify-center">
              1
            </span>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Etapas Iniciais (Setup & Aquisição de Dados)
            </h4>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Executado 1x por rodada</span>
        </div>

        <div className="flex flex-col items-stretch space-y-3">
          {initialNodes.map((node, index) => {
            const isSelected = selectedNodeKey === node.key;
            const nodeAiText = aiInstructions[node.key] || '';
            const hasUserInstruction = !!nodeAiText.trim();
            
            const isDarkStandby = !isSelected && !hasUserInstruction;
            const isAiExpanded = expandedAiCards[node.key] ?? false;

            return (
              <React.Fragment key={node.key}>
                <div
                  onClick={() => onSelectNode(node.key)}
                  className={`relative p-4 rounded-xl border transition-all cursor-pointer select-none group ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-400 ring-2 ring-cyan-500/40 shadow-2xl shadow-cyan-950/70 text-white'
                      : isDarkStandby
                      ? 'bg-slate-950/80 hover:bg-slate-900/90 border-slate-900 hover:border-slate-700 text-slate-500 hover:text-slate-300 opacity-65 hover:opacity-100 shadow-inner'
                      : 'bg-slate-900/90 border-slate-700/80 text-slate-200 shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-md shadow-cyan-500/20'
                          : isDarkStandby
                          ? 'bg-slate-950 border-slate-800 text-slate-600'
                          : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}>
                        {React.createElement(node.icon, { className: "w-5 h-5" })}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-extrabold ${isSelected ? 'text-cyan-300' : isDarkStandby ? 'text-slate-400' : 'text-white'}`}>
                            {node.title}
                          </span>

                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                            isSelected
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                              : isDarkStandby
                              ? 'bg-slate-950 text-slate-600 border-slate-900'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}>
                            {node.badgeTag}
                          </span>

                          {hasUserInstruction ? (
                            <span className="text-[10px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                              <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                              Instrução de IA Ativa
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-slate-500 bg-slate-950 border border-slate-900 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Moon className="w-2.5 h-2.5 text-slate-600" />
                              Aguardando instrução
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">{node.subtitle}</p>

                        <div className="mt-2.5 pt-2 border-t border-slate-800/80">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-indigo-300 flex items-center gap-1.5">
                              <Bot className="w-3.5 h-3.5 text-indigo-400" />
                              Instrução de IA em Texto Livre para este Nó:
                            </label>
                            <button
                              type="button"
                              onClick={(e) => toggleExpandAi(node.key, e)}
                              className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-0.5 cursor-pointer bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700"
                            >
                              {isAiExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              {isAiExpanded ? 'Recolher' : 'Expandir Texto'}
                            </button>
                          </div>

                          <div className="mt-1.5">
                            <textarea
                              rows={isAiExpanded ? 3 : 1}
                              value={nodeAiText}
                              onChange={(e) => onUpdateAiInstruction(node.key, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              placeholder={`Ex: O que a IA deve fazer aqui? (ex: "Tratar para ignorar contratos inativos")...`}
                              className={`w-full bg-slate-950 border rounded-lg p-2 text-xs text-white placeholder-slate-600 focus:outline-none transition-all ${
                                hasUserInstruction
                                  ? 'border-indigo-500/50 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400'
                                  : 'border-slate-800 focus:border-slate-600'
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMoveInitialNode(index, 'up');
                          }}
                          className="p-1.5 text-slate-500 hover:text-cyan-400 hover:bg-slate-800 rounded transition-all cursor-pointer"
                          title="Mover para cima"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {index < initialNodes.length - 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMoveInitialNode(index, 'down');
                          }}
                          className="p-1.5 text-slate-500 hover:text-cyan-400 hover:bg-slate-800 rounded transition-all cursor-pointer"
                          title="Mover para baixo"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {node.isOptional && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveOptionalNode(node.key);
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition-all cursor-pointer"
                          title="Remover etapa opcional"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {index < initialNodes.length - 1 && (
                  <div className="flex justify-center my-0.5">
                    <ArrowDown className="w-4 h-4 text-slate-600 animate-bounce" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center my-2">
        <div className="w-0.5 h-6 bg-gradient-to-b from-slate-700 to-[#00D2FF]"></div>
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00D2FF]/10 border border-[#00D2FF]/40 text-[#00D2FF] text-xs font-extrabold shadow-lg shadow-[#00D2FF]/15">
          <Repeat className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} />
          Entrada no Ponto de Repetição do Loop
        </div>
        <div className="w-0.5 h-6 bg-gradient-to-b from-[#00D2FF] to-indigo-500"></div>
      </div>

      <div className="bg-slate-950/80 border-2 border-indigo-500/40 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold flex items-center justify-center">
              2
            </span>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                Ciclo do Looping (Iteração Contínua)
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/90 border border-indigo-500/30 rounded-xl px-3 py-1.5">
            <span className="text-[11px] text-slate-400 font-semibold">Ponto do Loop (Label):</span>
            {isEditingLabel ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={tempLabel}
                  onChange={(e) => setTempLabel(e.target.value)}
                  className="bg-slate-950 border border-cyan-400 text-cyan-300 text-xs font-mono px-2 py-0.5 rounded focus:outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleSaveLabel}
                  className="px-2 py-0.5 bg-cyan-500 text-slate-950 text-xs font-bold rounded cursor-pointer"
                >
                  Salvar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950 border border-cyan-800 px-2 py-0.5 rounded">
                  "{loopTargetLabel}"
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setTempLabel(loopTargetLabel);
                    setIsEditingLabel(true);
                  }}
                  className="text-slate-400 hover:text-cyan-300 p-0.5 rounded cursor-pointer"
                  title="Alterar nome do marcador de loop"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-stretch space-y-3">
          {loopNodes.map((node, index) => {
            const isSelected = selectedNodeKey === node.key;
            const isLoopStart = node.key === 'loop_label';
            const isLoopBack = node.key === 'loop_goto';
            const nodeAiText = aiInstructions[node.key] || '';
            const hasUserInstruction = !!nodeAiText.trim();
            const isDarkStandby = !isSelected && !hasUserInstruction && !isLoopStart && !isLoopBack;
            const isAiExpanded = expandedAiCards[node.key] ?? false;

            return (
              <React.Fragment key={node.key}>
                <div
                  onClick={() => onSelectNode(node.key)}
                  className={`relative p-4 rounded-xl border transition-all cursor-pointer select-none group ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-400 ring-2 ring-cyan-500/50 shadow-2xl shadow-cyan-950/70 text-white'
                      : isLoopStart
                      ? 'bg-[#00D2FF]/10 border-[#00D2FF]/50 text-[#00D2FF] hover:bg-[#00D2FF]/15 shadow-lg shadow-[#00D2FF]/10'
                      : isLoopBack
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/15 shadow-lg shadow-amber-500/10'
                      : isDarkStandby
                      ? 'bg-slate-950/80 hover:bg-slate-900/90 border-slate-900 hover:border-slate-700 text-slate-500 hover:text-slate-300 opacity-65 hover:opacity-100 shadow-inner'
                      : 'bg-slate-900/90 border-slate-700/80 text-slate-200 shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-md shadow-cyan-500/20'
                          : isLoopStart
                          ? 'bg-[#00D2FF]/20 border-[#00D2FF]/50 text-[#00D2FF]'
                          : isLoopBack
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                          : isDarkStandby
                          ? 'bg-slate-950 border-slate-800 text-slate-600'
                          : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}>
                        {React.createElement(node.icon, { className: "w-5 h-5" })}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-extrabold ${isSelected ? 'text-cyan-300' : isLoopStart ? 'text-[#00D2FF]' : isLoopBack ? 'text-amber-300' : isDarkStandby ? 'text-slate-400' : 'text-white'}`}>
                            {node.title}
                          </span>

                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                            isLoopStart
                              ? 'bg-[#00D2FF]/20 text-[#00D2FF] border-[#00D2FF]/40'
                              : isLoopBack
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : isSelected
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                              : isDarkStandby
                              ? 'bg-slate-950 text-slate-600 border-slate-900'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}>
                            {node.badgeTag}
                          </span>

                          {hasUserInstruction ? (
                            <span className="text-[10px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                              <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                              Instrução de IA Ativa
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-slate-500 bg-slate-950 border border-slate-900 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Moon className="w-2.5 h-2.5 text-slate-600" />
                              Aguardando instrução
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">{node.subtitle}</p>

                        {!isLoopStart && (
                          <div className="mt-2.5 pt-2 border-t border-slate-800/80">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-bold text-indigo-300 flex items-center gap-1.5">
                                <Bot className="w-3.5 h-3.5 text-indigo-400" />
                                Instrução de IA em Texto Livre para este Nó:
                              </label>
                              <button
                                type="button"
                                onClick={(e) => toggleExpandAi(node.key, e)}
                                className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-0.5 cursor-pointer bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700"
                              >
                                {isAiExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                {isAiExpanded ? 'Recolher' : 'Expandir Texto'}
                              </button>
                            </div>

                            <div className="mt-1.5">
                              <textarea
                                rows={isAiExpanded ? 3 : 1}
                                value={nodeAiText}
                                onChange={(e) => onUpdateAiInstruction(node.key, e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                placeholder={`Ex: Como processar cada item nesta iteração (ex: "Enviar HSM com nome, telefone e código de barras")...`}
                                className={`w-full bg-slate-950 border rounded-lg p-2 text-xs text-white placeholder-slate-600 focus:outline-none transition-all ${
                                  hasUserInstruction
                                    ? 'border-indigo-500/50 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400'
                                    : 'border-slate-800 focus:border-slate-600'
                                }`}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      {index > 0 && !isLoopStart && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMoveLoopNode(index, 'up');
                          }}
                          className="p-1.5 text-slate-500 hover:text-cyan-400 hover:bg-slate-800 rounded transition-all cursor-pointer"
                          title="Mover para cima"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {index < loopNodes.length - 1 && !isLoopBack && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMoveLoopNode(index, 'down');
                          }}
                          className="p-1.5 text-slate-500 hover:text-cyan-400 hover:bg-slate-800 rounded transition-all cursor-pointer"
                          title="Mover para baixo"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {node.isOptional && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveOptionalNode(node.key);
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition-all cursor-pointer"
                          title="Remover etapa opcional"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {index < loopNodes.length - 1 && (
                  <div className="flex justify-center my-0.5">
                    <ArrowDown className="w-4 h-4 text-indigo-400/60" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between bg-slate-900/95 rounded-xl p-3.5 border border-indigo-500/30 shadow-lg">
          <div className="flex items-center gap-2 text-xs text-amber-300 font-bold">
            <CornerLeftUp className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Enlace de Retorno: Goto salta de volta para o Marcador "{loopTargetLabel}"</span>
          </div>
          <span className="text-[11px] text-cyan-300 font-mono bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
            Fila Dinâmica (.shift)
          </span>
        </div>
      </div>
    </div>
  );
};
