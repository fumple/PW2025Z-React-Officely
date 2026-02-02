import { Stack } from "expo-router";

import {
  DarkTheme as DefaultDarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import {
  adaptNavigationTheme,
  MD3DarkTheme,
  MD3LightTheme,
  PaperProvider,
  Portal,
} from "react-native-paper";

const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: DefaultTheme,
  reactNavigationDark: DefaultDarkTheme,
  materialLight: MD3LightTheme,
  materialDark: MD3DarkTheme,
});

const RootLayout = () => {
  const colorScheme = useColorScheme();

  const paperThemeBase = colorScheme === "dark" ? MD3DarkTheme : MD3LightTheme;
  const navTheme = colorScheme === "dark" ? DarkTheme : LightTheme;

  const paperTheme = {
    ...paperThemeBase,
    colors: {
      ...paperThemeBase.colors,
      primary: "#0F4366",
      onPrimary: "#FFFFFF",
    },
  };

  return (
    <PaperProvider theme={paperTheme}>
      <Portal.Host>
        <ThemeProvider value={navTheme}>
          <Stack screenOptions={{ headerShown: false }} />
          <StatusBar style="auto" />
        </ThemeProvider>
      </Portal.Host>
    </PaperProvider>
  );
};

export default RootLayout;
