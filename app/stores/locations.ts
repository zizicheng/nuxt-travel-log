import type { SelectLocationLogWithImages, SelectLocationWithLogs } from "~/lib/db/schema";
import type { MapPoint } from "~/lib/types";

import { CURRENT_LOCATION_LOG_PAGES, CURRENT_LOCATION_PAGES, LOCATION_PAGES } from "~/lib/constants";
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
  const locationLogUrlWithSlugAndId = computed(() => `/api/locations/${route.params.slug}/${route.params.id}`);

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

  const {
    data: currentLocationLog,
    status: currentLocationLogStatus,
    error: currentLocationLogError,
    refresh: refreshCurrentLocationLog,
  } = useFetch<SelectLocationLogWithImages>(locationLogUrlWithSlugAndId, {
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
        sidebarItems.push({
          id: `location-${location.id}`,
          label: location.name,
          icon: "i-tabler:map-pin-filled",
          to: mapPoint.to,
          mapPoint,
        });
        mapPoints.push(mapPoint);
      });

      sidebarStore.sidebarItems = sidebarItems;
      mapStore.mapPoints = mapPoints;
    }
    else if (currentLocation.value && CURRENT_LOCATION_PAGES.has(route.name?.toString() || "") && route.params.slug) {
      const slug = route.params.slug.toString();
      const mapPoints: MapPoint[] = [];
      const sidebarItems: SidebarItem[] = [];

      currentLocation.value.locationLogs.forEach((log) => {
        const mapPoint = createMapPointFromLocationLog(log, route.params.slug as string);
        sidebarItems.push({
          id: `location-log-${log.id}`,
          label: log.name,
          icon: `i-tabler:map-pin-filled`,
          to: `/dashboard/location/${slug}/${log.id}`,
          mapPoint,
        });
        mapPoints.push(mapPoint);
      });
      sidebarStore.sidebarItems = sidebarItems;
      if (mapPoints.length) {
        mapStore.mapPoints = mapPoints;
      }
      else {
        mapStore.mapPoints = [currentLocation.value];
      }
    }
    else if (currentLocationLog.value && CURRENT_LOCATION_LOG_PAGES.has(route.name?.toString() || "")) {
      sidebarStore.sidebarItems = [];
      mapStore.mapPoints = [currentLocationLog.value];
    }
    sidebarStore.loading = locationsStatus.value === "pending" || currentLocationStatus.value === "pending";
    if (sidebarStore.loading) {
      mapStore.mapPoints = [];
    }
  });

  return {
    locations,
    locationsStatus,
    refreshLocations,
    currentLocation,
    currentLocationStatus,
    currentLocationError,
    refreshCurrentLocation,
    currentLocationLog,
    currentLocationLogStatus,
    currentLocationLogError,
    refreshCurrentLocationLog,
  };
});
