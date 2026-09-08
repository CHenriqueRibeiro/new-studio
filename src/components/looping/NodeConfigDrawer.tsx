import React from 'react';
import {
  Sparkles,
  Code2,
  Terminal,
  Database,
  Layers,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  UploadCloud,
  FileCode,
  Sliders,
  Send,
  Zap,
  Cable,
  RotateCcw,
  Plus
} from 'lucide-react';
import { NodeDefinition } from './types';

interface NodeConfigDrawerProps {
  selectedNode: NodeDefinition | null;
  aiInstructions?: Record<string, string>;
  onUpdateAiInstruction?: (nodeKey: string, text: string) => void;
  
  authName: string;
  setAuthName: (val: string) => void;
  authMethod: 'GET' | 'POST';
  setAuthMethod: (val: 'GET' | 'POST') => void;
  authUri: string;
  setAuthUri: (val: string) => void;
  authBody: string;
  setAuthBody: (val: string) => void;
  
  api1Name: string;
  setApi1Name: (val: string) => void;
  api1Method: 'GET' | 'POST';
  setApi1Method: (val: 'GET' | 'POST') => void;
  api1Uri: string;
  setApi1Uri: (val: string) => void;
  api1AuthHeader: string;
  setApi1AuthHeader: (val: string) => void;
  api1ResponseSample: string;
  setApi1ResponseSample: (val: string) => void;
  
  statusFilterValue: string;
  setStatusFilterValue: (val: string) => void;
  sanitizePhoneBR: boolean;
  setSanitizePhoneBR: (val: boolean) => void;
  
  loopTargetLabel: string;
  setLoopTargetLabel: (val: string) => void;
  
  api3Name: string;
  setApi3Name: (val: string) => void;
  api3Method: 'GET' | 'POST';
  setApi3Method: (val: 'GET' | 'POST') => void;
  api3Uri: string;
  setApi3Uri: (val: string) => void;
  
  api2Name: string;
  setApi2Name: (val: string) => void;
  api2Method: 'POST' | 'GET' | 'PUT' | 'PATCH';
  setApi2Method: (val: 'POST' | 'GET' | 'PUT' | 'PATCH') => void;
  api2Uri: string;
  setApi2Uri: (val: string) => void;
  api2AuthHeader: string;
  setApi2AuthHeader: (val: string) => void;
  api2Body: string;
  setApi2Body: (val: string) => void;
  
  dbNodeName: string;
  setDbNodeName: (val: string) => void;
  dbNodeUri: string;
  setDbNodeUri: (val: string) => void;
  dbNodeBody: string;
  setDbNodeBody: (val: string) => void;
  
  onOpenCurlModal: (target: 'api1' | 'api2' | 'auth' | 'api3') => void;
  availableKeys: string[];
}

