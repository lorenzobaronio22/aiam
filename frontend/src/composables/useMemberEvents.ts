import { toMember, toMemberPayload } from "../api/members";
import type { Member } from "../types/members";

export type MemberEventHandlers = {
  onCreated?: (member: Member) => void;
  onUpdated?: (member: Member) => void;
  onDeleted?: (memberId: string) => void;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readMemberId(payload: unknown): string {
  if (!isRecord(payload) || typeof payload.member_id !== "string") {
    throw new Error("Invalid member event payload: missing member_id.");
  }

  return payload.member_id;
}

function readMember(payload: unknown): Member {
  if (!isRecord(payload)) {
    throw new Error("Invalid member event payload: expected object.");
  }

  return toMember(toMemberPayload(payload.member));
}

export function useMemberEvents(handlers: MemberEventHandlers) {
  let source: EventSource | null = null;

  function handleMemberPayload(event: Event, callback?: (member: Member) => void): void {
    if (!callback) {
      return;
    }

    const payload = JSON.parse((event as MessageEvent).data);
    callback(readMember(payload));
  }

  function handleDeleted(event: Event): void {
    if (!handlers.onDeleted) {
      return;
    }

    const payload = JSON.parse((event as MessageEvent).data);
    handlers.onDeleted(readMemberId(payload));
  }

  function start(): void {
    if (source) {
      return;
    }

    source = new EventSource("/members/events");
    source.addEventListener("created", (event) => handleMemberPayload(event, handlers.onCreated));
    source.addEventListener("updated", (event) => handleMemberPayload(event, handlers.onUpdated));
    source.addEventListener("deleted", handleDeleted);
  }

  function stop(): void {
    source?.close();
    source = null;
  }

  return { start, stop };
}
