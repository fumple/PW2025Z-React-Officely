import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FlatList, Image, StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import MapView, { Marker } from "react-native-maps";
import {
  ActivityIndicator,
  Button,
  Divider,
  HelperText,
  IconButton,
  Modal,
  Portal,
  Text,
  TextInput,
} from "react-native-paper";

import { apiFetchLinks } from "@/src/api/client";
import { PARKLY_BASE_URL } from "@/src/config";

const PARKINGS_LIST_LINK = `${PARKLY_BASE_URL}/parkings`;

type SortKey = "DISTANCE" | "PRICE";

type ParklyParkingSearchResource = {
  id?: string;
  name?: string;
  city?: string;
  streetName?: string;
  streetNumber?: string;
  latitude?: number;
  longitude?: number;
  priceForPeriod?: number;
  mainImageUrl?: string;
  _links: { details: { href: string } };
};

type ParkingsResponse = {
  results: ParklyParkingSearchResource[];
  _links: { self: { href: string } };
};

const moneyPLN = (value?: number) =>
  typeof value === "number" && Number.isFinite(value) ? `${value} PLN` : "";

const isYyyyMmDd = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);

const normalizeDateOnly = (raw?: string) => {
  if (typeof raw !== "string") return "";
  const s = raw.trim();
  if (s.length >= 10 && isYyyyMmDd(s.slice(0, 10))) return s.slice(0, 10);
  if (isYyyyMmDd(s)) return s;
  return "";
};

const parseDate = (value: string) => {
  const dOnly = normalizeDateOnly(value);
  if (!dOnly) return undefined;
  const d = new Date(dOnly);
  return Number.isFinite(d.getTime()) ? d : undefined;
};

const parseNumberParam = (value: unknown) => {
  if (typeof value !== "string") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
};

const normalizeRadiusKmText = (raw: string) => {
  let s = raw.trim().replace(",", ".");
  s = s.replace(/[^\d.]/g, "");
  const firstDot = s.indexOf(".");
  if (firstDot !== -1) {
    s = s.slice(0, firstDot + 1) + s.slice(firstDot + 1).replace(/\./g, "");
  }
  if (s.startsWith(".")) s = "0" + s;

  const hadDot = s.includes(".");
  let [intPart, fracPart = ""] = s.split(".");
  intPart = intPart.replace(/^0+(?=\d)/, "");
  if (intPart === "") intPart = "0";
  if (hadDot) {
    fracPart = fracPart.slice(0, 2);
    return `${intPart}.${fracPart}`;
  }
  return intPart;
};

const kmTextToMetersInt = (kmText: string) => {
  const s = kmText.trim();
  if (!s) return undefined;

  const [intPart, fracPart = ""] = s.split(".");
  const kmInt = parseInt(intPart || "0", 10);
  if (!Number.isFinite(kmInt)) return undefined;

  const frac3 = (fracPart + "000").slice(0, 3);
  const metersFromFrac = parseInt(frac3, 10);

  return kmInt * 1000 + metersFromFrac;
};

const ResultCard = ({
  item,
  startDate,
  endDate,
}: {
  item: ParklyParkingSearchResource;
  startDate: string;
  endDate: string;
}) => {
  const title = item.name ?? "";
  const addr = `${item.streetName ?? ""} ${item.streetNumber ?? ""}, ${
    item.city ?? ""
  }`.trim();

  return (
    <View style={styles.card}>
      <Image
        source={item.mainImageUrl ? { uri: item.mainImageUrl } : undefined}
        style={styles.cardImage}
      />

      <View style={styles.cardRight}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {title}
          </Text>
        </View>

        <Text style={styles.addrText} numberOfLines={1}>
          {addr}
        </Text>

        <View style={styles.cardBottom}>
          <Text style={styles.priceText}>
            total{" "}
            <Text style={styles.priceStrong}>
              {moneyPLN(item.priceForPeriod)}
            </Text>
          </Text>

          <Button
            style={styles.chevPillBtn}
            mode="contained"
            onPress={() => {
              router.push({
                pathname: "/(app)/parkly/[parkingId]",
                params: {
                  parkingId: item.id ?? "",
                  startDate,
                  endDate,
                },
              });
            }}
          >
            {">"}
          </Button>
        </View>
      </View>
    </View>
  );
};

