<script setup lang="ts">
import type { FetchError } from "ofetch";

import { toTypedSchema } from "@vee-validate/zod";

import { InsertLocation } from "~/lib/db/schema/location";

const { $csrfFetch } = useNuxtApp();
const router = useRouter();
const loading = ref(false);
const submitted = ref(false);
const submitError = ref("");
const { handleSubmit, errors, meta, setErrors } = useForm({
  validationSchema: toTypedSchema(InsertLocation),
});

const onSubmit = handleSubmit(async (values) => {
  try {
    submitError.value = "";
    loading.value = true;
    await $csrfFetch("/api/locations", {
      method: "POST",
      body: values,
    });
    submitted.value = true;
    navigateTo("/dashboard");
  }
  catch (e) {
    const error = e as FetchError;
    if (error.data?.data) {
      setErrors(error.data?.data);
    }
    submitError.value = error.statusMessage || "An error occurred while submitting the form.";
  }
  loading.value = false;
});

onBeforeRouteLeave(() => {
  if (!submitted.value && meta.value.dirty) {
    // eslint-disable-next-line no-alert
    const confirm = window.confirm("You have unsaved changes. Are you sure you want to leave?");
    if (!confirm) {
      return false;
    }
  }
  return true;
});
</script>

<template>
  <div class="container max-w-md mx-auto">
    <div class="my-4">
      <h1 class="text-lg">
        Add Location
      </h1>
      <p class="text-sm">
        A location is a place you have traveled or will travel to. It can be a city, country, state or point of interest. You can add specific times you visited this location after adding it.
      </p>
    </div>
    <div v-if="submitError.length > 0" role="alert" class="alert alert-error">
      <span>{{ submitError }}</span>
    </div>
    <form class="flex flex-col gap-2" @submit.prevent="onSubmit">
      <AppFormField
        label="Name"
        name="name"
        :error="errors.name"
        :disabled="loading"
      />
      <AppFormField
        label="Description"
        name="description"
        type="textarea"
        :error="errors.description"
        :disabled="loading"
      />
      <AppFormField
        label="Latitude"
        name="lat"
        type="number"
        :error="errors.lat"
        :disabled="loading"
      />
      <AppFormField
        label="Longitude"
        name="long"
        type="number"
        :error="errors.long"
        :disabled="loading"
      />
      <div class="flex justify-end gap-2">
        <button
          type="button"
          class="btn btn-outline"
          :disabled="loading"
          @click="router.back()"
        >
          <Icon name="i-tabler:arrow-left" size="24" />
          Cancel
        </button>
        <button type="submit" class="btn btn-primary" :disabled="loading">
          Add
          <span v-if="loading" class="loading loading-spinner loading-sm" />
          <Icon v-else name="i-tabler:circle-plus-filled" size="24" />
        </button>
      </div>
    </form>
  </div>
</template>
