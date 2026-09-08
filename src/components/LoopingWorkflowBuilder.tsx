import React, { useState, useMemo } from 'react';
import {
  Repeat,
  Sparkles,
  ArrowRight,
  Database,
  Layers,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  Code2,
  FileJson,
  Zap,
  Sliders,
  Check,
  Terminal,
  Play,
  RotateCcw,
  Cable,
  Bot,
  Wand2,
  CheckCheck,
  HardDriveDownload,
  AlertTriangle,
  UploadCloud,
  Layers2
} from 'lucide-react';
import { ForticsWorkflow } from '../types/fortics';
import {
  LoopArchitectureType,
  PaginationStrategyType,
  PipelineOrientationType,
  NodeDefinition,
  LoopDiagnosticResult,
  AiOrderValidationResult
} from './looping/types';
import { generateLoopingWorkflow } from './looping/loopGenerator';
import { LoopDiagnosticCard } from './looping/LoopDiagnosticCard';
import { NodeConfigDrawer } from './looping/NodeConfigDrawer';
import { VerticalPipelineView } from './looping/VerticalPipelineView';

interface LoopingWorkflowBuilderProps {
  onLoadIntoStudio?: (wf: ForticsWorkflow) => void;
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

function parseCurl(curlText: string): { method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'; url: string; headers: Record<string, string>; body: string } {
  let method: any = 'GET';
  let url = '';
  const headers: Record<string, string> = {};
  let body = '';

  const clean = curlText.replace(/\\\n/g, ' ').replace(/\s+/g, ' ');

  const methodMatch = clean.match(/-X\s+([A-Z]+)/i) || clean.match(/--request\s+([A-Z]+)/i);
  if (methodMatch) {
    method = methodMatch[1].toUpperCase();
  }

  const urlMatch = clean.match(/curl\s+(?:-[^\s]+\s+)*['"]?([^'"]+)['"]?/i);
  if (urlMatch && !urlMatch[1].startsWith('-')) {
    url = urlMatch[1];
  } else {
    const rawUrlMatch = clean.match(/(https?:\/\/[^\s'"]+)/);
    if (rawUrlMatch) url = rawUrlMatch[1];
  }

  const headerRegex = /(?:-H|--header)\s+['"]([^'"]+)['"]/g;
  let hMatch;
  while ((hMatch = headerRegex.exec(clean)) !== null) {
    const parts = hMatch[1].split(':');
    if (parts.length >= 2) {
      const k = parts[0].trim();
      const v = parts.slice(1).join(':').trim();
      headers[k] = v;
    }
  }

  const dataMatch = clean.match(/(?:-d|--data|--data-raw)\s+['"]([\s\S]*?)['"](?:\s+-|$)/) || clean.match(/(?:-d|--data|--data-raw)\s+['"](\{[\s\S]*?\})['"]/);
  if (dataMatch) {
    body = dataMatch[1];
    if (!methodMatch) method = 'POST';
  }

  return { method, url, headers, body };
}

export const LoopingWorkflowBuilder: React.FC<LoopingWorkflowBuilderProps> = ({
  onLoadIntoStudio,
  showToast
}) => {
  
  const [architecture, setArchitecture] = useState<LoopArchitectureType>('simple_shift');

  const [masterAiPrompt, setMasterAiPrompt] = useState<string>(
    'Fazer varredura de faturas vencidas, consultar cadastro detalhado pelo CPF na API e enviar mensagem HSM de cobrança via SZ.chat contendo PIX e Código de Barras.'
  );
  const [workflowName, setWorkflowName] = useState<string>('Workflow de Looping Automatizado');
  const [timeoutSeconds, setTimeoutSeconds] = useState<number>(300);

  const [hasAuthStep, setHasAuthStep] = useState<boolean>(false);
  const [authName, setAuthName] = useState<string>('auth_token');
  const [authMethod, setAuthMethod] = useState<'GET' | 'POST'>('POST');
  const [authUri, setAuthUri] = useState<string>('https://api.exemplo.com/oauth/token');
  const [authBody, setAuthBody] = useState<string>('{\n  "grant_type": "client_credentials",\n  "client_id": "SEU_CLIENT_ID",\n  "client_secret": "SEU_CLIENT_SECRET"\n}');

  const [api1Name, setApi1Name] = useState<string>('buscar_registros_fila');
  const [api1Method, setApi1Method] = useState<'GET' | 'POST'>('GET');
  const [api1Uri, setApi1Uri] = useState<string>('https://api.exemplo.com/v1/registros?status=pendente&page={{pagina_atual}}&pageSize=100');
  const [api1AuthHeader, setApi1AuthHeader] = useState<string>('Bearer {{auth_token.access_token}}');
  const [api1ResponseSample, setApi1ResponseSample] = useState<string>(JSON.stringify({
    data: [
      {
        id: "REC-1001",
        codigo: "CTR-9821",
        nome: "Maria Aparecida da Silva",
        telefone: "11987654321",
        documento: "123.456.789-00",
        vencimento: "2026-08-30",
        valor: "149.90",
        status: "Pendente"
      },
      {
        id: "REC-1002",
        codigo: "CTR-9822",
        nome: "João Carlos Ferreira",
        telefone: "21998877665",
        documento: "987.654.321-11",
        vencimento: "2026-08-30",
        valor: "219.00",
        status: "Pendente"
      }
    ],
    totalPages: 3,
    totalRecords: 6
  }, null, 2));

  const [paginationStrategy, setPaginationStrategy] = useState<PaginationStrategyType>('auto_detect');
  const [pageSizeValue, setPageSizeValue] = useState<number>(100);
  const [manualTotalPages, setManualTotalPages] = useState<string>('');

  const [statusFilterValue, setStatusFilterValue] = useState<string>('Pendente');
  const [sanitizePhoneBR, setSanitizePhoneBR] = useState<boolean>(true);

  const [loopTargetLabel, setLoopTargetLabel] = useState<string>('validação');

  const [hasSecondaryApi, setHasSecondaryApi] = useState<boolean>(false);
  const [api3Name, setApi3Name] = useState<string>('consultar_cadastro_detalhado');
  const [api3Method, setApi3Method] = useState<'GET' | 'POST'>('GET');
  const [api3Uri, setApi3Uri] = useState<string>('https://api.exemplo.com/v1/pessoas/documento/{{item.documento}}');

  const [api2Name, setApi2Name] = useState<string>('executar_acao_item');
  const [api2Method, setApi2Method] = useState<'POST' | 'PUT' | 'PATCH' | 'GET'>('POST');
  const [api2Uri, setApi2Uri] = useState<string>('https://api.exemplo.com/v1/mensagens/enviar');
  const [api2AuthHeader, setApi2AuthHeader] = useState<string>('Bearer {{_credential.token}}');
  const [api2Body, setApi2Body] = useState<string>(`{
  "destinatario": "{{item.telefone}}",
  "nome": "{{item.nome}}",
  "documento": "{{item.documento}}",
  "valor": "{{item.valor}}",
  "mensagem": "Olá {{item.nome}}, seu registro {{item.codigo}} está pronto."
}`);

  const [hasDatabaseStep, setHasDatabaseStep] = useState<boolean>(false);
  const [dbNodeName, setDbNodeName] = useState<string>('gravar_historico_db');
  const [dbNodeMethod, setDbNodeMethod] = useState<'POST' | 'PUT' | 'PATCH'>('POST');
  const [dbNodeUri, setDbNodeUri] = useState<string>('https://app.genier.ai/omnimagem/godb/api/collections/Historico/records');
  const [dbNodeAuthHeader, setDbNodeAuthHeader] = useState<string>('Bearer {{_credential.token}}');
  const [dbNodeBody, setDbNodeBody] = useState<string>(`{
  "registro_id": "{{item.id}}",
  "nome": "{{item.nome}}",
  "telefone": "{{item.telefone}}",
  "status_envio": "SUCESSO",
  "data_processamento": "{{configurar_datas.hoje}}"
}`);

  const [aiInstructions, setAiInstructions] = useState<Record<string, string>>({
    api1_search: 'Buscar faturas pendentes da API com paginação',
    filter_step: 'Filtrar por status Pendente e sanitizar telefone brasileiro',
    api2_target: 'Montar JSON com telefone, nome, valor e enviar mensagem'
  });

  const handleUpdateAiInstruction = (nodeKey: string, text: string) => {
    setAiInstructions(prev => ({
      ...prev,
      [nodeKey]: text
    }));
  };

  const defaultInitialOrder = ['auth_step', 'api1_search', 'filter_step'];
  const defaultLoopOrder = ['loop_label', 'next_item', 'condition_step', 'secondary_api_step', 'api2_target', 'database_step', 'loop_goto'];

  const [initialOrder, setInitialOrder] = useState<string[]>(defaultInitialOrder);
  const [loopOrder, setLoopOrder] = useState<string[]>(defaultLoopOrder);

  const [selectedNodeKey, setSelectedNodeKey] = useState<string>('api1_search');
  const [orientation, setOrientation] = useState<PipelineOrientationType>('vertical');
  const [viewMode, setViewMode] = useState<'pipeline' | 'json'>('pipeline');
  const [copiedJson, setCopiedJson] = useState<boolean>(false);
  const [isAiOptimizing, setIsAiOptimizing] = useState<boolean>(false);
  const [showCurlModal, setShowCurlModal] = useState<boolean>(false);
  const [curlInput, setCurlInput] = useState<string>('');
  const [curlTargetNode, setCurlTargetNode] = useState<'api1' | 'api2' | 'auth' | 'api3'>('api1');

  const diagnostic = useMemo((): LoopDiagnosticResult => {
    let hasTotalPagesField = false;
    let totalPagesKeyFound = '';
    let totalPagesFoundValue: number | null = null;
    let totalRecordsKeyFound = '';
    let totalRecordsFoundValue: number | null = null;
    let arrayPath = 'raiz';
    let sampleArray: any[] = [];
    let keys: string[] = [];

    try {
      const parsed = JSON.parse(api1ResponseSample);

      const findArrayAndPagination = (obj: any, currentPath = '') => {
        if (!obj || typeof obj !== 'object') return;

        if (Array.isArray(obj)) {
          sampleArray = obj;
          arrayPath = currentPath || 'raiz (Array puro)';
          return;
        }

        const possiblePagesKeys = ['totalPages', 'total_pages', 'totalPaginas', 'pages', 'pageCount'];
        for (const pk of possiblePagesKeys) {
          if (typeof obj[pk] === 'number' || (typeof obj[pk] === 'string' && !isNaN(Number(obj[pk])))) {
            hasTotalPagesField = true;
            totalPagesKeyFound = currentPath ? `${currentPath}.${pk}` : pk;
            totalPagesFoundValue = Number(obj[pk]);
            break;
          }
        }

        const possibleTotalRecordsKeys = ['totalRecords', 'total_records', 'total', 'totalCount', 'count'];
        for (const trk of possibleTotalRecordsKeys) {
          if (typeof obj[trk] === 'number' || (typeof obj[trk] === 'string' && !isNaN(Number(obj[trk])))) {
            totalRecordsKeyFound = currentPath ? `${currentPath}.${trk}` : trk;
            totalRecordsFoundValue = Number(obj[trk]);
            break;
          }
        }

        const priorityArrayKeys = ['data', 'items', 'records', 'results', 'content', 'pacientes', 'faturas', 'titulos', 'agendamentos', 'list'];
        for (const ak of priorityArrayKeys) {
          if (Array.isArray(obj[ak])) {
            sampleArray = obj[ak];
            arrayPath = currentPath ? `${currentPath}.${ak}` : ak;
            return;
          }
        }

        for (const k of Object.keys(obj)) {
          if (Array.isArray(obj[k])) {
            sampleArray = obj[k];
            arrayPath = currentPath ? `${currentPath}.${k}` : k;
            return;
          } else if (obj[k] && typeof obj[k] === 'object' && !Array.isArray(obj[k])) {
            findArrayAndPagination(obj[k], currentPath ? `${currentPath}.${k}` : k);
            if (sampleArray.length > 0) return;
          }
        }
      };

      findArrayAndPagination(parsed);

      if (sampleArray.length > 0 && typeof sampleArray[0] === 'object' && sampleArray[0] !== null) {
        const extractKeys = (obj: any, prefix = '') => {
          Object.keys(obj).forEach(k => {
            const fullKey = prefix ? `${prefix}.${k}` : k;
            if (obj[k] && typeof obj[k] === 'object' && !Array.isArray(obj[k])) {
              extractKeys(obj[k], fullKey);
            } else {
              keys.push(fullKey);
            }
          });
        };
        extractKeys(sampleArray[0]);
      }
    } catch (_) {}

    const urlHasPageParam = /page=|pagina=|offset=/i.test(api1Uri);

    let recommendedStrategy: PaginationStrategyType = 'single_batch';
    let diagnosisSummary = '';

    if (manualTotalPages && Number(manualTotalPages) > 0) {
      recommendedStrategy = 'total_pages';
      diagnosisSummary = `Paginação manual para ${manualTotalPages} páginas. O robô iterará da página 1 até a ${manualTotalPages}.`;
    } else if (hasTotalPagesField) {
      recommendedStrategy = 'total_pages';
      diagnosisSummary = `Campo de páginas detectado ("${totalPagesKeyFound}": ${totalPagesFoundValue}). Controle por totalPages.`;
    } else if (urlHasPageParam || sampleArray.length > 0) {
      recommendedStrategy = 'array_length';
      diagnosisSummary = `Sem totalPages. Paginação contínua enquanto dados.length > 0 até receber lista vazia.`;
    } else {
      recommendedStrategy = 'single_batch';
      diagnosisSummary = `Lote único em memória com consumo sequencial via Array Shift.`;
    }

    return {
      arrayKeyFound: sampleArray.length > 0,
      arrayPath,
      itemCount: sampleArray.length,
      keys: keys.length > 0 ? keys : ['id', 'nome', 'telefone', 'documento', 'vencimento', 'valor', 'codigo'],
      hasTotalPagesField,
      totalPagesKeyFound,
      totalPagesFoundValue: manualTotalPages ? Number(manualTotalPages) : totalPagesFoundValue,
      totalRecordsKeyFound,
      totalRecordsFoundValue,
      urlHasPageParam,
      recommendedStrategy,
      diagnosisSummary
    };
  }, [api1ResponseSample, api1Uri, manualTotalPages]);

  const handleApplyCurl = () => {
    if (!curlInput.trim()) {
      showToast('error', 'Cole um comando cURL válido.');
      return;
    }

    try {
      const parsed = parseCurl(curlInput);

      if (curlTargetNode === 'api1') {
        if (parsed.url) setApi1Uri(parsed.url);
        if (parsed.method) setApi1Method(parsed.method === 'POST' ? 'POST' : 'GET');
        const authH = parsed.headers['Authorization'] || parsed.headers['authorization'];
        if (authH) setApi1AuthHeader(authH);
        setSelectedNodeKey('api1_search');
        showToast('success', 'cURL importado para Busca da Fila (API 1)!');
      } else if (curlTargetNode === 'api2') {
        if (parsed.url) setApi2Uri(parsed.url);
        if (parsed.method && ['POST', 'GET', 'PUT', 'PATCH'].includes(parsed.method)) {
          setApi2Method(parsed.method as 'POST' | 'GET' | 'PUT' | 'PATCH');
        }
        if (parsed.body) setApi2Body(parsed.body);
        const authH = parsed.headers['Authorization'] || parsed.headers['authorization'];
        if (authH) setApi2AuthHeader(authH);
        setSelectedNodeKey('api2_target');
        showToast('success', 'cURL importado para Ação / Disparo (API 2)!');
      } else if (curlTargetNode === 'auth') {
        setHasAuthStep(true);
        if (parsed.url) setAuthUri(parsed.url);
        if (parsed.method) setAuthMethod(parsed.method === 'GET' ? 'GET' : 'POST');
        if (parsed.body) setAuthBody(parsed.body);
        setSelectedNodeKey('auth_step');
        showToast('success', 'cURL importado para Autenticação / Token!');
      } else if (curlTargetNode === 'api3') {
        setHasSecondaryApi(true);
        if (parsed.url) setApi3Uri(parsed.url);
        if (parsed.method) setApi3Method(parsed.method === 'POST' ? 'POST' : 'GET');
        setSelectedNodeKey('secondary_api_step');
        showToast('success', 'cURL importado para Consulta Extra!');
      }

      setShowCurlModal(false);
      setCurlInput('');
    } catch (e: any) {
      showToast('error', 'Falha ao processar cURL: ' + e.message);
    }
  };

  const allNodesMap = useMemo<Record<string, NodeDefinition>>(() => {
    return {
      auth_step: {
        key: 'auth_step',
        title: 'Autenticação',
        subtitle: authName,
        badgeTag: 'Token',
        isOptional: true,
        type: 'auth',
        icon: ShieldCheck,
        color: 'border-blue-500/40 text-blue-400 bg-blue-500/10',
        isCustomized: hasAuthStep,
        aiInstruction: aiInstructions['auth_step']
      },
      api1_search: {
        key: 'api1_search',
        title: 'Busca da Fila',
        subtitle: api1Name,
        badgeTag: 'Origem',
        isOptional: false,
        type: 'search',
        icon: Database,
        color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
        isCustomized: true,
        aiInstruction: aiInstructions['api1_search']
      },
      filter_step: {
        key: 'filter_step',
        title: 'Filtros & Limpeza',
        subtitle: statusFilterValue ? `Status: ${statusFilterValue}` : 'Todos os status',
        badgeTag: 'Filtro',
        isOptional: false,
        type: 'filter',
        icon: Sliders,
        color: 'border-amber-500/40 text-amber-400 bg-amber-500/10',
        isCustomized: !!statusFilterValue,
        aiInstruction: aiInstructions['filter_step']
      },
      loop_label: {
        key: 'loop_label',
        title: 'Início do Loop',
        subtitle: loopTargetLabel,
        badgeTag: 'Início (Label)',
        isOptional: false,
        icon: Repeat,
        color: 'border-[#00D2FF] text-[#00D2FF] bg-[#00D2FF]/15',
        isLoopStart: true,
        isCustomized: true,
        aiInstruction: aiInstructions['loop_label']
      },
      next_item: {
        key: 'next_item',
        title: 'Consumidor (Item)',
        subtitle: 'proximo_da_lista (.shift)',
        badgeTag: 'Consumidor',
        isOptional: false,
        icon: Layers,
        color: 'border-indigo-500/40 text-indigo-400 bg-indigo-500/10',
        isCustomized: true,
        aiInstruction: aiInstructions['next_item']
      },
      condition_step: {
        key: 'condition_step',
        title: 'Condição / Decisão',
        subtitle: 'finished == True',
        badgeTag: 'Condição',
        isOptional: false,
        icon: Cable,
        color: 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10',
        isCustomized: true,
        aiInstruction: aiInstructions['condition_step']
      },
      secondary_api_step: {
        key: 'secondary_api_step',
        title: 'Consulta Extra',
        subtitle: api3Name,
        badgeTag: 'REST Opcional',
        isOptional: true,
        icon: Zap,
        color: 'border-purple-500/40 text-purple-400 bg-purple-500/10',
        isCustomized: hasSecondaryApi,
        aiInstruction: aiInstructions['secondary_api_step']
      },
      api2_target: {
        key: 'api2_target',
        title: 'Ação / Disparo',
        subtitle: api2Name,
        badgeTag: 'Destino',
        isOptional: false,
        type: 'action',
        icon: Play,
        color: 'border-pink-500/40 text-pink-400 bg-pink-500/10',
        isCustomized: true,
        aiInstruction: aiInstructions['api2_target']
      },
      database_step: {
        key: 'database_step',
        title: 'Gravação em Banco',
        subtitle: dbNodeName,
        badgeTag: 'Log DB',
        isOptional: true,
        icon: Database,
        color: 'border-amber-500/40 text-amber-400 bg-amber-500/10',
        isCustomized: hasDatabaseStep,
        aiInstruction: aiInstructions['database_step']
      },
      loop_goto: {
        key: 'loop_goto',
        title: 'Voltar ao Loop',
        subtitle: `Goto "${loopTargetLabel}"`,
        badgeTag: 'Goto',
        isOptional: false,
        icon: RotateCcw,
        color: 'border-rose-500/40 text-rose-400 bg-rose-500/10',
        isLoopBack: true,
        isCustomized: true,
        aiInstruction: aiInstructions['loop_goto']
      }
    };
  }, [
    authName,
    api1Name,
    statusFilterValue,
    loopTargetLabel,
    hasAuthStep,
    hasSecondaryApi,
    hasDatabaseStep,
    api3Name,
    api2Name,
    dbNodeName,
    aiInstructions
  ]);

  const activeInitialNodes = useMemo(() => {
    const validKeys = ['api1_search', 'filter_step'];
    if (hasAuthStep) validKeys.unshift('auth_step');

    const ordered = initialOrder.filter(k => validKeys.includes(k));
    validKeys.forEach(k => {
      if (!ordered.includes(k)) ordered.push(k);
    });
    return ordered.map(k => (allNodesMap as any)[k]).filter(Boolean);
  }, [hasAuthStep, initialOrder, allNodesMap]);

  const activeLoopNodes = useMemo(() => {
    const validKeys = ['loop_label', 'next_item', 'condition_step', 'api2_target', 'loop_goto'];
    if (hasSecondaryApi) validKeys.splice(3, 0, 'secondary_api_step');
    if (hasDatabaseStep) validKeys.splice(validKeys.indexOf('loop_goto'), 0, 'database_step');

    const ordered = loopOrder.filter(k => validKeys.includes(k));
    validKeys.forEach(k => {
      if (!ordered.includes(k)) ordered.push(k);
    });
    return ordered.map(k => (allNodesMap as any)[k]).filter(Boolean);
  }, [hasSecondaryApi, hasDatabaseStep, loopOrder, allNodesMap]);

  const moveInitialNode = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...activeInitialNodes.map(n => n.key)];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newOrder.length) return;

    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIdx];
    newOrder[targetIdx] = temp;

    setInitialOrder(newOrder);
    showToast('info', 'Ordem das etapas iniciais atualizada.');
  };

  const moveLoopNode = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...activeLoopNodes.map(n => n.key)];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newOrder.length) return;

    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIdx];
    newOrder[targetIdx] = temp;

    setLoopOrder(newOrder);
    showToast('info', 'Ordem dos nós do loop atualizada.');
  };

  const removeOptionalNode = (key: string) => {
    if (key === 'auth_step') setHasAuthStep(false);
    if (key === 'secondary_api_step') setHasSecondaryApi(false);
    if (key === 'database_step') setHasDatabaseStep(false);
    setSelectedNodeKey('api1_search');
    showToast('info', 'Etapa removida do workflow.');
  };

  const generatedWorkflow: ForticsWorkflow = useMemo(() => {
    return generateLoopingWorkflow({
      architecture,
      paginationStrategy,
      pageSizeValue,
      workflowName,
      timeoutSeconds,
      loopTargetLabel,
      hasAuthStep,
      authName,
      authMethod,
      authUri,
      authBody,
      api1Name,
      api1Method,
      api1Uri,
      api1AuthHeader,
      statusFilterValue,
      sanitizePhoneBR,
      hasSecondaryApi,
      api3Name,
      api3Method,
      api3Uri,
      api2Name,
      api2Method,
      api2Uri,
      api2AuthHeader,
      api2Body,
      hasDatabaseStep,
      dbNodeName,
      dbNodeMethod,
      dbNodeUri,
      dbNodeAuthHeader,
      dbNodeBody,
      aiInstructions,
      masterAiPrompt
    });
  }, [
    architecture,
    paginationStrategy,
    pageSizeValue,
    workflowName,
    timeoutSeconds,
    loopTargetLabel,
    hasAuthStep,
    authName,
    authMethod,
    authUri,
    authBody,
    api1Name,
    api1Method,
    api1Uri,
    api1AuthHeader,
    statusFilterValue,
    sanitizePhoneBR,
    hasSecondaryApi,
    api3Name,
    api3Method,
    api3Uri,
    api2Name,
    api2Method,
    api2Uri,
    api2AuthHeader,
    api2Body,
    hasDatabaseStep,
    dbNodeName,
    dbNodeMethod,
    dbNodeUri,
    dbNodeAuthHeader,
    dbNodeBody,
    aiInstructions,
    masterAiPrompt
  ]);

  const [aiOptimizedWorkflow, setAiOptimizedWorkflow] = useState<ForticsWorkflow | null>(null);
  const [aiImprovements, setAiImprovements] = useState<string[]>([]);
  const [useAiVersion, setUseAiVersion] = useState<boolean>(true);

  const activeWorkflow = useMemo(() => {
    if (useAiVersion && aiOptimizedWorkflow) {
      return aiOptimizedWorkflow;
    }
    return generatedWorkflow;
  }, [useAiVersion, aiOptimizedWorkflow, generatedWorkflow]);

  const jsonString = useMemo(() => {
    return JSON.stringify(activeWorkflow, null, 2);
  }, [activeWorkflow]);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonString);
    setCopiedJson(true);
    showToast('success', 'Workflow JSON copiado com sucesso!');
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflowName.toLowerCase().replace(/\s+/g, '_')}_loop.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Arquivo JSON baixado!');
  };

  const handleAiOptimizeWorkflow = async () => {
    setIsAiOptimizing(true);
    showToast('info', 'Consultando IA Gemini para auditar e compilar o loop...');
    try {
      const res = await fetch('/api/optimize-loop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflow: generatedWorkflow,
          prompt: masterAiPrompt,
          rules: 'Garantir conformidade Fortics V3, try/catch com tratamentos de erro em todos os nós code, controle de repetição rigoroso com shift/fila ou dupla paginação, nós de condição (==, left, right, then, else) e saída final com route_return 200 formatada com {{#tojson}}.',
          sampleResponse: api1ResponseSample
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Erro ${res.status}: Falha ao processar com IA.`);
      }

      const data = await res.json();
      if (data.workflow) {
        setAiOptimizedWorkflow(data.workflow);
        setAiImprovements(data.improvements || ['Validação e compilação estrutural de nós executada com sucesso pela IA.']);
        setUseAiVersion(true);
        showToast('success', '✨ Loop compilado e validado pela IA Gemini com 100% de conformidade!');
      } else {
        throw new Error('Retorno da IA sem workflow válido.');
      }
    } catch (e: any) {
      showToast('error', 'Erro ao otimizar com IA: ' + e.message);
    } finally {
      setIsAiOptimizing(false);
    }
  };

  const selectedNode = allNodesMap[selectedNodeKey] || null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-[#00D2FF] shadow-lg shadow-cyan-500/10">
              <Repeat className="w-6 h-6 animate-spin" style={{ animationDuration: '10s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-white tracking-tight">
                  Gerador de Looping Automatizado
                </h1>
                <span className="text-[11px] font-bold uppercase bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
                  Fortics V3 Spec
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Construção de workflows com repetição em fila contínua, paginação por lotes e anti-estouro de memória.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleAiOptimizeWorkflow}
              disabled={isAiOptimizing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#00D2FF] to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-slate-950 animate-bounce" />
              {isAiOptimizing ? 'Compilando com IA...' : 'Compilar Loop com IA'}
            </button>

            {aiOptimizedWorkflow && (
              <div className="flex items-center bg-slate-950 border border-slate-700 rounded-xl p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setUseAiVersion(true)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                    useAiVersion
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  Versão IA
                </button>
                <button
                  type="button"
                  onClick={() => setUseAiVersion(false)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    !useAiVersion
                      ? 'bg-slate-800 text-slate-200 border border-slate-600 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Versão Base
                </button>
              </div>
            )}

            {onLoadIntoStudio && (
              <button
                type="button"
                onClick={() => {
                  onLoadIntoStudio(activeWorkflow);
                  showToast('success', 'Workflow carregado no Studio Builder!');
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-200 text-xs font-semibold transition-all cursor-pointer"
              >
                <HardDriveDownload className="w-4 h-4 text-indigo-400" />
                Carregar no Studio
              </button>
            )}

            <button
              type="button"
              onClick={handleCopyJson}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
            >
              {copiedJson ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
              {copiedJson ? 'Copiado!' : 'Copiar JSON'}
            </button>

            <button
              type="button"
              onClick={handleDownloadJson}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-400" />
              Baixar
            </button>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-cyan-300 flex items-center gap-2">
              <Bot className="w-4 h-4 text-cyan-400" />
              Prompt Mestre da IA (Objetivo Geral do Workflow em Texto Livre)
            </label>
            <span className="text-[11px] text-slate-400">A IA utiliza esse contexto para ajustar a lógica de todos os nós</span>
          </div>
          <textarea
            rows={2}
            value={masterAiPrompt}
            onChange={(e) => setMasterAiPrompt(e.target.value)}
            placeholder="Descreva o que o fluxo completo deve fazer (ex: Fazer varredura na API de agendamentos, filtrar pacientes da unidade X, verificar se já enviou no GoDB e disparar confirmação via SZ.chat)..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:border-[#00D2FF] focus:ring-1 focus:ring-[#00D2FF] focus:outline-none leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Arquitetura de Repetição</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setArchitecture('simple_shift')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer text-center ${
                  architecture === 'simple_shift'
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Lote Único (Shift)
              </button>
              <button
                type="button"
                onClick={() => setArchitecture('double_pagination')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer text-center ${
                  architecture === 'double_pagination'
                    ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Duplo Loop (Páginas)
              </button>
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Nome do Workflow</label>
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 text-xs text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Ponto de Retorno (Label Target)</label>
            <input
              type="text"
              value={loopTargetLabel}
              onChange={(e) => setLoopTargetLabel(e.target.value)}
              placeholder="Ex: validação"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 text-xs text-cyan-300 font-mono focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <LoopDiagnosticCard
        diagnostic={diagnostic}
        paginationStrategy={paginationStrategy}
        onSelectStrategy={setPaginationStrategy}
        manualTotalPages={manualTotalPages}
        onChangeManualTotalPages={setManualTotalPages}
      />

      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode('pipeline')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'pipeline'
                ? 'bg-slate-800 text-cyan-300 border border-slate-700 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers2 className="w-4 h-4" />
            Fluxo Visual & Configuração de Nós
          </button>

          <button
            type="button"
            onClick={() => setViewMode('json')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'json'
                ? 'bg-slate-800 text-cyan-300 border border-slate-700 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileJson className="w-4 h-4" />
            JSON Oficial Gerado ({generatedWorkflow.flow.length} nós)
          </button>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Nó selecionado: <span className="text-cyan-400 font-semibold">{selectedNode?.title || 'Nenhum'}</span>
        </div>
      </div>

      {viewMode === 'pipeline' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7">
            <VerticalPipelineView
              initialNodes={activeInitialNodes}
              loopNodes={activeLoopNodes}
              selectedNodeKey={selectedNodeKey}
              onSelectNode={setSelectedNodeKey}
              onMoveInitialNode={moveInitialNode}
              onMoveLoopNode={moveLoopNode}
              onRemoveOptionalNode={removeOptionalNode}
              loopTargetLabel={loopTargetLabel}
              onChangeLoopTargetLabel={setLoopTargetLabel}
              orientation={orientation}
              onToggleOrientation={() => setOrientation(prev => prev === 'vertical' ? 'horizontal' : 'vertical')}
              hasAuthStep={hasAuthStep}
              onToggleAuthStep={() => {
                setHasAuthStep(true);
                setSelectedNodeKey('auth_step');
              }}
              hasSecondaryApi={hasSecondaryApi}
              onToggleSecondaryApi={() => {
                setHasSecondaryApi(true);
                setSelectedNodeKey('secondary_api_step');
              }}
              hasDatabaseStep={hasDatabaseStep}
              onToggleDatabaseStep={() => {
                setHasDatabaseStep(true);
                setSelectedNodeKey('database_step');
              }}
              aiInstructions={aiInstructions}
              onUpdateAiInstruction={handleUpdateAiInstruction}
            />
          </div>

          <div className="lg:col-span-5 sticky top-4">
            <NodeConfigDrawer
              selectedNode={selectedNode}
              aiInstructions={aiInstructions}
              onUpdateAiInstruction={handleUpdateAiInstruction}
              authName={authName}
              setAuthName={setAuthName}
              authMethod={authMethod}
              setAuthMethod={setAuthMethod}
              authUri={authUri}
              setAuthUri={setAuthUri}
              authBody={authBody}
              setAuthBody={setAuthBody}
              api1Name={api1Name}
              setApi1Name={setApi1Name}
              api1Method={api1Method}
              setApi1Method={setApi1Method}
              api1Uri={api1Uri}
              setApi1Uri={setApi1Uri}
              api1AuthHeader={api1AuthHeader}
              setApi1AuthHeader={setApi1AuthHeader}
              api1ResponseSample={api1ResponseSample}
              setApi1ResponseSample={setApi1ResponseSample}
              statusFilterValue={statusFilterValue}
              setStatusFilterValue={setStatusFilterValue}
              sanitizePhoneBR={sanitizePhoneBR}
              setSanitizePhoneBR={setSanitizePhoneBR}
              loopTargetLabel={loopTargetLabel}
              setLoopTargetLabel={setLoopTargetLabel}
              api3Name={api3Name}
              setApi3Name={setApi3Name}
              api3Method={api3Method}
              setApi3Method={setApi3Method}
              api3Uri={api3Uri}
              setApi3Uri={setApi3Uri}
              api2Name={api2Name}
              setApi2Name={setApi2Name}
              api2Method={api2Method}
              setApi2Method={setApi2Method}
              api2Uri={api2Uri}
              setApi2Uri={setApi2Uri}
              api2AuthHeader={api2AuthHeader}
              setApi2AuthHeader={setApi2AuthHeader}
              api2Body={api2Body}
              setApi2Body={setApi2Body}
              dbNodeName={dbNodeName}
              setDbNodeName={setDbNodeName}
              dbNodeUri={dbNodeUri}
              setDbNodeUri={setDbNodeUri}
              dbNodeBody={dbNodeBody}
              setDbNodeBody={setDbNodeBody}
              onOpenCurlModal={(target) => {
                setCurlTargetNode(target);
                setShowCurlModal(true);
              }}
              availableKeys={diagnostic.keys}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {aiOptimizedWorkflow && (
            <div className="bg-gradient-to-r from-cyan-950/40 via-indigo-950/40 to-slate-900 border border-cyan-500/30 rounded-2xl p-4 shadow-xl">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
                  <span>Otimização e Validação Estrutural Gemini</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">Exibindo:</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${useAiVersion ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800 text-slate-300'}`}>
                    {useAiVersion ? 'Versão Otimizada pela IA' : 'Versão Base do Gerador'}
                  </span>
                </div>
              </div>

              <div className="space-y-1 mt-2">
                {aiImprovements.map((imp, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span>{imp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <span>Estrutura JSON Oficial Fortics Workflow ({activeWorkflow.flow.length} nós)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copiar
                </button>
              </div>
            </div>

            <pre className="p-4 bg-slate-950 rounded-xl font-mono text-xs text-emerald-300 overflow-x-auto max-h-[600px] border border-slate-800/80 leading-relaxed">
              {jsonString}
            </pre>
          </div>
        </div>
      )}

      {showCurlModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Importar Comando cURL</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCurlModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 bg-slate-800 rounded-lg cursor-pointer"
              >
                Fechar
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Cole o comando cURL completo da sua API (Postman, Swagger ou DevTools). O método, URL, headers e body serão extraídos automaticamente para o nó selecionado.
            </p>

            <textarea
              rows={6}
              value={curlInput}
              onChange={(e) => setCurlInput(e.target.value)}
              placeholder={`curl --location 'https://api.empresa.com/v1/endpoint' \\\n--header 'Authorization: Bearer seu_token' \\\n--header 'Content-Type: application/json' \\\n--data '{"chave": "valor"}'`}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-cyan-300 font-mono focus:border-cyan-500 focus:outline-none"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCurlModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleApplyCurl}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/30"
              >
                <UploadCloud className="w-4 h-4" />
                Importar e Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
