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
  const selectedMember = ref<Member | null>(null);
  const asyncState = ref({
    loadingList: false,
    loadingDetail: false,
    saving: false,
    deleting: false,
  });
  const errorMessage = shallowRef("");
  const successMessage = shallowRef("");

  const orderedMembers = computed(() => sortMembers(members.value));
  const isLoadingList = computed(() => asyncState.value.loadingList);
  const isLoadingDetail = computed(() => asyncState.value.loadingDetail);
  const isSaving = computed(() => asyncState.value.saving);
  const isDeleting = computed(() => asyncState.value.deleting);

  function setAsyncState(key: keyof typeof asyncState.value, value: boolean): void {
    asyncState.value[key] = value;
  }

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
    selectedMember.value = null;
  }

  async function loadMembers(): Promise<void> {
    setAsyncState("loadingList", true);
    errorMessage.value = "";

    try {
      members.value = sortMembers(await listMembersRequest());
    } catch (error) {
      errorMessage.value = toMessage(error, "Non e stato possibile caricare i membri.");
    } finally {
      setAsyncState("loadingList", false);
    }
  }

  async function loadMember(memberId: string): Promise<boolean> {
    clearFeedback();
    selectedMember.value = null;
    setAsyncState("loadingDetail", true);

    try {
      selectedMember.value = await getMemberRequest(memberId);
      return true;
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        members.value = members.value.filter((member) => member.id !== memberId);
        resetSelection();
      }

      errorMessage.value = toMessage(error, "Non e stato possibile aprire la scheda membro.");
      return false;
    } finally {
      setAsyncState("loadingDetail", false);
    }
  }

  function clearSelection(): void {
    clearFeedback();
    resetSelection();
  }

  async function createMember(input: MemberInput): Promise<Member | null> {
    clearFeedback();
    setAsyncState("saving", true);

    try {
      const created = await createMemberRequest(normalizeInput(input));
      upsertMember(created);
      selectedMember.value = created;
      successMessage.value = "Nuovo membro salvato correttamente.";
      return created;
    } catch (error) {
      errorMessage.value = toMessage(error, "Non e stato possibile creare il membro.");
      return null;
    } finally {
      setAsyncState("saving", false);
    }
  }

  async function updateMember(memberId: string, input: MemberInput): Promise<Member | null> {
    clearFeedback();
    setAsyncState("saving", true);

    try {
      const updated = await updateMemberRequest(memberId, normalizeInput(input));
      upsertMember(updated);
      selectedMember.value = updated;
      successMessage.value = "Modifiche salvate con successo.";
      return updated;
    } catch (error) {
      errorMessage.value = toMessage(error, "Non e stato possibile aggiornare il membro.");
      return null;
    } finally {
      setAsyncState("saving", false);
    }
  }

  async function deleteMember(memberId: string): Promise<boolean> {
    clearFeedback();
    setAsyncState("deleting", true);

    try {
      await deleteMemberRequest(memberId);
      members.value = members.value.filter((member) => member.id !== memberId);
      resetSelection();
      successMessage.value = "Membro eliminato correttamente.";
      return true;
    } catch (error) {
      errorMessage.value = toMessage(error, "Non e stato possibile eliminare il membro.");
      return false;
    } finally {
      setAsyncState("deleting", false);
    }
  }

  return {
    members: readonly(orderedMembers),
    selectedMember: readonly(selectedMember),
    isLoadingList: readonly(isLoadingList),
    isLoadingDetail: readonly(isLoadingDetail),
    isSaving: readonly(isSaving),
    isDeleting: readonly(isDeleting),
    errorMessage: readonly(errorMessage),
    successMessage: readonly(successMessage),
    clearFeedback,
    clearSelection,
    createMember,
    deleteMember,
    loadMember,
    loadMembers,
    updateMember,
  };
}