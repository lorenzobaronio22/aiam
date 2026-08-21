<script setup lang="ts">
import { RouterLink } from "vue-router";

import { useMemberAttributesPageController } from "../composables/useMemberAttributesPageController";

const {
  attributeTypeName,
  attributeTypes,
  cancelEdit,
  clearToasts,
  editDraft,
  editingAttributeId,
  isDeleting,
  isLoadingDetail,
  isSaving,
  memberId,
  newAttributeDraft,
  removeAttribute,
  selectedMember,
  startEdit,
  submitEdit,
  submitNewAttribute,
  toasts,
} = useMemberAttributesPageController();
</script>

<template>
  <main class="page-frame member-attributes-page">
    <div class="member-attributes-page__toasts" aria-live="polite" aria-atomic="true">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="member-attributes-page__toast"
        :class="`member-attributes-page__toast--${toast.tone}`"
      >
        <p class="member-attributes-page__toast-message">{{ toast.message }}</p>
        <button type="button" @click="clearToasts">Chiudi</button>
      </div>
    </div>

    <header class="member-attributes-page__header">
      <RouterLink class="member-attributes-page__back" :to="{ name: 'member', params: { memberId } }">
        &larr; Torna al membro
      </RouterLink>
      <span class="eyebrow">Scheda membro</span>
      <h1 class="member-attributes-page__title">
        Attributi{{ selectedMember ? ` di ${selectedMember.name}` : "" }}
      </h1>
      <p class="member-attributes-page__lead">
        Aggiungi, modifica o rimuovi gli attributi personalizzati di questo membro.
      </p>
    </header>

    <p v-if="isLoadingDetail" class="member-attributes-page__status">Caricamento in corso...</p>

    <template v-else-if="selectedMember">
      <ul class="member-attributes-page__list">
        <li
          v-for="attribute in selectedMember.attributes"
          :key="attribute.id"
          class="member-attribute-card section-card"
        >
          <template v-if="editingAttributeId === attribute.id">
            <form class="member-attribute-card__form" @submit.prevent="submitEdit(attribute.id)">
              <span class="member-attribute-card__type">{{ attributeTypeName(attribute.key) }}</span>

              <label class="member-attribute-card__field">
                <span>Etichetta</span>
                <input v-model="editDraft.label" :disabled="isSaving" required type="text" />
              </label>

              <label class="member-attribute-card__field">
                <span>Valore</span>
                <textarea v-model="editDraft.value" :disabled="isSaving" rows="3"></textarea>
              </label>

              <div class="member-attribute-card__actions">
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
            <span class="member-attribute-card__type">{{ attributeTypeName(attribute.key) }}</span>
            <h2 class="member-attribute-card__label">{{ attribute.label }}</h2>
            <p class="member-attribute-card__value">{{ attribute.value }}</p>

            <div class="member-attribute-card__actions">
              <button class="button-secondary" type="button" @click="startEdit(attribute)">
                Modifica
              </button>
              <button
                class="button-danger"
                :disabled="isDeleting"
                type="button"
                @click="removeAttribute(attribute.id)"
              >
                {{ isDeleting ? "Eliminazione..." : "Elimina" }}
              </button>
            </div>
          </template>
        </li>
      </ul>

      <p v-if="selectedMember.attributes.length === 0" class="member-attributes-page__empty">
        Nessun attributo presente per questo membro.
      </p>

      <form
        class="member-attributes-page__new-form section-card"
        @submit.prevent="submitNewAttribute"
      >
        <h2 class="member-attributes-page__new-title">Aggiungi attributo</h2>

        <label class="member-attribute-card__field">
          <span>Tipo</span>
          <select v-model="newAttributeDraft.key" :disabled="isSaving" required>
            <option value="" disabled>Seleziona un tipo</option>
            <option v-for="attributeType in attributeTypes" :key="attributeType.key" :value="attributeType.key">
              {{ attributeType.name }}
            </option>
          </select>
        </label>

        <label class="member-attribute-card__field">
          <span>Etichetta</span>
          <input
            v-model="newAttributeDraft.label"
            :disabled="isSaving"
            placeholder="Es. Allergie"
            required
            type="text"
          />
        </label>

        <label class="member-attribute-card__field">
          <span>Valore</span>
          <textarea v-model="newAttributeDraft.value" :disabled="isSaving" rows="3"></textarea>
        </label>

        <button class="button-primary" :disabled="isSaving" type="submit">
          {{ isSaving ? "Aggiunta..." : "Aggiungi attributo" }}
        </button>
      </form>
    </template>
  </main>
</template>

<style scoped>
.member-attributes-page {
  display: grid;
  gap: 1.4rem;
  padding: 1.5rem 0 6rem;
  font-family: "Plus Jakarta Sans", "Segoe UI", "Helvetica Neue", Arial, sans-serif;
}

.member-attributes-page__header {
  display: grid;
  gap: 0.5rem;
}

.member-attributes-page__back {
  justify-self: start;
  font-size: 0.85rem;
  font-weight: 600;
}

.member-attributes-page__title {
  margin: 0;
  font-size: clamp(1.6rem, 4vw, 2.2rem);
  letter-spacing: -0.02em;
  color: var(--color-primary-deep);
}

.member-attributes-page__lead {
  margin: 0;
  color: var(--color-muted);
  max-width: 52ch;
}

.member-attributes-page__list {
  display: grid;
  gap: 0.85rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.member-attributes-page__empty {
  color: var(--color-muted);
}

.member-attribute-card,
.member-attributes-page__new-form {
  display: grid;
  gap: 0.6rem;
  padding: 1.1rem 1.3rem;
}

.member-attribute-card__type {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-muted);
}

.member-attribute-card__label {
  margin: 0;
  font-size: 1.05rem;
}

.member-attribute-card__value {
  margin: 0;
  white-space: pre-wrap;
}

.member-attribute-card__field {
  display: grid;
  gap: 0.3rem;
}

.member-attribute-card__field input,
.member-attribute-card__field select,
.member-attribute-card__field textarea {
  border-radius: 12px;
  border: 1px solid var(--color-border);
  padding: 0.55rem 0.75rem;
}

.member-attribute-card__actions {
  display: flex;
  gap: 0.6rem;
  justify-content: flex-end;
}

.member-attributes-page__new-title {
  margin: 0;
  font-size: 1.1rem;
}

.member-attributes-page__toasts {
  position: fixed;
  top: max(1rem, env(safe-area-inset-top));
  left: 50%;
  transform: translateX(-50%);
  z-index: 60;
  display: grid;
  gap: 0.5rem;
  width: min(420px, calc(100% - 2rem));
}

.member-attributes-page__toast {
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

.member-attributes-page__toast--success {
  background: #eef7ee;
  border-color: rgba(34, 130, 71, 0.2);
}

.member-attributes-page__toast--error {
  background: #fff1f1;
  border-color: rgba(161, 31, 31, 0.2);
}

.member-attributes-page__toast-message {
  margin: 0;
  font-size: 0.9rem;
}
</style>
