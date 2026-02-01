import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";

import * as officesApi from "../../../api/officesApi";

type LoadState = "idle" | "loading" | "ready" | "error";

function firstVal(v: unknown): unknown {
  return Array.isArray(v) ? v[0] : v;
}

function isTruthy(v: unknown) {
  const x = firstVal(v);
  if (x === true) return true;
  if (typeof x === "number") return x !== 0;
  if (typeof x === "string") {
    const s = x.trim().toLowerCase();
    return s === "true" || s === "1" || s === "yes";
  }
  return false;
}

function fmtCap(cap?: number) {
  if (cap === null || cap === undefined) return "-";
  return String(cap);
}

type OfferProps = NonNullable<officesApi.OfficeOfferResource["properties"]>;

export const ItemDetailsPage = () => {
  const navigate = useNavigate();
  const { officeId, itemId } = useParams<{
    officeId?: string;
    itemId?: string;
  }>();

  const [state, setState] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);

  const [office, setOffice] = useState<officesApi.OfficeResource | null>(null);
  const [item, setItem] = useState<
    (officesApi.OfficeItemResource & { available?: boolean }) | null
  >(null);

  const [offer, setOffer] = useState<officesApi.OfficeOfferResource | null>(
    null,
  );

  const [sections, setSections] = useState<officesApi.FilterSection[]>([]);
  const [filtersError, setFiltersError] = useState<string | null>(null);

  const [availableError, setAvailableError] = useState<string | null>(null);
  const isAvailable = item?.available ?? false;
  const [togglingAvailable, setTogglingAvailable] = useState(false);

  const load = async (oid: string, iid: string) => {
    setState("loading");
    setError(null);
    setFiltersError(null);

    // load office + item + filters first
    const [officeRes, itemRes, filtersRes] = await Promise.all([
      officesApi.getOffice(oid),
      officesApi.getOfficeItem({ officeId: oid, itemId: iid }),
      officesApi.getOfferFilters(),
    ]);

    if (!officeRes.ok) {
      setOffice(null);
      setItem(null);
      setOffer(null);
      setSections([]);
      setError(
        officeRes.error?.errors?.[0]?.message ?? "Failed to load office.",
      );
      setState("error");
      return;
    }

    if (!itemRes.ok) {
      setOffice(officeRes.data);
      setItem(null);
      setOffer(null);
      setSections([]);
      setError(itemRes.error?.errors?.[0]?.message ?? "Failed to load item.");
      setState("error");
      return;
    }

    setOffice(officeRes.data);
    setItem(itemRes.data);

    if (!filtersRes.ok) {
      setSections([]);
      setFiltersError(
        filtersRes.error?.errors?.[0]?.message ?? "Failed to load filters.",
      );
    } else {
      setSections(filtersRes.data.filters ?? []);
    }

    // load offer for this item (so we can show pricing + decoded properties)
    const offerRes = await officesApi.getOfficeOffer({
      officeId: oid,
      offerId: itemRes.data.offerId,
    });

    if (!offerRes.ok) {
      setOffer(null);
      // not fatal for the page, but show an error
      setError(offerRes.error?.errors?.[0]?.message ?? "Failed to load offer.");
      setState("ready");
      return;
    }

    setOffer(offerRes.data);
    setState("ready");
  };

  useEffect(() => {
    if (!officeId || !itemId) return;

    let alive = true;

    (async () => {
      if (!alive) return;
      await load(officeId, itemId);
    })();

    return () => {
      alive = false;
    };
  }, [officeId, itemId]);

  const props: OfferProps = useMemo(() => offer?.properties ?? {}, [offer]);

  const decodedProperties = useMemo(() => {
    const out: Array<{
      sectionKey: string;
      sectionLabel: string;
      items: Array<
        | { kind: "flags"; label: string; selected: string[] }
        | { kind: "integer"; label: string; value: string }
      >;
    }> = [];

    for (const sec of sections) {
      const group = {
        sectionKey: sec.key,
        sectionLabel: sec.label,
        items: [] as Array<
          | { kind: "flags"; label: string; selected: string[] }
          | { kind: "integer"; label: string; value: string }
        >,
      };

      for (const el of sec.elements ?? []) {
        if (el.type === "flags") {
          const selected: string[] = [];
          for (const f of el.flags ?? []) {
            const k = `${sec.key}.${el.key}.${f.key}`;
            if (isTruthy(props[k])) selected.push(f.label);
          }
          group.items.push({ kind: "flags", label: el.label, selected });
        }

        if (el.type === "integer") {
          const k = `${sec.key}.${el.key}`;
          const v = firstVal(props[k]);
          group.items.push({
            kind: "integer",
            label: el.label,
            value:
              v === null || v === undefined
                ? "-"
                : typeof v === "string"
                  ? v
                  : String(v),
          });
        }
      }

      out.push(group);
    }

    return out;
  }, [props, sections]);

  const toggleAvailable = async (next: boolean) => {
    if (!officeId || !itemId || !item) return;

    setAvailableError(null);
    setTogglingAvailable(true);

    const prev = item.available ?? false;
    setItem({ ...item, available: next });

    const res = await officesApi.updateOfficeItem({
      officeId,
      itemId,
      input: {
        available: next,
      },
    });

    setTogglingAvailable(false);

    if (!res.ok) {
      setItem({ ...item, available: prev });
      setAvailableError(
        res.error?.errors?.[0]?.message ?? "Failed to update availability.",
      );
    }
  };

  if (!officeId || !itemId) {
    return (
      <Box sx={{ px: "12px", pt: "6px" }}>
        <Typography color="error">
          Missing officeId or itemId. Expected route params: <b>:officeId</b>{" "}
          and <b>:itemId</b>
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ px: "12px", pt: "6px" }}>
      <Box sx={{ maxWidth: 720 }}>
        <Typography
          component="h1"
          sx={{ m: 0, fontSize: "22px", fontWeight: 600, color: "#111" }}
        >
          {office?.name ?? "Office"} - {item?.name ?? `Item ${itemId}`}
        </Typography>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px", mt: "10px" }}>
          <Button
            variant="contained"
            startIcon={<EditIcon fontSize="small" />}
            onClick={() => navigate("./edit")}
            disabled={!item}
          >
            Edit
          </Button>

          <Button variant="outlined" onClick={() => navigate("/app/bookings")}>
            View bookings
          </Button>

          {/* optional, because your Swagger PATCH supports it */}
          <Button
            variant="text"
            color="error"
            startIcon={
              isAvailable ? (
                <VisibilityOffIcon fontSize="small" />
              ) : (
                <VisibilityIcon fontSize="small" />
              )
            }
            sx={{ textTransform: "none" }}
            onClick={() => toggleAvailable(!isAvailable)}
            disabled={!item || togglingAvailable}
          >
            {isAvailable ? "Unpublish" : "Publish"}
          </Button>

          {availableError ? (
            <Typography
              color="error"
              sx={{ fontSize: "13px", alignSelf: "center" }}
            >
              {availableError}
            </Typography>
          ) : null}
        </Box>

        {state === "loading" ? (
          <Box
            sx={{
              mt: "10px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <CircularProgress size={18} />
            <Typography sx={{ fontSize: "13px", color: "#666" }}>
              Loading…
            </Typography>
          </Box>
        ) : null}

        {state === "error" ? (
          <Typography color="error" sx={{ mt: "10px" }}>
            {error ?? "Failed to load item."}
          </Typography>
        ) : null}

        {item ? (
          <>
            <Paper
              variant="outlined"
              sx={{ mt: "12px", p: "12px", borderRadius: "12px" }}
            >
              <Typography
                sx={{ fontSize: "13px", fontWeight: 700, color: "#111" }}
              >
                Details
              </Typography>

              <Box
                sx={{
                  mt: "8px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <Typography sx={{ fontSize: "13px" }}>
                  <b>Type:</b> {item.type}
                </Typography>
                <Typography sx={{ fontSize: "13px" }}>
                  <b>Floor:</b> {item.floor}
                </Typography>
                <Typography sx={{ fontSize: "13px" }}>
                  <b>Room:</b> {item.room}
                </Typography>
                <Typography sx={{ fontSize: "13px" }}>
                  <b>Capacity:</b> {fmtCap(item.capacity)}
                </Typography>
                <Typography sx={{ fontSize: "13px" }}>
                  <b>Offer:</b> {offer?.name ?? item.offerId}
                </Typography>
              </Box>
            </Paper>

            <Typography
              sx={{
                mt: "14px",
                fontSize: "14px",
                fontWeight: 700,
                color: "#111",
              }}
            >
              Properties (from offer)
            </Typography>

            <Paper
              variant="outlined"
              sx={{ mt: "8px", p: "12px", borderRadius: "12px" }}
            >
              {filtersError ? (
                <Typography color="error" sx={{ mb: "8px", fontSize: "13px" }}>
                  {filtersError}
                </Typography>
              ) : null}

              {decodedProperties.length === 0 ? (
                <Typography sx={{ fontSize: "13px", color: "#666" }}>
                  No filters available.
                </Typography>
              ) : (
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: "12px" }}
                >
                  {decodedProperties.map((sec) => (
                    <Box key={sec.sectionKey}>
                      <Typography
                        sx={{
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "#333",
                        }}
                      >
                        {sec.sectionLabel}
                      </Typography>

                      <Box
                        sx={{
                          mt: "6px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px",
                        }}
                      >
                        {sec.items.map((it, idx) => {
                          if (it.kind === "flags") {
                            return (
                              <Box key={`${sec.sectionKey}-${idx}`}>
                                <Typography
                                  sx={{ fontSize: "12px", color: "#666" }}
                                >
                                  {it.label}
                                </Typography>
                                <Typography
                                  sx={{ fontSize: "13px", color: "#111" }}
                                >
                                  {it.selected.length
                                    ? it.selected.join(", ")
                                    : "-"}
                                </Typography>
                              </Box>
                            );
                          }

                          return (
                            <Box key={`${sec.sectionKey}-${idx}`}>
                              <Typography
                                sx={{ fontSize: "12px", color: "#666" }}
                              >
                                {it.label}
                              </Typography>
                              <Typography
                                sx={{ fontSize: "13px", color: "#111" }}
                              >
                                {it.value}
                              </Typography>
                            </Box>
                          );
                        })}
                      </Box>

                      <Divider sx={{ mt: "10px" }} />
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>

            <Box sx={{ mt: "12px" }}>
              <Button
                variant="text"
                onClick={() => navigate(`/app/offices/${officeId}`)}
              >
                Back to office
              </Button>
            </Box>
          </>
        ) : null}
      </Box>
    </Box>
  );
};
