import { Alert, Pressable, StyleSheet, View } from "react-native";
import StyledText from "../UI/StyledText";
import { Agendamento } from "@/interfaces/Agendamento";

import { Colors } from "@/constants/Colors";
import { memo } from "react";
import InfoBox from "../UI/InfoBox";
import Icon from "../general/Icon";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/util/queries";
import { deleteAgendamento } from "@/util/requests/atendimentoIndividualHTTP";
import { getSalaById } from "@/util/requests/salaHTTP"; // <--- Mudado para getSalaById
import useAuth from "@/hooks/useAuth";

type AtendimentoItemProps = {
  agendamento: Agendamento;
};

const AgendamentoItem = ({ agendamento }: AtendimentoItemProps) => {
  const { token } = useAuth();

  // CORREÇÃO: Usando getSalaById já que o "agendamento.idSala" é o UUID (5664c14d...)
  const { data: salaData } = useQuery({
    queryKey: ["sala", agendamento.idSala],
    enabled: !!agendamento.idSala,
    queryFn: async () => {
      try {
        const res = await getSalaById(agendamento.idSala!, token!);
        return res || null;
      } catch (error) {
        console.log("Erro ao buscar sala por ID no card:", error);
        return null;
      }
    },
  });

  const { mutate: removeAgendamento } = useMutation({
    mutationFn: deleteAgendamento,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["agendamentos"],
      });
      Alert.alert("Agendamento removido com sucesso!");
    },
  });

  function onDeleteHandler() {
    Alert.alert(
      "Você tem certeza?",
      "Uma vez deletado você perderá seu agendamento nessa sala para este dia!",
      [
        { isPreferred: true, text: "Cancelar" },
        { text: "Confirmar", onPress: () => removeAgendamento(agendamento.id) },
      ]
    );
  }

  // --- FORMATADORES DE USABILIDADE ---
  const shortId = agendamento.id 
    ? agendamento.id.substring(agendamento.id.length - 6).toUpperCase() 
    : "";

  let horarioFormatado = agendamento.horario || "Horário indisponível";
  let diaFormatado = agendamento.data || "Dia indisponível";

  if (agendamento.tempoInicio && agendamento.tempoFim) {
    try {
      const [dataRaw, tempoInicioRaw] = agendamento.tempoInicio.split("T");
      const [_, tempoFimRaw] = agendamento.tempoFim.split("T");

      horarioFormatado = `${tempoInicioRaw.substring(0, 5)} às ${tempoFimRaw.substring(0, 5)}`;

      const [ano, mes, dia] = dataRaw.split("-");
      diaFormatado = `${dia}/${mes}/${ano}`;
    } catch (e) {
      console.log("Erro ao formatar datas do item:", e);
    }
  }

  // Se o back-end já respondeu a query da sala, mostra o nome (ex: "Sala 01"). Caso contrário, mostra "Carregando..."
  const nomeSala = salaData?.nome || "Carregando...";

  return (
    <Pressable
      style={({ pressed }) => [styles.wrapper, pressed && styles.pressed]}
      android_ripple={{ color: Colors.lightRipple }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
        <StyledText textAlign="left" fontWeight="bold" size="big">
          Atendimento #{shortId}
        </StyledText>
        <Icon
          name="trash"
          color="red"
          style={{ position: "absolute", right: 0 }}
          size={24}
          onPress={onDeleteHandler}
        />
      </View>

      <InfoBox content={nomeSala!} label="Sala" />
      <InfoBox content={horarioFormatado} label="Horário" />
      <InfoBox content={diaFormatado} label="Dia" />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: "3%",
    padding: "4%",
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    elevation: 2,
    gap: 8,
  },
  pressed: {
    opacity: 0.8,
  },
});

export default memo(AgendamentoItem);