import { computed, ref } from "vue";

import { listAttributeTypes } from "../api/attributeTypes";
import type { AttributeType } from "../types/attributeTypes";

export function useAttributeTypes() {
  const attributeTypes = ref<AttributeType[]>([]);
  const isLoading = ref(false);
  const errorMessage = ref("");

  const hasError = computed(() => errorMessage.value.length > 0);

  async function loadAttributeTypes(): Promise<void> {
    isLoading.value = true;
    errorMessage.value = "";

    try {
      attributeTypes.value = await listAttributeTypes();
    } catch {
      attributeTypes.value = [];
      errorMessage.value = "Non e stato possibile caricare i tipi di attributo. Riprova piu tardi.";
    } finally {
      isLoading.value = false;
    }
  }

  return {
    attributeTypes,
    errorMessage,
    hasError,
    isLoading,
    loadAttributeTypes,
  };
}
