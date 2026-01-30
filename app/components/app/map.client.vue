<script setup lang="ts">
import {
  MglMap,
  MglMarker,
  MglNavigationControl,
  MglPopup,
} from "@indoorequal/vue-maplibre-gl";

import { CENTER_USA } from "~/lib/constants";

const colorMode = useColorMode();
const mapStore = useMapStore();
const style = computed(() => {
  return colorMode.value === "dark"
    ? "/styles/dark.json"
    : "https://tiles.openfreemap.org/styles/liberty";
});
const zoom = 3;

onMounted(() => {
  mapStore.init();
});
</script>

<template>
  <MglMap
    :map-style="style"
    :center="CENTER_USA"
    :zoom="zoom"
  >
    <MglNavigationControl />
    <MglMarker
      v-for="point in mapStore.mapPoints"
      :key="point.id"
      :coordinates="[point.long, point.lat]"
    >
      <template #marker>
        <div
          class="tooltip tooltip-top hover:cursor-pointer"
          :class="{
            'tooltip-open': mapStore.selectedPoint?.id === point.id,
          }"
          :data-tip="point.name"
          @mouseenter="mapStore.selectPointWithoutFlyTo(point)"
          @mouseleave="mapStore.selectPointWithoutFlyTo(null)"
        >
          <Icon
            name="i-tabler:map-pin-filled"
            size="30"
            :class="mapStore.selectedPoint?.id === point.id ? 'text-accent' : 'text-primary'"
          />
        </div>
      </template>
      <MglPopup>
        <h3 class="text-xl">
          {{ point.name }}
        </h3>
        <p v-if="point.description">
          {{ point.description }}
        </p>
      </MglPopup>
    </MglMarker>
  </mglmap>
</template>

<style>
@import "maplibre-gl/dist/maplibre-gl.css";
</style>
