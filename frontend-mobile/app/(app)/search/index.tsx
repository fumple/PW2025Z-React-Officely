import { buildFilterList } from "@/src/filters/buildFilterList";
import { useFiltersStore } from "@/src/filters/filtersStore";
import { nominatimGeocode, nominatimReverse } from "@/src/utils/nominatim";
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
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

//TODO: filters should not be left tagged after someone searches
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

//TODO:make the serach screen open up always in the top not scrolled down
const SearchDates = () => {
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
  });
  const mapRef = useRef<MapView>(null);
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
      touched.radius && radiusTrimmed
        ? radiusTrimmed.startsWith("0")
          ? "Radius cannot start with 0"
          : !/^\d+$/.test(radiusTrimmed)
            ? "Radius must be a whole number"
            : null
        : null;

    return {
      nearAddress: locationError,
      range: rangeError,
      radius: radiusError,
    };
  }, [touched, nearAddress, mapPin, startDate, endDate, radius]);

  const isFormValid =
    (!!nearAddress.trim() || !!mapPin) &&
    !!startDate &&
    !!endDate &&
    startDate <= endDate &&
    !errors.radius;

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

    const radiusKm = radius.trim() ? Number(radius.trim()) : undefined;
    const nearAddressApi = nearAddress.trim() ? nearAddress.trim() : undefined;
    const pageSize = 20;
    const pageIndex = 0;

    router.push({
      pathname: "/(app)/search/results",
      params: {
        nearAddress: nearAddressApi,
        nearLat: mapPin?.lat != null ? String(mapPin.lat) : undefined,
        nearLon: mapPin?.lon != null ? String(mapPin.lon) : undefined,
        maxDistanceFromAddress: radiusKm != null ? String(radiusKm) : undefined,
        startDate: formatDateApi(startDate),
        endDate: formatDateApi(endDate),
        filter: apiFilters.length ? apiFilters : undefined,
        pageToken: String(pageIndex),
        pageSize: String(pageSize),
      },
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.safe}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 70 : 0} //TODO: CHECK IF THIS CAN BE DONE BETTER
    >
      <ScrollView keyboardShouldPersistTaps="handled" style={styles.screen}>
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
              value={radius}
              onChangeText={setRadius}
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
              <View style={styles.filtersBar}>
                <Text variant="titleMedium" style={{ fontWeight: "700" }}>
                  Filters
                </Text>
                <Button onPress={() => setFiltersOpen(false)}>Done</Button>
              </View>

              <Divider />

              {filtersLoading ? (
                <ActivityIndicator /> //TODO: Add validation in price range (delete leading zeros) and change json for price
              ) : filtersError ? (
                <HelperText type="error" style={{ marginHorizontal: 12 }}>
                  {filtersError}
                </HelperText>
              ) : (
                <ScrollView
                  style={{ flex: 1 }}
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
                </ScrollView>
              )}

              <Divider />

              <View style={styles.filtersBar}>
                <Button mode="text" onPress={() => setSelectedFilterValues({})}>
                  Clear
                </Button>

                <Button mode="contained" onPress={() => setFiltersOpen(false)}>
                  Apply
                </Button>
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#E9E8E2" },
  form: { paddingVertical: 16, gap: 12, paddingBottom: 24 },
  safe: { flex: 1 },

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
