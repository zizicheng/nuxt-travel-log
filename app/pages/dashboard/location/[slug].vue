<script setup lang="ts">
const locationStore = useLocationStore();
const {
  currentLocation: location,
  currentLocationStatus: status,
  currentLocationError: error,
} = storeToRefs(locationStore);
const route = useRoute();
onMounted(async () => {
  if (route.params.slug) {
    await nextTick();
    locationStore.refreshCurrentLocation();
  }
});
onBeforeRouteUpdate((to) => {
  if (to.name === "dashboard-location-slug") {
    locationStore.refreshCurrentLocation();
  }
});
</script>

<template>
  <div class="p-4 min-h-64">
    <div v-if="status === 'pending'">
      <div class="loading" />
    </div>
    <div v-if="error && status !== 'pending'" class="alert alert-error">
      <h2 class="text-lg">
        {{ error.statusMessage }}八个压力
      </h2>
    </div>
    <div v-if="route.name === 'dashboard-location-slug' && location && status !== 'pending'">
      <h2 class="text-xl">
        {{ location.name }}
      </h2>
      <p class="text-sm">
        {{ location.description }}
      </p>
      <div v-if="!location.locationLogs.length" class="mt-4">
        <p class="text-sm italic">
          Add a location log to get started.
        </p>
        <button class="btn btn-primary mt-2">
          Add Location Log
          <Icon
            name="i-tabler:map-pin-plus"
            size="20"
            class="ml-1"
          />
        </button>
      </div>
    </div>
    <div v-if="route.name !== 'dashboard-location-slug'">
      <NuxtPage />
    </div>
  </div>
</template>
