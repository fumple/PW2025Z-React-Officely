import type { ApiFilterGroup } from "./filtersStore";

export const buildFilterList = (
  filterGroups: ApiFilterGroup[],
  selectedFilterValues: any,
) => {
  const filterEntries: string[] = [];

  for (const filterSection of filterGroups) {
    const sectionKey = filterSection.key;

    for (const filterElement of filterSection.elements) {
      const elementKey = filterElement.key;

      if (filterElement.type === "flags") {
        const selectedFlagKeys =
          selectedFilterValues[`${sectionKey}.${elementKey}`] ?? [];

        for (const flagKey of selectedFlagKeys) {
          if (!flagKey) continue;

          const propertyKey = `${sectionKey}.${elementKey}.${flagKey}`;
          const propertyValue = "true";
          filterEntries.push(`${propertyKey}=${propertyValue}`);
        }
      }

      if (filterElement.type === "integer") {
        const rawTextValue =
          selectedFilterValues[`${sectionKey}.${elementKey}`] ?? "";

        const trimmedTextValue = String(rawTextValue).trim();
        if (!trimmedTextValue) continue;

        const integerValue = Number(trimmedTextValue);
        if (!Number.isInteger(integerValue)) continue;

        const propertyKey = `${sectionKey}.${elementKey}`;
        filterEntries.push(`${propertyKey}=${integerValue}`);
      }
    }
  }

  return filterEntries;
};
