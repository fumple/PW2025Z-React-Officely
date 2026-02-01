import { apiFetch } from "@/src/api/client";
import { AuthScreenShell } from "@/src/components/AuthScreenShell";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, HelperText, TextInput } from "react-native-paper";

const isValidEmail = (value: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

const RecoverScreen = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const trimmedEmail = useMemo(() => email.trim(), [email]);
  const emailError = useMemo(() => {
    if (!touched) return null;
    if (!trimmedEmail) return "Email is required";
    if (!isValidEmail(trimmedEmail)) return "Enter a valid email address";
    return null;
  }, [touched, trimmedEmail]);

  const canSubmit = !loading && !emailError;

  const onSend = async () => {
    setTouched(true);
    if (!trimmedEmail || !isValidEmail(trimmedEmail)) return;
    setApiError(null);
    setLoading(true);

    try {
      await apiFetch("/resetPasswordEmail", {
        method: "POST",
        body: JSON.stringify({ email: trimmedEmail }),
      });

      router.push({
        pathname: "./recover-wait",
        params: { email: trimmedEmail },
      });
    } catch (e: any) {
      const msg = "This email is not tied to any account.";
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenShell title="Provide your email">
      <View style={styles.form}>
        <View style={styles.field}>
          <TextInput
            mode="outlined"
            label="Email"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              if (apiError) setApiError(null);
            }}
            onBlur={() => setTouched(true)}
            autoCapitalize="none"
            keyboardType="email-address"
            error={!!emailError || !!apiError}
          />

          {apiError && (
            <HelperText type="error" style={styles.helper}>
              {apiError}
            </HelperText>
          )}
          {emailError && (
            <HelperText type="error" style={styles.helper}>
              {emailError}
            </HelperText>
          )}
        </View>

        <Button
          mode="contained"
          onPress={onSend}
          loading={loading}
          disabled={!canSubmit}
          style={styles.primaryBtn}
          contentStyle={styles.primaryBtnContent}
        >
          Send Code
        </Button>
      </View>
    </AuthScreenShell>
  );
};

const styles = StyleSheet.create({
  form: { gap: 12 },
  field: {},
  helper: {
    marginTop: 2,
    marginBottom: -6,
  },
  primaryBtn: { marginTop: 2, borderRadius: 6 },
  primaryBtnContent: { paddingVertical: 6 },
});
export default RecoverScreen;
