import { ref, toRef, watch, type MaybeRefOrGetter } from "vue";

export type ToastTone = "success" | "error";

export type ToastMessage = {
  id: number;
  message: string;
  tone: ToastTone;
};

type UseToastMessagesOptions = {
  onDismiss?: () => void;
};

export function useToastMessages(
  successMessage: MaybeRefOrGetter<string>,
  errorMessage: MaybeRefOrGetter<string>,
  options?: UseToastMessagesOptions,
) {
  const toasts = ref<ToastMessage[]>([]);

  function clearToasts(): void {
    if (toasts.value.length === 0) {
      return;
    }

    toasts.value = [];
    options?.onDismiss?.();
  }

  function showToast(message: string, tone: ToastTone): void {
    toasts.value = [
      {
        id: Date.now(),
        message,
        tone,
      },
    ];
  }

  watch(toRef(successMessage), (message) => {
    if (!message) {
      return;
    }

    showToast(message, "success");
  });

  watch(toRef(errorMessage), (message) => {
    if (!message) {
      return;
    }

    showToast(message, "error");
  });

  return {
    toasts,
    clearToasts,
    showToast,
  };
}
