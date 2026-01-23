import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Button, HelperText, TextInput } from "react-native-paper";
import { AuthScreenShell } from "./AuthScreenShell";

export default function RecoverScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const onSend = async () => {
    setLoading(true);
    setNotFound(false);

    try {
      // TODO: call API
      const fakeNotFound = !email.includes("@");

      if (fakeNotFound) {
        setNotFound(true);
        return;
      }

      router.push({
        pathname: "./recover-wait",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenShell title="Provide your email">
      <View style={styles.form}>
        <TextInput
          mode="outlined"
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <HelperText type="error" visible={notFound}>
          This email is not tied to any account.
        </HelperText>

        <Button
          mode="contained"
          onPress={onSend}
          loading={loading}
          disabled={loading}
          style={styles.primaryBtn}
          contentStyle={styles.primaryBtnContent}
        >
          Send Code
        </Button>
      </View>
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  form: { gap: 12 },
  primaryBtn: { marginTop: 2, borderRadius: 6 },
  primaryBtnContent: { paddingVertical: 6 },
});