const GetParkingsScreen = () => {
  const params = useLocalSearchParams<{
    startDate?: string;
    endDate?: string;
    latitude?: string;
    longitude?: string;
  }>();

  const startDateParam = normalizeDateOnly(params.startDate);
  const endDateParam = normalizeDateOnly(params.endDate);
  const initialLat = parseNumberParam(params.latitude);
  const initialLon = parseNumberParam(params.longitude);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [results, setResults] = useState<ParklyParkingSearchResource[]>([]);

  const [sort, setSort] = useState<SortKey>("DISTANCE");
  const [sortOpen, setSortOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const [city, setCity] = useState("");
  const [parkingName, setParkingName] = useState("");
  const [radiusKm, setRadiusKm] = useState("");

  const [mapPin, setMapPin] = useState<{ lat: number; lon: number } | null>(
    typeof initialLat === "number" && typeof initialLon === "number"
      ? { lat: initialLat, lon: initialLon }
      : null,
  );

  useEffect(() => {
    if (typeof initialLat === "number" && typeof initialLon === "number") {
      setMapPin((prev) => prev ?? { lat: initialLat, lon: initialLon });
    }
  }, [params.latitude, params.longitude]);

  const [touched, setTouched] = useState({
    pin: false,
    radius: false,
    dates: false,
  });

  const mapRef = useRef<MapView>(null);
  const scrollRef = useRef<KeyboardAwareScrollView>(null);

  const datesOk = useMemo(() => {
    const s = parseDate(startDateParam);
    const e = parseDate(endDateParam);
    return !!s && !!e && s <= e;
  }, [startDateParam, endDateParam]);

  const errors = useMemo(() => {
    const dateError =
      touched.dates && !datesOk ? "Missing/invalid dates" : null;

    const pinError = touched.pin && !mapPin ? "Missing location pin" : null;

    const radiusTrimmed = radiusKm.trim();
    const meters =
      radiusTrimmed.length > 0 ? kmTextToMetersInt(radiusTrimmed) : undefined;

    const radiusError =
      touched.radius && radiusTrimmed.length > 0 && typeof meters !== "number"
        ? "Radius must be a number"
        : null;

    return { dates: dateError, pin: pinError, radius: radiusError };
  }, [touched, datesOk, mapPin, radiusKm]);

  const mapRegion = useMemo(() => {
    return {
      latitude: mapPin?.lat ?? initialLat ?? 52.2286,
      longitude: mapPin?.lon ?? initialLon ?? 21.0027,
      latitudeDelta: 0.08,
      longitudeDelta: 0.08,
    };
  }, [mapPin, initialLat, initialLon]);

  const buildHref = useCallback(() => {
    const url = new URL(PARKINGS_LIST_LINK);

    url.searchParams.set("startDate", startDateParam);
    url.searchParams.set("endDate", endDateParam);

    url.searchParams.set("nearLat", String(mapPin!.lat));
    url.searchParams.set("nearLon", String(mapPin!.lon));

    const radiusTrimmed = radiusKm.trim();
    const meters =
      radiusTrimmed.length > 0 ? kmTextToMetersInt(radiusTrimmed) : undefined;
    if (typeof meters === "number") {
      url.searchParams.set("maxDistanceFromAddress", String(meters));
    }

    url.searchParams.set("sort", sort);
    if (parkingName.trim()) url.searchParams.set("name", parkingName.trim());
    if (city.trim()) url.searchParams.set("city", city.trim());

    return url.toString();
  }, [startDateParam, endDateParam, mapPin, radiusKm, sort, parkingName, city]);

  const loadData = useCallback(async () => {
    setError(null);
    setModalError(null);

    setTouched((t) => ({ ...t, dates: true, pin: true, radius: true }));

    if (!datesOk) {
      setModalError("Missing/invalid dates.");
      return;
    }
    if (!mapPin) {
      setModalError("Missing location pin (no latitude/longitude provided).");
      return;
    }
    if (errors.radius) {
      setModalError(errors.radius);
      return;
    }

    setLoading(true);
    try {
      const href = buildHref();
      console.log("GET parkly parkings:", href);

      const data = (await apiFetchLinks(href, {
        method: "GET",
      })) as ParkingsResponse;
      const next = Array.isArray(data?.results) ? data.results : [];
      setResults(next);

      setSearchModalOpen(false);
    } catch (e: any) {
      console.log("parkly parkings error:", e);
      const msg = e?.message ?? "Failed to load parkings";
      setError(msg);
      setModalError(msg);
    } finally {
      setLoading(false);
    }
  }, [buildHref, datesOk, mapPin, errors.radius]);

  useFocusEffect(
    useCallback(() => {
      if (!datesOk) return;
      if (!mapPin) return;
      loadData();
    }, [datesOk, mapPin, loadData]),
  );

  return (
    <View style={styles.screen}>
      <View style={styles.topRow}>
        <TextInput
          mode="outlined"
          placeholder="Change Search..."
          value=""
          editable={false}
          onPressIn={() => {
            setModalError(null);
            setSearchModalOpen(true);
            setTimeout(() => {
              scrollRef.current?.scrollToPosition(0, 0, false);
            }, 0);
          }}
          style={styles.searchTrigger}
          outlineStyle={styles.roundOutline}
          left={<TextInput.Icon icon="magnify" />}
        />

        <IconButton
          icon="sort"
          size={22}
          onPress={() => setSortOpen(true)}
          style={styles.sortBtn}
        />
      </View>

      <Text style={styles.sectionTitle}>Parkings</Text>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text>{error}</Text>
          <Button style={{ marginTop: 12 }} onPress={loadData}>
            Retry
          </Button>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id ?? item._links.details.href}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.empty}>No results.</Text>}
          renderItem={({ item }) => (
            <ResultCard
              item={item}
              startDate={startDateParam}
              endDate={endDateParam}
            />
          )}
        />
      )}

      <Portal>
        <Modal
          visible={sortOpen}
          onDismiss={() => setSortOpen(false)}
          contentContainerStyle={styles.sortModal}
        >
          <Text style={styles.sortTitle}>Sort by</Text>

          <Button
            mode={sort === "DISTANCE" ? "contained" : "outlined"}
            onPress={() => {
              setSort("DISTANCE");
              setSortOpen(false);
              if (datesOk && mapPin) loadData();
            }}
            style={styles.sortOption}
          >
            Distance
          </Button>

          <Button
            mode={sort === "PRICE" ? "contained" : "outlined"}
            onPress={() => {
              setSort("PRICE");
              setSortOpen(false);
              if (datesOk && mapPin) loadData();
            }}
            style={styles.sortOption}
          >
            Price
          </Button>
        </Modal>
      </Portal>

      <Portal>
        <Modal
          visible={searchModalOpen}
          onDismiss={() => setSearchModalOpen(false)}
          contentContainerStyle={styles.searchModal}
        >
          <View style={styles.filtersBar}>
            <Text variant="titleMedium" style={{ fontWeight: "700" }}>
              Change Search
            </Text>
            <Button onPress={() => setSearchModalOpen(false)}>Close</Button>
          </View>

          <Divider />

          <KeyboardAwareScrollView
            ref={scrollRef}
            style={styles.searchModalScroll}
            contentContainerStyle={styles.searchModalContent}
            enableOnAndroid
            extraScrollHeight={16}
            keyboardShouldPersistTaps="handled"
          >
            <View>
              <TextInput
                outlineStyle={styles.roundOutline}
                style={styles.input}
                mode="outlined"
                placeholder="Dates"
                editable={false}
                value={
                  startDateParam && endDateParam
                    ? `${startDateParam} → ${endDateParam}`
                    : ""
                }
                error={!!errors.dates}
              />
              {errors.dates && (
                <HelperText type="error" style={styles.helper}>
                  {errors.dates}
                </HelperText>
              )}
            </View>

            <View>
              <TextInput
                style={styles.input}
                outlineStyle={styles.roundOutline}
                mode="outlined"
                placeholder="City"
                value={city}
                onChangeText={setCity}
                multiline={false}
                numberOfLines={1}
                textAlignVertical="center"
              />
            </View>

            <View>
              <TextInput
                style={styles.input}
                outlineStyle={styles.roundOutline}
                mode="outlined"
                placeholder="Parking name"
                value={parkingName}
                onChangeText={setParkingName}
                multiline={false}
                numberOfLines={1}
                textAlignVertical="center"
              />
            </View>

            <Text style={styles.sectionLabel}>Pin location</Text>

            <View style={styles.mapWrap}>
              <MapView
                ref={mapRef}
                style={styles.map}
                region={mapRegion}
                onLongPress={(event) => {
                  setTouched((t) => ({ ...t, pin: true }));
                  const { latitude, longitude } = event.nativeEvent.coordinate;
                  setMapPin({ lat: latitude, lon: longitude });
                }}
              >
                {mapPin && (
                  <Marker
                    coordinate={{ latitude: mapPin.lat, longitude: mapPin.lon }}
                    draggable
                    onDragEnd={(event) => {
                      const { latitude, longitude } =
                        event.nativeEvent.coordinate;
                      setTouched((t) => ({ ...t, pin: true }));
                      setMapPin({ lat: latitude, lon: longitude });
                    }}
                  />
                )}
              </MapView>
            </View>

            {errors.pin && (
              <HelperText type="error" style={styles.helper}>
                {errors.pin}
              </HelperText>
            )}

            <View style={styles.radiusRow}>
              <Text style={styles.kmText}>Radius</Text>
              <TextInput
                mode="outlined"
                placeholder="5"
                value={radiusKm}
                onChangeText={(t) => setRadiusKm(normalizeRadiusKmText(t))}
                onBlur={() => setTouched((t) => ({ ...t, radius: true }))}
                keyboardType="numeric"
                returnKeyType="done"
                multiline={false}
                numberOfLines={1}
                style={styles.radiusInput}
                outlineStyle={styles.roundOutline}
                error={!!errors.radius}
              />
              <Text style={styles.kmText}>km</Text>
            </View>

            {errors.radius && (
              <HelperText type="error" style={styles.helperRadius}>
                {errors.radius}
              </HelperText>
            )}

            {modalError && (
              <HelperText type="error" style={styles.helper}>
                {modalError}
              </HelperText>
            )}

            <Button
              mode="contained"
              onPress={loadData}
              style={styles.primaryBtn}
              labelStyle={styles.primaryBtnLabel}
              contentStyle={styles.primaryBtnContent}
            >
              Search
            </Button>
          </KeyboardAwareScrollView>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "white" },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchTrigger: { flex: 1, backgroundColor: "white" },
  sortBtn: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.12)",
    borderRadius: 999,
  },

  sectionTitle: {
    marginTop: 10,
    marginHorizontal: 16,
    fontSize: 22,
    fontWeight: "800",
  },

  list: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24, gap: 14 },
  empty: { textAlign: "center", marginTop: 30, opacity: 0.7 },
  center: {
    flex: 1,
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
  cardRight: { flex: 1, paddingLeft: 12, minHeight: 78 },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  cardTitle: { flex: 1, fontSize: 16, fontWeight: "800" },
  addrText: { flex: 1, minWidth: 0, fontSize: 12, opacity: 0.9 },
  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  priceText: { fontSize: 12, opacity: 0.9 },
  priceStrong: { fontWeight: "900", fontSize: 16 },

  chevPillBtn: {
    width: 60,
    height: 40,
    borderRadius: 17,
    minWidth: 0,
    justifyContent: "center",
  },

  sortModal: {
    marginHorizontal: 16,
    borderRadius: 14,
    backgroundColor: "white",
    padding: 16,
  },
  sortTitle: { fontSize: 16, fontWeight: "800", marginBottom: 12 },
  sortOption: { marginBottom: 10 },

  searchModal: {
    marginHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "#E9E8E2",
    height: "90%",
    overflow: "hidden",
  },
  searchModalScroll: { flex: 1, backgroundColor: "#E9E8E2" },
  searchModalContent: { paddingVertical: 16, gap: 12, paddingBottom: 24 },

  roundOutline: { borderRadius: 999 },

  helper: {
    marginTop: 2,
    marginBottom: -6,
    marginHorizontal: 15,
  },

  helperRadius: {
    marginTop: 2,
    marginBottom: -12,
    marginHorizontal: 15,
    marginLeft: 145,
  },

  input: {
    marginTop: 5,
    marginHorizontal: 15,
    backgroundColor: "white",
  },

  sectionLabel: {
    marginHorizontal: 15,
    marginTop: 6,
    fontSize: 16,
    fontWeight: "600",
    backgroundColor: "#E9E8E2",
  },

  mapWrap: {
    marginHorizontal: 15,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.12)",
  },
  map: { height: 220, width: "100%" },

  radiusRow: {
    marginHorizontal: 15,
    marginLeft: 100,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  radiusInput: { flex: 1, backgroundColor: "white" },
  kmText: { fontSize: 16, fontWeight: "600" },

  primaryBtn: {
    marginTop: 6,
    marginHorizontal: 15,
    borderRadius: 999,
    overflow: "hidden",
  },
  primaryBtnContent: { paddingVertical: 6 },
  primaryBtnLabel: { fontSize: 18, fontWeight: "700" },

  filtersBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "white",
  },
});

export default GetParkingsScreen;
