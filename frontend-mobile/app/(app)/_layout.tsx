import { Tabs, router } from "expo-router";
import { Appbar } from "react-native-paper";

function AppTopBar({ title }: { title: string }) {
  return (
    <Appbar.Header>
      <Appbar.Content title={title} />
      {/* right icon like in your screenshot */}
      <Appbar.Action
        icon="logout"
        onPress={() => {
          // TODO: clear token etc.
          router.replace("/(auth)/login");
        }}
      />
    </Appbar.Header>
  );
}

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        // Top bar for every tab screen:
        header: () => <AppTopBar title="Officely" />,

        // Bottom bar styling (panel look):
        tabBarStyle: {
          backgroundColor: "#0F4366", // or theme color
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: "white",
        tabBarInactiveTintColor: "rgba(255,255,255,0.7)",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          // middle icon (building) in screenshot
          tabBarIcon: ({ color, size }) => (
            // Paper uses MaterialCommunityIcons names
            // "office-building" looks like your center icon
            <Appbar.Action
              icon="office-building"
              color={color}
              size={size}
              onPress={() => {}}
            />
          ),
          title: "Home",
        }}
      />

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
          title: "Search",
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
          title: "Profile",
        }}
      />
    </Tabs>
  );
}
