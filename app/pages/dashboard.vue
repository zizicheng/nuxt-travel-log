<script setup lang="ts">
import { useSidebarStore } from "~/stores/sidebar";

const isSidebarOpen = ref(false);
const route = useRoute();
const sidebarStore = useSidebarStore();
const locationsStore = useLocationsStore();
const mapStore = useMapStore();

const { currentLocation } = storeToRefs(locationsStore);

onMounted(() => {
  const storedState = localStorage.getItem("isSidebarOpen");
  if (storedState !== null) {
    isSidebarOpen.value = storedState === "true";
  }
  if ((route.path !== "/dashboard")) {
    locationsStore.refreshLocations();
  }
});

effect(() => {
  if (route.name === "dashboard") {
    sidebarStore.sidebarTopItems = [
      {
        id: "add-location",
        label: "Add Location",
        icon: "i-tabler:circle-plus-filled",
        to: "/dashboard/add",
      },
      {
        id: "link-dashboard",
        label: "Locations",
        href: "/dashboard",
        icon: "i-tabler:map",
      },
    ];
  }
  else if (route.name === "dashboard-location-slug") {
    sidebarStore.sidebarTopItems = [
      {
        id: "back-to-dashboard",
        label: "Back to Dashboard",
        href: "/dashboard",
        icon: "i-tabler:arrow-left",
      },
      {
        id: "dashboard-location-slug",
        label: currentLocation.value ? currentLocation.value.name : "View Log",
        to: {
          name: "dashboard-location-slug",
          params: {
            slug: currentLocation.value?.slug,
          },
        },
        icon: "i-tabler:map",
      },
      {
        id: "dashboard-location-slug",
        label: "Edit Location",
        to: {
          name: "dashboard-location-slug-edit",
          params: {
            slug: currentLocation.value?.slug,
          },
        },
        icon: "i-tabler:map-pin-cog",
      },
      {
        id: "add-location-log",
        label: "Add location Log",
        to: {
          name: "dashboard-location-slug-add",
          params: {
            slug: currentLocation.value?.slug,
          },
        },
        icon: "i-tabler:circle-plus-filled",
      },
    ];
  }
});

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value;
  localStorage.setItem("isSidebarOpen", isSidebarOpen.value.toString());
}
</script>

<template>
  <div class="flex-1 flex">
    <div class="bg-base-100 transition-all duration-300 shrink-0" :class="{ 'w-64': isSidebarOpen, 'w-16': !isSidebarOpen }">
      <div
        class="flex hover:cursor-pointer hover:bg-base-200 p-2"
        :class="{ 'justify-center': !isSidebarOpen, 'justify-end': isSidebarOpen }"
        @click="toggleSidebar"
      >
        <Icon
          v-if="isSidebarOpen"
          name="i-tabler:chevron-left"
          size="32"
        />
        <Icon
          v-else
          name="i-tabler:chevron-right"
          size="32"
        />
      </div>
      <div class="flex flex-col">
        <SidebarButton
          v-for="item in sidebarStore.sidebarTopItems"
          :key="item.id"
          :show-label="isSidebarOpen"
          :label="item.label"
          :icon="item.icon"
          :href="item.href"
          :to="item.to"
        />
        <div v-if="sidebarStore.sidebarItems.length || sidebarStore.loading" class="divider" />
        <div v-if="sidebarStore.loading" class="px-4">
          <div class="skeleton h-4 w-full" />
        </div>
        <div v-if="!sidebarStore.loading && sidebarStore.sidebarItems.length" class="flex flex-col">
          <SidebarButton
            v-for="item in sidebarStore.sidebarItems"
            :key="item.id"
            :show-label="isSidebarOpen"
            :label="item.label"
            :icon="item.icon"
            :icon-color="isPointSelected(item.mapPoint, mapStore.selectedPoint) ? 'text-accent' : undefined"
            :to="item.to"
            @mouseenter="mapStore.selectedPoint = item.mapPoint ?? null"
            @mouseleave="mapStore.selectedPoint = null"
          />
        </div>
        <div class="divider" />
        <SidebarButton
          :show-label="isSidebarOpen"
          label="Sign Out"
          icon="i-tabler:logout-2"
          href="/sign-out"
        />
      </div>
    </div>
    <div class="flex-1 overflow-auto bg-base-200">
      <div class="flex size-full" :class="{ 'flex-col': route.path !== '/dashboard/add' }">
        <NuxtPage />
        <AppMap class="flex-1" />
      </div>
    </div>
  </div>
</template>
