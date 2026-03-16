import type { SelectLocationWithLogs } from "~/lib/db/schema";
import type { MapPoint } from "~/lib/types";

import { CURRENT_LOCATION_PAGES, LOCATION_PAGES } from "~/lib/constants";
import { useSidebarStore } from "~/stores/sidebar";

import { useMapStore } from "./map";

export const useLocationStore = defineStore("useLocationsStore", () => {
  const route = useRoute();

  const {
    data: locations,
    status: locationsStatus,
    refresh: refreshLocations,
  } = useFetch("/api/locations", {
    lazy: true,
  });

  const locationUrlWithSlug = computed(() => `/api/locations/${route.params.slug}`);

  const {
    data: currentLocation,
    status: currentLocationStatus,
    error: currentLocationError,
    refresh: refreshCurrentLocation,
  } = useFetch<SelectLocationWithLogs>(locationUrlWithSlug, {
    lazy: true,
    immediate: false,
    watch: false,
  });

  const sidebarStore = useSidebarStore();
  const mapStore = useMapStore();

  effect(() => {
    if (locations.value && LOCATION_PAGES.has(route.name?.toString() || "")) {
      const mapPoints: MapPoint[] = [];
      const sidebarItems: SidebarItem[] = [];

      locations.value.forEach((location) => {
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
    else if (currentLocation.value && CURRENT_LOCATION_PAGES.has(route.name?.toString() || "")) {
      sidebarStore.sidebarItems = [];
      mapStore.mapPoints = [currentLocation.value];
    }
    sidebarStore.loading = locationsStatus.value === "pending";
  });

  return {
    locations,
    locationsStatus,
    refreshLocations,
    currentLocation,
    currentLocationStatus,
    currentLocationError,
    refreshCurrentLocation,
  };
});
