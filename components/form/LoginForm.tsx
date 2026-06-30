import { Alert, StyleSheet, View } from "react-native";

import { useEffect, useState } from "react";
import Input from "../general/Input";
import Button from "../general/Button";
import useAuth from "@/hooks/useAuth";
import { router } from "expo-router";

import { Credentials } from "@/util/requests/authHTTP";
import { notBlank } from "@/util/validate";

type LoginFormType = {
  onShowModal: () => void;
};

export default function LoginForm({ onShowModal }: LoginFormType) {
  const [inputs, setInputs] = useState<Credentials>({
    email: "",
    senha: "",
  });
  const { login, user } = useAuth();

  function InputChangeHandler(field: keyof Credentials, text: string) {
    setInputs((prevInput) => ({ ...prevInput, [field]: text }));
  }

  function onSubmitHandler() {
    if (notBlank(inputs)) {
      login({
        email: inputs.email.toLowerCase(),
        senha: inputs.senha,
      });
    } else {
      Alert.alert(
        "Erro",
        "Preencha todas as informações necessárias para continuar."
      );
    }
  }

  useEffect(() => {
    if (user) {
      router.replace("/");
    }
  }, [user]);

  return (
    <View>
      <View style={styles.inputContainer}>
        <Input
          placeholder="email@upe.br"
          onChangeText={InputChangeHandler.bind(null, "email")}
          value={inputs.email}
        />
        <View style={styles.passwordContainer}>
          <Input
            onChangeText={InputChangeHandler.bind(null, "senha")}
            placeholder="Digite sua senha"
            value={inputs.senha}
            mode="password"
          />

          {/* <Pressable style={styles.recoverContainer} onPress={onShowModal}>
            <StyledText color="icon">Esqueci minha senha</StyledText>
          </Pressable> */}
        </View>
      </View>
      <View style={{ marginTop: "4%" }}>
        <Button onPress={onSubmitHandler}>Entrar</Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    marginTop: "5%",
  },
  passwordContainer: {
    paddingBottom: "4%",
  },
  recoverContainer: {
    marginTop: "2%",
    alignItems: "flex-end",
  },
  invalid: {
    borderWidth: 2,
  },
});
