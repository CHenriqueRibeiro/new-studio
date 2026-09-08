import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Square,
  RotateCcw,
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Code2,
  Copy,
  Download,
  Terminal,
  User,
  Bot,
  Layers,
  FileText,
  Sliders,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Trash2,
  ShieldCheck,
  Zap,
  Info,
  ExternalLink,
  Cpu,
  RefreshCw,
  HelpCircle,
  Eye,
  Check,
  Radio,
  Activity,
  ArrowRight,
  Workflow,
  Ban,
  AlertTriangle,
  XCircle,
  Flame,
  Power,
  Users,
  ArrowRightLeft,
  Settings,
  Upload
} from 'lucide-react';
import { ForticsAgent, ForticsWorkflow, MultiAgentPipelineConfig, SubAgentEndpoint, HandoffEvent } from '../types/fortics';
import { MultiAgentConfigModal } from './MultiAgentConfigModal';
import { AgentManagerModal } from './AgentManagerModal';
import { MultiAgentPipelineControl } from './MultiAgentPipelineControl';

export interface E2ETesterProps {
  currentAgent: ForticsAgent;
  currentWorkflow: ForticsWorkflow;
  availableAgents?: ForticsAgent[];
  onSelectAgent?: (agent: ForticsAgent) => void;
  onImportAgent?: (agent: ForticsAgent) => void;
  showToast?: (type: 'success' | 'error' | 'info', text: string) => void;
}

export interface ChatMessage {
  id: string;
  sender: 'actor' | 'agent' | 'system' | 'user';
  text: string;
  timestamp: string;
  turnNumber?: number;
  latencyMs?: number;
  statusCode?: number;
  requestPayload?: any;
  rawResponse?: any;
  hasEntity?: boolean;
  entityContent?: any;
  actorEvaluation?: {
    goalAchieved?: boolean;
    statusSummary?: string;
    detectedAgentActions?: string[];
    detectedIssues?: string[];
  };
  integrationInfo?: {
    called?: boolean;
    name?: string;
    payload?: any;
    result?: any;
    tag?: string;
    hasEntity?: boolean;
    entityContent?: any;
  };
}

export interface AuditReport {
  score: number;
  verdict: 'PASS' | 'WARNING' | 'FAIL';
  summary: string;
  checklist: Array<{
    item: string;
    passed: boolean;
    details: string;
  }>;
  highlights: string[];
  recommendations: string[];
}

export interface ScenarioBatchResult {
  scenarioId: string;
  title: string;
  badge: string;
  status: 'passed' | 'warning' | 'failed' | 'running' | 'pending';
  score?: number;
  turnsExecuted: number;
  messagesCount: number;
  summary: string;
  error?: string;
}

export const PRESET_SCENARIOS = [
  {
    id: 'triagem_provedor_resilient_full',
    badge: '🔄 TESTE COMPLETO INTEGRADO',
    title: '🌟 Teste Realista Completo (Erro Inicial → Correção → Escolha → Finalização)',
    desc: 'Testa na mesma sessão a resiliência do agente: cliente inicia com erro de digitação/CPF inexistente, o agente avisa o erro, o cliente se recupera enviando o CPF correto, confirma o contrato e solicita a transferência com sucesso.',
    instructions: 'Você é um cliente entrando em contato com a central do provedor de internet.\nTurno 1: Cumprimente e diga que precisa de atendimento com urgência.\nTurno 2: Quando o atendente pedir seu CPF ou documento, envie propositalmente um CPF com erro de digitação ("000.111.222-33" ou "123.abc.789").\nTurno 3: Após o agente avisar com polidez que o documento não foi localizado ou pedir para conferir, peça desculpas e envie o CPF real correto ("342.891.048-22").\nTurno 4: Quando o agente listar os contratos vinculados no sistema, escolha e confirme o contrato ("Contrato 1042 - Fibra 500MB").\nTurno 5: Informe que o motivo é suporte para lentidão e peça para transferir para a equipe responsável, finalizando cordialmente.',
    customerData: {
      name: 'Carlos Eduardo Santos',
      cpf: '342.891.048-22',
      cnpj: '',
      phone: '5511987654321',
      contract: 'Contrato 1042 - Fibra 500MB (Rua das Flores, 120)'
    }
  },
  {
    id: 'triagem_provedor_success',
    badge: '🟢 VÁLIDO DIRETO',
    title: '🏢 Triagem Provedor - Cadastro Válido (Cenário de Sucesso Direto)',
    desc: 'Identificação por CPF/CNPJ válido, listagem de contratos/endereços vinculados e transferência direcionada para o setor/atendente responsável.',
    instructions: 'Você é um cliente entrando em contato com a central do provedor de internet.\nNo primeiro turno, cumprimente e diga que precisa de atendimento.\nQuando o atendente virtual solicitar a sua identificação, informe o seu CPF (ou CNPJ).\nQuando o assistente consultar o sistema e listar os seus contratos/cadastros vinculados, confirme o contrato desejado informado nos seus dados (ex: "Contrato 1042 - Fibra 500MB").\nEm seguida, relate o motivo do seu contato (ex: suporte técnico para lentidão ou setor financeiro) e solicite a transferência para o setor ou atendente responsável.',
    customerData: {
      name: 'Carlos Eduardo Santos',
      cpf: '342.891.048-22',
      cnpj: '',
      phone: '5511987654321',
      contract: 'Contrato 1042 - Fibra 500MB (Rua das Flores, 120)'
    }
  },
  {
    id: 'triagem_provedor_not_found',
    badge: '🔴 NÃO ENCONTRADO',
    title: '🔍 Cadastro Não Encontrado (CPF Inexistente / 000.000.000-00)',
    desc: 'Testa se o agente/workflow lida com clientes cujo CPF/CNPJ não existe na base (retornando mensagem clara e solicitando conferência ou encaminhamento).',
    instructions: 'Você é um cliente entrando em contato com o provedor de internet.\nNo primeiro turno, diga que precisa de suporte para sua conexão.\nQuando o atendente virtual solicitar seu CPF ou documento, envie o CPF "000.000.000-00" (inexistente no sistema).\nQuando o assistente responder informando que o cadastro não foi localizado ou pedir para conferir os dados, diga que vai verificar depois com o titular e finalize a conversa.',
    customerData: {
      name: 'Maria Não Cadastrada',
      cpf: '000.000.000-00',
      cnpj: '',
      phone: '5511911112222',
      contract: ''
    }
  },
  {
    id: 'triagem_provedor_invalid_contract',
    badge: '🟡 OPÇÃO INVÁLIDA',
    title: '⚠️ Contrato Inexistente (Opção Fora da Lista / 9999)',
    desc: 'CPF válido, porém o cliente escolhe um contrato que não está na listagem retornada (ex: Contrato 9999) para testar a validação do assistente.',
    instructions: 'Você é um cliente com CPF válido no provedor.\nNo primeiro turno, peça atendimento. Quando o atendente pedir sua identificação, informe seu CPF "342.891.048-22".\nQuando o assistente listar os contratos disponíveis, responda solicitando um número de contrato que não existe na lista (ex: "Contrato 9999 - Não listado").\nObserve se o agente orienta que a opção é inválida e repete as opções válidas.',
    customerData: {
      name: 'Carlos Eduardo Santos',
      cpf: '342.891.048-22',
      cnpj: '',
      phone: '5511987654321',
      contract: 'Contrato 9999 - Não listado'
    }
  },
  {
    id: 'triagem_provedor_bad_format',
    badge: '🟣 ENTRADA CORROMPIDA',
    title: '🚫 Formato Inválido (Texto / Letras no campo de CPF)',
    desc: 'Envia dados com caracteres inválidos (letras ou formato corrompido) para testar o tratamento de exceção e sanitização do fluxo.',
    instructions: 'Você é um cliente que digita dados em formato incorreto ou confuso.\nQuando o atendente virtual solicitar seu CPF, envie "cpf-invalido-com-letras".\nObserve se o bot solicita números válidos sem quebrar o fluxo nem apresentar erro interno de servidor.',
    customerData: {
      name: 'Cliente Teste Formato',
      cpf: 'cpf-invalido-com-letras',
      cnpj: '',
      phone: '5511999998888',
      contract: ''
    }
  },
  {
    id: 'triagem_provedor_abort_hash',
    badge: '🛑 CANCELAMENTO COM #',
    title: '🛑 Cancelamento por Palavra-Chave "#" (Aborto / Encerramento)',
    desc: 'Cliente envia "#" (palavra-chave de cancelamento/aborto configurada) para testar a interrupção imediata da sessão e do fluxo do chatbot.',
    instructions: 'Você é um cliente iniciando contato.\nApós o atendente responder com a mensagem inicial de saudação, envie imediatamente apenas "#" para cancelar o atendimento.\nVerifique se o agente encerra a sessão com a mensagem de aborto e se o sistema de teste para a execução.',
    customerData: {
      name: 'Cliente Cancelamento',
      cpf: '#',
      cnpj: '',
      phone: '5511999998888',
      contract: ''
    }
  }
];

export const checkIsAbortSignal = (text: string, customKw: string = '#'): { isAbort: boolean; matchedKeyword: string } => {
  if (!text) return { isAbort: false, matchedKeyword: '' };
  const trimmed = text.trim();
  const lower = text.toLowerCase();
  const kw = (customKw || '#').trim().toLowerCase();

  if (trimmed === '#' || trimmed === '###' || trimmed === '##') {
    return { isAbort: true, matchedKeyword: trimmed };
  }
  if (kw && (trimmed === kw || lower === kw)) {
    return { isAbort: true, matchedKeyword: kw };
  }
  if (
    lower.includes('sessão abortada') ||
    lower.includes('sessao abortada') ||
    lower.includes('sessão encerrada') ||
    lower.includes('sessao encerrada') ||
    lower.includes('atendimento cancelado') ||
    lower.includes('atendimento encerrado') ||
    lower.includes('sessão finalizada') ||
    lower.includes('sessao finalizada')
  ) {
    return { isAbort: true, matchedKeyword: 'Sessão encerrada/abortada' };
  }
  return { isAbort: false, matchedKeyword: '' };
};

const CURL_TEMPLATES = [
  {
    id: 'triagem_provedor_agent',
    title: '🤖 Agente de Triagem Provedor (History + Query)',
    desc: 'Padrão nativo do endpoint /api/agent/{id} com fluxo de triagem, identificação e transferência.',
    curl: `curl https://app.genier.ai/starconect/api/agent/agent_triagem_provedor \\
  --request POST \\
  --header 'Authorization: Bearer SEU_TOKEN_AQUI' \\
  --header 'Content-Type: application/json' \\
  --data '{
  "history": {{history}},
  "query": "{{message}}",
  "tts": false,
  "user_prompt": "",
  "voice_priority": false
}'`
  }
];

