import { apiFetch } from "@/src/api/client";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Image, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  SegmentedButtons,
  Text,
} from "react-native-paper";

const DEFAULT_PAGE_SIZE = 20;

//TODO: Why does the logo glitch?
type Booking = {
  id: string;
  officeId: string;
  itemId: string;
  offerId: string;
  status: string;
  creationDate: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  _links?: {
    self?: { href: string };
    office?: { href: string };
    item?: { href: string };
    offer?: { href: string };
    cancel?: { href: string };
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

type BookingsResponse = {
  bookings: Booking[];
  _pagination: {
    currentPage: number;
    lastPage: number;
    pageSize: number;
  };
  _links: {
    self?: { href: string };
    next?: { href: string };
    prev?: { href: string };
    first?: { href: string };
    last?: { href: string };
  };
};

type BookingWithOffice = Booking & { office: Office };

const dayStart = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const toDate = (date: string) => {
  return new Date(date);
};

const isPast = (booking: Booking) => {
  const bookingEnd: Date = toDate(booking.endDate);
  return dayStart(bookingEnd).getTime() < dayStart(new Date()).getTime();
};
const isCurrent = (booking: Booking) => {
  const today = dayStart(new Date()).getTime();
  const start = dayStart(toDate(booking.startDate)).getTime();
  const end = dayStart(toDate(booking.endDate)).getTime();
  return start <= today && today <= end;
};

const formatDate = (date: Date) => {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${d}-${m}-${y}`;
};

const dateRange = (startDate: string, endDate: string) => {
  const start = formatDate(toDate(startDate));
  const end = formatDate(toDate(endDate));
  return `${start} - ${end}`;
};

const BookingCard = ({
  booking,
  tab,
}: {
  booking: BookingWithOffice;
  tab: string;
}) => {
  const officeName = booking.office.name;
  const img = booking.office.photoUrls[0];

  return (
    <View style={styles.card}>
      <Image
        source={{ uri: img }}
        style={[styles.cardImage, tab === "past" ? styles.imagePast : null]}
      />

      <View style={styles.cardRight}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {officeName}
        </Text>

        <Text
          style={[
            styles.cardDate,
            isCurrent(booking) ? styles.dateCurrent : null,
          ]}
        >
          {dateRange(booking.startDate, booking.endDate)}
        </Text>

        <Button
          mode="contained"
          buttonColor="#0F4366"
          style={styles.detailsBtn}
          contentStyle={styles.detailsBtnContent}
          onPress={() => {
            router.push({
              pathname: "./bookings/[bookingId]",
              params: { bookingId: booking.id },
            });
          }}
        >
          View Details
        </Button>
      </View>
    </View>
  );
};

const BookingsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<BookingWithOffice[]>([]);
  const [currentHref, setCurrentHref] = useState(
    `/bookings?pageSize=${DEFAULT_PAGE_SIZE}&pageToken=0`,
  );
  const [nextHref, setNextHref] = useState<string | null>(null);
  const [prevHref, setPrevHref] = useState<string | null>(null);
  const officeCacheRef = useRef<Record<string, Office>>({});

  const { tab: param } = useLocalSearchParams<{
    tab?: string;
  }>();
  const [tab, setTab] = useState<string>(param === "past" ? "past" : "current");

  const loadBookings = async (
    href: string = `/bookings?pageSize=${DEFAULT_PAGE_SIZE}&pageToken=0`,
  ) => {
    setLoading(true);
    setError(null);

    try {
      const data = (await apiFetch(href, {
        method: "GET",
      })) as BookingsResponse;
      const raw = Array.isArray(data.bookings) ? data.bookings : [];

      setCurrentHref(href);
      setNextHref(data._links?.next?.href ?? null);
      setPrevHref(data._links?.prev?.href ?? null);

      const cache = officeCacheRef.current;
      const officeIds = Array.from(
        new Set(raw.map((booking) => booking.officeId)),
      );
      const missing = officeIds.filter((id) => !cache[id]);

      if (missing.length > 0) {
        const offices = await Promise.all(
          missing.map(async (id) => {
            return await apiFetch(`/offices/${id}`, { method: "GET" });
          }),
        );

        for (const office of offices) cache[office.id] = office;
      }

      const merged: BookingWithOffice[] = raw.map((booking) => ({
        ...booking,
        office: cache[booking.officeId],
      }));

      setBookings(merged);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const { currentFuture, past } = useMemo(() => {
    const currentFuture = bookings
      .filter((b) => !isPast(b))
      .sort(
        (a, b) => toDate(a.startDate).getTime() - toDate(b.startDate).getTime(),
      );

    const past = bookings
      .filter((b) => isPast(b))
      .sort(
        (a, b) => toDate(b.startDate).getTime() - toDate(a.startDate).getTime(),
      );

    return { currentFuture, past };
  }, [bookings]);

  const data = tab === "current" ? currentFuture : past;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text>{error}</Text>
        <Button
          onPress={() => loadBookings(currentHref)}
          style={{ marginTop: 12 }}
        >
          Retry
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <SegmentedButtons
        value={tab}
        onValueChange={(value) => setTab(value)}
        buttons={[
          { value: "current", label: "Current / Future" },
          { value: "past", label: "Past" },
        ]}
        style={styles.segment}
      />

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {tab === "current"
              ? "No current/future bookings."
              : "No past bookings."}
          </Text>
        }
        renderItem={({ item }) => <BookingCard booking={item} tab={tab} />}
      />
      <View style={{ flexDirection: "row", gap: 12, padding: 16 }}>
        <Button
          mode="contained"
          disabled={!prevHref || loading}
          onPress={() => prevHref && loadBookings(prevHref)}
          style={{ flex: 1 }}
        >
          Previous
        </Button>

        <Button
          mode="contained"
          disabled={!nextHref || loading}
          onPress={() => nextHref && loadBookings(nextHref)}
          style={{ flex: 1 }}
        >
          Next
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "white" },

  pageTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 10,
  },

  segment: { marginTop: 10, marginHorizontal: 16, marginBottom: 12 },

  list: { paddingHorizontal: 16, paddingBottom: 24, gap: 14 },

  empty: { textAlign: "center", marginTop: 30, opacity: 0.7 },

  center: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },

  card: {
    backgroundColor: "#E9E8E2",
    borderRadius: 14,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  cardImage: {
    width: 118,
    height: 78,
    borderRadius: 10,
    backgroundColor: "#ddd",
  },

  imagePast: { opacity: 0.55 },

  cardRight: { flex: 1, paddingLeft: 12 },

  cardTitle: { fontSize: 16, fontWeight: "800", marginBottom: 4 },

  cardDate: { fontSize: 12, marginBottom: 10 },

  dateCurrent: { color: "#C42E2E", fontWeight: "700" },

  detailsBtn: { alignSelf: "flex-start", borderRadius: 10 },
  detailsBtnContent: { paddingHorizontal: 18, paddingVertical: 4 },
});

export default BookingsScreen;
