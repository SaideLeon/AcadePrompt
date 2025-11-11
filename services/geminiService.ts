import { GoogleGenAI } from "@google/genai";

// Instancia o cliente GoogleGenAI uma vez com a chave do ambiente.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
const model = "gemini-2.5-flash";

// Manipulador de erro genérico para chamadas da API Gemini.
const handleGeminiError = (error: unknown): never => {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error && (error.message.includes('API key not valid') || error.message.includes('permission is required'))) {
        throw new Error("A chave de API fornecida é inválida ou não tem as permissões necessárias.");
    }
    throw new Error("Não foi possível se comunicar com a API do Gemini. Verifique o console para mais detalhes.");
};

const academicSystemPrompt = (instructions: string) => `
    Você é um especialista em engenharia de prompts, especializado em transformar instruções acadêmicas em prompts detalhados e eficazes para modelos de IA. Sua tarefa é pegar as seguintes instruções brutas de um trabalho de estudante e convertê-las em um prompt bem estruturado que uma IA possa usar para gerar uma resposta de alta qualidade.

    O prompt gerado deve seguir estritamente esta estrutura:
    
    **1. Persona:** Defina o papel que a IA deve assumir (por exemplo, "Aja como um estudante universitário de história do Brasil, com conhecimento aprofundado no período colonial.").
    
    **2. Objetivo Principal:** Descreva o objetivo central do trabalho de forma clara e concisa.
    
    **3. Tarefas/Etapas Detalhadas:** Divida a tarefa principal em uma lista numerada de subtarefas ou etapas lógicas que a IA deve seguir para construir a resposta. Seja o mais específico possível.
    
    **4. Formato de Saída:** Especifique o formato exato da saída (por exemplo, "ensaio dissertativo-argumentativo", "relatório técnico", "código Python comentado", "apresentação de slides em formato de tópicos").
    
    **5. Restrições e Requisitos:** Liste todas as restrições e requisitos obrigatórios mencionados nas instruções originais, como contagem de palavras, número de fontes, estilo de citação (ABNT, APA), tópicos a serem evitados, etc.
    
    **6. Exemplo/Estrutura de Saída (se aplicável):** Se for útil, forneça um esqueleto ou um breve exemplo de como a saída deve ser estruturada.

    ---
    INSTRUÇÕES BRUTAS DO ESTUDANTE:
    ---
    ${instructions}
    ---

    Agora, gere o prompt estruturado com base nessas instruções. Responda apenas com o prompt gerado.
  `;

export async function generateEnhancedPrompt(instructions: string): Promise<string> {
  try {
      const response = await ai.models.generateContent({
          model,
          contents: academicSystemPrompt(instructions)
      });
      return response.text;
  } catch (error) {
      handleGeminiError(error);
  }
}

export async function* generateEnhancedPromptStream(instructions: string): AsyncGenerator<string> {
    try {
        const responseStream = await ai.models.generateContentStream({
            model,
            contents: academicSystemPrompt(instructions)
        });
        for await (const chunk of responseStream) {
            yield chunk.text;
        }
    } catch (error) {
        handleGeminiError(error);
    }
}


