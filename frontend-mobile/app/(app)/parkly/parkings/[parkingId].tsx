import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FlatList, Image, ScrollView, StyleSheet, View } from "react-native";
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

const ParkingDetailsScreen = () => {
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

  const mapRef = useRef<MapView>(null);
  const listRef = useRef<FlatList>(null);

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parking, setParking] = useState<ParkingDetailsResponse | null>(null);

  const datesOk = useMemo(() => {
    const s = parseApiDate(startDate);
    const e = parseApiDate(endDate);
    return !!s && !!e && s <= e;
  }, [startDate, endDate]);

  useFocusEffect(
    useCallback(() => {
      const id = setTimeout(() => {
        listRef.current?.scrollToOffset({ offset: 0, animated: false });
      }, 0);
      return () => clearTimeout(id);
    }, []),
  );

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

  const loadData = async () => {
    setError(null);

    if (!parkingId || !startDate || !endDate) {
      setError("Missing parkingId/startDate/endDate");
      setLoading(false);
      return;
    }
    if (!datesOk) {
      setError("Invalid dates (must be YYYY-MM-DD and startDate <= endDate)");
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const q =
        `startDate=${encodeURIComponent(startDate)}` +
        `&endDate=${encodeURIComponent(endDate)}`;

      const url = appendQuery(`${PARKLY_BASE_URL}/parkings/${parkingId}`, q);

      const details = (await apiFetchLinks(url, {
        method: "GET",
      })) as ParkingDetailsResponse;

      setParking(details);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load parking details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [parkingId, startDate, endDate]);

  const onBook = () => {
    if (!parkingId || !startDate || !endDate || !datesOk) return;

    setBooking(true);
    setError(null);

    router.push({
      pathname: "/(app)/parkly/book",
      params: {
        parkingId,
        startDate,
        endDate,
        isEv: String(requestedIsEv),
        isDisabled: String(requestedIsDisabled),
        isBig: String(requestedIsBig),
      },
    });
  };

  if (loading && !parking) {
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
        ref={listRef}
        data={[{ key: "content" }]}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={() => (
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
                {parking?.name ?? "Parking"}
              </Text>
              <View style={{ width: 42 }} />
            </View>

            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Parking details</Text>
            </View>

            <View style={[styles.card, styles.detailsCard]}>
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
                <Text style={styles.title} numberOfLines={2}>
                  {parking?.name ?? "Parking"}
                </Text>

                {!!addressLine ? (
                  <Text style={styles.subTitle} numberOfLines={3}>
                    {addressLine}
                  </Text>
                ) : null}

                <View style={styles.metaRow}>
                  <Info
                    label="EV"
                    value={parking ? (parking.ev ? "Yes" : "No") : undefined}
                  />
                  <Info
                    label="Disabled"
                    value={
                      parking ? (parking.disabled ? "Yes" : "No") : undefined
                    }
                  />
                  <Info
                    label="Big"
                    value={parking ? (parking.big ? "Yes" : "No") : undefined}
                  />
                </View>

                {(requestedIsEv || requestedIsDisabled || requestedIsBig) && (
                  <View style={{ marginTop: 10 }}>
                    <Text style={styles.noteText}>
                      Requested:{" "}
                      {[
                        requestedIsEv ? "EV" : null,
                        requestedIsDisabled ? "Disabled" : null,
                        requestedIsBig ? "Big" : null,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </Text>
                  </View>
                )}

                {startDate && endDate && (
                  <View style={{ marginTop: 10 }}>
                    <Text style={styles.noteText}>
                      Dates: {startDate} → {endDate}
                    </Text>
                  </View>
                )}
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

              {error ? (
                <HelperText type="error" style={{ marginTop: 10 }}>
                  {error}
                </HelperText>
              ) : null}

              <Divider style={styles.divider} />
            </View>
          </>
        )}
      />

      <View style={styles.bottomBar}>
        <Text style={styles.bottomPrice} numberOfLines={1}>
          {moneyPLN(parking?.priceForPeriod)}
        </Text>

        <Button
          mode="contained"
          buttonColor={stylesVars.colors.primary}
          disabled={!parking || booking || !datesOk}
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
    chipBg: "rgba(0,0,0,0.06)",
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

  detailsCard: { marginTop: 0, marginHorizontal: 16 },

  photoRow: { gap: 10, paddingTop: 2, paddingBottom: 2 },
  photo: {
    width: 200,
    height: 120,
    borderRadius: stylesVars.radius.photo,
    backgroundColor: "rgba(0,0,0,0.08)",
  },

  title: {
    fontSize: 17,
    fontWeight: "900",
    color: stylesVars.colors.text,
  },
  subTitle: { marginTop: 4, fontSize: 12, color: stylesVars.colors.muted },

  metaRow: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  noteText: {
    fontSize: 12,
    color: stylesVars.colors.text,
    opacity: 0.75,
    lineHeight: 16,
  },

  info: {
    backgroundColor: stylesVars.colors.chipBg,
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

  bookBtn: { borderRadius: 14, flex: 1 },
  bookBtnContent: { paddingVertical: 8 },
  bookBtnLabel: { fontWeight: "900", letterSpacing: 0.2 },
});

export default ParkingDetailsScreen;
