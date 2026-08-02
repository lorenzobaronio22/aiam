<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>

<template>
  <main class="page-frame landing-page">
    <section class="landing-page__hero section-card">
      <div class="landing-page__copy">
        <span class="eyebrow">App IM</span>
        <h1 class="landing-page__title">Gestisci iscrizioni e anagrafiche membri in modo semplice.</h1>
        <p class="landing-page__lead">
          Con APP IM puoi creare, aggiornare e tenere sotto controllo i membri in pochi passaggi,
          con una scheda chiara e un archivio sempre facile da consultare.
        </p>

        <div class="landing-page__actions">
          <RouterLink class="button-primary" to="/members">Apri area membri</RouterLink>
        </div>
      </div>

      <div class="landing-page__orbital" aria-hidden="true">
        <div class="landing-page__orbital-core">
          <span>IM</span>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.landing-page {
  padding: 2rem 0 4rem;
}

.landing-page__hero {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(260px, 0.75fr);
  gap: 2rem;
  padding: clamp(1.5rem, 4vw, 4rem);
}

.landing-page__copy {
  display: grid;
  gap: 1.25rem;
}

.landing-page__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 6vw, 5rem);
  line-height: 0.95;
}

.landing-page__lead {
  margin: 0;
  max-width: 38rem;
  color: var(--color-muted);
  font-size: 1.05rem;
  line-height: 1.65;
}

.landing-page__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.landing-page__orbital {
  display: grid;
  place-items: center;
  min-height: 320px;
}

.landing-page__orbital-core {
  display: grid;
  place-items: center;
  width: min(100%, 20rem);
  aspect-ratio: 1;
  border-radius: 999px;
  background:
    radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.45), transparent 22%),
    linear-gradient(140deg, var(--color-brand-gold), #ffbb2d 72%);
  color: var(--color-brand-navy);
  font-family: var(--font-display);
  text-align: center;
}

.landing-page__orbital-core span {
  font-size: clamp(3rem, 9vw, 6rem);
  font-weight: 800;
}

@media (max-width: 860px) {
  .landing-page__hero {
    grid-template-columns: 1fr;
  }
}
</style>