<script setup lang="ts">
import { useSidebarStore } from "~/stores/sidebar";

const isSidebarOpen = ref(false);
const route = useRoute();
const sidebarStore = useSidebarStore();
const locationsStore = useLocationsStore();
const mapStore = useMapStore();

onMounted(() => {
  const storedState = localStorage.getItem("isSidebarOpen");
  if (storedState !== null) {
    isSidebarOpen.value = storedState === "true";
  }
  if ((route.path !== "/dashboard")) {
    locationsStore.refresh();
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
          :show-label="isSidebarOpen"
          label="Locations"
          icon="i-tabler:map"
          href="/dashboard"
        />
        <SidebarButton
          :show-label="isSidebarOpen"
          label="Add Location"
          icon="i-tabler:circle-plus-filled"
          href="/dashboard/add"
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
            :icon-color="mapStore.selectedPoint && mapStore.selectedPoint.id === item.location?.id ? 'text-accent' : undefined"
            :href="item.href"
            @mouseenter="mapStore.selectedPoint = item.location ?? null"
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
