import StyledText from "@/components/UI/StyledText";
import AgendamentoItem from "@/components/atendimento/AtendimentoItem";
import Icon from "@/components/general/Icon";
import MainPageLayout from "@/components/layouts/MainPageLayout";
import useAuth from "@/hooks/useAuth";
import { Agendamento } from "@/interfaces/Agendamento";
import GrupoEstudo from "@/interfaces/GrupoEstudo";
import GrupoTerapeutico from "@/interfaces/GrupoTerapeutico";
import { getAgendamentosByFuncionario } from "@/util/requests/atendimentoIndividualHTTP";
import { getAtividadesByFuncionario } from "@/util/requests/atividadesHTTP";
import { useQuery } from "@tanstack/react-query";
import { router, useNavigation } from "expo-router";
import { useEffect, useLayoutEffect, useState } from "react";
import { FlatList, View } from "react-native";

export default function Atendimentos() {
  const { user, token } = useAuth();
  const [individuais, setIndividuais] = useState<Agendamento[]>([]);
  const [encontros, setEncontros] = useState<GrupoEstudo[]>([]);
  const [terapeuticos, setTerapeuticos] = useState<GrupoTerapeutico[]>([]);

  const navigation = useNavigation();
  const {
    data: agendamentos,
    isLoading,
    isError,
  } = useQuery({
    enabled: !!user?.id,
    queryKey: ["agendamentos", user!.id],
    queryFn: () => getAtividadesByFuncionario(user!.id!, token!),
  });

  useEffect(() => {
    if (agendamentos) {
      setEncontros(agendamentos.encontros);
      setIndividuais(agendamentos.atendimentosIndividuais);
      setTerapeuticos(agendamentos.atendimentosGrupo);
    }
  }, [agendamentos]);
  console.log(agendamentos);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Icon
          name="plus"
          style={{
            paddingRight: "8%",
            paddingLeft: "20%",
            height: "100%",
            justifyContent: "center",
          }}
          onPress={() => router.navigate("/horarios")}
        />
      ),
    });
  }, [navigation]);

  function renderAgendamentosHandler(agendamento: Agendamento) {
    return <AgendamentoItem agendamento={agendamento} />;
  }

  return (
    <MainPageLayout isLoading={isLoading}>
      <FlatList
        data={[...encontros, ...terapeuticos, ...individuais]}
        keyExtractor={({ id }) => id}
        // @ts-expect-error
        renderItem={({ item }) => renderAgendamentosHandler(item)}
        ListEmptyComponent={
          <View style={{ marginVertical: "50%" }}>
            <StyledText size="big" textAlign="center">
              Você não possui nenhum agendamento!
            </StyledText>
          </View>
        }
      />
    </MainPageLayout>
  );
}
