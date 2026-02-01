import { apiFetch } from "@/src/api/client";
import { AuthScreenShell } from "@/src/components/AuthScreenShell";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, HelperText, Text, TextInput } from "react-native-paper";

const CODE_LENGTH = 6;
const RESEND_SECONDS = 30;

const RecoverWaitScreen = () => {
  const { email } = useLocalSearchParams<{ email?: string | string[] }>();

  const [code, setCode] = useState("");
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const canResend = useMemo(() => seconds <= 0 && !loading, [seconds, loading]);
  const canConfirm = !loading && code.length === CODE_LENGTH;

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [seconds]);

  const onResend = async () => {
    setLoading(true);
    setApiError(null);
    try {
      await apiFetch("/resetPasswordEmail", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setSeconds(RESEND_SECONDS);
    } catch (e: any) {
      setApiError("Failed to resend the code.");
    } finally {
      setLoading(false);
    }
  };

  const onConfirm = async () => {
    if (!email || code.length !== CODE_LENGTH) return;

    setLoading(true);
    setApiError(null);
    try {
      const res = await apiFetch("/checkResetCode", {
        method: "POST",
        body: JSON.stringify({ email, code }),
      });

      if (!res?.valid) {
        setApiError("Invalid code.");
        return;
      }

      router.push({
        pathname: "./reset-password",
        params: { email, code },
      });
    } catch {
      setApiError("Invalid code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenShell title={`Wait ${Math.max(0, seconds)}s`}>
      <View style={styles.form}>
        <View style={styles.field}>
          <TextInput
            mode="outlined"
            label="Input the code here"
            value={code}
            onChangeText={(t) => {
              setCode(t);
              if (apiError) setApiError(null);
            }}
            autoCapitalize="none"
            keyboardType="number-pad"
            maxLength={CODE_LENGTH}
            error={!!apiError}
          />
          {apiError && (
            <HelperText type="error" style={styles.helper}>
              {apiError}
            </HelperText>
          )}
        </View>
        <View style={styles.resend}>
          <Text variant="bodySmall" style={styles.hint}>
            You don’t see the code?{" "}
            <Text
              onPress={canResend ? onResend : undefined}
              variant="bodySmall"
              style={[styles.bold, !canResend && { opacity: 0.4 }]}
            >
              Send the code again
            </Text>
          </Text>
        </View>

        <Button
          mode="contained"
          onPress={onConfirm}
          loading={loading}
          disabled={!canConfirm}
          style={styles.primaryBtn}
          contentStyle={styles.primaryBtnContent}
        >
          Confirm Code
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
  resend: {
    alignItems: "center",
    marginTop: 2,
  },
  resendLink: {
    fontWeight: "700",
  },
  hint: { opacity: 0.8 },
  bold: { fontWeight: "700" },
  primaryBtn: { marginTop: 2, borderRadius: 6 },
  primaryBtnContent: { paddingVertical: 6 },
});
export default RecoverWaitScreen;
