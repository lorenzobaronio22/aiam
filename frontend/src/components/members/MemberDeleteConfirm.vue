<script setup lang="ts">
defineProps<{
  isDeleting: boolean;
  isDisabled: boolean;
}>();

const emit = defineEmits<{
  confirm: [];
}>();
</script>

<template>
  <div class="member-delete-confirm">
    <button
      class="button-danger member-delete-confirm__button"
      :disabled="isDisabled || isDeleting"
      type="button"
      @click="emit('confirm')"
    >
      {{ isDeleting ? "Eliminazione..." : "Elimina membro" }}
    </button>
  </div>
</template>

<style scoped>
.member-delete-confirm {
  display: grid;
}

.member-delete-confirm__button {
  min-width: 10.5rem;
}
</style>