export const NodeConfigDrawer: React.FC<NodeConfigDrawerProps> = ({
  selectedNode,
  aiInstructions = {},
  onUpdateAiInstruction = (_nodeKey: string, _text: string) => {},
  authName,
  setAuthName,
  authMethod,
  setAuthMethod,
  authUri,
  setAuthUri,
  authBody,
  setAuthBody,
  api1Name,
  setApi1Name,
  api1Method,
  setApi1Method,
  api1Uri,
  setApi1Uri,
  api1AuthHeader,
  setApi1AuthHeader,
  api1ResponseSample,
  setApi1ResponseSample,
  statusFilterValue,
  setStatusFilterValue,
  sanitizePhoneBR,
  setSanitizePhoneBR,
  loopTargetLabel,
  setLoopTargetLabel,
  api3Name,
  setApi3Name,
  api3Method,
  setApi3Method,
  api3Uri,
  setApi3Uri,
  api2Name,
  setApi2Name,
  api2Method,
  setApi2Method,
  api2Uri,
  setApi2Uri,
  api2AuthHeader,
  setApi2AuthHeader,
  api2Body,
  setApi2Body,
  dbNodeName,
  setDbNodeName,
  dbNodeUri,
  setDbNodeUri,
  dbNodeBody,
  setDbNodeBody,
  onOpenCurlModal,
  availableKeys
}) => {
  if (!selectedNode) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
        <Sliders className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-300">Nenhum componente selecionado</p>
        <p className="text-xs text-slate-500 mt-1">Clique em qualquer etapa do fluxo vertical para editar seus parâmetros e instruções de IA.</p>
      </div>
    );
  }

  const currentAiInstruction = aiInstructions[selectedNode.key] || '';

  const insertVariableIntoBody = (key: string) => {
    const placeholder = `{{item.${key}}}`;
    setApi2Body(prev => {
      try {
        const obj = JSON.parse(prev);
        obj[key] = placeholder;
        return JSON.stringify(obj, null, 2);
      } catch {
        return prev + `\n"${key}": "${placeholder}"`;
      }
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-5 text-slate-200">
      {}
      <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
            {React.createElement(selectedNode.icon, { className: "w-5 h-5" })}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">{selectedNode.title}</h3>
              <span className="text-[10px] uppercase font-bold bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30">
                {selectedNode.badgeTag}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedNode.subtitle}</p>
          </div>
        </div>

        {}
        {['auth_step', 'api1_search', 'api2_target', 'secondary_api_step'].includes(selectedNode.key) && (
          <button
            type="button"
            onClick={() => {
              const target = selectedNode.key === 'auth_step' ? 'auth' :
                             selectedNode.key === 'api1_search' ? 'api1' :
                             selectedNode.key === 'api2_target' ? 'api2' : 'api3';
              onOpenCurlModal(target);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition-all cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5" />
            Colar cURL
          </button>
        )}
      </div>

      {}
      <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/30 rounded-xl p-4 shadow-inner">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            Instrução de IA para este Componente (Texto Livre)
          </label>
          <span className="text-[10px] text-slate-400">Prompt individual do nó</span>
        </div>
        <textarea
          rows={3}
          value={currentAiInstruction}
          onChange={(e) => onUpdateAiInstruction(selectedNode.key, e.target.value)}
          placeholder={`Explique em texto livre o que você precisa que este componente faça especificamente...\nExemplo: "Tratar para buscar apenas contratos ativos, formatar telefone com DDD 55 e ignorar se o saldo for menor que zero."`}
          className="w-full bg-slate-950/80 border border-indigo-500/30 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 focus:outline-none font-sans leading-relaxed"
        />
        <div className="flex items-center justify-between mt-1.5 text-[11px] text-slate-400">
          <span>A IA compilará esta instrução no JavaScript / REST gerado.</span>
          {currentAiInstruction ? (
            <span className="text-emerald-400 font-medium">✓ Instrução ativa</span>
          ) : (
            <span className="text-slate-500">Opcional</span>
          )}
        </div>
      </div>

      {}
      {selectedNode.key === 'auth_step' && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-slate-300 block mb-1">Nome da Variável / ID</label>
              <input
                type="text"
                value={authName}
                onChange={(e) => setAuthName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Método HTTP</label>
              <select
                value={authMethod}
                onChange={(e) => setAuthMethod(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="POST">POST</option>
                <option value="GET">GET</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">URI de Autenticação / OAuth Token</label>
            <input
              type="text"
              value={authUri}
              onChange={(e) => setAuthUri(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Corpo JSON (Payload)</label>
            <textarea
              rows={4}
              value={authBody}
              onChange={(e) => setAuthBody(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-cyan-300 font-mono focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>
      )}

      {selectedNode.key === 'api1_search' && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-slate-300 block mb-1">Nome do Nó (Variável no _vars)</label>
              <input
                type="text"
                value={api1Name}
                onChange={(e) => setApi1Name(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Método HTTP</label>
              <select
                value={api1Method}
                onChange={(e) => setApi1Method(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">URI de Busca da Fila</label>
            <input
              type="text"
              value={api1Uri}
              onChange={(e) => setApi1Uri(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Dica: use <code className="text-cyan-400">{"{{pagina_atual}}"}</code> para paginação automática se houver parâmetro.
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Header Authorization</label>
            <input
              type="text"
              value={api1AuthHeader}
              onChange={(e) => setApi1AuthHeader(e.target.value)}
              placeholder="Bearer {{auth_token.access_token}}"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">Exemplo da Resposta Real (JSON)</label>
              <span className="text-[10px] text-cyan-400">Usado para inferência de chaves</span>
            </div>
            <textarea
              rows={5}
              value={api1ResponseSample}
              onChange={(e) => setApi1ResponseSample(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-emerald-300 font-mono focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>
      )}

      {selectedNode.key === 'filter_step' && (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Filtrar por Status Específico</label>
            <input
              type="text"
              value={statusFilterValue}
              onChange={(e) => setStatusFilterValue(e.target.value)}
              placeholder="Ex: Pendente, Vencida, Agendado (ou deixe vazio para todos)"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">Deixe vazio caso deseje processar todos os itens da lista.</p>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-lg">
            <div>
              <p className="text-xs font-semibold text-white">Sanitização de Telefone Brasileiro (DDI 55)</p>
              <p className="text-[11px] text-slate-400">Remove caracteres especiais, garante DDD e prefixo 55 internacional.</p>
            </div>
            <input
              type="checkbox"
              checked={sanitizePhoneBR}
              onChange={(e) => setSanitizePhoneBR(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400 cursor-pointer"
            />
          </div>
        </div>
      )}

      {(selectedNode.key === 'loop_label' || selectedNode.key === 'loop_goto') && (
        <div className="space-y-4">
          <div className="bg-cyan-950/30 border border-cyan-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs mb-1">
              <Cable className="w-4 h-4" />
              Ponto de Enlace do Looping (Label & Goto Target)
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Você tem total liberdade para escolher o nome do marcador onde a execução volta a cada iteração.
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Nome do Marcador de Retorno</label>
            <input
              type="text"
              value={loopTargetLabel}
              onChange={(e) => setLoopTargetLabel(e.target.value)}
              placeholder="Ex: validação, Loop Fila, inicio_loop"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-cyan-300 font-mono focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>
      )}

      {selectedNode.key === 'secondary_api_step' && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-slate-300 block mb-1">Nome do Nó</label>
              <input
                type="text"
                value={api3Name}
                onChange={(e) => setApi3Name(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Método</label>
              <select
                value={api3Method}
                onChange={(e) => setApi3Method(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">URI de Consulta por Item</label>
            <input
              type="text"
              value={api3Uri}
              onChange={(e) => setApi3Uri(e.target.value)}
              placeholder="https://api.exemplo.com/v1/detalhes/{{item.documento}}"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>
      )}

      {selectedNode.key === 'api2_target' && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-slate-300 block mb-1">Nome da Ação / Disparo</label>
              <input
                type="text"
                value={api2Name}
                onChange={(e) => setApi2Name(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Método</label>
              <select
                value={api2Method}
                onChange={(e) => setApi2Method(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="POST">POST</option>
                <option value="GET">GET</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">URI da Ação</label>
            <input
              type="text"
              value={api2Uri}
              onChange={(e) => setApi2Uri(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Header Authorization</label>
            <input
              type="text"
              value={api2AuthHeader}
              onChange={(e) => setApi2AuthHeader(e.target.value)}
              placeholder="Bearer {{_credential.token}}"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">Corpo JSON da Requisição (Body)</label>
              <span className="text-[11px] text-slate-400">Variáveis mapeadas do item</span>
            </div>

            {}
            {availableKeys.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                <span className="text-[10px] text-slate-500 self-center">Chaves detectadas:</span>
                {availableKeys.slice(0, 8).map(k => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => insertVariableIntoBody(k)}
                    className="px-2 py-0.5 text-[10px] font-mono bg-slate-800 hover:bg-cyan-950 text-cyan-300 hover:text-cyan-200 border border-slate-700 hover:border-cyan-500/40 rounded flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    {k}
                  </button>
                ))}
              </div>
            )}

            <textarea
              rows={6}
              value={api2Body}
              onChange={(e) => setApi2Body(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-cyan-300 font-mono focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>
      )}

      {selectedNode.key === 'database_step' && (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Nome do Nó de Banco de Dados</label>
            <input
              type="text"
              value={dbNodeName}
              onChange={(e) => setDbNodeName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">URI da Collection (GoDB / REST DB)</label>
            <input
              type="text"
              value={dbNodeUri}
              onChange={(e) => setDbNodeUri(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Payload Gravado no Histórico</label>
            <textarea
              rows={5}
              value={dbNodeBody}
              onChange={(e) => setDbNodeBody(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-amber-300 font-mono focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
};
