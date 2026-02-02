import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import {
  ActivityIndicator,
  Button,
  Divider,
  HelperText,
  IconButton,
  Text,
} from "react-native-paper";

import { apiFetchLinks } from "@/src/api/client";
import { PARKLY_BASE_URL } from "@/src/config";

type ParkingDetailsResponse = {
  id?: string;
  name?: string;
  country?: string;
  city?: string;
  postalCode?: string;
  streetName?: string;
  streetNumber?: string;
  latitude?: number;
  longitude?: number;
  priceForPeriod?: number;
  imageUrls?: string[];
  disabled?: boolean;
  ev?: boolean;
  big?: boolean;
  _links?: { self?: { href: string } };
};

type ParklyCreateBookingResponse = {
  id?: string;
  localId?: string;
  start?: string;
  end?: string;
  totalCost?: number;
  status?: "Confirmed" | "Cancelled" | "Completed" | "InProgress";
  disabled?: boolean;
  ev?: boolean;
  big?: boolean;
};

type ParklyBookingDetailsResponse = {
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
  _links?: { self?: { href: string } };
};

const moneyPLN = (value?: number) =>
  typeof value === "number" && Number.isFinite(value) ? `${value} PLN` : "—";

const pad2 = (n: number) => String(n).padStart(2, "0");

const toApiDate = (raw?: string) => {
  if (typeof raw !== "string") return "";
  const s = raw.trim();
  if (!s) return "";

  const iso10 = s.slice(0, 10);
  const mIso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(iso10);
  if (mIso) {
    const yyyy = Number(mIso[1]);
    const mm = Number(mIso[2]);
    const dd = Number(mIso[3]);
    if (mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31) {
      return `${yyyy}-${pad2(mm)}-${pad2(dd)}`;
    }
  }

  const mEu = /^(\d{1,2})[._/-](\d{1,2})[._/-](\d{4})$/.exec(s);
  if (mEu) {
    const dd = Number(mEu[1]);
    const mm = Number(mEu[2]);
    const yyyy = Number(mEu[3]);
    if (mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31) {
      return `${yyyy}-${pad2(mm)}-${pad2(dd)}`;
    }
  }

  return "";
};

const parseApiDate = (apiDate: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(apiDate)) return undefined;
  const d = new Date(`${apiDate}T00:00:00`);
  return Number.isFinite(d.getTime()) ? d : undefined;
};

const toUserDate = (value?: string) => {
  if (!value) return "";
  const datePart = value.split("T")[0];
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
  if (!m) return datePart;
  return `${m[3]}-${m[2]}-${m[1]}`;
};

const InfoRow = ({ label, value }: { label: string; value?: string }) => {
  if (value == null || value === "") return null;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
};

