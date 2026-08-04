import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useMembers } from "./useMembers";
import { useToastMessages } from "./useToastMessages";

export function useMembersPageController() {
  const memberDraft = ref({
    name: "",
    email: "",
  });

  const {
    clearFeedback,
    clearSelection,
    createMember,
    deleteMember,
    errorMessage,
    isDeleting,
    isLoadingDetail,
    isLoadingList,
    isSaving,
    loadMember,
    loadMembers,
    members,
    selectedMember,
    successMessage,
    updateMember,
  } = useMembers();

  const route = useRoute();
  const router = useRouter();

  const activeMemberId = computed(() => {
    const memberId = route.params.memberId;
    return route.name === "member" && typeof memberId === "string" && memberId.length > 0
      ? memberId
      : null;
  });

  const isCreateOpen = computed(() => route.name === "member-new");

  const { toasts, clearToasts } = useToastMessages(successMessage, errorMessage, {
    onDismiss: clearFeedback,
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
    activeMemberId,
    async (memberId) => {
      if (!memberId) {
        clearSelection();
        return;
      }

      if (selectedMember.value?.id === memberId) {
        return;
      }

      const loaded = await loadMember(memberId);

      if (!loaded) {
        await router.replace({ name: "member" });
      }
    },
    { immediate: true },
  );

  async function handleSelect(memberId: string): Promise<void> {
    if (activeMemberId.value === memberId) {
      await router.push({ name: "member" });
      return;
    }

    await router.push({ name: "member", params: { memberId } });
  }

  async function handleClose(): Promise<void> {
    if (route.name === "member" && !activeMemberId.value) {
      return;
    }

    await router.push({ name: "member" });
  }

  function handleOpenCreate(): void {
    void router.push({ name: "member-new" });
  }

  async function handleSubmit(): Promise<void> {
    if (isCreateOpen.value) {
      const created = await createMember(memberDraft.value);

      if (created?.id) {
        await router.replace({ name: "member" });
      }

      return;
    }

    if (!activeMemberId.value) {
      return;
    }

    const updated = await updateMember(activeMemberId.value, memberDraft.value);

    if (updated) {
      await router.replace({ name: "member" });
    }
  }

  async function handleDelete(): Promise<void> {
    if (!activeMemberId.value) {
      return;
    }

    const deleted = await deleteMember(activeMemberId.value);

    if (deleted) {
      await router.replace({ name: "member" });
    }
  }

  return {
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
  };
}
