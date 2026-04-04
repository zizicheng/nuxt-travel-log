import type { LngLatBounds } from "maplibre-gl";

import type { MapPoint } from "~/lib/types";

export const useMapStore = defineStore("useMapStore", () => {
  const mapPoints = ref<MapPoint[]>([]);
  const selectedPoint = ref<MapPoint | null>(null);
  const addedPoint = ref<MapPoint & { centerMap?: boolean; zoom?: number } | null>(null);
  const mapReady = ref(false);

  async function init() {
    const { useMap } = await import("@indoorequal/vue-maplibre-gl");
    const { LngLatBounds } = await import("maplibre-gl");

    const map = useMap();

    if (map.map) {
      if (map.map.loaded()) {
        mapReady.value = true;
      }
      else {
        map.map.on("load", () => {
          mapReady.value = true;
        });
      }
    }

    let bounds: LngLatBounds | null = null;
    const padding = 40;

    watch([() => mapPoints.value, () => mapReady.value], ([points, ready]) => {
      const firstPoint = points[0];
      if (!firstPoint || !ready) {
        return;
      }

      bounds = points.reduce((bounds, point) => {
        return bounds.extend([point.long, point.lat]);
      }, new LngLatBounds(
        [firstPoint.long, firstPoint.lat],
        [firstPoint.long, firstPoint.lat],
      ));
      map.map?.fitBounds(bounds, {
        padding,
        maxZoom: 10,
      });
    }, {
      flush: "post",
    });

    watch(addedPoint, (newPoint, oldPoint) => {
      if ((newPoint && oldPoint === null) || newPoint?.centerMap) {
        map.map?.flyTo({
          center: [newPoint.long, newPoint.lat],
          speed: 2,
          zoom: 5,
        });
      }
    }, {
      immediate: true,
    });
  }
  return {
    init,
    mapPoints,
    selectedPoint,
    addedPoint,
  };
});
