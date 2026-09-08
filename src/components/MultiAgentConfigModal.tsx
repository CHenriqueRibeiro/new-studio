import React, { useState } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Settings2,
  Terminal,
  Cpu,
  ArrowRightLeft,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Activity,
  Play,
  RotateCcw,
  FileCode2,
  Code,
  Upload,
  Check,
  Wand2,
  Copy,
  Layers,
  Bot,
  Globe,
  ToggleLeft,
  ToggleRight,
  BookmarkCheck,
  CheckSquare,
  Square,
  Sliders,
  FolderOpen
} from 'lucide-react';
import { SubAgentEndpoint, MultiAgentPipelineConfig, HandoffEvent } from '../types/fortics';
import { MULTI_AGENT_NICHE_TEMPLATES } from '../data/multiAgentTemplates';

interface MultiAgentConfigModalProps {
  pipeline: MultiAgentPipelineConfig;
  onUpdatePipeline: (newPipeline: MultiAgentPipelineConfig) => void;
  isOpen: boolean;
  onClose: () => void;
  onTestEndpointCurl?: (subAgent: SubAgentEndpoint) => Promise<any>;
}

export const MultiAgentConfigModal: React.FC<MultiAgentConfigModalProps> = ({
  pipeline,
  onUpdatePipeline,
  isOpen,
  onClose,
  onTestEndpointCurl
}) => {
  const [activeTabId, setActiveTabId] = useState<string>(pipeline.subAgents[0]?.id || 'agent-triagem-isp');
  const [agentViewMode, setAgentViewMode] = useState<'curl' | 'json' | 'handoff'>('curl');
  const [testingEndpointId, setTestingEndpointId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; message: string; latency?: number } | null>(null);
  const [jsonParseError, setJsonParseError] = useState<string | null>(null);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);
  const [autoFilledBadge, setAutoFilledBadge] = useState<string | null>(null);
  const [selectedNicheTemplateId, setSelectedNicheTemplateId] = useState<string>('isp_provedor');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentAgent = pipeline.subAgents.find(a => a.id === activeTabId) || pipeline.subAgents[0];

  const handleTogglePipeline = (enabled: boolean) => {
    onUpdatePipeline({
      ...pipeline,
      enabled
    });
  };

  const handleToggleAutoHandoff = (autoHandoff: boolean) => {
    onUpdatePipeline({
      ...pipeline,
      autoHandoff
    });
  };

  const handleLoadNicheTemplate = (nicheId: string) => {
    const template = MULTI_AGENT_NICHE_TEMPLATES.find(t => t.id === nicheId);
    if (!template) return;

    const clonedSubAgents: SubAgentEndpoint[] = JSON.parse(JSON.stringify(template.subAgents));
    onUpdatePipeline({
      ...pipeline,
      enabled: true,
      autoHandoff: true,
      activeAgentId: clonedSubAgents[0]?.id || 'agent-triagem-isp',
      subAgents: clonedSubAgents
    });

    setActiveTabId(clonedSubAgents[0]?.id || 'agent-triagem-isp');
    setAutoFilledBadge(`Template "${template.name}" carregado com ${clonedSubAgents.length} agentes!`);
    setTimeout(() => setAutoFilledBadge(null), 3500);
  };

  const handleAddSubAgent = () => {
    const newId = `subagent-${Date.now()}`;
    const colors: SubAgentEndpoint['colorTheme'][] = ['purple', 'emerald', 'amber', 'rose', 'cyan', 'indigo'];
    const randomColor = colors[pipeline.subAgents.length % colors.length];

    const newAgent: SubAgentEndpoint = {
      id: newId,
      name: `Agente Especialista ${pipeline.subAgents.length + 1}`,
      role: 'Atendimento Especializado',
      triggerTag: `#especialista${pipeline.subAgents.length + 1}`,
      triggerKeywords: ['transferir', 'especialista', 'suporte', 'atendente'],
      mode: 'curl',
      isOptional: true,
      enabled: true,
      rawCurl: `curl -X POST https:
  -H "Authorization: Bearer SEU_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "{{message}}",
    "session_id": "{{sessionId}}",
    "history": {{history}}
  }'`,
      parsedCurl: {
        url: 'https://app.genier.ai/api/v1/chat',
        method: 'POST',
        headers: {
          'Authorization': 'Bearer SEU_TOKEN',
          'Content-Type': 'application/json'
        },
        body: '{\n  "query": "{{message}}",\n  "session_id": "{{sessionId}}",\n  "history": {{history}}\n}'
      },
      agentSpecJson: '',
      contextStrategy: 'full_history',
      handoffPromptTemplate: 'Transbordo recebido do atendente anterior. Dados coletados: {{customerData}}. Última mensagem: "{{lastAgentMessage}}"',
      initialMessage: 'Olá! Sou o especialista responsável pelo seu atendimento. Como posso te auxiliar com o seu caso?',
      colorTheme: randomColor
    };

    const updated = {
      ...pipeline,
      subAgents: [...pipeline.subAgents, newAgent]
    };
    onUpdatePipeline(updated);
    setActiveTabId(newId);
  };

  const handleDuplicateAgent = (agentToDup: SubAgentEndpoint) => {
    const newId = `subagent-${Date.now()}`;
    const cloned: SubAgentEndpoint = {
      ...JSON.parse(JSON.stringify(agentToDup)),
      id: newId,
      name: `${agentToDup.name} (Cópia)`,
      triggerTag: `${agentToDup.triggerTag || '#agente'}_copia`,
      isOptional: true
    };

    const updated = {
      ...pipeline,
      subAgents: [...pipeline.subAgents, cloned]
    };
    onUpdatePipeline(updated);
    setActiveTabId(newId);
    setAutoFilledBadge(`Agente "${agentToDup.name}" duplicado com sucesso!`);
    setTimeout(() => setAutoFilledBadge(null), 3000);
  };

  const handleRemoveSubAgent = (id: string) => {
    if (pipeline.subAgents.length <= 1) return;
    const filtered = pipeline.subAgents.filter(a => a.id !== id);
    const newActiveId = pipeline.activeAgentId === id ? filtered[0].id : pipeline.activeAgentId;
    onUpdatePipeline({
      ...pipeline,
      subAgents: filtered,
      activeAgentId: newActiveId
    });
    if (activeTabId === id) {
      setActiveTabId(filtered[0].id);
    }
    setConfirmDeleteId(null);
  };

  const handleUpdateCurrentAgent = (field: keyof SubAgentEndpoint, value: any) => {
    if (!currentAgent) return;
    const updatedSubAgents = pipeline.subAgents.map(a => {
      if (a.id === currentAgent.id) {
        return { ...a, [field]: value };
      }
      return a;
    });
    onUpdatePipeline({
      ...pipeline,
      subAgents: updatedSubAgents
    });
  };

  const handleToggleAgentEnabled = (agentId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updated = pipeline.subAgents.map(a => {
      if (a.id === agentId) {
        return { ...a, enabled: !a.enabled };
      }
      return a;
    });
    onUpdatePipeline({
      ...pipeline,
      subAgents: updated
    });
  };

  const handleToggleAgentOptional = (agentId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updated = pipeline.subAgents.map(a => {
      if (a.id === agentId) {
        return { ...a, isOptional: !a.isOptional };
      }
      return a;
    });
    onUpdatePipeline({
      ...pipeline,
      subAgents: updated
    });
  };

  const handleParseCurl = (rawText: string) => {
    try {
      let url = '';
      let method = 'POST';
      const headers: Record<string, string> = {};
      let body = '';

      const cleanText = rawText.replace(/\\\r?\n/g, ' ').trim();
      const urlMatch = cleanText.match(/curl\s+(?:-[A-Za-z]+\s+)*['"]?(https?:\/\/[^\s'"]+)['"]?/i);
      if (urlMatch) {
        url = urlMatch[1];
      }

      const methodMatch = cleanText.match(/-X\s+([A-Z]+)/i) || cleanText.match(/--request\s+([A-Z]+)/i);
      if (methodMatch) {
        method = methodMatch[1].toUpperCase();
      }

      const headerRegex = /(?:-H|--header)\s+['"]([^'"]+)['"]/gi;
      let hMatch;
      while ((hMatch = headerRegex.exec(cleanText)) !== null) {
        const fullHeader = hMatch[1];
        const colonIdx = fullHeader.indexOf(':');
        if (colonIdx > 0) {
          const k = fullHeader.slice(0, colonIdx).trim();
          const v = fullHeader.slice(colonIdx + 1).trim();
          headers[k] = v;
        }
      }

      const dataMatch = cleanText.match(/(?:-d|--data|--data-raw)\s+['"]([\s\S]*?)['"](?:\s+-[A-Za-z]|\s*$)/);
      if (dataMatch) {
        body = dataMatch[1];
      }

      handleUpdateCurrentAgent('rawCurl', rawText);
      handleUpdateCurrentAgent('parsedCurl', {
        url: url || currentAgent.parsedCurl.url,
        method: method || 'POST',
        headers: Object.keys(headers).length > 0 ? headers : currentAgent.parsedCurl.headers,
        body: body || currentAgent.parsedCurl.body
      });
    } catch (_) {
      handleUpdateCurrentAgent('rawCurl', rawText);
    }
  };

  const handleAgentJsonChange = (rawJson: string) => {
    handleUpdateCurrentAgent('agentSpecJson', rawJson);
    if (!rawJson.trim()) {
      setJsonParseError(null);
      return;
    }

    try {
      const parsed = JSON.parse(rawJson);
      setJsonParseError(null);

      const extractedName = parsed.name || parsed.agent_name || parsed.title;
      const extractedRole = parsed.role || parsed.description || parsed.instructions?.substring(0, 70);
      const extractedTag = parsed.tag || parsed.trigger_tag || (extractedName ? `#${extractedName.toLowerCase().replace(/[^a-z0-9]/g, '')}` : null);

      let updatedFields: Partial<SubAgentEndpoint> = {};
      if (extractedName && (!currentAgent.name || currentAgent.name.startsWith('Agente Especialista') || currentAgent.name === 'Agente Triagem (Principal)')) {
        updatedFields.name = extractedName;
      }
      if (extractedRole && (!currentAgent.role || currentAgent.role === 'Atendimento Especializado')) {
        updatedFields.role = typeof extractedRole === 'string' ? extractedRole.slice(0, 100) : currentAgent.role;
      }
      if (extractedTag && !currentAgent.triggerTag) {
        updatedFields.triggerTag = extractedTag;
      }

      if (Object.keys(updatedFields).length > 0) {
        const updatedSubAgents = pipeline.subAgents.map(a => {
          if (a.id === currentAgent.id) {
            return { ...a, agentSpecJson: rawJson, ...updatedFields };
          }
          return a;
        });
        onUpdatePipeline({
          ...pipeline,
          subAgents: updatedSubAgents
        });
        setAutoFilledBadge('Campos e ferramentas atualizados a partir do JSON!');
        setTimeout(() => setAutoFilledBadge(null), 3000);
      }
    } catch (e: any) {
      setJsonParseError('JSON inválido: ' + e.message);
    }
  };

  const handleFormatAgentJson = () => {
    if (!currentAgent.agentSpecJson) return;
    try {
      const parsed = JSON.parse(currentAgent.agentSpecJson);
      const formatted = JSON.stringify(parsed, null, 2);
      handleUpdateCurrentAgent('agentSpecJson', formatted);
      setJsonParseError(null);
    } catch (e: any) {
      setJsonParseError('Não foi possível formatar: ' + e.message);
    }
  };

  const handleCopyAgentJson = () => {
    if (!currentAgent.agentSpecJson) return;
    navigator.clipboard.writeText(currentAgent.agentSpecJson);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        handleAgentJsonChange(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const getDetectedTools = () => {
    if (!currentAgent.agentSpecJson) return [];
    try {
      const parsed = JSON.parse(currentAgent.agentSpecJson);
      const tools: string[] = [];
      if (Array.isArray(parsed.tools)) {
        parsed.tools.forEach((t: any) => tools.push(t.name || t.id || 'Tool'));
      } else if (Array.isArray(parsed.flow)) {
        parsed.flow.forEach((f: any) => {
          if (f.name) tools.push(`${f.type || 'step'}: ${f.name}`);
        });
      } else if (Array.isArray(parsed.workflows)) {
        parsed.workflows.forEach((w: any) => tools.push(w.name || w.id || 'Workflow'));
      }
      return tools;
    } catch (_) {
      return [];
    }
  };

  const detectedTools = getDetectedTools();

  const handleTestEndpoint = async (agent: SubAgentEndpoint) => {
    if (!onTestEndpointCurl) return;
    setTestingEndpointId(agent.id);
    setTestResult(null);
    try {
      const res = await onTestEndpointCurl(agent);
      if (res.success) {
        setTestResult({
          id: agent.id,
          success: true,
          message: `Conectado com sucesso! Resposta da IA: "${(res.agentText || '').slice(0, 90)}..."`,
          latency: res.latencyMs
        });
      } else {
        setTestResult({
          id: agent.id,
          success: false,
          message: res.error || `HTTP ${res.statusCode}: Falha na resposta da API`
        });
      }
    } catch (err: any) {
      setTestResult({
        id: agent.id,
        success: false,
        message: err.message || 'Erro de conexão'
      });
    } finally {
      setTestingEndpointId(null);
    }
  };

  const handleSaveAndClose = () => {
    onUpdatePipeline({
      ...pipeline,
      enabled: true
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 md:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-6xl rounded-2xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="p-4 md:p-5 border-b border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-xl text-indigo-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Pipeline Multi-Agentes & Transbordo</h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Templates por Nicho
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Configure cada agente preenchendo apenas seu <strong className="text-slate-200">cURL</strong> e <strong className="text-slate-200">JSON</strong>. Ao salvar, o pipeline de multi-agentes será ativado no simulador.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveAndClose}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-[#0052FF] hover:from-indigo-500 hover:to-[#0066FF] text-white rounded-xl text-xs font-extrabold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Salvar & Ativar</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition text-lg"
              title="Fechar"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="px-4 md:px-6 py-2.5 bg-gradient-to-r from-indigo-950/40 via-slate-950 to-slate-950 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="font-semibold text-slate-300">Templates Rápidos por Nicho:</span>
            
            <select
              value={selectedNicheTemplateId}
              onChange={(e) => setSelectedNicheTemplateId(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-indigo-300 font-medium rounded-lg px-3 py-1 text-xs focus:ring-1 focus:ring-indigo-500"
            >
              {MULTI_AGENT_NICHE_TEMPLATES.map((tmpl) => (
                <option key={tmpl.id} value={tmpl.id}>
                  {tmpl.name} ({tmpl.subAgents.length} agentes)
                </option>
              ))}
            </select>

            <button
              onClick={() => handleLoadNicheTemplate(selectedNicheTemplateId)}
              className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-lg font-semibold transition text-xs shadow-sm cursor-pointer"
              title="Carrega todos os agentes pré-configurados deste nicho"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              Carregar Template
            </button>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer select-none bg-indigo-950/60 px-3 py-1 rounded-lg border border-indigo-500/40">
              <input
                type="checkbox"
                checked={pipeline.enabled}
                onChange={(e) => handleTogglePipeline(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700 focus:ring-indigo-500 cursor-pointer"
              />
              <span className="font-bold text-indigo-200">Pipeline Ativo</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={pipeline.autoHandoff}
                onChange={(e) => handleToggleAutoHandoff(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 bg-slate-800 border-slate-700 focus:ring-purple-500 cursor-pointer"
              />
              <span className="text-slate-300">
                Auto-Transbordo (<code className="text-purple-300 font-mono">#tag</code>)
              </span>
            </label>
          </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          <div className="w-full md:w-72 bg-slate-950/90 border-b md:border-b-0 md:border-r border-slate-800 p-3 flex flex-col gap-2 overflow-y-auto shrink-0">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1 flex items-center justify-between">
              <span>Agentes do Nicho ({pipeline.subAgents.length})</span>
              <span className="text-[10px] text-slate-500 font-normal">Clique para editar</span>
            </div>

            {pipeline.subAgents.map((agent, index) => {
              const isActive = agent.id === activeTabId;
              const isDefault = index === 0;
              const hasCurl = !!agent.rawCurl && agent.rawCurl.trim().length > 10;
              const hasJson = !!agent.agentSpecJson && agent.agentSpecJson.trim().length > 10;

              return (
                <div
                  key={agent.id}
                  onClick={() => setActiveTabId(agent.id)}
                  className={`group relative p-3 rounded-xl border transition cursor-pointer flex flex-col gap-2 ${
                    isActive
                      ? 'bg-slate-800/95 border-indigo-500/60 shadow-md ring-1 ring-indigo-500/40'
                      : agent.enabled
                        ? 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700'
                        : 'bg-slate-950/40 border-slate-900 opacity-60 hover:opacity-100 hover:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-3 h-3 rounded-full shrink-0 ${
                        !agent.enabled ? 'bg-slate-600' :
                        agent.colorTheme === 'blue' ? 'bg-blue-400 ring-2 ring-blue-500/20' :
                        agent.colorTheme === 'emerald' ? 'bg-emerald-400 ring-2 ring-emerald-500/20' :
                        agent.colorTheme === 'purple' ? 'bg-purple-400 ring-2 ring-purple-500/20' :
                        agent.colorTheme === 'amber' ? 'bg-amber-400 ring-2 ring-amber-500/20' :
                        agent.colorTheme === 'rose' ? 'bg-rose-400 ring-2 ring-rose-500/20' : 'bg-cyan-400'
                      }`} />
                      
                      <div className="truncate">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-xs font-bold truncate ${agent.enabled ? 'text-white' : 'text-slate-400 line-through'}`}>
                            {agent.name}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {agent.role}
                        </div>
                      </div>
                    </div>

                    {pipeline.subAgents.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteId(agent.id);
                        }}
                        title="Excluir este agente"
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-slate-800/60 text-[10px]">
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="px-1.5 py-0.2 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/40">
                        {agent.triggerTag || '#geral'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {agent.isOptional ? (
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-sans">
                          Opcional
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700 font-sans">
                          Obrigatório
                        </span>
                      )}

                      <button
                        onClick={(e) => handleToggleAgentEnabled(agent.id, e)}
                        title={agent.enabled ? "Clique para desativar" : "Clique para ativar"}
                        className={`px-1.5 py-0.2 rounded border font-sans font-medium transition ${
                          agent.enabled
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        {agent.enabled ? 'Ativo' : 'Desativado'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            <button
              onClick={handleAddSubAgent}
              className="mt-2 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-dashed border-slate-700 rounded-xl font-medium transition text-xs"
            >
              <Plus className="w-4 h-4 text-indigo-400" /> Adicionar Outro Agente
            </button>
          </div>

          <div className="flex-1 p-4 md:p-6 overflow-y-auto bg-slate-900/60 flex flex-col gap-4">
            {currentAgent ? (
              <>
                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex flex-col gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <div className={`w-3.5 h-3.5 rounded-full ${
                        currentAgent.colorTheme === 'blue' ? 'bg-blue-400' :
                        currentAgent.colorTheme === 'emerald' ? 'bg-emerald-400' :
                        currentAgent.colorTheme === 'purple' ? 'bg-purple-400' :
                        currentAgent.colorTheme === 'amber' ? 'bg-amber-400' :
                        currentAgent.colorTheme === 'rose' ? 'bg-rose-400' : 'bg-cyan-400'
                      }`} />
                      <h4 className="text-sm font-bold text-white">{currentAgent.name}</h4>
                      {currentAgent.isOptional && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          Agente Opcional
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => handleToggleAgentOptional(currentAgent.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition ${
                          currentAgent.isOptional
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                        }`}
                        title="Alternar entre agente obrigatório ou opcional no fluxo"
                      >
                        {currentAgent.isOptional ? <CheckSquare className="w-3.5 h-3.5 text-amber-400" /> : <Square className="w-3.5 h-3.5 text-slate-400" />}
                        <span>{currentAgent.isOptional ? 'Opcional (Pode Pular)' : 'Obrigatório'}</span>
                      </button>

                      <button
                        onClick={() => handleToggleAgentEnabled(currentAgent.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition ${
                          currentAgent.enabled
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-red-950/40 text-red-300 border-red-800/50'
                        }`}
                      >
                        {currentAgent.enabled ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4 text-red-400" />}
                        <span>{currentAgent.enabled ? 'Habilitado' : 'Desabilitado'}</span>
                      </button>

                      <button
                        onClick={() => handleDuplicateAgent(currentAgent)}
                        className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium transition"
                        title="Criar cópia deste agente"
                      >
                        <Copy className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Duplicar</span>
                      </button>

                      {pipeline.subAgents.length > 1 && (
                        <button
                          onClick={() => setConfirmDeleteId(currentAgent.id)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-red-950/30 hover:bg-red-900/50 text-red-400 border border-red-800/40 rounded-lg text-xs font-medium transition"
                          title="Excluir este agente do pipeline"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          <span>Deletar</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {confirmDeleteId === currentAgent.id && (
                    <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-xl flex items-center justify-between gap-3 text-xs text-red-200 animate-fadeIn">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                        <span>Tem certeza que deseja deletar o <strong>{currentAgent.name}</strong>? Seus testes e transbordos para essa tag serão removidos.</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleRemoveSubAgent(currentAgent.id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold transition shadow-sm"
                        >
                          Sim, Deletar
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Nome do Agente</label>
                      <input
                        type="text"
                        value={currentAgent.name}
                        onChange={(e) => handleUpdateCurrentAgent('name', e.target.value)}
                        placeholder="Ex: Agente Triagem / Agente Suporte"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Especialidade / Papel</label>
                      <input
                        type="text"
                        value={currentAgent.role}
                        onChange={(e) => handleUpdateCurrentAgent('role', e.target.value)}
                        placeholder="Ex: Suporte Técnico N2 / Financeiro"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Tag de Roteamento / Transbordo
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={currentAgent.triggerTag}
                          onChange={(e) => handleUpdateCurrentAgent('triggerTag', e.target.value)}
                          placeholder="#suporte"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-3 pr-8 py-1.5 text-xs font-mono text-indigo-300 focus:ring-1 focus:ring-indigo-500"
                        />
                        <span className="absolute right-2.5 top-2 text-[10px] text-slate-500 font-mono">TAG</span>
                      </div>
                    </div>
                  </div>
                </div>

                {autoFilledBadge && (
                  <div className="p-2.5 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{autoFilledBadge}</span>
                  </div>
                )}

                <div className="flex border-b border-slate-800 bg-slate-950/40 rounded-t-xl px-2 pt-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAgentViewMode('curl')}
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-t-lg transition border-b-2 ${
                      agentViewMode === 'curl'
                        ? 'bg-slate-900 text-emerald-400 border-emerald-500 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/40'
                    }`}
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>1. Comando cURL da API</span>
                    {currentAgent.rawCurl ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    ) : null}
                  </button>

                  <button
                    type="button"
                    onClick={() => setAgentViewMode('json')}
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-t-lg transition border-b-2 ${
                      agentViewMode === 'json'
                        ? 'bg-slate-900 text-indigo-400 border-indigo-500 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/40'
                    }`}
                  >
                    <FileCode2 className="w-3.5 h-3.5" />
                    <span>2. JSON de Especificação do Agente</span>
                    {currentAgent.agentSpecJson ? (
                      <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                    ) : null}
                  </button>

                  <button
                    type="button"
                    onClick={() => setAgentViewMode('handoff')}
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-t-lg transition border-b-2 ${
                      agentViewMode === 'handoff'
                        ? 'bg-slate-900 text-purple-400 border-purple-500 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/40'
                    }`}
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>3. Transbordo & Mensagem Inicial</span>
                  </button>
                </div>

                {agentViewMode === 'curl' && (
                  <div className="bg-slate-950/70 p-4 rounded-b-xl border border-slate-800 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-emerald-400" />
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          Comando cURL da API deste Agente
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTestEndpoint(currentAgent)}
                          disabled={testingEndpointId === currentAgent.id}
                          className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold transition shadow-sm"
                        >
                          {testingEndpointId === currentAgent.id ? (
                            <Activity className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Play className="w-3.5 h-3.5" />
                          )}
                          Testar Endpoint cURL
                        </button>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400">
                      Cole aqui o comando cURL real do agente (Fortics / Genier / API REST). As variáveis dinâmicas <code className="text-emerald-300 font-mono">{`{{message}}`}</code> (ou <code className="text-emerald-300 font-mono">{`{{query}}`}</code>), <code className="text-indigo-300 font-mono">{`{{history}}`}</code> e <code className="text-purple-300 font-mono">{`{{sessionId}}`}</code> serão substituídas automaticamente durante o teste e transbordo.
                    </p>

                    <textarea
                      value={currentAgent.rawCurl}
                      onChange={(e) => handleParseCurl(e.target.value)}
                      rows={6}
                      placeholder="curl -X POST https://app.genier.ai/api/agent/... -H 'Authorization: Bearer ...' -d '{...}'"
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-3 font-mono text-xs text-slate-200 focus:ring-1 focus:ring-emerald-500 leading-relaxed"
                    />

                    {testResult && testResult.id === currentAgent.id && (
                      <div className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
                        testResult.success
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                          : 'bg-red-950/40 border-red-500/40 text-red-300'
                      }`}>
                        {testResult.success ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold">{testResult.message}</p>
                          {testResult.latency && (
                            <p className="text-[10px] opacity-75 mt-0.5">Latência: {testResult.latency}ms</p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Caminho JSON da Resposta do Agente (Opcional)
                        </label>
                        <input
                          type="text"
                          value={currentAgent.customResponsePath || ''}
                          onChange={(e) => handleUpdateCurrentAgent('customResponsePath', e.target.value)}
                          placeholder="Ex: output_text, message, response.text"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-300"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Estratégia de Contexto no Transbordo
                        </label>
                        <select
                          value={currentAgent.contextStrategy}
                          onChange={(e) => handleUpdateCurrentAgent('contextStrategy', e.target.value as any)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                        >
                          <option value="full_history">Histórico Completo (Recomendado)</option>
                          <option value="last_turn_handoff">Último Turno + Resumo de Dados</option>
                          <option value="summary_handoff">Prompt com Variáveis Extraídas</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {agentViewMode === 'json' && (
                  <div className="bg-slate-950/70 p-4 rounded-b-xl border border-slate-800 flex flex-col gap-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <FileCode2 className="w-4 h-4 text-indigo-400" />
                        <div>
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <span>JSON de Especificação do Agente</span>
                            {currentAgent.agentSpecJson && !jsonParseError && (
                              <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30 font-sans">
                                JSON Válido
                              </span>
                            )}
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            Cole o JSON do agente (com instructions, tools, etc.) para carregar suas regras e validar o transbordo.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium cursor-pointer transition">
                          <Upload className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Carregar Arquivo .json</span>
                          <input
                            type="file"
                            accept=".json,application/json"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>

                        {currentAgent.agentSpecJson && (
                          <>
                            <button
                              type="button"
                              onClick={handleFormatAgentJson}
                              className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition"
                              title="Formatar e alinhar JSON"
                            >
                              <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                              <span>Formatar</span>
                            </button>

                            <button
                              type="button"
                              onClick={handleCopyAgentJson}
                              className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition"
                            >
                              {copiedJson ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5 text-slate-400" />
                              )}
                              <span>{copiedJson ? 'Copiado!' : 'Copiar'}</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <textarea
                      value={currentAgent.agentSpecJson || ''}
                      onChange={(e) => handleAgentJsonChange(e.target.value)}
                      rows={8}
                      placeholder={`{\n  "name": "${currentAgent.name}",\n  "description": "Atendimento e resolução de chamados...",\n  "instructions": "Você é o agente especialista...",\n  "tools": [\n    { "name": "consultar_faturas", "description": "Consulta faturas pendentes" }\n  ]\n}`}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-3 font-mono text-xs text-indigo-200 focus:ring-1 focus:ring-indigo-500 leading-relaxed resize-y"
                    />

                    {jsonParseError && (
                      <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                        <span>{jsonParseError}</span>
                      </div>
                    )}

                    {detectedTools.length > 0 && (
                      <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 flex flex-col gap-1.5">
                        <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Ferramentas / Workflows Detectados no JSON ({detectedTools.length}):</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {detectedTools.map((tool, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 font-mono text-[10px]"
                            >
                              ⚙️ {tool}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {agentViewMode === 'handoff' && (
                  <div className="bg-slate-950/70 p-4 rounded-b-xl border border-slate-800 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <ArrowRightLeft className="w-4 h-4 text-purple-400" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Mensagem de Abertura do Especialista pós-Transbordo
                      </h4>
                    </div>

                    <p className="text-[11px] text-slate-400">
                      Mensagem que o Agente Especialista enviará ao receber a transferência, ou resposta padrão caso seja acionado via pipeline.
                    </p>

                    <textarea
                      value={currentAgent.initialMessage || ''}
                      onChange={(e) => handleUpdateCurrentAgent('initialMessage', e.target.value)}
                      rows={3}
                      placeholder="Olá! Sou o especialista de suporte técnico. Já recebi seu histórico e vou dar continuidade ao seu caso..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                    />

                    <div className="mt-2">
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Template de Injeção de Contexto para este Agente
                      </label>
                      <input
                        type="text"
                        value={currentAgent.handoffPromptTemplate || ''}
                        onChange={(e) => handleUpdateCurrentAgent('handoffPromptTemplate', e.target.value)}
                        placeholder="Transbordo recebido. Dados coletados: {{customerData}}. Última mensagem: {{lastAgentMessage}}"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-300"
                      />
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>
              Agentes Ativos: <strong className="text-white">{pipeline.subAgents.filter(a => a.enabled).length}</strong> de <strong className="text-white">{pipeline.subAgents.length}</strong>
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/20 transition"
          >
            Salvar Configurações
          </button>
        </div>

      </div>
    </div>
  );
};
