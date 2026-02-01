import React from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { KeyboardAvoidingView, Platform } from "react-native";

export const AuthScreenShell = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <KeyboardAvoidingView
      style={styles.safe}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Image
            source={require("../../app/assets/logo1.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text variant="headlineSmall" style={styles.title}>
            {title}
          </Text>
        </View>
        <View style={styles.body}>{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { paddingHorizontal: 18, paddingTop: 40, paddingBottom: 18 },
  header: { alignItems: "center", paddingTop: 10, paddingBottom: 10 },
  logo: { width: 130, height: 130, marginBottom: 10 },
  title: { marginTop: 6 },
  body: { paddingTop: 10 },
});
