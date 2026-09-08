import { ForticsAgent, ForticsWorkflow } from '../types/fortics';

export const MANUAL_AGENTE_BOAS_PRATICAS = `# GUIA COMPLETO DE AGENTES INTELIGENTES FORTICS (OFICIAL 2026)

## 1. Princípio Fundamental: MONO SKILL & ORQUESTRAÇÃO
- **1 Agente = 1 Tarefa = 1 Roteiro Único.**
- Nunca misture suporte com vendas ou financeiro no mesmo agente especialista.
- Em operações multissetoriais, utilize um **Agente de Triagem / Orquestrador** que identifica a intenção e transborda para o agente especialista via tokens (#SUPORTE, #FINANCEIRO, #COMERCIAL).

## 2. As 6 Dimensões do Prompt Perfeito
1. **PERSONA:** Quem o agente é, nome, especialidade, tom de voz e limites claros do que PODE e NÃO PODE fazer.
2. **CONTEXTO:** Descrição detalhada do cenário e audiência (público leigo vs técnico).
3. **TAREFA (Função + Passos):** 
   - No campo \`instruction.role\`, finalize OBRIGATORIAMENTE com: "Siga os seguintes passos:".
   - No campo \`instruction.steps\`: Liste estritamente **O QUE TEM QUE FAZER** em frases diretas e limpas em linguagem natural.
4. **OUTRAS REGRAS (\`other_rules\`):** É estritamente **COMO VÃO FAZER**. Descreva detalhadamente regras de validação (CPF/CNPJ), confirmação expressa antes de gravar, limites de escopo, regras anti-alucinação, variáveis SZ e tags de transbordo.
5. **FORMATO:** Saudação receptiva, regras de tamanho de resposta (máx 3 a 4 linhas), emojis e formatação Markdown.
6. **TOM & TEMPERATURA:** Criatividade BAIXA (0.0 a 0.2) para agentes informativos, suporte e financeiro com dados factuais.

## 3. Padrões de Exibição Contextual (Context Binding)
- O runtime Fortics exige que dados chave (como \`id_cliente\`, \`id_contrato\`, \`protocolo\`) sejam exibidos no diálogo para viabilizar chamadas subsequentes:
  * Exemplo: *"Sempre Exiba nome + id do cliente + cpf/cnpj do cliente + contratos disponíveis + endereço do contrato + status"*.

## 4. Fenced Code Blocks & Tokens de Roteamento
- Quando o fluxo exigir transbordo ou acionamento direto:
  * Retorne o token (#HUMANO, #FINANCEIRO, #BOLETO, #COD_PIX) sem texto adicional.
  * Quando necessário, anexe o JSON fenced com as variáveis extraídas (\`ID_CONTRATO\`, \`DATA_FATURA\`, \`CODIGO_BOLETO\`, \`CODIGO_PIX\`).`;

export const MANUAL_WORKFLOW_BOAS_PRATICAS = `# GUIA DE ENGENHARIA DE WORKFLOWS FORTICS (JSON IMPORTÁVEL)

## 1. Estrutura e Grafo de Execução
O Workflow Fortics é um grafo determinístico de nós (\`flow\`) com spec flags (\`__spec: true\`, \`__spec_version: "1.0.0"\`) e UUIDs v4 únicos.

## 2. Tipos de Nós Oficiais:
1. **instructions (Tool Spec para Agente LLM):**
   - Título, descrição, argumentos (Args:) e retorno estruturado (Returns:) no padrão Google/Sphinx.
2. **code (Padrão Oficial de Extração - name: "request"):**
   - Desempacotamento seguro de \`_vars._request.body\`.
3. **rest (Integração HTTP / APIs externas):**
   - Métodos GET, POST, PUT, DELETE, PATCH com \`verify_ssl\`, \`headers\` e injeção de variáveis \`{{request.campo}}\`.
4. **label & goto (Looping e Paginação):**
   - Nó \`label\` serve como âncora; nó \`goto\` salta de volta para iterar sobre listas com \`shift()\`.
5. **condition (Bifurcação de Fluxo):**
   - Comparação (\`==\`, \`!=\`, etc.) com ramos \`then\` e \`else\`.
6. **route_return (Encerramento e Retorno ao Agente):**
   - Serialização final com \`{{#tojson}}{{variavel_final}}{{/tojson}}\`.`;

export const DEFAULT_AGENT_SCHEMA_TEMPLATE: ForticsAgent = {
  id: "88fc753b-e6f1-4119-96f8-2ebf376ceecc",
  name: "Agente de Suporte Técnico",
  description: "Diagnóstico técnico de internet, verificação de massivas, sinal LOS/PON e abertura de chamados.",
  audience: "Clientes residenciais e corporativos com dúvidas ou problemas de conexão.",
  cat: "support_net",
  color: "#d500f9",
  icon: "avatar-1",
  emojis: false,
  enabled: true,
  force_greetings: false,
  greetings: "Olá! Sou o assistente de suporte técnico. Como posso te ajudar hoje?",
  style: "Se comporte como um atendente de suporte nível 1, direto, cordial e natural.",
  llm: "GPT",
  llm_api_key: "21406bd2-f435-4027-83f1-45720febe2b5",
  llm_model: "gpt-4.1",
  llm_temperature: 0,
  ocr_enabled: true,
  protected: true,
  webchat: false,
  template: true,
  voice_priority: false,
  void_context: true,
  tts_id: "00000000-0000-0000-0000-000000000000",
  media_upload_enabled: false,
  offset: "America/Sao_Paulo",
  instruction: {
    objective: "Diagnosticar e resolver problemas de conexão do cliente de forma direta, natural e eficiente.",
    role: "Você é um atendente de suporte técnico nível 1. Siga os seguintes passos:",
    steps: [
      "Cumprimentar o cliente e identificar a necessidade",
      "Solicitar e confirmar o CPF ou CNPJ do titular",
      "Consultar ocorrências de massiva ativa na região",
      "Verificar o status de conexão da ONU e sinal óptico",
      "Classificar o problema entre sem conexão, lentidão ou instabilidade",
      "Orientar teste das luzes do roteador ou rede 5GHz",
      "Abrir chamado técnico no HelpDesk caso o problema persista",
      "Verificar horário de atendimento e realizar transbordo se necessário"
    ]
  },
  other_rules: `### IDENTIDADE
Você é um agente de suporte técnico de internet. Seu objetivo é diagnosticar e resolver problemas de conexão do cliente de forma direta, natural e eficiente.

### COMPORTAMENTO E LINGUAGEM
- Seja direto e natural — escreva como uma pessoa, não como um robô.
- Nunca realize mais de uma pergunta por mensagem.
- Divida informações longas em etapas: envie uma parte, aguarde a resposta, continue.
- Cada resposta: máximo 3 frases curtas.
- Só avance para o diagnóstico após ter o CPF/CNPJ confirmado.

### TAGS DE TRANSBORDO
- #HUMANO: Falha física, LOS/PON piscando, insatisfação, cancelamento.
- #ENCAMINHAR: Solicitações comerciais ou financeiras.
- #FIM: Problema resolvido com sucesso.`
};

export const DEFAULT_WORKFLOW_SCHEMA_TEMPLATE: ForticsWorkflow = {
  id: "e75f90f1-472d-4ce9-882f-acf16bb1dfab",
  name: "WF - Consulta de Agendamentos e Disparo HSM",
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
    timeout: 500
  },
  flow: [
    {
      id: "a9e8b0d0-9c5c-4b17-b849-06cbcab22d7c",
      name: "Data_futura",
      type: "code",
      __spec: true,
      __spec_version: "1.0.0",
      error_message: "Desculpe, estou com dificuldades para processar sua solicitação",
      value: `try {
    var hoje = new Date();
    var diasAdicionar = 1;
    if (hoje.getDay() === 5) diasAdicionar = 1;
    hoje.setDate(hoje.getDate() + diasAdicionar);
    var ano = hoje.getFullYear();
    var mes = (hoje.getMonth() + 1).toString().padStart(2, '0');
    var dia = hoje.getDate().toString().padStart(2, '0');
    return ano + '-' + mes + '-' + dia;
} catch (e) {
    return { error: "Failed to generate date", details: JSON.stringify(e) };
}`
    },
    {
      id: "55f06b09-a974-4009-8d0d-e2f25a78c9f0",
      name: "token",
      type: "rest",
      __spec: true,
      __spec_version: "1.0.0",
      method: "POST",
      uri: "https://naja-auth.naja.app/Login/AutenticarOrganizacao",
      verify_ssl: false,
      body_format: "json",
      headers: [{ key: "Content-Type", value: "application/json" }],
      body: '{\n  "tokenOrganizacao": "SEU_TOKEN_ORGANIZACAO_AQUI"\n}'
    },
    {
      id: "b404b372-e1b3-4cec-bbb9-6b9da8455a9c",
      name: "response",
      type: "rest",
      __spec: true,
      __spec_version: "1.0.0",
      method: "GET",
      uri: "http://204.199.59.114:5005/Agendamentos?retornarCancelados=false&retornarProdutos=true",
      verify_ssl: true,
      headers: [{ key: "Authorization", value: "Bearer {{token.token}}" }],
      query_params: [
        { key: "data", value: "{{Data_futura}}" },
        { key: "dataFinal", value: "{{Data_futura}}" }
      ]
    },
    {
      id: "3d31fe6e-c277-44dd-958d-0449c1baaa47",
      name: "clientes_filtrados",
      type: "code",
      __spec: true,
      __spec_version: "1.0.0",
      error_message: "Erro ao filtrar agendamentos",
      value: `const agendamentos = _vars.response || [];
const data = agendamentos.filter(function(item) {
    return item && item.status && String(item.status.descricao || '').toUpperCase() === 'AGENDADO';
}).map(function(item) {
    return {
        codAgendamento: item.codigo,
        patientName: item.paciente?.nome || null,
        phoneNumber: item.paciente?.contatos?.[0]?.numero || null,
        data: item.data
    };
});
return { data: data, tamanho: data.length };`
    },
    {
      id: "657cc23f-98cc-4a8c-8ef6-d3b81795122e",
      type: "route_return",
      __spec: true,
      __spec_version: "1.0.0",
      content_type: "application/json",
      status_code: "200",
      value: "{{#tojson}}\n{{clientes_filtrados}}\n{{/tojson}}"
    }
  ]
};

