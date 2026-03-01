import type { SelectLocationWithLogs } from "~/lib/db/schema";
import type { MapPoint } from "~/lib/types";

import { useSidebarStore } from "~/stores/sidebar";

import { useMapStore } from "./map";

const listLocationsInSidebar = new Set(["dashboard", "dashboard-add"]);
const listCurrentLocationInSidebar = new Set([
  "dashboard-location-slug",
  "dashboard-location-slug-add",
  "dashboard-location-slug-edit",
]);

export const useLocationsStore = defineStore("useLocationsStore", () => {
  const route = useRoute();

  const {
    data: locations,
    status: locationsStatus,
    refresh: refreshLocations,
  } = useFetch("/api/locations", {
    lazy: true,
  });

  const currentSlug = ref<string | null>(null);
  const locationUrlWithSlug = computed(() => `/api/locations/${currentSlug.value}`);

  const {
    data: currentLocation,
    status: currentLocationStatus,
    error: currentLocationError,
    refresh: rcl,
  } = useFetch<SelectLocationWithLogs>(locationUrlWithSlug, {
    lazy: true,
    immediate: false,
    watch: false,
  });

  const refreshCurrentLocation = async (slug?: string) => {
    if (slug) {
      currentSlug.value = slug;
    }
    // await nextTick();
    return rcl();
  };

  const sidebarStore = useSidebarStore();
  const mapStore = useMapStore();

  effect(() => {
    if (locations.value && listLocationsInSidebar.has(route.name?.toString() || "")) {
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
    else if (currentLocation.value && listCurrentLocationInSidebar.has(route.name?.toString() || "")) {
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
