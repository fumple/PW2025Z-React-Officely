import { apiFetchLinks } from "@/src/api/client";
import { PARKLY_BASE_URL } from "@/src/config";
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

type Link = { href: string };

type ParklyBookingResourceWithLink = {
  id?: string;
  userId?: string;
  spotId?: string;
  parkingName?: string;
  street?: string;
  city?: string;
  imageUrl?: string;
  localId?: string;
  start?: string;
  end?: string;
  totalCost?: number;
  status?: "Confirmed" | "Cancelled" | "Completed" | "InProgress";
  source?: "parkly" | "officely";
  disabled?: boolean;
  ev?: boolean;
  big?: boolean;
  _links?: {
    self?: Link;
    update?: Link;
    cancel?: Link;
  };
};

const moneyPLN = (value?: number) =>
  typeof value === "number" ? `${value} PLN` : undefined;

const toDateOnly = (value?: string) => {
  if (!value) return undefined;
  const s = String(value);
  return s.length >= 10 ? s.slice(0, 10) : s;
};

const toUserDate = (value?: string) => {
  const d = toDateOnly(value);
  if (!d) return undefined;

  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
  if (!m) return d;

  const yyyy = m[1];
  const mm = m[2];
  const dd = m[3];
  return `${dd}-${mm}-${yyyy}`;
};

