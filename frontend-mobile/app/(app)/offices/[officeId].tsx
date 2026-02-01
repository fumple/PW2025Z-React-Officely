import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import {
  ActivityIndicator,
  Button,
  Divider,
  HelperText,
  IconButton,
  Text,
} from "react-native-paper";

import { apiFetch } from "@/src/api/client";

type Offer = {
  id: string;
  name: string;
  totalPrice: number;
  freeCancellationHours: number;
  paymentHours: number;
  properties?: Record<string, string>;
  _links: {
    accept: { href: string };
  };
};

type Office = {
  id: string;
  name: string;
  description?: string;
  address: string;
  coordinates?: { lat: number; lon: number };
  photoUrls: string[];
  contactEmail?: string;
  contactPhone?: string;
};

type OffersResponse = {
  offers: Offer[];
  _links?: { self?: { href: string } };
};

const moneyPLN = (value: number) => {
  return `${value} PLN`;
};

const Info = ({ label, value }: { label: string; value?: string }) => {
  if (!value) return null;
  return (
    <View style={styles.info}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
};

const appendQuery = (baseUrl: string, query: string) => {
  return baseUrl.includes("?") ? `${baseUrl}&${query}` : `${baseUrl}?${query}`;
};

const OfficeOffersDetailsScreen = () => {
  const params = useLocalSearchParams<{
    officeId: string;
    offersHref: string;
    startDate: string;
    endDate: string;
  }>();

  const officeId = params.officeId;
  const offersHref = params.offersHref;
  const startDate = params.startDate;
  const endDate = params.endDate;

  const mapRef = useRef<MapView>(null);

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [office, setOffice] = useState<Office | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);

  const selectedOffer = useMemo(
    () => offers.find((o) => o.id === selectedOfferId) ?? null,
    [offers, selectedOfferId],
  );

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

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const officeData = (await apiFetch(`/offices/${officeId}`, {
        method: "GET",
      })) as Office;

      setOffice(officeData);
      const q =
        `startDate=${encodeURIComponent(startDate)}` +
        `&endDate=${encodeURIComponent(endDate)}`;
      const offersUrl = appendQuery(offersHref, q);

      const offersData = (await apiFetch(offersUrl, {
        method: "GET",
      })) as OffersResponse;

      setOffers(offersData.offers);
      setSelectedOfferId(null);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [officeId, offersHref, startDate, endDate]);

  const onBook = async () => {
    if (!selectedOffer) return;

    setBooking(true);
    setError(null);

    router.push({
      pathname: "../bookings/book",
      params: {
        officeId,
        startDate,
        endDate,
        acceptHref: selectedOffer._links.accept.href,
      },
    });
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
      <FlatList
        data={offers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <View style={styles.topRow}>
              <IconButton
                icon="arrow-left"
                size={22}
                onPress={() => router.back()}
                style={styles.sortBtn}
              />
              <Text style={styles.headerTitle} numberOfLines={1}>
                Office
              </Text>
              <View style={{ width: 42 }} />
            </View>

            <Text style={styles.sectionTitle} numberOfLines={2}>
              {office?.name}
            </Text>

            {error ? (
              <HelperText type="error" style={{ marginHorizontal: 16 }}>
                {error}
              </HelperText>
            ) : null}
          </>
        }
        ListEmptyComponent={
          <View style={{ paddingHorizontal: 16 }}>
            <View style={styles.offerCard}>
              <Text style={styles.empty}>No offers available.</Text>
              <Button
                style={{ marginTop: 10 }}
                mode="contained"
                onPress={loadData}
              >
                Retry
              </Button>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const selected = item.id === selectedOfferId;

          return (
            <View style={{ paddingHorizontal: 16 }}>
              <Pressable
                onPress={() =>
                  setSelectedOfferId((prev) =>
                    prev === item.id ? null : item.id,
                  )
                }
                style={[
                  styles.offerCard,
                  selected ? styles.offerCardSelected : null,
                ]}
              >
                <View style={styles.rowBetween}>
                  <Text style={styles.offerName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={styles.offerPrice}>
                    {moneyPLN(item.totalPrice)}
                  </Text>
                </View>

                <View style={styles.offerMetaRow}>
                  <Info
                    label="Free cancel"
                    value={`${item.freeCancellationHours}h`}
                  />
                  <Info label="Payment" value={`${item.paymentHours}h`} />
                </View>

                {item.properties ? (
                  <View style={styles.propsWrap}>
                    {Object.entries(item.properties).map(([k, v]) => (
                      <Text key={k} style={styles.propLine}>
                        ✓ {k}: {v}
                      </Text>
                    ))}
                  </View>
                ) : null}
              </Pressable>
            </View>
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        ListFooterComponent={
          <>
            <View style={styles.blockHead}>
              <Text style={styles.blockTitle}>Office details</Text>
            </View>

            <View style={styles.detailsCard}>
              {office?.photoUrls?.length ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 10, paddingTop: 8 }}
                >
                  {office.photoUrls.map((u, idx) => (
                    <Image
                      key={`${u}.${idx}`}
                      source={{ uri: u }}
                      style={styles.photo}
                    />
                  ))}
                </ScrollView>
              ) : null}

              <View style={{ marginTop: 10 }}>
                <Text style={styles.officeName} numberOfLines={2}>
                  {office?.name}
                </Text>
                <Text style={styles.officeAddr} numberOfLines={3}>
                  {office?.address}
                </Text>

                {office?.description ? (
                  <Text style={styles.officeDesc}>{office.description}</Text>
                ) : null}

                <View style={styles.contactRow}>
                  <Info label="Email" value={office?.contactEmail} />
                  <Info label="Phone" value={office?.contactPhone} />
                </View>
              </View>

              <View style={styles.mapWrap}>
                <MapView ref={mapRef} style={styles.map} region={region}>
                  <Marker
                    coordinate={{
                      latitude: region.latitude,
                      longitude: region.longitude,
                    }}
                  />
                </MapView>
              </View>

              <Divider style={{ marginTop: 12, opacity: 0.2 }} />
            </View>
            <View style={{ height: 110 }} />
          </>
        }
      />

      <View style={styles.bottomBar}>
        <Text
          style={[
            styles.bottomPrice,
            !selectedOffer ? styles.bottomPricePlaceholder : null,
          ]}
          numberOfLines={1}
        >
          {selectedOffer
            ? moneyPLN(selectedOffer.totalPrice)
            : "Select an offer"}
        </Text>

        <Button
          mode="contained"
          buttonColor="#0F4366"
          disabled={!selectedOffer || booking}
          loading={booking}
          onPress={onBook}
          style={styles.bookBtn}
          contentStyle={styles.bookBtnContent}
        >
          Book
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "white" },

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
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  sortBtn: {
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

  sectionTitle: {
    marginTop: 10,
    marginHorizontal: 16,
    fontSize: 22,
    fontWeight: "800",
  },

  list: { paddingTop: 12, paddingBottom: 24 },

  blockHead: { marginTop: 10, marginHorizontal: 16 },
  blockTitle: { fontSize: 16, fontWeight: "900" },
  blockHint: { marginTop: 2, fontSize: 12, opacity: 0.75 },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },

  offerCard: {
    backgroundColor: "#E9E8E2",
    borderRadius: 14,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  offerCardSelected: { borderWidth: 2, borderColor: "#0F4366" },

  offerName: { flex: 1, fontSize: 16, fontWeight: "800" },
  offerPrice: { fontWeight: "900", fontSize: 16, color: "#C42E2E" },

  offerMetaRow: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  info: {
    backgroundColor: "rgba(0,0,0,0.06)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  infoLabel: { fontSize: 11, opacity: 0.7, fontWeight: "800" },
  infoValue: { fontSize: 11, fontWeight: "900" },

  propsWrap: { gap: 2, marginTop: 10 },
  propLine: { fontSize: 11, opacity: 0.9 },

  selectedHint: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "rgba(15,67,102,0.10)",
  },
  selectedHintText: { fontSize: 11, fontWeight: "800", color: "#0F4366" },

  empty: { textAlign: "center", opacity: 0.7 },

  detailsCard: {
    marginTop: 10,
    marginHorizontal: 16,
    backgroundColor: "#E9E8E2",
    borderRadius: 14,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  photo: {
    width: 180,
    height: 110,
    borderRadius: 14,
    backgroundColor: "#ddd",
  },

  officeName: { fontSize: 18, fontWeight: "900" },
  officeAddr: { marginTop: 2, fontSize: 12, opacity: 0.85 },
  officeDesc: { marginTop: 8, fontSize: 12, opacity: 0.85, lineHeight: 16 },

  contactRow: { marginTop: 10, flexDirection: "row", flexWrap: "wrap", gap: 8 },

  mapWrap: {
    marginTop: 12,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.12)",
  },
  map: { height: 220, width: "100%" },

  smallMuted: { marginTop: 10, fontSize: 12, opacity: 0.75 },

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
    minWidth: 140,
  },
  bottomPricePlaceholder: { color: "rgba(0,0,0,0.55)" },

  bookBtn: { borderRadius: 12, flex: 1 },
  bookBtnContent: { paddingVertical: 6 },
});
export default OfficeOffersDetailsScreen;
