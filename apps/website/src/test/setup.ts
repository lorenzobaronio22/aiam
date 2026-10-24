import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vite-plus/test";

/**
 * jsdom is missing a handful of browser APIs that Radix UI (and therefore the
 * shadcn components built on it) expects during interaction. Stubbing them here
 * keeps the component tests focused on behaviour instead of environment setup.
 */

// `matchMedia` only exists on `window`, and jsdom does not implement it.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }) as unknown as MediaQueryList,
});

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof globalThis.ResizeObserver;

// user-event needs a PointerEvent constructor; Radix needs the capture APIs.
globalThis.PointerEvent =
  class PointerEvent extends MouseEvent {} as unknown as typeof globalThis.PointerEvent;

Element.prototype.scrollIntoView = vi.fn();
Element.prototype.hasPointerCapture = vi.fn(() => false);
Element.prototype.setPointerCapture = vi.fn();
Element.prototype.releasePointerCapture = vi.fn();

// Unmount and reset the DOM between tests so they stay independent.
afterEach(() => {
  cleanup();
});
