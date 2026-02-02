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
        const rawSelected =
          selectedFilterValues[`${sectionKey}.${elementKey}`] ?? [];

        const selectedFlagKeys: string[] = Array.isArray(rawSelected)
          ? rawSelected
          : rawSelected
            ? [String(rawSelected)]
            : [];

        for (const flagKey of selectedFlagKeys) {
          if (!flagKey) continue;

          const propertyKey = `${sectionKey}.${elementKey}.${flagKey}`;
          filterEntries.push(`${propertyKey}=true`);
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
