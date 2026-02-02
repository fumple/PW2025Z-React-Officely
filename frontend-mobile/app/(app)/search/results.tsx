import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FlatList, Image, Keyboard, StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import MapView, { Marker } from "react-native-maps";
import {
  ActivityIndicator,
  Button,
  Checkbox,
  Divider,
  HelperText,
  IconButton,
  List,
  Modal,
  Portal,
  Text,
  TextInput,
} from "react-native-paper";
import { DatePickerModal } from "react-native-paper-dates";

import { apiFetchLinks } from "@/src/api/client";
import { getOffices } from "@/src/api/getOffices";
import { API_BASE_URL } from "@/src/config";
import { buildFilterList } from "@/src/filters/buildFilterList";
import { useFiltersStore } from "@/src/filters/filtersStore";
import { nominatimGeocode, nominatimReverse } from "@/src/utils/nominatim";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";

const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_PAGE_LINK = `${API_BASE_URL}/offices`;

const formatDate = (date?: Date) => {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${d}-${m}-${y}`;
};

const formatDateApi = (date?: Date) => {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const parseDate = (value: unknown) => {
  if (typeof value !== "string") return undefined;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : undefined;
};

const parseIntParam = (value: unknown) => {
  if (typeof value !== "string") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : undefined;
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

const metersToKm = (meters: number) => {
  if (!Number.isFinite(meters)) return "";
  if (meters <= 0) return "0";
  return (meters / 1000).toFixed(2);
};

const normalizePriceIntText = (raw: string) => {
  let s = raw.trim();
  const commaIdx = s.indexOf(",");
  if (commaIdx !== -1) s = s.slice(0, commaIdx);
  s = s.replace(/[^\d]/g, "");
  s = s.replace(/^0+(?=\d)/, "");
  return s;
};

type Office = {
  id: string;
  name: string;
  address: string;
  photoUrls: string[];
  contactEmail?: string;
  contactPhone?: string;
};

type OfficeResult = {
  office: Office;
  query: { minPrice: number; distance: number };
  _links: { offers?: { href: string } };
};

type OfficesResponse = {
  results: OfficeResult[];
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

type SortKey = "distance" | "priceAsc" | "priceDesc";

const moneyPLN = (value: number) => `${value} PLN`;

const ResultCard = ({
  item,
  startDate,
  endDate,
}: {
  item: OfficeResult;
  startDate: string;
  endDate: string;
}) => {
  const image = item.office.photoUrls?.[0];

  return (
    <View style={styles.card}>
      <Image
        source={image ? { uri: image } : undefined}
        style={styles.cardImage}
      />

      <View style={styles.cardRight}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.office.name}
          </Text>
          <Text style={styles.distanceText}>
            {metersToKm(item.query.distance)} km away
          </Text>
        </View>

        <Text style={styles.addrText} numberOfLines={1}>
          {item.office.address}
        </Text>

        <View style={styles.cardBottom}>
          <Text style={styles.priceText}>
            from{" "}
            <Text style={styles.priceStrong}>
              {moneyPLN(item.query.minPrice)}
            </Text>
          </Text>

          <Button
            style={styles.chevPillBtn}
            mode="contained"
            onPress={() => {
              router.push({
                pathname: "/(app)/search/[officeId]",
                params: {
                  officeId: item.office.id,
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

const SearchResultsScreen = () => {
  const params = useLocalSearchParams<{
    nearAddress?: string;
    nearLat?: string;
    nearLon?: string;

    maxDistanceFromAddress?: string;

    startDate?: string;
    endDate?: string;

    pageToken?: string;
    pageSize?: string;

    filter?: string[] | string;
    filtersState?: string;

    minPrice?: string;
    maxPrice?: string;

    sort?: SortKey;
  }>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<OfficeResult[]>([]);

  const [sort, setSort] = useState<SortKey>("distance");
  const [sortOpen, setSortOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const [nearAddress, setNearAddress] = useState("");
  const [radiusKm, setRadiusKm] = useState("");

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [rangeOpen, setRangeOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const [currentHref, setCurrentHref] = useState<string>(DEFAULT_PAGE_LINK);
  const [nextHref, setNextHref] = useState<string | null>(null);
  const [prevHref, setPrevHref] = useState<string | null>(null);

  const [pageToken, setPageToken] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);

  const [mapPin, setMapPin] = useState<{ lat: number; lon: number } | null>(
    null,
  );

  const [touched, setTouched] = useState({
    nearAddress: false,
    range: false,
    radius: false,
    price: false,
  });

  const mapRef = useRef<MapView>(null);
  const scrollRef = useRef<KeyboardAwareScrollView>(null);
  const filtersScrollRef = useRef<KeyboardAwareScrollView>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  const {
    filterGroups,
    loading: filtersLoading,
    error: filtersError,
    loadFilters,
  } = useFiltersStore();

  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    loadFilters();
  }, [loadFilters]);

  const [selectedFilterValues, setSelectedFilterValues] = useState<
    Record<string, any>
  >({});

  const apiFilters = useMemo(() => {
    return buildFilterList(filterGroups, selectedFilterValues) as string[];
  }, [filterGroups, selectedFilterValues]);

  useEffect(() => {
    setNearAddress(
      typeof params.nearAddress === "string" ? params.nearAddress : "",
    );

    setStartDate(parseDate(params.startDate));
    setEndDate(parseDate(params.endDate));

    if (typeof params.maxDistanceFromAddress === "string") {
      const meters = Number(params.maxDistanceFromAddress);
      setRadiusKm(metersToKm(meters));
    } else {
      setRadiusKm("");
    }

    setMinPrice(
      typeof params.minPrice === "string"
        ? normalizePriceIntText(params.minPrice)
        : "",
    );
    setMaxPrice(
      typeof params.maxPrice === "string"
        ? normalizePriceIntText(params.maxPrice)
        : "",
    );

    if (typeof params.filtersState === "string") {
      try {
        const parsed = JSON.parse(params.filtersState);
        if (parsed && typeof parsed === "object")
          setSelectedFilterValues(parsed);
      } catch {
        setSelectedFilterValues({});
      }
    } else {
      setSelectedFilterValues({});
    }

    const lat = parseNumberParam(params.nearLat);
    const lon = parseNumberParam(params.nearLon);
    setMapPin(
      typeof lat === "number" && typeof lon === "number" ? { lat, lon } : null,
    );

    const token = parseIntParam(params.pageToken);
    const size = parseIntParam(params.pageSize);
    setPageToken(typeof token === "number" ? token : 0);
    setPageSize(typeof size === "number" ? size : DEFAULT_PAGE_SIZE);

    if (params.sort) setSort(params.sort);
  }, [
    params.nearAddress,
    params.startDate,
    params.endDate,
    params.maxDistanceFromAddress,
    params.minPrice,
    params.maxPrice,
    params.filtersState,
    params.nearLat,
    params.nearLon,
    params.pageToken,
    params.pageSize,
    params.sort,
  ]);

  const errors = useMemo(() => {
    const locationError =
      touched.nearAddress && !nearAddress.trim() && !mapPin
        ? "Enter a location or drop a pin on the map"
        : null;

    const rangeError =
      touched.range && (!startDate || !endDate)
        ? "Select start and end dates"
        : touched.range && startDate && endDate && startDate > endDate
          ? "End date cannot be before start date"
          : null;

    const radiusTrimmed = radiusKm.trim();
    const radiusError =
      touched.radius && radiusTrimmed && !Number.isFinite(Number(radiusTrimmed))
        ? "Radius must be a number"
        : null;

    const minTrim = minPrice.trim();
    const maxTrim = maxPrice.trim();
    const minNum = minTrim ? Number(minTrim) : undefined;
    const maxNum = maxTrim ? Number(maxTrim) : undefined;

    const priceError =
      touched.price &&
      minTrim &&
      maxTrim &&
      (minNum as number) > (maxNum as number)
        ? "Min price cannot be greater than max price"
        : null;

    return {
      nearAddress: locationError,
      range: rangeError,
      radius: radiusError,
      price: priceError,
    };
  }, [
    touched,
    nearAddress,
    mapPin,
    startDate,
    endDate,
    radiusKm,
    minPrice,
    maxPrice,
  ]);

  const isFormValid =
    (!!nearAddress.trim() || !!mapPin) &&
    !!startDate &&
    !!endDate &&
    startDate <= endDate &&
    !errors.radius &&
    !errors.price;

  const mapRegion = {
    latitude: mapPin?.lat ?? 52.2286,
    longitude: mapPin?.lon ?? 21.0027,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
  };

  const locateFromAddress = async () => {
    setTouched((t) => ({ ...t, nearAddress: true }));
    setGeoError(null);

    const query = nearAddress.trim();
    const r = await nominatimGeocode(query);
    if (!r) {
      setGeoError("Couldn't find that location. Try a more specific address.");
      return;
    }

    setMapPin({ lat: r.lat, lon: r.lon });
    setNearAddress(r.displayName);

    mapRef.current?.animateToRegion(
      {
        latitude: r.lat,
        longitude: r.lon,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      },
      350,
    );
  };

  const fillAddressFromPin = async (lat: number, lon: number) => {
    setGeoError(null);

    const display = await nominatimReverse(lat, lon);
    if (!display) {
      setGeoError("Couldn't determine address for that spot.");
      return;
    }
    setNearAddress(display);
  };

  const toggleFlag = (baseKey: string, flagKey: string) => {
    setSelectedFilterValues((prev) => {
      const current: string[] = prev[baseKey] ?? [];
      const exists = current.includes(flagKey);
      return {
        ...prev,
        [baseKey]: exists
          ? current.filter((k) => k !== flagKey)
          : [...current, flagKey],
      };
    });
  };

  const loadData = useCallback(
    async (href?: string, sortNext?: SortKey) => {
      setLoading(true);
      setError(null);

      if (!startDate || !endDate) {
        setError("Select start and end dates");
        setLoading(false);
        return;
      }

      try {
        let data: OfficesResponse;

        if (href) {
          data = (await apiFetchLinks(href, {
            method: "GET",
          })) as OfficesResponse;
        } else {
          const radiusMeters = radiusKm.trim()
            ? kmTextToMetersInt(radiusKm)
            : undefined;

          const minPriceApi = minPrice.trim()
            ? parseInt(minPrice.trim(), 10)
            : undefined;
          const maxPriceApi = maxPrice.trim()
            ? parseInt(maxPrice.trim(), 10)
            : undefined;

          data = (await getOffices({
            startDate: formatDateApi(startDate),
            endDate: formatDateApi(endDate),
            nearAddress: nearAddress.trim() || undefined,
            nearLat: mapPin?.lat,
            nearLon: mapPin?.lon,
            maxDistanceFromAddress: radiusMeters,
            minPrice: minPriceApi,
            maxPrice: maxPriceApi,
            filter: apiFilters.length ? apiFilters : undefined,
            sort: sortNext ?? sort,
            pageSize,
            pageToken,
          })) as OfficesResponse;
        }

        const nextResults = Array.isArray(data.results) ? data.results : [];
        setResults(nextResults);

        setCurrentHref(data._links.self?.href ?? href ?? DEFAULT_PAGE_LINK);
        setNextHref(data._links.next?.href ?? null);
        setPrevHref(data._links.prev?.href ?? null);
        setPageToken(data._pagination.currentPage);
        setPageSize(data._pagination.pageSize);

        setSearchModalOpen(false);
        setFiltersOpen(false);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load results");
      } finally {
        setLoading(false);
      }
    },
    [
      startDate,
      endDate,
      radiusKm,
      minPrice,
      maxPrice,
      nearAddress,
      mapPin?.lat,
      mapPin?.lon,
      apiFilters,
      sort,
      pageSize,
      pageToken,
    ],
  );

  const fetchFromScratch = useCallback(
    (sortNext?: SortKey) => {
      setCurrentHref(DEFAULT_PAGE_LINK);
      setNextHref(null);
      setPrevHref(null);
      setPageToken(0);

      loadData(undefined, sortNext);
    },
    [loadData],
  );

  useFocusEffect(
    useCallback(() => {
      if (!startDate || !endDate) return;
      if (filtersLoading) return;
      if (!filterGroups.length) return;
      fetchFromScratch(sort);
    }, [
      fetchFromScratch,
      sort,
      startDate,
      endDate,
      filtersLoading,
      filterGroups.length,
    ]),
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
            setSearchModalOpen(true);
            setTimeout(() => {
              scrollRef.current?.scrollToPosition(0, 0, false);
              filtersScrollRef.current?.scrollToPosition(0, 0, false);
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

      <Text style={styles.sectionTitle}>Search Results</Text>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text>{error}</Text>
          <Button
            style={{ marginTop: 12 }}
            onPress={() => loadData(currentHref)}
          >
            Retry
          </Button>
        </View>
      ) : (
        <>
          <FlatList
            data={results}
            keyExtractor={(item) => item.office.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<Text style={styles.empty}>No results.</Text>}
            renderItem={({ item }) => (
              <ResultCard
                item={item}
                startDate={formatDateApi(startDate)}
                endDate={formatDateApi(endDate)}
              />
            )}
          />
          <View style={styles.page}>
            <IconButton
              icon="chevron-left"
              size={28}
              disabled={!prevHref || loading}
              onPress={() => prevHref && loadData(prevHref)}
              style={styles.pageBtn}
            />

            <IconButton
              icon="chevron-right"
              size={28}
              disabled={!nextHref || loading}
              onPress={() => nextHref && loadData(nextHref)}
              style={styles.pageBtn}
            />
          </View>
        </>
      )}

      <Portal>
        <Modal
          visible={sortOpen}
          onDismiss={() => setSortOpen(false)}
          contentContainerStyle={styles.sortModal}
        >
          <Text style={styles.sortTitle}>Sort by</Text>

          <Button
            mode={sort === "distance" ? "contained" : "outlined"}
            onPress={() => {
              setSort("distance");
              setSortOpen(false);
              fetchFromScratch("distance");
            }}
            style={styles.sortOption}
          >
            Distance
          </Button>

          <Button
            mode={sort === "priceAsc" ? "contained" : "outlined"}
            onPress={() => {
              setSort("priceAsc");
              setSortOpen(false);
              fetchFromScratch("priceAsc");
            }}
            style={styles.sortOption}
          >
            Price (low → high)
          </Button>

          <Button
            mode={sort === "priceDesc" ? "contained" : "outlined"}
            onPress={() => {
              setSort("priceDesc");
              setSortOpen(false);
              fetchFromScratch("priceDesc");
            }}
            style={styles.sortOption}
          >
            Price (high → low)
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
            <View style={styles.field}>
              <TextInput
                style={styles.input}
                outlineStyle={styles.roundOutline}
                mode="outlined"
                placeholder="Location"
                value={nearAddress}
                onChangeText={(t) => {
                  setNearAddress(t);
                  setGeoError(null);
                }}
                onBlur={() => setTouched((t) => ({ ...t, nearAddress: true }))}
                onSubmitEditing={locateFromAddress}
                returnKeyType="search"
                multiline={false}
                numberOfLines={1}
                textAlignVertical="center"
                error={!!errors.nearAddress || !!geoError}
                right={
                  <TextInput.Icon
                    icon="map-marker"
                    onPress={locateFromAddress}
                  />
                }
              />
              {(errors.nearAddress || geoError) && (
                <HelperText type="error" style={styles.helper}>
                  {errors.nearAddress ?? geoError}
                </HelperText>
              )}
            </View>

            <View style={styles.field}>
              <TextInput
                outlineStyle={styles.roundOutline}
                style={styles.input}
                mode="outlined"
                placeholder="Dates"
                editable={false}
                value={
                  startDate && endDate
                    ? `${formatDate(startDate)} → ${formatDate(endDate)}`
                    : ""
                }
                onPressIn={() => {
                  setTouched((t) => ({ ...t, range: true }));
                  setRangeOpen(true);
                }}
                right={
                  <TextInput.Icon
                    icon="calendar"
                    onPress={() => {
                      setTouched((t) => ({ ...t, range: true }));
                      setRangeOpen(true);
                    }}
                  />
                }
                error={!!errors.range}
              />
              {errors.range && (
                <HelperText type="error" style={styles.helper}>
                  {errors.range}
                </HelperText>
              )}
            </View>

            <DatePickerModal
              locale="en"
              mode="range"
              visible={rangeOpen}
              startDate={startDate}
              endDate={endDate}
              onDismiss={() => setRangeOpen(false)}
              onConfirm={({ startDate: s, endDate: e }) => {
                setRangeOpen(false);
                setStartDate(s);
                setEndDate(e);
              }}
              validRange={{ startDate: startOfToday() }}
            />

            <Text style={styles.sectionLabel}>Location</Text>

            <View style={styles.mapWrap}>
              <MapView
                ref={mapRef}
                style={styles.map}
                region={mapRegion}
                onLongPress={(event) => {
                  setTouched((t) => ({ ...t, nearAddress: true }));
                  const { latitude, longitude } = event.nativeEvent.coordinate;
                  setMapPin({ lat: latitude, lon: longitude });
                  fillAddressFromPin(latitude, longitude);
                }}
              >
                {mapPin && (
                  <Marker
                    coordinate={{ latitude: mapPin.lat, longitude: mapPin.lon }}
                    draggable
                    onDragEnd={(event) => {
                      const { latitude, longitude } =
                        event.nativeEvent.coordinate;
                      setMapPin({ lat: latitude, lon: longitude });
                      fillAddressFromPin(latitude, longitude);
                    }}
                  />
                )}
              </MapView>
            </View>

            <View style={styles.radiusRow}>
              <Text style={styles.kmText}>Search Radius</Text>
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

            <Button
              mode="outlined"
              style={styles.filtersBtn}
              onPress={() => setFiltersOpen(true)}
            >
              Filters
            </Button>

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
                    {filtersLoading ? (
                      <View style={styles.loadingCover}>
                        <ActivityIndicator size="large" />
                      </View>
                    ) : filtersError ? (
                      <View style={styles.loadingCover}>
                        <HelperText type="error">{filtersError}</HelperText>
                      </View>
                    ) : (
                      <KeyboardAwareScrollView
                        ref={filtersScrollRef}
                        enableOnAndroid
                        extraScrollHeight={-80}
                        enableResetScrollToCoords={false}
                        keyboardShouldPersistTaps="handled"
                      >
                        {(Array.isArray(filterGroups) ? filterGroups : []).map(
                          (group) => (
                            <List.Accordion
                              key={group.key}
                              title={group.label}
                              style={{ backgroundColor: "white" }}
                            >
                              {group.elements.map((el) => {
                                const baseKey = `${group.key}.${el.key}`;

                                if (el.type === "flags") {
                                  const selected =
                                    selectedFilterValues[baseKey] ?? [];

                                  return (
                                    <View
                                      key={baseKey}
                                      style={{
                                        paddingHorizontal: 12,
                                        paddingBottom: 6,
                                      }}
                                    >
                                      {el.flags.map((flag) => {
                                        const checked = selected.includes(
                                          flag.key,
                                        );

                                        return (
                                          <List.Item
                                            key={`${baseKey}.${flag.key}`}
                                            title={flag.label}
                                            onPress={() =>
                                              toggleFlag(baseKey, flag.key)
                                            }
                                            left={() => (
                                              <Checkbox
                                                status={
                                                  checked
                                                    ? "checked"
                                                    : "unchecked"
                                                }
                                              />
                                            )}
                                          />
                                        );
                                      })}
                                    </View>
                                  );
                                }

                                const value = String(
                                  selectedFilterValues[baseKey] ?? "",
                                );

                                return (
                                  <View
                                    key={baseKey}
                                    style={{
                                      paddingHorizontal: 12,
                                      paddingBottom: 10,
                                    }}
                                  >
                                    <TextInput
                                      mode="outlined"
                                      label={`${el.label}`}
                                      value={value}
                                      keyboardType="numeric"
                                      onChangeText={(t) => {
                                        setSelectedFilterValues((prev) => ({
                                          ...prev,
                                          [baseKey]: t,
                                        }));
                                      }}
                                    />
                                  </View>
                                );
                              })}
                            </List.Accordion>
                          ),
                        )}

                        <TextInput
                          mode="outlined"
                          label="Min. price"
                          value={minPrice}
                          keyboardType="numeric"
                          returnKeyType="done"
                          style={{ marginHorizontal: 10, marginTop: 10 }}
                          contentStyle={{ paddingVertical: 6 }}
                          onChangeText={(t) =>
                            setMinPrice(normalizePriceIntText(t))
                          }
                          onBlur={() =>
                            setTouched((t) => ({ ...t, price: true }))
                          }
                          error={!!errors.price}
                        />

                        <TextInput
                          mode="outlined"
                          label="Max. price"
                          value={maxPrice}
                          keyboardType="numeric"
                          returnKeyType="done"
                          onSubmitEditing={() => Keyboard.dismiss()}
                          style={{ marginHorizontal: 10, marginTop: 10 }}
                          onChangeText={(t) =>
                            setMaxPrice(normalizePriceIntText(t))
                          }
                          onBlur={() =>
                            setTouched((t) => ({ ...t, price: true }))
                          }
                          error={!!errors.price}
                        />

                        {errors.price && (
                          <HelperText type="error" style={styles.priceHelper}>
                            {errors.price}
                          </HelperText>
                        )}
                      </KeyboardAwareScrollView>
                    )}
                  </View>

                  <Divider />

                  <View style={styles.filtersBar}>
                    <Button
                      mode="text"
                      onPress={() => {
                        setSelectedFilterValues({});
                        setMinPrice("");
                        setMaxPrice("");
                      }}
                    >
                      Clear
                    </Button>

                    <Button
                      mode="contained"
                      disabled={!!errors.price}
                      onPress={() => setFiltersOpen(false)}
                    >
                      Apply
                    </Button>
                  </View>
                </View>
              </Modal>
            </Portal>

            <Button
              mode="contained"
              disabled={!isFormValid}
              onPress={() => {
                setTouched((t) => ({
                  ...t,
                  nearAddress: true,
                  range: true,
                  radius: true,
                  price: true,
                }));

                if (!isFormValid) return;
                fetchFromScratch(sort);
              }}
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
  distanceText: { fontSize: 12, opacity: 0.75, fontWeight: "700" },
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

  field: {},

  helper: {
    marginTop: 2,
    marginBottom: -12,
    marginHorizontal: 15,
  },

  helperRadius: {
    marginTop: 2,
    marginBottom: -12,
    marginHorizontal: 15,
    marginLeft: 145,
  },

  priceHelper: {
    marginTop: 4,
    marginHorizontal: 15,
    marginBottom: 12,
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

  filtersBtn: {
    marginHorizontal: 15,
    borderRadius: 999,
    backgroundColor: "#f5f4ef",
  },

  filtersModal: {
    marginHorizontal: 16,
    borderRadius: 14,
    backgroundColor: "white",
    height: "80%",
    overflow: "hidden",
  },

  filtersBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "white",
  },

  modalBody: { flex: 1, minHeight: 0 },

  loadingCover: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
});

export default SearchResultsScreen;
