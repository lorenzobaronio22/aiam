<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import MemberForm from "../components/members/MemberForm.vue";
import MemberList from "../components/members/MemberList.vue";
import { useMembers } from "../composables/useMembers";

const memberDraft = ref({
  name: "",
  email: "",
});

const {
  clearFeedback,
  createMember,
  deleteSelectedMember,
  errorMessage,
  isCreateMode,
  isDeleting,
  isLoadingDetail,
  isLoadingList,
  isSaving,
  loadMembers,
  members,
  selectMember,
  selectedId,
  selectedMember,
  startCreate,
  successMessage,
  updateMember,
} = useMembers();

type ToastTone = "success" | "error";

type ToastMessage = {
  id: number;
  message: string;
  tone: ToastTone;
};

const toasts = ref<ToastMessage[]>([]);
let toastTimer: ReturnType<typeof setTimeout> | null = null;

const route = useRoute();
const router = useRouter();

const routeMemberId = computed(() => {
  const memberId = route.params.memberId;
  return typeof memberId === "string" && memberId.length > 0 ? memberId : null;
});

const pageMode = computed(() => (isCreateMode.value ? "create" : "edit"));

function showToast(message: string, tone: ToastTone): void {
  toasts.value = [
    {
      id: Date.now(),
      message,
      tone,
    },
  ];

  if (toastTimer) {
    clearTimeout(toastTimer);
  }

  toastTimer = setTimeout(() => {
    toasts.value = [];
    clearFeedback();
    toastTimer = null;
  }, 3200);
}

watch(successMessage, (message) => {
  if (!message) {
    return;
  }

  showToast(message, "success");
});

watch(errorMessage, (message) => {
  if (!message) {
    return;
  }

  showToast(message, "error");
});

onBeforeUnmount(() => {
  if (!toastTimer) {
    return;
  }

  clearTimeout(toastTimer);
});

watch(
  selectedMember,
  (member) => {
    memberDraft.value = {
      name: member?.name ?? "",
      email: member?.email ?? "",
    };
  },
  { immediate: true },
);

onMounted(() => {
  void loadMembers();
});

watch(
  routeMemberId,
  async (memberId) => {
    if (!memberId) {
      startCreate();
      return;
    }

    if (selectedId.value === memberId && selectedMember.value) {
      return;
    }

    await selectMember(memberId);

    if (selectedId.value === null) {
      await router.replace({ name: "member" });
    }
  },
  { immediate: true },
);

async function handleSelect(memberId: string): Promise<void> {
  if (routeMemberId.value === memberId) {
    await selectMember(memberId);
    return;
  }

  await router.push({ name: "member", params: { memberId } });
}

async function handleUnloadSelection(): Promise<void> {
  if (routeMemberId.value === null) {
    startCreate();
    return;
  }

  await router.push({ name: "member" });
}

async function handleSubmit(): Promise<void> {
  if (pageMode.value === "create") {
    await createMember(memberDraft.value);

    if (selectedId.value) {
      await router.replace({ name: "member", params: { memberId: selectedId.value } });
    }

    return;
  }

  await updateMember(memberDraft.value);
}

async function handleDelete(): Promise<void> {
  await deleteSelectedMember();

  if (selectedId.value === null && routeMemberId.value !== null) {
    await router.replace({ name: "member" });
  }
}
</script>

<template>
  <main class="page-frame members-page">
    <div class="members-page__toasts" aria-live="polite" aria-atomic="true">
      <p
        v-for="toast in toasts"
        :key="toast.id"
        class="members-page__toast"
        :class="`members-page__toast--${toast.tone}`"
      >
        {{ toast.message }}
      </p>
    </div>

    <section class="members-page__hero section-card">
      <div class="members-page__hero-copy">
        <span class="eyebrow">Operativita</span>
        <h1 class="members-page__title">Gestisci i membri.</h1>
        <p class="members-page__lead">
          Seleziona una scheda, aggiorna i dati o crea un nuovo profilo da questa pagina.
        </p>
      </div>
    </section>

    <div class="members-page__grid">
      <div class="members-page__panel">
        <MemberForm
          v-model="memberDraft"
          :is-deleting="isDeleting"
          :is-loading-detail="isLoadingDetail"
          :is-saving="isSaving"
          :mode="pageMode"
          @delete="handleDelete"
          @submit="handleSubmit"
          @unload="handleUnloadSelection"
        />
      </div>

      <MemberList
        class="members-page__archive"
        :is-loading="isLoadingList"
        :members="members"
        :selected-id="selectedId"
        @select="handleSelect"
      />
    </div>
  </main>