export const E2ETester: React.FC<E2ETesterProps> = ({
  currentAgent,
  currentWorkflow,
  availableAgents = [],
  onSelectAgent,
  onImportAgent,
  showToast
}) => {
  
  const [isAgentManagerOpen, setIsAgentManagerOpen] = useState<boolean>(false);

  const handleAgentSelect = (selected: ForticsAgent) => {
    onSelectAgent?.(selected);
    const jsonStr = JSON.stringify(selected, null, 2);
    setAgentSpec(jsonStr);
    handleAnalyzeAgentJson(jsonStr);
    showToast?.('success', `Agente "${selected.name}" selecionado para os testes!`);
  };

  const handleAgentImport = (imported: ForticsAgent) => {
    onImportAgent?.(imported);
    const jsonStr = JSON.stringify(imported, null, 2);
    setAgentSpec(jsonStr);
    handleAnalyzeAgentJson(jsonStr);
    showToast?.('success', `Agente "${imported.name}" importado e carregado!`);
  };

  const [targetMode, setTargetMode] = useState<'curl' | 'sandbox'>('curl');

  const [rawCurl, setRawCurl] = useState<string>(CURL_TEMPLATES[0].curl);

  const [parsedCurl, setParsedCurl] = useState<{
    url: string;
    method: string;
    headers: Record<string, string>;
    body: string;
  }>({
    url: 'https://app.genier.ai/starconect/api/agent/agent_triagem_provedor',
    method: 'POST',
    headers: {
      Authorization: 'Bearer SEU_TOKEN_AQUI',
      'Content-Type': 'application/json'
    },
    body: `{\n  "history": {{history}},\n  "query": "{{message}}",\n  "tts": false,\n  "user_prompt": "",\n  "voice_priority": false\n}`
  });

  const [customResponsePath, setCustomResponsePath] = useState<string>('');

  const [isMultiAgentModalOpen, setIsMultiAgentModalOpen] = useState<boolean>(false);
  const [multiAgentPipeline, setMultiAgentPipeline] = useState<MultiAgentPipelineConfig>({
    enabled: false,
    activeAgentId: 'agent-triagem',
    autoHandoff: true,
    subAgents: [
      {
        id: 'agent-triagem',
        name: 'Agente Triagem (Principal)',
        role: 'Atendente Inicial / Coleta de Dados',
        triggerTag: '#triagem',
        triggerKeywords: ['iniciar', 'ola', 'triagem'],
        mode: 'curl',
        rawCurl: CURL_TEMPLATES[0].curl,
        parsedCurl: {
          url: 'https://app.genier.ai/starconect/api/agent/agent_triagem_provedor',
          method: 'POST',
          headers: {
            Authorization: 'Bearer SEU_TOKEN_AQUI',
            'Content-Type': 'application/json'
          },
          body: `{\n  "history": {{history}},\n  "query": "{{message}}",\n  "tts": false,\n  "user_prompt": "",\n  "voice_priority": false\n}`
        },
        contextStrategy: 'full_history',
        colorTheme: 'blue',
        enabled: true
      },
      {
        id: 'agent-suporte',
        name: 'Agente Suporte N2',
        role: 'Resolução Técnica de Conexão e Lentidão',
        triggerTag: '#suporte',
        triggerKeywords: ['suporte', 'tecnico', 'lentidao', 'queda', 'sinal'],
        mode: 'curl',
        rawCurl: `curl -X POST https://app.genier.ai/api/agent/suporte_tecnico_n2 \\
  -H "Authorization: Bearer SEU_TOKEN_SUPORTE" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "{{message}}",
    "history": {{history}},
    "session_id": "{{sessionId}}"
  }'`,
        parsedCurl: {
          url: 'https://app.genier.ai/api/agent/suporte_tecnico_n2',
          method: 'POST',
          headers: {
            Authorization: 'Bearer SEU_TOKEN_SUPORTE',
            'Content-Type': 'application/json'
          },
          body: `{\n  "query": "{{message}}",\n  "history": {{history}},\n  "session_id": "{{sessionId}}"\n}`
        },
        contextStrategy: 'full_history',
        initialMessage: 'Olá! Sou o especialista de Suporte Técnico N2. Já recebi seu histórico e vou dar continuidade ao seu caso. Como posso te auxiliar?',
        colorTheme: 'purple',
        enabled: true
      },
      {
        id: 'agent-financeiro',
        name: 'Agente Financeiro',
        role: '2ª Via, Boletos e Negociação de Débitos',
        triggerTag: '#financeiro',
        triggerKeywords: ['financeiro', 'boleto', 'fatura', 'pix', 'pagamento'],
        mode: 'curl',
        rawCurl: `curl -X POST https://app.genier.ai/api/agent/financeiro_cobranca \\
  -H "Authorization: Bearer SEU_TOKEN_FINANCEIRO" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "{{message}}",
    "history": {{history}},
    "session_id": "{{sessionId}}"
  }'`,
        parsedCurl: {
          url: 'https://app.genier.ai/api/agent/financeiro_cobranca',
          method: 'POST',
          headers: {
            Authorization: 'Bearer SEU_TOKEN_FINANCEIRO',
            'Content-Type': 'application/json'
          },
          body: `{\n  "query": "{{message}}",\n  "history": {{history}},\n  "session_id": "{{sessionId}}"\n}`
        },
        contextStrategy: 'full_history',
        initialMessage: 'Olá! Sou o assistente do setor Financeiro. Posso te ajudar com emissão de 2ª via de boleto, código Pix e faturas em aberto.',
        colorTheme: 'emerald',
        enabled: true
      }
    ],
    handoffHistory: []
  });

  const [agentSpec, setAgentSpec] = useState<string>('');
  const [isAgentSpecExpanded, setIsAgentSpecExpanded] = useState<boolean>(true);
  const [isAnalyzingAgentJson, setIsAnalyzingAgentJson] = useState<boolean>(false);
  const [agentAnalysis, setAgentAnalysis] = useState<{
    agentName?: string;
    objective?: string;
    detectedSteps?: string[];
    detectedRules?: string[];
    detectedTools?: string[];
    suggestedScenario?: {
      title?: string;
      desc?: string;
      instructions?: string;
      customerData?: {
        name?: string;
        cpf?: string;
        cnpj?: string;
        phone?: string;
        contract?: string;
      };
    };
  } | null>(null);

  const [selectedPresetId, setSelectedPresetId] = useState<string>('triagem_provedor');
  const [scenarioInstructions, setScenarioInstructions] = useState<string>(
    PRESET_SCENARIOS[0].instructions
  );
  const [customerData, setCustomerData] = useState({
    name: PRESET_SCENARIOS[0].customerData.name,
    cpf: PRESET_SCENARIOS[0].customerData.cpf,
    cnpj: PRESET_SCENARIOS[0].customerData.cnpj,
    phone: PRESET_SCENARIOS[0].customerData.phone,
    contract: PRESET_SCENARIOS[0].customerData.contract
  });
  const [isPersonaExpanded, setIsPersonaExpanded] = useState<boolean>(false);
  const [testingAgentId, setTestingAgentId] = useState<string | null>(null);
  const [agentTestResults, setAgentTestResults] = useState<Record<string, any>>({});

  const [sessionId, setSessionId] = useState<string>(() => crypto.randomUUID());
  const [maxTurns, setMaxTurns] = useState<number>(6);
  const [autoStepDelay, setAutoStepDelay] = useState<number>(1200);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [agentHistory, setAgentHistory] = useState<Array<{ input: string; output: string }>>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isProcessingStep, setIsProcessingStep] = useState<boolean>(false);
  const [currentTurn, setCurrentTurn] = useState<number>(0);
  const [goalAchieved, setGoalAchieved] = useState<boolean>(false);
  const [manualInput, setManualInput] = useState<string>('');
  const [showIntegrationEvents, setShowIntegrationEvents] = useState<boolean>(true);
  const [liveIntegrationStage, setLiveIntegrationStage] = useState<{
    stage: 'idle' | 'actor_generating' | 'sending_request' | 'response_received' | 'waiting_next_turn';
    turn: number;
    method?: string;
    url?: string;
    latencyMs?: number;
    statusCode?: number;
    hasEntity?: boolean;
    entityContent?: any;
    countdownSeconds?: number;
  }>({
    stage: 'idle',
    turn: 0
  });

  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [auditReport, setAuditReport] = useState<AuditReport | null>(null);
  const [inspectingMessage, setInspectingMessage] = useState<ChatMessage | null>(null);

  const [activeConfigTab, setActiveConfigTab] = useState<'connection' | 'scenario' | 'spec'>('connection');

  const isRunningRef = useRef<boolean>(false);
  isRunningRef.current = isRunning;
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isProcessingStep]);

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const preset = PRESET_SCENARIOS.find((p) => p.id === presetId);
    if (!preset) return;

    setScenarioInstructions(preset.instructions);
    setCustomerData({
      name: preset.customerData.name,
      cpf: preset.customerData.cpf,
      cnpj: preset.customerData.cnpj,
      phone: preset.customerData.phone,
      contract: preset.customerData.contract
    });

    showToast?.('info', `Cenário "${preset.title}" configurado!`);
  };

  const handleSelectCurlTemplate = (template: typeof CURL_TEMPLATES[0]) => {
    handleParseCurl(template.curl);
    showToast?.('info', `Template cURL "${template.title}" carregado!`);
  };

  const handleParseCurl = async (curlText: string) => {
    setRawCurl(curlText);
    try {
      const res = await fetch('/api/e2e/parse-curl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ curl: curlText })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.parsed) {
          setParsedCurl(data.parsed);
        }
      }
    } catch (err) {
    }
  };

  const handleResetSession = () => {
    setIsRunning(false);
    isRunningRef.current = false;
    setIsProcessingStep(false);
    setMessages([]);
    setAgentHistory([]);
    setCurrentTurn(0);
    setGoalAchieved(false);
    setAuditReport(null);
    setSessionId(crypto.randomUUID());
    showToast?.('info', 'Sessão reiniciada com novo Session ID e histórico limpo!');
  };

  const [isTestingConn, setIsTestingConn] = useState<boolean>(false);
  const [testConnResult, setTestConnResult] = useState<{
    success: boolean;
    statusCode?: number;
    latencyMs?: number;
    agentText?: string;
    requestPayload?: any;
    rawResponse?: any;
    error?: string;
  } | null>(null);

  const handleTestConnection = async () => {
    if (!parsedCurl.url) {
      showToast?.('error', 'Informe uma URL ou comando cURL válido.');
      return;
    }
    setIsTestingConn(true);
    setTestConnResult(null);
    try {
      const res = await executeAgentStep('Olá! Teste de verificação de conexão.', [], []);
      setTestConnResult(res);
      if (res.statusCode >= 200 && res.statusCode < 300) {
        showToast?.('success', `Conexão bem-sucedida! HTTP ${res.statusCode} (${res.latencyMs || 0}ms)`);
      } else {
        showToast?.('info', `Resposta da API: HTTP ${res.statusCode || 'N/A'}`);
      }
    } catch (err: any) {
      setTestConnResult({ success: false, error: err.message });
      showToast?.('error', `Falha ao testar conexão: ${err.message}`);
    } finally {
      setIsTestingConn(false);
    }
  };

  const handleTestSubAgentConnection = async (agent: SubAgentEndpoint) => {
    if (!agent.parsedCurl?.url) {
      showToast?.('error', `O agente "${agent.name}" não possui URL válida configurada.`);
      return;
    }
    setTestingAgentId(agent.id);
    try {
      const res = await executeAgentStep(
        'Olá! Teste de verificação de conexão.',
        [],
        [],
        agent.parsedCurl
      );
      setAgentTestResults(prev => ({
        ...prev,
        [agent.id]: res
      }));
      if (res.statusCode >= 200 && res.statusCode < 300) {
        showToast?.('success', `Agente "${agent.name}": Conexão OK! HTTP ${res.statusCode} (${res.latencyMs || 0}ms)`);
      } else {
        showToast?.('info', `Agente "${agent.name}": HTTP ${res.statusCode || 'N/A'}`);
      }
    } catch (err: any) {
      setAgentTestResults(prev => ({
        ...prev,
        [agent.id]: { success: false, error: err.message }
      }));
      showToast?.('error', `Falha ao testar "${agent.name}": ${err.message}`);
    } finally {
      setTestingAgentId(null);
    }
  };

  const handleAnalyzeAgentJson = async (jsonString?: string) => {
    const rawToAnalyze = jsonString !== undefined ? jsonString : agentSpec;
    if (!rawToAnalyze.trim()) {
      showToast?.('error', 'Por favor, cole o JSON do agente antes de analisar.');
      return;
    }

    setIsAnalyzingAgentJson(true);
    try {
      const res = await fetch('/api/e2e/analyze-agent-json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentJson: rawToAnalyze })
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Falha ao analisar JSON do agente');
      }

      const data = await res.json();
      if (data.analysis) {
        setAgentAnalysis(data.analysis);
        showToast?.('success', `Agente "${data.analysis.agentName || 'Analisado'}" contextualizado com sucesso!`);

        if (data.analysis.suggestedScenario) {
          const sug = data.analysis.suggestedScenario;
          if (sug.instructions) setScenarioInstructions(sug.instructions);
          if (sug.customerData) {
            setCustomerData({
              name: sug.customerData.name || customerData.name,
              cpf: sug.customerData.cpf || '',
              cnpj: sug.customerData.cnpj || '',
              phone: sug.customerData.phone || customerData.phone,
              contract: sug.customerData.contract || customerData.contract
            });
          }
          setSelectedPresetId('custom_analyzed');
        }
      }
    } catch (err: any) {
      showToast?.('error', `Erro na análise do JSON: ${err.message}`);
    } finally {
      setIsAnalyzingAgentJson(false);
    }
  };

  const handleLoadCurrentStudioAgent = () => {
    if (!currentAgent) {
      showToast?.('error', 'Nenhum agente ativo no momento.');
      return;
    }
    const jsonStr = JSON.stringify(currentAgent, null, 2);
    setAgentSpec(jsonStr);
    handleAnalyzeAgentJson(jsonStr);
    showToast?.('info', `Agente "${currentAgent.name}" importado do Studio para o contexto E2E!`);
  };

  const generateActorTurn = async (
    history: ChatMessage[],
    lastAgentMsg: string,
    turnNum: number
  ) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      const res = await fetch('/api/e2e/generate-actor-turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          scenarioInstructions,
          customerData,
          history: history.map((m) => ({
            sender: m.sender,
            text: m.text
          })),
          lastAgentMessage: lastAgentMsg,
          currentTurn: turnNum,
          maxTurns,
          agentSpec: agentSpec.trim() ? agentSpec : undefined
        })
      });

      clearTimeout(timeoutId);

      if (!res.ok) throw new Error('Falha ao gerar fala do ator');
      const json = await res.json();
      if (json.data && json.data.nextMessage) {
        return json.data;
      }
      throw new Error('Resposta sem mensagem');
    } catch (e: any) {
      const lastLower = (lastAgentMsg || '').toLowerCase();
      let nextMessage = '';

      if (turnNum === 1) {
        nextMessage = scenarioInstructions.includes('suporte') || scenarioInstructions.includes('internet')
          ? 'Olá, estou com problemas na minha conexão e preciso de suporte.'
          : 'Olá, boa tarde! Gostaria de consultar minhas faturas e obter a segunda via.';
      } else if (lastLower.includes('cpf') || lastLower.includes('cnpj') || lastLower.includes('documento')) {
        nextMessage = customerData.cpf || customerData.cnpj || '12345678900';
      } else if (lastLower.includes('contrato') || lastLower.includes('opção') || lastLower.includes('qual')) {
        nextMessage = customerData.contract || '1042';
      } else if (lastLower.includes('boleto') || lastLower.includes('pix') || lastLower.includes('código') || lastLower.includes('chave') || lastLower.includes('sucesso')) {
        nextMessage = 'Muito obrigado, consegui visualizar. Tenha um ótimo dia!';
      } else if (lastLower.includes('nome')) {
        nextMessage = customerData.name || 'João Silva';
      } else if (lastLower.includes('telefone') || lastLower.includes('celular') || lastLower.includes('whatsapp')) {
        nextMessage = customerData.phone || '5511999998888';
      } else {
        nextMessage = 'Sim, confirmo os dados. Pode prosseguir.';
      }

      return {
        nextMessage,
        goalAchieved: turnNum >= maxTurns || lastLower.includes('agradecemos') || lastLower.includes('transferindo'),
        statusSummary: 'Mensagem formulada com dados contextuais da sessão.',
        detectedAgentActions: ['Dados enviados conforme solicitação do agente'],
        detectedIssues: []
      };
    }
  };

  const executeAgentStep = async (
    userText: string,
    history: ChatMessage[],
    currentAgentHist: Array<{ input: string; output: string }>,
    specificCurlConfig?: any
  ) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 35000);

      let effectiveCurl = specificCurlConfig || parsedCurl;
      let effectiveCustomPath = customResponsePath;

      if (multiAgentPipeline.enabled && !specificCurlConfig) {
        const activeSubAgent = multiAgentPipeline.subAgents.find(a => a.id === multiAgentPipeline.activeAgentId);
        if (activeSubAgent && activeSubAgent.parsedCurl?.url) {
          effectiveCurl = activeSubAgent.parsedCurl;
          if (activeSubAgent.customResponsePath) {
            effectiveCustomPath = activeSubAgent.customResponsePath;
          }
        }
      }

      const res = await fetch('/api/e2e/send-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          mode: targetMode,
          curlConfig: effectiveCurl,
          userMessage: userText,
          sessionId,
          customerData,
          agent: currentAgent,
          workflow: currentWorkflow,
          history: history.map((m) => ({
            sender: m.sender,
            text: m.text
          })),
          agentHistory: currentAgentHist,
          customResponsePath: effectiveCustomPath
        })
      });

      clearTimeout(timeoutId);
      const data = await res.json();
      return data;
    } catch (e: any) {
      return {
        success: false,
        statusCode: 504,
        latencyMs: 0,
        agentText: `Falha na requisição ao agente (${e.message}). Verifique a URL ou o status da API.`,
        error: e.message
      };
    }
  };

  const executeSingleStep = async (
    overrideUserText?: string,
    currentHistory: ChatMessage[] = messages,
    currentAgentHist: Array<{ input: string; output: string }> = agentHistory,
    turnNum: number = currentTurn + 1
  ): Promise<{ nextHistory: ChatMessage[]; nextAgentHistory: Array<{ input: string; output: string }>; achieved: boolean }> => {
    setIsProcessingStep(true);

    try {
      let actorMsgText = overrideUserText || '';
      let actorEvaluation: any = null;

      if (!overrideUserText) {
        setLiveIntegrationStage({
          stage: 'actor_generating',
          turn: turnNum
        });

        const lastAgentMsg = currentHistory
          .filter((m) => m.sender === 'agent')
          .slice(-1)[0]?.text || '';

        const actorTurn = await generateActorTurn(
          currentHistory,
          lastAgentMsg,
          turnNum
        );
        actorMsgText = actorTurn.nextMessage;
        actorEvaluation = actorTurn;

        if (actorTurn.goalAchieved) {
          setGoalAchieved(true);
        }
      }

      const actorMessageObj: ChatMessage = {
        id: crypto.randomUUID(),
        sender: overrideUserText ? 'user' : 'actor',
        text: actorMsgText,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        turnNumber: turnNum,
        actorEvaluation
      };

      let historyWithActor = [...currentHistory, actorMessageObj];
      setMessages(historyWithActor);
      setCurrentTurn(turnNum);

      const endpointName = targetMode === 'curl'
        ? (parsedCurl.url || 'API Externa')
        : (currentAgent?.name ? `Studio Agent (${currentAgent.name})` : 'Studio Sandbox');

      const method = targetMode === 'curl' ? (parsedCurl.method || 'POST') : 'POST';

      setLiveIntegrationStage({
        stage: 'sending_request',
        turn: turnNum,
        method,
        url: endpointName
      });

      let pendingIntegrationId = crypto.randomUUID();
      if (showIntegrationEvents) {
        const pendingIntegrationMsg: ChatMessage = {
          id: pendingIntegrationId,
          sender: 'system',
          text: `Iniciando chamada HTTP para o Agente...`,
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          turnNumber: turnNum,
          requestPayload: {
            endpoint: endpointName,
            method,
            query: actorMsgText,
            sessionId,
            customerData: Object.fromEntries(Object.entries(customerData).filter(([_, v]) => Boolean(v)))
          },
          integrationInfo: {
            called: false,
            tag: 'HTTP_DISPATCH',
            name: `${method} ${endpointName}`
          }
        };

        historyWithActor = [...historyWithActor, pendingIntegrationMsg];
        setMessages(historyWithActor);
      }

      await new Promise((r) => setTimeout(r, 450));

      const agentResult = await executeAgentStep(
        actorMsgText,
        historyWithActor,
        currentAgentHist
      );

      setLiveIntegrationStage({
        stage: 'response_received',
        turn: turnNum,
        method,
        url: endpointName,
        latencyMs: agentResult.latencyMs,
        statusCode: agentResult.statusCode,
        hasEntity: agentResult.hasEntity,
        entityContent: agentResult.entityContent
      });

      let historyAfterIntegration = historyWithActor;
      if (showIntegrationEvents) {
        historyAfterIntegration = historyWithActor.map((m) => {
          if (m.id === pendingIntegrationId) {
            return {
              ...m,
              text: `Resposta HTTP ${agentResult.statusCode || 200} recebida em ${agentResult.latencyMs || 0}ms`,
              latencyMs: agentResult.latencyMs,
              statusCode: agentResult.statusCode,
              requestPayload: agentResult.requestPayload,
              rawResponse: agentResult.rawResponse,
              hasEntity: agentResult.hasEntity,
              entityContent: agentResult.entityContent,
              integrationInfo: {
                called: true,
                tag: 'HTTP_RESOLVED',
                name: `${method} ${endpointName}`,
                hasEntity: agentResult.hasEntity,
                entityContent: agentResult.entityContent
              }
            };
          }
          return m;
        });
      }

      let nextAgentHistory = currentAgentHist;
      if (agentResult.returnedHistory && Array.isArray(agentResult.returnedHistory)) {
        nextAgentHistory = agentResult.returnedHistory;
      } else {
        nextAgentHistory = [
          ...currentAgentHist,
          { input: actorMsgText, output: agentResult.agentText || '' }
        ];
      }
      setAgentHistory(nextAgentHistory);

      const agentMessageObj: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'agent',
        text: agentResult.agentText || agentResult.error || 'Sem resposta de texto do agente.',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        turnNumber: turnNum,
        latencyMs: agentResult.latencyMs,
        statusCode: agentResult.statusCode,
        requestPayload: agentResult.requestPayload,
        rawResponse: agentResult.rawResponse,
        hasEntity: agentResult.hasEntity,
        entityContent: agentResult.entityContent,
        integrationInfo: agentResult.integrationInfo
      };

      const fullUpdatedHistory = [...historyAfterIntegration, agentMessageObj];
      setMessages(fullUpdatedHistory);

      if (multiAgentPipeline.enabled && multiAgentPipeline.autoHandoff && agentResult.agentText) {
        const textToCheck = (agentResult.agentText + ' ' + (actorMsgText || '')).toLowerCase();
        const currentActiveAgent = multiAgentPipeline.subAgents.find(a => a.id === multiAgentPipeline.activeAgentId);

        const targetAgent = multiAgentPipeline.subAgents.find(a => {
          if (a.id === multiAgentPipeline.activeAgentId || !a.enabled) return false;
          if (a.triggerTag && textToCheck.includes(a.triggerTag.toLowerCase())) return true;
          if (a.triggerKeywords && a.triggerKeywords.some(kw => textToCheck.includes(kw.toLowerCase()))) return true;
          return false;
        });

        if (targetAgent) {
          const handoffCardId = crypto.randomUUID();
          const handoffMsg: ChatMessage = {
            id: handoffCardId,
            sender: 'system',
            text: `Transbordo acionado: De "${currentActiveAgent?.name || 'Agente'}" ➔ Para "${targetAgent.name}" (${targetAgent.triggerTag || 'Tag'})`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            turnNumber: turnNum,
            integrationInfo: {
              called: true,
              tag: 'HANDOFF_DISPATCH',
              name: `Transbordo ➔ ${targetAgent.name}`
            }
          };

          const historyWithHandoff = [...fullUpdatedHistory, handoffMsg];
          setMessages(historyWithHandoff);

          setMultiAgentPipeline(prev => ({
            ...prev,
            activeAgentId: targetAgent.id,
            handoffHistory: [
              ...prev.handoffHistory,
              {
                id: crypto.randomUUID(),
                fromAgentId: currentActiveAgent?.id || 'agent-primary',
                toAgentId: targetAgent.id,
                triggerTag: targetAgent.triggerTag || '',
                timestamp: new Date().toISOString(),
                contextSnapshot: {
                  customerData,
                  lastTurn: turnNum,
                  historyCount: fullUpdatedHistory.length
                }
              }
            ]
          }));

          showToast?.('info', `Transbordo executado com sucesso: Atendimento transferido para ${targetAgent.name}!`);

          if (targetAgent.initialMessage) {
            await new Promise((r) => setTimeout(r, 600));
            const specialistGreeting: ChatMessage = {
              id: crypto.randomUUID(),
              sender: 'agent',
              text: targetAgent.initialMessage,
              timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              turnNumber: turnNum,
              integrationInfo: {
                called: true,
                tag: 'SPECIALIST_CONNECTED',
                name: `${targetAgent.name} Conectado`
              }
            };
            const historyWithSpecialist = [...historyWithHandoff, specialistGreeting];
            setMessages(historyWithSpecialist);
            return { nextHistory: historyWithSpecialist, nextAgentHistory, achieved: Boolean(actorEvaluation?.goalAchieved) };
          }

          return { nextHistory: historyWithHandoff, nextAgentHistory, achieved: Boolean(actorEvaluation?.goalAchieved) };
        }
      }

      const achieved = Boolean(actorEvaluation?.goalAchieved);
      return { nextHistory: fullUpdatedHistory, nextAgentHistory, achieved };
    } finally {
      setIsProcessingStep(false);
    }
  };

  const handleStartAutoTest = async () => {
    if (isRunning) return;

    if (targetMode === 'curl' && !parsedCurl.url) {
      showToast?.('error', 'Por favor, informe a URL ou cURL da API do chat!');
      return;
    }

    setIsRunning(true);
    isRunningRef.current = true;
    setAuditReport(null);

    let activeHistory = [...messages];
    let activeAgentHistory = [...agentHistory];
    let turn = currentTurn;
    let achieved = goalAchieved;

    showToast?.('info', 'Iniciando teste E2E automatizado com integração em tempo real...');

    try {
      while (isRunningRef.current && turn < maxTurns && !achieved) {
        turn += 1;
        const stepResult = await executeSingleStep(undefined, activeHistory, activeAgentHistory, turn);
        activeHistory = stepResult.nextHistory;
        activeAgentHistory = stepResult.nextAgentHistory;
        achieved = stepResult.achieved;

        if (achieved) {
          setLiveIntegrationStage({
            stage: 'idle',
            turn
          });
          showToast?.('success', '🎯 Objetivo do teste concluído pela IA!');
          break;
        }

        if (turn >= maxTurns) {
          setLiveIntegrationStage({
            stage: 'idle',
            turn
          });
          showToast?.('info', `Limite de ${maxTurns} turnos atingido.`);
          break;
        }

        const delaySec = Math.ceil(autoStepDelay / 1000);
        setLiveIntegrationStage({
          stage: 'waiting_next_turn',
          turn,
          countdownSeconds: delaySec
        });
        await new Promise((r) => setTimeout(r, autoStepDelay));
      }
    } catch (err: any) {
      showToast?.('error', `Erro durante o teste E2E: ${err.message}`);
    } finally {
      setIsRunning(false);
      isRunningRef.current = false;
      setLiveIntegrationStage({
        stage: 'idle',
        turn
      });
      if (activeHistory.length >= 2) {
        handleRunAuditEvaluation(activeHistory, achieved);
      }
    }
  };

  const handleRunAuditEvaluation = async (
    histToEval: ChatMessage[] = messages,
    isGoalAchieved: boolean = goalAchieved
  ) => {
    if (histToEval.length < 2) {
      showToast?.('info', 'Execute pelo menos 1 turno antes de auditar a sessão.');
      return;
    }

    setIsAuditing(true);
    try {
      const res = await fetch('/api/e2e/evaluate-full-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioInstructions,
          customerData,
          history: histToEval.map((m) => ({
            sender: m.sender,
            text: m.text,
            turn: m.turnNumber,
            status: m.statusCode
          })),
          totalTurns: histToEval.filter((m) => m.sender === 'agent').length,
          goalAchievedByActor: isGoalAchieved,
          agentSpec: agentSpec.trim() ? agentSpec : undefined
        })
      });

      if (!res.ok) throw new Error('Erro ao gerar auditoria E2E');
      const data = await res.json();
      if (data.report) {
        setAuditReport(data.report);
        showToast?.('success', `Auditoria concluída! Score: ${data.report.score}/100 (${data.report.verdict})`);
      }
    } catch (e: any) {
      showToast?.('error', `Falha ao gerar relatório: ${e.message}`);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleSendManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim() || isProcessingStep) return;

    const userText = manualInput.trim();
    setManualInput('');
    await executeSingleStep(userText, messages, agentHistory, currentTurn + 1);
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-fadeIn text-slate-100 font-sans">

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#0066FF]/20">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0066FF]/15 border border-[#0066FF]/40 text-[#00D2FF] text-xs font-bold tracking-wide uppercase mb-2">
            <Zap className="w-3.5 h-3.5" />
            <span>Simulador & Testador E2E Automatizado</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>Teste E2E de Agentes & Workflows</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-mono">
              Live Inspector
            </span>
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
            Passe o cURL da API do seu chat ou teste no sandbox local do Studio. A IA assume a persona de um cliente real, executa perguntas e respostas encadeadas (passando CPF, escolhendo contratos e faturas) e audita o comportamento das integrações.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAgentManagerOpen(true)}
            className="px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 bg-[#061833] border border-[#0066FF]/40 text-slate-200 hover:text-white hover:border-[#00D2FF] shadow-lg group"
            title="Clique para alternar ou importar agentes para o teste"
          >
            <Bot className="w-4 h-4 text-[#00D2FF] group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <span className="text-[10px] text-slate-400 block font-normal leading-none">Agente Ativo:</span>
              <span className="text-xs font-bold text-white max-w-[140px] truncate block leading-tight">
                {currentAgent?.name || 'Selecionar Agente'}
              </span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#0066FF]/30 text-[#00D2FF] border border-[#0066FF]/50 font-semibold ml-1">
              Trocar
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsMultiAgentModalOpen(true)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border shadow-lg ${
              multiAgentPipeline.enabled
                ? 'bg-[#061833] border-[#00D2FF] text-[#00D2FF] shadow-[#00D2FF]/20 ring-1 ring-[#00D2FF]/40'
                : 'bg-[#020b18] border-[#0066FF]/30 text-slate-300 hover:text-white hover:border-[#0066FF]'
            }`}
          >
            <Users className="w-4 h-4 text-[#00D2FF]" />
            <span>Configurar Multi-Agentes</span>
            {multiAgentPipeline.enabled && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00D2FF]/20 text-[#00D2FF] border border-[#00D2FF]/40 font-mono">
                {multiAgentPipeline.subAgents.filter(a => a.enabled).length} Ativos
              </span>
            )}
          </button>

          <div className="flex items-center bg-[#020b18] p-1.5 rounded-2xl border border-[#0066FF]/30 shadow-inner">
            <button
              type="button"
              onClick={() => setTargetMode('curl')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                targetMode === 'curl'
                  ? 'bg-[#0066FF] text-white shadow-lg shadow-[#0066FF]/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Terminal className="w-4 h-4 text-[#00D2FF]" />
              <span>cURL da API do Chat</span>
            </button>
            <button
              type="button"
              onClick={() => setTargetMode('sandbox')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                targetMode === 'sandbox'
                  ? 'bg-gradient-to-r from-[#0052FF] to-[#00D2FF] text-white shadow-lg shadow-[#0066FF]/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Cpu className="w-4 h-4 text-[#00D2FF]" />
              <span>Sandbox Local Fortics</span>
            </button>
          </div>

          {!isRunning && (
            <button
              type="button"
              onClick={handleStartAutoTest}
              disabled={isProcessingStep}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-[#00D2FF] hover:from-emerald-400 hover:to-[#00BDE6] text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all cursor-pointer flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>RODAR TESTE E2E</span>
            </button>
          )}
        </div>
      </div>

      {multiAgentPipeline.enabled && (
        <div className="bg-[#020b18]/95 border border-indigo-500/50 rounded-3xl p-5 shadow-2xl space-y-4 animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#0066FF]/20">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-br from-indigo-600 to-[#0052FF] text-white shadow-lg shadow-indigo-500/30">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-extrabold text-white flex items-center gap-2">
                  <span>Fluxo Multi-Agentes Ativo</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold">
                    {multiAgentPipeline.subAgents.filter((a) => a.enabled).length} Agentes no Pipeline
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  A IA inicia no <strong className="text-[#00D2FF]">1º Agente (Principal)</strong> e executa transbordos automáticos de atendimento via cURL/Sandbox.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsMultiAgentModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#0052FF] to-[#00D2FF] text-white text-xs font-bold shadow-lg shadow-[#0066FF]/30 hover:scale-105 transition-all cursor-pointer flex items-center gap-2"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Configurar Agentes & cURLs</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMultiAgentPipeline((prev) => ({ ...prev, enabled: false }));
                }}
                className="px-3 py-2 rounded-xl bg-[#061833] hover:bg-[#0066FF]/20 text-slate-400 hover:text-white border border-[#0066FF]/30 text-xs font-semibold transition-all cursor-pointer"
                title="Voltar para o modo de agente único com painel lateral"
              >
                Modo 1 Agente
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Ordem de Atendimento dos Agentes (Clique para alternar o agente ativo em teste):</span>
              <span className="text-indigo-400 normal-case font-medium text-[11px]">
                Agente Ativo Agora: <strong className="text-white">{multiAgentPipeline.subAgents.find(a => a.id === multiAgentPipeline.activeAgentId)?.name || 'Principal'}</strong>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {multiAgentPipeline.subAgents.map((agent, index) => {
                const isActive = agent.id === multiAgentPipeline.activeAgentId;
                const hasCurl = Boolean(agent.curlConfig?.url || (agent.isMain && parsedCurl.url));

                return (
                  <div key={agent.id} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMultiAgentPipeline((prev) => ({
                          ...prev,
                          activeAgentId: agent.id
                        }));
                      }}
                      className={`px-4 py-2.5 rounded-2xl border text-xs transition-all cursor-pointer flex items-center gap-2.5 text-left ${
                        isActive
                          ? 'bg-gradient-to-r from-indigo-950 to-[#061833] border-[#00D2FF] text-white shadow-lg shadow-indigo-500/25 ring-2 ring-[#00D2FF]/50 scale-102'
                          : 'bg-[#061325] border-[#0066FF]/30 text-slate-300 hover:border-[#00D2FF]/50 hover:bg-[#061833]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                          isActive ? 'bg-[#00D2FF] text-black shadow-sm' : 'bg-slate-700 text-slate-300'
                        }`}>
                          {index + 1}
                        </span>
                        <div>
                          <div className="font-bold text-xs flex items-center gap-1.5">
                            <span>{agent.name}</span>
                            {agent.isMain && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950/90 text-amber-300 border border-amber-500/40 font-bold">
                                1º Principal
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {agent.triggerTag ? (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-900/60 text-indigo-300 font-mono border border-indigo-500/40">
                                {agent.triggerTag}
                              </span>
                            ) : (
                              <span className="text-[9px] text-slate-500">Ponto de Entrada</span>
                            )}
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                              hasCurl ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {hasCurl ? 'cURL OK' : 'Sandbox'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {isActive && (
                        <div className="ml-1 pl-2 border-l border-[#0066FF]/30">
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold animate-pulse">
                            Executando
                          </span>
                        </div>
                      )}
                    </button>

                    {index < multiAgentPipeline.subAgents.length - 1 && (
                      <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-[#0066FF]/20 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-semibold">Cenário de Teste:</span>
                <select
                  value={selectedPresetId}
                  onChange={(e) => handleSelectPreset(e.target.value)}
                  className="bg-[#061325] text-white text-xs px-3 py-1.5 rounded-xl border border-[#0066FF]/30 focus:border-[#00D2FF] outline-none font-semibold cursor-pointer"
                >
                  {PRESET_SCENARIOS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                  <option value="custom">Personalizado...</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-semibold">Cliente Simulado:</span>
                <span className="px-2.5 py-1 rounded-lg bg-[#061325] border border-[#0066FF]/30 text-slate-200 font-mono text-[11px]">
                  {customerData.name || 'João Silva'} • CPF: {customerData.cpf || '123.456.789-00'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsPersonaExpanded(!isPersonaExpanded)}
                  className="text-xs text-[#00D2FF] hover:underline font-semibold cursor-pointer ml-1"
                >
                  {isPersonaExpanded ? 'Ocultar Persona' : 'Editar Persona'}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-semibold">Máx Turnos:</span>
                <select
                  value={maxTurns}
                  onChange={(e) => setMaxTurns(Number(e.target.value))}
                  className="bg-[#061325] text-slate-200 text-xs px-2.5 py-1 rounded-xl border border-[#0066FF]/30 focus:border-[#00D2FF] outline-none cursor-pointer"
                >
                  <option value={4}>4 Turnos</option>
                  <option value={6}>6 Turnos</option>
                  <option value={8}>8 Turnos</option>
                  <option value={12}>12 Turnos</option>
                </select>
              </div>
            </div>
          </div>

          {isPersonaExpanded && (
            <div className="p-4 bg-[#061325]/80 border border-[#0066FF]/30 rounded-2xl animate-fadeIn space-y-3">
              <div className="text-xs font-bold text-white flex items-center justify-between">
                <span>Dados da Persona do Cliente para o Teste E2E</span>
                <span className="text-[11px] text-slate-400">Estes dados são fornecidos pelo Cliente IA durante o chat</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">Nome:</span>
                  <input
                    type="text"
                    value={customerData.name}
                    onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                    className="w-full bg-[#020b18] text-slate-200 text-xs px-3 py-1.5 rounded-xl border border-[#0066FF]/20 focus:border-[#00D2FF] outline-none"
                    placeholder="Ex: Carlos Mendes"
                  />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">CPF / CNPJ:</span>
                  <input
                    type="text"
                    value={customerData.cpf || customerData.cnpj}
                    onChange={(e) => setCustomerData({ ...customerData, cpf: e.target.value, cnpj: '' })}
                    className="w-full bg-[#020b18] text-slate-200 text-xs px-3 py-1.5 rounded-xl border border-[#0066FF]/20 focus:border-[#00D2FF] outline-none font-mono"
                    placeholder="000.000.000-00"
                  />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">Telefone:</span>
                  <input
                    type="text"
                    value={customerData.phone}
                    onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                    className="w-full bg-[#020b18] text-slate-200 text-xs px-3 py-1.5 rounded-xl border border-[#0066FF]/20 focus:border-[#00D2FF] outline-none font-mono"
                    placeholder="5511999998888"
                  />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">Contrato / Info:</span>
                  <input
                    type="text"
                    value={customerData.contract}
                    onChange={(e) => setCustomerData({ ...customerData, contract: e.target.value })}
                    className="w-full bg-[#020b18] text-slate-200 text-xs px-3 py-1.5 rounded-xl border border-[#0066FF]/20 focus:border-[#00D2FF] outline-none"
                    placeholder="Ex: 5049"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className={multiAgentPipeline.enabled ? "w-full space-y-6" : "grid grid-cols-1 xl:grid-cols-12 gap-8 items-start"}>

        {!multiAgentPipeline.enabled && (
        <div className="xl:col-span-5 space-y-4">

          <div className="bg-[#020b18]/90 border border-[#0066FF]/30 rounded-2xl p-1.5 flex items-center gap-1 shadow-lg">
            <button
              type="button"
              onClick={() => setActiveConfigTab('connection')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeConfigTab === 'connection'
                  ? 'bg-gradient-to-r from-[#0052FF] to-[#00D2FF] text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-[#061833]'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>1. Conexão</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveConfigTab('scenario')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeConfigTab === 'scenario'
                  ? 'bg-gradient-to-r from-[#0052FF] to-[#00D2FF] text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-[#061833]'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>2. Cenário</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveConfigTab('spec')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeConfigTab === 'spec'
                  ? 'bg-gradient-to-r from-[#0052FF] to-[#00D2FF] text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-[#061833]'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>3. JSON Agente</span>
              {agentAnalysis && (
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              )}
            </button>
          </div>

          {activeConfigTab === 'connection' && (
            <div className="space-y-4 animate-fadeIn">
              {targetMode === 'curl' ? (
                <div className="bg-[#020b18]/80 border border-[#0066FF]/30 rounded-3xl p-5 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-[#00D2FF]" />
                      <span>Comando cURL da API do Chat</span>
                    </h3>
                    <span className="text-[11px] text-slate-400 font-mono">POST / GET</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Cole o cURL completo (ou endpoint do Webhook do seu Chatbot):
                    </label>
                    <textarea
                      value={rawCurl}
                      onChange={(e) => handleParseCurl(e.target.value)}
                      rows={4}
                      className="w-full bg-[#061325] text-[#00D2FF] font-mono text-xs p-3 rounded-xl border border-[#0066FF]/30 focus:border-[#00D2FF] outline-none transition-all resize-y"
                      placeholder="curl -X POST https://api... -H 'Authorization: ...' -d '...'"
                    />
                    <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                      <Info className="w-3.5 h-3.5 text-[#0066FF] shrink-0" />
                      <span>Substitutos suportados: <code className="text-[#00D2FF]">{'{{message}}'}</code>, <code className="text-[#00D2FF]">{'{{cpf}}'}</code>, <code className="text-[#00D2FF]">{'{{contract}}'}</code>, <code className="text-[#00D2FF]">{'{{phone}}'}</code></span>
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#0066FF]/15">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Método & URL Detectados:
                      </label>
                      <div className="bg-[#061325] text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-[#0066FF]/20 truncate font-mono">
                        <span className="text-[#00D2FF] font-bold">{parsedCurl.method}</span> {parsedCurl.url || '(Vazio)'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Caminho do Texto da Resposta (Opcional):
                      </label>
                      <input
                        type="text"
                        value={customResponsePath}
                        onChange={(e) => setCustomResponsePath(e.target.value)}
                        placeholder="Ex: message, data.reply, choices[0]"
                        className="w-full bg-[#061325] text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-[#0066FF]/20 focus:border-[#00D2FF] outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#0066FF]/15 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={handleTestConnection}
                        disabled={isTestingConn || !parsedCurl.url}
                        className="px-4 py-2 rounded-xl bg-[#0066FF]/20 hover:bg-[#0066FF]/35 text-[#00D2FF] border border-[#00D2FF]/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                      >
                        {isTestingConn ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Disparando Ping HTTP...</span>
                          </>
                        ) : (
                          <>
                            <Radio className="w-3.5 h-3.5" />
                            <span>Testar Conexão / Ping HTTP Agora</span>
                          </>
                        )}
                      </button>

                      <span className="text-[11px] text-slate-400 font-mono">
                        {parsedCurl.headers['Authorization'] ? 'Auth: Configurado' : 'Sem Auth'}
                      </span>
                    </div>

                    {testConnResult && (
                      <div className={`p-3 rounded-xl border text-xs space-y-2 mt-1 ${
                        testConnResult.statusCode && testConnResult.statusCode >= 200 && testConnResult.statusCode < 300
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                          : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                      }`}>
                        <div className="flex items-center justify-between font-bold">
                          <span className="flex items-center gap-1.5">
                            {testConnResult.statusCode && testConnResult.statusCode >= 200 && testConnResult.statusCode < 300 ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-rose-400" />
                            )}
                            Status: HTTP {testConnResult.statusCode || (testConnResult.error ? 'Falha' : 'OK')}
                          </span>
                          {testConnResult.latencyMs && (
                            <span className="font-mono text-[11px] text-slate-300">
                              Latência: {testConnResult.latencyMs}ms
                            </span>
                          )}
                        </div>
                        {testConnResult.agentText && (
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold block mb-0.5">Resposta do Agente:</span>
                            <div className="bg-[#020b18] text-slate-200 p-2 rounded border border-[#0066FF]/20 text-xs font-sans whitespace-pre-wrap">
                              {testConnResult.agentText}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-[#020b18]/80 border border-[#0066FF]/30 rounded-3xl p-5 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-[#00D2FF]" />
                      <span>Sandbox Local do Studio (Fortics Runtime)</span>
                    </h3>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-bold">
                      Ativo
                    </span>
                  </div>

                  <div className="p-3 bg-[#061325] border border-[#0066FF]/25 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <Bot className="w-4 h-4 text-[#00D2FF]" />
                        <span>Agente em Teste:</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsAgentManagerOpen(true)}
                        className="text-xs font-bold text-[#00D2FF] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Gerenciar / Importar Agentes</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={currentAgent?.id || currentAgent?.name || ''}
                        onChange={(e) => {
                          const target = availableAgents.find((a) => (a.id || a.name) === e.target.value);
                          if (target) handleAgentSelect(target);
                        }}
                        className="flex-1 bg-[#020b18] text-white text-xs px-3 py-2 rounded-xl border border-[#0066FF]/30 focus:border-[#00D2FF] outline-none font-semibold cursor-pointer"
                      >
                        {availableAgents.map((ag) => (
                          <option key={ag.id || ag.name} value={ag.id || ag.name}>
                            🤖 {ag.name} ({ag.audience || 'Público Geral'})
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => setIsAgentManagerOpen(true)}
                        className="px-3 py-2 rounded-xl bg-[#0066FF]/20 hover:bg-[#0066FF]/40 text-[#00D2FF] border border-[#0066FF]/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Importar</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    O teste executará diretamente contra o <strong className="text-white font-semibold">Agente "{currentAgent?.name || 'Agente Studio'}"</strong> e seus <strong className="text-[#00D2FF] font-semibold">{currentWorkflow?.name ? `Workflow "${currentWorkflow.name}"` : 'Workflows carregados'}</strong>.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeConfigTab === 'scenario' && (
            <div className="bg-[#020b18]/80 border border-[#0066FF]/30 rounded-3xl p-5 shadow-xl space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-[#00D2FF]" />
                  <span>Cenário de Teste & Persona</span>
                </h3>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Template de Teste Pré-Configurado:
                </label>
                <div className="space-y-1.5">
                  {PRESET_SCENARIOS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset.id)}
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
                  Instrução do Objetivo do Cliente (O que a IA Ator deve fazer):
                </label>
                <textarea
                  value={scenarioInstructions}
                  onChange={(e) => {
                    setScenarioInstructions(e.target.value);
                    setSelectedPresetId('custom');
                  }}
                  rows={3}
                  className="w-full bg-[#061325] text-slate-200 text-xs p-3 rounded-xl border border-[#0066FF]/30 focus:border-[#00D2FF] outline-none transition-all resize-y leading-relaxed"
                  placeholder="Ex: Você é um cliente que precisa consultar seu boleto. Quando solicitado, passe seu CPF..."
                />
              </div>

              <div className="pt-2 border-t border-[#0066FF]/15">
                <button
                  type="button"
                  onClick={() => setIsPersonaExpanded(!isPersonaExpanded)}
                  className="w-full flex items-center justify-between text-xs font-bold text-slate-200 hover:text-white py-1 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span>Dados do Cliente (Opcional)</span>
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
                        onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                        className="w-full bg-[#061325] text-slate-200 text-xs px-3 py-2 rounded-xl border border-[#0066FF]/20 focus:border-[#00D2FF] outline-none font-medium placeholder:text-slate-600"
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
                            setCustomerData({ ...customerData, cnpj: val, cpf: '' });
                          } else {
                            setCustomerData({ ...customerData, cpf: val, cnpj: '' });
                          }
                        }}
                        className="w-full bg-[#061325] text-slate-200 text-xs px-3 py-2 rounded-xl border border-[#0066FF]/20 focus:border-[#00D2FF] outline-none font-mono placeholder:text-slate-600"
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
                        onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                        className="w-full bg-[#061325] text-slate-200 text-xs px-3 py-2 rounded-xl border border-[#0066FF]/20 focus:border-[#00D2FF] outline-none font-mono placeholder:text-slate-600"
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
                        onChange={(e) => setCustomerData({ ...customerData, contract: e.target.value })}
                        className="w-full bg-[#061325] text-slate-200 text-xs px-3 py-2 rounded-xl border border-[#0066FF]/20 focus:border-[#00D2FF] outline-none font-medium placeholder:text-slate-600"
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
                    onChange={(e) => setMaxTurns(Number(e.target.value))}
                    className="w-full bg-[#061325] text-slate-200 text-xs px-3 py-2 rounded-xl border border-[#0066FF]/20 focus:border-[#00D2FF] outline-none"
                  >
                    <option value={4}>4 Turnos (Curto)</option>
                    <option value={6}>6 Turnos (Padrão)</option>
                    <option value={8}>8 Turnos (Detalhado)</option>
                    <option value={12}>12 Turnos (Longo)</option>
                  </select>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">Intervalo:</span>
                  <select
                    value={autoStepDelay}
                    onChange={(e) => setAutoStepDelay(Number(e.target.value))}
                    className="w-full bg-[#061325] text-slate-200 text-xs px-3 py-2 rounded-xl border border-[#0066FF]/20 focus:border-[#00D2FF] outline-none"
                  >
                    <option value={800}>0.8s (Rápido)</option>
                    <option value={1200}>1.2s (Padrão)</option>
                    <option value={2000}>2.0s</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeConfigTab === 'spec' && (
            <div className="bg-[#020b18]/90 border border-[#0066FF]/30 rounded-3xl p-5 shadow-2xl space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-[#00D2FF]/10 text-[#00D2FF] border border-[#00D2FF]/20">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Especificação JSON do Agente</span>
                      {agentAnalysis && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-bold">
                          Analisado
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Opcional: Cole o JSON para auto-gerar regras e cenários
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAgentManagerOpen(true)}
                    className="px-2.5 py-1 text-[11px] font-bold text-white bg-[#061833] hover:bg-[#0066FF]/30 border border-[#0066FF]/40 rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                    title="Abrir gerenciador e importador de agentes"
                  >
                    <Users className="w-3.5 h-3.5 text-[#00D2FF]" />
                    <span className="hidden sm:inline">Gerenciar / Importar</span>
                  </button>

                  {currentAgent && (
                    <button
                      type="button"
                      onClick={handleLoadCurrentStudioAgent}
                      className="px-2.5 py-1 text-[11px] font-bold text-[#00D2FF] bg-[#0066FF]/20 hover:bg-[#0066FF]/40 border border-[#00D2FF]/30 rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                      title="Puxar o Agente aberto no momento no Studio"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Puxar do Studio</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <textarea
                  value={agentSpec}
                  onChange={(e) => setAgentSpec(e.target.value)}
                  rows={5}
                  className="w-full bg-[#061325] text-emerald-400 font-mono text-xs p-3 rounded-xl border border-[#0066FF]/30 focus:border-[#00D2FF] outline-none transition-all resize-y leading-relaxed"
                  placeholder="Cole aqui o JSON exportado do seu agente..."
                />

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleAnalyzeAgentJson()}
                    disabled={isAnalyzingAgentJson || !agentSpec.trim()}
                    className="px-4 py-2 bg-gradient-to-r from-[#0052FF] to-[#00D2FF] hover:from-[#0047E0] hover:to-[#00BDE6] text-white font-bold text-xs rounded-xl shadow-lg shadow-[#0066FF]/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAnalyzingAgentJson ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Analisando JSON...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Contextualizar Cenário com IA</span>
                      </>
                    )}
                  </button>
                  {agentSpec && (
                    <button
                      type="button"
                      onClick={() => {
                        setAgentSpec('');
                        setAgentAnalysis(null);
                      }}
                      className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Limpar</span>
                    </button>
                  )}
                </div>

                {agentAnalysis && (
                  <div className="bg-[#061325] border border-emerald-500/30 rounded-2xl p-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between font-bold text-white">
                      <span>Agente: <span className="text-[#00D2FF]">{agentAnalysis.agentName || 'Identificado'}</span></span>
                      <span className="text-emerald-400 text-[10px]">Sincronizado</span>
                    </div>
                    {agentAnalysis.objective && (
                      <p className="text-[11px] text-slate-300">
                        <strong>Objetivo:</strong> {agentAnalysis.objective}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-gradient-to-r from-[#020b18] to-[#061833] border border-[#00D2FF]/40 rounded-3xl p-4 shadow-xl flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#00D2FF]" />
                <span>Configuração Pronta</span>
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5">
                {targetMode === 'curl' ? 'cURL Único' : 'Sandbox Local'} • {maxTurns} Turnos
              </div>
            </div>

            {!isRunning ? (
              <button
                type="button"
                onClick={handleStartAutoTest}
                disabled={isProcessingStep}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-[#00D2FF] hover:from-emerald-400 hover:to-[#00BDE6] text-black font-extrabold text-xs shadow-lg shadow-emerald-500/30 hover:scale-105 transition-all cursor-pointer flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>RODAR TESTE</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsRunning(false)}
                className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg transition-all cursor-pointer flex items-center gap-2"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>PAUSAR</span>
              </button>
            )}
          </div>
        </div>
        )}

        <div className={multiAgentPipeline.enabled ? "w-full space-y-6" : "xl:col-span-7 space-y-6"}>

          <div className="bg-[#020b18]/90 border border-[#0066FF]/30 rounded-3xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {!isRunning ? (
                <button
                  type="button"
                  onClick={handleStartAutoTest}
                  disabled={isProcessingStep}
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#0052FF] to-[#00D2FF] text-white text-xs font-bold shadow-lg shadow-[#0066FF]/40 hover:scale-105 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Iniciar Teste Automático E2E</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsRunning(false)}
                  className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-lg shadow-rose-950/50 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>Pausar Execução</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => executeSingleStep(undefined, messages, currentTurn + 1)}
                disabled={isRunning || isProcessingStep}
                className="px-4 py-2.5 rounded-full bg-[#061833] hover:bg-[#0066FF]/20 text-slate-200 border border-[#0066FF]/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                title="Executa apenas 1 turno do cliente e resposta do agente"
              >
                <ChevronRight className="w-4 h-4 text-[#00D2FF]" />
                <span>1 Próximo Turno</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleRunAuditEvaluation(messages, goalAchieved)}
                disabled={messages.length < 2 || isAuditing}
                className="px-3.5 py-2 rounded-full bg-[#061833] hover:bg-[#0066FF]/20 text-slate-200 border border-[#0066FF]/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-40"
              >
                {isAuditing ? (
                  <RefreshCw className="w-3.5 h-3.5 text-[#00D2FF] animate-spin" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00D2FF]" />
                )}
                <span>Auditar Sessão</span>
              </button>

              <button
                type="button"
                onClick={handleResetSession}
                className="p-2.5 rounded-full bg-[#061833] hover:bg-[#0066FF]/20 text-slate-400 hover:text-white border border-[#0066FF]/30 transition-all cursor-pointer"
                title="Limpar mensagens e reiniciar sessão"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-[#020b18]/80 border border-[#0066FF]/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[560px]">

            <div className="px-5 py-3.5 bg-[#061325] border-b border-[#0066FF]/20 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-amber-400 animate-ping' : isProcessingStep ? 'bg-[#00D2FF] animate-pulse' : 'bg-emerald-500 animate-pulse'} shadow-sm`} />
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>Sessão de Conversa E2E</span>
                    <span className="text-[10px] text-slate-400 font-mono">Turno: {currentTurn}/{maxTurns}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono truncate max-w-[240px] sm:max-w-[320px]">
                    ID: {sessionId}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {multiAgentPipeline.enabled && (
                  <div className="px-2.5 py-1 rounded-full text-[10px] font-bold border border-indigo-500/40 bg-indigo-950/60 text-indigo-300 flex items-center gap-1.5 shadow-sm">
                    <Users className="w-3 h-3 text-indigo-400" />
                    <span>
                      Agente:{' '}
                      <strong className="text-white">
                        {multiAgentPipeline.subAgents.find(a => a.id === multiAgentPipeline.activeAgentId)?.name || 'Agente Ativo'}
                      </strong>
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setShowIntegrationEvents(!showIntegrationEvents)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    showIntegrationEvents
                      ? 'bg-[#0066FF]/20 text-[#00D2FF] border-[#00D2FF]/40 shadow-sm shadow-[#0066FF]/20'
                      : 'bg-[#061833] text-slate-400 border-slate-700/50 hover:text-slate-300'
                  }`}
                  title={showIntegrationEvents ? 'Ocultar cards de integração em tempo real no chat' : 'Exibir cards de integração em tempo real no chat'}
                >
                  <Activity className={`w-3 h-3 ${showIntegrationEvents ? 'text-[#00D2FF] animate-pulse' : 'text-slate-500'}`} />
                  <span>{showIntegrationEvents ? 'Eventos HTTP: Ativo' : 'Eventos HTTP: Oculto'}</span>
                </button>

                {goalAchieved && (
                  <div className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/50 text-[11px] font-bold flex items-center gap-1.5 animate-fadeIn">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Objetivo Atingido!</span>
                  </div>
                )}
              </div>
            </div>

            {liveIntegrationStage.stage !== 'idle' && (
              <div className="px-4 py-2 bg-[#03132c] border-b border-[#0066FF]/30 flex items-center justify-between text-xs animate-fadeIn">
                <div className="flex items-center gap-2 text-slate-200">
                  {liveIntegrationStage.stage === 'actor_generating' && (
                    <>
                      <Bot className="w-4 h-4 text-[#00D2FF] animate-bounce" />
                      <span className="font-medium">
                        🤖 <strong className="text-white">IA Ator (Cliente):</strong> Formulando mensagem do turno {liveIntegrationStage.turn}...
                      </span>
                    </>
                  )}
                  {liveIntegrationStage.stage === 'sending_request' && (
                    <>
                      <Radio className="w-4 h-4 text-amber-400 animate-spin" />
                      <span className="font-medium">
                        📡 <strong className="text-amber-300">Disparando requisição:</strong>{' '}
                        <span className="font-mono text-[11px] bg-[#061833] px-1.5 py-0.5 rounded text-slate-200 border border-amber-500/30">
                          {liveIntegrationStage.method} {liveIntegrationStage.url}
                        </span>{' '}
                        (Aguardando resposta da API)...
                      </span>
                    </>
                  )}
                  {liveIntegrationStage.stage === 'response_received' && (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                      <span className="font-medium">
                        ⚡ <strong className="text-emerald-400">Resposta Recebida:</strong> HTTP {liveIntegrationStage.statusCode || 200} em {liveIntegrationStage.latencyMs || 0}ms
                        {liveIntegrationStage.hasEntity && (
                          <span className="ml-1.5 px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono">
                            ✓ Entidade Vinculada
                          </span>
                        )}
                      </span>
                    </>
                  )}
                  {liveIntegrationStage.stage === 'waiting_next_turn' && (
                    <>
                      <Clock className="w-4 h-4 text-[#00D2FF] animate-pulse" />
                      <span className="font-medium text-slate-300">
                        ⏱️ Próximo turno em {liveIntegrationStage.countdownSeconds ?? 1}s...
                      </span>
                    </>
                  )}
                </div>

                <span className="text-[10px] font-mono text-[#00D2FF] bg-[#061833] px-2 py-0.5 rounded-full border border-[#0066FF]/30">
                  LIVE STREAM
                </span>
              </div>
            )}

            <div
              ref={chatScrollRef}
              className="flex-1 p-5 overflow-y-auto space-y-4 bg-gradient-to-b from-[#020b18] to-[#040e1f]"
            >
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#061833] border border-[#0066FF]/30 flex items-center justify-center text-[#00D2FF]">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div className="max-w-md">
                    <p className="text-sm font-bold text-slate-300">Pronto para iniciar o teste E2E</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Clique em <strong className="text-white">"Iniciar Teste Automático E2E"</strong> para que a IA cliente envie a primeira mensagem e dialogue com a API ou sandbox.
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => {
                  if (msg.sender === 'system') {
                    const isDone = Boolean(msg.statusCode || msg.latencyMs);
                    return (
                      <div
                        key={msg.id}
                        className="my-1 py-1 px-3 sm:px-4 rounded-2xl bg-[#061833]/90 border border-[#0066FF]/35 shadow-md shadow-[#001133]/60 animate-fadeIn"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg ${isDone ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' : 'bg-[#020b18] text-[#00D2FF] border border-[#0066FF]/40'}`}>
                              {isDone ? (
                                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Activity className="w-3.5 h-3.5 text-[#00D2FF] animate-pulse" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 font-bold text-slate-200">
                                <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-[#020b18] text-[#00D2FF] border border-[#0066FF]/30">
                                  {msg.integrationInfo?.tag || 'INTEGRAÇÃO HTTP'}
                                </span>
                                <span className="text-white">{msg.text}</span>
                              </div>
                              {msg.integrationInfo?.name && (
                                <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate max-w-[280px] sm:max-w-[420px]">
                                  {msg.integrationInfo.name}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {msg.latencyMs !== undefined && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-[#020b18] text-slate-300 font-mono border border-[#0066FF]/20">
                                ⚡ {msg.latencyMs}ms
                              </span>
                            )}
                            {msg.statusCode !== undefined && (
                              <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                                msg.statusCode === 200
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : 'bg-rose-950 text-rose-400 border border-rose-800'
                              }`}>
                                HTTP {msg.statusCode}
                              </span>
                            )}
                            {(msg.rawResponse || msg.requestPayload) && (
                              <button
                                type="button"
                                onClick={() => setInspectingMessage(msg)}
                                className="px-2 py-1 rounded-lg bg-[#020b18] hover:bg-[#0066FF]/30 text-[#00D2FF] border border-[#0066FF]/40 text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Payload</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {(msg.hasEntity || msg.entityContent) && (
                          <div className="mt-2 pt-2 border-t border-[#0066FF]/20 flex items-center justify-between text-[11px] text-emerald-300">
                            <span className="flex items-center gap-1 font-semibold">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Entidade / Cadastro retornado na integração</span>
                            </span>
                            <span className="text-[10px] font-mono text-emerald-400">entity: true</span>
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        msg.sender === 'actor' || msg.sender === 'user' ? 'items-end' : 'items-start'
                      } animate-fadeIn`}
                    >
                      <div className="flex items-center gap-2 mb-1 px-1">
                        {msg.sender === 'actor' ? (
                          <>
                            <span className="text-[11px] font-bold text-[#00D2FF] flex items-center gap-1">
                              <User className="w-3 h-3" />
                              <span>Cliente (IA Ator)</span>
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">{msg.timestamp}</span>
                          </>
                        ) : msg.sender === 'user' ? (
                          <>
                            <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                              <User className="w-3 h-3" />
                              <span>Você (Operador)</span>
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">{msg.timestamp}</span>
                          </>
                        ) : (
                          <>
                            <span className="text-[11px] font-bold text-white flex items-center gap-1">
                              <Bot className="w-3 h-3 text-[#0066FF]" />
                              <span>Agente {targetMode === 'curl' ? '(API)' : '(Studio)'}</span>
                            </span>
                            {msg.latencyMs && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#061833] text-slate-300 font-mono border border-[#0066FF]/20">
                                {msg.latencyMs}ms
                              </span>
                            )}
                            {msg.statusCode && (
                              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                                msg.statusCode === 200
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : 'bg-rose-950 text-rose-400 border border-rose-800'
                              }`}>
                                HTTP {msg.statusCode}
                              </span>
                            )}
                          </>
                        )}
                      </div>

                      <div
                        className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-md ${
                          msg.sender === 'actor'
                            ? 'bg-[#0066FF]/25 border border-[#00D2FF]/40 text-slate-100 rounded-tr-none'
                            : msg.sender === 'user'
                              ? 'bg-emerald-950/70 border border-emerald-500/40 text-slate-100 rounded-tr-none'
                              : 'bg-[#061325] border border-[#0066FF]/30 text-slate-100 rounded-tl-none'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>

                        {msg.actorEvaluation?.statusSummary && (
                          <div className="mt-2 pt-2 border-t border-[#0066FF]/20 text-[10px] text-[#00D2FF] flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 shrink-0" />
                            <span>{msg.actorEvaluation.statusSummary}</span>
                          </div>
                        )}

                        {msg.sender === 'agent' && (msg.hasEntity || msg.entityContent) && (
                          <div className="mt-2.5 p-2.5 rounded-xl bg-[#020b18]/90 border border-emerald-500/40 text-slate-200 animate-fadeIn">
                            <div className="flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b border-emerald-500/20">
                              <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span>Entidade / Cadastro Identificado</span>
                              </div>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono border border-emerald-500/30">
                                entity: true
                              </span>
                            </div>

                            {msg.entityContent && typeof msg.entityContent === 'object' ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                                {Object.entries(msg.entityContent).map(([k, val]) => (
                                  <div
                                    key={k}
                                    className="bg-[#061833]/80 px-2.5 py-1.5 rounded-lg border border-[#0066FF]/25 flex flex-col justify-center"
                                  >
                                    <span className="text-[9px] font-mono uppercase text-slate-400 tracking-wider">
                                      {k.replace(/_/g, ' ')}
                                    </span>
                                    <span
                                      className="text-white font-medium truncate text-xs mt-0.5"
                                      title={typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                    >
                                      {typeof val === 'object' ? JSON.stringify(val) : String(val || '—')}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-[11px] text-slate-300 font-mono bg-[#061833]/80 p-2 rounded">
                                {String(msg.entityContent || 'Dados de entidade vinculados')}
                              </div>
                            )}
                          </div>
                        )}

                        {msg.sender === 'agent' && (msg.rawResponse || msg.requestPayload) && (
                          <div className="mt-2.5 pt-2 border-t border-[#0066FF]/20 flex items-center justify-between gap-2">
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Code2 className="w-3 h-3 text-[#00D2FF]" />
                              <span>Payload & Retorno HTTP</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setInspectingMessage(msg)}
                              className="px-2 py-0.5 rounded bg-[#061833] hover:bg-[#0066FF]/30 text-[#00D2FF] border border-[#0066FF]/40 text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Inspecionar</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              {isProcessingStep && (
                <div className="flex items-center gap-2 text-xs text-slate-400 animate-pulse px-2 py-1">
                  <RefreshCw className="w-3.5 h-3.5 text-[#00D2FF] animate-spin" />
                  <span>Aguardando resposta da integração e agente...</span>
                </div>
              )}
            </div>

            <form
              onSubmit={handleSendManual}
              className="p-3 bg-[#061325] border-t border-[#0066FF]/20 flex items-center gap-2"
            >
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Ou digite uma mensagem manual para testar o agente..."
                disabled={isProcessingStep}
                className="flex-1 bg-[#020b18] text-slate-100 text-xs px-4 py-2.5 rounded-full border border-[#0066FF]/30 focus:border-[#00D2FF] outline-none font-medium"
              />
              <button
                type="submit"
                disabled={!manualInput.trim() || isProcessingStep}
                className="p-2.5 rounded-full bg-[#0066FF] hover:bg-[#0052FF] text-white disabled:opacity-40 transition-all cursor-pointer shadow-md shadow-[#0066FF]/40"
                title="Enviar mensagem manual"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {auditReport && (
        <section className="bg-[#020b18]/90 border border-[#0066FF]/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#0066FF]/20">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-lg ${
                auditReport.verdict === 'PASS'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/50 shadow-emerald-950/40'
                  : auditReport.verdict === 'WARNING'
                    ? 'bg-amber-950 text-amber-300 border border-amber-500/50 shadow-amber-950/40'
                    : 'bg-rose-950 text-rose-300 border border-rose-500/50 shadow-rose-950/40'
              }`}>
                {auditReport.score}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Relatório de Auditoria E2E</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                    auditReport.verdict === 'PASS'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                      : auditReport.verdict === 'WARNING'
                        ? 'bg-amber-950 text-amber-300 border-amber-500/50'
                        : 'bg-rose-950 text-rose-300 border-rose-500/50'
                  }`}>
                    {auditReport.verdict === 'PASS' ? 'APROVADO (PASS)' : auditReport.verdict === 'WARNING' ? 'ATENÇÃO (WARNING)' : 'REPROVADO (FAIL)'}
                  </span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">{auditReport.summary}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const blob = new Blob([JSON.stringify({ auditReport, messages }, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `e2e_relatorio_${Date.now()}.json`;
                  a.click();
                  showToast?.('success', 'Relatório completo baixado em JSON!');
                }}
                className="px-3.5 py-2 rounded-full bg-[#061833] hover:bg-[#0066FF]/20 text-slate-200 border border-[#0066FF]/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-[#00D2FF]" />
                <span>Exportar Relatório</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <div className="bg-[#061325]/80 border border-[#0066FF]/20 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#00D2FF]" />
                <span>Critérios Avaliados no Teste</span>
              </h4>
              <div className="space-y-2.5">
                {auditReport.checklist.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#020b18]/60 border border-[#0066FF]/15 text-xs">
                    {item.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-semibold text-slate-200">{item.item}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{item.details}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {auditReport.highlights && auditReport.highlights.length > 0 && (
                <div className="bg-[#061325]/80 border border-emerald-500/30 rounded-2xl p-5 space-y-2">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Destaques Positivos do Agente</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {auditReport.highlights.map((h, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {auditReport.recommendations && auditReport.recommendations.length > 0 && (
                <div className="bg-[#061325]/80 border border-[#0066FF]/30 rounded-2xl p-5 space-y-2">
                  <h4 className="text-xs font-bold text-[#00D2FF] uppercase tracking-wider flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-[#00D2FF]" />
                    <span>Recomendações de Melhoria</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {auditReport.recommendations.map((r, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00D2FF]" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

          </div>
        </section>
      )}

      {inspectingMessage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#020b18] border border-[#0066FF]/40 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#0066FF]/20">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[#00D2FF]" />
                <span>Dados Detalhados da Chamada HTTP (Turno {inspectingMessage.turnNumber})</span>
              </h3>
              <button
                type="button"
                onClick={() => setInspectingMessage(null)}
                className="text-slate-400 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-[#061833] border border-[#0066FF]/30 cursor-pointer"
              >
                Fechar
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 text-xs">
              {(inspectingMessage.hasEntity || inspectingMessage.entityContent) && (
                <div className="p-3 bg-[#061833] rounded-xl border border-emerald-500/40 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Entidade Identificada (entity & entity_content)</span>
                  </div>
                  <pre className="bg-[#020b18] text-emerald-300 p-2.5 rounded-lg border border-emerald-500/30 overflow-x-auto font-mono text-[11px]">
                    {JSON.stringify(
                      {
                        entity: inspectingMessage.hasEntity ?? true,
                        entity_content: inspectingMessage.entityContent
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
              )}

              {inspectingMessage.requestPayload && (
                <div>
                  <span className="text-slate-300 font-bold block mb-1">Payload Enviado:</span>
                  <pre className="bg-[#061325] text-[#00D2FF] p-3 rounded-xl border border-[#0066FF]/30 overflow-x-auto font-mono text-[11px]">
                    {typeof inspectingMessage.requestPayload === 'string'
                      ? inspectingMessage.requestPayload
                      : JSON.stringify(inspectingMessage.requestPayload, null, 2)}
                  </pre>
                </div>
              )}

              {inspectingMessage.rawResponse && (
                <div>
                  <span className="text-slate-300 font-bold block mb-1">Retorno Bruto da API:</span>
                  <pre className="bg-[#061325] text-slate-200 p-3 rounded-xl border border-[#0066FF]/30 overflow-x-auto font-mono text-[11px]">
                    {typeof inspectingMessage.rawResponse === 'string'
                      ? inspectingMessage.rawResponse
                      : JSON.stringify(inspectingMessage.rawResponse, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <MultiAgentConfigModal
        isOpen={isMultiAgentModalOpen}
        onClose={() => setIsMultiAgentModalOpen(false)}
        pipeline={multiAgentPipeline}
        onUpdatePipeline={(newPipeline) => {
          setMultiAgentPipeline(newPipeline);
          showToast?.('success', 'Configuração Multi-Agentes atualizada com sucesso!');
        }}
        onTestEndpointCurl={async (agent) => {
          try {
            const rawBody = agent.parsedCurl.body
              .replace(/{{query}}|{{message}}/g, 'Olá! Teste de conexão de especialista.')
              .replace(/{{history}}/g, '[]')
              .replace(/{{sessionId}}/g, `test_agent_${Date.now()}`);

            const res = await fetch('/api/e2e/proxy-agent-curl', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                url: agent.parsedCurl.url,
                method: agent.parsedCurl.method || 'POST',
                headers: agent.parsedCurl.headers,
                body: rawBody,
                customResponsePath: agent.customResponsePath
              })
            });

            const data = await res.json();
            return {
              success: data.success && data.statusCode >= 200 && data.statusCode < 300,
              agentText: data.agentText,
              statusCode: data.statusCode,
              latencyMs: data.latencyMs,
              error: data.error
            };
          } catch (err: any) {
            return {
              success: false,
              error: err.message
            };
          }
        }}
      />

      <AgentManagerModal
        isOpen={isAgentManagerOpen}
        onClose={() => setIsAgentManagerOpen(false)}
        currentAgent={currentAgent}
        availableAgents={availableAgents}
        onSelectAgent={handleAgentSelect}
        onImportAgent={handleAgentImport}
        showToast={showToast}
      />

    </div>
  );
};
