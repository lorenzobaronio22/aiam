<script setup lang="ts">
import { useAttributeDefinitionsPageController } from "../composables/useAttributeDefinitionsPageController";

const {
  attributeTypeName,
  attributeTypes,
  cancelEdit,
  clearToasts,
  definitions,
  editingDefinitionId,
  editLabelDraft,
  isSaving,
  newDefinitionDraft,
  startEdit,
  submitEdit,
  submitNewDefinition,
  toasts,
  toggleDelete,
  toggleRestore,
} = useAttributeDefinitionsPageController();
</script>

<template>
  <main class="page-frame attribute-definitions-page">
    <div class="attribute-definitions-page__toasts" aria-live="polite" aria-atomic="true">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="attribute-definitions-page__toast"
        :class="`attribute-definitions-page__toast--${toast.tone}`"
      >
        <p class="attribute-definitions-page__toast-message">{{ toast.message }}</p>
        <button type="button" @click="clearToasts">Chiudi</button>
      </div>
    </div>

    <header class="attribute-definitions-page__header">
      <span class="eyebrow">Configurazione</span>
      <h1 class="attribute-definitions-page__title">Attributi dei membri</h1>
      <p class="attribute-definitions-page__lead">
        Definisci i campi personalizzati disponibili su ogni membro. Eliminare un attributo lo
        nasconde in modo reversibile, senza perdere i valori gia inseriti.
      </p>
    </header>

    <form class="attribute-definitions-page__new-form section-card" @submit.prevent="submitNewDefinition">
      <h2 class="attribute-definitions-page__new-title">Nuovo attributo</h2>

      <label class="attribute-definition-card__field">
        <span>Tipo</span>
        <select v-model="newDefinitionDraft.key" :disabled="isSaving" required>
          <option value="" disabled>Seleziona un tipo</option>
          <option v-for="attributeType in attributeTypes" :key="attributeType.key" :value="attributeType.key">
            {{ attributeType.name }}
          </option>
        </select>
      </label>

      <label class="attribute-definition-card__field">
        <span>Etichetta</span>
        <input
          v-model="newDefinitionDraft.label"
          :disabled="isSaving"
          placeholder="Es. Allergie"
          required
          type="text"
        />
      </label>

      <button class="button-primary" :disabled="isSaving" type="submit">
        {{ isSaving ? "Creazione..." : "Crea attributo" }}
      </button>
    </form>

    <ul class="attribute-definitions-page__list">
      <li
        v-for="definition in definitions"
        :key="definition.id"
        class="attribute-definition-card section-card"
        :class="{ 'attribute-definition-card--deleted': definition.status === 'deleted' }"
      >
        <template v-if="editingDefinitionId === definition.id">
          <form class="attribute-definition-card__form" @submit.prevent="submitEdit(definition.id)">
            <span class="attribute-definition-card__type">{{ attributeTypeName(definition.key) }}</span>

            <label class="attribute-definition-card__field">
              <span>Etichetta</span>
              <input v-model="editLabelDraft" :disabled="isSaving" required type="text" />
            </label>

            <div class="attribute-definition-card__actions">
              <button class="button-secondary" :disabled="isSaving" type="button" @click="cancelEdit">
                Annulla
              </button>
              <button class="button-primary" :disabled="isSaving" type="submit">
                {{ isSaving ? "Salvataggio..." : "Salva" }}
              </button>
            </div>
          </form>
        </template>

        <template v-else>
          <div class="attribute-definition-card__heading">
            <span class="attribute-definition-card__type">{{ attributeTypeName(definition.key) }}</span>
            <span
              class="attribute-definition-card__status"
              :class="`attribute-definition-card__status--${definition.status}`"
            >
              {{ definition.status === "active" ? "Attivo" : "Eliminato" }}
            </span>
          </div>
          <h2 class="attribute-definition-card__label">{{ definition.label }}</h2>

          <div class="attribute-definition-card__actions">
            <template v-if="definition.status === 'active'">
              <button class="button-secondary" type="button" @click="startEdit(definition)">
                Modifica
              </button>
              <button class="button-danger" :disabled="isSaving" type="button" @click="toggleDelete(definition.id)">
                Elimina
              </button>
            </template>
            <template v-else>
              <button class="button-primary" :disabled="isSaving" type="button" @click="toggleRestore(definition.id)">
                Ripristina
              </button>
            </template>
          </div>
        </template>
      </li>
    </ul>

    <p v-if="definitions.length === 0" class="attribute-definitions-page__empty">
      Nessun attributo definito. Creane uno per iniziare.
    </p>
  </main>
</template>

<style scoped>
.attribute-definitions-page {
  display: grid;
  gap: 1.4rem;
  padding: 1.5rem 0 6rem;
  font-family: "Plus Jakarta Sans", "Segoe UI", "Helvetica Neue", Arial, sans-serif;
}

.attribute-definitions-page__header {
  display: grid;
  gap: 0.5rem;
}

.attribute-definitions-page__title {
  margin: 0;
  font-size: clamp(1.6rem, 4vw, 2.2rem);
  letter-spacing: -0.02em;
  color: var(--color-primary-deep);
}

.attribute-definitions-page__lead {
  margin: 0;
  color: var(--color-muted);
  max-width: 60ch;
}

.attribute-definitions-page__new-form {
  display: grid;
  gap: 0.6rem;
  padding: 1.1rem 1.3rem;
}

.attribute-definitions-page__new-title {
  margin: 0;
  font-size: 1.1rem;
}

.attribute-definitions-page__list {
  display: grid;
  gap: 0.85rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.attribute-definitions-page__empty {
  color: var(--color-muted);
}

.attribute-definition-card {
  display: grid;
  gap: 0.6rem;
  padding: 1.1rem 1.3rem;
}

.attribute-definition-card--deleted {
  opacity: 0.7;
}

.attribute-definition-card__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
}

.attribute-definition-card__type {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-muted);
}

.attribute-definition-card__status {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  border-radius: 999px;
  padding: 0.2rem 0.6rem;
}

.attribute-definition-card__status--active {
  background: #eef7ee;
  color: #228247;
}

.attribute-definition-card__status--deleted {
  background: #fff1f1;
  color: var(--color-danger);
}

.attribute-definition-card__label {
  margin: 0;
  font-size: 1.05rem;
}

.attribute-definition-card__field {
  display: grid;
  gap: 0.3rem;
}

.attribute-definition-card__field input,
.attribute-definition-card__field select {
  border-radius: 12px;
  border: 1px solid var(--color-border);
  padding: 0.55rem 0.75rem;
}

.attribute-definition-card__actions {
  display: flex;
  gap: 0.6rem;
  justify-content: flex-end;
}

.attribute-definitions-page__toasts {
  position: fixed;
  top: max(1rem, env(safe-area-inset-top));
  left: 50%;
  transform: translateX(-50%);
  z-index: 60;
  display: grid;
  gap: 0.5rem;
  width: min(420px, calc(100% - 2rem));
}

.attribute-definitions-page__toast {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  border-radius: 16px;
  padding: 0.7rem 0.9rem;
  box-shadow: 0 16px 34px -16px rgba(15, 23, 42, 0.4);
  background: #ffffff;
  border: 1px solid var(--color-border);
}

.attribute-definitions-page__toast--success {
  background: #eef7ee;
  border-color: rgba(34, 130, 71, 0.2);
}

.attribute-definitions-page__toast--error {
  background: #fff1f1;
  border-color: rgba(161, 31, 31, 0.2);
}

.attribute-definitions-page__toast-message {
  margin: 0;
  font-size: 0.9rem;
}
</style>
