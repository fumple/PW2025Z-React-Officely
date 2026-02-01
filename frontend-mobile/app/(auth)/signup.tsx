import React, { useMemo, useState } from "react";
import { FlatList, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import {
  Button,
  Text,
  TextInput,
  Portal,
  Modal,
  List,
  Divider,
  HelperText,
} from "react-native-paper";
import { AuthScreenShell } from "@/src/components/AuthScreenShell";
import { apiFetch } from "@/src/api/client";
import { useAuthStore } from "@/src/auth/authStore";
import { DatePickerModal } from "react-native-paper-dates";

const MAX_PHONE_DIGITS = 15;
const MIN_PASSWORD_LEN = 8;

//TODO: Add check if a user with this email is already signed up

const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const getMaxDob = (years: number) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setFullYear(date.getFullYear() - years);
  return date;
};

const formatDate = (date?: Date) => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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

const isValidPhone = (value: string) => {
  if (!value.startsWith("+")) return false;
  const digits = value.slice(1);
  return digits.length > 0 && digits.length <= MAX_PHONE_DIGITS;
};

const SignUpScreen = () => {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(undefined);
  const [nationality, setNationality] = useState("pl");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [secure, setSecure] = useState(true);
  const [dobOpen, setDobOpen] = useState(false);
  const [natOpen, setNatOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({
    email: false,
    firstName: false,
    lastName: false,
    password: false,
    password2: false,
    phoneNumber: false,
    dateOfBirth: false,
    nationality: false,
  });

  const login = useAuthStore((s) => s.login);

  const maxDob = getMaxDob(15);
  const trimmedEmail = useMemo(() => email.trim(), [email]);

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

      password:
        touched.password && !password
          ? "Password is required"
          : touched.password && password.length < MIN_PASSWORD_LEN
            ? `Password must have at least ${MIN_PASSWORD_LEN} characters`
            : null,

      password2:
        touched.password2 && !password2
          ? "Repeat password is required"
          : touched.password2 && password && password2 && password !== password2
            ? "Passwords do not match"
            : null,

      phoneNumber:
        touched.phoneNumber && !phoneNumber
          ? "Phone number is required"
          : touched.phoneNumber && !isValidPhone(phoneNumber)
            ? "Phone number must start with + and have max. 15 digits"
            : null,
      dateOfBirth:
        touched.dateOfBirth && !dateOfBirth
          ? "Date of birth is required"
          : null,
      nationality:
        touched.nationality && !nationality ? "Nationality is required" : null,
    };
  }, [
    touched,
    firstName,
    lastName,
    trimmedEmail,
    password,
    password2,
    phoneNumber,
    dateOfBirth,
    nationality,
  ]);

  const isFormValid =
    !!firstName.trim() &&
    !!lastName.trim() &&
    !!trimmedEmail &&
    isValidEmail(trimmedEmail) &&
    !!password &&
    password.length >= MIN_PASSWORD_LEN &&
    !!password2 &&
    password === password2 &&
    !!phoneNumber &&
    isValidPhone(phoneNumber) &&
    !!dateOfBirth &&
    !!nationality;

  const canSubmit = !loading && isFormValid;

  const onSignUp = async () => {
    setTouched({
      email: true,
      firstName: true,
      lastName: true,
      password: true,
      password2: true,
      phoneNumber: true,
      dateOfBirth: true,
      nationality: true,
    });

    if (!canSubmit) return;
    setLoading(true);

    try {
      await apiFetch("/signup", {
        method: "POST",
        body: JSON.stringify({
          type: "customer",
          firstName,
          lastName,
          email: trimmedEmail,
          password,
          dateOfBirth: formatDate(dateOfBirth),
          nationality: nationality.toUpperCase(),
          phoneNumber,
        }),
      });
      await login(email.trim(), password);
      router.replace("/(app)/search");
    } catch (e: any) {
      alert(e.message ?? "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenShell title="Welcome!">
      <View style={styles.form}>
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
            label="Date of Birth"
            editable={false}
            value={formatDate(dateOfBirth)}
            onPressIn={() => {
              setTouched((t) => ({ ...t, dateOfBirth: true }));
              setDobOpen(true);
            }}
            error={!!errors.dateOfBirth}
            right={
              <TextInput.Icon
                icon="calendar"
                onPress={() => {
                  setTouched((t) => ({ ...t, dateOfBirth: true }));
                  setDobOpen(true);
                }}
              />
            }
          />
          {errors.dateOfBirth && (
            <HelperText type="error" style={styles.helper}>
              {errors.dateOfBirth}
            </HelperText>
          )}
        </View>
        <DatePickerModal
          locale="en"
          mode="single"
          visible={dobOpen}
          date={dateOfBirth ?? maxDob}
          onDismiss={() => setDobOpen(false)}
          onConfirm={({ date }) => {
            setDobOpen(false);
            setDateOfBirth(date);
          }}
          validRange={{ endDate: maxDob }}
        />
        <View style={styles.field}>
          <TextInput
            mode="outlined"
            label="Nationality"
            value={NATIONALITIES.find((n) => n.code === nationality)?.label}
            editable={false}
            onPressIn={() => {
              setTouched((t) => ({ ...t, nationality: true }));
              setNatOpen(true);
            }}
            error={!!errors.nationality}
            right={
              <TextInput.Icon
                icon="chevron-down"
                onPress={() => {
                  setTouched((t) => ({ ...t, nationality: true }));
                  setNatOpen(true);
                }}
              />
            }
          />
          {errors.nationality && (
            <HelperText type="error" style={styles.helper}>
              {errors.nationality}
            </HelperText>
          )}
        </View>
        <Portal>
          <Modal
            visible={natOpen}
            onDismiss={() => setNatOpen(false)}
            contentContainerStyle={styles.natModal}
          >
            <List.Subheader style={styles.natHeader}>
              Select nationality
            </List.Subheader>
            <Divider />

            <FlatList
              style={styles.natList}
              data={NATIONALITIES}
              keyExtractor={(item) => item.code}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const selected = item.code === nationality;
                return (
                  <List.Item
                    title={item.label}
                    right={() => (selected ? <List.Icon icon="check" /> : null)}
                    onPress={() => {
                      setNationality(item.code);
                      setNatOpen(false);
                    }}
                  />
                );
              }}
            />
          </Modal>
        </Portal>
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
            label="Password"
            value={password}
            onChangeText={setPassword}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            secureTextEntry={secure}
            error={!!errors.password}
            right={
              <TextInput.Icon
                icon={secure ? "eye" : "eye-off"}
                onPress={() => {
                  setSecure((v) => !v);
                }}
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
            label="Repeat Password"
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
        <Button
          mode="contained"
          onPress={onSignUp}
          style={styles.primaryBtn}
          contentStyle={styles.primaryBtnContent}
          disabled={!canSubmit}
          loading={loading}
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
    </AuthScreenShell>
  );
};

