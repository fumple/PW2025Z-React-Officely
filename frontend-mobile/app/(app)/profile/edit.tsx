import { apiFetch } from "@/src/api/client";
import { useAuthStore } from "@/src/auth/authStore";
import getGravatarUrl from "@/src/utils/gravatar";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Button, HelperText, TextInput } from "react-native-paper";

const MIN_PASSWORD_LEN = 8;
const MAX_PHONE_DIGITS = 15;

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidPhone = (value: string) => {
  if (!value.startsWith("+")) return false;
  const digits = value.slice(1);
  return digits.length > 0 && digits.length <= MAX_PHONE_DIGITS;
};

const trimPhoneToMaxDigits = (value: string) => {
  if (value.startsWith("+")) {
    value = "+" + value.slice(1).replace(/\+/g, "");
  } else {
    value = value.replace(/\+/g, "");
  }

  const digits = value.startsWith("+") ? value.slice(1) : value;
  const trimmedDigits = digits.slice(0, MAX_PHONE_DIGITS);

  return value.startsWith("+") ? "+" + trimmedDigits : trimmedDigits;
};

const ProfileEditScreen = () => {
  const me = useAuthStore((s) => s.me);

  const [firstName, setFirstName] = useState(me?.firstName ?? "");
  const [lastName, setLastName] = useState(me?.lastName ?? "");
  const [email, setEmail] = useState(me?.email ?? "");
  const [phoneNumber, setPhoneNumber] = useState(me?.phoneNumber ?? "");
  const [nationality, setNationality] = useState(me?.nationality ?? "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [secure, setSecure] = useState(true);

  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    phoneNumber: false,
    currentPassword: false,
    password: false,
    password2: false,
  });

  const trimmedEmail = useMemo(() => email.trim(), [email]);
  const wantsPasswordChange = !!password || !!password2;

  const errors = useMemo(() => {
    return {
      firstName:
        touched.firstName && !firstName.trim()
          ? "First name is required"
          : null,
      lastName:
        touched.lastName && !lastName.trim() ? "Last name is required" : null,
      email:
        touched.email && !trimmedEmail
          ? "Email is required"
          : touched.email && !isValidEmail(trimmedEmail)
            ? "Enter a valid email address"
            : null,
      phoneNumber:
        touched.phoneNumber && !phoneNumber
          ? "Phone number is required"
          : touched.phoneNumber && !isValidPhone(phoneNumber)
            ? "Phone number must start with + and have max. 15 digits"
            : null,

      currentPassword:
        touched.currentPassword && wantsPasswordChange && !currentPassword
          ? "Current password is required to change password"
          : null,

      password:
        touched.password &&
        wantsPasswordChange &&
        password.length < MIN_PASSWORD_LEN
          ? `Password must have at least ${MIN_PASSWORD_LEN} characters`
          : null,

      password2:
        touched.password2 && wantsPasswordChange && password !== password2
          ? "Passwords do not match"
          : null,
    };
  }, [
    touched,
    firstName,
    lastName,
    trimmedEmail,
    phoneNumber,
    wantsPasswordChange,
    currentPassword,
    password,
    password2,
  ]);

  const isFormValid =
    !!firstName.trim() &&
    !!lastName.trim() &&
    !!trimmedEmail &&
    isValidEmail(trimmedEmail) &&
    !!phoneNumber &&
    isValidPhone(phoneNumber) &&
    (!wantsPasswordChange ||
      (password.length >= MIN_PASSWORD_LEN &&
        password === password2 &&
        !!currentPassword));

  const canSubmit = !loading && isFormValid;

  const onSave = async () => {
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phoneNumber: true,
      currentPassword: true,
      password: true,
      password2: true,
    });

    if (!canSubmit) return;

    setLoading(true);
    try {
      const payload: any = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: trimmedEmail,
        phoneNumber,
        nationality,
      };

      if (wantsPasswordChange) {
        payload.password = password;
        payload.currentPassword = currentPassword;
      }

      await apiFetch("/users/@me", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      router.back();
    } catch (e: any) {
      alert(e?.message ?? "Update failed");
    } finally {
      setLoading(false);
    }
  };
  return (
    <KeyboardAvoidingView //TODO: Find a better way for dealing with this
      style={styles.safe}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.top}>
          <Image
            source={{ uri: getGravatarUrl(email, 170) }}
            style={styles.avatar}
          />
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <TextInput
              mode="outlined"
              label="First Name"
              value={firstName}
              onChangeText={setFirstName}
              onBlur={() => setTouched((t) => ({ ...t, firstName: true }))}
              error={!!errors.firstName}
            />
            {errors.firstName && (
              <HelperText type="error" style={styles.helper}>
                {errors.firstName}
              </HelperText>
            )}
          </View>

          <View style={styles.field}>
            <TextInput
              mode="outlined"
              label="Last Name"
              value={lastName}
              onChangeText={setLastName}
              onBlur={() => setTouched((t) => ({ ...t, lastName: true }))}
              error={!!errors.lastName}
            />
            {errors.lastName && (
              <HelperText type="error" style={styles.helper}>
                {errors.lastName}
              </HelperText>
            )}
          </View>

          <View style={styles.field}>
            <TextInput
              mode="outlined"
              label="Email"
              value={email}
              onChangeText={setEmail}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              autoCapitalize="none"
              keyboardType="email-address"
              error={!!errors.email}
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
              label="Phone Number"
              value={phoneNumber}
              onChangeText={(t) => setPhoneNumber(trimPhoneToMaxDigits(t))}
              onBlur={() => setTouched((t) => ({ ...t, phoneNumber: true }))}
              placeholder="+48123456789"
              keyboardType="phone-pad"
              autoCapitalize="none"
              error={!!errors.phoneNumber}
            />
            {errors.phoneNumber && (
              <HelperText type="error" style={styles.helper}>
                {errors.phoneNumber}
              </HelperText>
            )}
          </View>

          <View style={styles.field}>
            <TextInput
              mode="outlined"
              label="Current Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              onBlur={() =>
                setTouched((t) => ({ ...t, currentPassword: true }))
              }
              secureTextEntry={secure}
              error={!!errors.currentPassword}
            />
            {errors.currentPassword && (
              <HelperText type="error" style={styles.helper}>
                {errors.currentPassword}
              </HelperText>
            )}
          </View>

          <View style={styles.field}>
            <TextInput
              mode="outlined"
              label="New Password"
              value={password}
              onChangeText={setPassword}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              secureTextEntry={secure}
              error={!!errors.password}
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

          <View style={styles.field}>
            <TextInput
              mode="outlined"
              label="Repeat New Password"
              value={password2}
              onChangeText={setPassword2}
              onBlur={() => setTouched((t) => ({ ...t, password2: true }))}
              secureTextEntry={secure}
              error={!!errors.password2}
            />
            {errors.password2 && (
              <HelperText type="error" style={styles.helper}>
                {errors.password2}
              </HelperText>
            )}
          </View>

          <View style={styles.actions}>
            <Button
              mode="contained"
              onPress={() => router.back()} //TODO: This doesnt redirect to profile but to search
              disabled={loading}
              style={[styles.actionBtn, styles.cancelBtn]}
              contentStyle={styles.actionBtnContent}
            >
              Cancel
            </Button>

            <Button
              mode="contained"
              onPress={onSave}
              disabled={!canSubmit}
              loading={loading}
              style={[styles.actionBtn, styles.saveBtn]}
              contentStyle={styles.actionBtnContent}
            >
              Save
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "white" },
  content: { padding: 16, paddingBottom: 28 },

  top: { alignItems: "center", paddingTop: 16, paddingBottom: 20 },
  avatar: {
    width: 170,
    height: 170,
    borderRadius: 999,
    backgroundColor: "#E9E8E2",
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.15)",
  },
  safe: { flex: 1 },

  form: { gap: 12 },
  field: {},

  helper: {
    marginTop: 2,
    marginBottom: -12,
  },

  actions: { flexDirection: "row", gap: 12, marginTop: 6 },
  actionBtn: { flex: 1, borderRadius: 6 },
  actionBtnContent: { paddingVertical: 6 },

  cancelBtn: { backgroundColor: "grey" },
  saveBtn: { backgroundColor: "#0F4366" },
});

export default ProfileEditScreen;
