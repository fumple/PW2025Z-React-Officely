import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Button, Text, TextInput } from "react-native-paper";
import { AuthScreenShell } from "./AuthScreenShell";

export default function SignUpScreen() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [secure, setSecure] = useState(true);

  const onSignUp = async () => {
    // TODO: API call
    router.replace("/(app)");
  };

  return (
    <AuthScreenShell title="Welcome!">
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <TextInput
            mode="outlined"
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
          <TextInput
            mode="outlined"
            label="First Name"
            value={firstName}
            onChangeText={setFirstName}
          />
          <TextInput
            mode="outlined"
            label="Last Name"
            value={lastName}
            onChangeText={setLastName}
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

          <TextInput
            mode="outlined"
            label="Repeat Password"
            value={password2}
            onChangeText={setPassword2}
            secureTextEntry={secure}
          />

          <Button
            mode="contained"
            onPress={onSignUp}
            style={styles.primaryBtn}
            contentStyle={styles.primaryBtnContent}
          >
            Sign Up
          </Button>

          <View style={styles.bottomInline}>
            <Text variant="bodySmall">
              Already have an account?{" "}
              <Text
                variant="bodySmall"
                onPress={() => router.back()}
                style={styles.link}
              >
                Login
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 18 },
  form: { gap: 12 },
  link: { textDecorationLine: "underline" },
  primaryBtn: { marginTop: 6, borderRadius: 6 },
  primaryBtnContent: { paddingVertical: 6 },
  bottomInline: { alignItems: "center", marginTop: 6 },
});