export async function generateUniversalImageStylePrompt(base64Image: string, mimeType: string): Promise<string> {
    const systemPrompt = `
    Você é um especialista em engenharia de prompts para edição de imagens com IA. Sua tarefa é analisar a imagem fornecida e criar um "prompt de estilo universal" que possa ser aplicado a *outra* imagem de retrato para replicar o estilo, a iluminação e a atmosfera da imagem original.

    **Instruções Cruciais:**
    1.  **NÃO descreva a pessoa:** Ignore completamente o gênero, raça, idade ou identidade específica do sujeito na imagem. O prompt deve ser universal.
    2.  **FOQUE nos elementos transferíveis:** Extraia apenas as características estilísticas, técnicas e de composição que podem ser aplicadas a qualquer outro retrato.
    3.  **Estruture a saída:** Organize o prompt gerado em seções claras para que seja fácil de entender e usar.

    Analise a imagem e gere um prompt com a seguinte estrutura:

    **Título:** Prompt de Estilo para Retrato

    **1. Ação Principal:**
    - "Melhore a imagem existente aplicando a seguinte estética, mantendo o sujeito e a composição geral."

    **2. Estilo e Qualidade Visual:**
    - Descreva o estilo geral (ex: fotorrealista, cinematográfico, pintura a óleo).
    - Mencione a qualidade (ex: alta resolução, 8k, detalhes nítidos).

    **3. Composição e Pose:**
    - Descreva o enquadramento (ex: close-up mediano, retrato de busto).
    - Descreva a pose de forma genérica, se for um elemento chave do estilo (ex: "Ajuste a pose para uma expressão contemplativa, com uma mão apoiada suavemente no queixo.").

    **4. Iluminação e Atmosfera:**
    - Detalhe o esquema de iluminação (ex: iluminação de estúdio low key, luz natural suave, Rembrandt).
    - Especifique a direção e a qualidade da luz principal (ex: "luz suave vinda de cima e da esquerda").
    - Descreva a atmosfera geral (ex: dramática, serena, energética, introspectiva).

    **5. Fundo (Background):**
    - Descreva o fundo de forma que possa ser recriado (ex: "Substitua o fundo por um preto sólido e liso para criar contraste.").

    **6. Paleta de Cores e Tonalidade:**
    - Descreva a paleta de cores predominante (ex: tons quentes e terrosos, cores dessaturadas, preto e branco com alto contraste).

    **7. Detalhes Finos a Replicar:**
    - Mencione detalhes importantes (ex: "Garanta reflexos sutis e vivos nos olhos", "Realce a textura dos tecidos da roupa", "Mantenha a nitidez nos detalhes da pele e do cabelo.").

    Responda APENAS com o prompt de estilo universal gerado, sem explicações adicionais.
    `;
  
    try {
      const imagePart = {
        inlineData: {
          mimeType: mimeType,
          data: base64Image,
        },
      };
      const textPart = {
        text: systemPrompt
      };
  
      const response = await ai.models.generateContent({
        model,
        contents: { parts: [imagePart, textPart] },
      });
      return response.text;
    } catch (error) {
        handleGeminiError(error);
    }
}

const optimizerSystemPrompt = (instruction: string) => `
    Você é um especialista em engenharia de prompts para modelos de linguagem (LLMs). Sua função é pegar uma instrução vaga ou simples de um usuário e transformá-la em um prompt robusto, claro e detalhado, garantindo que a IA produza uma resposta de alta qualidade e alinhada com a intenção do usuário.

    A instrução do usuário é: "${instruction}"

    Agora, otimize e expanda essa instrução em um prompt bem estruturado, usando as seguintes seções:

    **1. Contexto e Persona:** Defina um papel específico para a IA assumir e o contexto da tarefa. (Ex: "Aja como um gerente de marketing sênior preparando um email para o lançamento de um novo produto.").

    **2. Objetivo Final:** Qual é o resultado principal e mensurável que se espera da IA? (Ex: "O objetivo é gerar um texto de email persuasivo que incentive os clientes a clicarem no link de 'saiba mais'.").

    **3. Passos e Requisitos:** Detalhe as etapas que a IA deve seguir ou os elementos que devem ser incluídos na resposta. Use uma lista numerada para clareza. (Ex: "1. Comece com uma linha de assunto cativante. 2. Apresente o problema que o produto resolve. 3. Descreva os 3 principais benefícios do produto. 4. Inclua um call-to-action claro.").

    **4. Tom e Estilo:** Especifique o tom de voz e o estilo de escrita. (Ex: "O tom deve ser profissional, mas entusiasmado e amigável. Use linguagem simples e direta.").

    **5. Formato de Saída:** Descreva como a resposta final deve ser formatada. (Ex: "A saída deve ser um único bloco de texto de email, com no máximo 200 palavras.").
    
    Responda apenas com o prompt otimizado.
`;

export async function generateOptimizedInstruction(instruction: string): Promise<string> {
    try {
        const response = await ai.models.generateContent({
            model,
            contents: optimizerSystemPrompt(instruction)
        });
        return response.text;
    } catch (error) {
        handleGeminiError(error);
    }
}

export async function* generateOptimizedInstructionStream(instruction: string): AsyncGenerator<string> {
    try {
        const responseStream = await ai.models.generateContentStream({
            model,
            contents: optimizerSystemPrompt(instruction)
        });
        for await (const chunk of responseStream) {
            yield chunk.text;
        }
    } catch (error) {
        handleGeminiError(error);
    }
}
