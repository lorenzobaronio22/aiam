import { onBeforeUnmount, ref, toRef, watch, type MaybeRefOrGetter } from "vue";

export type ToastTone = "success" | "error";

export type ToastMessage = {
  id: number;
  message: string;
  tone: ToastTone;
};

type UseToastMessagesOptions = {
  autoHideMs?: number;
  onAutoHide?: () => void;
};

export function useToastMessages(
  successMessage: MaybeRefOrGetter<string>,
  errorMessage: MaybeRefOrGetter<string>,
  options?: UseToastMessagesOptions,
) {
  const toasts = ref<ToastMessage[]>([]);
  let toastTimer: ReturnType<typeof setTimeout> | null = null;
  const autoHideMs = options?.autoHideMs ?? 3200;

  function clearTimer(): void {
    if (!toastTimer) {
      return;
    }

    clearTimeout(toastTimer);
    toastTimer = null;
  }

  function clearToasts(): void {
    clearTimer();
    toasts.value = [];
  }

  function showToast(message: string, tone: ToastTone): void {
    toasts.value = [
      {
        id: Date.now(),
        message,
        tone,
      },
    ];

    clearTimer();

    toastTimer = setTimeout(() => {
      toasts.value = [];
      options?.onAutoHide?.();
      toastTimer = null;
    }, autoHideMs);
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

  onBeforeUnmount(() => {
    clearTimer();
  });

  return {
    toasts,
    clearToasts,
    showToast,
  };
}
