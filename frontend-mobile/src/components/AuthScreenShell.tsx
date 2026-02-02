import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Text } from "react-native-paper";

export const AuthScreenShell = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <KeyboardAwareScrollView
      style={styles.safe}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid={true}
      extraScrollHeight={16}
    >
      <View style={styles.header}>
        <Image
          source={require("../../app/assets/logo1.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text variant="headlineSmall" style={styles.title}>
          {title}
        </Text>
      </View>
      <View style={styles.body}>{children}</View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { paddingHorizontal: 18, paddingTop: 40, paddingBottom: 18 },
  header: { alignItems: "center", paddingTop: 10, paddingBottom: 10 },
  logo: { width: 130, height: 130, marginBottom: 10 },
  title: { marginTop: 6 },
  body: { paddingTop: 10 },
});
