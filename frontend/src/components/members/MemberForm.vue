<script setup lang="ts">
const model = defineModel<{
  name: string;
  email: string;
}>({ required: true });

defineProps<{
  mode: "create" | "edit";
  isLoadingDetail: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  errorMessage: string;
  successMessage: string;
}>();

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
        <h2 class="member-form__title">
          {{ mode === "create" ? "Nuovo membro" : "Modifica membro" }}
        </h2>
      </div>
      <button
        v-if="mode === 'edit'"
        class="button-secondary"
        :disabled="isLoadingDetail || isSaving || isDeleting"
        type="button"
        @click="emit('unload')"
      >
        Nuovo membro
      </button>
    </div>

    <p v-if="isLoadingDetail" class="member-form__status">Caricamento scheda membro...</p>

    <div v-if="errorMessage" class="member-form__banner member-form__banner--error">
      {{ errorMessage }}
    </div>

    <div v-if="successMessage" class="member-form__banner member-form__banner--success">
      {{ successMessage }}
    </div>

    <form class="member-form__body" @submit.prevent="emit('submit')">
      <label class="member-form__field">
        <span>Nome e cognome</span>
        <input
          v-model="model.name"
          :disabled="isLoadingDetail || isSaving || isDeleting"
          autocomplete="name"
          name="name"
          placeholder="Es. Giulia Rossi"
          required
          type="text"
        />
      </label>

      <label class="member-form__field">
        <span>Email</span>
        <input
          v-model="model.email"
          :disabled="isLoadingDetail || isSaving || isDeleting"
          autocomplete="email"
          name="email"
          placeholder="nome@azienda.it"
          required
          type="email"
        />
      </label>

      <div class="member-form__actions">
        <button class="button-primary" :disabled="isLoadingDetail || isSaving || isDeleting" type="submit">
          {{ isSaving ? "Salvataggio..." : mode === "create" ? "Crea membro" : "Salva modifiche" }}
        </button>
        <button
          v-if="mode === 'edit'"
          class="button-danger"
          :disabled="isSaving || isDeleting"
          type="button"
          @click="emit('delete')"
        >
          {{ isDeleting ? "Eliminazione..." : "Elimina membro" }}
        </button>
      </div>
    </form>
  </section>
</template>

<style scoped>
.member-form {
  display: grid;
  gap: 1.5rem;
  padding: 1.5rem;
}

.member-form__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.member-form__title {
  margin: 0.35rem 0 0;
  font-family: var(--font-display);
  font-size: 2rem;
}

.member-form__status {
  margin: 0;
  color: var(--color-muted);
}

.member-form__banner {
  border-radius: 18px;
  padding: 0.9rem 1rem;
  line-height: 1.5;
}

.member-form__banner--error {
  background: rgba(159, 45, 34, 0.12);
  color: #7c261f;
}

.member-form__banner--success {
  background: rgba(0, 114, 166, 0.12);
  color: #004864;
}

.member-form__body {
  display: grid;
  gap: 1rem;
}

.member-form__field {
  display: grid;
  gap: 0.55rem;
}

.member-form__field span {
  font-weight: 600;
}

.member-form__field input {
  border: 1px solid var(--color-border);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.9);
  padding: 0.95rem 1rem;
  color: var(--color-brand-navy);
}

.member-form__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding-top: 0.5rem;
}

@media (max-width: 720px) {
  .member-form__header {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>