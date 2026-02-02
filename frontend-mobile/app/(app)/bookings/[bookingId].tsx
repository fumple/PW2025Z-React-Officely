import { apiFetchLinks, apiFetchRel } from "@/src/api/client";
import { useFiltersStore } from "@/src/filters/filtersStore";
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

type OfferDetails = {
  id: string;
  name: string;
  freeCancellationHours: number;
  paymentHours: number;
  properties?: Record<string, string>;
  _links?: {
    self?: { href: string };
  };
};

const moneyPLN = (value: number) => `${value} PLN`;

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

const paymentStatusLabel = (raw?: string) => {
  const s = String(raw ?? "");
  switch (s) {
    case "pendingPayment":
      return "Pending";
    case "received":
      return "Paid";
    case "pendingRefund":
      return "Refund pending";
    case "refunded":
      return "Refunded";
    case "cancelled":
      return "Cancelled";
    default:
      return s ? s.replace(/([a-z])([A-Z])/g, "$1 $2") : undefined;
  }
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
  const [offer, setOffer] = useState<OfferDetails | null>(null);

  const filterGroups = useFiltersStore((s) => s.filterGroups);
  const loadFilters = useFiltersStore((s) => s.loadFilters);

  useEffect(() => {
    if (!filterGroups?.length) loadFilters();
  }, [filterGroups?.length, loadFilters]);

  const labelMaps = useMemo(() => {
    const elementLabel = new Map<string, string>();
    const flagLabel = new Map<string, string>();

    for (const group of filterGroups ?? []) {
      for (const el of group.elements ?? []) {
        elementLabel.set(`${group.key}.${el.key}`, el.label);

        if ((el as any).type === "flags") {
          for (const fl of (el as any).flags ?? []) {
            flagLabel.set(`${group.key}.${el.key}.${fl.key}`, fl.label);
          }
        }
      }
    }

    return { elementLabel, flagLabel };
  }, [filterGroups]);

  const labelFromPropertyKey = (rawKey: string) => {
    const key = String(rawKey ?? "");
    const parts = key
      .split(".")
      .map((p) => p.trim())
      .filter(Boolean);

    const sectionKey = parts[0];
    const elementKey = parts[1];
    const flagKey = parts[2];

    if (sectionKey && elementKey && flagKey) {
      return (
        labelMaps.flagLabel.get(`${sectionKey}.${elementKey}.${flagKey}`) ??
        labelMaps.elementLabel.get(`${sectionKey}.${elementKey}`) ??
        elementKey
      );
    }

    if (sectionKey && elementKey) {
      return (
        labelMaps.elementLabel.get(`${sectionKey}.${elementKey}`) ?? elementKey
      );
    }

    return parts[parts.length - 1] ?? key;
  };

  const cancelHref = booking?._links?.cancel?.href;

  const dateLabel = useMemo(() => {
    if (!booking) return "";
    return `${toUserDate(booking.startDate)} → ${toUserDate(booking.endDate)}`;
  }, [booking]);

  const isCancelled = useMemo(() => {
    const s = (booking?.status ?? "").toLowerCase();
    return s.includes("cancelled");
  }, [booking?.status]);

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const bookingData = (await apiFetchRel(`/bookings/${bookingId}`, {
        method: "GET",
      })) as BookingResource;
      setBooking(bookingData);

      const [officeData, offerData] = await Promise.all([
        apiFetchRel(`/offices/${bookingData.officeId}`, {
          method: "GET",
        }) as Promise<Office>,
        apiFetchRel(
          `/offices/${bookingData.officeId}/offers/${bookingData.offerId}`,
          { method: "GET" },
        ) as Promise<OfferDetails>,
      ]);

      setOffice(officeData);
      setOffer(offerData);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load booking");
      setOffer(null);
      setOffice(null);
      setBooking(null);
    } finally {
      setLoading(false);
    }
  };

  const onCancel = async () => {
    if (!cancelHref || isCancelled) return;

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

  const image = office?.photoUrls?.[0];

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

          {image ? (
            <Image source={{ uri: image }} style={styles.photo} />
          ) : null}

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

          <InfoRow label="Created" value={toUserDate(booking.creationDate)} />
        </View>

        {offer ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Offer</Text>
            <Divider style={{ marginVertical: 10, opacity: 0.2 }} />

            <InfoRow label="Offer name" value={offer.name} />
            <InfoRow
              label="Free cancellation"
              value={`${offer.freeCancellationHours}h`}
            />
            <InfoRow label="Payment time" value={`${offer.paymentHours}h`} />

            {offer.properties && Object.keys(offer.properties).length ? (
              <View style={{ marginTop: 10 }}>
                <Text style={[styles.infoLabel, { marginBottom: 6 }]}>
                  Properties
                </Text>

                <View style={styles.propsWrap}>
                  {Object.entries(offer.properties).map(([k, v]) => {
                    const label = labelFromPropertyKey(k);
                    const valueText = String(v ?? "").trim();

                    if (!valueText || valueText.toLowerCase() === "true") {
                      return (
                        <Text key={k} style={styles.propLine}>
                          ✓ {label}
                        </Text>
                      );
                    }

                    return (
                      <Text key={k} style={styles.propLine}>
                        ✓ {label}: {valueText}
                      </Text>
                    );
                  })}
                </View>
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment</Text>
          <Divider style={{ marginVertical: 10, opacity: 0.2 }} />

          <InfoRow
            label="Payment status"
            value={paymentStatusLabel(booking.paymentInfo.status)}
          />

          <InfoRow
            label="Due date"
            value={toUserDate(booking.paymentInfo.dueDate)}
          />

          <InfoRow label="Receiver" value={booking.paymentInfo.receiverName} />
          <InfoRow label="Account" value={booking.paymentInfo.accountNumber} />
          <InfoRow
            label="Transfer title"
            value={booking.paymentInfo.transferTitle}
          />
          <InfoRow label="Amount" value={moneyPLN(booking.totalPrice)} />
        </View>

        {cancelHref ? (
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
        ) : null}

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

  propsWrap: { gap: 4 },
  propLine: { fontSize: 12, opacity: 0.85, lineHeight: 16 },
});

export default BookingDetailsScreen;
