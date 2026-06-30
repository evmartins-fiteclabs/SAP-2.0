import { PropsWithoutRef, useCallback, useEffect, useState } from "react";
import { Alert, BackHandler, ModalProps, View } from "react-native";
import { Image } from "expo-image";
import { router, useFocusEffect, useNavigation } from "expo-router";
import { useMutation } from "@tanstack/react-query";

import { Colors } from "@/constants/Colors";
import Icon from "@/components/general/Icon";
import Input from "../general/Input";
import Button from "../general/Button";
import useImagePicker from "@/hooks/useImagePicker";

import useAuth from "@/hooks/useAuth";
import blurhash from "@/util/blurhash";
import ModalLayout from "../layouts/ModalLayout";
import { notBlank } from "@/util/validate";
import { addPost } from "@/util/requests/postHTTP";
import { queryClient } from "@/util/queries";

type AddPostProps = {
  toggleModal: () => void;
} & PropsWithoutRef<ModalProps>;

type PostContent = {
  titulo: string;
  conteudo: string;
};

const defaultValues: PostContent = {
  conteudo: "",
  titulo: "",
};

export default function AddPost({
  toggleModal,
  visible = false,
  ...props
}: AddPostProps) {
  const { user, token } = useAuth();
  const { mutate: createPost, isPending: postando } = useMutation({
    mutationFn: addPost,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.refetchQueries({ queryKey: ["posts"] });
      Alert.alert(
        "Post fixado no mural!",
        "o conteudo foi postado no mural e está disponivel para todos."
      );
      router.navigate("(app)");
      closeHandler();
    },
    retry: 3,
  });

  const navigation = useNavigation();
  const { openLibrary, openCamera, imageURI, aspect, clearImage } =
    useImagePicker();

  const [postContent, setPostContent] = useState(defaultValues);

  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", (e) => {
      setPostContent(defaultValues);
    });

    return unsubscribe;
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      function onBackPress() {
        router.navigate("(app)");

        return true;
      }

      BackHandler.addEventListener("hardwareBackPress", onBackPress);

      return () =>
        BackHandler.removeEventListener("hardwareBackPress", onBackPress);
    }, [navigation])
  );

  function inputHandler(field: keyof PostContent, text: string) {
    setPostContent((prev) => ({ ...prev, [field]: text }));
  }

  function createPostHandler() {
    const { titulo } = postContent;
    if (notBlank({ titulo, idAutor: user!.id })) {
      createPost({
        postData: {
          conteudo: postContent.conteudo,
          titulo: postContent.titulo,
          imagemPost: imageURI,
          dataPublicacao: new Date(),
          idAutor: user!.id,
        },
        token: token!,
      });
    } else {
      Alert.alert("Erro", "Um post deve ter ao menos um título!");
    }
  }

  function closeHandler() {
    setPostContent(defaultValues);
    toggleModal();
  }

  return (
    <ModalLayout
      submitButton={{
        button: ({ onSubmit }) => (
          <Button onPress={onSubmit} disabled={postando}>
            {postando ? "Postando..." : "Postar"}
          </Button>
        ),
        onSubmit: createPostHandler,
      }}
      toggleModal={closeHandler}
      visible={visible}
      {...props}
    >
      <Input
        autoCapitalize="sentences"
        placeholder="Titulo do post"
        maxLength={50}
        value={postContent.titulo}
        onChangeText={inputHandler.bind(null, "titulo")}
      />

      <Input
        multiline={true}
        autoCapitalize="sentences"
        placeholder="Conteúdo do post"
        maxLength={400}
        scrollEnabled
        numberOfLines={5}
        textAlignVertical="top"
        style={{ maxHeight: 135, width: "100%" }}
        value={postContent.conteudo}
        onChangeText={inputHandler.bind(null, "conteudo")}
      />

      <View style={{ padding: "8%", gap: 16 }}>
        <Button
          leftIcon={<Icon name="image" color="white" />}
          onPress={openLibrary}
        >
          Abrir Galeria
        </Button>
        <Button
          leftIcon={<Icon name="camera" color="white" />}
          onPress={openCamera}
        >
          Abrir Câmera
        </Button>
      </View>
      {imageURI && (
        <View style={{ position: "relative" }}>
          <Image
            contentFit="contain"
            placeholder={{ blurhash }}
            source={{ uri: imageURI }}
            style={{
              aspectRatio: aspect,
              borderWidth: 2,
              borderRadius: 4,
              borderColor: Colors.border,
              overflow: "hidden",
            }}
          />
          <Icon
            name="x-square"
            color="white"
            size={36}
            style={{ position: "absolute", right: 0, padding: "2%" }}
            onPress={clearImage}
          />
        </View>
      )}
    </ModalLayout>
  );
}
