import { computed, readonly, ref, shallowRef } from "vue";

import {
  ApiError,
  createMember as createMemberRequest,
  deleteMember as deleteMemberRequest,
  getMember as getMemberRequest,
  listMembers as listMembersRequest,
  updateMember as updateMemberRequest,
} from "../api/members";
import type { Member, MemberInput } from "../types/members";

function sortMembers(items: Member[]): Member[] {
  return [...items].sort((left, right) => {
    return right.updatedAt.localeCompare(left.updatedAt);
  });
}

function normalizeInput(input: MemberInput): MemberInput {
  return {
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
  };
}

function toMessage(error: unknown, fallback: string): string {
  if (!(error instanceof ApiError)) {
    return fallback;
  }

  if (error.status === 409) {
    return "Esiste gia un membro con questa email. Usa un indirizzo diverso.";
  }

  if (error.status === 404) {
    return "Il membro selezionato non e piu disponibile. La lista e stata aggiornata.";
  }

  if (error.status === 422) {
    return error.detail || "Controlla i dati inseriti e riprova.";
  }

  return error.detail || error.message || fallback;
}

export function useMembers() {
  const members = ref<Member[]>([]);
  const selectedId = shallowRef<string | null>(null);
  const selectedMember = ref<Member | null>(null);
  const isLoadingList = shallowRef(false);
  const isLoadingDetail = shallowRef(false);
  const isSaving = shallowRef(false);
  const isDeleting = shallowRef(false);
  const errorMessage = shallowRef("");
  const successMessage = shallowRef("");

  const hasMembers = computed(() => members.value.length > 0);
  const isCreateMode = computed(() => selectedId.value === null);
  const orderedMembers = computed(() => sortMembers(members.value));

  function clearFeedback(): void {
    errorMessage.value = "";
    successMessage.value = "";
  }

  function upsertMember(member: Member): void {
    const next = [...members.value];
    const matchIndex = next.findIndex((entry) => entry.id === member.id);

    if (matchIndex === -1) {
      next.push(member);
    } else {
      next[matchIndex] = member;
    }

    members.value = sortMembers(next);
  }

  function resetSelection(): void {
    selectedId.value = null;
    selectedMember.value = null;
  }

  async function loadMembers(): Promise<void> {
    isLoadingList.value = true;
    errorMessage.value = "";

    try {
      members.value = sortMembers(await listMembersRequest());

      if (selectedId.value && !members.value.some((member) => member.id === selectedId.value)) {
        resetSelection();
      }
    } catch (error) {
      errorMessage.value = toMessage(error, "Non e stato possibile caricare i membri.");
    } finally {
      isLoadingList.value = false;
    }
  }

  async function selectMember(memberId: string): Promise<void> {
    clearFeedback();
    selectedId.value = memberId;
    selectedMember.value = null;
    isLoadingDetail.value = true;

    try {
      selectedMember.value = await getMemberRequest(memberId);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        members.value = members.value.filter((member) => member.id !== memberId);
        resetSelection();
      }

      errorMessage.value = toMessage(error, "Non e stato possibile aprire la scheda membro.");
    } finally {
      isLoadingDetail.value = false;
    }
  }

  function startCreate(): void {
    clearFeedback();
    resetSelection();
  }

  async function createMember(input: MemberInput): Promise<void> {
    clearFeedback();
    isSaving.value = true;

    try {
      const created = await createMemberRequest(normalizeInput(input));
      upsertMember(created);
      selectedId.value = created.id;
      selectedMember.value = created;
      successMessage.value = "Nuovo membro salvato correttamente.";
    } catch (error) {
      errorMessage.value = toMessage(error, "Non e stato possibile creare il membro.");
    } finally {
      isSaving.value = false;
    }
  }

  async function updateMember(input: MemberInput): Promise<void> {
    if (!selectedId.value) {
      return;
    }

    clearFeedback();
    isSaving.value = true;

    try {
      const updated = await updateMemberRequest(selectedId.value, normalizeInput(input));
      upsertMember(updated);
      selectedMember.value = updated;
      successMessage.value = "Modifiche salvate con successo.";
    } catch (error) {
      errorMessage.value = toMessage(error, "Non e stato possibile aggiornare il membro.");
    } finally {
      isSaving.value = false;
    }
  }

  async function deleteSelectedMember(): Promise<void> {
    if (!selectedId.value) {
      return;
    }

    clearFeedback();
    isDeleting.value = true;

    try {
      await deleteMemberRequest(selectedId.value);
      members.value = members.value.filter((member) => member.id !== selectedId.value);
      resetSelection();
      successMessage.value = "Membro eliminato correttamente.";
    } catch (error) {
      errorMessage.value = toMessage(error, "Non e stato possibile eliminare il membro.");
    } finally {
      isDeleting.value = false;
    }
  }

  return {
    members: readonly(orderedMembers),
    selectedId: readonly(selectedId),
    selectedMember: readonly(selectedMember),
    hasMembers,
    isCreateMode,
    isLoadingList: readonly(isLoadingList),
    isLoadingDetail: readonly(isLoadingDetail),
    isSaving: readonly(isSaving),
    isDeleting: readonly(isDeleting),
    errorMessage: readonly(errorMessage),
    successMessage: readonly(successMessage),
    clearFeedback,
    createMember,
    deleteSelectedMember,
    loadMembers,
    selectMember,
    startCreate,
    updateMember,
  };
}