import React, { useState } from 'react';
import { 
  SYSTEM_SZ_VARIABLES_INFO, 
  STANDARD_ROUTING_TOKENS,
  MANUAL_AGENTE_BOAS_PRATICAS,
  MANUAL_WORKFLOW_BOAS_PRATICAS,
  REAL_NORMAL_WORKFLOWS,
  REAL_LOOPING_WORKFLOWS,
  PLATFORM_COMPONENTS_DOCS,
  TEMPLATES_LIBRARY
} from '../data/forticsStandards';
import { ForticsWorkflow } from '../types/fortics';
import { 
  BookOpen, 
  CheckCircle2, 
  Tag, 
  Database, 
  Copy, 
  Check, 
  UploadCloud, 
  Workflow,
  Bot,
  Zap,
  Code2,
  AlertTriangle,
  Lightbulb,
  Repeat,
  Layers,
  FileJson,
  Download,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Terminal,
  Play,
  ArrowRight
} from 'lucide-react';

interface TemplatesAndManualsProps {
  onSelectTemplate?: (templateId: string) => void;
  onLoadWorkflow?: (workflow: ForticsWorkflow) => void;
}

export const TemplatesAndManuals: React.FC<TemplatesAndManualsProps> = ({
  onSelectTemplate,
  onLoadWorkflow
}) => {
  const [activeTab, setActiveTab] = useState<
    'importar' | 'workflows_reais' | 'looping_reais' | 'componentes' | 'exemplos' | 'tags_vars' | 'manuais'
  >('workflows_reais');

  const [selectedRealWf, setSelectedRealWf] = useState<string>(REAL_NORMAL_WORKFLOWS[0]?.id || '');
  const [selectedLoopWf, setSelectedLoopWf] = useState<string>(REAL_LOOPING_WORKFLOWS[0]?.id || '');
  const [selectedComp, setSelectedComp] = useState<string>(PLATFORM_COMPONENTS_DOCS[0]?.id || '');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(id);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleDownloadJson = (data: any, filename: string) => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeNormalWorkflow = REAL_NORMAL_WORKFLOWS.find(w => w.id === selectedRealWf) || REAL_NORMAL_WORKFLOWS[0];
  const activeLoopingWorkflow = REAL_LOOPING_WORKFLOWS.find(w => w.id === selectedLoopWf) || REAL_LOOPING_WORKFLOWS[0];
  const activeComponent = PLATFORM_COMPONENTS_DOCS.find(c => c.id === selectedComp) || PLATFORM_COMPONENTS_DOCS[0];

  return (
    <div className="py-6 px-4 sm:px-8 lg:px-12 w-full max-w-[1700px] mx-auto space-y-6">

      {}
      <div className="bg-[#061833]/80 rounded-3xl p-6 sm:p-8 border border-[#0066FF]/30 shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#020b18] border border-[#0066FF]/40 rounded-2xl text-[#00D2FF] shadow-md">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Biblioteca &amp; Manuais Oficiais da Plataforma Fortics
              </h2>
              <span className="text-xs text-[#00D2FF] font-medium">Workflows Reais em Produção • 7 Componentes Nativos • Guia de Importação</span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed">
            Consulte a documentação completa dos 7 componentes oficiais da plataforma, explore workflows reais de produção (sem loop e com looping), e veja o passo a passo exato para importar no Fortics Studio.
          </p>
        </div>

        {}
        <div className="flex flex-wrap gap-1.5 p-1.5 bg-[#020b18] rounded-2xl border border-[#0066FF]/30 text-xs font-semibold self-start lg:self-center shadow-md">
          
          <button
            type="button"
            onClick={() => setActiveTab('workflows_reais')}
            className={`px-3.5 sm:px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'workflows_reais' ? 'bg-[#0066FF] text-white shadow-lg shadow-[#0066FF]/40 font-bold' : 'text-slate-300 hover:text-white hover:bg-[#0066FF]/10'
            }`}
          >
            <Workflow className="w-4 h-4 text-emerald-400" />
            <span>Workflows Reais ({REAL_NORMAL_WORKFLOWS.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('looping_reais')}
            className={`px-3.5 sm:px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'looping_reais' ? 'bg-[#0066FF] text-white shadow-lg shadow-[#0066FF]/40 font-bold' : 'text-slate-300 hover:text-white hover:bg-[#0066FF]/10'
            }`}
          >
            <Repeat className="w-4 h-4 text-amber-400" />
            <span>Loops Reais ({REAL_LOOPING_WORKFLOWS.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('componentes')}
            className={`px-3.5 sm:px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'componentes' ? 'bg-[#0066FF] text-white shadow-lg shadow-[#0066FF]/40 font-bold' : 'text-slate-300 hover:text-white hover:bg-[#0066FF]/10'
            }`}
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>7 Componentes Fortics</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('importar')}
            className={`px-3.5 sm:px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'importar' ? 'bg-[#0066FF] text-white shadow-lg shadow-[#0066FF]/40 font-bold' : 'text-slate-300 hover:text-white hover:bg-[#0066FF]/10'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Como Importar</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('exemplos')}
            className={`px-3.5 sm:px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'exemplos' ? 'bg-[#0066FF] text-white shadow-lg shadow-[#0066FF]/40 font-bold' : 'text-slate-300 hover:text-white hover:bg-[#0066FF]/10'
            }`}
          >
            <Lightbulb className="w-4 h-4 text-yellow-300" />
            <span>Boas Práticas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tags_vars')}
            className={`px-3.5 sm:px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'tags_vars' ? 'bg-[#0066FF] text-white shadow-lg shadow-[#0066FF]/40 font-bold' : 'text-slate-300 hover:text-white hover:bg-[#0066FF]/10'
            }`}
          >
            <Tag className="w-4 h-4 text-pink-400" />
            <span>Tags # &amp; SZ Vars</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manuais')}
            className={`px-3.5 sm:px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'manuais' ? 'bg-[#0066FF] text-white shadow-lg shadow-[#0066FF]/40 font-bold' : 'text-slate-300 hover:text-white hover:bg-[#0066FF]/10'
            }`}
          >
            <Code2 className="w-4 h-4 text-purple-400" />
            <span>Manuais Oficiais</span>
          </button>
        </div>
      </div>

      {activeTab === 'workflows_reais' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            <div className="lg:col-span-4 space-y-3">
              <div className="bg-[#061833]/80 border border-[#0066FF]/30 rounded-2xl p-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-3">
                  <Workflow className="w-4 h-4 text-emerald-400" />
                  <span>Workflows de Produção ({REAL_NORMAL_WORKFLOWS.length})</span>
                </h3>
                <div className="space-y-2">
                  {REAL_NORMAL_WORKFLOWS.map((wf) => {
                    const isSelected = wf.id === selectedRealWf;
                    return (
                      <div
                        key={wf.id}
                        onClick={() => setSelectedRealWf(wf.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                          isSelected
                            ? 'bg-[#0066FF]/20 border-[#00D2FF] shadow-md'
                            : 'bg-[#020b18]/60 border-[#0066FF]/20 hover:border-[#0066FF]/50 hover:bg-[#061833]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-white line-clamp-1">{wf.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0066FF]/30 text-cyan-300 border border-[#0066FF]/40 font-semibold whitespace-nowrap">
                            {wf.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 line-clamp-2 mt-1 leading-snug">
                          {wf.description}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-2 border-t border-[#0066FF]/15">
                          <span>{wf.workflow.flow.length} nós</span>
                          <span className="text-emerald-400 font-mono">{wf.category}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-5">
              {activeNormalWorkflow && (
                <div className="bg-[#061833]/80 border border-[#0066FF]/30 rounded-3xl p-6 sm:p-7 space-y-6 shadow-xl">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#0066FF]/20 pb-5">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold rounded-lg uppercase">
                          {activeNormalWorkflow.badge}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          ID: {activeNormalWorkflow.workflow.id}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white mt-1.5">
                        {activeNormalWorkflow.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 mt-1">
                        {activeNormalWorkflow.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                      {onLoadWorkflow && (
                        <button
                          type="button"
                          onClick={() => onLoadWorkflow(activeNormalWorkflow.workflow)}
                          className="px-4 py-2 bg-gradient-to-r from-[#0066FF] to-[#00D2FF] hover:from-[#0052cc] hover:to-[#00b8e6] text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Carregar no Studio</span>
                        </button>
                      )}
                      
                      <button
                        type="button"
                        onClick={() => copyToClipboard(JSON.stringify(activeNormalWorkflow.workflow, null, 2), `wf-${activeNormalWorkflow.id}`)}
                        className="px-3.5 py-2 bg-[#020b18] hover:bg-[#0066FF]/20 text-slate-200 border border-[#0066FF]/40 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        {copiedToken === `wf-${activeNormalWorkflow.id}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-[#00D2FF]" />
                        )}
                        <span>{copiedToken === `wf-${activeNormalWorkflow.id}` ? 'Copiado!' : 'Copiar JSON'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadJson(activeNormalWorkflow.workflow, `${activeNormalWorkflow.workflow.name.replace(/\s+/g, '_')}.json`)}
                        className="p-2 bg-[#020b18] hover:bg-[#0066FF]/20 text-slate-200 border border-[#0066FF]/40 rounded-xl transition-all cursor-pointer"
                        title="Baixar JSON"
                      >
                        <Download className="w-4 h-4 text-[#00D2FF]" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeNormalWorkflow.highlights.map((hl, idx) => (
                      <div key={idx} className="p-3 bg-[#020b18] border border-[#0066FF]/20 rounded-xl flex items-start gap-2.5 text-xs text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{hl}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#00D2FF]" />
                      <span>Estrutura do Grafo de Execução ({activeNormalWorkflow.workflow.flow.length} Nós)</span>
                    </h4>

                    <div className="space-y-2.5">
                      {activeNormalWorkflow.workflow.flow.map((node, nIdx) => {
                        const nodeColors: Record<string, string> = {
                          instructions: 'border-purple-500/40 bg-purple-950/20 text-purple-300',
                          code: 'border-cyan-500/40 bg-cyan-950/20 text-cyan-300',
                          rest: 'border-blue-500/40 bg-blue-950/20 text-blue-300',
                          label: 'border-amber-500/40 bg-amber-950/20 text-amber-300',
                          condition: 'border-orange-500/40 bg-orange-950/20 text-orange-300',
                          goto: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300',
                          route_return: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300'
                        };

                        return (
                          <div
                            key={node.id || nIdx}
                            className="p-4 bg-[#020b18] border border-[#0066FF]/25 rounded-2xl space-y-2 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-slate-400 font-bold">#{nIdx + 1}</span>
                                <span className={`px-2 py-0.5 rounded-md border text-[10px] font-mono font-bold uppercase ${nodeColors[node.type] || 'border-slate-600 text-slate-300'}`}>
                                  {node.type}
                                </span>
                                {('name' in node && Boolean((node as any).name)) && (
                                  <span className="font-bold text-white font-mono">
                                    {(node as any).name}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono">ID: {node.id?.slice(0, 8)}...</span>
                            </div>

                            {node.type === 'instructions' && (
                              <p className="text-slate-300 whitespace-pre-wrap font-mono text-[11px] bg-[#061833]/60 p-2.5 rounded-xl border border-purple-500/20">
                                {node.content}
                              </p>
                            )}

                            {node.type === 'rest' && (
                              <div className="space-y-1 bg-[#061833]/60 p-2.5 rounded-xl border border-blue-500/20 font-mono text-[11px]">
                                <div className="flex items-center gap-2">
                                  <span className="text-blue-400 font-bold">{node.method || 'GET'}</span>
                                  <span className="text-slate-200 break-all">{node.uri}</span>
                                </div>
                                {node.headers && node.headers.length > 0 && (
                                  <div className="text-slate-400 text-[10px]">
                                    Headers: {node.headers.map(h => `${h.key}: ${h.value}`).join(', ')}
                                  </div>
                                )}
                                {node.body && (
                                  <div className="text-slate-300 text-[10px] mt-1 pt-1 border-t border-blue-500/20">
                                    Body: <span className="text-slate-400">{node.body}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {node.type === 'code' && (
                              <pre className="text-slate-300 font-mono text-[11px] bg-[#061833]/60 p-2.5 rounded-xl border border-cyan-500/20 overflow-x-auto max-h-32">
                                {node.value}
                              </pre>
                            )}

                            {node.type === 'route_return' && (
                              <div className="bg-[#061833]/60 p-2.5 rounded-xl border border-emerald-500/20 font-mono text-[11px] space-y-1">
                                <div className="text-emerald-300">Status: {node.status_code || '200'} | Content-Type: {node.content_type || 'application/json'}</div>
                                <pre className="text-slate-300 text-[10px]">{node.value}</pre>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                        <Code2 className="w-4 h-4 text-[#00D2FF]" />
                        <span>JSON do Workflow Completo</span>
                      </h4>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(JSON.stringify(activeNormalWorkflow.workflow, null, 2), `raw-${activeNormalWorkflow.id}`)}
                        className="text-[11px] text-[#00D2FF] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedToken === `raw-${activeNormalWorkflow.id}` ? 'Copiado!' : 'Copiar Tudo'}</span>
                      </button>
                    </div>
                    <pre className="p-4 bg-[#020b18] border border-[#0066FF]/25 rounded-2xl text-[11px] font-mono text-cyan-200/90 overflow-x-auto max-h-60 leading-relaxed">
                      {JSON.stringify(activeNormalWorkflow.workflow, null, 2)}
                    </pre>
                  </div>

                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {activeTab === 'looping_reais' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            <div className="lg:col-span-4 space-y-3">
              <div className="bg-[#061833]/80 border border-[#0066FF]/30 rounded-2xl p-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-3">
                  <Repeat className="w-4 h-4 text-amber-400" />
                  <span>Workflows de Looping Reais ({REAL_LOOPING_WORKFLOWS.length})</span>
                </h3>
                <div className="space-y-2">
                  {REAL_LOOPING_WORKFLOWS.map((wf) => {
                    const isSelected = wf.id === selectedLoopWf;
                    return (
                      <div
                        key={wf.id}
                        onClick={() => setSelectedLoopWf(wf.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                          isSelected
                            ? 'bg-[#0066FF]/20 border-amber-400 shadow-md'
                            : 'bg-[#020b18]/60 border-[#0066FF]/20 hover:border-[#0066FF]/50 hover:bg-[#061833]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-white line-clamp-1">{wf.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold whitespace-nowrap">
                            {wf.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 line-clamp-2 mt-1 leading-snug">
                          {wf.description}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-2 border-t border-[#0066FF]/15">
                          <span>{wf.workflow.flow.length} nós de execução</span>
                          <span className="text-amber-400 font-mono">{wf.category}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-5">
              {activeLoopingWorkflow && (
                <div className="bg-[#061833]/80 border border-[#0066FF]/30 rounded-3xl p-6 sm:p-7 space-y-6 shadow-xl">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#0066FF]/20 pb-5">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold rounded-lg uppercase">
                          {activeLoopingWorkflow.badge}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          ID: {activeLoopingWorkflow.workflow.id}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white mt-1.5">
                        {activeLoopingWorkflow.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 mt-1">
                        {activeLoopingWorkflow.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                      {onLoadWorkflow && (
                        <button
                          type="button"
                          onClick={() => onLoadWorkflow(activeLoopingWorkflow.workflow)}
                          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Carregar no Studio</span>
                        </button>
                      )}
                      
                      <button
                        type="button"
                        onClick={() => copyToClipboard(JSON.stringify(activeLoopingWorkflow.workflow, null, 2), `loop-${activeLoopingWorkflow.id}`)}
                        className="px-3.5 py-2 bg-[#020b18] hover:bg-[#0066FF]/20 text-slate-200 border border-[#0066FF]/40 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        {copiedToken === `loop-${activeLoopingWorkflow.id}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-[#00D2FF]" />
                        )}
                        <span>{copiedToken === `loop-${activeLoopingWorkflow.id}` ? 'Copiado!' : 'Copiar JSON'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadJson(activeLoopingWorkflow.workflow, `${activeLoopingWorkflow.workflow.name.replace(/\s+/g, '_')}.json`)}
                        className="p-2 bg-[#020b18] hover:bg-[#0066FF]/20 text-slate-200 border border-[#0066FF]/40 rounded-xl transition-all cursor-pointer"
                        title="Baixar JSON"
                      >
                        <Download className="w-4 h-4 text-[#00D2FF]" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeLoopingWorkflow.highlights.map((hl, idx) => (
                      <div key={idx} className="p-3 bg-[#020b18] border border-amber-500/20 rounded-xl flex items-start gap-2.5 text-xs text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span>{hl}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <Repeat className="w-4 h-4 text-amber-400" />
                      <span>Estrutura de Loop &amp; Nós ({activeLoopingWorkflow.workflow.flow.length} Nós)</span>
                    </h4>

                    <div className="space-y-2.5">
                      {activeLoopingWorkflow.workflow.flow.map((node, nIdx) => {
                        const isLoopControl = node.type === 'label' || node.type === 'goto' || node.type === 'condition';

                        return (
                          <div
                            key={node.id || nIdx}
                            className={`p-4 rounded-2xl space-y-2 text-xs border ${
                              isLoopControl
                                ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                                : 'bg-[#020b18] border-[#0066FF]/25 text-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-slate-400 font-bold">#{nIdx + 1}</span>
                                <span className={`px-2 py-0.5 rounded-md border text-[10px] font-mono font-bold uppercase ${
                                  node.type === 'label' ? 'bg-amber-500/30 text-amber-300 border-amber-500/50' :
                                  node.type === 'goto' ? 'bg-emerald-500/30 text-emerald-300 border-emerald-500/50' :
                                  node.type === 'condition' ? 'bg-orange-500/30 text-orange-300 border-orange-500/50' :
                                  node.type === 'code' ? 'bg-cyan-500/30 text-cyan-300 border-cyan-500/50' :
                                  'bg-blue-500/30 text-blue-300 border-blue-500/50'
                                }`}>
                                  {node.type}
                                </span>
                                {('name' in node && Boolean((node as any).name)) && (
                                  <span className="font-bold text-white font-mono">
                                    {(node as any).name}
                                  </span>
                                )}
                                {('label' in node && Boolean((node as any).label)) && (
                                  <span className="text-xs text-amber-300 font-mono">
                                    Alvo: &quot;{(node as any).label}&quot;
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono">ID: {node.id?.slice(0, 8)}...</span>
                            </div>

                            {node.type === 'condition' && (
                              <div className="space-y-1.5 p-2 bg-[#061833]/80 rounded-xl font-mono text-[11px]">
                                <div className="text-orange-300">
                                  Comparação: {node.left} {node.condition} {node.right}
                                </div>
                                <div className="text-slate-400 text-[10px]">
                                  Ramo THEN: {node.then?.length || 0} nós | Ramo ELSE: {node.else?.length || 0} nós
                                </div>
                              </div>
                            )}

                            {node.type === 'code' && (
                              <pre className="text-slate-300 font-mono text-[11px] bg-[#061833]/60 p-2.5 rounded-xl border border-cyan-500/20 overflow-x-auto max-h-32">
                                {node.value}
                              </pre>
                            )}

                            {node.type === 'rest' && (
                              <div className="space-y-1 bg-[#061833]/60 p-2.5 rounded-xl border border-blue-500/20 font-mono text-[11px]">
                                <div className="flex items-center gap-2">
                                  <span className="text-blue-400 font-bold">{node.method || 'GET'}</span>
                                  <span className="text-slate-200 break-all">{node.uri}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                        <Code2 className="w-4 h-4 text-amber-400" />
                        <span>JSON do Workflow de Looping Completo</span>
                      </h4>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(JSON.stringify(activeLoopingWorkflow.workflow, null, 2), `loop-raw-${activeLoopingWorkflow.id}`)}
                        className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedToken === `loop-raw-${activeLoopingWorkflow.id}` ? 'Copiado!' : 'Copiar Tudo'}</span>
                      </button>
                    </div>
                    <pre className="p-4 bg-[#020b18] border border-amber-500/25 rounded-2xl text-[11px] font-mono text-amber-200/90 overflow-x-auto max-h-60 leading-relaxed">
                      {JSON.stringify(activeLoopingWorkflow.workflow, null, 2)}
                    </pre>
                  </div>

                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {activeTab === 'componentes' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            <div className="lg:col-span-4 space-y-3">
              <div className="bg-[#061833]/80 border border-[#0066FF]/30 rounded-2xl p-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-3">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>Componentes da Plataforma ({PLATFORM_COMPONENTS_DOCS.length})</span>
                </h3>
                <div className="space-y-2">
                  {PLATFORM_COMPONENTS_DOCS.map((comp) => {
                    const isSelected = comp.id === selectedComp;
                    return (
                      <div
                        key={comp.id}
                        onClick={() => setSelectedComp(comp.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                          isSelected
                            ? 'bg-[#0066FF]/20 border-cyan-400 shadow-md'
                            : 'bg-[#020b18]/60 border-[#0066FF]/20 hover:border-[#0066FF]/50 hover:bg-[#061833]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-white">{comp.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold font-mono">
                            type: {comp.nodeType}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 line-clamp-2 mt-1 leading-snug">
                          {comp.summary}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-5">
              {activeComponent && (
                <div className="bg-[#061833]/80 border border-[#0066FF]/30 rounded-3xl p-6 sm:p-7 space-y-6 shadow-xl">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#0066FF]/20 pb-5">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="px-2.5 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold rounded-lg uppercase">
                          {activeComponent.badge}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          type: &quot;{activeComponent.nodeType}&quot;
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white mt-1.5">
                        {activeComponent.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 mt-1">
                        {activeComponent.summary}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => copyToClipboard(activeComponent.sampleCode, `comp-${activeComponent.id}`)}
                      className="px-3.5 py-2 bg-[#020b18] hover:bg-[#0066FF]/20 text-slate-200 border border-[#0066FF]/40 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-center shrink-0"
                    >
                      {copiedToken === `comp-${activeComponent.id}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-[#00D2FF]" />
                      )}
                      <span>{copiedToken === `comp-${activeComponent.id}` ? 'Copiado!' : 'Copiar Exemplo'}</span>
                    </button>
                  </div>

                  <div className="p-4 bg-[#020b18] border border-[#0066FF]/20 rounded-2xl text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {activeComponent.description}
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span>Principais Características &amp; Regras</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {activeComponent.keyFeatures.map((kf, idx) => (
                        <div key={idx} className="p-3 bg-[#020b18] border border-[#0066FF]/20 rounded-xl flex items-start gap-2.5 text-xs text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                          <span>{kf}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-cyan-400" />
                      <span>Exemplo de Configuração JSON / Script</span>
                    </h4>
                    <pre className="p-4 bg-[#020b18] border border-cyan-500/30 rounded-2xl text-xs font-mono text-cyan-200 overflow-x-auto max-h-72 leading-relaxed">
                      {activeComponent.sampleCode}
                    </pre>
                  </div>

                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {activeTab === 'importar' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <div className="bg-[#061833]/70 border border-[#0066FF]/30 rounded-3xl p-6 sm:p-8 space-y-5 shadow-lg">
              <div className="flex items-center gap-3.5 border-b border-[#0066FF]/20 pb-4">
                <div className="p-3 bg-[#020b18] border border-[#0066FF]/40 rounded-2xl text-[#00D2FF]">
                  <Workflow className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">1. Como Importar o Workflow (.json)</h3>
                  <span className="text-xs text-[#00D2FF] font-medium">No Fortics Studio &gt; Workflows</span>
                </div>
              </div>

              <ol className="space-y-3 text-xs sm:text-sm text-slate-300 list-decimal list-inside leading-relaxed">
                <li className="p-3 bg-[#020b18] rounded-xl border border-[#0066FF]/20">
                  Acesse o menu lateral <strong>Workflows</strong> no Fortics Studio.
                </li>
                <li className="p-3 bg-[#020b18] rounded-xl border border-[#0066FF]/20">
                  Clique no botão superior direito <strong>&quot;Importar Workflow&quot;</strong> ou <strong>&quot;+ Criar Novo&quot;</strong>.
                </li>
                <li className="p-3 bg-[#020b18] rounded-xl border border-[#0066FF]/20">
                  Selecione o arquivo baixado (ex: <code className="text-[#00D2FF] font-mono">workflow.json</code>) ou cole o JSON exportado.
                </li>
                <li className="p-3 bg-[#020b18] rounded-xl border border-[#0066FF]/20">
                  Certifique-se de que os cabeçalhos de autenticação (como Tokens Bearer ou Basic Auth) estejam configurados nas credenciais correspondentes.
                </li>
                <li className="p-3 bg-[#020b18] rounded-xl border border-[#0066FF]/20">
                  Clique em <strong>Salvar e Ativar</strong>.
                </li>
              </ol>
            </div>

            <div className="bg-[#061833]/70 border border-[#0066FF]/30 rounded-3xl p-6 sm:p-8 space-y-5 shadow-lg">
              <div className="flex items-center gap-3.5 border-b border-[#0066FF]/20 pb-4">
                <div className="p-3 bg-[#020b18] border border-[#0066FF]/40 rounded-2xl text-[#00D2FF]">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">2. Como Importar o Agente (.json)</h3>
                  <span className="text-xs text-[#00D2FF] font-medium">No Fortics Studio &gt; Agentes Inteligentes</span>
                </div>
              </div>

              <ol className="space-y-3 text-xs sm:text-sm text-slate-300 list-decimal list-inside leading-relaxed">
                <li className="p-3 bg-[#020b18] rounded-xl border border-[#0066FF]/20">
                  Acesse o menu lateral <strong>Agentes</strong> no Fortics Studio.
                </li>
                <li className="p-3 bg-[#020b18] rounded-xl border border-[#0066FF]/20">
                  Clique em <strong>&quot;Importar Agente&quot;</strong> e envie o arquivo <code className="text-[#00D2FF] font-mono">agente.json</code> gerado.
                </li>
                <li className="p-3 bg-[#020b18] rounded-xl border border-[#0066FF]/20">
                  Vincule o Workflow importado na aba <strong>Ferramentas / Workflows</strong> do Agente.
                </li>
                <li className="p-3 bg-[#020b18] rounded-xl border border-[#0066FF]/20">
                  Configure o canal de atendimento no <strong>SZ Omnichannel</strong> (WhatsApp, Webchat, Telegram) apontando para este Agente.
                </li>
                <li className="p-3 bg-[#020b18] rounded-xl border border-[#0066FF]/20">
                  Pronto! Teste o atendimento simulando as mensagens do usuário.
                </li>
              </ol>
            </div>

          </div>
        </div>
      )}

      {activeTab === 'exemplos' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="bg-[#061833]/70 border border-[#0066FF]/30 rounded-3xl p-6 sm:p-7 space-y-4 shadow-lg flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold rounded-lg uppercase">
                    Exemplo 1
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-white">Nó Code Inicial (Padrão request)</h4>
                </div>

                <div className="p-4 bg-emerald-950/20 border border-emerald-500/40 rounded-2xl space-y-1.5 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Bom Uso (Padrão Recomendado):</span>
                  </div>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                    Sempre use o primeiro nó de código nomeado <code className="text-cyan-300 font-mono">request</code> para desempacotar com segurança <code className="text-cyan-300 font-mono">_vars._request.body</code>, tratando variações de payload e prevenindo crashes em tempo de execução.
                  </p>
                </div>

                <div className="p-4 bg-rose-950/20 border border-rose-500/40 rounded-2xl space-y-1.5 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 text-rose-400 font-bold">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>O que Evitar:</span>
                  </div>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                    Acessar <code className="text-rose-300 font-mono">_vars._request.body.campo</code> diretamente no nó REST sem tratamento prévio de erros ou sanitização de caracteres especiais.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#061833]/70 border border-[#0066FF]/30 rounded-3xl p-6 sm:p-7 space-y-4 shadow-lg flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-bold rounded-lg uppercase">
                    Exemplo 2
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-white">Retorno de Rota com helper #tojson</h4>
                </div>

                <div className="p-4 bg-emerald-950/20 border border-emerald-500/40 rounded-2xl space-y-1.5 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Bom Uso (Padrão Recomendado):</span>
                  </div>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                    Utilizar o bloco <code className="text-cyan-300 font-mono">&#123;&#123;#tojson&#125;&#125;&#123;&#123;variavel_tratada&#125;&#125;&#123;&#123;/tojson&#125;&#125;</code> para serializar respostas estruturadas de APIs, garantindo que o Agente LLM receba um JSON parseável e sem escaping quebrado.
                  </p>
                </div>

                <div className="p-4 bg-rose-950/20 border border-rose-500/40 rounded-2xl space-y-1.5 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 text-rose-400 font-bold">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>O que Evitar:</span>
                  </div>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                    Retornar strings não formatadas ou JSON construído manualmente com aspas escapadas que quebram o parsing do LLM.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#061833]/70 border border-[#0066FF]/30 rounded-3xl p-6 sm:p-7 space-y-4 shadow-lg flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold rounded-lg uppercase">
                    Exemplo 3
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-white">Configuração Explícita de Timeout</h4>
                </div>

                <div className="p-4 bg-emerald-950/20 border border-emerald-500/40 rounded-2xl space-y-1.5 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Bom Uso (Padrão Recomendado):</span>
                  </div>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                    Sempre defina o timeout com sufixo de unidade como <code className="text-cyan-300 font-mono">&quot;60s&quot;</code> ou <code className="text-cyan-300 font-mono">&quot;30s&quot;</code> no nó REST, respeitando o limite do Temporal Orchestrator.
                  </p>
                </div>

                <div className="p-4 bg-rose-950/20 border border-rose-500/40 rounded-2xl space-y-1.5 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 text-rose-400 font-bold">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>O que Evitar:</span>
                  </div>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                    Valores sem sufixo (ex: 60) ou timeouts superiores a 300 segundos que causam cancelamento silencioso da rota.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#061833]/70 border border-[#0066FF]/30 rounded-3xl p-6 sm:p-7 space-y-4 shadow-lg flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-bold rounded-lg uppercase">
                    Exemplo 4
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-white">Nó de Instruções do Workflow (Prompt Tool)</h4>
                </div>

                <div className="p-4 bg-emerald-950/20 border border-emerald-500/40 rounded-2xl space-y-1.5 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Bom Uso (Padrão Recomendado):</span>
                  </div>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                    O nó <strong>instructions</strong> deve conter: 1ª linha com o Título, 2ª linha com a Descrição da função, seção <code className="text-cyan-300 font-mono">Args:</code> listando tipo e finalidade de cada argumento e seção <code className="text-cyan-300 font-mono">Returns:</code> com o dict tratado.
                  </p>
                </div>

                <div className="p-4 bg-rose-950/20 border border-rose-500/40 rounded-2xl space-y-1.5 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 text-rose-400 font-bold">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>O que Evitar:</span>
                  </div>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                    Criar múltiplos nós de instructions no mesmo workflow ou deixar o campo vazio sem a especificação de Args.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {activeTab === 'tags_vars' && (
        <div className="space-y-6">
          <div className="bg-[#061833]/70 border border-[#0066FF]/30 rounded-3xl p-6 sm:p-7 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Tag className="w-5 h-5 text-[#00D2FF]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Tags de Roteamento e Transbordo Fortics (#)
                </h3>
              </div>
              <span className="text-xs text-slate-400">Clique para copiar</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {STANDARD_ROUTING_TOKENS.map((item, idx) => (
                <div 
                  key={idx}
                  onClick={() => copyToClipboard(item.token, `token-${idx}`)}
                  className="p-4 bg-[#020b18] border border-[#0066FF]/25 hover:border-[#00D2FF] rounded-2xl cursor-pointer transition-all flex items-center justify-between group shadow-sm"
                >
                  <div className="space-y-1">
                    <span className="text-xs sm:text-sm font-mono font-bold text-amber-300 group-hover:text-amber-200">
                      {item.token}
                    </span>
                    <p className="text-xs text-slate-300">{item.description}</p>
                  </div>

                  <div className="p-2 rounded-xl bg-[#061833] text-slate-400 group-hover:text-[#00D2FF]">
                    {copiedToken === `token-${idx}` ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#061833]/70 border border-[#0066FF]/30 rounded-3xl p-6 sm:p-7 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Database className="w-5 h-5 text-[#00D2FF]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Variáveis de Contexto Injetadas pelo SZ Omnichannel
                </h3>
              </div>
              <span className="text-xs text-slate-400">Clique para copiar</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {SYSTEM_SZ_VARIABLES_INFO.map((item, idx) => (
                <div 
                  key={idx}
                  onClick={() => copyToClipboard(item.name, `sz-${idx}`)}
                  className="p-4 bg-[#020b18] border border-[#0066FF]/25 hover:border-[#00D2FF] rounded-2xl cursor-pointer transition-all flex items-center justify-between group shadow-sm"
                >
                  <div className="space-y-1">
                    <span className="text-xs sm:text-sm font-mono font-bold text-[#00D2FF] group-hover:text-cyan-200">
                      {item.name}
                    </span>
                    <p className="text-xs text-slate-300">{item.description}</p>
                  </div>

                  <div className="p-2 rounded-xl bg-[#061833] text-slate-400 group-hover:text-[#00D2FF]">
                    {copiedToken === `sz-${idx}` ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'manuais' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#061833]/70 border border-[#0066FF]/30 rounded-3xl p-6 sm:p-8 space-y-4 shadow-lg">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2.5 border-b border-[#0066FF]/20 pb-3">
              <Bot className="w-5 h-5 text-[#00D2FF]" />
              <span>Manual de Boas Práticas do Agente (6 Dimensões)</span>
            </h3>
            <div className="bg-[#020b18] border border-[#0066FF]/25 rounded-2xl p-5 text-xs font-mono text-slate-300 max-h-[500px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {MANUAL_AGENTE_BOAS_PRATICAS}
            </div>
          </div>

          <div className="bg-[#061833]/70 border border-[#0066FF]/30 rounded-3xl p-6 sm:p-8 space-y-4 shadow-lg">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2.5 border-b border-[#0066FF]/20 pb-3">
              <Workflow className="w-5 h-5 text-[#00D2FF]" />
              <span>Manual de Boas Práticas do Workflow (Nós &amp; Scripts)</span>
            </h3>
            <div className="bg-[#020b18] border border-[#0066FF]/25 rounded-2xl p-5 text-xs font-mono text-slate-300 max-h-[500px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {MANUAL_WORKFLOW_BOAS_PRATICAS}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
