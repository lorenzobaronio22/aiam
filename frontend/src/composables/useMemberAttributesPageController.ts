import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useAttributeTypes } from "./useAttributeTypes";
import { useMemberEvents } from "./useMemberEvents";
import { useMembers } from "./useMembers";
import { useToastMessages } from "./useToastMessages";
import type { MemberAttribute } from "../types/members";

export function useMemberAttributesPageController() {
  const route = useRoute();
  const router = useRouter();

  const memberId = computed(() => {
    const value = route.params.memberId;
    return typeof value === "string" ? value : "";
  });

  const {
    addMemberAttribute,
    clearFeedback,
    deleteMemberAttribute,
    errorMessage,
    isDeleting,
    isLoadingDetail,
    isSaving,
    loadMember,
    removeMember,
    selectedMember,
    successMessage,
    updateMemberAttribute,
    upsertMember,
  } = useMembers();

  const { attributeTypes, loadAttributeTypes } = useAttributeTypes();

  const memberEvents = useMemberEvents({
    onUpdated: (member) => {
      upsertMember(member);
      if (member.id === memberId.value) {
        void loadMember(memberId.value);
      }
    },
    onDeleted: (deletedMemberId) => {
      removeMember(deletedMemberId);
      if (deletedMemberId === memberId.value) {
        void router.replace({ name: "member" });
      }
    },
  });

  const { toasts, clearToasts } = useToastMessages(successMessage, errorMessage, {
    onDismiss: clearFeedback,
  });

  const newAttributeDraft = reactive({
    key: "",
    label: "",
    value: "",
  });

  const editingAttributeId = ref<string | null>(null);
  const editDraft = reactive({
    label: "",
    value: "",
  });

  function attributeTypeName(key: string): string {
    return attributeTypes.value.find((attributeType) => attributeType.key === key)?.name ?? key;
  }

  function startEdit(attribute: MemberAttribute): void {
    editingAttributeId.value = attribute.id;
    editDraft.label = attribute.label;
    editDraft.value = attribute.value;
  }

  function cancelEdit(): void {
    editingAttributeId.value = null;
  }

  async function submitNewAttribute(): Promise<void> {
    if (!memberId.value) {
      return;
    }

    const created = await addMemberAttribute(memberId.value, {
      key: newAttributeDraft.key,
      label: newAttributeDraft.label,
      value: newAttributeDraft.value,
    });

    if (created) {
      newAttributeDraft.key = attributeTypes.value[0]?.key ?? "";
      newAttributeDraft.label = "";
      newAttributeDraft.value = "";
    }
  }

  async function submitEdit(attributeId: string): Promise<void> {
    if (!memberId.value) {
      return;
    }

    const updated = await updateMemberAttribute(memberId.value, attributeId, {
      label: editDraft.label,
      value: editDraft.value,
    });

    if (updated) {
      editingAttributeId.value = null;
    }
  }

  async function removeAttribute(attributeId: string): Promise<void> {
    if (!memberId.value) {
      return;
    }

    await deleteMemberAttribute(memberId.value, attributeId);
  }

  watch(
    memberId,
    async (id) => {
      if (!id) {
        return;
      }

      const loaded = await loadMember(id);

      if (!loaded) {
        await router.replace({ name: "member" });
      }
    },
    { immediate: true },
  );

  onMounted(() => {
    void loadAttributeTypes();
    memberEvents.start();
  });

  onUnmounted(() => {
    memberEvents.stop();
  });

  return {
    attributeTypeName,
    attributeTypes,
    cancelEdit,
    clearToasts,
    editDraft,
    editingAttributeId,
    isDeleting,
    isLoadingDetail,
    isSaving,
    memberId,
    newAttributeDraft,
    removeAttribute,
    selectedMember,
    startEdit,
    submitEdit,
    submitNewAttribute,
    toasts,
  };
}
