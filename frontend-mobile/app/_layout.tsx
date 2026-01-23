import { Stack } from "expo-router";

import {
  adaptNavigationTheme,
  MD3DarkTheme,
  MD3LightTheme,
  PaperProvider,
} from "react-native-paper";
import { useColorScheme } from "react-native";
import {
  DefaultTheme,
  DarkTheme as DefaultDarkTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";

const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: DefaultTheme,
  reactNavigationDark: DefaultDarkTheme,
  materialLight: MD3LightTheme,
  materialDark: MD3DarkTheme,
});

export default function RootLayout() {
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
      <ThemeProvider value={navTheme}>
        <Stack />
        <StatusBar style="auto" />
      </ThemeProvider>
    </PaperProvider>
  );
}
