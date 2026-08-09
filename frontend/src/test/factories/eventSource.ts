import { vi } from "vitest";

type Listener = (event: MessageEvent) => void;

export class FakeEventSource {
  static instances: FakeEventSource[] = [];

  url: string;
  closed = false;
  private listeners = new Map<string, Set<Listener>>();

  constructor(url: string) {
    this.url = url;
    FakeEventSource.instances.push(this);
  }

  addEventListener(type: string, listener: Listener): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }

    this.listeners.get(type)?.add(listener);
  }

  removeEventListener(type: string, listener: Listener): void {
    this.listeners.get(type)?.delete(listener);
  }

  close(): void {
    this.closed = true;
  }

  emit(type: string, data: unknown): void {
    const event = { type, data: JSON.stringify(data) } as MessageEvent;
    this.listeners.get(type)?.forEach((listener) => listener(event));
  }

  static reset(): void {
    FakeEventSource.instances = [];
  }

  static latest(): FakeEventSource {
    const instance = FakeEventSource.instances.at(-1);

    if (!instance) {
      throw new Error("No FakeEventSource instance has been created yet.");
    }

    return instance;
  }
}

export function installFakeEventSource(): typeof FakeEventSource {
  FakeEventSource.reset();
  vi.stubGlobal("EventSource", FakeEventSource);
  return FakeEventSource;
}
