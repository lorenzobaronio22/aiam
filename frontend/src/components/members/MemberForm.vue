<script setup lang="ts">
import { computed } from "vue";

const model = defineModel<{
  name: string;
  email: string;
}>({ required: true });

const props = defineProps<{
  mode: "create" | "edit";
  isLoadingDetail: boolean;
  isSaving: boolean;
  isDeleting: boolean;
}>();

const isBusy = computed(() => props.isLoadingDetail || props.isSaving || props.isDeleting);

const emit = defineEmits<{
  delete: [];
  unload: [];
  submit: [];
}>();
</script>

<template>
  <section class="member-form section-card">
    <div class="member-form__header">
      <div>
        <span class="eyebrow">Scheda membro</span>
      </div>
      <button
        v-if="props.mode === 'edit'"
        class="button-secondary member-form__icon-button"
        :disabled="isBusy"
        :aria-label="'Nuovo membro'"
        type="button"
        @click="emit('unload')"
      >
        <svg class="member-form__icon member-form__icon--mobile" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
        <span class="member-form__text-label">Nuovo membro</span>
      </button>
    </div>

    <p v-if="props.isLoadingDetail" class="member-form__status">Caricamento scheda membro...</p>

    <form class="member-form__body" @submit.prevent="emit('submit')">
      <label class="member-form__field">
        <span class="member-form__field-label">Nome e cognome</span>
        <div class="member-form__field-row">
          <span class="member-form__field-icon" aria-hidden="true">
            <svg class="member-form__icon" viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="2" />
              <path d="M5 20c1.8-3.1 4-4.6 7-4.6s5.2 1.5 7 4.6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          </span>
          <input
            v-model="model.name"
            :disabled="isBusy"
            autocomplete="name"
            name="name"
            placeholder="Es. Giulia Rossi"
            required
            type="text"
          />
        </div>
      </label>

      <label class="member-form__field">
        <span class="member-form__field-label">Email</span>
        <div class="member-form__field-row">
          <span class="member-form__field-icon" aria-hidden="true">
            <svg class="member-form__icon" viewBox="0 0 24 24">
              <rect x="3" y="6" width="18" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="2" />
              <path d="M4 7l8 6 8-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <input
            v-model="model.email"
            :disabled="isBusy"
            autocomplete="email"
            name="email"
            placeholder="nome@azienda.it"
            required
            type="email"
          />
        </div>
      </label>

      <div class="member-form__actions">
        <button
          class="button-primary member-form__icon-button"
          :disabled="isBusy"
          :aria-label="props.mode === 'create' ? 'Crea membro' : 'Salva modifiche'"
          type="submit"
        >
          <svg class="member-form__icon member-form__icon--mobile" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 4h10l4 4v12H6z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
            <path d="M9 4v6h6V4" fill="none" stroke="currentColor" stroke-width="2" />
            <path d="M9 16h6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
          <span class="member-form__text-label">
            {{ props.isSaving ? "Salvataggio..." : props.mode === "create" ? "Crea membro" : "Salva modifiche" }}
          </span>
        </button>
        <button
          v-if="props.mode === 'edit'"
          class="button-danger member-form__icon-button"
          :disabled="isBusy"
          :aria-label="'Elimina membro'"
          type="button"
          @click="emit('delete')"
        >
          <svg class="member-form__icon member-form__icon--mobile" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 7h16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            <path d="M9 7V5h6v2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            <path d="M8 7l1 12h6l1-12" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
          </svg>
          <span class="member-form__text-label">
            {{ props.isDeleting ? "Eliminazione..." : "Elimina membro" }}
          </span>
        </button>
      </div>
    </form>
  </section>
</template>

<style scoped>
.member-form {
  display: grid;
  gap: var(--space-4);
  padding: var(--space-4);
}

.member-form__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.member-form__status {
  margin: 0;
  color: var(--color-muted);
}

.member-form__icon {
  width: 1.05rem;
  height: 1.05rem;
}

.member-form__icon--mobile {
  display: none;
}

.member-form__text-label {
  display: inline-flex;
}

.member-form__body {
  display: grid;
  gap: var(--space-3);
}

.member-form__field {
  display: grid;
  gap: 0.55rem;
}

.member-form__field-label {
  font-weight: 600;
}

.member-form__field-row {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 0.55rem;
}

.member-form__field-icon {
  display: inline-flex;
  color: var(--color-muted);
}

.member-form__field input {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-control);
  background: rgba(255, 255, 255, 0.9);
  padding: 0.95rem 1rem;
  color: var(--color-brand-navy);
}

.member-form__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  padding-top: var(--space-1);
}

@media (max-width: 720px) {
  .member-form {
    gap: 0.9rem;
    padding: var(--space-3);
  }

  .member-form__header {
    flex-direction: column;
    align-items: stretch;
    gap: 0.65rem;
  }

  .member-form__field {
    gap: 0.35rem;
  }

  .member-form__field-label {
    display: none;
  }

  .member-form__field-row {
    gap: 0.45rem;
  }

  .member-form__field-icon {
    width: 2.35rem;
    height: 2.35rem;
    justify-content: center;
    align-items: center;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-pill);
    background: rgba(255, 255, 255, 0.75);
  }

  .member-form__field-icon .member-form__icon {
    width: 0.95rem;
    height: 0.95rem;
  }

  .member-form__field input {
    width: 100%;
  }

  .member-form__icon--mobile {
    display: inline-flex;
  }

  .member-form__text-label {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0 0 0 0);
    border: 0;
    white-space: nowrap;
  }

  .member-form__icon-button,
  .member-form__actions .button-danger {
    width: 2.5rem;
    min-width: 2.5rem;
    height: 2.5rem;
    padding: 0;
    border-radius: var(--radius-pill);
  }

  .member-form__icon-button {
    justify-content: center;
    align-items: center;
  }

  .member-form__actions {
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: center;
  }

  .member-form__field-label {
    font-size: 0.9rem;
  }

  .member-form__field input {
    border-radius: var(--radius-control-mobile);
    padding: 0.72rem 0.78rem;
    font-size: 0.95rem;
  }

  .member-form__actions {
    gap: 0.5rem;
    padding-top: 0.15rem;
  }
}
</style>