const ParklyBookingScreen = () => {
  const params = useLocalSearchParams<{
    parkingId?: string;
    startDate?: string;
    endDate?: string;
    isEv?: string;
    isDisabled?: string;
    isBig?: string;
  }>();

  const parkingId = String(params.parkingId ?? "");

  const startDate = useMemo(
    () => toApiDate(params.startDate),
    [params.startDate],
  );
  const endDate = useMemo(() => toApiDate(params.endDate), [params.endDate]);

  const requestedIsEv = params.isEv === "true";
  const requestedIsDisabled = params.isDisabled === "true";
  const requestedIsBig = params.isBig === "true";

  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [parking, setParking] = useState<ParkingDetailsResponse | null>(null);
  const [createdBooking, setCreatedBooking] =
    useState<ParklyCreateBookingResponse | null>(null);
  const [bookingDetails, setBookingDetails] =
    useState<ParklyBookingDetailsResponse | null>(null);

  const isBooked = !!bookingDetails || !!createdBooking?.id;

  const datesOk = useMemo(() => {
    const s = parseApiDate(startDate);
    const e = parseApiDate(endDate);
    return !!s && !!e && s <= e;
  }, [startDate, endDate]);

  const displayPrice =
    bookingDetails?.totalCost ??
    createdBooking?.totalCost ??
    parking?.priceForPeriod;

  const coverUrl = parking?.imageUrls?.[0];

  const region = useMemo(() => {
    const lat = parking?.latitude ?? 52.2297;
    const lon = parking?.longitude ?? 21.0122;
    return {
      latitude: lat,
      longitude: lon,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    };
  }, [parking]);

  const addressLine = useMemo(() => {
    if (!parking) return "";
    const street =
      `${parking.streetName ?? ""} ${parking.streetNumber ?? ""}`.trim();
    const cityLine = `${parking.postalCode ?? ""} ${parking.city ?? ""}`.trim();
    const country = (parking.country ?? "").trim();
    return [street, cityLine, country].filter(Boolean).join(", ");
  }, [parking]);

  const dateLabel = useMemo(
    () => `${toUserDate(startDate)} → ${toUserDate(endDate)}`,
    [startDate, endDate],
  );

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!parkingId || !startDate || !endDate) {
        throw new Error("Missing parkingId/startDate/endDate");
      }
      if (!datesOk) {
        throw new Error(
          "Invalid dates (must be YYYY-MM-DD and startDate <= endDate)",
        );
      }

      const url =
        `${PARKLY_BASE_URL}/parkings/${parkingId}` +
        `?startDate=${encodeURIComponent(startDate)}` +
        `&endDate=${encodeURIComponent(endDate)}`;

      const details = (await apiFetchLinks(url, {
        method: "GET",
      })) as ParkingDetailsResponse;
      setParking(details);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load booking screen");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [parkingId, startDate, endDate]);

  const onBook = async () => {
    if (!parkingId || !startDate || !endDate || !datesOk) return;

    setBookingLoading(true);
    setError(null);

    try {
      const created = (await apiFetchLinks(`${PARKLY_BASE_URL}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parkingId,
          startDate,
          endDate,
          disabled: requestedIsDisabled,
          ev: requestedIsEv,
          big: requestedIsBig,
        }),
      })) as ParklyCreateBookingResponse;

      if (!created?.id) throw new Error("Booking created but no id returned");

      setCreatedBooking(created);

      const details = (await apiFetchLinks(
        `${PARKLY_BASE_URL}/bookings/${created.id}`,
        {
          method: "GET",
        },
      )) as ParklyBookingDetailsResponse;

      setBookingDetails(details);
    } catch (e: any) {
      setError(e?.message ?? "Booking failed");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={{ marginTop: 10, opacity: 0.7 }}>Loading…</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.topRow}>
          <IconButton
            icon="arrow-left"
            size={22}
            onPress={() => router.back()}
            style={styles.iconBtn}
            iconColor={stylesVars.colors.text}
          />
          <Text style={styles.headerTitle} numberOfLines={1}>
            Booking
          </Text>
          <View style={{ width: 42 }} />
        </View>

        {error ? (
          <HelperText type="error" style={{ marginHorizontal: 16 }}>
            {error}
          </HelperText>
        ) : null}

        <View style={styles.card}>
          {coverUrl || parking?.latitude ? (
            <View style={styles.mediaRow}>
              {coverUrl ? (
                <Image
                  source={{ uri: coverUrl }}
                  style={styles.coverImageRow}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.coverPlaceholder} />
              )}

              <View style={styles.miniMapWrap}>
                <MapView
                  style={StyleSheet.absoluteFill}
                  initialRegion={region}
                  scrollEnabled
                  zoomEnabled
                  pitchEnabled={false}
                  rotateEnabled={false}
                >
                  <Marker
                    coordinate={{
                      latitude: region.latitude,
                      longitude: region.longitude,
                    }}
                  />
                </MapView>
              </View>
            </View>
          ) : null}

          <Text style={styles.cardTitle}>Parking booking details</Text>
          <Divider style={{ marginVertical: 10, opacity: 0.2 }} />

          <InfoRow
            label="Parking"
            value={parking?.name ?? bookingDetails?.parkingName}
          />
          <InfoRow label="Address" value={addressLine || undefined} />
          <InfoRow label="Dates" value={dateLabel} />
          <InfoRow
            label="Total price"
            value={displayPrice != null ? moneyPLN(displayPrice) : "—"}
          />
        </View>

        {bookingDetails ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Reservation</Text>
            <Divider style={{ marginVertical: 10, opacity: 0.2 }} />

            <InfoRow label="Booking ID" value={bookingDetails.id} />
            <InfoRow label="Local ID" value={bookingDetails.localId} />
            <InfoRow label="Status" value={bookingDetails.status} />
            <InfoRow
              label="Start"
              value={
                bookingDetails.start ? toUserDate(bookingDetails.start) : "—"
              }
            />
            <InfoRow
              label="End"
              value={bookingDetails.end ? toUserDate(bookingDetails.end) : "—"}
            />
            <InfoRow
              label="Total cost"
              value={moneyPLN(bookingDetails.totalCost)}
            />

            <Divider style={{ marginVertical: 10, opacity: 0.2 }} />

            <InfoRow
              label="Features"
              value={
                [
                  bookingDetails.ev ? "EV" : null,
                  bookingDetails.disabled ? "Disabled" : null,
                  bookingDetails.big ? "Big" : null,
                ]
                  .filter(Boolean)
                  .join(", ") || "—"
              }
            />

            <Button
              mode="contained"
              buttonColor={stylesVars.colors.primary}
              style={{ marginTop: 12, borderRadius: 12 }}
              contentStyle={{ paddingVertical: 6 }}
              onPress={() => router.replace({ pathname: "/(app)/bookings" })}
            >
              Go to my bookings
            </Button>
          </View>
        ) : null}

        <View style={{ height: 110 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <Text style={styles.bottomPrice} numberOfLines={1}>
          {moneyPLN(displayPrice)}
        </Text>

        <Button
          mode="contained"
          buttonColor={stylesVars.colors.primary}
          onPress={onBook}
          loading={bookingLoading}
          disabled={bookingLoading || isBooked || !parking || !datesOk}
          style={styles.bookBtn}
          contentStyle={styles.bookBtnContent}
          labelStyle={styles.bookBtnLabel}
        >
          {isBooked ? "Booked" : "Book"}
        </Button>
      </View>
    </View>
  );
};

const stylesVars = {
  colors: {
    bg: "#FFFFFF",
    card: "#E9E8E2",
    text: "#1F2937",
    muted: "rgba(31,41,55,0.72)",
    border: "rgba(0,0,0,0.10)",
    primary: "#0F4366",
    danger: "#C42E2E",
  },
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: stylesVars.colors.bg },
  scroll: { padding: 12 },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: stylesVars.colors.bg,
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
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "900",
    color: stylesVars.colors.text,
  },

  mediaRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
    marginBottom: 12,
  },

  coverImageRow: {
    flex: 1,
    height: 160,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.06)",
  },

  coverPlaceholder: {
    flex: 1,
    height: 160,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.06)",
  },

  miniMapWrap: {
    flex: 1,
    height: 160,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.06)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },

  card: {
    backgroundColor: stylesVars.colors.card,
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  cardTitle: { fontSize: 16, fontWeight: "900", color: stylesVars.colors.text },

  infoRow: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.65)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  infoLabel: {
    fontSize: 11,
    opacity: 0.7,
    fontWeight: "800",
    color: stylesVars.colors.text,
  },
  infoValue: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: "900",
    color: stylesVars.colors.text,
  },

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.08)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  bottomPrice: {
    fontSize: 18,
    fontWeight: "900",
    color: stylesVars.colors.danger,
    minWidth: 120,
    flexShrink: 0,
  },

  bookBtn: { borderRadius: 12, flex: 1 },
  bookBtnContent: { paddingVertical: 6 },
  bookBtnLabel: { fontWeight: "900", letterSpacing: 0.2 },
});

export default ParklyBookingScreen;
