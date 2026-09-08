import React, { useState } from 'react';
import {
  Users,
  Settings,
  Sparkles,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Terminal,
  Radio,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  User,
  Bot,
  Layers,
  Info,
  Sliders,
  RotateCcw,
  ArrowRightLeft,
  ExternalLink,
  ShieldCheck,
  Tag,
  Power,
  Play
} from 'lucide-react';
import { MultiAgentPipelineConfig, SubAgentEndpoint } from '../types/fortics';
import { PRESET_SCENARIOS } from './E2ETester';

export interface MultiAgentPipelineControlProps {
  pipeline: MultiAgentPipelineConfig;
  onUpdatePipeline: (pipeline: MultiAgentPipelineConfig) => void;
  onOpenModal: () => void;
  onDisableMultiAgent: () => void;
  selectedPresetId: string;
  onSelectPreset: (presetId: string) => void;
  scenarioInstructions: string;
  onUpdateScenarioInstructions: (instructions: string) => void;
  customerData: {
    name: string;
    cpf: string;
    cnpj: string;
    phone: string;
    contract: string;
  };
  onUpdateCustomerData: (data: any) => void;
  isPersonaExpanded: boolean;
  onTogglePersona: () => void;
  maxTurns: number;
  onChangeMaxTurns: (turns: number) => void;
  autoStepDelay: number;
  onChangeAutoStepDelay: (delay: number) => void;
  sessionId: string;
  onResetSession: () => void;
  onTestAgentConnection: (agent: SubAgentEndpoint) => Promise<void>;
  testingAgentId: string | null;
  agentTestResults: Record<string, any>;
  showToast?: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const MultiAgentPipelineControl: React.FC<MultiAgentPipelineControlProps> = ({
  pipeline,
  onUpdatePipeline,
  onOpenModal,
  onDisableMultiAgent,
  selectedPresetId,
  onSelectPreset,
  scenarioInstructions,
  onUpdateScenarioInstructions,
  customerData,
  onUpdateCustomerData,
  isPersonaExpanded,
  onTogglePersona,
  maxTurns,
  onChangeMaxTurns,
  autoStepDelay,
  onChangeAutoStepDelay,
  sessionId,
  onResetSession,
  onTestAgentConnection,
  testingAgentId,
  agentTestResults,
  showToast
}) => {
  const [expandedAgentId, setExpandedAgentId] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(id);
    showToast?.('info', 'Copiado para a área de transferência!');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const activeCount = pipeline.subAgents.filter(a => a.enabled).length;

  return (
    <div className="space-y-4 animate-fadeIn">
      {}
      <div className="bg-[#020b18]/90 border border-indigo-500/40 rounded-3xl p-5 shadow-2xl space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-2 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-950/90 text-indigo-300 border border-indigo-500/30 shadow-inner">
              <Users className="w-5 h-5 text-[#00D2FF]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Pipeline Multi-Agentes</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold">
                  {activeCount} Agente{activeCount > 1 ? 's' : ''} Ativo{activeCount > 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Transbordo inteligente via tags de roteamento e handoff contextual
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenModal}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#0052FF] to-[#00D2FF] text-white text-xs font-bold shadow-lg shadow-[#0066FF]/30 hover:scale-105 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Gerenciar Agentes</span>
            </button>
            <button
              type="button"
              onClick={onDisableMultiAgent}
              className="px-2.5 py-1.5 rounded-xl bg-[#061325] text-slate-400 hover:text-white hover:bg-slate-800/60 border border-[#0066FF]/30 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
              title="Voltar para modo de teste com agente único"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Modo Agente Único</span>
            </button>
          </div>
        </div>

        {}
        <div className="bg-[#061325]/80 border border-indigo-500/20 rounded-2xl p-2.5 flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
          {pipeline.subAgents.map((agent, index) => {
            const isCurrentActive = agent.id === pipeline.activeAgentId;
            return (
              <React.Fragment key={agent.id}>
                <button
                  type="button"
                  onClick={() => setExpandedAgentId(expandedAgentId === agent.id ? null : agent.id)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    isCurrentActive
                      ? 'bg-indigo-950/90 border-[#00D2FF] text-white ring-1 ring-[#00D2FF]/40 shadow-sm'
                      : !agent.enabled
                      ? 'bg-slate-900/60 border-slate-700/40 text-slate-500 line-through'
                      : 'bg-[#020b18] border-[#0066FF]/20 text-slate-300 hover:text-white hover:border-[#0066FF]'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00D2FF]" />
                  <span>{index + 1}. {agent.name.replace(/Agente\s+/i, '')}</span>
                  {agent.triggerTag && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-900/60 text-indigo-300 font-mono">
                      {agent.triggerTag}
                    </span>
                  )}
                </button>
                {index < pipeline.subAgents.length - 1 && (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#00D2FF]" />
            <span>Agentes no Pipeline ({pipeline.subAgents.length})</span>
          </span>
          <span className="text-[11px] text-slate-400">
            Clique no agente para ver endpoint, cURL ou testar ping
          </span>
        </div>

        <div className="space-y-2">
          {pipeline.subAgents.map((agent, index) => {
            const isExpanded = expandedAgentId === agent.id;
            const isCurrentActive = agent.id === pipeline.activeAgentId;
            const isTesting = testingAgentId === agent.id;
            const testRes = agentTestResults[agent.id];

            return (
              <div
                key={agent.id}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isCurrentActive
                    ? 'bg-[#061833]/90 border-[#00D2FF]/60 shadow-lg shadow-[#00D2FF]/10'
                    : !agent.enabled
                    ? 'bg-[#020b18]/50 border-slate-800 text-slate-500 opacity-60'
                    : 'bg-[#020b18]/80 border-[#0066FF]/25 hover:border-[#0066FF]/60'
                }`}
              >
                <div className="p-3.5 flex items-center justify-between gap-2 cursor-pointer select-none" onClick={() => setExpandedAgentId(isExpanded ? null : agent.id)}>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-6 h-6 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                      agent.isMain
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    }`}>
                      {index + 1}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-white truncate">
                          {agent.name}
                        </span>
                        {agent.isMain && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40 font-bold">
                            Principal
                          </span>
                        )}
                        {agent.triggerTag && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-900/60 text-indigo-300 font-mono border border-indigo-500/40 font-bold">
                            {agent.triggerTag}
                          </span>
                        )}
                        {agent.isOptional ? (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-950 text-sky-300 border border-sky-500/30 font-semibold">
                            Opcional
                          </span>
                        ) : (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-700/40 font-semibold">
                            Obrigatório
                          </span>
                        )}
                        {isCurrentActive && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold animate-pulse">
                            Em Execução
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {agent.role}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTestAgentConnection(agent);
                      }}
                      disabled={isTesting || (!agent.parsedCurl?.url && !agent.rawCurl)}
                      className="px-2 py-1 rounded-lg bg-[#0066FF]/20 hover:bg-[#0066FF]/40 text-[#00D2FF] border border-[#0066FF]/40 text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 disabled:opacity-40"
                      title="Testar ping HTTP neste endpoint"
                    >
                      {isTesting ? (
                        <RefreshCw className="w-3 h-3 animate-spin text-[#00D2FF]" />
                      ) : (
                        <Radio className="w-3 h-3 text-[#00D2FF]" />
                      )}
                      <span className="hidden sm:inline">Ping</span>
                    </button>

                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-[#00D2FF]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-[#0066FF]/15 space-y-3 animate-fadeIn bg-[#020b18]/60">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block mb-0.5">Endpoint URL:</span>
                        <div className="bg-[#061325] text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-[#0066FF]/20 truncate font-mono flex items-center justify-between gap-1">
                          <span className="truncate">
                            <strong className="text-[#00D2FF]">{agent.parsedCurl?.method || 'POST'}</strong> {agent.parsedCurl?.url || '(Sem URL)'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block mb-0.5">Contexto & Handoff:</span>
                        <div className="bg-[#061325] text-slate-300 text-xs px-2.5 py-1.5 rounded-lg border border-[#0066FF]/20 truncate">
                          {agent.contextStrategy === 'full_history' ? 'Histórico Completo' : agent.contextStrategy === 'summary' ? 'Resumo Contextual' : 'Apenas Última Mensagem'}
                        </div>
                      </div>
                    </div>

                    {agent.initialMessage && (
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block mb-0.5">Mensagem Inicial do Agente:</span>
                        <div className="bg-[#061325] text-slate-300 p-2 rounded-lg border border-[#0066FF]/20 text-xs font-sans leading-relaxed">
                          "{agent.initialMessage}"
                        </div>
                      </div>
                    )}

                    {agent.rawCurl && (
                      <div>
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[10px] text-slate-400 font-bold">Comando cURL Configurado:</span>
                          <button
                            type="button"
                            onClick={() => handleCopyText(agent.rawCurl || '', `curl-${agent.id}`)}
                            className="text-[10px] text-[#00D2FF] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            {copiedField === `curl-${agent.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedField === `curl-${agent.id}` ? 'Copiado' : 'Copiar cURL'}</span>
                          </button>
                        </div>
                        <pre className="bg-[#061325] text-[#00D2FF] text-[11px] p-2.5 rounded-lg border border-[#0066FF]/25 font-mono overflow-x-auto max-h-28 custom-scrollbar">
                          {agent.rawCurl}
                        </pre>
                      </div>
                    )}

                    {testRes && (
                      <div className={`p-2.5 rounded-xl border text-xs space-y-1.5 ${
                        testRes.statusCode && testRes.statusCode >= 200 && testRes.statusCode < 300
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                          : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                      }`}>
                        <div className="flex items-center justify-between font-bold text-[11px]">
                          <span className="flex items-center gap-1.5">
                            {testRes.statusCode && testRes.statusCode >= 200 && testRes.statusCode < 300 ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                            )}
                            Status: HTTP {testRes.statusCode || (testRes.error ? 'Falha' : 'OK')}
                          </span>
                          {testRes.latencyMs && (
                            <span className="font-mono text-[10px] text-slate-300">
                              {testRes.latencyMs}ms
                            </span>
                          )}
                        </div>
                        {testRes.agentText && (
                          <div className="bg-[#020b18] text-slate-200 p-2 rounded text-[11px] font-sans">
                            {testRes.agentText}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-end pt-1">
                      <button
                        type="button"
                        onClick={onOpenModal}
                        className="text-xs text-[#00D2FF] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        <span>Editar cURL e JSON Spec deste Agente</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-[#020b18]/80 border border-[#0066FF]/30 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-[#00D2FF]" />
            <span>Cenário de Teste E2E & Persona</span>
          </h3>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Cenários de Teste Pré-Configurados:
          </label>
          <div className="space-y-1.5">
            {PRESET_SCENARIOS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectPreset(preset.id)}
                className={`w-full p-2.5 rounded-xl text-left border text-xs transition-all cursor-pointer flex items-center justify-between gap-2 ${
                  selectedPresetId === preset.id
                    ? 'bg-[#0066FF]/25 border-[#00D2FF] text-white shadow-md ring-1 ring-[#00D2FF]/40'
                    : 'bg-[#061325]/70 border-[#0066FF]/20 text-slate-300 hover:bg-[#0066FF]/10'
                }`}
              >
                <div className="truncate">
                  <div className="font-bold text-xs text-[#00D2FF]">{preset.title}</div>
                  <div className="text-[11px] text-slate-400 truncate">{preset.desc}</div>
                </div>
                {selectedPresetId === preset.id && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Instrução do Objetivo do Cliente (O que a IA Ator deve fazer no fluxo):
          </label>
          <textarea
            value={scenarioInstructions}
            onChange={(e) => onUpdateScenarioInstructions(e.target.value)}
            rows={3}
            className="w-full bg-[#061325] text-slate-200 text-xs p-3 rounded-xl border border-[#0066FF]/30 focus:border-[#00D2FF] outline-none transition-all resize-y leading-relaxed font-sans"
            placeholder="Ex: Você é um cliente entrando em contato para pedir 2ª via de boleto e relatar lentidão na internet..."
          />
        </div>

        <div className="pt-2 border-t border-[#0066FF]/15">
          <button
            type="button"
            onClick={onTogglePersona}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-200 hover:text-white py-1 cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <span>Dados do Cliente para Simulação (CPF, Contrato, Telefone)</span>
              {(customerData.name || customerData.cpf || customerData.cnpj || customerData.phone || customerData.contract) && (
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                  Preenchido
                </span>
              )}
            </span>
            {isPersonaExpanded ? <ChevronUp className="w-4 h-4 text-[#00D2FF]" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {isPersonaExpanded && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 animate-fadeIn">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Nome do Cliente:
                </span>
                <input
                  type="text"
                  value={customerData.name}
                  onChange={(e) => onUpdateCustomerData({ ...customerData, name: e.target.value })}
                  className="w-full bg-[#061325] text-slate-200 text-xs px-3 py-2 rounded-xl border border-[#0066FF]/20 focus:border-[#00D2FF] outline-none font-medium"
                  placeholder="Ex: João Silva"
                />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                  CPF ou CNPJ:
                </span>
                <input
                  type="text"
                  value={customerData.cpf || customerData.cnpj}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val.replace(/\D/g, '').length > 11) {
                      onUpdateCustomerData({ ...customerData, cnpj: val, cpf: '' });
                    } else {
                      onUpdateCustomerData({ ...customerData, cpf: val, cnpj: '' });
                    }
                  }}
                  className="w-full bg-[#061325] text-slate-200 text-xs px-3 py-2 rounded-xl border border-[#0066FF]/20 focus:border-[#00D2FF] outline-none font-mono"
                  placeholder="000.000.000-00"
                />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Telefone / WhatsApp:
                </span>
                <input
                  type="text"
                  value={customerData.phone}
                  onChange={(e) => onUpdateCustomerData({ ...customerData, phone: e.target.value })}
                  className="w-full bg-[#061325] text-slate-200 text-xs px-3 py-2 rounded-xl border border-[#0066FF]/20 focus:border-[#00D2FF] outline-none font-mono"
                  placeholder="5511999998888"
                />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Contrato / Opção:
                </span>
                <input
                  type="text"
                  value={customerData.contract}
                  onChange={(e) => onUpdateCustomerData({ ...customerData, contract: e.target.value })}
                  className="w-full bg-[#061325] text-slate-200 text-xs px-3 py-2 rounded-xl border border-[#0066FF]/20 focus:border-[#00D2FF] outline-none font-medium"
                  placeholder="Ex: 1042 / Fibra 500MB"
                />
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#0066FF]/15">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">Máx. Turnos:</span>
            <select
              value={maxTurns}
              onChange={(e) => onChangeMaxTurns(Number(e.target.value))}
              className="w-full bg-[#061325] text-slate-200 text-xs px-3 py-2 rounded-xl border border-[#0066FF]/20 focus:border-[#00D2FF] outline-none cursor-pointer"
            >
              <option value={4}>4 Turnos (Curto)</option>
              <option value={6}>6 Turnos (Padrão)</option>
              <option value={8}>8 Turnos (Detalhado Multi-Agente)</option>
              <option value={12}>12 Turnos (Longo Multi-Agente)</option>
            </select>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">Intervalo:</span>
            <select
              value={autoStepDelay}
              onChange={(e) => onChangeAutoStepDelay(Number(e.target.value))}
              className="w-full bg-[#061325] text-slate-200 text-xs px-3 py-2 rounded-xl border border-[#0066FF]/20 focus:border-[#00D2FF] outline-none cursor-pointer"
            >
              <option value={800}>0.8s (Rápido)</option>
              <option value={1200}>1.2s (Padrão)</option>
              <option value={2000}>2.0s</option>
            </select>
          </div>
        </div>

        <div className="pt-2 border-t border-[#0066FF]/15 flex items-center justify-between gap-2">
          <div className="text-[11px] text-slate-400 font-mono truncate">
            Sessão: <span className="text-slate-300">{sessionId.slice(0, 12)}...</span>
          </div>
          <button
            type="button"
            onClick={onResetSession}
            className="px-2.5 py-1 rounded-lg bg-[#061325] hover:bg-slate-800 text-slate-300 text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 border border-[#0066FF]/20"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Resetar Sessão</span>
          </button>
        </div>
      </div>
    </div>
  );
};
