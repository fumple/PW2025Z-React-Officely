import { apiFetch } from "./client";

type GetOfficesParams = {
  startDate: string;
  endDate: string;
  nearAddress?: string;
  nearLat?: number;
  nearLon?: number;
  maxDistanceFromAddress?: number;
  filter?: string[];
  sort?: string;
  pageSize: number;
  pageToken?: number;
};

const buildQueryString = (params: GetOfficesParams) => {
  const urlParams = new URLSearchParams();

  urlParams.set("startDate", params.startDate);
  urlParams.set("endDate", params.endDate);

  if (params.nearAddress !== undefined && params.nearAddress !== null) {
    urlParams.set("nearAddress", params.nearAddress);
  }

  if (
    params.nearLat !== undefined &&
    params.nearLat !== null &&
    params.nearLon !== undefined &&
    params.nearLon !== null
  ) {
    urlParams.set("nearLat", String(params.nearLat));
    urlParams.set("nearLon", String(params.nearLon));
  }

  if (
    params.maxDistanceFromAddress !== undefined &&
    params.maxDistanceFromAddress !== null
  ) {
    urlParams.set(
      "maxDistanceFromAddress",
      String(params.maxDistanceFromAddress),
    );
  }

  if (params.filter && params.filter.length > 0) {
    for (const filterValue of params.filter) {
      if (!filterValue) continue;
      urlParams.append("filter", filterValue);
    }
  }

  if (params.sort) {
    urlParams.set("sort", params.sort);
  }

  urlParams.set("pageSize", String(params.pageSize));

  if (params.pageToken !== undefined && params.pageToken !== null) {
    urlParams.set("pageToken", String(params.pageToken));
  }

  const queryString = urlParams.toString();
  if (queryString.length === 0) return "";
  return "?" + queryString;
};

export const getOffices = async (params: GetOfficesParams) => {
  const trimmedAddress = params.nearAddress?.trim();

  const queryString = buildQueryString({
    ...params,
    nearAddress: trimmedAddress,
  });

  const requestPath = "/offices" + queryString;

  return apiFetch(requestPath, { method: "GET" });
};
