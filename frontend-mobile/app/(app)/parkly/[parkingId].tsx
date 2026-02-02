import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import {
    ActivityIndicator,
    Button,
    Divider,
    HelperText,
    IconButton,
    Text,
} from "react-native-paper";

import { apiFetchParkly } from "@/src/api/client";

type ParkingDetails = {
  id: string;
  name: string;
  country: string;
  city: string;
  postalCode: string;
  streetName: string;
  streetNumber: string;
  latitude: number;
  longitude: number;
  priceForPeriod: number;
  imageUrls: string[];
  is_ev: boolean;
  is_disabled: boolean;
  is_big: boolean;
};

const moneyPLN = (value: number) => `${value} PLN`;

const toIsoDateTimeFromYmd = (ymd: string) => {
  if (!ymd) return "";
  const d = new Date(`${ymd}T00:00:00Z`);
  return Number.isFinite(d.getTime()) ? d.toISOString() : "";
};

const ParkingPreviewScreen = () => {
  const params = useLocalSearchParams<{
    parkingId?: string;
    startDate?: string; // YYYY-MM-DD
    endDate?: string; // YYYY-MM-DD
  }>();

  const parkingId =
    typeof params.parkingId === "string" ? params.parkingId : "";
  const startDateYmd =
    typeof params.startDate === "string" ? params.startDate : "";
  const endDateYmd = typeof params.endDate === "string" ? params.endDate : "";

  const startDateIso = useMemo(
    () => toIsoDateTimeFromYmd(startDateYmd),
    [startDateYmd],
  );
  const endDateIso = useMemo(
    () => toIsoDateTimeFromYmd(endDateYmd),
    [endDateYmd],
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [parking, setParking] = useState<ParkingDetails | null>(null);

  const address = useMemo(() => {
    if (!parking) return "";
    return `${parking.streetName} ${parking.streetNumber}, ${parking.postalCode} ${parking.city}, ${parking.country}`;
  }, [parking]);

  const facilities = useMemo(() => {
    if (!parking) return [];
    const out: string[] = [];
    if (parking.is_ev) out.push("✓ EV");
    if (parking.is_disabled) out.push("✓ Disabled");
    if (parking.is_big) out.push("✓ Big");
    return out;
  }, [parking]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      setParking(null);

      if (!parkingId) {
        setError("Missing parkingId.");
        setLoading(false);
        return;
      }
      if (!startDateIso || !endDateIso) {
        setError("Missing/invalid dates.");
        setLoading(false);
        return;
      }

      try {
        const url =
          `/api/parkings/${encodeURIComponent(parkingId)}` +
          `?startDate=${encodeURIComponent(startDateIso)}` +
          `&endDate=${encodeURIComponent(endDateIso)}`;

        const data = (await apiFetchParkly(url, {
          method: "GET",
        })) as ParkingDetails;
        setParking(data);
      } catch (e: any) {
        const msg =
          e?.body?.message ||
          e?.body?.error ||
          e?.body?.title ||
          e?.message ||
          "Failed to load parking details";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [parkingId, startDateIso, endDateIso]);

  const onBook = () => {
    if (!parkingId) return;

    router.push({
      pathname: "/(app)/parkly/book",
      params: {
        parkingId,
        startDate: startDateYmd,
        endDate: endDateYmd,
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.loadingText}>Loading…</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.topRow}>
          <IconButton
            icon="arrow-left"
            size={20}
            onPress={() => router.back()}
            style={styles.backBtn}
          />
          <Text style={styles.headerTitle} numberOfLines={1}>
            {parking?.name ?? "Parking"}
          </Text>
          <View style={{ width: 42 }} />
        </View>

        {error ? (
          <HelperText type="error" style={{ marginHorizontal: 16 }}>
            {error}
          </HelperText>
        ) : null}

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Parking details</Text>
        </View>

        <View style={styles.card}>
          {parking?.imageUrls?.length ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photoRow}
            >
              {parking.imageUrls.map((u, idx) => (
                <Image
                  key={`${u}.${idx}`}
                  source={{ uri: u }}
                  style={styles.photo}
                />
              ))}
            </ScrollView>
          ) : null}

          <View style={{ marginTop: 12 }}>
            <Text style={styles.placeName} numberOfLines={2}>
              {parking?.name}
            </Text>
            <Text style={styles.placeAddr} numberOfLines={3}>
              {address}
            </Text>

            <Divider style={styles.divider} />

            <Text style={styles.subHead}>Facilities</Text>
            <View style={{ marginTop: 6, gap: 4 }}>
              {facilities.length ? (
                facilities.map((t) => (
                  <Text key={t} style={styles.propLine}>
                    {t}
                  </Text>
                ))
              ) : (
                <Text style={styles.propLine}>No facilities</Text>
              )}
            </View>
          </View>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <Text style={styles.bottomPrice} numberOfLines={1}>
          {parking ? moneyPLN(parking.priceForPeriod) : "—"}
        </Text>

        <Button
          mode="contained"
          buttonColor="#0F4366"
          onPress={onBook}
          style={styles.bookBtn}
          contentStyle={styles.bookBtnContent}
          labelStyle={styles.bookBtnLabel}
        >
          Book
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#E9E8E2" },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#E9E8E2",
  },
  loadingText: { marginTop: 10, opacity: 0.75 },

  scroll: { paddingBottom: 140 },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  backBtn: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.10)",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "900",
    color: "#1F2937",
    letterSpacing: 0.2,
  },

  sectionHead: {
    marginTop: 18,
    marginHorizontal: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#1F2937",
    letterSpacing: 0.2,
  },

  card: {
    marginHorizontal: 16,
    backgroundColor: "#E9E8E2",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.10)",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },

  photoRow: { gap: 10, paddingTop: 2, paddingBottom: 2 },
  photo: {
    width: 200,
    height: 120,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.08)",
  },

  placeName: { fontSize: 17, fontWeight: "900", color: "#1F2937" },
  placeAddr: { marginTop: 4, fontSize: 12, color: "rgba(31,41,55,0.72)" },

  divider: { marginTop: 14, opacity: 0.16 },

  subHead: { marginTop: 12, fontSize: 13, fontWeight: "900", opacity: 0.9 },

  propLine: {
    fontSize: 12,
    color: "#1F2937",
    opacity: 0.85,
    lineHeight: 16,
  },

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "rgba(233,232,226,0.98)",
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.10)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 10,
  },

  bottomPrice: {
    fontSize: 16,
    fontWeight: "900",
    color: "#C42E2E",
    minWidth: 140,
  },

  bookBtn: { borderRadius: 14, flex: 1 },
  bookBtnContent: { paddingVertical: 8 },
  bookBtnLabel: { fontWeight: "900", letterSpacing: 0.2 },
});

export default ParkingPreviewScreen;