export const TEMPLATES_LIBRARY = [
  {
    id: "template-suporte-isp",
    title: "Suporte Técnico ISP & Massivas Voalle",
    category: "Suporte ISP",
    badge: "Oficial Produção",
    description: "Diagnóstico técnico de internet com consulta de massivas, teste de sinal óptico LOS/PON, Wi-Fi 5G e abertura de chamados.",
    sampleNaturalSteps: `- Cumprimentar o cliente e identificar a necessidade
- Solicitar e confirmar o CPF ou CNPJ do titular
- Consultar ocorrências de massiva ativa na região
- Verificar o status de conexão da ONU e sinal óptico
- Classificar o problema entre sem conexão, lentidão ou instabilidade
- Orientar teste das luzes do roteador ou rede 5GHz
- Abrir chamado técnico no HelpDesk caso o problema persista
- Verificar horário de atendimento e realizar transbordo`,
    sampleNaturalRules: `- Nunca use número de telefone como CPF
- Só avance para o diagnóstico após ter o CPF/CNPJ confirmado
- Se houver massiva na região, informe e encerre com #FIM se o cliente não tiver mais dúvidas
- Se 2 interações consecutivas não avançarem, retorne SOMENTE #HUMANO`,
    sampleAgent: DEFAULT_AGENT_SCHEMA_TEMPLATE,
    sampleWorkflow: DEFAULT_WORKFLOW_SCHEMA_TEMPLATE
  },
  {
    id: "template-comercial-isp",
    title: "Assistente Comercial & Vendas ISP",
    category: "Comercial ISP",
    badge: "Alta Conversão",
    description: "Vendas residenciais e empresariais, consulta de viabilidade de endereço, upgrade/downgrade, SVA e transferência de titularidade.",
    sampleNaturalSteps: `- Validar se o contato é cliente ou novo lead
- Confirmar a cidade e consultar viabilidade de endereço
- Perguntar se o plano é para uso residencial ou empresarial
- Apresentar opções de planos e condições de contratação
- Coletar documentos para cadastro e termo de adesão
- Realizar o transbordo para a equipe de vendas`,
    sampleNaturalRules: `- NUNCA invente planos ou valores fora da base oficial
- Planos residenciais transborde para #PLANOSRESIDENCIAIS
- Planos empresariais transborde para #PLANOSEMPRESARIAIS
- Finalização de proposta transborde para #HUMANO`,
    sampleAgent: {
      ...DEFAULT_AGENT_SCHEMA_TEMPLATE,
      id: "565667d8-8fa0-43b9-83ab-f6c94db5d07e",
      name: "Assistente Comercial ISP",
      cat: "commercial_net",
      color: "#834bff",
      icon: "avatar-2",
      description: "Fornece informações detalhadas sobre planos, preços e viabilidade de contratação."
    },
    sampleWorkflow: DEFAULT_WORKFLOW_SCHEMA_TEMPLATE
  },
  {
    id: "template-financeiro-starconect",
    title: "Agente Financeiro & 2ª Via / PIX",
    category: "Financeiro",
    badge: "Auto-Serviço",
    description: "Emissão de boletos, código PIX Copia e Cola, desbloqueio em confiança (2 dias) e validação de comprovantes de pagamento.",
    sampleNaturalSteps: `- Identificar o cliente por CPF/CNPJ ou telefone
- Consultar faturas em aberto no ERP financeiro
- Apresentar a lista de faturas pendentes com vencimento e valor
- Oferecer envio por PIX, código de barras ou PDF
- Oferecer desbloqueio em confiança de 2 dias se disponível
- Validar comprovante de pagamento caso enviado pelo cliente`,
    sampleNaturalRules: `- Respeitar a formatação exata dos valores (ex: 50.60)
- Enviar #COD_PIX acompanhado de JSON fenced com CODIGO_PIX
- Enviar #COD_BOLETO ou #BOLETO com ID_CONTRATO, DATA_FATURA e CODIGO_BOLETO
- Se cliente tiver mais de 3 boletos em atraso, transborde para #HUMANO`,
    sampleAgent: {
      ...DEFAULT_AGENT_SCHEMA_TEMPLATE,
      id: "bd5323d7-305d-4669-b91d-e3fa4ea8f6d1",
      name: "Agente Financeiro StarConect",
      cat: "finance_net",
      color: "#4caf50",
      icon: "avatar-7",
      description: "Auxilia na emissão de segunda via de boletos, PIX e desbloqueio em confiança."
    },
    sampleWorkflow: DEFAULT_WORKFLOW_SCHEMA_TEMPLATE
  },
  {
    id: "template-agendamento-medico",
    title: "Agendamento Médico & Exames de Imagem",
    category: "Saúde & Clínicas",
    badge: "Multietapa",
    description: "Marcação de exames de imagem e consultas em unidades médicas com verificação de convênios, planos, médicos e preparos.",
    sampleNaturalSteps: `- Cumprimentar o paciente e perguntar a quantidade de exames
- Listar unidades médicas disponíveis e aguardar escolha
- Consultar convênios aceitos na unidade escolhida
- Listar procedimentos disponíveis e verificar preparo necessário
- Consultar horários livres com médicos executantes
- Coletar dados do paciente e apresentar resumo antes de confirmar
- Chamar integração de criação de agendamento`,
    sampleNaturalRules: `- Aceitar agendamento automático apenas para os 8 procedimentos permitidos
- Para procedimentos complexos ou mais de 1 exame, transborde para #HUMANO
- Sempre utilizar os nomes exatos retornados pelas integrações sem alterar`,
    sampleAgent: {
      ...DEFAULT_AGENT_SCHEMA_TEMPLATE,
      id: "f651fe16-ffa1-48c3-a45d-0cfd2650cdf6",
      name: "Omni - Agendamento de Exames",
      cat: "medical_scheduling",
      color: "#3dd56d",
      icon: "avatar-4",
      description: "Assistente virtual especializada em agendamentos de exames de imagem e consultas."
    },
    sampleWorkflow: DEFAULT_WORKFLOW_SCHEMA_TEMPLATE
  },
  {
    id: "template-triagem-orquestrador",
    title: "Agente de Triagem & Roteador Multiskill",
    category: "Orquestrador",
    badge: "Master Router",
    description: "Identifica a intenção do cliente no início do contato, analisa imagens/áudios e direciona para o agente especialista correto.",
    sampleNaturalSteps: `- Cumprimentar o cliente e identificar a necessidade
- Validar se é cliente ativo ou novo lead
- Identificar intenção por texto ou imagem enviada (ONU -> Suporte, Comprovante -> Financeiro)
- Realizar validação cadastral por telefone ou CPF
- Exibir resumo cadastral para confirmação
- Executar transbordo para o setor correspondente`,
    sampleNaturalRules: `- Retornar apenas a tag de transbordo (#FINANCEIRO, #COMERCIAL, #SUPORTE, #HUMANO, #FIM)
- Imagens de roteador/ONU direcionar para #SUPORTE
- Imagens de comprovantes direcionar para #FINANCEIRO`,
    sampleAgent: {
      ...DEFAULT_AGENT_SCHEMA_TEMPLATE,
      id: "c0784d95-9f42-4eda-a781-4e5046bb40b9",
      name: "Estela - Agente de Triagem",
      cat: "provider_multiskill",
      color: "#e11d48",
      icon: "avatar-8",
      description: "Orquestrador de atendimento para provedores de internet e serviços."
    },
    sampleWorkflow: DEFAULT_WORKFLOW_SCHEMA_TEMPLATE
  }
];

export const SYSTEM_SZ_VARIABLES_INFO = [
  { name: "{{telefone}}", description: "Telefone do contato (WhatsApp/SMS)", example: "+5511999998888" },
  { name: "{{nome}}", description: "Nome do cliente cadastrado no Omnichannel", example: "Carlos Eduardo" },
  { name: "{{cpf}}", description: "Documento CPF/CNPJ identificado", example: "123.456.789-00" },
  { name: "{{email}}", description: "E-mail de contato cadastrado", example: "carlos@empresa.com.br" },
  { name: "{{canal}}", description: "Canal de atendimento (whatsapp, webchat, telegram)", example: "whatsapp" },
  { name: "{{plano}}", description: "Plano ou produto contratado", example: "Plano Pro Enterprise" }
];

export const STANDARD_ROUTING_TOKENS = [
  { token: "#HUMANO", description: "Transbordo para fila de atendimento humano" },
  { token: "#SUPORTE", description: "Direciona para o agente ou fila de Suporte Técnico" },
  { token: "#FINANCEIRO", description: "Transfere para o agente ou setor Financeiro" },
  { token: "#COMERCIAL", description: "Transfere para o agente ou setor Comercial" },
  { token: "#PLANOSRESIDENCIAIS", description: "Direciona para contratação de planos residenciais" },
  { token: "#PLANOSEMPRESARIAIS", description: "Direciona para contratação de planos corporativos" },
  { token: "#BOLETO", description: "Retorno de PDF de boleto com JSON fenced" },
  { token: "#COD_BOLETO", description: "Retorno de código de barras com JSON fenced" },
  { token: "#COD_PIX", description: "Retorno de chave PIX Copia e Cola com JSON fenced" },
  { token: "#SAC", description: "Encaminha para ouvidoria / SAC" },
  { token: "#RESULTADO", description: "Devolução de dados estruturados para fluxo pai" },
  { token: "#ENCAMINHAR", description: "Desvio condicional para roteamento secundário" },
  { token: "#FIM", description: "Sinaliza encerramento imediato do atendimento" }
];

