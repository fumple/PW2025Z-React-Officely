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

type OfferWithExtras = officesApi.OfficeOfferResource & {
  available?: boolean;
};

type OfferProps = NonNullable<officesApi.OfficeOfferResource["properties"]>;

function isTruthy(v: unknown) {
  if (Array.isArray(v)) return isTruthy(v[0]);

  if (v === true) return true;
  if (typeof v === "number") return v !== 0;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    return s === "true" || s === "1" || s === "yes";
  }
  return false;
}

function fmtHours(hours?: number) {
  if (hours === null || hours === undefined) return "-";
  return `${hours}h`;
}

function fmtMoney(amount?: number, currency?: string) {
  if (amount === null || amount === undefined) return "-";
  return `${amount} ${currency ?? ""}`.trim();
}

export const OfferDetailsPage = () => {
  const navigate = useNavigate();
  const { officeId, offerId } = useParams<{
    officeId?: string;
    offerId?: string;
  }>();

  // Hooks must always run (no early return before them)
  const [state, setState] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);

  const [office, setOffice] = useState<officesApi.OfficeResource | null>(null);
  const [offer, setOffer] = useState<OfferWithExtras | null>(null);

  const [sections, setSections] = useState<officesApi.FilterSection[]>([]);
  const [filtersError, setFiltersError] = useState<string | null>(null);

  const [availableError, setAvailableError] = useState<string | null>(null);
  const isAvailable = offer?.available ?? false;

  const load = async (oid: string, ofid: string) => {
    setState("loading");
    setError(null);
    setFiltersError(null);

    const [officeRes, offerRes, filtersRes] = await Promise.all([
      officesApi.getOffice(oid),
      officesApi.getOfficeOffer({ officeId: oid, offerId: ofid }),
      officesApi.getOfferFilters(),
    ]);

    if (!officeRes.ok) {
      setOffice(null);
      setOffer(null);
      setSections([]);
      setError(
        officeRes.error?.errors?.[0]?.message ?? "Failed to load office.",
      );
      setState("error");
      return;
    }

    if (!offerRes.ok) {
      setOffice(officeRes.data);
      setOffer(null);
      setSections([]);
      setError(offerRes.error?.errors?.[0]?.message ?? "Failed to load offer.");
      setState("error");
      return;
    }

    setOffice(officeRes.data);
    setOffer(offerRes.data);

    if (!filtersRes.ok) {
      setSections([]);
      setFiltersError(
        filtersRes.error?.errors?.[0]?.message ?? "Failed to load filters.",
      );
    } else {
      setSections(filtersRes.data.filters ?? []);
    }

    setState("ready");
  };

  useEffect(() => {
    if (!officeId || !offerId) return;

    let alive = true;

    (async () => {
      if (!alive) return;
      await load(officeId, offerId);
    })();

    return () => {
      alive = false;
    };
  }, [officeId, offerId]);

  const props: OfferProps = useMemo(() => offer?.properties ?? {}, [offer]);

  const decodedProperties = useMemo(() => {
    // Grouped by section for UI
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
          const v = props[k];
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

  const publishOffer = async (next: boolean) => {
    if (!officeId || !offerId || !offer) return;

    setAvailableError(null);

    const prev = offer.available;
    setOffer({ ...offer, available: next });

    const res = await officesApi.setOfficeOfferAvailable({
      officeId,
      offerId,
      available: next,
    });

    if (!res.ok) {
      setOffer({ ...offer, available: prev });
      setAvailableError(
        res.error?.errors?.[0]?.message ?? "Failed to update availability.",
      );
    }
  };

  if (!officeId || !offerId) {
    return (
      <Box sx={{ px: "12px", pt: "6px" }}>
        <Typography color="error">
          Missing officeId or offerId. Expected route:{" "}
          <b>/app/offices/:officeId/offer/:offerId</b>
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
          {office?.name ?? "Office"} -{" "}
          {offer?.publicName || offer?.name || offerId}
        </Typography>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px", mt: "10px" }}>
          <Button
            variant="contained"
            startIcon={<EditIcon fontSize="small" />}
            onClick={() => navigate("./edit")}
            disabled={!offer}
          >
            Edit
          </Button>

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
            onClick={() => publishOffer(!isAvailable)}
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
            {error ?? "Failed to load offer."}
          </Typography>
        ) : null}

        {offer ? (
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
                  <b>Internal name:</b> {offer.name}
                </Typography>
                <Typography sx={{ fontSize: "13px" }}>
                  <b>Public name:</b> {offer.publicName || "-"}
                </Typography>
                <Typography sx={{ fontSize: "13px" }}>
                  <b>Price per day:</b>{" "}
                  {fmtMoney(offer.pricePerDay, offer.pricePerDayCurrency)}
                </Typography>
                <Typography sx={{ fontSize: "13px" }}>
                  <b>Free cancellation:</b>{" "}
                  {fmtHours(offer.freeCancellationHours)} before reservation
                </Typography>
                <Typography sx={{ fontSize: "13px" }}>
                  <b>Payment required by:</b> {fmtHours(offer.paymentHours)}{" "}
                  after reservation was made
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
              Properties
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
                  No filters available. Showing raw properties below.
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
