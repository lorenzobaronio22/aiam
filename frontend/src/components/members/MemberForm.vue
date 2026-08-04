<script setup lang="ts">
import { computed, ref, watch } from "vue";

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
  cancel: [];
  submit: [];
}>();

const confirmingDelete = ref(false);
let confirmTimeout: ReturnType<typeof setTimeout> | undefined;

function onDeleteClick(): void {
  if (!confirmingDelete.value) {
    confirmingDelete.value = true;
    clearTimeout(confirmTimeout);
    confirmTimeout = setTimeout(() => {
      confirmingDelete.value = false;
    }, 4000);
    return;
  }

  clearTimeout(confirmTimeout);
  confirmingDelete.value = false;
  emit("delete");
}

watch(
  () => props.mode,
  () => {
    confirmingDelete.value = false;
  },
);
</script>

<template>
  <form class="member-form" @submit.prevent="emit('submit')">
    <p v-if="props.isLoadingDetail" class="member-form__status">Caricamento scheda in corso...</p>

    <div class="member-form__fields">
      <label class="member-form__field">
        <span class="member-form__field-label">Nome e cognome</span>
        <input
          v-model="model.name"
          :disabled="isBusy"
          autocomplete="name"
          name="name"
          placeholder="Es. Giulia Rossi"
          required
          type="text"
        />
      </label>

      <label class="member-form__field">
        <span class="member-form__field-label">Email</span>
        <input
          v-model="model.email"
          :disabled="isBusy"
          autocomplete="email"
          name="email"
          placeholder="nome@azienda.it"
          required
          type="email"
        />
      </label>
    </div>

    <div class="member-form__actions">
      <button class="member-form__cancel" :disabled="isBusy" type="button" @click="emit('cancel')">
        Annulla
      </button>

      <div class="member-form__primary-actions">
        <button
          v-if="props.mode === 'edit'"
          class="member-form__delete"
          :class="{ 'member-form__delete--confirm': confirmingDelete }"
          :disabled="isBusy"
          type="button"
          @click="onDeleteClick"
        >
          {{ props.isDeleting ? "Eliminazione..." : confirmingDelete ? "Conferma eliminazione" : "Elimina" }}
        </button>

        <button class="member-form__submit" :disabled="isBusy" type="submit">
          {{ props.isSaving ? "Salvataggio..." : props.mode === "create" ? "Crea membro" : "Salva modifiche" }}
        </button>
      </div>
    </div>
  </form>
</template>

<style scoped>
.member-form {
  display: grid;
  gap: 1.1rem;
}

.member-form__status {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.9rem;
}

.member-form__fields {
  display: grid;
  gap: 0.85rem;
}

.member-form__field {
  display: grid;
  gap: 0.4rem;
}

.member-form__field-label {
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--color-muted);
}

.member-form__field > input {
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: #ffffff;
  padding: 0.75rem 0.9rem;
  color: inherit;
  font-size: 0.98rem;
  transition:
    border-color 220ms cubic-bezier(0.32, 0.72, 0, 1),
    box-shadow 220ms cubic-bezier(0.32, 0.72, 0, 1);
}

.member-form__field > input:focus-visible {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 114, 166, 0.14);
  outline: none;
}

.member-form__field > input:disabled {
  background: #f4f4f2;
  color: var(--color-muted);
}

.member-form__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  padding-top: 0.15rem;
}

.member-form__primary-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-left: auto;
}

.member-form__cancel {
  border: none;
  background: none;
  color: var(--color-muted);
  padding: 0.65rem 0.4rem;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 500;
  transition: color 180ms ease;
}

.member-form__cancel:hover:not(:disabled) {
  color: var(--color-primary);
}

.member-form__submit,
.member-form__delete {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 1px solid transparent;
  padding: 0.7rem 1.3rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 220ms cubic-bezier(0.32, 0.72, 0, 1),
    background-color 220ms cubic-bezier(0.32, 0.72, 0, 1),
    box-shadow 220ms cubic-bezier(0.32, 0.72, 0, 1);
}

.member-form__submit {
  background: var(--color-primary);
  color: #ffffff;
  box-shadow: 0 8px 20px -10px rgba(0, 114, 166, 0.55);
}

.member-form__submit:hover:not(:disabled) {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
}

.member-form__submit:active:not(:disabled) {
  transform: scale(0.98);
}

.member-form__delete {
  background: #fdf2f2;
  color: var(--color-danger);
  border-color: rgba(161, 31, 31, 0.16);
}

.member-form__delete--confirm {
  background: var(--color-danger);
  color: #ffffff;
  border-color: var(--color-danger);
}

.member-form__delete:active:not(:disabled) {
  transform: scale(0.98);
}

.member-form__submit:disabled,
.member-form__delete:disabled,
.member-form__cancel:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 520px) {
  .member-form__actions {
    flex-direction: column-reverse;
    align-items: stretch;
  }

  .member-form__primary-actions {
    margin-left: 0;
    flex-direction: column-reverse;
  }

  .member-form__cancel {
    text-align: center;
  }
}
</style>
