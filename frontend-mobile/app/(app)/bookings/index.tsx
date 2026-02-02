import { apiFetchLinks, apiFetchRel } from "@/src/api/client";
import { API_BASE_URL } from "@/src/config";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { FlatList, Image, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  IconButton,
  SegmentedButtons,
  Text,
} from "react-native-paper";

const DEFAULT_PAGE_SIZE = 20;

type Tab = "active" | "past" | "cancelled";

const makeFirstPageLink = (tab: Tab) =>
  `${API_BASE_URL}/bookings?status=${tab}&pageSize=${DEFAULT_PAGE_SIZE}`;

type Link = { href: string };

type PaymentInfo = {
  status:
    | "pendingPayment"
    | "received"
    | "pendingRefund"
    | "refunded"
    | "cancelled";
  accountNumber: string;
  receiverName: string;
  transferTitle: string;
  dueDate: string;
};

type Booking = {
  id: string;
  officeId: string;
  itemId: string;
  offerId: string;
  status: "active" | "cancelledByUser" | "cancelledByStaff";
  creationDate: string;
  startDate: string;
  endDate: string;
  cancellationReason?: string;
  totalPrice: number;
  paymentInfo: PaymentInfo;
  _links: {
    self: Link;
    office: Link;
    item: Link;
    offer: Link;
    cancel?: Link;
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
    self: Link;
    next?: Link;
    prev?: Link;
    first: Link;
    last: Link;
  };
};

type BookingWithOffice = Booking & { office: Office };

const dayStart = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const toDate = (date: string) => new Date(date);

const isActiveNow = (booking: Booking) => {
  const today = dayStart(new Date()).getTime();
  const start = dayStart(toDate(booking.startDate)).getTime();
  const end = dayStart(toDate(booking.endDate)).getTime();
  return start <= today && today <= end;
};

const formatDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${d}-${m}-${y}`;
};

const dateRange = (startDate: string, endDate: string) => {
  return `${formatDate(toDate(startDate))} - ${formatDate(toDate(endDate))}`;
};

const BookingCard = ({
  booking,
  tab,
}: {
  booking: BookingWithOffice;
  tab: Tab;
}) => {
  const officeName = booking.office.name;
  const img = booking.office.photoUrls?.[0];

  return (
    <View style={styles.card}>
      <Image
        source={img ? { uri: img } : undefined}
        style={[
          styles.cardImage,
          tab === "past" || tab === "cancelled" ? styles.imagePast : null,
        ]}
      />

      <View style={styles.cardRight}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {officeName}
        </Text>

        <Text
          style={[
            styles.cardDate,
            tab === "active" && isActiveNow(booking)
              ? styles.dateCurrent
              : null,
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

  const [bookingsByTab, setBookingsByTab] = useState<
    Record<Tab, BookingWithOffice[]>
  >({ active: [], past: [], cancelled: [] });

  const [currentHrefByTab, setCurrentHrefByTab] = useState<Record<Tab, string>>(
    {
      active: makeFirstPageLink("active"),
      past: makeFirstPageLink("past"),
      cancelled: makeFirstPageLink("cancelled"),
    },
  );

  const [nextHrefByTab, setNextHrefByTab] = useState<
    Record<Tab, string | null>
  >({
    active: null,
    past: null,
    cancelled: null,
  });

  const [prevHrefByTab, setPrevHrefByTab] = useState<
    Record<Tab, string | null>
  >({
    active: null,
    past: null,
    cancelled: null,
  });

  const officeCacheRef = useRef<Record<string, Office>>({});
  const scrollRef = useRef<FlatList>(null);

  const { tab: paramTab } = useLocalSearchParams<{ tab?: string }>();
  const tab: Tab =
    paramTab === "past"
      ? "past"
      : paramTab === "cancelled"
        ? "cancelled"
        : "active";

  const loadBookings = useCallback(async (t: Tab, href?: string) => {
    setLoading(true);
    setError(null);

    const pageHref = href ?? makeFirstPageLink(t);

    try {
      const data = (await apiFetchLinks(pageHref, {
        method: "GET",
      })) as BookingsResponse;

      const raw: Booking[] = Array.isArray((data as any)?.bookings)
        ? (data as any).bookings
        : [];

      setCurrentHrefByTab((prev) => ({ ...prev, [t]: pageHref }));
      setNextHrefByTab((prev) => ({
        ...prev,
        [t]: (data as any)?._links?.next?.href ?? null,
      }));
      setPrevHrefByTab((prev) => ({
        ...prev,
        [t]: (data as any)?._links?.prev?.href ?? null,
      }));

      const cache = officeCacheRef.current;
      const officeIds = Array.from(new Set(raw.map((b) => b.officeId)));
      const missing = officeIds.filter((id) => !cache[id]);

      if (missing.length > 0) {
        const offices = await Promise.all(
          missing.map((id) => apiFetchRel(`/offices/${id}`, { method: "GET" })),
        );
        for (const office of offices as Office[])
          cache[(office as Office).id] = office as Office;
      }

      const bookingsWithOffices: BookingWithOffice[] = raw
        .map((b) => {
          const office = cache[b.officeId];
          if (!office) return null;
          return { ...b, office };
        })
        .filter(Boolean) as BookingWithOffice[];

      setBookingsByTab((prev) => ({ ...prev, [t]: bookingsWithOffices }));
    } catch (e: any) {
      setError(e?.message ?? "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setError(null);
      setLoading(true);

      setBookingsByTab((prev) => ({ ...prev, [tab]: [] }));

      setNextHrefByTab((prev) => ({ ...prev, [tab]: null }));
      setPrevHrefByTab((prev) => ({ ...prev, [tab]: null }));
      setCurrentHrefByTab((prev) => ({
        ...prev,
        [tab]: makeFirstPageLink(tab),
      }));

      loadBookings(tab);

      const id = setTimeout(() => {
        scrollRef.current?.scrollToOffset({ offset: 0, animated: false });
      }, 0);

      return () => clearTimeout(id);
    }, [loadBookings, tab]),
  );

  const data = bookingsByTab[tab];
  const nextHref = nextHrefByTab[tab];
  const prevHref = prevHrefByTab[tab];
  const currentHref = currentHrefByTab[tab];

  const showPaging = useMemo(
    () => !!nextHref || !!prevHref,
    [nextHref, prevHref],
  );

  if (loading && data.length === 0) {
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
          onPress={() => loadBookings(tab, currentHref)}
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
        onValueChange={(value) => router.setParams({ tab: value as Tab })}
        buttons={[
          { value: "active", label: "Active" },
          { value: "past", label: "Past" },
          { value: "cancelled", label: "Cancelled" },
        ]}
        style={styles.segment}
      />

      <FlatList
        ref={scrollRef}
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {tab === "active"
              ? "No active bookings."
              : tab === "past"
                ? "No past bookings."
                : "No cancelled bookings."}
          </Text>
        }
        renderItem={({ item }) => <BookingCard booking={item} tab={tab} />}
        ListFooterComponent={
          showPaging ? (
            <View style={styles.page}>
              <IconButton
                icon="chevron-left"
                size={28}
                disabled={!prevHref || loading}
                onPress={() => prevHref && loadBookings(tab, prevHref)}
                style={styles.pageBtn}
              />

              <IconButton
                icon="chevron-right"
                size={28}
                disabled={!nextHref || loading}
                onPress={() => nextHref && loadBookings(tab, nextHref)}
                style={styles.pageBtn}
              />
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "white" },

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

  detailsBtn: { alignSelf: "flex-end", borderRadius: 10 },
  detailsBtnContent: { paddingHorizontal: 18, paddingVertical: 4 },

  page: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  pageBtn: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.12)",
    borderRadius: 999,
    backgroundColor: "white",
    width: 90,
  },
});

export default BookingsScreen;