</template>

<style scoped>
.members-page {
  display: grid;
  gap: 1.5rem;
  padding: 2rem 0 4rem;
}

.members-page__hero {
  display: grid;
  gap: 1rem;
  padding: clamp(1.5rem, 4vw, 2.5rem);
}

.members-page__toasts {
  position: fixed;
  top: 0.8rem;
  right: 0.8rem;
  z-index: 20;
  display: grid;
  gap: 0.55rem;
  width: min(23rem, calc(100vw - 1.6rem));
}

.members-page__toast {
  margin: 0;
  border-radius: 14px;
  border: 1px solid transparent;
  padding: 0.75rem 0.9rem;
  box-shadow: var(--shadow-soft);
  line-height: 1.45;
  backdrop-filter: blur(10px);
}

.members-page__toast--success {
  border-color: rgba(0, 114, 166, 0.25);
  background: rgba(235, 247, 255, 0.92);
  color: #004864;
}

.members-page__toast--error {
  border-color: rgba(159, 45, 34, 0.25);
  background: rgba(255, 236, 233, 0.93);
  color: #7c261f;
}

.members-page__hero-copy {
  display: grid;
  gap: 0.75rem;
}

.members-page__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1;
}

.members-page__lead {
  margin: 0;
  color: var(--color-muted);
  line-height: 1.65;
}

.members-page__grid {
  display: grid;
  grid-template-columns: minmax(280px, 0.9fr) minmax(0, 1.1fr);
  gap: 1.25rem;
  align-items: start;
}

.members-page__panel {
  display: grid;
  gap: 1.25rem;
  position: sticky;
  top: 0.9rem;
  align-self: start;
}

.members-page__archive {
  max-height: calc(100vh - 1.8rem);
  overflow: auto;
}

@media (max-width: 960px) {
  .members-page {
    gap: 0.9rem;
    padding: 0.9rem 0 2rem;
  }

  .members-page__hero {
    padding: 1rem;
  }

  .members-page__hero-copy {
    gap: 0.4rem;
  }

  .members-page__toasts {
    top: 0.45rem;
    right: 0.45rem;
    width: calc(100vw - 0.9rem);
  }

  .members-page__toast {
    padding: 0.62rem 0.74rem;
    font-size: 0.92rem;
  }

  .members-page__title {
    font-size: 1.55rem;
  }

  .members-page__lead {
    font-size: 0.93rem;
    line-height: 1.45;
  }

  .members-page__grid {
    grid-template-columns: 1fr;
    gap: 0.85rem;
  }

  .members-page__panel {
    top: 0.45rem;
    z-index: 2;
    max-height: calc(100dvh - 1rem);
    overflow: hidden;
  }

  .members-page__panel :deep(.member-form) {
    gap: 0.9rem;
    max-height: calc(100dvh - 1rem);
    overflow: auto;
  }

  .members-page__archive {
    max-height: 46dvh;
  }
}

@media (max-width: 560px) {
  .members-page__hero {
    display: none;
  }

  .members-page__panel {
    top: 0.35rem;
  }

  .members-page__toasts {
    top: 0.3rem;
    right: 0.3rem;
    width: calc(100vw - 0.6rem);
  }

  .members-page__panel :deep(.member-form) {
    max-height: calc(100dvh - 0.8rem);
  }

  .members-page__archive {
    max-height: 42dvh;
  }
}
</style>