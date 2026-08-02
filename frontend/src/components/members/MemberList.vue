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
      <div>
        <span class="eyebrow">Archivio</span>
        <h2 class="member-list__title">Membri</h2>
      </div>
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
  gap: 1.5rem;
  padding: 1.5rem;
}

.member-list__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.member-list__title {
  margin: 0.35rem 0 0;
  font-family: var(--font-display);
  font-size: 2rem;
}

.member-list__status {
  margin: 0;
  color: var(--color-muted);
  line-height: 1.6;
}

.member-list__items {
  display: grid;
  gap: 0.75rem;
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
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.86);
  padding: 1rem;
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
  .member-list__header {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>