export const REAL_NORMAL_WORKFLOWS: Array<{
  id: string;
  name: string;
  category: string;
  badge: string;
  description: string;
  highlights: string[];
  workflow: ForticsWorkflow;
}> = [
  {
    id: "wf-real-1-demissao",
    name: "1º - Cadastrar Demissão (Medicina Ocupacional SGG)",
    category: "Recursos Humanos & Medicina",
    badge: "Multietapa REST",
    description: "Workflow que recebe CPF e CNPJ, consulta cadastro do funcionário e da empresa no SGG, e realiza o registro de demissão com retorno formatado.",
    highlights: [
      "Docstring de Instructions com parâmetros obrigatórios tipados",
      "Nó Code 'request' para desempacotar _vars._request.body",
      "Duas consultas GET encadeadas (Funcionário + Empresa)",
      "Nó POST final para registrar a demissão no SGG",
      "Finalização com route_return e {{#tojson}}"
    ],
    workflow: {
      id: "d5406438-d498-47d1-b780-7bec9aa57c17",
      name: "Cadastrar demissão - novo",
      allow_workflow_import: true,
      enabled: true,
      protected: false,
      options: {
        abort_keyword: "###",
        abort_message: "Sessão abortada!",
        finish_message: "Até a próxima!",
        inactivity_message: "Sessão encerrada por inatividade!",
        inactivity_warning: "Sua sessão vai expirar em breve por inatividade",
        inactivity_warning_time: 60,
        timeout: 300
      },
      flow: [
        {
          id: "24c2ba09-6a1f-4d40-bff2-a10a317c4df4",
          type: "instructions",
          __spec: true,
          __spec_version: "1.0.0",
          content: "Cadastro do agendamento do cliente\n\nCadastra o agendamento do cliente\n\nArgs:\n  cnpj (str): Número de cnpj que o cliente disser ( Depois que capturou transforme no formato : xx.xxx.xxx/xxxx-xx ) \n  cpf (str ): Cpf do cliente ( antes de enviar transforme para esse formato: xxx.xxx.xxx-xx )\n  tipoExame (str):  O tipo que o cliente deseja( tem esses tipos: \"Admissional\",\"Demissional\",\"Periódico\", \"Mudança de Riscos Ocupacionais\", \"Retorno ao trabalho\" ou \"Outro\"\ndata_agendamento (str): Data que o cliente deseja marcar depois que o cliente mandou formate assim: AAAA-MM-DD\nempresa (str) : Nome da empresa que foi escolhida ou validada pelo cliente( trazer do jeito que retornou na api  da amostragem da empresa(s) )\n\nReturns:\n\tdict: Retorne dados da empresa"
        },
        {
          id: "03712369-e681-4fa7-934d-df6b2f4ebd18",
          name: "request",
          type: "code",
          __spec: true,
          __spec_version: "1.0.0",
          error_message: "Desculpe estou com dificuldades para processar sua solicitação",
          value: "try {\n    let data = _vars._request.body;\n \n    if (data && typeof data === 'object' && Object.keys(data).length === 1 && data.data) {\n        data = data.data;\n    }\n \n    return data;\n \n} catch (e) {\n    return {\n        error: \"Failed to extract request data\",\n        details: JSON.stringify(e)\n    };\n}"
        },
        {
          id: "82a6878b-4f41-4b5a-9977-bb6db405fecc",
          name: "response_funcionario",
          type: "rest",
          __spec: true,
          __spec_version: "1.0.0",
          method: "GET",
          uri: "https://app.sgg.net.br/api/v3/funcionario?paginador[pagina]=0&paginador[tamanho]=100&cpf={{request.cpf}}",
          verify_ssl: true,
          body_format: "json",
          body: "{\n\"key\": \"value\"\n}",
          headers: [
            {
              key: "Authorization",
              value: "Basic SEU_TOKEN_BASIC_AUTH_SGG_AQUI"
            }
          ]
        },
        {
          id: "86bbff60-caac-4981-bf2f-df4e8d642ea3",
          name: "dados_funcionario",
          type: "code",
          __spec: true,
          __spec_version: "1.0.0",
          error_message: "Desculpe estou com dificuldades para processar sua solicitação",
          value: "let lista = _vars.response_funcionario.resultado;\n\nif (Array.isArray(lista) && lista.length > 0) {\n    let dados = lista[0];\n\n    return {\n        informacao: \"Cadastro encontrado\",\n        id_empresa: dados.id_empresa,\n        id_funcionario: dados.id_funcionario,\n        nome: dados.nome,\n        id_cargo: dados.id_cargo,\n        codigo_rh: dados.codigo_rh,\n        id_setor: dados.id_setor,\n        setor: dados.setor,\n        funcao: dados.funcao,\n        dependentes: dados.dependentes,\n        cargo: dados.cargo,\n        CBO: dados.CBO\n    };\n} else {\n    return {\n        informacao: \"Cadastro não encontrado\"\n    };\n}"
        },
        {
          id: "97813c74-8e14-4543-8ba3-1c1bf21d390a",
          name: "response",
          type: "rest",
          __spec: true,
          __spec_version: "1.0.0",
          method: "GET",
          uri: "https://app.sgg.net.br/api/v3/empresa",
          verify_ssl: true,
          body_format: "json",
          body: "{\n\"key\": \"value\"\n}",
          headers: [
            {
              key: "Authorization",
              value: "Basic SEU_TOKEN_BASIC_AUTH_SGG_AQUI"
            }
          ],
          query_params: [
            { key: "paginador[pagina]", value: "0" },
            { key: "paginador[tamanho]", value: "50" },
            { key: "cnpj_cpf", value: "{{request.cnpj}}" }
          ]
        },
        {
          id: "97acbf3a-537b-47e8-8b5b-0c11a3c167e6",
          name: "dados_tratados",
          type: "code",
          __spec: true,
          __spec_version: "1.0.0",
          error_message: "Desculpe estou com dificuldades para processar sua solicitação",
          value: "let lista = _vars.response.resultado;\n\nif (Array.isArray(lista) && lista.length > 0) {\n    const dados = lista[0];\n\n    return {\n        informacao: \"Empresa encontrada\",\n        empresa: {\n            id_empresa: dados.id_empresa,\n            codigo_rh: dados.codigo_rh,\n            responsaveis: dados.responsaveis,\n            complemento_cobranca: dados.complemento_cobranca,\n            numero_cobranca: dados.numero_cobranca,\n            logradouro_cobranca: dados.logradouro_cobranca,\n            bairro_cobranca: dados.bairro_cobranca,\n            cidade_cobranca: dados.cidade_cobranca,\n            estado_cobranca: dados.estado_cobranca,\n            id_grupo: dados.id_grupo,\n            nome: dados.nome,\n            fantasia: dados.fantasia,\n            porte_empresa: dados.porte_empresa\n        }\n    };\n} else {\n    return {\n        informacao: \"Empresa não encontrada\",\n        empresa: {}\n    };\n}"
        },
        {
          id: "a895a163-be60-4ff9-b91d-6952592e4f0b",
          name: "agendamento",
          type: "rest",
          __spec: true,
          __spec_version: "1.0.0",
          method: "POST",
          uri: "https://app.sgg.net.br/api/v3/demissao/",
          verify_ssl: true,
          body_format: "json",
          body: "{\r\n  \"id_empresa\": \"{{dados_tratados.empresa.id_empresa}}\",\r\n  \"id_funcionario\": \"{{dados_funcionario.id_funcionario}}\",\r\n  \"data_demissao\": \"{{request.dataDemissão}}\"\r\n}",
          headers: [
            { key: "Authorization", value: "Basic SEU_TOKEN_BASIC_AUTH_SGG_AQUI" },
            { key: "Accept", value: "*/*" },
            { key: "Content-Type", value: "application/json" }
          ]
        },
        {
          id: "ae6080f8-19dd-485d-b48c-c97d012008cb",
          name: "code_4",
          type: "code",
          __spec: true,
          __spec_version: "1.0.0",
          error_message: "Desculpe estou com dificuldades para processar sua solicitação",
          value: "const response = _vars.agendamento;\r\n\r\nreturn response;"
        },
        {
          id: "55cbdc0b-155f-4c86-b29c-60b949bd368b",
          type: "route_return",
          __spec: true,
          __spec_version: "1.0.0",
          content_type: "application/json",
          status_code: "200",
          value: "{{#tojson}}\n{{code_4}}\n{{/tojson}}"
        }
      ]
    }
  },
  {
    id: "wf-real-2-agendamento-clinica",
    name: "2º - Cadastrar Agendamento Clínico (ClinicMarc)",
    category: "Saúde & Clínicas",
    badge: "Multi-Endpoints Encadeados",
    description: "Fluxo completo de agendamento em clínica médica: obtenção de Token OAuth, busca de convênios, dados do paciente, lista de médicos e horários vagos com confirmação.",
    highlights: [
      "Autenticação prévia via OAuth v1 Bearer Token",
      "Formatação e validação de datas no nó 'dia_escolhido'",
      "Filtros de convênio por nome em maiúsculas",
      "Busca de médicos com insensitive match",
      "Reserva final de slot com confirmação"
    ],
    workflow: {
      id: "5413c380-13fe-4164-ad09-1a5bb729bdfd",
      name: "7º- Cadastrar agendamento",
      allow_workflow_import: true,
      enabled: true,
      protected: false,
      options: {
        abort_keyword: "###",
        abort_message: "Sessão abortada!",
        finish_message: "Até a próxima!",
        inactivity_message: "Sessão encerrada por inatividade!",
        inactivity_warning: "Sua sessão vai expirar em breve por inatividade",
        inactivity_warning_time: 60,
        timeout: 300
      },
      flow: [
        {
          id: "1d0e847e-20a9-44cc-beb7-036457123fcb",
          type: "instructions",
          __spec: true,
          __spec_version: "1.0.0",
          content: "Faz o cadastro/atualização do cadastro do paciente\n\nSempre antes de fazer o agendamento chame essa integração para criar ou atualizar dados do paciente e depois siga para o agendamento\n\nArgs:\n especialidade (str) : Nome da especialidade escolhida pelo paciente\n dia (str): Dia que o cliente deseja agendar (DD/M/AAAA)\n nomeDoutor (str): Nome do medico escolhido\n horario (str): horario que o paciente deseja agendar (HH:HH)\n convenio (str): Nome do convenio escolhido\n cpf (str): Número de cpf do cliente\n\nReturns:\n\tdict: Retorne os dados cadastrais do paciente"
        },
        {
          id: "6436f712-b558-43ef-b5eb-b20760caeddb",
          name: "request",
          type: "code",
          __spec: true,
          __spec_version: "1.0.0",
          error_message: "Desculpe estou com dificuldades para processar sua solicitação",
          value: "try {\n    let data = _vars._request.body;\n \n    if (data && typeof data === 'object' && Object.keys(data).length === 1 && data.data) {\n        data = data.data;\n    }\n \n    return data;\n \n} catch (e) {\n    return {\n        error: \"Failed to extract request data\",\n        details: JSON.stringify(e)\n    };\n}"
        },
        {
          id: "094f96e6-bb8b-4c42-bc61-398b59e40154",
          name: "dia_escolhido",
          type: "code",
          __spec: true,
          __spec_version: "1.0.0",
          error_message: "Desculpe estou com dificuldades para processar sua solicitação",
          value: "try {\n    const partes = String(_vars.request.dia || \"\").trim().split(\"/\");\n    if (partes.length !== 3) return { status: false, message: \"Formato inválido\" };\n    return partes[2] + \"-\" + partes[1].padStart(2, \"0\") + \"-\" + partes[0].padStart(2, \"0\");\n} catch (e) {\n    return { status: false, message: \"Erro ao formatar data\", details: String(e) };\n}"
        },
        {
          id: "25a683da-394c-465c-a205-10ff519f9abd",
          name: "token",
          type: "rest",
          __spec: true,
          __spec_version: "1.0.0",
          method: "POST",
          uri: "https://legacy-393-fort.clinic.inf.br/oauth/v1/token",
          verify_ssl: true,
          body_format: "json",
          body: "{\n\"key\": \"value\"\n}",
          headers: [
            { key: "Authorization", value: "Basic SEU_TOKEN_BASIC_AUTH_CLINIC_AQUI" },
            { key: "Accept-Encoding", value: "gzip, deflate" }
          ]
        },
        {
          id: "ea635025-b71e-4dc2-86b9-3475b50de10f",
          name: "convenios",
          type: "rest",
          __spec: true,
          __spec_version: "1.0.0",
          method: "GET",
          uri: "https://legacy-393-fort.clinic.inf.br/api/v1/integration/insurance-providers",
          verify_ssl: false,
          body_format: "json",
          body: "{\n\"key\": \"value\"\n}",
          headers: [
            { key: "Authorization", value: "Bearer {{token.access_token}}" },
            { key: "Accept-Encoding", value: "gzip, deflate" }
          ]
        },
        {
          id: "4a2d1739-398c-49a0-9de1-23dd15662744",
          name: "convenio_selecionado",
          type: "code",
          __spec: true,
          __spec_version: "1.0.0",
          error_message: "Desculpe estou com dificuldades para processar sua solicitação",
          value: "const response = _vars.convenios;\nconst convenioRequest = (_vars.request.convenio || \"\").trim().toUpperCase();\n\nconst itemEncontrado = response.result.items.find(idx =>\n    idx.status === true &&\n    (idx.name || \"\").trim().toUpperCase() === convenioRequest\n);\n\nreturn itemEncontrado ? { id: itemEncontrado.id, name: itemEncontrado.name } : null;"
        },
        {
          id: "5af6783a-4566-41d6-9ac4-2b33b61e23bf",
          name: "response_dados_paciente",
          type: "rest",
          __spec: true,
          __spec_version: "1.0.0",
          method: "GET",
          uri: "https://legacy-393-fort.clinic.inf.br/api/v1/integration/facilities/1/patients",
          verify_ssl: false,
          body_format: "json",
          body: "{\n\"key\": \"value\"\n}",
          headers: [
            { key: "Authorization", value: "Bearer {{token.access_token}}" },
            { key: "Accept-Encoding", value: "gzip, deflate" }
          ],
          query_params: [{ key: "nin", value: "{{request.cpf}}" }]
        },
        {
          id: "2697ca34-8f5e-4c0c-b40a-6e791e795b96",
          name: "dados_paciente_tratado",
          type: "code",
          __spec: true,
          __spec_version: "1.0.0",
          error_message: "Desculpe estou com dificuldades para processar sua solicitação",
          value: "const responseApi = _vars.response_dados_paciente;\r\nreturn responseApi?.result?.items?.[0] || null;"
        },
        {
          id: "3a2346e5-d121-4bac-91c3-46c7cea03a8e",
          name: "doutores",
          type: "rest",
          __spec: true,
          __spec_version: "1.0.0",
          method: "GET",
          uri: "https://legacy-393-fort.clinic.inf.br/api/v1/integration/facilities/1/doctors?filter_web_disabled=false",
          verify_ssl: true,
          body_format: "json",
          body: "{\n\"key\": \"value\"\n}",
          headers: [
            { key: "Authorization", value: "Bearer {{token.access_token}}" },
            { key: "Accept-Encoding", value: "gzip, deflate" }
          ]
        },
        {
          id: "e2e199ac-4e90-4e9e-b043-2f608e5435dd",
          name: "doutores_filtrados",
          type: "code",
          __spec: true,
          __spec_version: "1.0.0",
          error_message: "Desculpe estou com dificuldades para processar sua solicitação",
          value: "try {\n    const itens = (_vars.doutores && _vars.doutores.result && _vars.doutores.result.items) || [];\n    const nomeDoutor = String(_vars.request.nomeDoutor || \"\").trim().toLowerCase();\n    if (!nomeDoutor) return { status: false, message: \"Nome do doutor não informado\" };\n    const doutor = itens.find(item => item.name && String(item.name).trim().toLowerCase() === nomeDoutor);\n    return doutor || { status: false, message: \"Doutor não encontrado\" };\n} catch (e) {\n    return { status: false, message: \"Erro ao buscar doutor\", details: String(e) };\n}"
        },
        {
          id: "dcdd0e1b-ed3e-4141-acd4-8ef37bcbd4cf",
          name: "horarios_do_dr",
          type: "rest",
          __spec: true,
          __spec_version: "1.0.0",
          method: "GET",
          uri: "https://legacy-393-fort.clinic.inf.br/api/v1/integration/facilities/1/doctors/{{doutores_filtrados.id}}/addresses/1/available-slots",
          verify_ssl: true,
          body_format: "json",
          body: "{\n\"key\": \"value\"\n}",
          headers: [
            { key: "Authorization", value: "Bearer {{token.access_token}}" },
            { key: "Accept-Encoding", value: "gzip, deflate" }
          ],
          query_params: [
            { key: "start_date", value: "{{dia_escolhido}}" },
            { key: "end_date", value: "{{dia_escolhido}}" }
          ]
        },
        {
          id: "a469a73b-6e27-4c84-a23d-f1f116914a68",
          name: "hora_escolhida",
          type: "code",
          __spec: true,
          __spec_version: "1.0.0",
          error_message: "Desculpe estou com dificuldades para processar sua solicitação",
          value: "try {\n    const respostaApi = _vars.horarios_do_dr.result;\n    const horario = (_vars.request.horario || \"\").trim();\n    const items = (respostaApi && respostaApi.items) || [];\n    const horarioEncontrado = items.find(item => item.substring(11, 16) === horario);\n    return horarioEncontrado || null;\n} catch (e) {\n    return null;\n}"
        },
        {
          id: "b079d0e1-e4b1-41e3-b15e-03bb342dd545",
          name: "response_confirmacao",
          type: "rest",
          __spec: true,
          __spec_version: "1.0.0",
          method: "POST",
          uri: "https://legacy-393-fort.clinic.inf.br/api/v1/integration/facilities/1/doctors/{{doutores_filtrados.id}}/addresses/1/slots/{{hora_escolhida}}",
          verify_ssl: true,
          body_format: "json",
          body: "{\n    \"address_service_id\": 1,\n    \"external_id\": \"1\",\n    \"patient_id\":\"{{dados_paciente_tratado.id}}\" ,\n    \"obs\": \"AGENDAMENTO FEITO POR IA DA FORTICS\",\n    \"appointmentType\": 1,\n    \"healthInsuranceCode\": \"{{convenio_selecionado.id}}\"\n}",
          headers: [
            { key: "Content-Type", value: "application/json" },
            { key: "Authorization", value: "Bearer {{token.access_token}}" },
            { key: "Accept-Encoding", value: "gzip, deflate" }
          ]
        },
        {
          id: "335321c4-e526-43ac-bc15-bf17bc0f5262",
          type: "route_return",
          __spec: true,
          __spec_version: "1.0.0",
          content_type: "application/json",
          status_code: "200",
          value: "{{#tojson}}\n{{response_confirmacao}}\n{{/tojson}}"
        }
      ]
    }
  },
  {
    id: "wf-real-3-consulta-telefone-voalle",
    name: "3º - Consultar Cliente por Telefone (StarConect / Voalle)",
    category: "Telecom & Provedores ISP",
    badge: "Validação Cadastral",
    description: "Identifica o cliente e seus contratos ativos/bloqueados no ERP Voalle através do número de telefone com formatação sanitizada.",
    highlights: [
      "Autenticação x-www-form-urlencoded com syndata",
      "Sanitização de DDI (55) e DDD no nó Code 'request'",
      "Mapeamento de múltiplos contratos e status de desbloqueio",
      "Retorno limpo de CPF/CNPJ e contagem de clientes"
    ],
    workflow: {
      id: "b52b5229-a186-48bc-9b40-a90a473c8f0e",
      name: "Consultar cliente pelo telefone",
      allow_workflow_import: true,
      enabled: true,
      protected: false,
      options: {
        abort_keyword: "###",
        abort_message: "Sessão abortada!",
        finish_message: "Até a próxima!",
        inactivity_message: "Sessão encerrada por inatividade!",
        inactivity_warning: "Sua sessão vai expirar em breve por inatividade",
        inactivity_warning_time: 60,
        timeout: 300
      },
      flow: [
        {
          id: "28138792-95ec-4ff6-b9d1-f61adb408e49",
          type: "instructions",
          __spec: true,
          __spec_version: "1.0.0",
          content: "Realiza a consulta de um cadastro do cliente pelo telefone\n\nSempre começa consultando o cadastro do cliente por essa integração\n\nArgs:\n    telefone(str): número do telefone do cliente (formate para que venha ddd+numero, ex: xxxxxxxxxxx )\n\nReturns:\n    dict: Resposta do nome, cpf ou cnpj"
        },
        {
          id: "c07ebc0c-05f1-4dbe-8222-548e30d76866",
          name: "token",
          type: "rest",
          __spec: true,
          __spec_version: "1.0.0",
          method: "POST",
          uri: "https://erp.starconect.com.br:45700/connect/token",
          verify_ssl: true,
          body_format: "file",
          body: "{\"grant_type\":\"client_credentials\",\"scope\":\"syngw\",\"client_id\":\"SEU_CLIENT_ID_AQUI\",\"client_secret\":\"SUA_CLIENT_SECRET_AQUI\",\"syndata\":\"SEU_SYNDATA_DE_AUTENTICACAO_AQUI\"}",
          headers: [{ key: "Content-Type", value: "application/x-www-form-urlencoded" }]
        },
        {
          id: "9ddaf258-1ec8-439d-99a0-18259c7aa168",
          name: "request",
          type: "code",
          __spec: true,
          __spec_version: "1.0.0",
          error_message: "Desculpe estou com dificuldades para processar sua solicitação",
          value: "try {\n    let data = _vars._request.body.data || _vars._request.body.telefone || _vars._request.body;\n    if (data && typeof data === 'object' && Object.keys(data).length === 1 && data.data) {\n        data = data.data;\n    }\n    if (data) {\n        let telefone = String(data).replace(/\\D/g, '');\n        if (telefone.startsWith('55') && telefone.length > 11) {\n            telefone = telefone.substring(2);\n        }\n        data = telefone;\n    }\n    return data;\n} catch (e) {\n    return { error: \"Failed to extract request data\", details: JSON.stringify(e) };\n}"
        },
        {
          id: "74050285-873d-47b0-acdd-a32e3ea5e5d8",
          name: "dados_cliente",
          type: "rest",
          __spec: true,
          __spec_version: "1.0.0",
          method: "POST",
          uri: "https://erp.starconect.com.br/pbx/pbx/events/new/CLIENT_VALIDATE",
          verify_ssl: false,
          body_format: "json",
          body: "{\n    \"callerid\": \"{{request}}\",\n    \"token\": \"SUA_CHAVE_DE_AUTENTICACAO_PBX_AQUI\"\n}",
          headers: [{ key: "Content-Type", value: "application/json" }]
        },
        {
          id: "d827e142-7164-4c01-a825-60e05d81e79a",
          name: "status",
          type: "code",
          __spec: true,
          __spec_version: "1.0.0",
          error_message: "Desculpe estou com dificuldades para processar sua solicitação",
          value: "const dados = _vars.dados_cliente;\n\nconst clients = (dados.clients || []).map(cliente => {\n  const documento = (cliente.client_tx_id || \"\").replace(/\\D/g, \"\");\n  return {\n    client_id: cliente.client_id,\n    client_name: cliente.client_name,\n    ...(documento.length > 11 ? { cnpj: documento } : { cpf: documento }),\n    contratos: (cliente.contracts_info || []).map(contrato => ({\n      contract_id: contrato.id,\n      address: contrato.address,\n      description: contrato.description,\n      contract_type: contrato.contract_type,\n      approval_date: contrato.approval_date,\n      unblock_attempt_count: contrato.unblock_attempt_count\n    }))\n  };\n});\n\nreturn {\n  quantidade_clientes: clients.length,\n  clients\n};"
        },
        {
          id: "26e23a2a-0050-4150-8b54-1d382c6dc780",
          type: "route_return",
          __spec: true,
          __spec_version: "1.0.0",
          content_type: "application/json",
          status_code: "200",
          value: "{{#tojson}}\n{{status}}\n{{/tojson}}"
        }
      ]
    }
  },
  {
    id: "wf-real-4-abertura-chamado-os",
    name: "4º - Abertura de Chamado OS com Documento (Central Butanenet)",
    category: "Suporte & Ordens de Serviço",
    badge: "Abertura com Protocolo",
    description: "Abertura de ordem de serviço (OS) com vínculo de contrato, técnico responsável, data agendada e motivo da ocorrência.",
    highlights: [
      "Validação estrita de parâmetros de entrada",
      "Tratamento de resposta com detecção de 'os_id'",
      "Retorno com status de sucesso/erro e mensagem amigável",
      "Timeout de 60 segundos configurado no nó REST"
    ],
    workflow: {
      id: "a3bca2fd-4a61-4d54-9ef7-170b6954fd08",
      name: "Abertura Chamado com documento",
      allow_workflow_import: true,
      enabled: true,
      protected: false,
      options: {
        abort_keyword: "###",
        abort_message: "Sessão abortada!",
        finish_message: "Até a próxima!",
        inactivity_message: "Sessão encerrada por inatividade!",
        inactivity_warning: "Sua sessão vai expirar em breve por inatividade",
        inactivity_warning_time: 60,
        timeout: 300
      },
      flow: [
        {
          id: "57ad8037-4617-42a6-9867-ad8aaf15dfaf",
          type: "instructions",
          __spec: true,
          __spec_version: "1.0.0",
          content: "Abertura Chamado \n\nRealiza a abertura de chamado OS para contrato do cliente com base no seu cof/cnpj\n\nArgs:\n  cpfcnpj (str): Número de cpf do cliente\n  contrato (str): número do contrado do cliente\n  descricao (str): Descrição do clente sobre a abertura\n  codigo (str):  Número do codigo do motivo\n  idTecnico ( str) : Número do id do técnico que vai ficar responsavel pelo chamado\n  dataAgendada (str): Data e hora que o cliente deseja agendar (AAAA-MM-DD HH:MM)\n  nomeContato (str): Nome do cadastro/contato do cliente\n  motivoOs (str): Tipo de ocorrencia do motivo\n\nReturns:\nResposta da integração"
        },
        {
          id: "30f5fe0c-ddc8-4bb2-bc46-59cc3e3ec276",
          name: "request",
          type: "code",
          __spec: true,
          __spec_version: "1.0.0",
          error_message: "O campo cpfcnpj deve ser informado.",
          value: "try {\n    let data = _vars._request.body;\n    if (data && typeof data === 'object' && Object.keys(data).length === 1 && data.data) {\n        data = data.data;\n    }\n    if (typeof data === 'string' || typeof data === 'number') {\n        data = { cpfcnpj: String(data) };\n    }\n    return data;\n} catch (e) {\n    return { error: 'Failed to extract request data', details: JSON.stringify(e) };\n}"
        },
        {
          id: "9e94cdf0-ceb0-459c-822f-4750a2f8638f",
          name: "resposta_api",
          type: "rest",
          __spec: true,
          __spec_version: "1.0.0",
          method: "POST",
          uri: "https://www.centralbutanonet.com.br/api/central/chamado/",
          verify_ssl: true,
          body_format: "json",
          body: "{\n  \"app\": \"SZ.CHAT\",\n  \"token\": \"SEU_TOKEN_SZCHAT_AQUI\",\n  \"cpfcnpj\":\"{{request.documento}}\",\n  \"contrato\": \"{{request.contrato}}\",\n  \"conteudo\":\"{{request.descricao}}\",\n  \"motivoos\": \"{{request.codigo}}\",\n  \"os_tecnico_responsavel\": \"{{request.idTecnico}}\",\n  \"data_hora_agendamento\":\"{{request.dataAgendada}}\",\n  \"contato\": \"{{request.nomeContato}}\",\n  \"motivoos\": \"{{request.motivoOs}}\"\n}",
          headers: [{ key: "Content-Type", value: "application/json" }]
        },
        {
          id: "ab438865-d69a-4e5f-8268-f684d3ce698a",
          name: "tratar_dados",
          type: "code",
          __spec: true,
          __spec_version: "1.0.0",
          error_message: "Erro ao tratar os dados da resposta.",
          value: "try {\n    let raw = _vars.resposta_api;\n    if (typeof raw === 'string') {\n        try { raw = JSON.parse(raw); } catch (e) { return { status: \"erro\", mensagem: \"Resposta da API inválida.\" }; }\n    }\n    if (raw.os_id) {\n        return { status: \"sucesso\", mensagem: \"Chamado aberto com sucesso!\", os_id: raw.os_id };\n    }\n    if (raw.msg && raw.msg.length > 0) {\n        return { status: \"erro\", mensagem: raw.msg };\n    }\n    return { status: \"erro\", mensagem: \"Não foi possível executar a ação abertura de chamado!\" };\n} catch (e) {\n    return { status: \"erro\", mensagem: \"Erro ao processar dados da API.\", detalhes: String(e) };\n}"
        },
        {
          id: "bc3edda8-e347-4462-beb7-b538357b5d9b",
          type: "route_return",
          __spec: true,
          __spec_version: "1.0.0",
          content_type: "application/json",
          status_code: "200",
          value: "{{#tojson}}\n{{tratar_dados}}\n{{/tojson}}"
        }
      ]
    }
  },
  {
    id: "wf-real-5-soap-qualitor-openai",
    name: "5º - Status de Chamados SOAP/XML com Resumo OpenAI",
    category: "Governança & Integrações Avançadas",
    badge: "SOAP + LLM OpenAI",
    description: "Consulta web service legado SOAP/XML Qualitor e sintetiza o histórico com o nó da OpenAI responses antes de retornar ao cliente.",
    highlights: [
      "Integração SOAP/XML Stateless com decodificação de entidades",
      "Parsing de tags XML e correção de Mojibake em JavaScript",
      "Chamada ao modelo 'gpt-4.1-nano' via Bearer API Key",
      "Limpeza e sanitização de texto de atendimento ao cliente"
    ],
    workflow: {
      id: "cff71e92-ab12-49a0-a7a3-31103289de01",
      name: "Consultar status dos chamados - Acompanhamento Tratado",
      allow_workflow_import: true,
      enabled: true,
      protected: false,
      options: {
        abort_keyword: "###",
        abort_message: "Sessão abortada!",
        finish_message: "Até a próxima!",
        inactivity_message: "Sessão encerrada por inatividade!",
        inactivity_warning: "Sua sessão vai expirar em breve por inatividade",
        inactivity_warning_time: 60,
        timeout: 300
      },
      flow: [
        {
          id: "3ed5073f-11b5-461e-914b-b1aff101759d",
          name: "request",
          type: "code",
          __spec: true,
          __spec_version: "1.0.0",
          error_message: "Desculpe estou com dificuldades para processar sua solicitação",
          value: "var request = _vars._request || {};\nvar body = request.body;\nif (typeof body === \"string\") { try { body = JSON.parse(body); } catch (e) { body = {}; } }\nif (body && typeof body === \"object\" && Object.keys(body).length === 1 && Object.prototype.hasOwnProperty.call(body, \"data\")) { body = body.data; }\nbody = body && typeof body === \"object\" ? body : {};\nvar cpfCliente = String(body.cpfCliente || \"\").replace(/\\D/g, \"\");\nvar cdcliente = String(body.cdcliente || \"\").replace(/\\D/g, \"\");\nvar cdcontato = String(body.cdcontato || \"\").replace(/\\D/g, \"\");\nif (cpfCliente.length !== 11 || !cdcliente || !cdcontato) { return { ok: false, erro_codigo: \"PARAMETROS_INVALIDOS\" }; }\nreturn { ok: true, cpfCliente: cpfCliente, cdcliente: cdcliente, cdcontato: cdcontato };"
        },
        {
          id: "cfcf9fd6-7f3f-4cd3-a155-1bd3b94b3d9b",
          name: "response",
          type: "rest",
          __spec: true,
          __spec_version: "1.0.0",
          method: "POST",
          uri: "https://siga-hml.governancabrasil.com.br/ws/statelessws.php",
          verify_ssl: true,
          body_format: "raw",
          body: "user=integrador.ia&password=SUA_SENHA_DE_AUTENTICACAO_AQUI&company=2&wsdl_file=WSGeneral&operation=getSQLQueryResult&input_xml=%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22ISO-8859-1%22%3F%3E%3Cwsqualitor%3E%3Ccontents%3E%3Cdata%3E%3Cdsquery%3ESELECT%20TOP%203%20c.cdchamado%20AS%20Numero%2C%20c.dtchamado%20AS%20Abertura%20FROM%20hd_chamado%20c%20WHERE%20CONVERT(VARCHAR(30)%2C%20ac.nrcpfcnpj)%20%3D%20'{{request.cpfCliente}}'%3C%2Fdsquery%3E%3C%2Fdata%3E%3C%2Fcontents%3E%3C%2Fwsqualitor%3E",
          headers: [
            { key: "Content-Type", value: "application/x-www-form-urlencoded" },
            { key: "Accept-Encoding", value: "gzip, deflate" }
          ]
        },
        {
          id: "4cd2dd8d-1d06-4254-875a-0603c94a0831",
          name: "resposta_tratada",
          type: "code",
          __spec: true,
          __spec_version: "1.0.0",
          error_message: "Desculpe estou com dificuldades para processar sua solicitação",
          value: "var xmlString = _vars.response || \"\";\nvar regexItem = /<dataitem>([\\s\\S]*?)<\\/dataitem>/g;\nvar matches = xmlString.match(regexItem) || [];\nvar chamadosArray = [];\n\nfunction getTagValue(xml, tag) {\n    var regex = new RegExp(\"<\" + tag + \">([\\\\s\\\\S]*?)<\\\\/\" + tag + \">\", \"i\");\n    var match = xml.match(regex);\n    return match ? match[1].trim() : \"\";\n}\n\nfor (var i = 0; i < matches.length; i++) {\n    var itemXml = matches[i];\n    chamadosArray.push({\n        \"Chamado\": getTagValue(itemXml, \"Numero\"),\n        \"Data de abertura\": getTagValue(itemXml, \"Abertura\"),\n        \"Situação\": getTagValue(itemXml, \"Situacao\"),\n        \"Equipe\": getTagValue(itemXml, \"Equipe\")\n    });\n}\nreturn JSON.stringify(chamadosArray);"
        },
        {
          id: "8d6afb5b-1f64-470b-b5d1-2adafca5b6e8",
          name: "openai_resumo_acompanhamento",
          type: "rest",
          __spec: true,
          __spec_version: "1.0.0",
          method: "POST",
          uri: "https://api.openai.com/v1/responses",
          verify_ssl: true,
          body_format: "json",
          body: "{\n  \"model\": \"gpt-4.1-nano\",\n  \"input\": [\n    {\n      \"role\": \"system\",\n      \"content\": \"Resuma o acompanhamento do chamado de forma clara para o cliente em no máximo 900 caracteres.\"\n    },\n    {\n      \"role\": \"user\",\n      \"content\": \"{{resposta_tratada}}\"\n    }\n  ],\n  \"max_output_tokens\": 2200\n}",
          headers: [
            { key: "Authorization", value: "Bearer {{_credential.api_key}}" },
            { key: "Content-Type", value: "application/json" }
          ]
        },
        {
          id: "86d26024-4278-40d2-ba74-9e3a4ac9d4e4",
          type: "route_return",
          __spec: true,
          __spec_version: "1.0.0",
          content_type: "application/json",
          status_code: "200",
          value: "{{#tojson}}\n{{openai_resumo_acompanhamento}}\n{{/tojson}}"
        }
      ]
    }
  }
];

