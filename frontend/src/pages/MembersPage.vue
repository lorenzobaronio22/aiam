<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";

import MemberForm from "../components/members/MemberForm.vue";
import MemberList from "../components/members/MemberList.vue";
import { useMembers } from "../composables/useMembers";

const memberDraft = ref({
  name: "",
  email: "",
});

const {
  createMember,
  deleteSelectedMember,
  errorMessage,
  hasMembers,
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
  successMessage,
  updateMember,
} = useMembers();

const pageMode = computed(() => (isCreateMode.value ? "create" : "edit"));

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

async function handleSubmit(): Promise<void> {
  if (pageMode.value === "create") {
    await createMember(memberDraft.value);
    return;
  }

  await updateMember(memberDraft.value);
}

async function handleDelete(): Promise<void> {
  const confirmed = window.confirm("Vuoi eliminare definitivamente questo membro?");

  if (!confirmed) {
    return;
  }

  await deleteSelectedMember();
}
</script>

<template>
  <main class="page-frame members-page">
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
      <MemberList
        :is-loading="isLoadingList"
        :members="members"
        :selected-id="selectedId"
        @select="selectMember"
      />

      <div class="members-page__panel">
        <MemberForm
          v-model="memberDraft"
          :error-message="errorMessage"
          :is-deleting="isDeleting"
          :is-loading-detail="isLoadingDetail"
          :is-saving="isSaving"
          :mode="pageMode"
          :success-message="successMessage"
          @delete="handleDelete"
          @submit="handleSubmit"
        />

        <section v-if="!hasMembers && !isLoadingList" class="members-page__hint section-card">
          <span class="eyebrow">Primo passo</span>
          <p class="members-page__hint-copy">
            L'archivio e vuoto: crea il primo membro per iniziare a costruire la base dati.
          </p>
        </section>
      </div>
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
}

.members-page__hint {
  display: grid;
  gap: 0.8rem;
  padding: 1.5rem;
}

.members-page__hint-copy {
  margin: 0;
  color: var(--color-muted);
  line-height: 1.6;
}

@media (max-width: 960px) {
  .members-page__grid {
    grid-template-columns: 1fr;
  }
}
</style>