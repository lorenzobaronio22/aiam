<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: number;
  }>(),
  { size: 40 },
);
</script>

<template>
  <svg
    :height="size"
    :width="size"
    aria-hidden="true"
    class="app-logo"
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="100" height="100" rx="22" fill="#001B4C" />
    <defs>
      <linearGradient id="app-logo-ramp" x1="10" y1="50" x2="92" y2="50" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#0072A6" />
        <stop offset="0.55" stop-color="#2F8FC2" />
        <stop offset="1" stop-color="#FFD488" />
      </linearGradient>
    </defs>
    <rect x="15" y="22" width="14" height="14" rx="4" transform="rotate(-18 22 29)" fill="#FFD488" />
    <rect x="15" y="46" width="12" height="34" rx="4" fill="url(#app-logo-ramp)" />
    <rect x="34" y="36" width="12" height="44" rx="4" fill="url(#app-logo-ramp)" />
    <rect x="53" y="24" width="12" height="56" rx="4" fill="url(#app-logo-ramp)" />
    <path d="M72 80 L72 34 L90 57 Z" fill="url(#app-logo-ramp)" />
  </svg>
</template>

<style scoped>
.app-logo {
  flex: none;
  display: block;
}
</style>