export const REAL_LOOPING_WORKFLOWS: Array<{
  id: string;
  name: string;
  category: string;
  badge: string;
  description: string;
  highlights: string[];
  workflow: ForticsWorkflow;
}> = [
  {
    id: "wf-loop-1-cobranca-voalle",
    name: "1º - Disparo de Cobrança 10 dias após vencimento (Voalle + HSM)",
    category: "Cobrança Automática & Paginação Dupla",
    badge: "Loop Duplo (Páginas + Fila)",
    description: "Itera sobre páginas de títulos vencidos no Voalle e depois itera cliente a cliente enviando mensagens HSM ativas no WhatsApp SZ.chat.",
    highlights: [
      "Marcador 'Loop Paginacao' com avanço de página e verificação de totalPages",
      "Marcador 'Loop Clientes Fila' consumindo faturas com slice() e shift()",
      "Condição 'condicao_processar_cliente' bifurcando entre envio e avanço de página",
      "Disparo de HSM no SZ.chat com placeholders (nome, vencimento, PIX, código de barras)",
      "Finalização com act: 'finish' ao esgotar todas as páginas"
    ],
    workflow: {
      id: "0bfc298e-74b3-4e53-85cd-021548fbf6d5",
      name: "Disparo de cobrança 10 dias após o vencimento do dia 30 ( disparar dia 10 )",
      allow_workflow_import: true,
      enabled: true,
      protected: false,
      options: {
        abort_keyword: "###",
        abort_message: "Sessao abortada!",
        finish_message: "Ate a proxima!",
        inactivity_message: "Sessao encerrada por inatividade!",
        inactivity_warning: "Sua sessao vai expirar em breve por inatividade",
        inactivity_warning_time: 60,
        timeout: 300
      },
      flow: [
        {
          id: "45971954-6861-4844-865d-a1a0223d6ea5",
          name: "response_credenciais",
          type: "rest",
          __spec: true,
          __spec_version: "1.0.0",
          method: "POST",
          uri: "https://app.genier.ai/starconect/workflow/consultar_token",
          verify_ssl: true,
          body_format: "json",
          body: ""
        },
        {
          id: "step_01_auth_voalle",
          name: "auth_voalle",
          type: "rest",
          __spec: true,
          __spec_version: "1.0.0",
          method: "POST",
          uri: "https://erp.starconect.com.br:45700/connect/token",
          verify_ssl: true,
          body_format: "file",
          body: "{\"grant_type\":\"client_credentials\",\"scope\":\"syngw\",\"client_id\":\"SEU_CLIENT_ID_AQUI\"}",
          headers: [{ key: "Content-Type", value: "application/x-www-form-urlencoded" }]
        },
        {
          id: "configurar_datas_e_pagina",
          name: "configurar_datas_e_pagina",
          type: "code",
          __spec: true,
          __spec_version: "1.0.0",
          error_message: "Erro ao calcular datas dinamicas",
          value: "let agora = new Date();\nlet dataBrasilia = new Date(agora.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));\nlet ano = dataBrasilia.getFullYear();\nlet mes = String(dataBrasilia.getMonth() + 1).padStart(2, '0');\nlet dia = String(dataBrasilia.getDate()).padStart(2, '0');\n\nreturn {\n    page: 1,\n    expirationDateFrom: _vars.request?.body?.expirationDateFrom || ano + '-' + mes + '-30',\n    expirationDateTo: _vars.request?.body?.expirationDateTo || ano + '-' + mes + '-' + dia\n};"
        },
        {
          id: "loop_paginacao_label",
          name: "Loop Paginacao",
          type: "label",
          __spec: true,
          __spec_version: "1.0.0"
        },
        {
          id: "55ee9bde-9205-4d02-8548-7b6c8abc50ba",
          name: "definir_pagina_da_rodada",
          type: "code",
          __spec: true,
          __spec_version: "1.0.0",
          value: "let proximaPagina = _vars.atualizar_estado_do_fluxo?.page;\nlet ehInvalido = proximaPagina === undefined || proximaPagina === null || proximaPagina === \"\";\nreturn { pagina_atual: ehInvalido ? 1 : Number(proximaPagina) };"
        },
        {
          id: "buscar_titulos_expirados",
          name: "buscar_titulos_expirados",
          type: "rest",
          __spec: true,
          __spec_version: "1.0.0",
          method: "GET",
          uri: "https://erp.starconect.com.br:45715/external/Integrations/thirdparty/getopentitlesbyexpirationdate?page={{definir_pagina_da_rodada.pagina_atual}}&pageSize=200",
          verify_ssl: false,
          headers: [{ key: "Authorization", value: "Bearer {{auth_voalle.access_token}}" }]
        },
        {
          id: "loop_clientes_label",
          name: "Loop Clientes Fila",
          type: "label",
          __spec: true,
          __spec_version: "1.0.0"
        },
        {
          id: "verificar_proximo_cliente",
          name: "verificar_proximo_cliente",
          type: "code",
          __spec: true,
          __spec_version: "1.0.0",
          value: "let lista;\nif (_vars.remover_cliente_processado && _vars.remover_cliente_processado.paginaFila === _vars.definir_pagina_da_rodada.pagina_atual) {\n    lista = _vars.remover_cliente_processado.filaRestante || [];\n} else {\n    lista = _vars.inicializar_fila_clientes?.faturasDaPagina || [];\n}\n\nif (lista.length === 0) return { temClienteNaFila: 'False', clienteAtual: null, filaReferencia: [] };\nreturn { temClienteNaFila: 'True', clienteAtual: lista[0], filaReferencia: lista };"
        },
        {
          id: "condicao_processar_cliente",
          type: "condition",
          __spec: true,
          __spec_version: "1.0.0",
          condition: "==",
          left: "{{verificar_proximo_cliente.temClienteNaFila}}",
          right: "True",
          then: [
            {
              id: "97703c41-ef97-4825-b67c-dccd2a815857",
              name: "response_envio_hsm",
              type: "rest",
              __spec: true,
              __spec_version: "1.0.0",
              method: "POST",
              uri: "https://starconect.sz.chat/api/v4/message/send",
              verify_ssl: true,
              body_format: "json",
              body: "{\n    \"platform_id\": \"{{consolidar_dados_fatura.telefone}}\",\n    \"channel_id\": \"64ad5664fa98ac001797e8d7\",\n    \"close_session\": 1,\n    \"is_hsm\": true,\n    \"hsm_template_name\": \"modelo_de_cobranca_sete_e_dez_dias_v1\"\n}",
              headers: [
                { key: "Authorization", value: "Bearer {{response_credenciais.tokenSZ}}" },
                { key: "Content-Type", value: "application/json" }
              ]
            },
            {
              id: "voltar_fila_clientes",
              type: "goto",
              label: "Loop Clientes Fila",
              __spec: true,
              __spec_version: "1.0.0"
            }
          ],
          else: [
            {
              id: "finalizar_sucesso",
              type: "route_return",
              status_code: "200",
              __spec: true,
              __spec_version: "1.0.0",
              value: "\"Todas as faturas de todas as páginas foram processadas.\""
            }
          ]
        }
      ]
    }
  },
  {
    id: "wf-loop-2-agendamento-48h-clinicmarc",
    name: "2º - Confirmação de Agendamentos 48h (ClinicMarc + HSM)",
    category: "Saúde & Confirmação de Consultas",
    badge: "Fila Sequencial Shift()",
    description: "Busca todos os agendamentos futuros da clínica, filtra pacientes com exames pendentes de confirmação e envia mensagens HSM gravando histórico no banco GoDB.",
    highlights: [
      "Cálculo dinâmico de Data_futura (considerando sexta -> segunda)",
      "Agrupamento de múltiplos exames do mesmo paciente",
      "Marcador 'validação' com nó 'proximo_da_lista' executando shift()",
      "Gravação em banco de dados GoDB para evitar envios duplicados",
      "Envio de template HSM WhatsApp SZ.chat e retorno para 'validação'"
    ],
    workflow: {
      id: "c81511a9-ce03-4acd-b9dc-4e499ff31b00",
      name: "Buscar agendamento de exames com 48 hrs de antecedência",
      allow_workflow_import: true,
      enabled: true,
      protected: false,
      options: {
        abort_keyword: "###",
        abort_message: "Sessão abortada!",
        finish_message: "Até a próxima!",
        inactivity_message: "Sessão encerrada por inatividade!",
        inactivity_warning: "Sua sessão vai expirar em breve por inatividade",
        inactivity_warning_time: 60,
        timeout: 500
      },
      flow: [
        {
          id: "a9e8b0d0-9c5c-4b17-b849-06cbcab22d7c",
          name: "Data_futura",
          type: "code",
          __spec: true,
          __spec_version: "1.0.0",
          value: "try {\n    var hoje = new Date();\n    var diasAdicionar = 2;\n    if (hoje.getDay() === 5) diasAdicionar = 1;\n    hoje.setDate(hoje.getDate() + diasAdicionar);\n    var ano = hoje.getFullYear();\n    var mes = (hoje.getMonth() + 1).toString().padStart(2, '0');\n    var dia = hoje.getDate().toString().padStart(2, '0');\n    return ano + '-' + mes + '-' + dia;\n} catch (e) {\n    return { error: \"Failed to generate date\", details: JSON.stringify(e) };\n}"
        },
        {
          id: "cf24dc08-644d-4a4e-8949-3f56fccb295b",
          name: "validação",
          type: "label"
        },
        {
          id: "22f96c02-807f-4281-9a49-809da825ced9",
          name: "proximo_da_lista",
          type: "code",
          __spec: true,
          __spec_version: "1.0.0",
          value: "try {\n    let listaRestante = (_vars.proximo_da_lista && Array.isArray(_vars.proximo_da_lista.lista_atual))\n        ? _vars.proximo_da_lista.lista_atual\n        : (_vars.clientes_filtrados || []);\n    if (listaRestante.length === 0) return { finished: true, cliente: null, lista_atual: [] };\n    const copiaLista = JSON.parse(JSON.stringify(listaRestante));\n    const clienteAtual = copiaLista.shift();\n    return { finished: false, cliente: clienteAtual, lista_atual: copiaLista };\n} catch (e) {\n    return { finished: true, error: e.message };\n}"
        },
        {
          id: "62d19d82-7c5f-471c-978a-54499a963c77",
          type: "condition",
          __spec: true,
          __spec_version: "1.0.0",
          condition: "==",
          left: "{{proximo_da_lista.finished}}",
          right: "True",
          then: [
            {
              id: "335321c4-e526-43ac-bc15-bf17bc0f5262",
              type: "route_return",
              status_code: "200",
              content_type: "application/json",
              value: "{{#tojson}}\nMensagens enviadas com sucesso\n{{/tojson}}"
            }
          ],
          else: [
            {
              id: "cd077fcd-4c21-4864-9a16-b2c691981d36",
              name: "gravar_banco_dados",
              type: "rest",
              __spec: true,
              __spec_version: "1.0.0",
              method: "POST",
              uri: "https://app.genier.ai/clinicmarc/godb/api/collections/Agendamentos/records",
              verify_ssl: false,
              body_format: "json",
              body: "{\n    \"Nome_paciente\": \"{{proximo_da_lista.cliente.client}}\",\n    \"Telefone\": \"{{proximo_da_lista.cliente.mobile}}\",\n    \"Id_do_agendamento\": \"{{proximo_da_lista.cliente.agendamentos}}\",\n    \"Mensagem_enviada\": true\n}",
              headers: [{ key: "Content-Type", value: "application/json" }]
            },
            {
              id: "8e4f8bbb-cb5f-4780-a5ef-67c6fc3c4a89",
              type: "goto",
              label: "validação",
              __spec: true,
              __spec_version: "1.0.0"
            }
          ]
        }
      ]
    }
  },
  {
    id: "wf-loop-3-agendamentos-bezerra-24h",
    name: "3º - Agendamentos Unidade BEZERRA 24h (Naja Auth + GoDB)",
    category: "Saúde & Diagnóstico por Imagem",
    badge: "Filtro por Recursos & Anti-Duplicidade",
    description: "Autentica na API Naja, busca agendamentos da unidade, filtra recursos permitidos (Ressonância, Ultrassom, RX), verifica histórico de envio de ontem no GoDB e dispara HSM.",
    highlights: [
      "Filtro array de recursos permitidos: Ressonância 0,55T, US 01-03, Doppler, Raios X, Mamografia",
      "Agrupamento de múltiplos exames com menor horário",
      "Consulta prévia ao banco GoDB para checar se mensagem já foi enviada no dia anterior",
      "Desvio condicional 'tem_agendamento_no_db' saltando registros já processados",
      "Encerramento limpo quando todos os pacientes forem atendidos"
    ],
    workflow: {
      id: "8de1930e-c342-4d97-8596-3f395871f3a5",
      name: "Buscar agendamentos de todos pacientes da unidade BEZERRA com 24 hrs",
      allow_workflow_import: true,
      enabled: true,
      protected: false,
      options: {
        abort_keyword: "###",
        abort_message: "Sessão abortada!",
        finish_message: "Até a próxima!",
        inactivity_message: "Sessão encerrada por inatividade!",
        inactivity_warning: "Sua sessão vai expirar em breve por inatividade",
        inactivity_warning_time: 60,
        timeout: 500
      },
      flow: [
        {
          id: "55f06b09-a974-4009-8d0d-e2f25a78c9f0",
          name: "token",
          type: "rest",
          __spec: true,
          __spec_version: "1.0.0",
          method: "POST",
          uri: "https://naja-auth.naja.app/Login/AutenticarOrganizacao",
          verify_ssl: false,
          body_format: "json",
          body: "{\n  \"tokenOrganizacao\": \"SEU_TOKEN_ORGANIZACAO_AQUI\"\n}",
          headers: [{ key: "Content-Type", value: "application/json" }]
        },
        {
          id: "b404b372-e1b3-4cec-bbb9-6b9da8455a9c",
          name: "response",
          type: "rest",
          __spec: true,
          __spec_version: "1.0.0",
          method: "GET",
          uri: "http://204.199.59.114:5005/Agendamentos?retornarCancelados=false&retornarProdutos=true&codigosEmpresa=3",
          verify_ssl: true,
          headers: [{ key: "Authorization", value: "Bearer {{token.token}}" }]
        },
        {
          id: "cf24dc08-644d-4a4e-8949-3f56fccb295b",
          name: "validação",
          type: "label"
        },
        {
          id: "22f96c02-807f-4281-9a49-809da825ced9",
          name: "proximo_da_lista",
          type: "code",
          __spec: true,
          __spec_version: "1.0.0",
          value: "try {\n    let listaRestante = (_vars.proximo_da_lista && Array.isArray(_vars.proximo_da_lista.lista_atual))\n        ? _vars.proximo_da_lista.lista_atual\n        : (_vars.clientes_filtrados?.data || []);\n    if (listaRestante.length === 0) return { finished: true, cliente: null, lista_atual: [] };\n    const copiaLista = JSON.parse(JSON.stringify(listaRestante));\n    const clienteAtual = copiaLista.shift();\n    return { finished: false, cliente: clienteAtual, lista_atual: copiaLista };\n} catch (e) {\n    return { finished: true, error: e.message };\n}"
        },
        {
          id: "62d19d82-7c5f-471c-978a-54499a963c77",
          type: "condition",
          __spec: true,
          __spec_version: "1.0.0",
          condition: "==",
          left: "{{proximo_da_lista.finished}}",
          right: "True",
          then: [
            {
              id: "335321c4-e526-43ac-bc15-bf17bc0f5262",
              type: "route_return",
              status_code: "200",
              content_type: "application/json",
              value: "{{#tojson}}\nMensagens enviadas\n{{/tojson}}"
            }
          ],
          else: [
            {
              id: "800e46a9-ca09-4922-b8a3-8ef9a339c981",
              type: "condition",
              __spec: true,
              __spec_version: "1.0.0",
              condition: "==",
              left: "{{tem_agendamento_no_db}}",
              right: "True",
              then: [
                {
                  id: "8e4f8bbb-cb5f-4780-a5ef-67c6fc3c4a89",
                  type: "goto",
                  label: "validação",
                  __spec: true,
                  __spec_version: "1.0.0"
                }
              ],
              else: [
                {
                  id: "cd077fcd-4c21-4864-9a16-b2c691981d36",
                  name: "gravar_banco_dados",
                  type: "rest",
                  __spec: true,
                  __spec_version: "1.0.0",
                  method: "POST",
                  uri: "https://app.genier.ai/omnimagem/godb/api/collections/Agendamentos/records",
                  verify_ssl: false,
                  body_format: "json",
                  body: "{\n    \"Nome_paciente\": \"{{proximo_da_lista.cliente.patientName}}\",\n    \"Telefone\": \"{{proximo_da_lista.cliente.phoneNumber}}\",\n    \"Mensagem_enviada\": true\n}",
                  headers: [{ key: "Content-Type", value: "application/json" }]
                },
                {
                  id: "372f03a1-ef64-43a0-87f4-3e8dc888c7e1",
                  type: "goto",
                  label: "validação",
                  __spec: true,
                  __spec_version: "1.0.0"
                }
              ]
            }
          ]
        }
      ]
    }
  }
];

