import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Button, HelperText, Text, TextInput } from "react-native-paper";
import { AuthScreenShell } from "@/src/components/AuthScreenShell";
import { useAuthStore } from "@/src/auth/authStore";

const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const login = useAuthStore((s) => s.login);

  const trimmedEmail = useMemo(() => email.trim(), [email]);

  const errors = useMemo(() => {
    return {
      email:
        touched.email && !trimmedEmail
          ? "Email is required"
          : touched.email && !isValidEmail(trimmedEmail)
            ? "Enter a valid email address"
            : null,

      password: touched.password && !password ? "Password is required" : null,
    };
  }, [touched, trimmedEmail, password]);

  const isFormValid =
    !!trimmedEmail && isValidEmail(trimmedEmail) && !!password;

  const canSubmit = !loading && isFormValid;

  const onLogin = async () => {
    setApiError(null);
    if (!isFormValid) return;
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace("/(app)/search");
    } catch (e: any) {
      setApiError("Incorrect email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenShell title="Welcome back!">
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
            onBlur={() => setTouched((s) => ({ ...s, email: true }))}
            autoCapitalize="none"
            keyboardType="email-address"
            error={!!errors.email || !!apiError}
          />
          {errors.email && (
            <HelperText type="error" style={styles.helper}>
              {errors.email}
            </HelperText>
          )}
        </View>
        <View style={styles.field}>
          <TextInput
            mode="outlined"
            label="Password"
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              if (apiError) setApiError(null);
            }}
            onBlur={() => setTouched((s) => ({ ...s, password: true }))}
            secureTextEntry={secure}
            error={!!errors.password || !!apiError}
            right={
              <TextInput.Icon
                icon={secure ? "eye" : "eye-off"}
                onPress={() => setSecure((v) => !v)}
              />
            }
          />
          {errors.password && (
            <HelperText type="error" style={styles.helper}>
              {errors.password}
            </HelperText>
          )}
        </View>
        {apiError && (
          <HelperText type="error" style={styles.helperGlobal}>
            {apiError}
          </HelperText>
        )}
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
          loading={loading}
          disabled={!canSubmit}
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
};

const styles = StyleSheet.create({
  form: { gap: 12 },
  field: {},
  helper: { marginTop: 2, marginBottom: -12 },
  helperGlobal: { marginTop: -4, marginBottom: -2 },
  linkRow: { alignItems: "flex-end", marginTop: -4 },
  link: { textDecorationLine: "underline" },
  primaryBtn: { marginTop: 6, borderRadius: 6 },
  primaryBtnContent: { paddingVertical: 6 },
  bottom: { marginTop: 12, alignItems: "center" },
});
export default LoginScreen;
