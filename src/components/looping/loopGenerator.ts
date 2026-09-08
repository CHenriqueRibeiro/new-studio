import { ForticsWorkflow, ForticsFlowNode } from '../../types/fortics';
import { LoopArchitectureType, PaginationStrategyType } from './types';

export interface GenerateLoopOptions {
  architecture: LoopArchitectureType;
  paginationStrategy: PaginationStrategyType;
  pageSizeValue: number;
  workflowName: string;
  timeoutSeconds: number;
  loopTargetLabel: string;
  hasAuthStep: boolean;
  authName: string;
  authMethod: 'GET' | 'POST';
  authUri: string;
  authBody: string;
  api1Name: string;
  api1Method: 'GET' | 'POST';
  api1Uri: string;
  api1AuthHeader: string;
  statusFilterValue: string;
  sanitizePhoneBR: boolean;
  hasSecondaryApi: boolean;
  api3Name: string;
  api3Method: 'GET' | 'POST';
  api3Uri: string;
  api2Name: string;
  api2Method: 'POST' | 'PUT' | 'PATCH' | 'GET';
  api2Uri: string;
  api2AuthHeader: string;
  api2Body: string;
  hasDatabaseStep: boolean;
  dbNodeName: string;
  dbNodeMethod: 'POST' | 'PUT' | 'PATCH';
  dbNodeUri: string;
  dbNodeAuthHeader: string;
  dbNodeBody: string;
  aiInstructions: Record<string, string>;
  masterAiPrompt: string;
}

