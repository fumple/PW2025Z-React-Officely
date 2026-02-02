import { Tabs, router } from "expo-router";
import { Image } from "react-native";
import { Appbar, Icon } from "react-native-paper";

const ICON_HOME = require("../assets/tabBarLogo.png");

const AppTopBar = () => {
  return (
    <Appbar.Header
      style={{ backgroundColor: "#0F4366", height: 40, paddingBottom: 10 }}
    >
      <Image
        source={ICON_HOME}
        style={{ width: 26, height: 26, marginLeft: 12, marginRight: 8 }}
        resizeMode="contain"
      />
      <Appbar.Content
        title="Officely"
        titleStyle={{ color: "white", fontWeight: "600" }}
        style={{ alignItems: "flex-start" }}
      />
      <Appbar.Action
        icon="logout"
        color="white"
        onPress={() => router.replace("/(auth)/login")}
      />
    </Appbar.Header>
  );
};

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        header: () => <AppTopBar />,
        popToTopOnBlur: true,

        tabBarStyle: {
          backgroundColor: "#0F4366",
          height: 60,
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
            <Icon source="magnify" color={color} size={size} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            // Always go to the root screen for this tab
            e.preventDefault();
            router.replace("/(app)/search");
          },
        }}
      />

      <Tabs.Screen
        name="bookings"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon source="calendar" color={color} size={size} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.replace("/(app)/bookings");
          },
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon source="account-circle" color={color} size={size} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.replace("/(app)/profile");
          },
        }}
      />

      <Tabs.Screen name="parkly" options={{ href: null }} />
    </Tabs>
  );
}
