import type { MapPoint } from "~/lib/types";

import { useSidebarStore } from "~/stores/sidebar";

import { useMapStore } from "./map";

export const useLocationsStore = defineStore("useLocationsStore", () => {
  const { data, status, refresh } = useFetch("/api/locations", {
    lazy: true,
  });
  const sidebarStore = useSidebarStore();
  const mapStore = useMapStore();

  effect(() => {
    if (data.value) {
      const mapPoints: MapPoint[] = [];
      const sidebarItems: SidebarItem[] = [];

      data.value.forEach((location) => {
        const mapPoint = createMapPointFromLocation(location);
        mapPoints.push(mapPoint);

        sidebarItems.push({
          id: `location-${location.id}`,
          label: location.name,
          icon: "i-tabler:map-pin-filled",
          to: mapPoint.to,
          mapPoint,
        });
      });

      sidebarStore.sidebarItems = sidebarItems;
      mapStore.mapPoints = mapPoints;
    }
    sidebarStore.loading = status.value === "pending";
  });

  return {
    locations: data,
    status,
    refresh,
  };
});
