<script setup lang="ts">
import type { Member } from "../../types/members";
import { formatDateTime } from "../../utils/formatters";

defineProps<{
  members: readonly Member[];
  selectedId: string | null;
  isLoading: boolean;
}>();

const emit = defineEmits<{
  select: [memberId: string];
}>();
</script>

<template>
  <section class="member-list section-card">
    <div class="member-list__header">
      <span class="eyebrow">Archivio</span>
    </div>

    <p v-if="isLoading" class="member-list__status">Caricamento elenco in corso...</p>

    <p v-else-if="members.length === 0" class="member-list__status">
      Nessun membro presente. Inizia creando la prima scheda.
    </p>

    <ul v-else class="member-list__items">
      <li v-for="member in members" :key="member.id">
        <button
          class="member-list__item"
          :class="{ 'member-list__item--active': selectedId === member.id }"
          type="button"
          @click="emit('select', member.id)"
        >
          <span class="member-list__item-name">{{ member.name }}</span>
          <span class="member-list__item-email">{{ member.email }}</span>
          <span class="member-list__item-meta">Aggiornato {{ formatDateTime(member.updatedAt) }}</span>
        </button>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.member-list {
  display: grid;
  gap: var(--space-4);
  padding: var(--space-4);
}

.member-list__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.member-list__status {
  margin: 0;
  color: var(--color-muted);
  line-height: 1.6;
}

.member-list__items {
  display: grid;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.member-list__item {
  width: 100%;
  display: grid;
  gap: 0.25rem;
  text-align: left;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card-compact);
  background: rgba(255, 255, 255, 0.86);
  padding: var(--space-3);
  cursor: pointer;
}

.member-list__item--active {
  border-color: rgba(0, 114, 166, 0.36);
  box-shadow: inset 0 0 0 1px rgba(0, 114, 166, 0.18);
}

.member-list__item-name {
  font-weight: 600;
}

.member-list__item-email,
.member-list__item-meta {
  color: var(--color-muted);
}

.member-list__item-meta {
  font-size: 0.88rem;
}

@media (max-width: 720px) {
  .member-list {
    gap: 0.95rem;
    padding: var(--space-3);
  }

  .member-list__header {
    flex-direction: column;
    align-items: stretch;
  }

  .member-list__status {
    font-size: 0.92rem;
    line-height: 1.45;
  }

  .member-list__items {
    gap: 0.55rem;
  }

  .member-list__item {
    border-radius: var(--radius-card-mobile);
    padding: 0.78rem;
  }

  .member-list__item-meta {
    font-size: 0.8rem;
  }
}
</style>