export const PLATFORM_COMPONENTS_DOCS = [
  {
    id: "comp-instructions",
    name: "1º - Componente de Instruções (Tool Spec)",
    nodeType: "instructions",
    badge: "Obrigatório para LLM Tools",
    summary: "Define a especificação formal (docstring) de como a Inteligência Artificial (LLM) interpreta e executa o workflow como uma ferramenta.",
    description: `O componente de instruções transforma o workflow em uma Tool para a IA, com descrição clara da função, parâmetros tipados (Args:) e formato de retorno (Returns:).`,
    keyFeatures: [
      "Descrição resumida e detalhamento do comportamento",
      "Parâmetros tipados em Args: str, int, float, bool, list, dict",
      "Suporte a variáveis dinâmicas Mustache {{#flag}}...{{/flag}}",
      "Declaração de Raises: para exceções conhecidas",
      "Returns estruturado em formato dict ou lista"
    ],
    sampleCode: `Processa pedidos de clientes e retorna o status da transação.

Esta função analisa os dados do pedido, valida as informações do cliente,
calcula o valor total e processa o pagamento.

Args:
  cliente_id (str): ID único do cliente no sistema
  itens (list): Lista de produtos com quantidades
  metodo_pagamento (str): Forma de pagamento (cartao, pix, boleto)
  desconto (float, optional): Percentual de desconto a aplicar (0-100)

Returns:
  dict: Status do pedido com ID da transação e valor final`
  },
  {
    id: "comp-code-js",
    name: "2º - Componente de Código JavaScript",
    nodeType: "code",
    badge: "Lógica & Tratamento",
    summary: "Executa scripts JavaScript completos com acesso a variáveis de contexto através do objeto global _vars.",
    description: `Permite validação de CPF/CNPJ, formatação de datas (DD/MM/AAAA -> AAAA-MM-DD), desempacotamento seguro de _vars._request.body, filtros em listas, ordenações e decisões lógicas.`,
    keyFeatures: [
      "_vars._userid, _vars._platform (whatsapp, telegram), _vars._name",
      "_vars._history (histórico de interações) e _vars._request (payload recebido)",
      "_vars.[nome_variavel]: acessa o retorno de qualquer nó anterior",
      "Blocos try/catch recomendados para evitar falhas",
      "Sempre retorne um valor que será gravado no nome da variável do nó"
    ],
    sampleCode: `try {
    let data = _vars._request.body;
    if (data && typeof data === 'object' && Object.keys(data).length === 1 && data.data) {
        data = data.data;
    }
    
    let cpf = String(data.cpf || '').replace(/\\D/g, '');
    if (cpf.length !== 11) {
        return { status: false, erro: "CPF inválido - deve ter 11 dígitos" };
    }

    return {
        status: true,
        cpf_formatado: cpf.replace(/(\\d{3})(\\d{3})(\\d{3})(\\d{2})/, "$1.$2.$3-$4")
    };
} catch (e) {
    return { status: false, erro: e.message };
}`
  },
  {
    id: "comp-http-rest-soap",
    name: "3º - Integração HTTP (REST, GraphQL, SOAP)",
    nodeType: "rest",
    badge: "Conexão Externa",
    summary: "Realiza chamadas HTTP para APIs externas ou sistemas legados utilizando métodos GET, POST, PUT, DELETE, GraphQL e envelopes SOAP XML.",
    description: `Suporta injeção de variáveis mustache em URLs, headers e corpo da requisição (ex: {{request.cpf}} ou Bearer {{token.token}}), timeout configurável e controle de SSL.`,
    keyFeatures: [
      "REST: GET, POST, PUT, DELETE, PATCH com JSON ou Form Data",
      "GraphQL: POST com 'query' e 'variables' dinâmicas",
      "SOAP: POST com envelope XML e SOAPAction nos Headers",
      "Autenticação: Basic, Bearer Token, OAuth2 ou API Key",
      "Timeout obrigatório com sufixo (ex: 30s, 60s) respeitando o limite do gatilho"
    ],
    sampleCode: `{
  "name": "buscar_dados_cliente",
  "type": "rest",
  "method": "GET",
  "uri": "https://api.empresa.com.br/v1/clientes?cpf={{request.cpf}}",
  "verify_ssl": true,
  "timeout": "60s",
  "headers": [
    { "key": "Authorization", "value": "Bearer {{token.access_token}}" },
    { "key": "Accept", "value": "application/json" }
  ]
}`
  },
  {
    id: "comp-marcador-label",
    name: "4º - Componente Marcador (Label)",
    nodeType: "label",
    badge: "Âncora de Loop",
    summary: "Define um ponto de referência exclusivo no fluxo que pode ser alvo de saltos com o componente 'Ir Para' (Goto).",
    description: `Essencial para implementar estruturas de repetição (loops), paginação de listas e desvios de fluxo não-lineares.`,
    keyFeatures: [
      "Nome descritivo e único no fluxo (ex: 'Loop Paginacao', 'validacao')",
      "Trabalha em conjunto com o componente 'Ir Para' (goto)",
      "Permite reiniciar iterações após processar um item com shift()"
    ],
    sampleCode: `{
  "id": "loop_clientes_label",
  "name": "Loop Clientes Fila",
  "type": "label"
}`
  },
  {
    id: "comp-condicao",
    name: "5º - Componente Condição (Condition)",
    nodeType: "condition",
    badge: "Bifurcação Lógica",
    summary: "Cria desvios e bifurcações no fluxo de execução comparando o lado esquerdo com o lado direito através de operadores relacionais.",
    description: `Suporta operadores ==, !=, <, <=, >, >= e 'in' (verificação em listas). Possui ramos 'then' (quando verdadeiro) e 'else' (quando falso).`,
    keyFeatures: [
      "Operadores: ==, !=, <, <=, >, >=, in",
      "Acesso a variáveis: {{variavel}} ou {{_request.headers.x-token}}",
      "Ramo 'then': lista de nós executados se a condição for satisfeita",
      "Ramo 'else': lista de nós executados se for falsa"
    ],
    sampleCode: `{
  "type": "condition",
  "condition": "==",
  "left": "{{verificar_proximo_cliente.temClienteNaFila}}",
  "right": "True",
  "then": [
    { /* Nós de envio e remoção de item */ }
  ],
  "else": [
    { /* Nós de finalização ou próxima página */ }
  ]
}`
  },
  {
    id: "comp-ir-para-goto",
    name: "6º - Componente 'Ir Para' (Goto)",
    nodeType: "goto",
    badge: "Salto de Fluxo",
    summary: "Redireciona a execução do fluxo para um nó Marcador (Label) específico, viabilizando iterações e ciclos controlados.",
    description: `Redireciona para o marcador selecionado. Usado dentro do ramo condicional para reiniciar a leitura da fila.`,
    keyFeatures: [
      "Alvo configurado no atributo 'label'",
      "Evita duplicação de código em fluxos repetitivos",
      "Deve ser protegido por condição para evitar loop infinito"
    ],
    sampleCode: `{
  "type": "goto",
  "id": "voltar_fila_clientes",
  "label": "Loop Clientes Fila"
}`
  },
  {
    id: "comp-retorno-de-rota",
    name: "7º - Componente de Retorno de Rota (Route Return)",
    nodeType: "route_return",
    badge: "Finalização & Serialização",
    summary: "Define a resposta final da API entregue ao Agente LLM ou canal externo com status HTTP e suporte a templates Mustache.",
    description: `Configura status_code (200, 201, 400, etc.), content_type e corpo com helper {{#tojson}} para serialização segura de objetos JavaScript.`,
    keyFeatures: [
      "Content-Type: application/json, text/plain, text/html, application/xml",
      "Código de status HTTP: 200 (OK), 201 (Created), 400, 404, 500",
      "Helper oficial {{#tojson}}{{variavel_final}}{{/tojson}}",
      "Interpolações {{ campo }} e iterações {{#lista}}...{{/lista}}"
    ],
    sampleCode: `{
  "type": "route_return",
  "status_code": "200",
  "content_type": "application/json",
  "value": "{{#tojson}}\\n{{dados_tratados}}\\n{{/tojson}}"
}`
  }
];

