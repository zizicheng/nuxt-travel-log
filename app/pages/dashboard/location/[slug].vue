<script setup lang="ts">
const locationsStore = useLocationsStore();
const {
  currentLocation: location,
  currentLocationStatus: status,
  currentLocationError: error,
} = storeToRefs(locationsStore);
const route = useRoute();
onMounted(() => {
  const slug = route.params.slug as string;
  if (slug) {
    locationsStore.refreshCurrentLocation(slug);
  }
});
</script>

<template>
  <div class="p-4 min-h-64">
    <div v-if="status === 'pending'">
      <div class="loading" />
    </div>
    <div v-if="location && status !== 'pending'">
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
    <div v-if="error && status !== 'pending'" class="alert alert-error">
      <h2 class="text-lg">
        {{ error.statusMessage }}
      </h2>
      <p>{{ route.params.slug }}</p>
    </div>
  </div>
</template>
