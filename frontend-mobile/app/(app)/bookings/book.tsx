import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import {
  ActivityIndicator,
  Button,
  Divider,
  HelperText,
  Text
} from "react-native-paper";

import { apiFetchRel } from "@/src/api/client";

type OfferWithoutPrice = {
  id: string;
  name: string;
  freeCancellationHours: number;
  paymentHours: number;
  properties: Record<string, string>;
};

type Office = {
  id: string;
  name: string;
  description: string;
  openingHours: string;
  address: string;
  coordinates: { lat: number; lon: number };
  photoUrls: string[];
  contactEmail: string;
  contactPhone: string;
};

type BookingResource = {
  id: string;
  officeId: string;
  itemId: string;
  offerId: string;
  status: string;
  creationDate: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  paymentInfo: {
    status: string;
    accountNumber: string;
    receiverName: string;
    transferTitle: string;
    dueDate: string;
  };
};

type CreateBookingResponse = { id: string };

const moneyPLN = (value: number) => `${value} PLN`;

const toUserDate = (value?: string) => {
  if (!value) return "";

  const datePart = value.split("T")[0];

  if (/^\d{2}-\d{2}-\d{4}$/.test(datePart)) return datePart;

  const parts = datePart.split("-");
  if (parts.length === 3 && parts[0].length === 4) {
    const [yyyy, mm, dd] = parts;
    return `${dd}-${mm}-${yyyy}`;
  }

  return datePart;
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

const BookingScreen = () => {
  const params = useLocalSearchParams<{
    officeId: string;
    offerId: string;
    totalPrice?: string;
    startDate: string;
    endDate: string;
  }>();

  const officeId = params.officeId;
  const offerId = params.offerId;
  const startDate = params.startDate;
  const endDate = params.endDate;

  const paramPrice =
    params.totalPrice != null && params.totalPrice !== ""
      ? Number(params.totalPrice)
      : undefined;

  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [office, setOffice] = useState<Office | null>(null);
  const [offer, setOffer] = useState<OfferWithoutPrice | null>(null);

  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingResource | null>(null);

  const isBooked = !!booking || !!createdBookingId;

  const displayPrice = booking?.totalPrice ?? paramPrice;

  const dateLabel = useMemo(() => {
    const s = toUserDate(startDate);
    const e = toUserDate(endDate);
    return `${s} → ${e}`;
  }, [startDate, endDate]);

  const coverUrl = office?.photoUrls?.[0];

  const region = useMemo(() => {
    const lat = office?.coordinates?.lat ?? 52.2297;
    const lon = office?.coordinates?.lon ?? 21.0122;
    return {
      latitude: lat,
      longitude: lon,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    };
  }, [office]);

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const officeData = (await apiFetchRel(`/offices/${officeId}`, {
        method: "GET",
      })) as Office;
      setOffice(officeData);

      const offerData = (await apiFetchRel(
        `/offices/${officeId}/offers/${offerId}`,
        { method: "GET" },
      )) as OfferWithoutPrice;

      setOffer(offerData);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load booking details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [officeId, offerId, startDate, endDate]);

  const onBook = async () => {
    setBookingLoading(true);
    setError(null);

    try {
      const bookUrl =
        `/offices/${officeId}/offers/${offerId}/book` +
        `?startDate=${encodeURIComponent(startDate)}` +
        `&endDate=${encodeURIComponent(endDate)}`;

      const created = (await apiFetchRel(bookUrl, {
        method: "POST",
      })) as CreateBookingResponse;

      setCreatedBookingId(created.id);

      const bookingData = (await apiFetchRel(`/bookings/${created.id}`, {
        method: "GET",
      })) as BookingResource;

      setBooking(bookingData);
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
          {coverUrl || office?.coordinates ? (
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

          <Text style={styles.cardTitle}>Booking details</Text>
          <Divider style={{ marginVertical: 10, opacity: 0.2 }} />

          <InfoRow label="Office" value={office?.name} />
          <InfoRow label="Dates" value={dateLabel} />
          <InfoRow label="Offer" value={offer?.name} />

          <InfoRow
            label="Total price"
            value={
              displayPrice != null && !Number.isNaN(displayPrice)
                ? moneyPLN(displayPrice)
                : "—"
            }
          />

          {offer ? (
            <View style={{ marginTop: 10 }}>
              <Text style={styles.subTitle}>Rules</Text>
              <InfoRow
                label="Free cancellation"
                value={`${offer.freeCancellationHours}h before start`}
              />
              <InfoRow
                label="Payment time"
                value={`${offer.paymentHours}h after booking`}
              />
            </View>
          ) : null}
        </View>

        {booking ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Payment</Text>
            <Divider style={{ marginVertical: 10, opacity: 0.2 }} />

            <InfoRow label="Booking ID" value={booking.id} />
            <InfoRow label="Status" value={booking.status} />
            <InfoRow
              label="Amount"
              value={
                booking.totalPrice != null ? moneyPLN(booking.totalPrice) : "—"
              }
            />

            <InfoRow
              label="Due date"
              value={
                booking.paymentInfo?.dueDate
                  ? toUserDate(booking.paymentInfo.dueDate)
                  : "—"
              }
            />

            <Divider style={{ marginVertical: 10, opacity: 0.2 }} />

            <InfoRow
              label="Receiver"
              value={booking.paymentInfo?.receiverName ?? "—"}
            />
            <InfoRow
              label="Account"
              value={booking.paymentInfo?.accountNumber ?? "—"}
            />
            <InfoRow
              label="Transfer title"
              value={booking.paymentInfo?.transferTitle ?? "—"}
            />

            <View style={styles.parkingBox}>
              <Text style={styles.parkingTitle}>Want to book a parking?</Text>
              <Text style={styles.parkingText}>
                Book a nearby parking spot for the same dates.
              </Text>

              <Button
                mode="contained"
                buttonColor="#0F4366"
                onPress={() =>
                  router.push({
                    pathname: "/(app)/parkly/parkings",
                    params: {
                      startDate: startDate,
                      endDate: endDate,
                      latitude: office?.coordinates.lat,
                      longitude: office?.coordinates.lon,
                    },
                  })
                }
                style={{ marginTop: 10, borderRadius: 12 }}
                contentStyle={{ paddingVertical: 6 }}
              >
                Find parking
              </Button>
            </View>
          </View>
        ) : null}

        <View style={{ height: 110 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <Text style={styles.bottomPrice} numberOfLines={1}>
          {displayPrice != null && !Number.isNaN(displayPrice)
            ? moneyPLN(displayPrice)
            : "—"}
        </Text>

        <Button
          mode="contained"
          buttonColor="#0F4366"
          onPress={onBook}
          loading={bookingLoading}
          disabled={bookingLoading || isBooked || !offer}
          style={styles.bookBtn}
          contentStyle={styles.bookBtnContent}
        >
          {isBooked ? "Booked" : "Book"}
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "white" },
  scroll: { padding: 12 },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
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
    flex: 1.9,
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
  subTitle: { marginTop: 4, fontWeight: "900", fontSize: 13, opacity: 0.9 },

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
    color: "#C42E2E",
    minWidth: 120,
    flexShrink: 0,
  },

  bookBtn: { borderRadius: 12, flex: 1 },
  bookBtnContent: { paddingVertical: 6 },

  parkingBox: {
    marginTop: 14,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "rgba(15,67,102,0.08)",
    borderWidth: 1,
    borderColor: "rgba(15,67,102,0.18)",
  },
  parkingTitle: { fontSize: 14, fontWeight: "900", color: "#0F4366" },
  parkingText: { marginTop: 4, fontSize: 12, opacity: 0.8 },
});

export default BookingScreen;
