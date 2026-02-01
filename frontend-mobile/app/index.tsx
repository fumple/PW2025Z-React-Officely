import { useEffect, useState } from "react";
import { View, Image, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "../src/auth/authStore";

const Index = () => {
  const restore = useAuthStore((s) => s.restore);
  const me = useAuthStore((s) => s.me);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const run = async () => {
      await restore();
      setReady(true);
    };
    run();
  }, [restore]);

  useEffect(() => {
    if (!ready) return;
    if (me) router.replace("/(app)/search");
    else router.replace("/(auth)/login");
  }, [ready, me]);

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
      }}
    >
      <Image
        source={require("./assets/logo1.png")}
        style={{ width: 180, height: 180, marginBottom: 24 }}
        resizeMode="contain"
      />

      <ActivityIndicator size="large" />
    </View>
  );
};

export default Index;
