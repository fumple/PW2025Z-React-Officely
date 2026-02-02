import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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

import { apiFetchRel } from "@/src/api/client";
import { useFiltersStore } from "@/src/filters/filtersStore";

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

type OffersResponse = {
  offers: Offer[];
  _links: {
    self: { href: string };
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

const moneyPLN = (value: number) => `${value} PLN`;

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
    startDate: string;
    endDate: string;
  }>();

  const officeId = params.officeId;
  const startDate = params.startDate;
  const endDate = params.endDate;

  const mapRef = useRef<MapView>(null);
  const scrollRef = useRef<FlatList>(null);

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

  const filterGroups = useFiltersStore((s) => s.filterGroups);
  const loadFilters = useFiltersStore((s) => s.loadFilters);

  useFocusEffect(
    useCallback(() => {
      const id = setTimeout(() => {
        scrollRef.current?.scrollToOffset({ offset: 0, animated: false });
      }, 0);
      return () => clearTimeout(id);
    }, []),
  );

  useEffect(() => {
    if (!filterGroups?.length) loadFilters();
  }, [filterGroups?.length, loadFilters]);

  const labelMaps = useMemo(() => {
    const elementLabel = new Map<string, string>();
    const flagLabel = new Map<string, string>();

    for (const group of filterGroups ?? []) {
      for (const el of group.elements ?? []) {
        elementLabel.set(`${group.key}.${el.key}`, el.label);

        if (el.type === "flags") {
          for (const fl of el.flags ?? []) {
            flagLabel.set(`${group.key}.${el.key}.${fl.key}`, fl.label);
          }
        }
      }
    }

    return { elementLabel, flagLabel };
  }, [filterGroups]);

  const labelFromPropertyKey = (rawKey: string) => {
    const key = rawKey;
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

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const officeData = (await apiFetchRel(`/offices/${officeId}`, {
        method: "GET",
      })) as Office;

      setOffice(officeData);

      const q =
        `startDate=${encodeURIComponent(startDate)}` +
        `&endDate=${encodeURIComponent(endDate)}`;
      const offersUrl = appendQuery(`/offices/${officeId}/offers`, q);

      const offersData = (await apiFetchRel(offersUrl, {
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
  }, [officeId, startDate, endDate]);

  const onBook = async () => {
    if (!selectedOffer) return;

    setBooking(true);
    setError(null);

    router.push({
      pathname: "/(app)/bookings/book",
      params: {
        officeId,
        offerId: selectedOfferId,
        totalPrice: String(selectedOffer.totalPrice),
        startDate,
        endDate,
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
      <FlatList
        data={offers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponentStyle={{ paddingBottom: 12 }}
        ListHeaderComponent={
          <>
            <View style={styles.topRow}>
              <IconButton
                icon="arrow-left"
                size={20}
                onPress={() => router.back()}
                style={styles.backBtn}
                iconColor={stylesVars.colors.text}
              />
              <Text style={styles.headerTitle} numberOfLines={1}>
                {office?.name}
              </Text>
              <View style={{ width: 42 }} />
            </View>

            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Office details</Text>
            </View>

            <View style={[styles.card, styles.detailsCard]}>
              {office?.photoUrls?.length ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.photoRow}
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

              <View style={{ marginTop: 12 }}>
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

              <Divider style={styles.divider} />
            </View>

            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Offers</Text>
            </View>

            {error ? (
              <HelperText type="error" style={{ marginHorizontal: 16 }}>
                {error}
              </HelperText>
            ) : null}
          </>
        }
        ListEmptyComponent={
          <View style={{ paddingHorizontal: 16 }}>
            <View style={styles.card}>
              <Text style={styles.empty}>No offers available.</Text>
              <Button
                style={{ marginTop: 12 }}
                mode="contained"
                onPress={loadData}
                buttonColor={stylesVars.colors.primary}
                textColor="white"
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
                  styles.card,
                  styles.offerCard,
                  selected ? styles.cardSelected : null,
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
                    {Object.entries(item.properties).map(([k, v]) => {
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
                ) : null}
              </Pressable>
            </View>
          );
        }}
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
          buttonColor={stylesVars.colors.primary}
          disabled={!selectedOffer || booking}
          loading={booking}
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

const stylesVars = {
  colors: {
    bg: "#E9E8E2",
    card: "#E9E8E2",
    text: "#1F2937",
    muted: "rgba(31,41,55,0.72)",
    border: "rgba(0,0,0,0.10)",
    primary: "#0F4366",
    danger: "#C42E2E",
    chipBg: "rgba(0,0,0,0.06",
    selectedBg: "rgba(15, 67, 102, 0.08)",
  },
  radius: {
    card: 16,
    chip: 999,
    photo: 16,
  },
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: stylesVars.colors.bg },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: stylesVars.colors.bg,
  },
  loadingText: { marginTop: 10, opacity: 0.75, color: stylesVars.colors.muted },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  backBtn: {
    borderWidth: 1,
    borderColor: stylesVars.colors.border,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "900",
    color: stylesVars.colors.text,
    letterSpacing: 0.2,
  },

  list: { paddingTop: 12, paddingBottom: 140 },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },

  card: {
    backgroundColor: stylesVars.colors.card,
    borderRadius: stylesVars.radius.card,
    padding: 14,
    borderWidth: 1,
    borderColor: stylesVars.colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },

  offerCard: { marginBottom: 12 },
  cardSelected: {
    borderWidth: 2,
    borderColor: stylesVars.colors.primary,
    backgroundColor: stylesVars.colors.selectedBg,
    shadowOpacity: 0.12,
    elevation: 3,
  },

  offerName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "900",
    color: stylesVars.colors.text,
    lineHeight: 19,
  },
  offerPrice: {
    fontWeight: "900",
    fontSize: 15,
    color: stylesVars.colors.danger,
  },

  offerMetaRow: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  info: {
    backgroundColor: "rgba(0,0,0,0.06)",
    borderRadius: stylesVars.radius.chip,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 11,
    opacity: 0.75,
    fontWeight: "800",
    color: stylesVars.colors.muted,
  },
  infoValue: {
    fontSize: 11,
    fontWeight: "900",
    color: stylesVars.colors.text,
  },

  propsWrap: { gap: 4, marginTop: 10 },
  propLine: {
    fontSize: 12,
    color: stylesVars.colors.text,
    opacity: 0.85,
    lineHeight: 16,
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
    color: stylesVars.colors.text,
    letterSpacing: 0.2,
  },

  empty: { textAlign: "center", color: stylesVars.colors.muted },

  detailsCard: { marginTop: 0, marginHorizontal: 16 },

  photoRow: { gap: 10, paddingTop: 2, paddingBottom: 2 },
  photo: {
    width: 200,
    height: 120,
    borderRadius: stylesVars.radius.photo,
    backgroundColor: "rgba(0,0,0,0.08)",
  },

  officeName: {
    fontSize: 17,
    fontWeight: "900",
    color: stylesVars.colors.text,
  },
  officeAddr: { marginTop: 4, fontSize: 12, color: stylesVars.colors.muted },
  officeDesc: {
    marginTop: 10,
    fontSize: 12,
    color: stylesVars.colors.text,
    opacity: 0.85,
    lineHeight: 17,
  },

  contactRow: { marginTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 8 },

  mapWrap: {
    marginTop: 12,
    borderRadius: stylesVars.radius.card,
    overflow: "hidden",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: stylesVars.colors.border,
  },
  map: { height: 220, width: "100%" },

  divider: { marginTop: 14, opacity: 0.16 },

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "rgba(233,232,226,0.98)",
    borderTopWidth: 1,
    borderTopColor: stylesVars.colors.border,
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
    color: stylesVars.colors.danger,
    minWidth: 140,
  },
  bottomPricePlaceholder: { color: "rgba(31,41,55,0.55)" },

  bookBtn: { borderRadius: 14, flex: 1 },
  bookBtnContent: { paddingVertical: 8 },
  bookBtnLabel: { fontWeight: "900", letterSpacing: 0.2 },
});

export default OfficeOffersDetailsScreen;
