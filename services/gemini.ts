
import { GoogleGenAI, Type } from "@google/genai";

export const synthesizeFeedback = async (
  studentName: string,
  feedbacks: string[],
  previousReport?: string,
  monitorInstructions?: string,
  currentReportText?: string
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelName = 'gemini-3-flash-preview';
  
  let prompt = `
    Aja como um especialista em recursos humanos.
    Sintetize os feedbacks do aluno(a) ${studentName}.
    Feedbacks: ${feedbacks.join(' | ')}
    Relatório Anterior: ${previousReport || 'Nenhum'}
  `;

  if (monitorInstructions && currentReportText) {
    prompt += `
      O monitor pedagógico solicitou um ajuste no relatório atual.
      RELATÓRIO ATUAL: ${currentReportText}
      INSTRUÇÕES DE AJUSTE: ${monitorInstructions}
      Use os feedbacks originais e estas novas instruções para re-escrever o relatório de forma mais precisa.
    `;
  }

  prompt += `Retorne JSON: "summary" e "evolution_analysis".`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            evolution_analysis: { type: Type.STRING }
          },
          required: ["summary", "evolution_analysis"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    return { summary: "Erro na síntese.", evolution_analysis: "Indisponível." };
  }
};

export const synthesizeCourseAnalysis = async (
  roundName: string,
  allComments: string[]
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelName = 'gemini-3-flash-preview';
  
  const prompt = `
    Aja como um Coordenador Pedagógico.
    Analise os comentários dos alunos sobre a rodada/semana "${roundName}".
    Comentários: ${allComments.join(' | ')}
    Identifique temas recorrentes, pontos de fricção e sugestões.
    Retorne JSON com o campo: "analysis_summary".
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis_summary: { type: Type.STRING }
          },
          required: ["analysis_summary"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error: any) {
    throw error;
  }
};

export const synthesizeTrajectory = async (
  studentName: string,
  historicalReports: string[]
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelName = 'gemini-3-pro-preview';
  
  const prompt = `
    Aja como um Mentor de Carreira Sênior.
    Analise a trajetória do aluno(a) ${studentName} baseada nestes relatórios de sprints passadas:
    ${historicalReports.map((r, i) => `Sprint ${i+1}: ${r}`).join('\n\n')}
    Diretrizes de conteúdo:
    1. Não assuma cargo, função ou área de atuação do aluno a menos que explicitamente mencionado nos relatórios.
    2. Padrões de Desempenho: Identifique recorrências no comportamento técnico e comportamental (soft skills).
    3. Evidências de Evolução: Destaque o progresso entre as Sprints selecionadas, focando em ganhos de autonomia e complexidade.
    4. Veredito Analítico: Aponte pontos fortes consolidados e áreas que demandam atenção ou supervisão inicial.
    5.Tom: Profissional, imparcial e analítico. Evite linguagem motivacional voltada ao aluno; o foco é fornecer insights para uma tomada de decisão de contratação.
    Diretrizes de formatação e saída:
    1. O retorno deve ser exclusivamente um objeto JSON com o campo: "trajectory_summary".
    2. O valor de "trajectory_summary" deve ser uma string contendo o relatório completo formatado em HTML (use tags <h2>, <h3>, <p>, <ul>, <li>, <strong>).
    3. PROIBIÇÃO: Não inclua saudações, introduções ("Aqui está o relatório...") ou qualquer texto fora do objeto JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            trajectory_summary: { type: Type.STRING }
          },
          required: ["trajectory_summary"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    return { trajectory_summary: "Não foi possível consolidar a trajetória." };
  }
};

export const synthesizeMonitorFeedback = async (
  monitorName: string,
  feedbacks: string[]
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelName = 'gemini-3-flash-preview';
  const prompt = `Consolide feedbacks para o monitor ${monitorName}: ${feedbacks.join(' | ')}. Retorne JSON: "summary".`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: { summary: { type: Type.STRING } },
          required: ["summary"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    return { summary: "Erro." };
  }
};
