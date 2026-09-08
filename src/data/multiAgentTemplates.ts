import { SubAgentEndpoint, MultiAgentPipelineConfig } from '../types/fortics';

export interface MultiAgentNicheTemplate {
  id: string;
  name: string;
  niche: string;
  badge: string;
  description: string;
  subAgents: SubAgentEndpoint[];
}

export const MULTI_AGENT_NICHE_TEMPLATES: MultiAgentNicheTemplate[] = [
  {
    id: 'isp_provedor',
    name: 'Provedor de Internet (ISP)',
    niche: 'Telecomunicações / ISP',
    badge: '🌐 ISP COMPLETO (4 AGENTES)',
    description: 'Pipeline multi-agentes com Triagem Inicial, Financeiro (boletos/PIX/desbloqueio), Suporte Técnico (sinal/diagnóstico/OS) e Comercial (planos/vendas/upgrade). Cada agente pode ser ativado, desativado, marcado como opcional ou excluído conforme sua operação.',
    subAgents: [
      {
        id: 'agent-triagem-isp',
        name: 'Agente de Triagem (Principal)',
        role: 'Recepção, Identificação por CPF/CNPJ ou Telefone e Roteamento de Fila',
        triggerTag: '#triagem',
        triggerKeywords: ['ola', 'oi', 'iniciar', 'comecar', 'triagem', 'menu', 'voltar', 'inicio'],
        mode: 'curl',
        isOptional: false,
        enabled: true,
        colorTheme: 'blue',
        rawCurl: `curl -X POST https://app.genier.ai/api/agent/triagem_provedor \\
  -H "Authorization: Bearer SEU_TOKEN_TRIAGEM" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "{{message}}",
    "history": {{history}},
    "session_id": "{{sessionId}}",
    "caller_id": "{{userPhone}}"
  }'`,
        parsedCurl: {
          url: 'https://app.genier.ai/api/agent/triagem_provedor',
          method: 'POST',
          headers: {
            'Authorization': 'Bearer SEU_TOKEN_TRIAGEM',
            'Content-Type': 'application/json'
          },
          body: `{\n  "query": "{{message}}",\n  "history": {{history}},\n  "session_id": "{{sessionId}}",\n  "caller_id": "{{userPhone}}"\n}`
        },
        customResponsePath: 'output_text',
        agentSpecJson: JSON.stringify({
          name: "Agente de Triagem - ISP Provedor",
          description: "Atendimento de primeiro nível para provedores de internet. Identifica o titular via CPF ou telefone, lista contratos ativos e transborda com contexto.",
          tag: "#triagem",
          instructions: `Você é a atendente virtual de triagem inicial do Provedor de Internet.
Sua missão:
1. Cumprimentar cordialmente o cliente e solicitar o CPF/CNPJ ou telefone de cadastro para identificação.
2. Utilizar a ferramenta 'consultar_cliente' para validar o cadastro e identificar contratos vinculados.
3. Se houver mais de um contrato ou endereço, perguntar sobre qual deles o cliente deseja atendimento.
4. Identificar a real necessidade do cliente:
   - Questões de 2ª via, boletos, código PIX, pagamentos ou desbloqueio -> Transbordar para o Financeiro emitindo a tag #financeiro
   - Queda de conexão, lentidão, Wi-Fi sem sinal, luz vermelha LOS na ONU ou visita técnica -> Transbordar para o Suporte Técnico emitindo a tag #suporte
   - Contratação de novos planos, upgrade de velocidade, novos pontos de Wi-Fi ou mudança de endereço -> Transbordar para o Comercial emitindo a tag #comercial
5. Sempre repassar os dados já coletados (Nome, CPF/CNPJ, ID do Contrato) na transição.`,
          tools: [
            {
              name: "consultar_cliente",
              description: "Consulta cadastro do cliente pelo CPF/CNPJ ou telefone e retorna contratos ativos.",
              args: {
                cpf_cnpj: "str (apenas dígitos)",
                telefone: "str (ddd+numero)"
              }
            }
          ]
        }, null, 2),
        contextStrategy: 'full_history',
        handoffPromptTemplate: 'Transbordo recebido da triagem inicial. Cliente: {{customerName}} | CPF: {{cpf}} | Contrato: {{contractId}} | Resumo da solicitação: "{{lastAgentMessage}}"',
        initialMessage: 'Olá! Sou o assistente virtual do seu provedor de internet. Para localizarmos seu cadastro com rapidez, por favor, me informe seu CPF, CNPJ ou telefone cadastrado.'
      },
      {
        id: 'agent-financeiro-isp',
        name: 'Agente Financeiro',
        role: 'Emissão de 2ª via de boleto, código PIX, desbloqueio em confiança e negociação',
        triggerTag: '#financeiro',
        triggerKeywords: ['financeiro', 'boleto', 'fatura', 'pix', 'pagar', 'pagamento', 'desbloqueio', 'segunda via', '2 via', 'debito', 'vencimento', 'comprovante'],
        mode: 'curl',
        isOptional: false,
        enabled: true,
        colorTheme: 'emerald',
        rawCurl: `curl -X POST https://app.genier.ai/api/agent/financeiro_provedor \\
  -H "Authorization: Bearer SEU_TOKEN_FINANCEIRO" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "{{message}}",
    "history": {{history}},
    "session_id": "{{sessionId}}",
    "customer_id": "{{customerId}}"
  }'`,
        parsedCurl: {
          url: 'https://app.genier.ai/api/agent/financeiro_provedor',
          method: 'POST',
          headers: {
            'Authorization': 'Bearer SEU_TOKEN_FINANCEIRO',
            'Content-Type': 'application/json'
          },
          body: `{\n  "query": "{{message}}",\n  "history": {{history}},\n  "session_id": "{{sessionId}}",\n  "customer_id": "{{customerId}}"\n}`
        },
        customResponsePath: 'output_text',
        agentSpecJson: JSON.stringify({
          name: "Agente Financeiro - ISP Provedor",
          description: "Especialista em autoatendimento financeiro: emissão de boletos, código PIX Copia e Cola, desbloqueio em confiança e informações de faturas.",
          tag: "#financeiro",
          instructions: `Você é o assistente especialista do setor Financeiro do Provedor de Internet.
Suas funções:
1. Consultar faturas em aberto utilizando a ferramenta 'buscar_faturas_pendentes'.
2. Fornecer de forma limpa e organizada:
   - Linha digitável do boleto
   - Código PIX Copia e Cola instantâneo com valor e data de vencimento
   - Link para download do PDF da fatura
3. Caso a conexão do cliente esteja bloqueada por pendência financeira, verificar a elegibilidade e executar a ferramenta 'solicitar_desbloqueio_confianca'.
4. Confirmar o pagamento ou orientar sobre o prazo de baixa bancária (até 24-48h úteis para boleto, instantâneo via PIX).
5. Se o cliente desejar tratar de suporte técnico ou planos, devolva o transbordo com #suporte ou #comercial.`,
          tools: [
            {
              name: "buscar_faturas_pendentes",
              description: "Retorna faturas em aberto, vencidas e a vencer do contrato com linha digitável e chave PIX.",
              args: {
                contrato_id: "str",
                cpf_cnpj: "str"
              }
            },
            {
              name: "solicitar_desbloqueio_confianca",
              description: "Aplica desbloqueio temporário de sinal por até 48 horas mediante promessa de pagamento.",
              args: {
                contrato_id: "str"
              }
            }
          ]
        }, null, 2),
        contextStrategy: 'full_history',
        handoffPromptTemplate: 'Transbordo para o setor Financeiro. Titular: {{customerName}} | Contrato: {{contractId}} | Demanda informada: "{{lastAgentMessage}}"',
        initialMessage: 'Olá! Sou o especialista do setor Financeiro. Posso te enviar a 2ª via de boleto, código PIX para pagamento imediato ou verificar o desbloqueio em confiança do seu sinal. Como posso te ajudar?'
      },
      {
        id: 'agent-suporte-isp',
        name: 'Agente Suporte Técnico N2',
        role: 'Diagnóstico de ONU/Sinal de Fibra, Teste de Lentidão, Reinício Remoto e Abertura de Chamados OS',
        triggerTag: '#suporte',
        triggerKeywords: ['suporte', 'tecnico', 'queda', 'caiu', 'sem internet', 'lentidao', 'lenta', 'los', 'vermelha', 'pon', 'roteador', 'reiniciar', 'visita', 'os', 'chamado', 'sinal'],
        mode: 'curl',
        isOptional: false,
        enabled: true,
        colorTheme: 'purple',
        rawCurl: `curl -X POST https://app.genier.ai/api/agent/suporte_tecnico_provedor \\
  -H "Authorization: Bearer SEU_TOKEN_SUPORTE" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "{{message}}",
    "history": {{history}},
    "session_id": "{{sessionId}}",
    "contract_number": "{{contractId}}"
  }'`,
        parsedCurl: {
          url: 'https://app.genier.ai/api/agent/suporte_tecnico_provedor',
          method: 'POST',
          headers: {
            'Authorization': 'Bearer SEU_TOKEN_SUPORTE',
            'Content-Type': 'application/json'
          },
          body: `{\n  "query": "{{message}}",\n  "history": {{history}},\n  "session_id": "{{sessionId}}",\n  "contract_number": "{{contractId}}"\n}`
        },
        customResponsePath: 'output_text',
        agentSpecJson: JSON.stringify({
          name: "Agente Suporte Técnico - ISP Provedor",
          description: "Diagnóstico avançado de conectividade, medição de potência óptica (dBm), envio de reboot remoto de ONU e abertura de Ordens de Serviço (OS).",
          tag: "#suporte",
          instructions: `Você é o atendente especialista em Suporte Técnico do Provedor de Internet.
Seu protocolo de atendimento:
1. Identificar o status da conexão do cliente através da ferramenta 'consultar_sinal_onu'.
2. Avaliar os parâmetros ópticos:
   - Se potência óptica estiver entre -15 dBm e -25 dBm: Sinal NORMAL.
   - Se potência estiver abaixo de -27 dBm ou LOS piscando vermelho: rompimento ou atenuação grave.
3. Se o sinal estiver normal mas sem navegação, orientar os procedimentos básicos:
   - Verificar cabos de rede e fibra conectados com firmeza
   - Executar a ferramenta 'reiniciar_onu_remoto' para provisionar a sessão PPPoE
4. Se o problema persistir após os testes automáticos, abrir um chamado técnico via 'abrir_chamado_os' com a descrição do sintoma e sugerir opções de data/hora para visita técnica.
5. Sempre manter tom empático, calmo e técnico acessível.`,
          tools: [
            {
              name: "consultar_sinal_onu",
              description: "Verifica status online/offline, potência óptica RX (dBm), status PON e última desconexão na OLT.",
              args: {
                contrato_id: "str",
                mac_ou_sn: "str (opcional)"
              }
            },
            {
              name: "reiniciar_onu_remoto",
              description: "Envia comando TR-069 ou OLT para reboot preventivo da ONU/roteador do assinante.",
              args: {
                contrato_id: "str"
              }
            },
            {
              name: "abrir_chamado_os",
              description: "Abre chamado de ordem de serviço para visita técnica ou manutenção de campo no ERP do provedor.",
              args: {
                contrato_id: "str",
                motivo: "str",
                descricao: "str",
                data_agendamento: "str (AAAA-MM-DD HH:MM)"
              }
            }
          ]
        }, null, 2),
        contextStrategy: 'full_history',
        handoffPromptTemplate: 'Transbordo de Suporte Técnico recebido. Cliente: {{customerName}} | Contrato: {{contractId}} | Problema relatado: "{{lastAgentMessage}}"',
        initialMessage: 'Olá! Sou o especialista do Suporte Técnico. Já identifiquei sua solicitação de conexão. Me conte com mais detalhes: o que está acontecendo (queda total, lentidão ou alguma luz alterada no aparelho)?'
      },
      {
        id: 'agent-comercial-isp',
        name: 'Agente Comercial & Vendas',
        role: 'Apresentação de Planos de Fibra, Upgrade de Velocidade, Consulta de Viabilidade e Novas Contratações',
        triggerTag: '#comercial',
        triggerKeywords: ['comercial', 'planos', 'plano', 'upgrade', 'aumentar velocidade', 'contratar', 'assinar', 'preço', 'valor', 'viabilidade', 'nova instalacao', 'mudanca de endereco'],
        mode: 'curl',
        isOptional: true,
        enabled: true,
        colorTheme: 'amber',
        rawCurl: `curl -X POST https://app.genier.ai/api/agent/comercial_provedor \\
  -H "Authorization: Bearer SEU_TOKEN_COMERCIAL" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "{{message}}",
    "history": {{history}},
    "session_id": "{{sessionId}}",
    "lead_origin": "chat_whatsapp"
  }'`,
        parsedCurl: {
          url: 'https://app.genier.ai/api/agent/comercial_provedor',
          method: 'POST',
          headers: {
            'Authorization': 'Bearer SEU_TOKEN_COMERCIAL',
            'Content-Type': 'application/json'
          },
          body: `{\n  "query": "{{message}}",\n  "history": {{history}},\n  "session_id": "{{sessionId}}",\n  "lead_origin": "chat_whatsapp"\n}`
        },
        customResponsePath: 'output_text',
        agentSpecJson: JSON.stringify({
          name: "Agente Comercial - ISP Provedor",
          description: "Consultoria de vendas, consulta de viabilidade por CEP/número, catálogo de planos 100% fibra ótica e agendamento de novas instalações.",
          tag: "#comercial",
          instructions: `Você é o consultor comercial especialista do Provedor de Internet 100% Fibra Ótica.
Suas diretrizes:
1. Para novos clientes, solicitar o CEP e número do imóvel para verificar viabilidade técnica via ferramenta 'consultar_viabilidade_cep'.
2. Apresentar os planos disponíveis de forma atraente, destacando velocidade simétrica, Wi-Fi 6 e aplicativos inclusos (streaming/conteúdo).
   - Plano 300 Mega: Ideal para navegação básica e redes sociais (R$ 89,90/mês)
   - Plano 600 Mega: O mais vendido, ideal para jogos online, 4K e home office (R$ 109,90/mês)
   - Plano 1 Giga: Máxima performance com roteador Wi-Fi 6 Mesh incluso (R$ 149,90/mês)
3. Para clientes atuais buscando upgrade de velocidade, consultar o plano atual e oferecer opções de fidelização com desconto.
4. Coletar dados cadastrais (Nome, CPF, Data de Nascimento, E-mail e WhatsApp) e registrar a proposta via 'registrar_proposta_venda'.
5. Agendar a data preferencial de instalação.`,
          tools: [
            {
              name: "consultar_viabilidade_cep",
              description: "Verifica se há CTO/Porta disponível na rua e bairro do cliente.",
              args: {
                cep: "str",
                numero: "str",
                complemento: "str (opcional)"
              }
            },
            {
              name: "listar_planos_disponiveis",
              description: "Retorna a tabela de planos vigentes, valores promocionais e benefícios inclusos.",
              args: {
                cidade: "str"
              }
            },
            {
              name: "registrar_proposta_venda",
              description: "Cadastra lead ou contrato de venda no CRM com plano escolhido e dados do assinante.",
              args: {
                nome: "str",
                cpf: "str",
                plano_id: "str",
                endereco: "str",
                data_instalacao_desejada: "str"
              }
            }
          ]
        }, null, 2),
        contextStrategy: 'full_history',
        handoffPromptTemplate: 'Transbordo de Vendas & Comercial recebido. Lead/Cliente: {{customerName}} | Interesse: "{{lastAgentMessage}}"',
        initialMessage: 'Olá! Sou o consultor de vendas e planos de fibra ótica. Posso te apresentar nossas melhores ofertas, consultar a cobertura para o seu endereço ou fazer um upgrade no seu plano atual. O que você procura hoje?'
      }
    ]
  },
  {
    id: 'clinica_medica',
    name: 'Clínica Médica & Saúde',
    niche: 'Saúde / Clínicas / Consultórios',
    badge: '🏥 SAÚDE & CLÍNICA (4 AGENTES)',
    description: 'Pipeline completo com Recepção/Triagem de Pacientes, Agendamento de Consultas/Especialidades, Financeiro/Convênios e Informações de Exames/Preparo.',
    subAgents: [
      {
        id: 'agent-triagem-saude',
        name: 'Recepção & Triagem',
        role: 'Identificação do Paciente por CPF/Telefone e Roteamento de Especialidades',
        triggerTag: '#triagem_saude',
        triggerKeywords: ['ola', 'oi', 'consulta', 'medico', 'doutor', 'exame', 'clinica', 'inicio'],
        mode: 'curl',
        isOptional: false,
        enabled: true,
        colorTheme: 'cyan',
        rawCurl: `curl -X POST https://app.genier.ai/api/agent/triagem_clinica \\
  -H "Authorization: Bearer SEU_TOKEN_CLINICA" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "{{message}}",
    "history": {{history}},
    "session_id": "{{sessionId}}",
    "patient_phone": "{{userPhone}}"
  }'`,
        parsedCurl: {
          url: 'https://app.genier.ai/api/agent/triagem_clinica',
          method: 'POST',
          headers: {
            'Authorization': 'Bearer SEU_TOKEN_CLINICA',
            'Content-Type': 'application/json'
          },
          body: `{\n  "query": "{{message}}",\n  "history": {{history}},\n  "session_id": "{{sessionId}}",\n  "patient_phone": "{{userPhone}}"\n}`
        },
        customResponsePath: 'output_text',
        agentSpecJson: JSON.stringify({
          name: "Agente Recepção e Triagem - Clínica Médica",
          description: "Identifica o paciente, valida histórico cadastral e direciona para agendamento, financeiro/convênio ou preparo de exames.",
          tag: "#triagem_saude",
          instructions: `Você é a recepcionista virtual da Clínica Médica Integrada.
1. Cumprimente o paciente com cordialidade e acolhimento.
2. Solicite o CPF ou nome completo para localizar o prontuário.
3. Identifique o objetivo:
   - Marcar, remarcar ou desmarcar consultas -> Transborde com #agendamento
   - Dúvidas sobre convênios aceitos, pagamento particular ou guias -> Transborde com #financeiro_saude
   - Dúvidas sobre preparo de exames, resultados ou laudos -> Transborde com #exames`,
          tools: [
            {
              name: "buscar_paciente",
              description: "Consulta cadastro do paciente pelo CPF.",
              args: { cpf: "str" }
            }
          ]
        }, null, 2),
        contextStrategy: 'full_history',
        handoffPromptTemplate: 'Paciente identificado: {{customerName}} | CPF: {{cpf}} | Demanda: "{{lastAgentMessage}}"',
        initialMessage: 'Olá! Bem-vindo(a) à nossa Clínica Médica. Para agilizar seu atendimento, por favor me informe seu CPF ou nome completo.'
      },
      {
        id: 'agent-agendamento-saude',
        name: 'Agendamento de Consultas',
        role: 'Disponibilidade de Médicos, Seleção de Especialidades e Confirmação de Horários',
        triggerTag: '#agendamento',
        triggerKeywords: ['agendar', 'marcar', 'horario', 'data', 'doutor', 'cardiologista', 'ortopedista', 'pediatra', 'dermatologista'],
        mode: 'curl',
        isOptional: false,
        enabled: true,
        colorTheme: 'blue',
        rawCurl: `curl -X POST https://app.genier.ai/api/agent/agendamento_clinica \\
  -H "Authorization: Bearer SEU_TOKEN_AGENDAMENTO" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "{{message}}",
    "history": {{history}},
    "session_id": "{{sessionId}}"
  }'`,
        parsedCurl: {
          url: 'https://app.genier.ai/api/agent/agendamento_clinica',
          method: 'POST',
          headers: {
            'Authorization': 'Bearer SEU_TOKEN_AGENDAMENTO',
            'Content-Type': 'application/json'
          },
          body: `{\n  "query": "{{message}}",\n  "history": {{history}},\n  "session_id": "{{sessionId}}"\n}`
        },
        customResponsePath: 'output_text',
        agentSpecJson: JSON.stringify({
          name: "Agente de Agendamento de Consultas",
          description: "Consulta grades médicas, horários livres por profissional e confirma agendamentos no prontuário eletrônico.",
          tag: "#agendamento",
          instructions: `Você é o especialista em agendamentos da Clínica.
1. Pergunte a especialidade ou o nome do médico desejado.
2. Apresente os próximos 3 horários disponíveis.
3. Ao confirmar, envie os detalhes (Data, Hora, Médico, Sala) e orientações de chegada com 15 min de antecedência.`,
          tools: [
            {
              name: "listar_horarios_disponiveis",
              description: "Retorna slots livres por médico/especialidade e data.",
              args: { especialidade: "str", data_inicio: "str" }
            },
            {
              name: "confirmar_agendamento",
              description: "Grava o agendamento no sistema.",
              args: { paciente_id: "str", slot_id: "str" }
            }
          ]
        }, null, 2),
        contextStrategy: 'full_history',
        handoffPromptTemplate: 'Transbordo para agendamento. Paciente: {{customerName}} | Especialidade desejada: "{{lastAgentMessage}}"',
        initialMessage: 'Olá! Sou o assistente de agendamentos. Qual especialidade médica ou profissional você deseja consultar?'
      },
      {
        id: 'agent-financeiro-saude',
        name: 'Convênios & Faturamento',
        role: 'Autorização de Guias, Tabela Particular e Cobertura de Planos de Saúde',
        triggerTag: '#financeiro_saude',
        triggerKeywords: ['convenio', 'unimed', 'bradesco', 'sulamerica', 'particular', 'preco', 'valor', 'guia', 'autorizacao', 'pagar'],
        mode: 'curl',
        isOptional: true,
        enabled: true,
        colorTheme: 'emerald',
        rawCurl: `curl -X POST https://app.genier.ai/api/agent/financeiro_clinica \\
  -H "Authorization: Bearer SEU_TOKEN_FINANCEIRO" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "{{message}}",
    "history": {{history}},
    "session_id": "{{sessionId}}"
  }'`,
        parsedCurl: {
          url: 'https://app.genier.ai/api/agent/financeiro_clinica',
          method: 'POST',
          headers: {
            'Authorization': 'Bearer SEU_TOKEN_FINANCEIRO',
            'Content-Type': 'application/json'
          },
          body: `{\n  "query": "{{message}}",\n  "history": {{history}},\n  "session_id": "{{sessionId}}"\n}`
        },
        customResponsePath: 'output_text',
        agentSpecJson: JSON.stringify({
          name: "Agente Financeiro & Convênios",
          description: "Verifica cobertura de planos de saúde, valores de consultas particulares e orientações sobre guias TISS.",
          tag: "#financeiro_saude",
          instructions: `Você cuida do setor financeiro e convênios da clínica.
1. Valide se o plano de saúde e categoria atendem a especialidade requerida.
2. Informe formas de pagamento aceitas (PIX, Cartão, Boleto) e regras de nota fiscal/reembolso.`,
          tools: []
        }, null, 2),
        contextStrategy: 'full_history',
        handoffPromptTemplate: 'Dúvida financeira/convênio: {{customerName}} | Mensagem: "{{lastAgentMessage}}"',
        initialMessage: 'Olá! Posso te informar sobre convênios aceitos, valores de consultas particulares e autorização de guias. Como posso ajudar?'
      },
      {
        id: 'agent-exames-saude',
        name: 'Exames & Laudos',
        role: 'Preparo de Exames, Coleta Laboratorial e Envio de Laudos em PDF',
        triggerTag: '#exames',
        triggerKeywords: ['exame', 'resultado', 'laudo', 'preparo', 'jejum', 'sangue', 'ressonancia', 'ultrassom', 'raio x'],
        mode: 'curl',
        isOptional: true,
        enabled: true,
        colorTheme: 'purple',
        rawCurl: `curl -X POST https://app.genier.ai/api/agent/exames_clinica \\
  -H "Authorization: Bearer SEU_TOKEN_EXAMES" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "{{message}}",
    "history": {{history}},
    "session_id": "{{sessionId}}"
  }'`,
        parsedCurl: {
          url: 'https://app.genier.ai/api/agent/exames_clinica',
          method: 'POST',
          headers: {
            'Authorization': 'Bearer SEU_TOKEN_EXAMES',
            'Content-Type': 'application/json'
          },
          body: `{\n  "query": "{{message}}",\n  "history": {{history}},\n  "session_id": "{{sessionId}}"\n}`
        },
        customResponsePath: 'output_text',
        agentSpecJson: JSON.stringify({
          name: "Agente de Exames & Laudos",
          description: "Orientações sobre tempo de jejum, restrições e disponibilização de links seguros para download de laudos.",
          tag: "#exames",
          instructions: `Você é o assistente do setor de Exames e Diagnósticos.
1. Informe instruções detalhadas de preparo (tempo de jejum, suspensão de medicamentos se aplicável).
2. Forneça o status de liberação do laudo médico.`,
          tools: []
        }, null, 2),
        contextStrategy: 'full_history',
        handoffPromptTemplate: 'Solicitação de exames/laudos: {{customerName}} | Mensagem: "{{lastAgentMessage}}"',
        initialMessage: 'Olá! Sou o assistente de exames e laudos. Deseja consultar instruções de preparo ou verificar o resultado de algum exame?'
      }
    ]
  },
  {
    id: 'ecommerce_varejo',
    name: 'E-Commerce & Varejo',
    niche: 'Varejo / Lojas Virtuais / SAC',
    badge: '🛍️ E-COMMERCE & SAC (4 AGENTES)',
    description: 'Pipeline de atendimento para lojas online: SAC Triagem, Rastreamento de Pedidos, Trocas/Devoluções e Televendas/Ofertas.',
    subAgents: [
      {
        id: 'agent-sac-ecommerce',
        name: 'SAC & Triagem Geral',
        role: 'Identificação por CPF/Pedido e Encaminhamento Inteligente',
        triggerTag: '#sac',
        triggerKeywords: ['ola', 'oi', 'pedido', 'ajuda', 'comprar', 'duvida', 'atendimento'],
        mode: 'curl',
        isOptional: false,
        enabled: true,
        colorTheme: 'blue',
        rawCurl: `curl -X POST https://app.genier.ai/api/agent/sac_ecommerce \\
  -H "Authorization: Bearer SEU_TOKEN_SAC" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "{{message}}",
    "history": {{history}},
    "session_id": "{{sessionId}}"
  }'`,
        parsedCurl: {
          url: 'https://app.genier.ai/api/agent/sac_ecommerce',
          method: 'POST',
          headers: {
            'Authorization': 'Bearer SEU_TOKEN_SAC',
            'Content-Type': 'application/json'
          },
          body: `{\n  "query": "{{message}}",\n  "history": {{history}},\n  "session_id": "{{sessionId}}"\n}`
        },
        customResponsePath: 'output_text',
        agentSpecJson: JSON.stringify({
          name: "Agente SAC - E-Commerce",
          description: "Primeiro contato para clientes de e-commerce. Identifica o número do pedido ou CPF e encaminha.",
          tag: "#sac",
          instructions: `Você é o atendente do SAC do e-commerce.
1. Solicite o número do pedido ou CPF do comprador.
2. Identifique se o cliente precisa de:
   - Rastreio / Onde está meu pedido -> Transborde com #rastreio
   - Troca, devolução ou estorno -> Transborde com #trocas
   - Dúvidas sobre produtos, cupons ou compras -> Transborde com #vendas_ecommerce`,
          tools: []
        }, null, 2),
        contextStrategy: 'full_history',
        handoffPromptTemplate: 'Cliente SAC: {{customerName}} | Pedido: {{contractId}} | Solicitação: "{{lastAgentMessage}}"',
        initialMessage: 'Olá! Sou o atendente virtual da nossa loja online. Por favor, me informe o número do seu pedido ou seu CPF para começarmos.'
      },
      {
        id: 'agent-rastreio-ecommerce',
        name: 'Rastreamento & Entregas',
        role: 'Status de Envio na Transportadora, Código de Rastreio e Prazos',
        triggerTag: '#rastreio',
        triggerKeywords: ['rastreio', 'rastrear', 'onde esta', 'transportadora', 'correios', 'entrega', 'atraso', 'chegar'],
        mode: 'curl',
        isOptional: false,
        enabled: true,
        colorTheme: 'emerald',
        rawCurl: `curl -X POST https://app.genier.ai/api/agent/rastreio_ecommerce \\
  -H "Authorization: Bearer SEU_TOKEN_RASTREIO" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "{{message}}",
    "history": {{history}},
    "session_id": "{{sessionId}}"
  }'`,
        parsedCurl: {
          url: 'https://app.genier.ai/api/agent/rastreio_ecommerce',
          method: 'POST',
          headers: {
            'Authorization': 'Bearer SEU_TOKEN_RASTREIO',
            'Content-Type': 'application/json'
          },
          body: `{\n  "query": "{{message}}",\n  "history": {{history}},\n  "session_id": "{{sessionId}}"\n}`
        },
        customResponsePath: 'output_text',
        agentSpecJson: JSON.stringify({
          name: "Agente de Rastreamento de Pedidos",
          description: "Consulta a API da transportadora e informa o status do envio com data estimada de entrega.",
          tag: "#rastreio",
          instructions: `Você rastreia pacotes e entregas.
1. Localize os dados de rastreio pelo código do pedido.
2. Informe o último evento da transportadora e a previsão de entrega.`,
          tools: []
        }, null, 2),
        contextStrategy: 'full_history',
        handoffPromptTemplate: 'Rastreio do pedido: {{contractId}} | Cliente: {{customerName}}',
        initialMessage: 'Olá! Sou o especialista de Entregas e Rastreamento. Qual é o número do pedido que você deseja rastrear?'
      },
      {
        id: 'agent-trocas-ecommerce',
        name: 'Trocas & Devoluções',
        role: 'Geração de Código de Postagem Reversa, Estornos e Política de Troca',
        triggerTag: '#trocas',
        triggerKeywords: ['troca', 'trocar', 'devolver', 'devolucao', 'estorno', 'reembolso', 'defeito', 'arrepender', 'tamanho'],
        mode: 'curl',
        isOptional: true,
        enabled: true,
        colorTheme: 'purple',
        rawCurl: `curl -X POST https://app.genier.ai/api/agent/trocas_ecommerce \\
  -H "Authorization: Bearer SEU_TOKEN_TROCAS" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "{{message}}",
    "history": {{history}},
    "session_id": "{{sessionId}}"
  }'`,
        parsedCurl: {
          url: 'https://app.genier.ai/api/agent/trocas_ecommerce',
          method: 'POST',
          headers: {
            'Authorization': 'Bearer SEU_TOKEN_TROCAS',
            'Content-Type': 'application/json'
          },
          body: `{\n  "query": "{{message}}",\n  "history": {{history}},\n  "session_id": "{{sessionId}}"\n}`
        },
        customResponsePath: 'output_text',
        agentSpecJson: JSON.stringify({
          name: "Agente de Trocas e Devoluções",
          description: "Gera autorização de postagem reversa nos Correios e orienta sobre prazos de estorno e vale-compras.",
          tag: "#trocas",
          instructions: `Você gerencia trocas e devoluções.
1. Verifique se o pedido está dentro do prazo legal (7 dias para arrependimento, 30/90 para defeito).
2. Colete o motivo da troca e gere a autorização de logística reversa.`,
          tools: []
        }, null, 2),
        contextStrategy: 'full_history',
        handoffPromptTemplate: 'Troca/Devolução solicitada para pedido: {{contractId}} | Motivo: "{{lastAgentMessage}}"',
        initialMessage: 'Olá! Posso te auxiliar com a troca ou devolução de um produto. Qual o item e o motivo da solicitação?'
      },
      {
        id: 'agent-vendas-ecommerce',
        name: 'Vendas & Recomendações',
        role: 'Sugestão de Produtos, Cupons Promocionais e Auxílio no Checkout',
        triggerTag: '#vendas_ecommerce',
        triggerKeywords: ['comprar', 'cupom', 'desconto', 'oferta', 'preco', 'parcelamento', 'recomendacao', 'carrinho'],
        mode: 'curl',
        isOptional: true,
        enabled: true,
        colorTheme: 'amber',
        rawCurl: `curl -X POST https://app.genier.ai/api/agent/vendas_ecommerce \\
  -H "Authorization: Bearer SEU_TOKEN_VENDAS" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "{{message}}",
    "history": {{history}},
    "session_id": "{{sessionId}}"
  }'`,
        parsedCurl: {
          url: 'https://app.genier.ai/api/agent/vendas_ecommerce',
          method: 'POST',
          headers: {
            'Authorization': 'Bearer SEU_TOKEN_VENDAS',
            'Content-Type': 'application/json'
          },
          body: `{\n  "query": "{{message}}",\n  "history": {{history}},\n  "session_id": "{{sessionId}}"\n}`
        },
        customResponsePath: 'output_text',
        agentSpecJson: JSON.stringify({
          name: "Agente de Vendas e Ofertas - E-Commerce",
          description: "Consultor de compras virtual, recomenda produtos relacionados e fornece cupons de desconto válidos.",
          tag: "#vendas_ecommerce",
          instructions: `Você é o consultor de compras virtual da loja.
1. Ajude o cliente a encontrar o produto ideal conforme sua necessidade.
2. Informe promoções vigentes e cupons de primeira compra.`,
          tools: []
        }, null, 2),
        contextStrategy: 'full_history',
        handoffPromptTemplate: 'Interesse de compra/oferta: {{customerName}} | Mensagem: "{{lastAgentMessage}}"',
        initialMessage: 'Olá! Sou o consultor de compras da loja. Estou aqui para te indicar os melhores produtos, tamanhos e cupons de desconto exclusivos!'
      }
    ]
  },
  {
    id: 'b2b_saas',
    name: 'B2B SaaS & Software',
    niche: 'Software / Tecnologia / SaaS B2B',
    badge: '🚀 B2B SAAS (4 AGENTES)',
    description: 'Pipeline empresarial para plataformas SaaS: Triagem & Qualificação SDR, Demonstração & Especialista de Produto, Suporte Técnico/Onboarding/API e Faturamento/Planos/Enterprise.',
    subAgents: [
      {
        id: 'agent-triagem-saas',
        name: 'SDR & Qualificação de Leads',
        role: 'Triagem B2B, Identificação de Perfil (ICP) e Roteamento Estratégico',
        triggerTag: '#triagem_saas',
        triggerKeywords: ['ola', 'oi', 'software', 'saas', 'plataforma', 'demonstracao', 'suporte', 'duvida', 'inicio'],
        mode: 'curl',
        isOptional: false,
        enabled: true,
        colorTheme: 'blue',
        rawCurl: `curl -X POST https://app.genier.ai/api/agent/triagem_saas \\
  -H "Authorization: Bearer SEU_TOKEN_SAAS" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "{{message}}",
    "history": {{history}},
    "session_id": "{{sessionId}}",
    "company_domain": "{{companyDomain}}"
  }'`,
        parsedCurl: {
          url: 'https://app.genier.ai/api/agent/triagem_saas',
          method: 'POST',
          headers: {
            'Authorization': 'Bearer SEU_TOKEN_SAAS',
            'Content-Type': 'application/json'
          },
          body: `{\n  "query": "{{message}}",\n  "history": {{history}},\n  "session_id": "{{sessionId}}",\n  "company_domain": "{{companyDomain}}"\n}`
        },
        customResponsePath: 'output_text',
        agentSpecJson: JSON.stringify({
          name: "Agente SDR & Qualificação B2B",
          description: "Primeiro contato para leads e clientes corporativos de SaaS. Qualifica tamanho da empresa, dor principal e encaminha.",
          tag: "#triagem_saas",
          instructions: `Você é a especialista em Pré-Vendas e Triagem SDR da plataforma SaaS.
Suas responsabilidades:
1. Cumprimente o contato cordialmente e pergunte o nome da empresa e o cargo do solicitante.
2. Identifique o objetivo do contato:
   - Interesse em conhecer o software, ver uma demonstração ou agendar reunião -> Transborde com #demo_saas
   - Dúvidas técnicas sobre integração de API, bugs, webhooks ou onboarding -> Transborde com #suporte_saas
   - Assuntos de faturamento, upgrade de plano, cotação Enterprise ou notas fiscais -> Transborde com #planos_saas
3. Mantenha tom profissional, ágil e consultivo.`,
          tools: [
            {
              name: "consultar_lead_crm",
              description: "Verifica se a empresa ou contato já existe no CRM da plataforma.",
              args: { email_ou_dominio: "str" }
            }
          ]
        }, null, 2),
        contextStrategy: 'full_history',
        handoffPromptTemplate: 'Lead B2B qualificado: {{customerName}} | Empresa: {{companyDomain}} | Objetivo: "{{lastAgentMessage}}"',
        initialMessage: 'Olá! Sou o assistente de atendimento da nossa plataforma SaaS. Para direcionarmos você ao especialista ideal, qual o nome da sua empresa e como podemos te ajudar hoje?'
      },
      {
        id: 'agent-demo-saas',
        name: 'Especialista de Produto & Demo',
        role: 'Demonstrações de Software, Apresentação de Casos de Sucesso e Agendamento Executivo',
        triggerTag: '#demo_saas',
        triggerKeywords: ['demo', 'demonstracao', 'apresentacao', 'agendar demo', 'reuniao', 'comercial', 'contratar', 'funcionalidades'],
        mode: 'curl',
        isOptional: false,
        enabled: true,
        colorTheme: 'purple',
        rawCurl: `curl -X POST https://app.genier.ai/api/agent/demo_saas \\
  -H "Authorization: Bearer SEU_TOKEN_DEMO" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "{{message}}",
    "history": {{history}},
    "session_id": "{{sessionId}}"
  }'`,
        parsedCurl: {
          url: 'https://app.genier.ai/api/agent/demo_saas',
          method: 'POST',
          headers: {
            'Authorization': 'Bearer SEU_TOKEN_DEMO',
            'Content-Type': 'application/json'
          },
          body: `{\n  "query": "{{message}}",\n  "history": {{history}},\n  "session_id": "{{sessionId}}"\n}`
        },
        customResponsePath: 'output_text',
        agentSpecJson: JSON.stringify({
          name: "Agente Especialista de Produto & Demo",
          description: "Apresenta recursos de ponta, ROI, casos de uso setoriais e agenda sessões de demonstração ao vivo.",
          tag: "#demo_saas",
          instructions: `Você é o Solution Architect e Especialista de Produto do SaaS.
1. Explique como a plataforma resolve as dores de produtividade, automação e integração do lead.
2. Destaque os diferenciais competitivos: alta disponibilidade (99.9%), segurança SOC2 e APIs abertas.
3. Ofereça opções de datas e horários para uma demonstração guiada de 30 minutos com um Account Executive.`,
          tools: [
            {
              name: "agendar_demo_calendly",
              description: "Agenda reunião de demonstração no calendário do time de vendas.",
              args: { email: "str", data_hora: "str", empresa: "str" }
            }
          ]
        }, null, 2),
        contextStrategy: 'full_history',
        handoffPromptTemplate: 'Transbordo para Demonstração de Produto. Lead: {{customerName}} | Necessidade: "{{lastAgentMessage}}"',
        initialMessage: 'Olá! Sou o especialista de produto da plataforma. Posso te apresentar nossas ferramentas de automação, fluxos inteligentes e agendar uma demonstração personalizada. Quais desafios sua equipe quer solucionar?'
      },
      {
        id: 'agent-suporte-saas',
        name: 'Suporte Técnico & Onboarding / CS',
        role: 'Atendimento de APIs, Webhooks, Resolução de Incidentes e Abertura de Tickets',
        triggerTag: '#suporte_saas',
        triggerKeywords: ['suporte', 'bug', 'erro', 'api', 'webhook', 'integracao', 'onboarding', 'token', 'login', 'documentacao'],
        mode: 'curl',
        isOptional: false,
        enabled: true,
        colorTheme: 'cyan',
        rawCurl: `curl -X POST https://app.genier.ai/api/agent/suporte_saas \\
  -H "Authorization: Bearer SEU_TOKEN_SUPORTE_SAAS" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "{{message}}",
    "history": {{history}},
    "session_id": "{{sessionId}}"
  }'`,
        parsedCurl: {
          url: 'https://app.genier.ai/api/agent/suporte_saas',
          method: 'POST',
          headers: {
            'Authorization': 'Bearer SEU_TOKEN_SUPORTE_SAAS',
            'Content-Type': 'application/json'
          },
          body: `{\n  "query": "{{message}}",\n  "history": {{history}},\n  "session_id": "{{sessionId}}"\n}`
        },
        customResponsePath: 'output_text',
        agentSpecJson: JSON.stringify({
          name: "Agente de Suporte Técnico & CS - SaaS",
          description: "Diagnóstico de falhas em integrações REST/GraphQL, autenticação JWT/OAuth e abertura de chamados no Jira/Zendesk.",
          tag: "#suporte_saas",
          instructions: `Você é o Engenheiro de Suporte e Customer Success do SaaS.
1. Ajude o usuário a diagnosticar erros de chamada de API (401, 403, 429 rate limit, 500).
2. Forneça trechos de código e links para a documentação técnica oficial.
3. Se for um bug crítico ou necessidade de análise de logs, crie um ticket de suporte via ferramenta 'abrir_ticket_suporte'.`,
          tools: [
            {
              name: "abrir_ticket_suporte",
              description: "Abre chamado técnico no Jira Service Management.",
              args: { empresa_id: "str", titulo: "str", severidade: "str", descricao: "str" }
            }
          ]
        }, null, 2),
        contextStrategy: 'full_history',
        handoffPromptTemplate: 'Solicitação técnica SaaS: {{customerName}} | Sintoma: "{{lastAgentMessage}}"',
        initialMessage: 'Olá! Sou o engenheiro de suporte técnico e CS. Qual comportamento ou dúvida de integração/uso da plataforma você está enfrentando?'
      },
      {
        id: 'agent-planos-saas',
        name: 'Faturamento, Planos & Upgrade',
        role: 'Gestão de Assinaturas, Adição de Licenças (Seats), Notas Fiscais e Cotações Enterprise',
        triggerTag: '#planos_saas',
        triggerKeywords: ['plano', 'planos', 'preco', 'upgrade', 'faturamento', 'nota fiscal', 'cartao', 'enterprise', 'assinatura', 'seats'],
        mode: 'curl',
        isOptional: true,
        enabled: true,
        colorTheme: 'emerald',
        rawCurl: `curl -X POST https://app.genier.ai/api/agent/faturamento_saas \\
  -H "Authorization: Bearer SEU_TOKEN_BILLING" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "{{message}}",
    "history": {{history}},
    "session_id": "{{sessionId}}"
  }'`,
        parsedCurl: {
          url: 'https://app.genier.ai/api/agent/faturamento_saas',
          method: 'POST',
          headers: {
            'Authorization': 'Bearer SEU_TOKEN_BILLING',
            'Content-Type': 'application/json'
          },
          body: `{\n  "query": "{{message}}",\n  "history": {{history}},\n  "session_id": "{{sessionId}}"\n}`
        },
        customResponsePath: 'output_text',
        agentSpecJson: JSON.stringify({
          name: "Agente de Faturamento & Planos SaaS",
          description: "Calcula precificação por volume de usuários, emite links de pagamento Stripe e gera propostas de planos Enterprise.",
          tag: "#planos_saas",
          instructions: `Você gerencia o Faturamento e Assinaturas do SaaS.
1. Explique as diferenças entre os planos:
   - Starter: Até 5 usuários, recursos essenciais (R$ 299/mês)
   - Growth: Até 25 usuários, automações avançadas e suporte prioritário (R$ 799/mês)
   - Enterprise: Usuários ilimitados, SLA 99.9%, SSO SAML e gerente de contas dedicado (Cotação sob medida)
2. Para clientes ativos, calcule o valor pró-rata de novas licenças ou upgrade anual com 20% de desconto.`,
          tools: [
            {
              name: "gerar_link_pagamento_stripe",
              description: "Gera link de checkout seguro no Stripe para upgrade de plano.",
              args: { plano: "str", periodicidade: "str", quantidade_seats: "int" }
            }
          ]
        }, null, 2),
        contextStrategy: 'full_history',
        handoffPromptTemplate: 'Demanda de faturamento/planos: {{customerName}} | Detalhes: "{{lastAgentMessage}}"',
        initialMessage: 'Olá! Sou o especialista de Faturamento e Assinaturas. Posso te orientar sobre nossos planos, cálculo de licenças adicionais ou emissão de faturas e notas fiscais. Como posso ajudar?'
      }
    ]
  }
];

export const getDefaultMultiAgentPipeline = (templateId: string = 'isp_provedor'): MultiAgentPipelineConfig => {
  const template = MULTI_AGENT_NICHE_TEMPLATES.find(t => t.id === templateId) || MULTI_AGENT_NICHE_TEMPLATES[0];

  const clonedSubAgents = JSON.parse(JSON.stringify(template.subAgents));

  return {
    enabled: true,
    autoHandoff: true,
    activeAgentId: clonedSubAgents[0]?.id || 'agent-triagem-isp',
    subAgents: clonedSubAgents,
    handoffEvents: []
  };
};
