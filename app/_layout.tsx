import { useEffect } from "react";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClientProvider } from "@tanstack/react-query";

import Bottom from "@/components/general/Bottom";
import AuthContextProvider from "@/context/auth";
import { queryClient } from "@/util/queries";
import useUpdates from "@/hooks/useUpdates";
import BottomContextProvider from "@/context/bottom";

export default function RootLayout() {
  const { checkUpdate } = useUpdates();

  // Dispara assim que o layout monta
  useEffect(() => {
    checkUpdate();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <QueryClientProvider client={queryClient}>
        <AuthContextProvider>
          <BottomContextProvider>
            {/* O Slot fica sempre aqui, sem travas */}
            <Slot />
            <Bottom />
          </BottomContextProvider>
        </AuthContextProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}