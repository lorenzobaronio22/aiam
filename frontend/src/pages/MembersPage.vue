<script setup lang="ts">
import MemberForm from "../components/members/MemberForm.vue";
import MemberList from "../components/members/MemberList.vue";
import { useMembersPageController } from "../composables/useMembersPageController";

const {
  activeMemberId,
  clearToasts,
  handleClose,
  handleDelete,
  handleOpenCreate,
  handleSelect,
  handleSubmit,
  isCreateOpen,
  isDeleting,
  isLoadingDetail,
  isLoadingList,
  isSaving,
  memberDraft,
  members,
  toasts,
} = useMembersPageController();
</script>

<template>
  <main class="page-frame members-page">
    <Teleport to="body">
      <div class="members-page__toasts" aria-live="polite" aria-atomic="true">
        <TransitionGroup name="members-page__toast-fx">
          <div
            v-for="toast in toasts"
            :key="toast.id"
            class="members-page__toast"
            :class="`members-page__toast--${toast.tone}`"
          >
            <p class="members-page__toast-message">{{ toast.message }}</p>
            <button class="members-page__toast-close" type="button" @click="clearToasts">Chiudi</button>
          </div>
        </TransitionGroup>
      </div>
    </Teleport>

    <header class="members-page__header">
      <span class="eyebrow">Archivio</span>
      <h1 class="members-page__title">Membri</h1>
      <p class="members-page__lead">
        Scorri l'elenco, apri una scheda per aggiornarla o eliminarla, oppure crea un nuovo profilo in
        qualsiasi momento.
      </p>
    </header>

    <MemberList
      v-model:draft="memberDraft"
      :active-member-id="activeMemberId"
      :is-deleting="isDeleting"
      :is-loading="isLoadingList"
      :is-loading-detail="isLoadingDetail"
      :is-saving="isSaving"
      :members="members"
      @cancel="handleClose"
      @delete="handleDelete"
      @select="handleSelect"
      @submit="handleSubmit"
    />

    <button class="members-page__fab" type="button" @click="handleOpenCreate">
      <span class="members-page__fab-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-linecap="round" stroke-width="1.75" />
        </svg>
      </span>
      <span class="members-page__fab-label">Nuovo membro</span>
    </button>

    <Teleport to="body">
      <Transition name="members-page__backdrop-fx">
        <div v-if="isCreateOpen" class="members-page__backdrop" @click="handleClose"></div>
      </Transition>

      <Transition name="members-page__sheet-fx">
        <div
          v-if="isCreateOpen"
          class="members-page__sheet"
          aria-labelledby="member-create-title"
          aria-modal="true"
          role="dialog"
        >
          <div class="members-page__sheet-handle" aria-hidden="true"></div>

          <div class="members-page__sheet-header">
            <span class="eyebrow">Nuova scheda</span>
            <h2 id="member-create-title" class="members-page__sheet-title">Crea membro</h2>
          </div>

          <MemberForm
            v-model="memberDraft"
            :is-deleting="isDeleting"
            :is-loading-detail="false"
            :is-saving="isSaving"
            mode="create"
            @cancel="handleClose"
            @submit="handleSubmit"
          />
        </div>
      </Transition>
    </Teleport>
  </main>
</template>

<style scoped>
.members-page {
  display: grid;
  gap: 1.4rem;
  padding: 1.5rem 0 6rem;
  font-family: "Plus Jakarta Sans", "Segoe UI", "Helvetica Neue", Arial, sans-serif;
}

.members-page__header {
  display: grid;
  gap: 0.5rem;
}

