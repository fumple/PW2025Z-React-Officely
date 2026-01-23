import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

export function AuthScreenShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Image
            source={require("../assets/logo1.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text variant="headlineSmall" style={styles.title}>
            {title}
          </Text>
        </View>

        <View style={styles.body}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, justifyContent: "center" },
  container: { flex: 1, paddingHorizontal: 18, paddingTop: 8 },
  header: { alignItems: "center", paddingTop: 10, paddingBottom: 10 },
  logo: { width: 130, height: 130, marginBottom: 10 },
  title: { marginTop: 6 },
  body: { flex: 1, paddingTop: 10 },
});
