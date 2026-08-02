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

  const routeMemberId = computed(() => {
    const memberId = route.params.memberId;
    return typeof memberId === "string" && memberId.length > 0 ? memberId : null;
  });

  const pageMode = computed(() => (routeMemberId.value ? "edit" : "create"));

  const { toasts } = useToastMessages(successMessage, errorMessage, {
    onAutoHide: clearFeedback,
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
    if (routeMemberId.value === memberId) {
      await loadMember(memberId);
      return;
    }

    await router.push({ name: "member", params: { memberId } });
  }

  async function handleUnloadSelection(): Promise<void> {
    if (routeMemberId.value === null) {
      clearSelection();
      return;
    }

    await router.push({ name: "member" });
  }

  async function handleSubmit(): Promise<void> {
    if (!routeMemberId.value) {
      const created = await createMember(memberDraft.value);

      if (created?.id) {
        await router.replace({ name: "member", params: { memberId: created.id } });
      }

      return;
    }

    await updateMember(routeMemberId.value, memberDraft.value);
  }

  async function handleDelete(): Promise<void> {
    if (!routeMemberId.value) {
      return;
    }

    const deleted = await deleteMember(routeMemberId.value);

    if (deleted) {
      await router.replace({ name: "member" });
    }
  }

  return {
    memberDraft,
    members,
    selectedId: routeMemberId,
    pageMode,
    toasts,
    isDeleting,
    isLoadingDetail,
    isLoadingList,
    isSaving,
    handleDelete,
    handleSelect,
    handleSubmit,
    handleUnloadSelection,
  };
}
