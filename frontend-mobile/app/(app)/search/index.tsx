import { buildFilterList } from "@/src/filters/buildFilterList";
import { useFiltersStore } from "@/src/filters/filtersStore";
import { nominatimGeocode, nominatimReverse } from "@/src/utils/nominatim";
import { router, useFocusEffect } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ActivityIndicator, Keyboard, StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import MapView, { Marker } from "react-native-maps";
import {
  Button,
  Checkbox,
  Divider,
  HelperText,
  List,
  Modal,
  Portal,
  Text,
  TextInput,
} from "react-native-paper";
import { DatePickerModal } from "react-native-paper-dates";

//TODO: prev should do routerback if no prevhref is available
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

const normalizePriceIntText = (raw: string) => {
  let s = raw.trim();
  const commaIdx = s.indexOf(",");
  if (commaIdx !== -1) s = s.slice(0, commaIdx);
  s = s.replace(/[^\d]/g, "");
  s = s.replace(/^0+(?=\d)/, "");

  return s;
};

const SearchDates = () => {
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [nearAddress, setNearAddress] = useState("");
  const [rangeOpen, setRangeOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [mapPin, setMapPin] = useState<{ lat: number; lon: number } | null>(
    null,
  );
  const [radius, setRadius] = useState("");
  const [touched, setTouched] = useState({
    nearAddress: false,
    range: false,
    radius: false,
    price: false,
  });
  const mapRef = useRef<MapView>(null);
  const scrollRef = useRef<KeyboardAwareScrollView>(null);
  const filtersScrollRef = useRef<KeyboardAwareScrollView>(null);
  const didFocusOnce = useRef(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const {
    filterGroups,
    loading: filtersLoading,
    error: filtersError,
    loadFilters,
  } = useFiltersStore();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedFilterValues, setSelectedFilterValues] = useState<
    Record<string, any>
  >({});

  useEffect(() => {
    loadFilters();
  }, [loadFilters]);

  const apiFilters = useMemo(() => {
    return buildFilterList(filterGroups, selectedFilterValues) as string[];
  }, [filterGroups, selectedFilterValues]);

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

    const radiusTrimmed = radius.trim();
    const radiusError =
      touched.radius && radiusTrimmed && !Number.isFinite(Number(radiusTrimmed))
        ? "Radius must be a number"
        : null;

    const minTrim = minPrice.trim();
    const maxTrim = maxPrice.trim();

    const minNum = minTrim ? Number(minTrim) : undefined;
    const maxNum = maxTrim ? Number(maxTrim) : undefined;

    const priceError =
      minTrim && maxTrim && (minNum as number) > (maxNum as number)
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
    radius,
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

    const r = await nominatimGeocode(nearAddress);
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

  const onSearch = async () => {
    setTouched((t) => ({ ...t, nearAddress: true, range: true, radius: true }));

    if (!isFormValid) return;

    const nearAddressApi = nearAddress.trim() ? nearAddress.trim() : undefined;
    const minPriceParam = minPrice.trim() ? minPrice.trim() : undefined;
    const maxPriceParam = maxPrice.trim() ? maxPrice.trim() : undefined;
    const radiusMeters = radius.trim() ? kmTextToMetersInt(radius) : undefined;
    const pageSize = 20;
    const pageIndex = 0;

    router.push({
      pathname: "/(app)/search/results",
      params: {
        nearAddress: nearAddressApi,
        nearLat: mapPin?.lat != null ? String(mapPin.lat) : undefined,
        nearLon: mapPin?.lon != null ? String(mapPin.lon) : undefined,
        maxDistanceFromAddress:
          radiusMeters != null ? String(radiusMeters) : undefined,
        startDate: formatDateApi(startDate),
        endDate: formatDateApi(endDate),
        filter: apiFilters.length ? apiFilters : undefined,
        filtersState: JSON.stringify(selectedFilterValues),
        pageToken: String(pageIndex),
        pageSize: String(pageSize),
        minPrice: minPriceParam,
        maxPrice: maxPriceParam,
      },
    });
  };

  useFocusEffect(
    useCallback(() => {
      const id = setTimeout(() => {
        scrollRef.current?.scrollToPosition(0, 0, false);
        filtersScrollRef.current?.scrollToPosition(0, 0, false);
      }, 0);
      if (didFocusOnce.current) {
        setRadius("");
        setSelectedFilterValues({});
        setMinPrice("");
        setMaxPrice("");
        setTouched((t) => ({ ...t, radius: false, price: false }));
      } else {
        didFocusOnce.current = true;
      }
      return () => clearTimeout(id);
    }, []),
  );

  return (
    <KeyboardAwareScrollView
      ref={scrollRef}
      style={styles.screen}
      contentContainerStyle={styles.form}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid={true}
      extraScrollHeight={16}
    >
      <View style={styles.form}>
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
              <TextInput.Icon icon="map-marker" onPress={locateFromAddress} />
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
                  const { latitude, longitude } = event.nativeEvent.coordinate;
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
            value={radius}
            onChangeText={(t) => setRadius(normalizeRadiusKmText(t))}
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
                                    const checked = selected.includes(flag.key);

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
                                              checked ? "checked" : "unchecked"
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
                      style={{ marginHorizontal: 10, marginBottom: 10 }}
                      contentStyle={{ paddingVertical: 6 }}
                      onChangeText={(t) =>
                        setMinPrice(normalizePriceIntText(t))
                      }
                      onBlur={() => setTouched((t) => ({ ...t, price: true }))}
                      error={!!errors.price}
                    />

                    <TextInput
                      mode="outlined"
                      label="Max. price"
                      value={maxPrice}
                      keyboardType="numeric"
                      returnKeyType="done"
                      onSubmitEditing={() => Keyboard.dismiss()}
                      style={{ flex: 1, marginHorizontal: 10 }}
                      onChangeText={(t) =>
                        setMaxPrice(normalizePriceIntText(t))
                      }
                      onBlur={() => setTouched((t) => ({ ...t, price: true }))}
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
          onPress={onSearch}
          style={styles.primaryBtn}
          labelStyle={styles.primaryBtnLabel}
          contentStyle={styles.primaryBtnContent}
        >
          Search
        </Button>
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#E9E8E2" },
  form: { paddingVertical: 16, gap: 12, paddingBottom: 24 },
  safe: { flex: 1 },

  field: {},

  priceHelper: {
    marginTop: 4,
    marginHorizontal: 15,
    marginBottom: 12,
  },

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

  input: {
    marginTop: 5,
    marginHorizontal: 15,
    backgroundColor: "white",
  },
  roundOutline: { borderRadius: 999 },

  sectionLabel: {
    marginHorizontal: 15,
    marginTop: 6,
    fontSize: 16,
    fontWeight: "600",
    backgroundColor: "#E9E8E2",
  },

  modalBody: {
    flex: 1,
    minHeight: 0,
  },

  loadingCover: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
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
  radiusInput: {
    flex: 1,
    backgroundColor: "white",
  },
  kmText: {
    fontSize: 16,
    fontWeight: "600",
  },

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
  },
});
export default SearchDates;
