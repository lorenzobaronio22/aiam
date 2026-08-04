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
          <RouterLink class="button-primary" to="/member">Apri area membri</RouterLink>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.landing-page {
  padding: 1rem 0 2rem;
}

.landing-page__hero {
  padding: 1.5rem;
}

.landing-page__copy {
  display: grid;
  gap: 1rem;
}

.landing-page__title {
  margin: 0;
  font-size: clamp(1.8rem, 4vw, 2.3rem);
  line-height: 1.2;
}

.landing-page__lead {
  margin: 0;
  max-width: 50ch;
  color: var(--color-muted);
  font-size: 1rem;
}

.landing-page__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
</style>