import { useAuthStore } from "@/src/auth/authStore";
import getGravatarUrl from "@/src/utils/gravatar";
import { router } from "expo-router";
import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { Divider, List, Text } from "react-native-paper";

const ProfileHomeScreen = () => {
  const me = useAuthStore((s) => s.me);

  const fullName = `${me?.firstName} ${me?.lastName}`.trim();
  const email = me?.email ?? "";

  return (
    <View style={styles.screen}>
      <View style={styles.top}>
        <Image
          source={{ uri: getGravatarUrl(email, 170) }}
          style={styles.avatar}
        />
        <Text variant="headlineSmall" style={styles.name}>
          {fullName}
        </Text>
      </View>

      <View style={styles.menuCard}>
        <List.Item
          title="Edit Profile"
          onPress={() => router.push("/profile/edit")}
          titleStyle={styles.menuText}
        />
        <Divider />
        <List.Item
          title="Current Bookings"
          onPress={() => router.push("/bookings?tab=current")}
          titleStyle={styles.menuText}
        />
        <Divider />
        <List.Item
          title="Past Bookings"
          onPress={() => router.push("/bookings?tab=past")}
          titleStyle={styles.menuText}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "white" },
  top: { alignItems: "center", paddingTop: 40, paddingBottom: 18 },
  avatar: {
    width: 170,
    height: 170,
    borderRadius: 999,
    backgroundColor: "#E9E8E2",
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.15)",
  },
  name: { marginTop: 14, fontWeight: "700" },

  menuCard: {
    marginTop: "auto",
    backgroundColor: "#E9E8E2",
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  menuText: { fontWeight: "600" },
  deleteText: { color: "red" },
});

export default ProfileHomeScreen;
