import countries from "i18n-iso-countries";

import enLocale from "i18n-iso-countries/langs/en.json";

countries.registerLocale(enLocale);

export type CountryOption = { code: string; label: string };

export const COUNTRY_OPTIONS: CountryOption[] = Object.entries(
  countries.getNames("en", { select: "official" }),
)
  .map(([code, label]) => ({ code, label }))
  .sort((a, b) => a.label.localeCompare(b.label));
