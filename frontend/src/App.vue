<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from "vue-router";

const route = useRoute();
</script>

<template>
  <div class="app-shell">
    <header class="app-shell__header">
      <RouterLink class="app-shell__brand" to="/">
        <span class="app-shell__brand-mark">IM</span>
        <span class="app-shell__brand-copy">
          <strong>APP IM</strong>
        </span>
      </RouterLink>

      <nav class="app-shell__nav" aria-label="Navigazione principale">
        <RouterLink
          class="app-shell__nav-link"
          :class="{ 'app-shell__nav-link--active': route.path === '/' }"
          to="/"
        >
          Home
        </RouterLink>
        <RouterLink
          class="app-shell__nav-link"
          :class="{ 'app-shell__nav-link--active': route.path.startsWith('/member') }"
          to="/member"
        >
          Membri
        </RouterLink>
      </nav>
    </header>

    <RouterView />
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
}

.app-shell__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.5rem clamp(1rem, 2vw, 2rem);
}

.app-shell__brand {
  display: inline-flex;
  align-items: center;
  gap: 0.85rem;
  color: inherit;
  text-decoration: none;
}

.app-shell__brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 999px;
  background: var(--color-brand-gold);
  color: var(--color-brand-navy);
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 800;
}

.app-shell__brand-copy {
  display: grid;
}

.app-shell__brand-copy strong {
  font-size: 0.95rem;
}

.app-shell__nav {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
}

.app-shell__nav-link {
  border-radius: 999px;
  padding: 0.7rem 1rem;
  color: inherit;
  text-decoration: none;
}

.app-shell__nav-link--active {
  background: rgba(0, 27, 76, 0.08);
}

@media (max-width: 720px) {
  .app-shell__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .app-shell__nav {
    width: 100%;
  }

  .app-shell__nav-link {
    flex: 1;
    text-align: center;
  }
}
</style>