export function generateLoopingWorkflow(options: GenerateLoopOptions): ForticsWorkflow {
  const flow: ForticsFlowNode[] = [];

  const instructionsDoc = [
    `${options.workflowName}\n`,
    options.masterAiPrompt ? `Objetivo do Fluxo:\n${options.masterAiPrompt}\n` : 'Executa varredura e processamento automatizado de registros em looping contínuo.\n',
    'Args:',
    '  nenhum (disparo agendado ou sob demanda via API/Agent)\n',
    'Returns:',
    '  dict: Relatório de conclusão do processamento da fila de itens'
  ].join('\n');

  flow.push({
    __spec: true,
    __spec_version: "1.0.0",
    id: "instrucoes_fluxo",
    type: "instructions",
    content: instructionsDoc
  });

  if (options.hasAuthStep) {
    flow.push({
      __spec: true,
      __spec_version: "1.0.0",
      id: options.authName || "auth_token",
      name: options.authName || "auth_token",
      type: "rest",
      method: options.authMethod,
      uri: options.authUri,
      verify_ssl: true,
      body_format: "json",
      headers: [
        { key: "Content-Type", value: "application/json" }
      ],
      body: options.authBody || "{\n  \"grant_type\": \"client_credentials\"\n}"
    });
  }

  if (options.architecture === 'simple_shift') {
    flow.push({
      __spec: true,
      __spec_version: "1.0.0",
      id: options.api1Name || "buscar_registros_fila",
      name: options.api1Name || "buscar_registros_fila",
      type: "rest",
      method: options.api1Method,
      uri: options.api1Uri,
      verify_ssl: true,
      body_format: "json",
      headers: [
        ...(options.api1AuthHeader ? [{ key: "Authorization", value: options.api1AuthHeader }] : []),
        { key: "Content-Type", value: "application/json" }
      ],
      body: ""
    });

    const filterStatusCheck = options.statusFilterValue
      ? `if (item.status && String(item.status).toUpperCase() !== "${options.statusFilterValue.toUpperCase()}") return false;`
      : "";

    const phoneSanitization = options.sanitizePhoneBR
      ? `let tel = String(item.telefone || item.mobile || item.cellPhone || item.phone || '').replace(/\\D/g, '');\n        if (tel.startsWith('5555') && tel.length >= 15) tel = tel.substring(2);\n        if (tel && !tel.startsWith('55')) tel = '55' + tel;`
      : `let tel = String(item.telefone || item.mobile || item.cellPhone || item.phone || '');`;

    flow.push({
      __spec: true,
      __spec_version: "1.0.0",
      id: "filtrar_e_preparar_fila",
      name: "filtrar_e_preparar_fila",
      type: "code",
      error_message: "Erro ao processar dados da fila",
      value: `try {
    let raw = _vars.${options.api1Name || "buscar_registros_fila"} || {};
    let lista = [];

    if (Array.isArray(raw)) {
        lista = raw;
    } else if (raw.response && Array.isArray(raw.response.data)) {
        lista = raw.response.data;
    } else if (raw.result && Array.isArray(raw.result.items)) {
        lista = raw.result.items;
    } else if (Array.isArray(raw.data)) {
        lista = raw.data;
    } else if (Array.isArray(raw.items)) {
        lista = raw.items;
    } else if (typeof raw === 'object') {
        for (let k of Object.keys(raw)) {
            if (Array.isArray(raw[k])) {
                lista = raw[k];
                break;
            }
        }
    }

    let filtrados = lista.filter(function(item) {
        if (!item) return false;
        ${filterStatusCheck}
        return true;
    }).map(function(item) {
        ${phoneSanitization}
        return {
            id: item.id || item.codigo || item.id_fatura || item.codAgendamento || '',
            codigo: item.codigo || item.contractNumber || item.contrato || '',
            nome: item.nome || item.name || item.client || item.patientName || 'Cliente',
            telefone: tel,
            documento: item.documento || item.cpf || item.txId || item.cnpj || '',
            vencimento: item.vencimento || item.expirationDate || item.data || '',
            valor: item.valor || item.finalValue || item.amount || '',
            codigoBarras: item.codigoBarras || item.barcode || '',
            linhaDigitavel: item.linhaDigitavel || item.typefulLine || '',
            pixQrCode: item.pixQrCode || '',
            raw: item
        };
    });

    return {
        total: filtrados.length,
        fila_itens: filtrados
    };
} catch (e) {
    return { total: 0, fila_itens: [], erro: String(e) };
}`
    });

    const activeLoopLabel = options.loopTargetLabel || "validação";
    flow.push({
      __spec: true,
      __spec_version: "1.0.0",
      id: "label_inicio_loop",
      name: activeLoopLabel,
      type: "label"
    });

    flow.push({
      __spec: true,
      __spec_version: "1.0.0",
      id: "proximo_da_lista",
      name: "proximo_da_lista",
      type: "code",
      error_message: "Erro ao avançar na fila de itens",
      value: `try {
    let listaRestante;

    if (!_vars.proximo_da_lista || !Array.isArray(_vars.proximo_da_lista.lista_atual)) {
        listaRestante = (_vars.filtrar_e_preparar_fila && _vars.filtrar_e_preparar_fila.fila_itens) || [];
    } else {
        listaRestante = _vars.proximo_da_lista.lista_atual;
    }

    if (!listaRestante || listaRestante.length === 0) {
        return {
            finished: true,
            cliente: null,
            item: null,
            lista_atual: []
        };
    }

    let copiaLista = JSON.parse(JSON.stringify(listaRestante));
    let itemAtual = copiaLista.shift();

    return {
        finished: false,
        cliente: itemAtual,
        item: itemAtual,
        lista_atual: copiaLista
    };
} catch (e) {
    return {
        finished: true,
        cliente: null,
        item: null,
        error: String(e)
    };
}`
    });

    const branchProcessingNodes: ForticsFlowNode[] = [];

    if (options.hasSecondaryApi) {
      branchProcessingNodes.push({
        __spec: true,
        __spec_version: "1.0.0",
        id: options.api3Name || "consultar_cadastro_detalhado",
        name: options.api3Name || "consultar_cadastro_detalhado",
        type: "rest",
        method: options.api3Method,
        uri: options.api3Uri.replace(/\{\{item\./g, '{{proximo_da_lista.item.'),
        verify_ssl: true,
        body_format: "json",
        headers: [
          { key: "Content-Type", value: "application/json" }
        ],
        body: ""
      });
    }

    branchProcessingNodes.push({
      __spec: true,
      __spec_version: "1.0.0",
      id: options.api2Name || "executar_acao_item",
      name: options.api2Name || "executar_acao_item",
      type: "rest",
      method: options.api2Method,
      uri: options.api2Uri,
      verify_ssl: true,
      body_format: "json",
      headers: [
        ...(options.api2AuthHeader ? [{ key: "Authorization", value: options.api2AuthHeader }] : []),
        { key: "Content-Type", value: "application/json" }
      ],
      body: options.api2Body.replace(/\{\{item\./g, '{{proximo_da_lista.item.')
    });

    if (options.hasDatabaseStep) {
      branchProcessingNodes.push({
        __spec: true,
        __spec_version: "1.0.0",
        id: options.dbNodeName || "gravar_historico_db",
        name: options.dbNodeName || "gravar_historico_db",
        type: "rest",
        method: options.dbNodeMethod,
        uri: options.dbNodeUri,
        verify_ssl: true,
        body_format: "json",
        headers: [
          ...(options.dbNodeAuthHeader ? [{ key: "Authorization", value: options.dbNodeAuthHeader }] : []),
          { key: "Content-Type", value: "application/json" }
        ],
        body: options.dbNodeBody.replace(/\{\{item\./g, '{{proximo_da_lista.item.')
      });
    }

    branchProcessingNodes.push({
      __spec: true,
      __spec_version: "1.0.0",
      id: "voltar_loop_goto",
      label: activeLoopLabel,
      type: "goto"
    });

    flow.push({
      __spec: true,
      __spec_version: "1.0.0",
      id: "condicao_fim_loop",
      type: "condition",
      condition: "==",
      left: "{{proximo_da_lista.finished}}",
      right: "True",
      then: [
        {
          __spec: true,
          __spec_version: "1.0.0",
          id: "retorno_conclusao",
          type: "route_return",
          status_code: "200",
          content_type: "application/json",
          value: "{{#tojson}}\n{\n  \"status\": \"concluido\",\n  \"mensagem\": \"Todos os itens da fila foram processados com sucesso.\"\n}\n{{/tojson}}"
        }
      ],
      else: branchProcessingNodes
    });

  } else {
    flow.push({
      __spec: true,
      __spec_version: "1.0.0",
      id: "configurar_datas_e_pagina",
      name: "configurar_datas_e_pagina",
      type: "code",
      error_message: "Erro ao configurar parâmetros iniciais",
      value: `let agora = new Date();\nlet dataBrasilia = new Date(agora.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));\nlet ano = dataBrasilia.getFullYear();\nlet mes = String(dataBrasilia.getMonth() + 1).padStart(2, '0');\nlet dia = String(dataBrasilia.getDate()).padStart(2, '0');\n\nreturn {\n    page: 1,\n    hoje: ano + '-' + mes + '-' + dia\n};`
    });

    const pageLoopLabel = options.loopTargetLabel || "Loop Paginacao";
    flow.push({
      __spec: true,
      __spec_version: "1.0.0",
      id: "loop_paginacao_label",
      name: pageLoopLabel,
      type: "label"
    });

    flow.push({
      __spec: true,
      __spec_version: "1.0.0",
      id: "definir_pagina_da_rodada",
      name: "definir_pagina_da_rodada",
      type: "code",
      value: `let proxima = _vars.atualizar_estado_do_fluxo?.page;\nlet invalido = proxima === undefined || proxima === null || proxima === "";\nreturn {\n    pagina_atual: invalido ? 1 : Number(proxima)\n};`
    });

    flow.push({
      __spec: true,
      __spec_version: "1.0.0",
      id: options.api1Name || "buscar_registros_fila",
      name: options.api1Name || "buscar_registros_fila",
      type: "rest",
      method: options.api1Method,
      uri: options.api1Uri.includes('{{') ? options.api1Uri : `${options.api1Uri}?page={{definir_pagina_da_rodada.pagina_atual}}&pageSize=${options.pageSizeValue || 100}`,
      verify_ssl: true,
      body_format: "json",
      headers: [
        ...(options.api1AuthHeader ? [{ key: "Authorization", value: options.api1AuthHeader }] : []),
        { key: "Content-Type", value: "application/json" }
      ],
      body: ""
    });

    flow.push({
      __spec: true,
      __spec_version: "1.0.0",
      id: "inicializar_fila_clientes",
      name: "inicializar_fila_clientes",
      type: "code",
      error_message: "Erro ao extrair registros da página",
      value: `let apiResp = _vars.${options.api1Name || "buscar_registros_fila"} || {};\nlet dados = apiResp.response?.data || apiResp.data || apiResp.items || (Array.isArray(apiResp) ? apiResp : []);\nlet totalPages = apiResp.response?.totalPages || apiResp.totalPages || 1;\nlet paginaAtual = _vars.definir_pagina_da_rodada?.pagina_atual || 1;\n\nlet temMais = paginaAtual < totalPages;\nif (!apiResp.totalPages && !apiResp.response?.totalPages) {\n    temMais = dados.length >= ${options.pageSizeValue || 100};\n}\n\nreturn {\n    quantidadeFaturas: dados.length,\n    faturasDaPagina: dados,\n    paginaAtual: paginaAtual,\n    totalPages: totalPages,\n    temMaisDadosPagina: temMais ? "True" : "False",\n    proximaPagina: paginaAtual + 1\n};`
    });

    flow.push({
      __spec: true,
      __spec_version: "1.0.0",
      id: "loop_itens_label",
      name: "Loop Itens Fila",
      type: "label"
    });

    flow.push({
      __spec: true,
      __spec_version: "1.0.0",
      id: "verificar_proximo_item",
      name: "verificar_proximo_item",
      type: "code",
      value: `let lista;\nif (_vars.remover_item_processado && _vars.remover_item_processado.paginaFila === _vars.definir_pagina_da_rodada?.pagina_atual) {\n    lista = _vars.remover_item_processado.filaRestante || [];\n} else {\n    lista = _vars.inicializar_fila_clientes?.faturasDaPagina || [];\n}\n\nif (lista.length === 0) {\n    return { temClienteNaFila: 'False', itemAtual: null, filaReferencia: [] };\n}\nreturn { temClienteNaFila: 'True', itemAtual: lista[0], filaReferencia: lista };`
    });

    flow.push({
      __spec: true,
      __spec_version: "1.0.0",
      id: "condicao_processar_item",
      type: "condition",
      condition: "==",
      left: "{{verificar_proximo_item.temClienteNaFila}}",
      right: "True",
      then: [
        ...(options.hasSecondaryApi ? [{
          __spec: true,
          __spec_version: "1.0.0",
          id: options.api3Name || "consultar_cadastro_detalhado",
          name: options.api3Name || "consultar_cadastro_detalhado",
          type: "rest" as const,
          method: options.api3Method,
          uri: options.api3Uri.replace(/\{\{item\./g, '{{verificar_proximo_item.itemAtual.'),
          verify_ssl: true,
          body_format: "json" as const,
          headers: [{ key: "Content-Type", value: "application/json" }],
          body: ""
        }] : []),
        {
          __spec: true,
          __spec_version: "1.0.0",
          id: options.api2Name || "executar_acao_item",
          name: options.api2Name || "executar_acao_item",
          type: "rest" as const,
          method: options.api2Method,
          uri: options.api2Uri,
          verify_ssl: true,
          body_format: "json" as const,
          headers: [
            ...(options.api2AuthHeader ? [{ key: "Authorization", value: options.api2AuthHeader }] : []),
            { key: "Content-Type", value: "application/json" }
          ],
          body: options.api2Body.replace(/\{\{item\./g, '{{verificar_proximo_item.itemAtual.')
        },
        ...(options.hasDatabaseStep ? [{
          __spec: true,
          __spec_version: "1.0.0",
          id: options.dbNodeName || "gravar_historico_db",
          name: options.dbNodeName || "gravar_historico_db",
          type: "rest" as const,
          method: options.dbNodeMethod,
          uri: options.dbNodeUri,
          verify_ssl: true,
          body_format: "json" as const,
          headers: [
            ...(options.dbNodeAuthHeader ? [{ key: "Authorization", value: options.dbNodeAuthHeader }] : []),
            { key: "Content-Type", value: "application/json" }
          ],
          body: options.dbNodeBody.replace(/\{\{item\./g, '{{verificar_proximo_item.itemAtual.')
        }] : []),
        {
          __spec: true,
          __spec_version: "1.0.0",
          id: "remover_item_processado",
          name: "remover_item_processado",
          type: "code",
          value: `let fila = _vars.verificar_proximo_item?.filaReferencia || [];\nlet novaFila = fila.slice();\nnovaFila.shift();\nreturn { filaRestante: novaFila, paginaFila: _vars.definir_pagina_da_rodada?.pagina_atual || 1 };`
        },
        {
          __spec: true,
          __spec_version: "1.0.0",
          id: "voltar_fila_itens",
          label: "Loop Itens Fila",
          type: "goto"
        }
      ],
      else: [
        {
          __spec: true,
          __spec_version: "1.0.0",
          id: "atualizar_estado_do_fluxo",
          name: "atualizar_estado_do_fluxo",
          type: "code",
          value: `let temMais = _vars.inicializar_fila_clientes?.temMaisDadosPagina || "False";\nlet proxima = _vars.inicializar_fila_clientes?.proximaPagina || 1;\nreturn { page: proxima, temMaisDados: temMais };`
        },
        {
          __spec: true,
          __spec_version: "1.0.0",
          id: "condicao_proxima_pagina",
          type: "condition",
          condition: "==",
          left: "{{atualizar_estado_do_fluxo.temMaisDados}}",
          right: "True",
          then: [
            {
              __spec: true,
              __spec_version: "1.0.0",
              id: "voltar_para_o_loop",
              label: pageLoopLabel,
              type: "goto"
            }
          ],
          else: [
            {
              __spec: true,
              __spec_version: "1.0.0",
              id: "retorno_finalizacao_loop",
              type: "route_return",
              status_code: "200",
              content_type: "application/json",
              value: "{{#tojson}}\n{\n  \"status\": \"sucesso\",\n  \"mensagem\": \"Todas as páginas e registros foram processados com sucesso.\"\n}\n{{/tojson}}"
            }
          ]
        }
      ]
    });
  }

  return {
    id: "wf-loop-" + Math.random().toString(36).substring(2, 9),
    name: options.workflowName || "Workflow de Looping Automatizado",
    enabled: true,
    allow_workflow_import: true,
    protected: false,
    options: {
      abort_keyword: "###",
      abort_message: "Sessão abortada!",
      finish_message: "Até a próxima!",
      inactivity_message: "Sessão encerrada por inatividade!",
      inactivity_warning: "Sua sessão vai expirar em breve por inatividade",
      inactivity_warning_time: 60,
      timeout: options.timeoutSeconds || 300
    },
    flow
  };
}
