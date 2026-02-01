import { Tabs, router } from "expo-router";
import { Image } from "react-native";
import { Appbar, Icon } from "react-native-paper";

const ICON_HOME = require("../assets/tabBarLogo.png");

const AppTopBar = ({ title }: { title: string }) => {
  return (
    <Appbar.Header
      style={{ backgroundColor: "#0F4366", height: 40, paddingBottom: 10 }}
    >
      <Image
        source={ICON_HOME}
        style={{
          width: 26,
          height: 26,
          marginLeft: 12,
          marginRight: 8,
        }}
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

const AppLayout = () => {
  return (
    <Tabs
      screenOptions={{
        header: () => <AppTopBar title="Officely" />,

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
        name="search/index"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon source="magnify" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings/index"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon source="calendar" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon source="account-circle" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen name="profile/edit" options={{ href: null }} />
      <Tabs.Screen name="search/results" options={{ href: null }} />
      <Tabs.Screen name="search/book" options={{ href: null }} />
      <Tabs.Screen name="search/booking-details" options={{ href: null }} />
    </Tabs>
  );
};
export default AppLayout;
