import React, { useState, useRef } from 'react';
import {
  Upload,
  Bot,
  Plus,
  Trash2,
  Check,
  Code2,
  Sparkles,
  FileText,
  AlertCircle,
  X,
  Layers,
  Wrench,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { ForticsAgent } from '../types/fortics';
import { PRESET_AGENTS } from '../data/presetAgents';

interface AgentManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAgent: ForticsAgent;
  availableAgents: ForticsAgent[];
  onSelectAgent: (agent: ForticsAgent) => void;
  onImportAgent: (agent: ForticsAgent) => void;
  onDeleteAgent?: (agentId: string) => void;
  showToast?: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const AgentManagerModal: React.FC<AgentManagerModalProps> = ({
  isOpen,
  onClose,
  currentAgent,
  availableAgents,
  onSelectAgent,
  onImportAgent,
  onDeleteAgent,
  showToast
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'import' | 'json'>('presets');
  const [jsonText, setJsonText] = useState<string>('');
  const [parsedPreview, setParsedPreview] = useState<ForticsAgent | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const allAgentsMap = new Map<string, ForticsAgent>();
  PRESET_AGENTS.forEach((a) => allAgentsMap.set(a.id || a.name, a));
  availableAgents.forEach((a) => allAgentsMap.set(a.id || a.name, a));
  if (currentAgent) allAgentsMap.set(currentAgent.id || currentAgent.name, currentAgent);

  const allAgentsList = Array.from(allAgentsMap.values());

  const handleJsonChange = (text: string) => {
    setJsonText(text);
    setParseError(null);
    if (!text.trim()) {
      setParsedPreview(null);
      return;
    }

    try {
      const parsed = JSON.parse(text);
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('O conteúdo deve ser um objeto JSON válido representando um Agente.');
      }

      const candidate = parsed.agent || parsed.data || parsed;

      const normalizedAgent: ForticsAgent = {
        id: candidate.id || `agent_${Date.now()}`,
        name: candidate.name || 'Agente Importado',
        description: candidate.description || 'Agente importado via JSON.',
        audience: candidate.audience || 'Público Geral',
        cat: candidate.cat || 'Geral',
        color: candidate.color || '#0066FF',
        icon: candidate.icon || 'bot',
        emojis: candidate.emojis ?? true,
        enabled: candidate.enabled ?? true,
        force_greetings: candidate.force_greetings ?? true,
        greetings: candidate.greetings || candidate.greeting || 'Olá! Como posso ajudar?',
        style: candidate.style || 'cordial e objetivo',
        llm: candidate.llm || 'openai',
        llm_api_key: candidate.llm_api_key || '',
        llm_model: candidate.llm_model || 'gpt-4o-mini',
        llm_temperature: candidate.llm_temperature ?? 0.2,
        ocr_enabled: candidate.ocr_enabled ?? false,
        protected: candidate.protected ?? false,
        webchat: candidate.webchat ?? true,
        template: candidate.template ?? false,
        voice_priority: candidate.voice_priority ?? false,
        void_context: candidate.void_context ?? false,
        tts_id: candidate.tts_id || '',
        media_upload_enabled: candidate.media_upload_enabled ?? true,
        offset: candidate.offset || '-03:00',
        instruction: candidate.instruction || {
          objective: candidate.objective || 'Atender com qualidade e identificar intenções do usuário.',
          role: candidate.role || 'Assistente Virtual.',
          steps: Array.isArray(candidate.steps) ? candidate.steps : ['Cumprimentar e identificar necessidades.']
        },
        other_rules: candidate.other_rules || '',
        tools: Array.isArray(candidate.tools) ? candidate.tools : []
      };

      setParsedPreview(normalizedAgent);
    } catch (e: any) {
      setParseError(e.message || 'JSON inválido');
      setParsedPreview(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonText(content);
      handleJsonChange(content);
      setActiveTab('json');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSaveImportedAgent = () => {
    if (!parsedPreview) {
      showToast?.('error', 'Nenhum agente válido carregado para importar.');
      return;
    }

    onImportAgent(parsedPreview);
    onSelectAgent(parsedPreview);
    showToast?.('success', `Agente "${parsedPreview.name}" importado e selecionado para testes!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#020b18] border border-[#0066FF]/40 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="px-6 py-4 bg-[#061325] border-b border-[#0066FF]/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0052FF] to-[#00D2FF] flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Gerenciador de Agentes</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#0066FF]/20 text-[#00D2FF] border border-[#0066FF]/40">
                  {allAgentsList.length} Agentes
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Selecione ou importe agentes para testar, validar comportamentos e identificar integrações.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#061833] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pt-3 bg-[#030e20] border-b border-[#0066FF]/20 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'presets'
                ? 'bg-[#061325] text-white border-t border-x border-[#0066FF]/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4 text-[#00D2FF]" />
            <span>Biblioteca de Agentes ({allAgentsList.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('json')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'json'
                ? 'bg-[#061325] text-white border-t border-x border-[#0066FF]/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4 text-[#00D2FF]" />
            <span>Importar Agente (Upload / Colar JSON)</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'presets' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  Escolha um agente para carregar e testar no chat:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setJsonText('');
                    setParsedPreview(null);
                    setActiveTab('json');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#0066FF]/20 hover:bg-[#0066FF]/30 text-[#00D2FF] border border-[#0066FF]/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Novo Agente (Importar JSON)</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allAgentsList.map((ag) => {
                  const isSelected = (currentAgent?.id || currentAgent?.name) === (ag.id || ag.name);
                  const isPreset = PRESET_AGENTS.some((p) => p.id === ag.id);

                  return (
                    <div
                      key={ag.id || ag.name}
                      onClick={() => {
                        onSelectAgent(ag);
                        showToast?.('info', `Agente "${ag.name}" selecionado para testes!`);
                        onClose();
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#061833] border-[#00D2FF] shadow-lg shadow-[#0066FF]/20 ring-1 ring-[#00D2FF]'
                          : 'bg-[#040e1f] border-[#0066FF]/30 hover:border-[#00D2FF]/60 hover:bg-[#06142a]'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white shadow"
                              style={{ backgroundColor: ag.color || '#0066FF' }}
                            >
                              <Bot className="w-4 h-4" />
                            </div>
                            <div>
                              <h3 className="text-xs font-bold text-white group-hover:text-[#00D2FF] transition-colors flex items-center gap-1.5">
                                <span>{ag.name}</span>
                                {isSelected && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold">
                                    Ativo
                                  </span>
                                )}
                              </h3>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {ag.cat || 'Geral'} • {ag.llm_model || 'GPT'}
                              </span>
                            </div>
                          </div>

                          {isSelected ? (
                            <div className="p-1 rounded-full bg-emerald-500 text-black">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500 group-hover:text-[#00D2FF] flex items-center gap-1">
                              <span>Selecionar</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-300 mt-2.5 line-clamp-2 leading-relaxed">
                          {ag.description || ag.instruction?.objective || 'Sem descrição cadastrada.'}
                        </p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-[#0066FF]/20 flex flex-wrap items-center justify-between gap-2 text-[10px]">
                        <span className="text-slate-400 font-medium">
                          {ag.tools && ag.tools.length > 0 ? (
                            <span className="text-[#00D2FF] font-semibold flex items-center gap-1">
                              <Wrench className="w-3 h-3" />
                              <span>{ag.tools.length} Ferramenta(s) vinculada(s)</span>
                            </span>
                          ) : (
                            <span>Sem ferramentas externas</span>
                          )}
                        </span>

                        <span className="text-slate-500 font-mono">
                          {isPreset ? 'Preset Fortics' : 'Importado pelo Usuário'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#061325] border border-[#0066FF]/30 rounded-2xl">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".json"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-[#0066FF] hover:bg-[#0052FF] text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-[#0066FF]/30"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Fazer Upload de Arquivo .JSON</span>
                  </button>
                  <span className="text-xs text-slate-400">ou cole o JSON do agente no editor abaixo:</span>
                </div>

                {parsedPreview && (
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Estrutura de Agente Válida!</span>
                  </span>
                )}
              </div>

              <div>
                <textarea
                  value={jsonText}
                  onChange={(e) => handleJsonChange(e.target.value)}
                  rows={8}
                  placeholder={`{\n  "name": "Meu Agente",\n  "description": "...",\n  "instruction": {\n    "objective": "...",\n    "role": "...",\n    "steps": ["..."]\n  },\n  "tools": [...]\n}`}
                  className="w-full bg-[#040e1f] text-[#00D2FF] font-mono text-xs p-3.5 rounded-2xl border border-[#0066FF]/30 focus:border-[#00D2FF] outline-none transition-all resize-y"
                />
                {parseError && (
                  <div className="mt-2 text-xs text-rose-400 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Erro no JSON: {parseError}</span>
                  </div>
                )}
              </div>

              {parsedPreview && (
                <div className="p-4 rounded-2xl bg-[#03132c] border border-emerald-500/40 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: parsedPreview.color || '#0066FF' }}
                      >
                        <Bot className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-white">{parsedPreview.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-mono">
                        {parsedPreview.llm_model || 'gpt-4o-mini'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveImportedAgent}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-[#00D2FF] hover:from-emerald-400 hover:to-[#00BDE6] text-black font-extrabold text-xs shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 fill-black" />
                      <span>Salvar e Usar Este Agente</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 font-semibold block mb-0.5">Objetivo:</span>
                      <p className="text-slate-200">{parsedPreview.instruction?.objective || 'Não especificado'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block mb-0.5">Papel (Role):</span>
                      <p className="text-slate-200">{parsedPreview.instruction?.role || 'Atendente Virtual'}</p>
                    </div>
                  </div>

                  {parsedPreview.instruction?.steps && parsedPreview.instruction.steps.length > 0 && (
                    <div className="text-xs pt-1">
                      <span className="text-slate-400 font-semibold block mb-1">Passos Detectados:</span>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                        {parsedPreview.instruction.steps.slice(0, 4).map((s, idx) => (
                          <li key={idx} className="truncate">{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-3.5 bg-[#061325] border-t border-[#0066FF]/30 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Agente selecionado atualmente: <strong className="text-white">{currentAgent?.name || 'Nenhum'}</strong>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#061833] hover:bg-[#0066FF]/20 text-slate-300 border border-[#0066FF]/30 text-xs font-bold transition-all cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
