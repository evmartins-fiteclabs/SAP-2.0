import * as Updates from "expo-updates";
import { useState } from "react";
import { Alert } from "react-native";

export default function useUpdates() {
  const [isChecking, setIsChecking] = useState(false);

  async function checkUpdate() {
    // Evita rodar a checagem em duplicidade se já estiver checando
    if (isChecking) return false; 

    setIsChecking(true);
    try {
      // 1. Apenas checa se existe atualização no canal
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        // 2. Baixa os novos assets/JS em segundo plano
        await Updates.fetchUpdateAsync();

        // 3. Só exibe o alerta após o download terminar com sucesso
        Alert.alert(
          "Atualização Pronta!",
          "Para aplicar as melhorias, o aplicativo precisa ser reiniciado.",
          [
            {
              text: "Atualizar Agora",
              onPress: async () => {
                try {
                  await Updates.reloadAsync();
                } catch (reloadError) {
                  console.error("Erro ao reiniciar o app:", reloadError);
                }
              },
            },
          ],
          { cancelable: false } // Impede o usuário de fechar clicando fora (obriga a atualizar)
        );
        
        return true;
      }
    } catch (error) {
      console.log("Erro na verificação de updates da EAS:", error);
    } finally {
      setIsChecking(false);
    }
    return false;
  }

  return { isChecking, checkUpdate };
}