<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>

<template>
  <main class="page-frame landing-page">
    <section class="landing-page__hero">
      <span class="eyebrow">App IM</span>
      <h1 class="landing-page__title">Gestisci iscrizioni e anagrafiche membri in modo semplice.</h1>
      <p class="landing-page__lead">
        Con APP IM puoi creare, aggiornare e tenere sotto controllo i membri in pochi passaggi,
        con una scheda chiara e un archivio sempre facile da consultare.
      </p>

      <div class="landing-page__actions">
        <RouterLink class="landing-page__cta" to="/member">
          <span class="landing-page__cta-label">Apri area membri</span>
          <span class="landing-page__cta-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M7 17L17 7M9 7h8v8"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.75"
              />
            </svg>
          </span>
        </RouterLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
.landing-page {
  padding: 3rem 0 4rem;
}

.landing-page__hero {
  display: grid;
  gap: 1.25rem;
  max-width: 640px;
}

.landing-page__title {
  margin: 0;
  font-size: clamp(2rem, 5vw, 2.9rem);
  line-height: 1.12;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.landing-page__lead {
  margin: 0;
  max-width: 50ch;
  color: var(--color-muted);
  font-size: 1.05rem;
}

.landing-page__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding-top: 0.5rem;
}

.landing-page__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  border-radius: 999px;
  background: var(--color-primary);
  color: #ffffff;
  text-decoration: none;
  padding: 0.5rem;
  padding-left: 1.4rem;
  font-weight: 600;
  box-shadow: 0 14px 30px -12px rgba(15, 45, 103, 0.55);
  transition:
    transform 260ms cubic-bezier(0.32, 0.72, 0, 1),
    box-shadow 260ms cubic-bezier(0.32, 0.72, 0, 1);
}

.landing-page__cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 36px -12px rgba(15, 45, 103, 0.6);
}

.landing-page__cta:active {
  transform: scale(0.98);
}

.landing-page__cta-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  transition: transform 260ms cubic-bezier(0.32, 0.72, 0, 1);
}

.landing-page__cta-icon svg {
  width: 1.05rem;
  height: 1.05rem;
}

.landing-page__cta:hover .landing-page__cta-icon {
  transform: translate(1px, -1px) scale(1.05);
}
</style>
