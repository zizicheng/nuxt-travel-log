<script setup lang="ts">
import type { RouteLocationRaw } from "vue-router";

const props = defineProps<{
  label: string;
  icon: string;
  href?: string;
  to?: RouteLocationRaw;
  showLabel: boolean;
  iconColor?: "text-accent" | "text-primary" | "text-secondary";
}>();

const route = useRoute();
</script>

<template>
  <div
    class="tooltip-right"
    :class="{ tooltip: !props.showLabel }"
    :data-tip="props.showLabel ? undefined : props.label"
  >
    <NuxtLink
      :to="props.href || props.to"
      :class="{ 'bg-base-200': route.path === props.href }"
      class="btn btn-ghost w-full rounded-none justify-start overflow-hidden"
    >
      <Icon
        :name="props.icon"
        size="24"
        class="flex-none"
        :class="props.iconColor"
      />
      <span v-if="showLabel" class="truncate">{{ props.label }}</span>
    </NuxtLink>
  </div>
</template>
