import Calendar from "@/components/horario/Calendar";
import MainPageLayout from "@/components/layouts/MainPageLayout";
import useBottomSheet from "@/hooks/useBottom";
import { router, useFocusEffect, useNavigation } from "expo-router";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { Alert, BackHandler } from "react-native";
import RoomModal from "@/components/horario/RoomBottom";
import HorarioModal from "@/components/horario/HorarioModal";
import { Agendamento, NewAgendamento } from "@/interfaces/Agendamento";
import { useQuery } from "@tanstack/react-query";
import { getAgendamentos } from "@/util/requests/atendimentoIndividualHTTP";
import useAuth from "@/hooks/useAuth";

import SolicitacoesModal from "@/components/horario/SolicitacoesModal";
import SolicitacoesIcon from "@/components/horario/SolicitacoesIcon";
import { getSalaByName } from "@/util/requests/salaHTTP";

// Formata a data estritamente como DD/MM/YYYY para o componente Calendar e o createTimestamps
const getTodayBRString = () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();
  return `${day}/${month}/${year}`;
};

const defaultValues: NewAgendamento = {
  idSala: "",
  data: getTodayBRString(), 
  idTerapeuta: "",
  idFuncionario: "",
  statusAtividade: "PENDENTE",
};

export default function Horarios() {
  const navigation = useNavigation();
  const { user, token } = useAuth();
  const {
    clear,
    isVisible,
    closeBottom,
    changeBottomContent,
    selectedValue,
  } = useBottomSheet();

  const [showModal, setShowModal] = useState(false);
  const [agendamento, setAgendamento] = useState<NewAgendamento>(defaultValues);
  const [showSolicitacoes, setShowSolicitacoes] = useState(false);
  
  // 1. Buscamos primeiro a Sala para obter o UID real exigido pelo Java
  const { data: salaData } = useQuery({
    queryKey: ["salas", selectedValue],
    enabled: !!selectedValue && selectedValue.trim().length > 0,
    queryFn: () => getSalaByName(selectedValue!, token!),
  });

  // 2. Buscamos os agendamentos usando estritamente o UID retornado da query anterior
  const {
    data: agendamentos = { atendimentosGrupo: [], atendimentosIndividuais: [], encontros: [] },
    isLoading,
    refetch: refetchAgendamentos,
  } = useQuery({
    queryKey: ["agendamentos", agendamento.data, salaData?.uid],
    enabled: !!salaData?.uid, 
    queryFn: async () => {
      try {
        const res = await getAgendamentos({
          data: agendamento.data!,
          salaId: salaData!.uid, // Passa o UID real ("5664c14d-...")
          token: token!,
        });
        return res || { atendimentosGrupo: [], atendimentosIndividuais: [], encontros: [] };
      } catch (error) {
        return { atendimentosGrupo: [], atendimentosIndividuais: [], encontros: [] };
      }
    },
  });

  useLayoutEffect(() => {
    changeBottomContent(<RoomModal />);
  }, []);

  useLayoutEffect(() => {
    if (user?.cargo === "TECNICO") {
      navigation.setOptions({
        headerRight: () => (
          <SolicitacoesIcon toggleModal={toggleSolicitacoesHandler} />
        ),
      });
    }
  }, [navigation, user]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      clear();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (selectedValue && selectedValue !== agendamento.idSala) {
      setAgendamento((prev) => ({ ...prev, idSala: selectedValue }));
    }
  }, [selectedValue]);

  useFocusEffect(
    useCallback(() => {
      function onBackPress() {
        if (isVisible) {
          closeBottom();
          return true;
        } else {
          router.navigate("(app)");
          return true;
        }
      }

      BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () =>
        BackHandler.removeEventListener("hardwareBackPress", onBackPress);
    }, [isVisible, closeBottom])
  );

  const inputHandler = useCallback((field: keyof NewAgendamento, text: string) => {
    setAgendamento((prev) => ({ ...prev, [field]: text }));
  }, []);

  function toggleModalHandler() {
    if (agendamento.idSala) {
      setShowModal((p) => !p);
      if (typeof refetchAgendamentos === "function") {
        refetchAgendamentos();
      }
    } else {
      Alert.alert(
        "Erro",
        "Preencha todas as informações necessárias para continuar."
      );
    }
  }

  function toggleSolicitacoesHandler() {
    setShowSolicitacoes((prev) => !prev);
  }

  return (
    <MainPageLayout isLoading={isLoading}>
      <Calendar
        onSelection={inputHandler}
        toggleModal={toggleModalHandler}
        selected={agendamento}
      />
      <HorarioModal
        visible={showModal}
        toggleDialog={toggleModalHandler}
        agendamento={agendamento}
      />
      <SolicitacoesModal
        toggleModal={toggleSolicitacoesHandler}
        visible={showSolicitacoes}
      />
    </MainPageLayout>
  );
}