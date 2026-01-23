import { Tabs, router } from "expo-router";
import { Appbar } from "react-native-paper";
import { Image } from "react-native";

const ICON_HOME = require("../assets/tabBarLogo.png");

function AppTopBar({ title }: { title: string }) {
  return (
    <Appbar.Header
      style={{ backgroundColor: "#0F4366", height: 40, paddingBottom: 10 }}
    >
      <Appbar.Content
        title="Officely"
        titleStyle={{ color: "white", fontWeight: "600" }}
        style={{ alignItems: "flex-start", marginLeft: -25 }}
      />

      <Appbar.Action
        icon="logout"
        color="white"
        onPress={() => router.replace("/(auth)/login")}
      />
    </Appbar.Header>
  );
}

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        header: () => <AppTopBar title="Officely" />,

        tabBarStyle: {
          backgroundColor: "#0F4366",
          height: 80,
          paddingBottom: 20,
          paddingTop: 8,
        },
        tabBarActiveTintColor: "white",
        tabBarInactiveTintColor: "rgba(255,255,255,0.7)",
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Appbar.Action
              icon="magnify"
              color={color}
              size={size}
              onPress={() => {}}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={ICON_HOME}
              style={{
                width: 26,
                height: 26,
              }}
              resizeMode="contain"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Appbar.Action
              icon="account"
              color={color}
              size={size}
              onPress={() => {}}
            />
          ),
        }}
      />
    </Tabs>
  );
}
