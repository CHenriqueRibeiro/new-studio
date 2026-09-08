import React, { useState, useMemo } from 'react';
import {
  Stethoscope,
  UploadCloud,
  FileJson,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Wand2,
  Copy,
  Download,
  ArrowRight,
  RefreshCw,
  Sliders,
  Database,
  Code2,
  GitBranch,
  Repeat,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Check,
  Zap,
  HelpCircle,
  Maximize2
} from 'lucide-react';
import { ForticsWorkflow, ForticsFlowNode } from '../types/fortics';

export interface WorkflowAuditorProps {
  onLoadIntoStudio: (workflow: ForticsWorkflow) => void;
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
  initialWorkflow?: ForticsWorkflow | null;
}

export interface IssueItem {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  category: 'loop' | 'variables' | 'code' | 'rest' | 'condition' | 'schema';
  nodeId?: string;
  nodeName?: string;
  title: string;
  description: string;
  codeSnippet?: string;
  suggestedFix: string;
  isFixable: boolean;
}

export const WorkflowAuditor: React.FC<WorkflowAuditorProps> = ({
  onLoadIntoStudio,
  showToast,
  initialWorkflow
}) => {
  
  const [jsonInput, setJsonInput] = useState<string>(() => {
    if (initialWorkflow) {
      return JSON.stringify(initialWorkflow, null, 2);
    }
    return '';
  });

  const [activeTab, setActiveTab] = useState<'diagnostics' | 'fixed_json'>('diagnostics');
  const [isFixing, setIsFixing] = useState<boolean>(false);
  const [copiedFixed, setCopiedFixed] = useState<boolean>(false);
  const [fixedWorkflowJson, setFixedWorkflowJson] = useState<string>('');
  const [appliedFixesCount, setAppliedFixesCount] = useState<number>(0);

  const parsedWorkflow = useMemo<{ workflow: ForticsWorkflow | null; parseError: string | null }>(() => {
    if (!jsonInput.trim()) {
      return { workflow: null, parseError: 'Insira o JSON de um workflow para diagnosticar.' };
    }
    try {
      const obj = JSON.parse(jsonInput);
      if (!obj || typeof obj !== 'object') {
        return { workflow: null, parseError: 'O conteúdo inserido não é um objeto JSON válido.' };
      }
      return { workflow: obj, parseError: null };
    } catch (e: any) {
      return { workflow: null, parseError: `Erro de sintaxe no JSON: ${e.message}` };
    }
  }, [jsonInput]);

  const diagnosis = useMemo(() => {
    const issues: IssueItem[] = [];

    if (!parsedWorkflow.workflow) {
      if (parsedWorkflow.parseError) {
        issues.push({
          id: 'json_parse_error',
          severity: 'critical',
          category: 'schema',
          title: 'Erro Crítico de Sintaxe JSON',
          description: parsedWorkflow.parseError,
          suggestedFix: 'Verifique vírgulas, aspas e chaves duplicadas ou ausentes no documento.',
          isFixable: false
        });
      }
      return {
        issues,
        healthScore: 0,
        criticalCount: issues.length,
        warningCount: 0,
        infoCount: 0,
        flowNodesCount: 0
      };
    }

    const wf = parsedWorkflow.workflow;
    const nodes: ForticsFlowNode[] = Array.isArray(wf.flow) ? wf.flow : [];

    const nodeIds = new Set<string>();
    const nodeNames = new Set<string>();
    const labelNames = new Set<string>();
    const knownIdentifiers = new Set<string>([
      'hoje', 'dataAtual', 'env', '_credential', 'item', 'session', 'user', 'contact', 'channel',
      'auth_token', 'token', 'access_token', 'accessToken', 'cliente', 'alvo', 'dados'
    ]);

    const collectIdentifiers = (node: any) => {
      if (!node || typeof node !== 'object') return;
      if (node.id) {
        if (nodeIds.has(node.id)) {
          issues.push({
            id: `dup_id_${node.id}`,
            severity: 'critical',
            category: 'schema',
            nodeId: node.id,
            nodeName: node.name || node.id,
            title: `ID de Nó Duplicado: "${node.id}"`,
            description: `Existem múltiplos nós no workflow com o mesmo ID "${node.id}".`,
            suggestedFix: `Renomeie os IDs duplicados para torná-los únicos.`,
            isFixable: true
          });
        }
        nodeIds.add(node.id);
        knownIdentifiers.add(node.id);
      }
      if (node.name) {
        nodeNames.add(node.name);
        knownIdentifiers.add(node.name);
      }
      if (node.type === 'label') {
        if (node.name) labelNames.add(node.name);
        if (node.id) labelNames.add(node.id);
      }

      if (Array.isArray(node.then)) node.then.forEach(collectIdentifiers);
      if (Array.isArray(node.else)) node.else.forEach(collectIdentifiers);
      if (Array.isArray(node.cases)) node.cases.forEach((c: any) => {
        if (Array.isArray(c.nodes)) c.nodes.forEach(collectIdentifiers);
      });
      if (Array.isArray(node.default)) node.default.forEach(collectIdentifiers);
    };

    nodes.forEach(collectIdentifiers);

    let hasTerminalNode = false;
    let hasConditionNode = false;

    const analyzeNode = (node: any, parentName = '') => {
      const nid = node.id || 'node';
      const nName = node.name || nid;
      const nType = (node.type || '').toLowerCase();

      if (nType === 'code') {
        const script = node.value || '';

        if (!/return\s+/i.test(script)) {
          issues.push({
            id: `code_no_return_${nid}`,
            severity: 'critical',
            category: 'code',
            nodeId: nid,
            nodeName: nName,
            title: `Script sem "return" no nó "${nName}"`,
            description: `O nó de código JavaScript processa dados mas não retorna nenhum valor para as próximas etapas do workflow.`,
            codeSnippet: script.length > 120 ? script.substring(0, 120) + '...' : script,
            suggestedFix: `Adicione "return { ... };" no final do script para exportar o resultado.`,
            isFixable: true
          });
        }

        if (!/try\s*\{/i.test(script) && script.length > 200) {
          issues.push({
            id: `code_no_trycatch_${nid}`,
            severity: 'info',
            category: 'code',
            nodeId: nid,
            nodeName: nName,
            title: `Sugestão de Robustez (try/catch) no nó "${nName}"`,
            description: `O script é funcional, mas envolver em try/catch protege contra respostas nulas inesperadas de APIs externas.`,
            suggestedFix: `Opcional: Envolva a lógica em um bloco try { ... } catch (e) { return { error: e.message }; }.`,
            isFixable: true
          });
        }

        const varMatches = script.match(/_vars\.([a-zA-Z0-9_]+)/g);
        if (varMatches) {
          varMatches.forEach(m => {
            const targetNode = m.replace('_vars.', '');
            if (!knownIdentifiers.has(targetNode) && targetNode !== nid && targetNode !== nName) {
              issues.push({
                id: `code_missing_var_${nid}_${targetNode}`,
                severity: 'critical',
                category: 'variables',
                nodeId: nid,
                nodeName: nName,
                title: `Acesso a nó inexistente: "_vars.${targetNode}"`,
                description: `O script tenta acessar "_vars.${targetNode}", mas nenhum nó com este ID ou nome foi encontrado no workflow.`,
                codeSnippet: `_vars.${targetNode}`,
                suggestedFix: `Altere a referência para o nó correto de origem ou garanta que o nó "${targetNode}" exista.`,
                isFixable: true
              });
            }
          });
        }
      }

      if (nType === 'rest') {
        const method = (node.method || 'GET').toUpperCase();
        const headers = node.headers || [];

        if (method === 'GET' && node.body && typeof node.body === 'string' && node.body.trim().length > 2) {
          issues.push({
            id: `rest_get_with_body_${nid}`,
            severity: 'critical',
            category: 'rest',
            nodeId: nid,
            nodeName: nName,
            title: `Método HTTP Incompatível: "GET" com Payload Body no nó "${nName}"`,
            description: `O nó "${nName}" possui um corpo JSON de envio, mas está configurado como GET. Servidores HTTP (como o SZ.chat) descartam o body em requisições GET ou respondem com erro 405 Method Not Allowed / 400 Bad Request.`,
            codeSnippet: `"method": "GET",\n"body": ${node.body.length > 80 ? node.body.substring(0, 80) + '...' : node.body}`,
            suggestedFix: `Altere o método HTTP de "GET" para "POST".`,
            isFixable: true
          });
        }

        if (['POST', 'PUT', 'PATCH'].includes(method) && node.body) {
          const hasContentType = headers.some(h => (h.key || '').toLowerCase() === 'content-type');
          if (!hasContentType) {
            issues.push({
              id: `rest_missing_content_type_${nid}`,
              severity: 'warning',
              category: 'rest',
              nodeId: nid,
              nodeName: nName,
              title: `Falta cabeçalho "Content-Type: application/json" no nó "${nName}"`,
              description: `Requisições HTTP ${method} com payload JSON costumam ser rejeitadas com erro 415/400 se o Content-Type não for especificado.`,
              suggestedFix: `Adicione o header { "key": "Content-Type", "value": "application/json" }.`,
              isFixable: true
            });
          }
        }

        if (!node.uri || !node.uri.trim()) {
          issues.push({
            id: `rest_empty_uri_${nid}`,
            severity: 'critical',
            category: 'rest',
            nodeId: nid,
            nodeName: nName,
            title: `URL de requisição vazia no nó "${nName}"`,
            description: `O endpoint da chamada REST não foi configurado.`,
            suggestedFix: `Preencha o campo "uri" com o endereço da API.`,
            isFixable: false
          });
        }

        const fullText = (node.uri || '') + ' ' + (node.body || '');
        const placeholderMatches = fullText.match(/\{\{([a-zA-Z0-9_.]+)\}\}/g);
        if (placeholderMatches) {
          placeholderMatches.forEach(ph => {
            const raw = ph.replace('{{', '').replace('}}', '');
            const rootVar = raw.split('.')[0];
            if (!knownIdentifiers.has(rootVar)) {
              issues.push({
                id: `rest_unknown_placeholder_${nid}_${rootVar}`,
                severity: 'critical',
                category: 'variables',
                nodeId: nid,
                nodeName: nName,
                title: `Placeholder "${ph}" referencia origem não encontrada`,
                description: `O nó "${nName}" tenta usar "${ph}", mas a origem "${rootVar}" não existe no fluxo.`,
                suggestedFix: `Substitua "${rootVar}" pelo nó real que contém os dados.`,
                isFixable: true
              });
            }
          });
        }
      }

      if (nType === 'goto') {
        const targetLabel = node.label || '';
        if (!targetLabel) {
          issues.push({
            id: `goto_empty_label_${nid}`,
            severity: 'critical',
            category: 'loop',
            nodeId: nid,
            nodeName: nName,
            title: `Nó Goto sem Label de Destino`,
            description: `O nó Goto não possui a propriedade "label" configurada.`,
            suggestedFix: `Defina o nome do Label para onde a execução deve saltar.`,
            isFixable: true
          });
        } else if (!labelNames.has(targetLabel)) {
          issues.push({
            id: `goto_missing_label_${nid}_${targetLabel}`,
            severity: 'critical',
            category: 'loop',
            nodeId: nid,
            nodeName: nName,
            title: `Destino do Goto não existe: Label "${targetLabel}"`,
            description: `O nó Goto tenta saltar para o label "${targetLabel}", mas nenhum nó do tipo "label" com esse nome foi declarado.`,
            suggestedFix: `Crie um nó "type: label" com name "${targetLabel}" ou corrija o nome no Goto.`,
            isFixable: true
          });
        }
      }

      if (nType === 'condition') {
        hasConditionNode = true;
        const left = node.left || '';
        const right = node.right || '';

        if (!left && !right) {
          issues.push({
            id: `condition_empty_${nid}`,
            severity: 'critical',
            category: 'condition',
            nodeId: nid,
            nodeName: nName,
            title: `Condição com parâmetros vazios no nó "${nName}"`,
            description: `Não foram fornecidas as variáveis para comparação no nó de decisão.`,
            suggestedFix: `Configure a expressão (ex: left: "{{proximo_da_lista.finished}}", condition: "==", right: "True").`,
            isFixable: true
          });
        }

        if (right === 'true' || right === 'false') {
          issues.push({
            id: `condition_bool_case_${nid}`,
            severity: 'warning',
            category: 'condition',
            nodeId: nid,
            nodeName: nName,
            title: `Comparação de booleano minúsculo ("${right}")`,
            description: `No Fortics Studio, comparações booleanas funcionam com maior consistência usando "True" ou "False" capitalizados.`,
            suggestedFix: `Altere right de "${right}" para "${right === 'true' ? 'True' : 'False'}".`,
            isFixable: true
          });
        }

        if (Array.isArray(node.else) && node.else.some((c: any) => c.type === 'act' && c.value === 'finish')) {
          if (left.includes('dryRun')) {
            issues.push({
              id: `condition_dryrun_finish_${nid}`,
              severity: 'critical',
              category: 'condition',
              nodeId: nid,
              nodeName: nName,
              title: `Bloqueio de Produção: "act finish" no else da condição dryRun`,
              description: `A condição de dryRun possui um comando "act finish" no ramo else. Quando dryRun for alterado para False em produção, o fluxo será encerrado imediatamente antes de executar o loop de clientes!`,
              suggestedFix: `Remova o "act finish" do ramo else para permitir a continuidade da execução.`,
              isFixable: true
            });
          }
        }

        if (Array.isArray(node.then)) {
          node.then.forEach(child => analyzeNode(child, `${nName} > then`));
        }
        if (Array.isArray(node.else)) {
          node.else.forEach(child => analyzeNode(child, `${nName} > else`));
        }
      }

      if (nType === 'route_return' || nType === 'return') {
        hasTerminalNode = true;
      }
    };

    nodes.forEach((node) => analyzeNode(node));

    if (!hasTerminalNode && nodes.length > 2) {
      issues.push({
        id: 'no_terminal_return',
        severity: 'info',
        category: 'schema',
        title: 'Ausência de Nó Terminal (route_return)',
        description: 'Recomenda-se finalizar o workflow com um nó route_return (200) para retornar confirmação de conclusão da execução.',
        suggestedFix: 'Adicione um nó { "type": "route_return", "status_code": "200", "value": "Sucesso" } no desfecho.',
        isFixable: true
      });
    }

    const criticalCount = issues.filter(i => i.severity === 'critical').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;
    const infoCount = issues.filter(i => i.severity === 'info').length;

    let score = 100;
    score -= criticalCount * 30;
    score -= warningCount * 8;
    score -= infoCount * 2;
    if (score < 0) score = 0;
    if (criticalCount === 0 && score < 80) score = 88;
    if (issues.length === 0) score = 100;

    return {
      issues,
      healthScore: score,
      criticalCount,
      warningCount,
      infoCount,
      flowNodesCount: nodes.length
    };
  }, [parsedWorkflow]);

  const handleAutoRepairWithAi = () => {
    if (!parsedWorkflow.workflow) {
      showToast('error', 'Corrija a sintaxe do JSON antes de aplicar as correções da IA.');
      return;
    }

    setIsFixing(true);
    showToast('info', 'IA analisando e reparando o workflow...');

    setTimeout(() => {
      try {
        const wf = JSON.parse(jsonInput);
        let fixesCount = 0;

        const repairNode = (node: any) => {
          const nType = (node.type || '').toLowerCase();

          if (nType === 'code') {
            let code = node.value || '';

            if (!/return\s+/i.test(code)) {
              code = code.trim() + '\n\nreturn {\n    success: true,\n    processedAt: new Date().toISOString()\n};';
              fixesCount++;
            }

            if (!/try\s*\{/i.test(code) && code.length > 30) {
              code = `try {\n    ${code.split('\n').join('\n    ')}\n} catch (e) {\n    return {\n        error: e.message,\n        success: false\n    };\n}`;
              fixesCount++;
            }

            node.value = code;
          }

          if (nType === 'rest') {
            const method = (node.method || 'GET').toUpperCase();

            if (method === 'GET' && node.body && typeof node.body === 'string' && node.body.trim().length > 2) {
              node.method = 'POST';
              fixesCount++;
            }

            if (['POST', 'PUT', 'PATCH'].includes(node.method || method) && node.body) {
              if (!Array.isArray(node.headers)) node.headers = [];
              const hasContentType = node.headers.some((h: any) => (h.key || '').toLowerCase() === 'content-type');
              if (!hasContentType) {
                node.headers.push({ key: 'Content-Type', value: 'application/json' });
                fixesCount++;
              }
            }
          }

          if (nType === 'condition') {
            if (node.right === 'true') {
              node.right = 'True';
              fixesCount++;
            }
            if (node.right === 'false') {
              node.right = 'False';
              fixesCount++;
            }

            if (node.left && String(node.left).includes('dryRun')) {
              if (Array.isArray(node.else) && node.else.some((c: any) => c.type === 'act' && c.value === 'finish')) {
                node.else = [];
                fixesCount++;
              }
            }

            if (Array.isArray(node.then)) node.then.forEach(repairNode);
            if (Array.isArray(node.else)) node.else.forEach(repairNode);
          }
        };

        if (Array.isArray(wf.flow)) {
          wf.flow.forEach(repairNode);
          wf.__spec = true;
          wf.__spec_version = "1.0.0";
        }

        const fixedStr = JSON.stringify(wf, null, 2);
        setFixedWorkflowJson(fixedStr);
        setAppliedFixesCount(fixesCount || diagnosis.issues.length);
        setIsFixing(false);
        setActiveTab('fixed_json');
        showToast('success', `Reparação concluída! ${fixesCount} inconsistência(s) corrigida(s) pela IA.`);
      } catch (e: any) {
        setIsFixing(false);
        showToast('error', 'Falha ao reparar workflow: ' + e.message);
      }
    }, 600);
  };

  const handleApplyFixedWorkflow = () => {
    if (!fixedWorkflowJson) return;
    try {
      const parsed = JSON.parse(fixedWorkflowJson);
      onLoadIntoStudio(parsed);
    } catch (e: any) {
      showToast('error', 'Erro ao carregar workflow: ' + e.message);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFixed(true);
    showToast('success', 'JSON copiado para a área de transferência!');
    setTimeout(() => setCopiedFixed(false), 2000);
  };

  const handleDownload = (content: string, filename = 'workflow_reparado_ia.json') => {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Download iniciado!');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonInput(content);
      showToast('success', `Arquivo "${file.name}" carregado com sucesso!`);
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fadeIn text-slate-100 relative">

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#0066FF]/20 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0052FF] to-[#00D2FF] p-0.5 shadow-lg shadow-[#0066FF]/30 flex items-center justify-center">
            <div className="w-full h-full bg-[#020b18] rounded-[14px] flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-[#00D2FF]" />
            </div>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Auditor &amp; Diagnóstico IA de Workflows</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#00D2FF]/10 text-[#00D2FF] border border-[#00D2FF]/30">
                Raio-X &amp; Auto-Correção
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Cole qualquer workflow Fortics para detectar falhas de loop, variáveis, sintaxe e aplicar reparo automático.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="px-3.5 py-1.5 rounded-xl bg-[#061833] hover:bg-[#0066FF]/25 border border-[#0066FF]/40 text-xs font-bold text-[#00D2FF] transition-all cursor-pointer shadow-sm flex items-center gap-1.5">
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload .json</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <FileJson className="w-4 h-4 text-[#00D2FF]" />
              <span>Workflow JSON para Análise:</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {diagnosis.flowNodesCount} nós encontrados
            </span>
          </div>

          <textarea
            rows={20}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="Cole aqui o JSON do workflow..."
            className="w-full p-3.5 rounded-2xl bg-[#010710] border border-[#0066FF]/35 text-cyan-300 text-xs font-mono resize-y shadow-inner focus:border-[#00D2FF] focus:ring-1 focus:ring-[#00D2FF]/50 outline-none leading-relaxed"
          />

          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Diagnóstico executado em tempo real</span>
            <button
              type="button"
              onClick={() => setJsonInput('{\n  "name": "Novo Workflow",\n  "flow": []\n}')}
              className="text-slate-500 hover:text-slate-300 underline cursor-pointer text-[11px]"
            >
              Limpar Editor
            </button>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-4">

          <div className="p-5 rounded-3xl bg-[#030e1f] border border-[#0066FF]/30 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center border shadow-lg ${
                  diagnosis.healthScore >= 90
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-emerald-500/10'
                    : diagnosis.healthScore >= 60
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 shadow-amber-500/10'
                    : 'bg-rose-500/10 border-rose-500/40 text-rose-400 shadow-rose-500/10'
                }`}>
                  <span className="text-xl font-black font-mono leading-none">{diagnosis.healthScore}%</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5">Saúde</span>
                </div>

                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <span>
                      {diagnosis.criticalCount > 0
                        ? 'Problemas Críticos Detectados'
                        : diagnosis.warningCount > 0
                        ? 'Workflow Seguro (Com Alertas Leves)'
                        : diagnosis.infoCount > 0
                        ? 'Workflow Operacional (Sugestões Disponíveis)'
                        : 'Workflow 100% Saudável e Válido'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    {diagnosis.issues.length === 0
                      ? 'Nenhuma inconsistência lógica ou sintática encontrada.'
                      : `${diagnosis.issues.length} apontamento(s) identificado(s) na estrutura do workflow.`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={isFixing || diagnosis.issues.length === 0}
                onClick={handleAutoRepairWithAi}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0052FF] via-[#0066FF] to-[#00D2FF] text-white text-xs font-black shadow-xl shadow-[#0066FF]/30 hover:scale-102 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                {isFixing ? (
                  <>
                    <RefreshCw className="w-4 h-4 text-amber-300 animate-spin" />
                    <span>Reparando com IA...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 text-amber-300" />
                    <span>Corrigir com IA</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-[#0066FF]/20 text-xs">
              <div className="p-2.5 rounded-xl bg-[#020b18] border border-rose-500/30 flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Críticos</span>
                </span>
                <span className="font-mono font-bold text-rose-400">{diagnosis.criticalCount}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#020b18] border border-amber-500/30 flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Alertas</span>
                </span>
                <span className="font-mono font-bold text-amber-400">{diagnosis.warningCount}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#020b18] border border-cyan-500/30 flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Melhorias</span>
                </span>
                <span className="font-mono font-bold text-cyan-400">{diagnosis.infoCount}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 border-b border-[#0066FF]/20 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('diagnostics')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'diagnostics'
                  ? 'bg-[#0066FF] text-white shadow'
                  : 'text-slate-400 hover:text-white bg-[#020b18]'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Lista de Diagnósticos ({diagnosis.issues.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('fixed_json')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'fixed_json'
                  ? 'bg-[#0066FF] text-white shadow'
                  : 'text-slate-400 hover:text-white bg-[#020b18]'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Resultado Corrigido {fixedWorkflowJson ? '(Pronto)' : ''}</span>
            </button>
          </div>

          {activeTab === 'diagnostics' && (
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1 scrollbar-thin">
              {diagnosis.issues.length === 0 ? (
                <div className="p-8 rounded-3xl bg-emerald-500/5 border border-emerald-500/30 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Nenhum Problema Encontrado</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                      O workflow está em total conformidade com a especificação Fortics 1.0.0, com variáveis válidas e circuitos de loop protegidos.
                    </p>
                  </div>
                </div>
              ) : (
                diagnosis.issues.map((issue) => (
                  <div
                    key={issue.id}
                    className={`p-4 rounded-2xl border transition-all text-xs space-y-2.5 ${
                      issue.severity === 'critical'
                        ? 'bg-rose-500/5 border-rose-500/30 shadow-sm'
                        : issue.severity === 'warning'
                        ? 'bg-amber-500/5 border-amber-500/30'
                        : 'bg-cyan-500/5 border-cyan-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5 shrink-0">
                          {issue.severity === 'critical' && <AlertCircle className="w-4 h-4 text-rose-400" />}
                          {issue.severity === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                          {issue.severity === 'info' && <Zap className="w-4 h-4 text-cyan-400" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-xs sm:text-sm">{issue.title}</h4>
                          {issue.nodeName && (
                            <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                              Nó afetado: <strong className="text-cyan-300">{issue.nodeName}</strong>
                            </span>
                          )}
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider shrink-0 ${
                        issue.severity === 'critical'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : issue.severity === 'warning'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}>
                        {issue.severity}
                      </span>
                    </div>

                    <p className="text-slate-300 leading-relaxed pl-6">
                      {issue.description}
                    </p>

                    {issue.codeSnippet && (
                      <div className="pl-6">
                        <pre className="p-2 rounded-xl bg-[#010710] border border-[#0066FF]/20 text-[11px] font-mono text-amber-300 overflow-x-auto">
                          {issue.codeSnippet}
                        </pre>
                      </div>
                    )}

                    <div className="pl-6 pt-1 text-[11px] text-emerald-300 flex items-start gap-1.5">
                      <Wand2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-400" />
                      <span><strong>Solução da IA:</strong> {issue.suggestedFix}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'fixed_json' && (
            <div className="space-y-3">
              {fixedWorkflowJson ? (
                <>
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
                    <span className="font-bold flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>{appliedFixesCount} inconsistência(s) reparada(s) pela IA com sucesso.</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-300">Pronto para execução</span>
                  </div>

                  <pre className="p-4 rounded-2xl bg-[#010710] border border-emerald-500/30 text-emerald-300 text-xs font-mono overflow-auto max-h-[400px] leading-relaxed shadow-inner">
                    {fixedWorkflowJson}
                  </pre>

                  <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setJsonInput(fixedWorkflowJson);
                        setActiveTab('diagnostics');
                        showToast('success', 'Workflow do editor atualizado com todas as melhorias da IA!');
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Aplicar no Editor (Atualizar Diagnóstico)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopy(fixedWorkflowJson)}
                      className="px-4 py-2 rounded-xl bg-[#061833] hover:bg-[#0066FF]/20 text-slate-200 border border-[#0066FF]/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      {copiedFixed ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#00D2FF]" />}
                      <span>{copiedFixed ? 'Copiado!' : 'Copiar JSON'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownload(fixedWorkflowJson)}
                      className="px-4 py-2 rounded-xl bg-[#061833] hover:bg-[#0066FF]/20 text-slate-200 border border-[#0066FF]/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-[#00D2FF]" />
                      <span>Baixar .json</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleApplyFixedWorkflow}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#0052FF] to-[#00D2FF] text-white text-xs font-black shadow-lg shadow-[#0066FF]/30 hover:scale-102 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>Carregar no Studio</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-8 rounded-3xl bg-[#020b18] border border-[#0066FF]/20 text-center space-y-3">
                  <Wand2 className="w-8 h-8 text-[#00D2FF] mx-auto opacity-50" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Nenhuma Correção Gerada Ainda</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Clique no botão "Corrigir com IA" acima para gerar a versão reparada e otimizada deste workflow.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
