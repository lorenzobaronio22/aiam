<script setup lang="ts">
import { onMounted } from "vue";

import { useAttributeTypes } from "../composables/useAttributeTypes";

const { attributeTypes, errorMessage, hasError, isLoading, loadAttributeTypes } =
  useAttributeTypes();

onMounted(() => {
  void loadAttributeTypes();
});
</script>

<template>
  <main class="page-frame attribute-types-page">
    <header class="attribute-types-page__header">
      <span class="eyebrow">Catalogo</span>
      <h1 class="attribute-types-page__title">Tipi di attributo</h1>
      <p class="attribute-types-page__lead">
        Scopri quali tipi di attributo puoi definire su un membro e a cosa serve ciascuno.
      </p>
    </header>

    <p v-if="hasError" class="attribute-types-page__error" role="alert">
      {{ errorMessage }}
    </p>

    <ul
      v-else-if="!isLoading && attributeTypes.length > 0"
      class="attribute-types-page__list"
    >
      <li
        v-for="attributeType in attributeTypes"
        :key="attributeType.key"
        class="attribute-type-card section-card"
      >
        <h2 class="attribute-type-card__name">{{ attributeType.name }}</h2>
        <p class="attribute-type-card__description">{{ attributeType.description }}</p>
      </li>
    </ul>

    <ul v-else-if="isLoading" class="attribute-types-page__skeleton" aria-hidden="true">
      <li v-for="n in 2" :key="n" class="attribute-type-card attribute-type-card--skeleton"></li>
    </ul>

    <p v-else class="attribute-types-page__empty">
      Nessun tipo di attributo disponibile al momento.
    </p>
  </main>
</template>

<style scoped>
.attribute-types-page {
  display: grid;
  gap: 1.4rem;
  padding: 1.5rem 0 6rem;
  font-family: "Plus Jakarta Sans", "Segoe UI", "Helvetica Neue", Arial, sans-serif;
}

.attribute-types-page__header {
  display: grid;
  gap: 0.5rem;
}

.attribute-types-page__title {
  margin: 0;
  font-size: clamp(1.6rem, 4vw, 2.2rem);
  letter-spacing: -0.02em;
  color: var(--color-primary-deep);
}

.attribute-types-page__lead {
  margin: 0;
  color: var(--color-muted);
  max-width: 60ch;
}

.attribute-types-page__error {
  margin: 0;
  border-radius: 16px;
  border: 1px solid var(--color-danger);
  background: rgba(179, 38, 30, 0.06);
  color: var(--color-danger);
  padding: 1rem 1.2rem;
}

.attribute-types-page__empty {
  margin: 2.5rem 0;
  text-align: center;
  color: var(--color-muted);
}

.attribute-types-page__list,
.attribute-types-page__skeleton {
  display: grid;
  gap: 0.85rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.attribute-type-card {
  padding: 1.1rem 1.3rem;
  display: grid;
  gap: 0.35rem;
}

.attribute-type-card__name {
  margin: 0;
  font-size: 1.05rem;
  color: var(--color-primary-deep);
}

.attribute-type-card__description {
  margin: 0;
  color: var(--color-muted);
  line-height: 1.5;
}

.attribute-type-card--skeleton {
  height: 78px;
  border-color: transparent;
  background: linear-gradient(100deg, #f1f1ef 30%, #f8f8f6 50%, #f1f1ef 70%);
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}

@keyframes shimmer {
  from {
    background-position: 120% 0;
  }
  to {
    background-position: -20% 0;
  }
}
</style>
