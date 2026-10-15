# Plano de Implementação: Conversão Resiliente de Total.js para Workflows e Agente Fortics

## 1. Visão Geral & Análise do Problema
Ao tentar converter o fluxo Total.js FlowStream (que possui 12 operações/rotas distintas), o sistema acionou o erro:
> *"A IA gerou uma resposta que não pôde ser convertida em JSON válido."*

### Causa Raiz Identificada:
1. **Estouro de Limite de Tokens na Geração Monolítica**: Ao solicitar em um único prompt que a IA gerasse o Agente completo **mais** 12 workflows individuais em formato JSON estruturado (com nós `instructions`, `request`, múltiplos nós `rest`, scripts `code` e `route_return`), a resposta da IA excedeu a janela máxima de tokens de saída (4.096 a 8.192 tokens), resultando em corte abrupto no meio do JSON (JSON truncado).
2. **Dependência Crítica no Total.js**: O fluxo exportado do Total.js já possui endpoints reais, métodos HTTP, headers e códigos JavaScript de tratamento. Tentar fazer a IA reescrever cegamente 12 workflows de uma só vez descartava a precisão técnica nativa dos nós e sobrecarregava a inferência.
3. **Decisão Confirmada com o Usuário**:
   - **Geração**: Workflows e Agente completo usando IA.
   - **Estrutura**: Gerar **1 workflow separado para cada operação** (12 workflows individuais, cada um com sua tool cadastrada no Agente).

---

## 2. Arquitetura da Solução

### A. Divisão Inteligente da Geração (Agente + 12 Workflows Modulares)
- **Geração do Agente via IA**:
  - Prompt direcionado exclusivamente para a síntese do Agente Fortics (`agente.json`), contemplando as 12 ferramentas (`tools`), com `name`, `description`, `parameters`, `instruction.steps` sequenciais em linguagem natural e `other_rules` (regras de validação, anti-alucinação, escopo mono skill e exibição contextual no chat).
- **Construção e Enriquecimento dos 12 Workflows**:
  - Cada uma das 12 operações do Total.js é transformada em um workflow autônomo e válido para importação na plataforma Fortics.
  - Para cada operação:
    1. **Nó `instructions`**: Descrição executiva da tool, parâmetros tipados (`Args:`) e especificação de retorno (`Returns:`).
    2. **Nó `code` (Request)**: Extração padronizada com `_vars._request.body`.
    3. **Nós `rest`**: URLs, métodos, headers, query params e bodies preservados fielmente do Total.js.
    4. **Nós `code` (Tratamento)**: Lógica JavaScript de parse e filtragem (`_vars.resposta_api`), higienização de payload.
    5. **Nó `route_return`**: Resposta HTTP 200 com template Mustache `{{#tojson}}...{{/tojson}}`.
- **Salvaguarda de Resiliência (`safeExtractAndParseJson`)**:
  - Tratamento para recuperar outputs mesmo se a IA formatar com delimitadores Markdown, fences parciais ou pequenas inconsistências sintáticas.

---

## 3. Plano de Mudanças por Arquivo

### 1. `src/server/app.ts` & `api/generate.ts`
- **Otimização do Prompt para Múltiplos Workflows**:
  - Quando houver múltiplos workflows configurados (como no caso das 12 operações), o backend estrutura a geração do Agente com as 12 tools tipadas e sintetiza os 12 workflows diretamente a partir da árvore de nós do Total.js com instruções enriquecidas pela IA.
  - Garante que a resposta da API contenha:
    - `agent`: Objeto do Agente Fortics completo.
    - `workflows`: Array com os 12 workflows estruturados e prontos para uso.
    - `workflow`: Primeiro workflow como referência rápida.
- **Prevenção de Truncamento**:
  - Ajuste de `max_output_tokens` e temperatura calibrada (0.1) para evitar alucinações de formato.
  - Fallback automático e transparente: caso o provedor de IA demore ou corte a resposta, o sistema monta e entrega os 12 workflows e o agente sem nunca retornar erro 500 ao usuário.

### 2. `src/components/FlowstreamConverter.tsx`
- **Mapeamento Preciso das 12 Operações**:
  - Suporte a nós `genieragent`, `request`, rotas com prefixos e grupos do FlowStream.
  - Extração individualizada de cada rota com seus nós REST e código JavaScript associados.
  - Indicadores visuais claros para as 12 rotas identificadas, com contagem de chamadas HTTP.
- **Feedback Visual de Progresso**:
  - Exibição de progresso durante a geração das 12 operações.
  - Botão de download consolidado (`.zip` ou JSONs individuais) e importação direta para o Studio.

### 3. Validação e Testes
- Testar a importação direta do JSON fornecido (`JSON_SGP 1 (1).txt`).
- Confirmar que as 12 rotas são extraídas com precisão.
- Disparar a geração e verificar se todos os 12 workflows e o Agente são criados sem erros de sintaxe ou truncamento.
- Executar `npm run lint` e `compile_applet`.

---

## 4. Próximos Passos
Após a aprovação do plano, iniciaremos a implementação no backend e no frontend para que a conversão funcione de forma imediata e sem falhas.
