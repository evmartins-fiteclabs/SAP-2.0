import Header from "@/components/general/Header";
import Icon from "@/components/general/Icon";
import Navbar from "@/components/navigation/Navbar";
import { Colors } from "@/constants/Colors";
import useAuth from "@/hooks/useAuth";
import { Redirect } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { Dimensions, LogBox } from "react-native";

export default function Layout() {
  LogBox.ignoreAllLogs();
  const { user } = useAuth();
  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <Drawer
      drawerContent={(props) => <Navbar {...props} />}
      screenOptions={({ navigation }) => ({
        swipeEnabled: false,
        headerStyle: {
          backgroundColor: Colors.background,
          height: 100,
        },
        headerBackgroundContainerStyle: {
          elevation: 2,
          backgroundColor: Colors.background,
        },
        drawerStyle: {
          maxWidth: Dimensions.get("window").width / 1.5,
        },
        headerLeft: () => (
          <Icon
            name="align-justify"
            color="text"
            size={32}
            style={{ padding: "6%", marginLeft: "8%" }}
            onPress={navigation.toggleDrawer}
          />
        ),
        headerTintColor: Colors.text,
        headerTitleAlign: "center",
        headerTitleStyle: {
          textTransform: "capitalize",
          fontSize: 24,
        },
        unmountOnBlur: true,
      })}
    >
      <Drawer.Screen
        name="index"
        options={{
          title: "Mural",
          drawerLabel: "Mural",
          unmountOnBlur: true,
        }}
      />
      <Drawer.Screen
        name="perfil"
        options={{
          title: "Perfil",
          drawerLabel: "Perfil",
          headerTitleAlign: "center",
        }}
      />
      <Drawer.Screen
        name="detalhesPost"
        options={{
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="horarios"
        options={{
          title: "Horários",
        }}
      />
      <Drawer.Screen
      name="[supervisionadoId]"
      options={{
        drawerItemStyle: { display: "none" }, 
        header: (props) => <Header {...props} />,
      }}
/>
      <Drawer.Screen
        name="estatisticas"
        options={{
          header: (props) => <Header {...props} />,
        }}
      />
      <Drawer.Screen
        name="grupos"
        options={{
          title: "Meus Grupos",
        }}
      />
      <Drawer.Screen
        name="detalhesGrupo"
        options={{
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="fichas"
        options={{
          title: "Minhas Fichas",
        }}
      />
    </Drawer>
  );
}