const styles = StyleSheet.create({
  scroll: { paddingBottom: 18 },
  form: { gap: 12 },
  field: {},
  helper: {
    marginTop: 2,
    marginBottom: -12,
  },
  link: { textDecorationLine: "underline" },
  primaryBtn: { marginTop: 6, borderRadius: 6 },
  primaryBtnContent: { paddingVertical: 6 },
  bottomInline: { alignItems: "center" },
  natModal: {
    marginHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "white",
    height: "70%",
    overflow: "hidden",
    flexDirection: "column",
  },
  natHeader: {
    paddingHorizontal: 8,
  },
  natList: {
    flex: 1,
  },
});

const NATIONALITIES = [
  { code: "pl", label: "Poland (PL)" },
  { code: "de", label: "Germany (DE)" },
  { code: "cz", label: "Czechia (CZ)" },
  { code: "sk", label: "Slovakia (SK)" },
  { code: "at", label: "Austria (AT)" },
  { code: "fr", label: "France (FR)" },
  { code: "es", label: "Spain (ES)" },
  { code: "it", label: "Italy (IT)" },
  { code: "pt", label: "Portugal (PT)" },
  { code: "nl", label: "Netherlands (NL)" },
  { code: "be", label: "Belgium (BE)" },
  { code: "se", label: "Sweden (SE)" },
  { code: "no", label: "Norway (NO)" },
  { code: "fi", label: "Finland (FI)" },
  { code: "dk", label: "Denmark (DK)" },
  { code: "ie", label: "Ireland (IE)" },
  { code: "ch", label: "Switzerland (CH)" },
  { code: "ro", label: "Romania (RO)" },
  { code: "bg", label: "Bulgaria (BG)" },
  { code: "hu", label: "Hungary (HU)" },
  { code: "hr", label: "Croatia (HR)" },
  { code: "si", label: "Slovenia (SI)" },
  { code: "ee", label: "Estonia (EE)" },
  { code: "lv", label: "Latvia (LV)" },
  { code: "lt", label: "Lithuania (LT)" },
  { code: "ua", label: "Ukraine (UA)" },
  { code: "gb", label: "United Kingdom (GB)" },

  { code: "us", label: "United States (US)" },
  { code: "ca", label: "Canada (CA)" },
  { code: "mx", label: "Mexico (MX)" },
  { code: "br", label: "Brazil (BR)" },
  { code: "ar", label: "Argentina (AR)" },

  { code: "cn", label: "China (CN)" },
  { code: "jp", label: "Japan (JP)" },
  { code: "kr", label: "South Korea (KR)" },
  { code: "in", label: "India (IN)" },
  { code: "th", label: "Thailand (TH)" },
  { code: "vn", label: "Vietnam (VN)" },

  { code: "tr", label: "Turkey (TR)" },
  { code: "il", label: "Israel (IL)" },
  { code: "eg", label: "Egypt (EG)" },
  { code: "za", label: "South Africa (ZA)" },

  { code: "au", label: "Australia (AU)" },
  { code: "nz", label: "New Zealand (NZ)" },
];
export default SignUpScreen;
