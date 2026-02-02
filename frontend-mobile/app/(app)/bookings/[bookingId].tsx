import { apiFetchLinks, apiFetchRel } from "@/src/api/client";
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
  _links?: {
    office?: { href: string };
    offer?: { href: string };
    item?: { href: string };
    cancel?: { href: string };
    self?: { href: string };
  };
};

type Office = {
  id: string;
  name: string;
  address: string;
  photoUrls: string[];
  contactEmail?: string;
  contactPhone?: string;
};

const moneyPLN = (value: number) => {
  return `${value} PLN`;
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

const BookingDetailsScreen = () => {
  const params = useLocalSearchParams<{ bookingId: string }>();
  const bookingId = String(params.bookingId ?? "");

  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [booking, setBooking] = useState<BookingResource | null>(null);
  const [office, setOffice] = useState<Office | null>(null);

  const cancelHref = booking?._links?.cancel?.href;

  const dateLabel = useMemo(() => {
    if (!booking) return "";
    return `${booking.startDate} → ${booking.endDate}`;
  }, [booking]);

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const bookingData = (await apiFetchRel(`/bookings/${bookingId}`, {
        method: "GET",
      })) as BookingResource;
      setBooking(bookingData);

      const officeData = (await apiFetchRel(
        `/offices/${bookingData.officeId}`,
        {
          method: "GET",
        },
      )) as Office;
      setOffice(officeData);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load booking");
    } finally {
      setLoading(false);
    }
  };

  const onCancel = async () => {
    if (!cancelHref) return;

    setCancelLoading(true);
    setError(null);

    try {
      await apiFetchLinks(cancelHref, { method: "POST" });
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Failed to cancel booking");
    } finally {
      setCancelLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [bookingId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={{ marginTop: 10, opacity: 0.7 }}>Loading…</Text>
      </View>
    );
  }

  if (error || !booking) {
    return (
      <View style={styles.center}>
        <Text style={{ opacity: 0.8 }}>{error ?? "Booking not found"}</Text>
        <Button style={{ marginTop: 12 }} mode="contained" onPress={load}>
          Retry
        </Button>
        <Button style={{ marginTop: 8 }} onPress={() => router.back()}>
          Back
        </Button>
      </View>
    );
  }

  const image = office?.photoUrls[0];

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
            Booking details
          </Text>
          <View style={{ width: 42 }} />
        </View>

        {error ? (
          <HelperText type="error" style={{ marginHorizontal: 16 }}>
            {error}
          </HelperText>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Office</Text>
          <Divider style={{ marginVertical: 10, opacity: 0.2 }} />

          <Image source={{ uri: image }} style={styles.photo} />
          <InfoRow label="Name" value={office?.name} />
          <InfoRow label="Address" value={office?.address} />
          <InfoRow label="Dates" value={dateLabel} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Booking</Text>
          <Divider style={{ marginVertical: 10, opacity: 0.2 }} />

          <InfoRow label="Booking ID" value={booking.id} />
          <InfoRow label="Status" value={booking.status} />
          <InfoRow label="Total price" value={moneyPLN(booking.totalPrice)} />
          <InfoRow label="Created" value={booking.creationDate} />
          {cancelHref ? (
            <Button
              mode="contained"
              buttonColor="#C42E2E"
              style={{ marginTop: 12, borderRadius: 12 }}
              contentStyle={{ paddingVertical: 6 }}
              onPress={onCancel}
              loading={cancelLoading}
              disabled={cancelLoading}
            >
              Cancel booking
            </Button>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment</Text>
          <Divider style={{ marginVertical: 10, opacity: 0.2 }} />

          <InfoRow label="Payment status" value={booking.paymentInfo.status} />
          <InfoRow label="Due date" value={booking.paymentInfo.dueDate} />
          <InfoRow label="Receiver" value={booking.paymentInfo.receiverName} />
          <InfoRow label="Account" value={booking.paymentInfo.accountNumber} />
          <InfoRow
            label="Transfer title"
            value={booking.paymentInfo.transferTitle}
          />
          <InfoRow label="Amount" value={moneyPLN(booking.totalPrice)} />
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
export default BookingDetailsScreen;
