import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Button, HelperText, TextInput } from "react-native-paper";
import { AuthScreenShell } from "./AuthScreenShell";
import { apiFetch } from "@/src/api/client";

const MIN_PASSWORD_LEN = 8;

export default function ResetPasswordScreen() {
  const { email, code } = useLocalSearchParams();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [touched, setTouched] = useState({
    password: false,
    confirm: false,
  });

  const errors = useMemo(() => {
    return {
      password:
        touched.password && !password
          ? "Password is required"
          : touched.password && password.length < MIN_PASSWORD_LEN
            ? `Password must be at least ${MIN_PASSWORD_LEN} characters`
            : null,

      confirm:
        touched.confirm && !confirm
          ? "Confirm your password"
          : touched.confirm && confirm !== password
            ? "Passwords do not match"
            : null,
    };
  }, [touched, password, confirm]);

  const isFormValid =
    !!password &&
    password.length >= MIN_PASSWORD_LEN &&
    !!confirm &&
    confirm === password &&
    !!email &&
    !!code;

  const canSubmit = !loading && isFormValid;

  const onSave = async () => {
    setApiError(null);
    setTouched({ password: true, confirm: true });

    if (!isFormValid) return;

    setLoading(true);
    try {
      await apiFetch("/resetPassword", {
        method: "POST",
        body: JSON.stringify({
          email,
          code,
          newPassword: password,
        }),
      });
      router.replace("/login");
    } catch (e: any) {
      setApiError("Could not reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenShell title="Set a new password">
      <View style={styles.form}>
        <View style={styles.field}>
          <TextInput
            mode="outlined"
            label="New password"
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              if (apiError) setApiError(null);
            }}
            onBlur={() => setTouched((s) => ({ ...s, password: true }))}
            secureTextEntry
            autoCapitalize="none"
            error={!!errors.password || !!apiError}
          />
          {errors.password && (
            <HelperText type="error" style={styles.helper}>
              {errors.password}
            </HelperText>
          )}
        </View>

        <View style={styles.field}>
          <TextInput
            mode="outlined"
            label="Confirm password"
            value={confirm}
            onChangeText={(t) => {
              setConfirm(t);
              if (apiError) setApiError(null);
            }}
            onBlur={() => setTouched((s) => ({ ...s, confirm: true }))}
            secureTextEntry
            autoCapitalize="none"
            error={!!errors.confirm || !!apiError}
          />
          {errors.confirm && (
            <HelperText type="error" style={styles.helper}>
              {errors.confirm}
            </HelperText>
          )}
        </View>

        {apiError && (
          <HelperText type="error" style={styles.helperGlobal}>
            {apiError}
          </HelperText>
        )}

        <Button
          mode="contained"
          onPress={onSave}
          loading={loading}
          disabled={!canSubmit}
          style={styles.primaryBtn}
          contentStyle={styles.primaryBtnContent}
        >
          Save Password
        </Button>
      </View>
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  form: { gap: 12 },
  field: {},
  helper: { marginTop: 2, marginBottom: -12 },
  helperGlobal: { marginTop: -4, marginBottom: -2 },
  primaryBtn: { marginTop: 6, borderRadius: 6 },
  primaryBtnContent: { paddingVertical: 6 },
});
