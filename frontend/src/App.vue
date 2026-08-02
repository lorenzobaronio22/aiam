<script setup lang="ts">
import { ref, watch } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";

const route = useRoute();
const isMobileNavOpen = ref(false);

watch(
  () => route.path,
  () => {
    isMobileNavOpen.value = false;
  },
);

function toggleMobileNav(): void {
  isMobileNavOpen.value = !isMobileNavOpen.value;
}
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

      <button
        class="app-shell__menu-toggle"
        type="button"
        aria-label="Apri menu di navigazione"
        aria-controls="app-shell-nav"
        :aria-expanded="isMobileNavOpen"
        @click="toggleMobileNav"
      >
        <span class="app-shell__menu-line" />
        <span class="app-shell__menu-line" />
        <span class="app-shell__menu-line" />
      </button>

      <nav
        id="app-shell-nav"
        class="app-shell__nav"
        :class="{ 'app-shell__nav--open': isMobileNavOpen }"
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

.app-shell__menu-toggle {
  display: none;
  width: 2.6rem;
  height: 2.6rem;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.86);
  padding: 0;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 0.24rem;
}

.app-shell__menu-line {
  display: inline-flex;
  width: 1.05rem;
  height: 2px;
  border-radius: 999px;
  background: var(--color-brand-navy);
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
    position: relative;
    flex-direction: row;
    align-items: center;
  }

  .app-shell__menu-toggle {
    display: inline-flex;
  }

  .app-shell__nav {
    display: none;
    position: absolute;
    top: calc(100% - 0.25rem);
    right: clamp(1rem, 2vw, 2rem);
    width: min(13rem, calc(100vw - 2rem));
    padding: 0.45rem;
    border: 1px solid var(--color-border);
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.96);
    box-shadow: var(--shadow-soft);
    backdrop-filter: blur(10px);
    z-index: 12;
    gap: 0.35rem;
    align-items: stretch;
    flex-direction: column;
  }

  .app-shell__nav--open {
    display: inline-flex;
  }

  .app-shell__nav-link {
    text-align: left;
    border-radius: 12px;
    padding: 0.6rem 0.7rem;
  }
}
</style>