.members-page__title {
  margin: 0;
  font-size: clamp(1.7rem, 4vw, 2.3rem);
  line-height: 1.15;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.members-page__lead {
  margin: 0;
  color: var(--color-muted);
  max-width: 52ch;
}

.members-page__fab {
  position: fixed;
  right: max(1.1rem, env(safe-area-inset-right));
  bottom: max(1.1rem, env(safe-area-inset-bottom));
  z-index: 30;
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  border: none;
  border-radius: 999px;
  padding: 0.6rem;
  background: var(--color-primary);
  color: #ffffff;
  cursor: pointer;
  box-shadow: 0 18px 32px -12px rgba(15, 45, 103, 0.55);
  transition:
    transform 260ms cubic-bezier(0.32, 0.72, 0, 1),
    box-shadow 260ms cubic-bezier(0.32, 0.72, 0, 1),
    padding 260ms cubic-bezier(0.32, 0.72, 0, 1);
}

.members-page__fab:hover {
  transform: translateY(-2px);
  box-shadow: 0 22px 38px -12px rgba(15, 45, 103, 0.6);
}

.members-page__fab:active {
  transform: scale(0.96);
}

.members-page__fab-icon {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
}

.members-page__fab-icon svg {
  width: 1.2rem;
  height: 1.2rem;
}

.members-page__fab-label {
  padding-right: 0.5rem;
  font-weight: 600;
  font-size: 0.92rem;
}

.members-page__toasts {
  position: fixed;
  top: max(1rem, env(safe-area-inset-top));
  left: 50%;
  transform: translateX(-50%);
  z-index: 60;
  display: grid;
  gap: 0.5rem;
  width: min(420px, calc(100% - 2rem));
  font-family: "Plus Jakarta Sans", "Segoe UI", "Helvetica Neue", Arial, sans-serif;
}

.members-page__toast {
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

.members-page__toast--success {
  background: #eef7ee;
  border-color: rgba(34, 130, 71, 0.2);
}

.members-page__toast--error {
  background: #fff1f1;
  border-color: rgba(161, 31, 31, 0.2);
}

.members-page__toast-message {
  margin: 0;
  font-size: 0.9rem;
}

.members-page__toast-close {
  flex: none;
  border: none;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.06);
  padding: 0.35rem 0.65rem;
  cursor: pointer;
  font-size: 0.82rem;
}

.members-page__toast-fx-enter-active,
.members-page__toast-fx-leave-active {
  transition:
    transform 320ms cubic-bezier(0.32, 0.72, 0, 1),
    opacity 320ms cubic-bezier(0.32, 0.72, 0, 1);
}

.members-page__toast-fx-enter-from,
.members-page__toast-fx-leave-to {
  transform: translateY(-12px);
  opacity: 0;
}

.members-page__backdrop {
  position: fixed;
  inset: 0;
  z-index: 40;
  background: rgba(10, 14, 22, 0.42);
  backdrop-filter: blur(6px);
}

.members-page__backdrop-fx-enter-active,
.members-page__backdrop-fx-leave-active {
  transition: opacity 320ms cubic-bezier(0.32, 0.72, 0, 1);
}

.members-page__backdrop-fx-enter-from,
.members-page__backdrop-fx-leave-to {
  opacity: 0;
}

.members-page__sheet {
  position: fixed;
  inset: auto 0 0 0;
  z-index: 50;
  display: grid;
  gap: 1.1rem;
  background: #ffffff;
  border-radius: 28px 28px 0 0;
  padding: 0.75rem 1.4rem 1.6rem;
  max-height: 88vh;
  overflow-y: auto;
  box-shadow: 0 -24px 60px -24px rgba(15, 23, 42, 0.45);
  font-family: "Plus Jakarta Sans", "Segoe UI", "Helvetica Neue", Arial, sans-serif;
}

.members-page__sheet-handle {
  width: 2.75rem;
  height: 4px;
  border-radius: 999px;
  background: var(--color-border);
  margin: 0 auto;
}

.members-page__sheet-header {
  display: grid;
  gap: 0.3rem;
}

.members-page__sheet-title {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
}

.members-page__sheet-fx-enter-active,
.members-page__sheet-fx-leave-active {
  transition: transform 380ms cubic-bezier(0.32, 0.72, 0, 1);
}

.members-page__sheet-fx-enter-from,
.members-page__sheet-fx-leave-to {
  transform: translateY(100%);
}

@media (min-width: 640px) {
  .members-page__sheet {
    inset: 50% auto auto 50%;
    transform: translate(-50%, -50%);
    width: min(480px, calc(100% - 3rem));
    max-height: 85vh;
    border-radius: 28px;
    padding: 0.5rem 1.6rem 1.8rem;
  }

  .members-page__sheet-handle {
    display: none;
  }

  .members-page__sheet-fx-enter-active,
  .members-page__sheet-fx-leave-active {
    transition:
      transform 320ms cubic-bezier(0.32, 0.72, 0, 1),
      opacity 320ms cubic-bezier(0.32, 0.72, 0, 1);
  }

  .members-page__sheet-fx-enter-from,
  .members-page__sheet-fx-leave-to {
    transform: translate(-50%, -46%) scale(0.96);
    opacity: 0;
  }
}

@media (max-width: 480px) {
  .members-page__fab-label {
    display: none;
  }

  .members-page__fab {
    padding: 0.65rem;
  }

  .members-page__fab-icon {
    width: 2.75rem;
    height: 2.75rem;
  }
}
</style>
