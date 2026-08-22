import { computed, ref } from "vue";

import {
  createAttributeDefinition as createAttributeDefinitionRequest,
  deleteAttributeDefinition as deleteAttributeDefinitionRequest,
  listAttributeDefinitions,
  restoreAttributeDefinition as restoreAttributeDefinitionRequest,
  updateAttributeDefinitionLabel as updateAttributeDefinitionLabelRequest,
} from "../api/attributeDefinitions";
import { ApiError } from "../api/members";
import type {
  AttributeDefinition,
  AttributeDefinitionInput,
  AttributeDefinitionUpdateInput,
} from "../types/attributeDefinitions";

function toMessage(error: unknown, fallback: string): string {
  if (!(error instanceof ApiError)) {
    return fallback;
  }

  return error.detail || error.message || fallback;
}

export function useAttributeDefinitions() {
  const definitions = ref<AttributeDefinition[]>([]);
  const isLoading = ref(false);
  const isSaving = ref(false);
  const errorMessage = ref("");
  const successMessage = ref("");

  const activeDefinitions = computed(() =>
    definitions.value.filter((definition) => definition.status === "active"),
  );

  function clearFeedback(): void {
    errorMessage.value = "";
    successMessage.value = "";
  }

  function upsertDefinition(definition: AttributeDefinition): void {
    const next = [...definitions.value];
    const matchIndex = next.findIndex((entry) => entry.id === definition.id);

    if (matchIndex === -1) {
      next.push(definition);
    } else {
      next[matchIndex] = definition;
    }

    definitions.value = next;
  }

  async function loadDefinitions(): Promise<void> {
    isLoading.value = true;
    errorMessage.value = "";

    try {
      definitions.value = await listAttributeDefinitions();
    } catch (error) {
      definitions.value = [];
      errorMessage.value = toMessage(error, "Non e stato possibile caricare gli attributi.");
    } finally {
      isLoading.value = false;
    }
  }

  async function createDefinition(
    input: AttributeDefinitionInput,
  ): Promise<AttributeDefinition | null> {
    clearFeedback();
    isSaving.value = true;

    try {
      const created = await createAttributeDefinitionRequest(input);
      upsertDefinition(created);
      successMessage.value = "Attributo creato correttamente.";
      return created;
    } catch (error) {
      errorMessage.value = toMessage(error, "Non e stato possibile creare l'attributo.");
      return null;
    } finally {
      isSaving.value = false;
    }
  }

  async function updateLabel(
    definitionId: string,
    input: AttributeDefinitionUpdateInput,
  ): Promise<AttributeDefinition | null> {
    clearFeedback();
    isSaving.value = true;

    try {
      const updated = await updateAttributeDefinitionLabelRequest(definitionId, input);
      upsertDefinition(updated);
      successMessage.value = "Etichetta aggiornata correttamente.";
      return updated;
    } catch (error) {
      errorMessage.value = toMessage(error, "Non e stato possibile aggiornare l'etichetta.");
      return null;
    } finally {
      isSaving.value = false;
    }
  }

  async function deleteDefinition(definitionId: string): Promise<boolean> {
    clearFeedback();
    isSaving.value = true;

    try {
      const deleted = await deleteAttributeDefinitionRequest(definitionId);
      upsertDefinition(deleted);
      successMessage.value = "Attributo eliminato correttamente.";
      return true;
    } catch (error) {
      errorMessage.value = toMessage(error, "Non e stato possibile eliminare l'attributo.");
      return false;
    } finally {
      isSaving.value = false;
    }
  }

  async function restoreDefinition(definitionId: string): Promise<boolean> {
    clearFeedback();
    isSaving.value = true;

    try {
      const restored = await restoreAttributeDefinitionRequest(definitionId);
      upsertDefinition(restored);
      successMessage.value = "Attributo ripristinato correttamente.";
      return true;
    } catch (error) {
      errorMessage.value = toMessage(error, "Non e stato possibile ripristinare l'attributo.");
      return false;
    } finally {
      isSaving.value = false;
    }
  }

  return {
    activeDefinitions,
    clearFeedback,
    createDefinition,
    definitions,
    deleteDefinition,
    errorMessage,
    isLoading,
    isSaving,
    loadDefinitions,
    restoreDefinition,
    successMessage,
    updateLabel,
  };
}
