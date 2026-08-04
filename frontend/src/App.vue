<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from "vue-router";

const route = useRoute();
</script>

<template>
  <div class="app-shell">
    <header class="app-shell__header">
      <RouterLink class="app-shell__brand" to="/">
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
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.app-shell__brand {
  display: inline-flex;
  align-items: center;
  color: inherit;
  text-decoration: none;
  font-size: 1.05rem;
}

.app-shell__nav {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.app-shell__nav-link {
  border-radius: 6px;
  padding: 0.45rem 0.65rem;
  color: inherit;
  text-decoration: none;
}

.app-shell__nav-link--active {
  background: #eef2fa;
}

@media (max-width: 720px) {
  .app-shell__header {
    align-items: flex-start;
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
