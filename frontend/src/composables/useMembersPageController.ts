import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useAttributeDefinitions } from "./useAttributeDefinitions";
import { useMemberEvents } from "./useMemberEvents";
import { useMembers } from "./useMembers";
import { useToastMessages } from "./useToastMessages";
import type { MemberInput } from "../types/members";

function draftToInput(draft: {
  name: string;
  taxId: string;
  attributes: Record<string, string>;
}): MemberInput {
  const taxId = draft.taxId.trim();

  return {
    name: draft.name,
    identifiers: taxId ? [{ type: "tax_id", country: "IT", value: taxId }] : [],
    attributes: { ...draft.attributes },
   };
}

export function useMembersPageController() {
  const memberDraft = ref({
    name: "",
    taxId: "",
    attributes: {} as Record<string, string>,
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
    removeMember,
    selectedMember,
    successMessage,
    updateMember,
    upsertMember,
  } = useMembers();

  const { activeDefinitions, loadDefinitions } = useAttributeDefinitions();

  const memberEvents = useMemberEvents({
    onCreated: upsertMember,
    onUpdated: upsertMember,
    onDeleted: removeMember,
  });

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
      const attributes: Record<string, string> = {};

      for (const definition of activeDefinitions.value) {
        attributes[definition.id] =
          member?.attributes.find((attribute) => attribute.definitionId === definition.id)?.value ?? "";
      }

     memberDraft.value = {
       name: member?.name ?? "",
       taxId: member?.identifiers.find((identifier) => identifier.type === "tax_id")?.value ?? "",
       attributes,
      };
    },
    { immediate: true },
  );

  onMounted(() => {
    void loadMembers();
    void loadDefinitions();
    memberEvents.start();
  });

  onUnmounted(() => {
    memberEvents.stop();
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
      const created = await createMember(draftToInput(memberDraft.value));

      if (created?.id) {
        await router.replace({ name: "member" });
      }

      return;
    }

    if (!activeMemberId.value) {
      return;
    }

    const updated = await updateMember(activeMemberId.value, draftToInput(memberDraft.value));

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
    activeDefinitions,
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
