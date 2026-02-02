import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Image, StyleSheet, View } from "react-native";
import {
    ActivityIndicator,
    Button,
    Checkbox,
    Divider,
    List,
    Modal,
    Portal,
    Text,
    TextInput
} from "react-native-paper";

import { apiFetchParkly } from "@/src/api/client";

const RADIUS = 1000;

type Parking = {
  id: string;
  name: string;
  city: string;
  streetName: string;
  streetNumber: string;
  latitude: number;
  longitude: number;
  priceForPeriod: number;
  mainImageUrl: string;
};

const parseNumberParam = (value: unknown) => {
  if (typeof value !== "string") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const ymdToIso = (ymd: string) => {
  if (!ymd) return "";
  return new Date(`${ymd}T00:00:00Z`).toISOString();
};

const buildParkingsPath = (args: {
  latitude: number;
  longitude: number;
  startDateIso: string;
  endDateIso: string;
  isEv: boolean;
  isDisabled: boolean;
  isBig: boolean;
}) => {
  const qs = new URLSearchParams();
  qs.set("latitude", String(args.latitude));
  qs.set("longitude", String(args.longitude));
  qs.set("startDate", args.startDateIso);
  qs.set("endDate", args.endDateIso);
  qs.set("radius", String(RADIUS));

  if (args.isEv) qs.set("isEv", "true");
  if (args.isDisabled) qs.set("isDisabled", "true");
  if (args.isBig) qs.set("isBig", "true");

  return `/api/parkings?${qs.toString()}`;
};

async function fetchParkings(path: string, timeoutMs = 15000) {
  try {
    const data = (await apiFetchParkly(path, {
      method: "GET",
    })) as Parking[];

    return Array.isArray(data) ? data : [];
  } catch (e: any) {}
}

const ParkingCard = ({
  item,
  startDateIso,
  endDateIso,
}: {
  item: Parking;
  startDateIso: string;
  endDateIso: string;
}) => {
  const addr = `${item.streetName} ${item.streetNumber}, ${item.city}`;

  return (
    <View style={styles.card}>
      <Image
        source={item.mainImageUrl ? { uri: item.mainImageUrl } : undefined}
        style={styles.cardImage}
      />

      <View style={styles.cardRight}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.name}
        </Text>

        <Text style={styles.addrText} numberOfLines={1}>
          {addr}
        </Text>

        <View style={styles.cardBottom}>
          <Text style={styles.priceText}>
            <Text style={styles.priceStrong}>{item.priceForPeriod}</Text> /
            period
          </Text>

          <Button
            style={styles.chevPillBtn}
            mode="contained"
            onPress={() => {
              router.push({
                pathname: "/(app)/parkly/[parkingId]",
                params: {
                  parkingId: item.id,
                  startDate: startDateIso,
                  endDate: endDateIso,
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

const SearchResultsScreenExternal = () => {
  const params = useLocalSearchParams<{
    latitude?: string;
    longitude?: string;
    startDate?: string;
    endDate?: string;
  }>();

  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [results, setResults] = useState<Parking[]>([]);

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [startDateYmd, setStartDateYmd] = useState("");
  const [endDateYmd, setEndDateYmd] = useState("");

  const [isEv, setIsEv] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isBig, setIsBig] = useState(false);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftIsEv, setDraftIsEv] = useState(false);
  const [draftIsDisabled, setDraftIsDisabled] = useState(false);
  const [draftIsBig, setDraftIsBig] = useState(false);

  useEffect(() => {
    setLatitude(parseNumberParam(params.latitude));
    setLongitude(parseNumberParam(params.longitude));
    setStartDateYmd(
      typeof params.startDate === "string" ? params.startDate : "",
    );
    setEndDateYmd(typeof params.endDate === "string" ? params.endDate : "");
  }, [params.latitude, params.longitude, params.startDate, params.endDate]);

  const startDateIso = useMemo(() => ymdToIso(startDateYmd), [startDateYmd]);
  const endDateIso = useMemo(() => ymdToIso(endDateYmd), [endDateYmd]);

  const canSearch = useMemo(() => {
    return (
      latitude != null &&
      longitude != null &&
      startDateYmd.length > 0 &&
      endDateYmd.length > 0
    );
  }, [latitude, longitude, startDateYmd, endDateYmd]);

  const loadData = useCallback(async () => {
    setErrorText(null);

    if (!canSearch) {
      setResults([]);
      return;
    }

    const lat = latitude;
    const lon = longitude;
    if (lat == null || lon == null) {
      setResults([]);
      return;
    }

    const path = buildParkingsPath({
      latitude: lat,
      longitude: lon,
      startDateIso,
      endDateIso,
      isEv,
      isDisabled,
      isBig,
    });

    setLoading(true);
    try {
      const data = (await fetchParkings(path, 15000)) as Parking[];
      setResults(data);
    } catch (err: any) {
      setResults([]);
      setErrorText(err?.message ?? "Failed to load parkings");
    } finally {
      setLoading(false);
      setFiltersOpen(false);
    }
  }, [
    canSearch,
    latitude,
    longitude,
    startDateIso,
    endDateIso,
    isEv,
    isDisabled,
    isBig,
  ]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const openFilters = () => {
    setDraftIsEv(isEv);
    setDraftIsDisabled(isDisabled);
    setDraftIsBig(isBig);
    setFiltersOpen(true);
  };

  const clearDraft = () => {
    setDraftIsEv(false);
    setDraftIsDisabled(false);
    setDraftIsBig(false);
  };

  const applyDraft = () => {
    setIsEv(draftIsEv);
    setIsDisabled(draftIsDisabled);
    setIsBig(draftIsBig);
    setFiltersOpen(false);
    loadData();
  };

  return (
    <View style={styles.screen}>
      <View style={styles.topRow}>
        <TextInput
          mode="outlined"
          placeholder="Filters"
          value=""
          editable={false}
          onPressIn={openFilters}
          style={styles.searchTrigger}
          outlineStyle={styles.roundOutline}
          left={<TextInput.Icon icon="tune" />}
        />
      </View>

      <Text style={styles.sectionTitle}>Search Results</Text>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : errorText ? (
        <View style={styles.center}>
          <Text>{errorText}</Text>
          <Button style={{ marginTop: 12 }} onPress={loadData}>
            Retry
          </Button>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(x) => x.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.empty}>No results.</Text>}
          renderItem={({ item }) => (
            <ParkingCard
              item={item}
              startDateIso={startDateIso}
              endDateIso={endDateIso}
            />
          )}
        />
      )}

      <Portal>
        <Modal
          visible={filtersOpen}
          onDismiss={() => setFiltersOpen(false)}
          contentContainerStyle={styles.filtersModal}
        >
          <View style={{ flex: 1 }}>
            <View style={styles.filtersBar}>
              <Text variant="titleMedium" style={{ fontWeight: "700" }}>
                Filters
              </Text>
              <Button onPress={() => setFiltersOpen(false)}>Done</Button>
            </View>

            <Divider />

            <View style={styles.modalBody}>
              <List.Item
                title="EV"
                onPress={() => setDraftIsEv((v) => !v)}
                left={() => (
                  <Checkbox status={draftIsEv ? "checked" : "unchecked"} />
                )}
              />
              <List.Item
                title="Disabled"
                onPress={() => setDraftIsDisabled((v) => !v)}
                left={() => (
                  <Checkbox
                    status={draftIsDisabled ? "checked" : "unchecked"}
                  />
                )}
              />
              <List.Item
                title="Big"
                onPress={() => setDraftIsBig((v) => !v)}
                left={() => (
                  <Checkbox status={draftIsBig ? "checked" : "unchecked"} />
                )}
              />
            </View>

            <Divider />

            <View style={styles.filtersBar}>
              <Button mode="text" onPress={clearDraft}>
                Clear
              </Button>
              <Button
                mode="contained"
                disabled={!canSearch}
                onPress={applyDraft}
              >
                Apply
              </Button>
            </View>
          </View>
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
  roundOutline: { borderRadius: 999 },

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
  cardTitle: { fontSize: 16, fontWeight: "800" },
  addrText: { fontSize: 12, opacity: 0.9, marginTop: 2 },

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

  filtersModal: {
    marginHorizontal: 16,
    borderRadius: 14,
    backgroundColor: "white",
    height: "55%",
    overflow: "hidden",
  },
  filtersBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  modalBody: { flex: 1, minHeight: 0 },
});

export default SearchResultsScreenExternal;
