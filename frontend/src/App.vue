<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from "vue-router";

import AppLogo from "./components/AppLogo.vue";

const route = useRoute();
</script>

<template>
  <div class="app-shell">
    <header class="app-shell__header">
      <RouterLink class="app-shell__brand" to="/">
        <AppLogo :size="32" />
        <strong>APP IM</strong>
      </RouterLink>

      <nav
        id="app-shell-nav"
        class="app-shell__nav"
        aria-label="Navigazione principale"
      >
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
  flex-wrap: wrap;
  padding: 1.1rem max(1.5rem, calc((100% - 980px) / 2 + 1rem));
  box-shadow: 0 1px 0 var(--color-border);
}

.app-shell__brand {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  color: var(--color-primary-deep);
  text-decoration: none;
  font-size: 1.05rem;
  letter-spacing: -0.01em;
}

.app-shell__nav {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  border-radius: 999px;
  background: rgba(0, 114, 166, 0.07);
  padding: 0.3rem;
}

.app-shell__nav-link {
  border-radius: 999px;
  padding: 0.5rem 0.95rem;
  color: var(--color-muted);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.92rem;
  transition:
    background-color 220ms cubic-bezier(0.32, 0.72, 0, 1),
    color 220ms cubic-bezier(0.32, 0.72, 0, 1);
}

.app-shell__nav-link:hover {
  color: var(--color-primary);
}

.app-shell__nav-link--active {
  background: #ffffff;
  color: var(--color-primary);
  box-shadow: 0 6px 16px -8px rgba(0, 114, 166, 0.4);
}

@media (max-width: 720px) {
  .app-shell__header {
    align-items: flex-start;
    padding: 1rem;
  }

  .app-shell__nav {
    width: 100%;
    flex-wrap: wrap;
  }

  .app-shell__nav-link {
    padding: 0.45rem 0.65rem;
  }
}
</style>

