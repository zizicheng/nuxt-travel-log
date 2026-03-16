<script lang="ts" setup>
import type { InsertLocation } from "~/lib/db/schema";

import { CENTER_USA } from "~/lib/constants";

const route = useRoute();
const { currentLocation } = useLocationStore();
const { $csrfFetch } = useNuxtApp();

async function onSubmit(values: InsertLocation) {
  await $csrfFetch(`/api/locations/${route.params.slug}/add`, {
    method: "post",
    body: values,
  });
}

function onSubmitComplete() {
  navigateTo({
    name: "dashboard-location-slug",
    params: {
      slug: route.params.slug,
    },
  });
}
</script>

<template>
  <LocationForm
    :on-submit
    :on-submit-complete
    :initial-values="{
      name: '',
      description: '',
      long: currentLocation?.long || (CENTER_USA as [number, number])[0],
      lat: currentLocation?.lat || (CENTER_USA as [number, number])[1],

    }"
    submit-label="Add Location Log"
    submit-icon="tabler:map-pin-up"
  />
</template>
