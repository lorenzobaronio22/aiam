import { onMounted, reactive, ref } from "vue";

import { useAttributeDefinitions } from "./useAttributeDefinitions";
import { useAttributeTypes } from "./useAttributeTypes";
import { useToastMessages } from "./useToastMessages";
import type { AttributeDefinition } from "../types/attributeDefinitions";

export function useAttributeDefinitionsPageController() {
  const {
    clearFeedback,
    createDefinition,
    definitions,
    deleteDefinition,
    errorMessage,
    isSaving,
    loadDefinitions,
    restoreDefinition,
    successMessage,
    updateLabel,
  } = useAttributeDefinitions();

  const { attributeTypes, loadAttributeTypes } = useAttributeTypes();

  const { toasts, clearToasts } = useToastMessages(successMessage, errorMessage, {
    onDismiss: clearFeedback,
  });

  const newDefinitionDraft = reactive({
    key: "",
    label: "",
  });

  const editingDefinitionId = ref<string | null>(null);
  const editLabelDraft = ref("");

  function attributeTypeName(key: string): string {
    return attributeTypes.value.find((attributeType) => attributeType.key === key)?.name ?? key;
  }

  function startEdit(definition: AttributeDefinition): void {
    editingDefinitionId.value = definition.id;
    editLabelDraft.value = definition.label;
  }

  function cancelEdit(): void {
    editingDefinitionId.value = null;
  }

  async function submitNewDefinition(): Promise<void> {
    const created = await createDefinition({
      key: newDefinitionDraft.key,
      label: newDefinitionDraft.label,
    });

    if (created) {
      newDefinitionDraft.key = attributeTypes.value[0]?.key ?? "";
      newDefinitionDraft.label = "";
    }
  }

  async function submitEdit(definitionId: string): Promise<void> {
    const updated = await updateLabel(definitionId, { label: editLabelDraft.value });

    if (updated) {
      editingDefinitionId.value = null;
    }
  }

  async function toggleDelete(definitionId: string): Promise<void> {
    await deleteDefinition(definitionId);
  }

  async function toggleRestore(definitionId: string): Promise<void> {
    await restoreDefinition(definitionId);
  }

  onMounted(() => {
    void loadDefinitions();
    void loadAttributeTypes();
  });

  return {
    attributeTypeName,
    attributeTypes,
    cancelEdit,
    clearToasts,
    definitions,
    editingDefinitionId,
    editLabelDraft,
    isSaving,
    newDefinitionDraft,
    startEdit,
    submitEdit,
    submitNewDefinition,
    toasts,
    toggleDelete,
    toggleRestore,
  };
}