const formatDateTimeUser = (value?: string) => {
  if (!value) return undefined;
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return value;

  const dd = String(dt.getDate()).padStart(2, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const yyyy = String(dt.getFullYear());
  const hh = String(dt.getHours()).padStart(2, "0");
  const min = String(dt.getMinutes()).padStart(2, "0");
  return `${dd}-${mm}-${yyyy} ${hh}:${min}`;
};

const InfoRow = ({ label, value }: { label: string; value?: string }) => {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
};

const ParklyBookingDetailsScreen = () => {
  const params = useLocalSearchParams<{
    bookingId: string;

    userId?: string;
    spotId?: string;
    parkingName?: string;
    street?: string;
    city?: string;
    imageUrl?: string;
    localId?: string;
    start?: string;
    end?: string;
    totalCost?: string;
    status?: string;
    source?: string;
    disabled?: string;
    ev?: string;
    big?: string;
  }>();

  const bookingId = String(params.bookingId ?? "");

  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [booking, setBooking] = useState<ParklyBookingResourceWithLink | null>(
    () => ({
      id: bookingId,
      userId: params.userId,
      spotId: params.spotId,
      parkingName: params.parkingName,
      street: params.street,
      city: params.city,
      imageUrl: params.imageUrl,
      localId: params.localId,
      start: params.start,
      end: params.end,
      totalCost:
        params.totalCost !== undefined ? Number(params.totalCost) : undefined,
      status: params.status as any,
      source: params.source as any,
      disabled: params.disabled === "true",
      ev: params.ev === "true",
      big: params.big === "true",
    }),
  );

  const address = useMemo(
    () => [booking?.street, booking?.city].filter(Boolean).join(", "),
    [booking?.street, booking?.city],
  );

  const isCancelled = useMemo(() => {
    const s = String(booking?.status ?? "").toLowerCase();
    return s.includes("cancel");
  }, [booking?.status]);

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = (await apiFetchLinks(
        `${PARKLY_BASE_URL}/bookings/${bookingId}`,
        { method: "GET" },
      )) as ParklyBookingResourceWithLink;

      setBooking((prev) => ({
        ...(prev ?? {}),
        ...(data ?? {}),
        id: String(data?.id ?? bookingId),
      }));
    } catch (e: any) {
      setError(e?.message ?? "Failed to load Parkly booking");
    } finally {
      setLoading(false);
    }
  };

  const onCancel = async () => {
    if (!bookingId || isCancelled) return;

    setCancelLoading(true);
    setError(null);

    try {
      await apiFetchLinks(`${PARKLY_BASE_URL}/bookings/${bookingId}`, {
        method: "DELETE",
      });
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Failed to cancel Parkly booking");
    } finally {
      setCancelLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [bookingId]);

  if (loading && !booking) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={{ marginTop: 10, opacity: 0.7 }}>Loading…</Text>
      </View>
    );
  }

  if (error && !booking) {
    return (
      <View style={styles.center}>
        <Text style={{ opacity: 0.8 }}>{error}</Text>
        <Button style={{ marginTop: 12 }} mode="contained" onPress={load}>
          Retry
        </Button>
        <Button
          style={{ marginTop: 8 }}
          onPress={() => router.replace("/(app)/bookings/index")}
        >
          Back
        </Button>
      </View>
    );
  }

  const image = booking?.imageUrl;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.topRow}>
          <IconButton
            icon="arrow-left"
            size={22}
            onPress={() => router.back()}
            style={styles.iconBtn}
          />
          <Text style={styles.headerTitle} numberOfLines={1}>
            Parkly booking details
          </Text>
          <View style={{ width: 42 }} />
        </View>

        {error ? (
          <HelperText type="error" style={{ marginHorizontal: 16 }}>
            {error}
          </HelperText>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Parking</Text>
          <Divider style={{ marginVertical: 10, opacity: 0.2 }} />

          {image ? (
            <Image source={{ uri: image }} style={styles.photo} />
          ) : null}

          <InfoRow label="Name" value={booking?.parkingName} />
          <InfoRow label="Address" value={address || undefined} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Booking</Text>
          <Divider style={{ marginVertical: 10, opacity: 0.2 }} />

          <InfoRow label="Booking ID" value={booking?.id} />
          <InfoRow label="Status" value={booking?.status} />
          <InfoRow label="Total cost" value={moneyPLN(booking?.totalCost)} />

          <InfoRow label="Start" value={formatDateTimeUser(booking?.start)} />
          <InfoRow label="End" value={formatDateTimeUser(booking?.end)} />

          <InfoRow label="Local ID" value={booking?.localId} />
          <InfoRow label="Spot ID" value={booking?.spotId} />
          <InfoRow label="Source" value={booking?.source} />

          <InfoRow
            label="EV"
            value={
              booking?.ev === undefined ? undefined : booking.ev ? "Yes" : "No"
            }
          />
          <InfoRow
            label="Disabled"
            value={
              booking?.disabled === undefined
                ? undefined
                : booking.disabled
                  ? "Yes"
                  : "No"
            }
          />
          <InfoRow
            label="Big"
            value={
              booking?.big === undefined
                ? undefined
                : booking.big
                  ? "Yes"
                  : "No"
            }
          />
        </View>

        <View style={{ marginTop: 12 }}>
          <Button
            mode="contained"
            buttonColor={isCancelled ? undefined : "#C42E2E"}
            style={{ borderRadius: 12 }}
            contentStyle={{ paddingVertical: 6 }}
            onPress={onCancel}
            loading={cancelLoading}
            disabled={cancelLoading || isCancelled}
          >
            {isCancelled ? "Booking cancelled" : "Cancel booking"}
          </Button>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "white" },
  scroll: { padding: 16, paddingBottom: 24 },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: "white",
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 4,
    marginBottom: 10,
  },
  iconBtn: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.12)",
    borderRadius: 999,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "800",
  },

  card: {
    backgroundColor: "#E9E8E2",
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  cardTitle: { fontSize: 16, fontWeight: "900" },

  photo: {
    width: "100%",
    height: 160,
    borderRadius: 12,
    backgroundColor: "#ddd",
    marginBottom: 10,
  },

  infoRow: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.65)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  infoLabel: { fontSize: 11, opacity: 0.7, fontWeight: "800" },
  infoValue: { marginTop: 2, fontSize: 14, fontWeight: "900" },
});

export default ParklyBookingDetailsScreen;
