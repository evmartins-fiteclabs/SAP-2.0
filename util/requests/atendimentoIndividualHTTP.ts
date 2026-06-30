import { Agendamento, NewAgendamento } from "@/interfaces/Agendamento";
import axios from "axios";
import { createTimestamps } from "../dateUtils";
import { Atividade } from "./atividadesHTTP";

let AGENDAMENTOS: Agendamento[] = [];

const BASE_URL =
  process.env.EXPO_PUBLIC_BASE_URL + "/atividades/atendimentos-individuais";

const ATV_URL = process.env.EXPO_PUBLIC_BASE_URL + "/atividades";

// Força a string de data a usar barras limpas eliminando pontos ou hifens
const normalizeToBRDate = (dateStr: string): string => {
  let clean = dateStr.replace(/\./g, "/").replace(/-/g, "/");
  const parts = clean.split("/");
  if (parts[0].length === 4) {
    return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
  }
  return `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[2]}`;
};

export async function createAtendimento({
  atendimento,
  token,
}: {
  atendimento: NewAgendamento;
  token: string;
}) {
  try {
    const { idFuncionario, idSala, idTerapeuta, idFicha } = atendimento;
    
    const brDate = normalizeToBRDate(atendimento.data!);

    const { tempoInicio, tempoFim } = createTimestamps(
      brDate,
      atendimento.horario!
    );

    const finalData = {
      idSala,
      tempoInicio,
      tempoFim,
      statusAtividade: "PENDENTE",
      idTerapeuta,
      idFicha,
      idFuncionario,
    };

    const response = await axios.post(`${BASE_URL}/one`, finalData, {
      headers: { Authorization: "Bearer " + token },
    });
    return response.data as Agendamento;
  } catch (error: any) {
    console.log("Erro interno ao disparar createAtendimento:", error?.response?.data || error);
    throw error;
  }
}

export async function getAgendamentos({
  salaId,
  data,
  token,
}: {
  salaId: string;
  data: string;
  token: string;
}) {
  try {
    // Trata e limpa qualquer formato de data recebida (. ou /)
    const cleanDate = data.replace(/\./g, "/").replace(/-/g, "/");
    const [day, month, year] = cleanDate.split("/");
    
    const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    const url = `${ATV_URL}/many/sala-date/?uid-sala=${salaId}&date=${formattedDate}`;

    const response = await axios.get(url, {
      headers: { Authorization: "Bearer " + token },
    });
    return response.data as Atividade;
  } catch (error: any) {
    console.log("Erro na rota getBySalaAndDate no Java:", error?.response?.data || error);
    return { atendimentosGrupo: [], atendimentosIndividuais: [], encontros: [] };
  }
}

export async function getAgendamentosByFuncionario(
  funcionarioId: string,
  token: string
) {
  try {
    const response = await axios.get(`${BASE_URL}/${funcionarioId}`, {
      headers: { Authorization: "Bearer " + token },
    });
    return response.data as Agendamento[];
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function getAtendimentosByStatus(
  status: "PENDENTE" | "APROVADO" | "REPROVADO",
  token: string
) {
  try {
    const response = await axios.get(`${BASE_URL}/status/${status}`, {
      headers: { Authorization: "Bearer " + token },
    });
    return response.data as Agendamento[];
  } catch (error) {
    console.log(error);
    return [];
  }
}