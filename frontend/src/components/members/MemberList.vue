<script setup lang="ts">
import { nextTick, watch } from "vue";

import type { Member } from "../../types/members";
import { formatDateTime, getInitials } from "../../utils/formatters";
import MemberForm from "./MemberForm.vue";

const props = defineProps<{
  members: readonly Member[];
  activeMemberId: string | null;
  isLoading: boolean;
  isLoadingDetail: boolean;
  isSaving: boolean;
  isDeleting: boolean;
}>();

const draft = defineModel<{ name: string; email: string }>("draft", { required: true });

const emit = defineEmits<{
  select: [memberId: string];
  submit: [];
  delete: [];
  cancel: [];
}>();

const itemRefs = new Map<string, Element>();

function setItemRef(memberId: string, el: Element | null): void {
  if (el) {
    itemRefs.set(memberId, el);
  } else {
    itemRefs.delete(memberId);
  }
}

watch(
  () => props.activeMemberId,
  async (memberId) => {
    if (!memberId) {
      return;
    }

    await nextTick();
    const el = itemRefs.get(memberId);

    if (el && typeof el.scrollIntoView === "function") {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  },
);
</script>

<template>
  <section class="member-list">
    <ul v-if="!isLoading && members.length > 0" class="member-list__items">
      <li
        v-for="member in members"
        :key="member.id"
        :ref="(el) => setItemRef(member.id, el as Element | null)"
        class="member-card"
        :class="{ 'member-card--active': activeMemberId === member.id }"
      >
        <button
          class="member-card__summary"
          type="button"
          :aria-expanded="activeMemberId === member.id"
          @click="emit('select', member.id)"
        >
          <span class="member-card__avatar" aria-hidden="true">{{ getInitials(member.name) }}</span>

          <span class="member-card__info">
            <span class="member-card__name">{{ member.name }}</span>
            <span class="member-card__email">{{ member.email }}</span>
          </span>

          <span class="member-card__meta">
            <span class="member-card__updated">Agg. {{ formatDateTime(member.updatedAt) }}</span>
            <svg class="member-card__chevron" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M6 9l6 6 6-6"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
              />
            </svg>
          </span>
        </button>

        <div
          class="member-card__expand"
          :class="{ 'member-card__expand--open': activeMemberId === member.id }"
        >
          <div class="member-card__expand-inner">
            <MemberForm
              v-if="activeMemberId === member.id"
              v-model="draft"
              :is-deleting="isDeleting"
              :is-loading-detail="isLoadingDetail"
              :is-saving="isSaving"
              mode="edit"
              @cancel="emit('cancel')"
              @delete="emit('delete')"
              @submit="emit('submit')"
            />
          </div>
        </div>
      </li>
    </ul>

    <ul v-else-if="isLoading" class="member-list__skeleton" aria-hidden="true">
      <li v-for="n in 4" :key="n" class="member-card member-card--skeleton"></li>
    </ul>

    <p v-else class="member-list__empty">
      Nessun membro presente. Crea la prima scheda con il pulsante in basso.
    </p>
  </section>
</template>

<style scoped>
.member-list {
  display: grid;
  gap: 0.85rem;
}

.member-list__empty {
  margin: 2.5rem 0;
  text-align: center;
  color: var(--color-muted);
}

.member-list__items,
.member-list__skeleton {
  display: grid;
  gap: 0.85rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.member-card {
  border-radius: 22px;
  background: #ffffff;
  border: 1px solid var(--color-border);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  transition:
    box-shadow 260ms cubic-bezier(0.32, 0.72, 0, 1),
    border-color 260ms cubic-bezier(0.32, 0.72, 0, 1),
    transform 260ms cubic-bezier(0.32, 0.72, 0, 1);
}

.member-card:hover {
  box-shadow: 0 16px 34px -22px rgba(15, 23, 42, 0.35);
  transform: translateY(-1px);
}

.member-card--active {
  border-color: var(--color-primary);
  box-shadow: 0 18px 38px -20px rgba(0, 114, 166, 0.4);
}

.member-card--skeleton {
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

.member-card__summary {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.9rem 1.1rem;
  color: inherit;
}

.member-card__avatar {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 999px;
  background: linear-gradient(155deg, var(--color-primary-deep), var(--color-primary));
  color: #ffffff;
  font-weight: 700;
  font-size: 0.85rem;
  letter-spacing: 0.02em;
}

.member-card__info {
  min-width: 0;
  flex: 1 1 auto;
  display: grid;
  gap: 0.15rem;
}

.member-card__name {
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.member-card__email {
  color: var(--color-muted);
  font-size: 0.88rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.member-card__meta {
  flex: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.member-card__updated {
  display: none;
  color: var(--color-muted);
  font-size: 0.78rem;
}

.member-card__chevron {
  width: 1.05rem;
  height: 1.05rem;
  color: var(--color-muted);
  transition: transform 320ms cubic-bezier(0.32, 0.72, 0, 1);
}

.member-card--active .member-card__chevron {
  transform: rotate(180deg);
  color: var(--color-primary);
}

.member-card__expand {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 380ms cubic-bezier(0.32, 0.72, 0, 1);
}

.member-card__expand--open {
  grid-template-rows: 1fr;
}

.member-card__expand-inner {
  overflow: hidden;
  min-height: 0;
  padding: 0 1.1rem 1.1rem;
}

@media (min-width: 640px) {
  .member-card__updated {
    display: inline;
  }
}
</style>
