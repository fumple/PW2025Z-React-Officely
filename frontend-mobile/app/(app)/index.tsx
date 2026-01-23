import React from "react";
import { View, StyleSheet } from "react-native";
import { Button, Text } from "react-native-paper";
import { router } from "expo-router";

export default function AppIndex() {
  return (
    <View style={styles.container}>
      <Text variant="headlineSmall">Logged in ✅</Text>
      <Button
        mode="outlined"
        onPress={() => router.replace("../(auth)/login")}
        style={{ marginTop: 12 }}
      >
        Log out (temporary)
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
});
