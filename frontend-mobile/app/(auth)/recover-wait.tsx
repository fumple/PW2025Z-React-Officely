import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { AuthScreenShell } from "./AuthScreenShell";

const CODE_LENGTH = 6;

export default function RecoverWaitScreen() {
  const [code, setCode] = useState("");
  const [seconds, setSeconds] = useState(30);
  const [loading, setLoading] = useState(false);

  const canResend = useMemo(() => seconds <= 0 && !loading, [seconds, loading]);
  const canConfirm = code.length === CODE_LENGTH;

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [seconds]);

  const resend = async () => {
    setLoading(true);
    try {
      // TODO: API call resend
      setSeconds(30);
    } finally {
      setLoading(false);
    }
  };

  const authenticateCode = () => {};

  return (
    <AuthScreenShell title={`Wait ${Math.max(0, seconds)}s`}>
      <View style={styles.form}>
        <TextInput
          mode="outlined"
          label="Input the code here"
          value={code}
          onChangeText={setCode}
          autoCapitalize="none"
          keyboardType="number-pad"
          maxLength={6}
        />

        <View style={{ alignItems: "center" }}>
          <Text variant="bodySmall" style={styles.hint}>
            You don’t see the code?{" "}
            <Text
              disabled={!canResend}
              onPress={resend}
              variant="bodySmall"
              style={styles.bold}
            >
              Send the code again
            </Text>
          </Text>
        </View>

        <Button
          mode="contained"
          onPress={authenticateCode}
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
}

const styles = StyleSheet.create({
  form: { gap: 12 },
  hint: { opacity: 0.8 },
  bold: { fontWeight: "700" },
  primaryBtn: { marginTop: 2, borderRadius: 6 },
  primaryBtnContent: { paddingVertical: 6 },
});
