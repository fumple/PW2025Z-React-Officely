import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Button, Text, TextInput } from "react-native-paper";
import { AuthScreenShell } from "./AuthScreenShell";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);

  const onLogin = async () => {
    // TODO: API call
    router.replace("/(app)");
  };

  return (
    <AuthScreenShell title="Welcome back!">
      <View style={styles.form}>
        <TextInput
          mode="outlined"
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          mode="outlined"
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={secure}
          right={
            <TextInput.Icon
              icon={secure ? "eye" : "eye-off"}
              onPress={() => setSecure((v) => !v)}
            />
          }
        />

        <View style={styles.linkRow}>
          <Text
            variant="bodySmall"
            onPress={() => router.push("./recover")}
            style={styles.link}
          >
            Forgot password?
          </Text>
        </View>

        <Button
          mode="contained"
          onPress={onLogin}
          style={styles.primaryBtn}
          contentStyle={styles.primaryBtnContent}
        >
          Login
        </Button>
      </View>

      <View style={styles.bottom}>
        <Text variant="bodySmall">
          Don’t have an account?{" "}
          <Text
            variant="bodySmall"
            onPress={() => router.push("/(auth)/signup")}
            style={styles.link}
          >
            Sign up
          </Text>
        </Text>
      </View>
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  form: { gap: 12 },
  linkRow: { alignItems: "flex-end", marginTop: -4 },
  link: { textDecorationLine: "underline" },
  primaryBtn: { marginTop: 6, borderRadius: 6 },
  primaryBtnContent: { paddingVertical: 6 },
  bottom: { marginTop: "auto", paddingBottom: 14, alignItems: "center" },
});
