import { beforeEach, describe, expect, it, vi } from "vitest";

import { FakeEventSource, installFakeEventSource } from "../test/factories/eventSource";
import { buildMember } from "../test/factories/members";
import { useMemberEvents } from "./useMemberEvents";

function memberEventPayload(member: ReturnType<typeof buildMember>) {
  return {
    member_id: member.id,
    member: {
      id: member.id,
      name: member.name,
      created_at: member.createdAt,
      updated_at: member.updatedAt,
      },
      };
}

describe("useMemberEvents", () => {
  beforeEach(() => {
    installFakeEventSource();
  });

  it("opens a single connection to /members/events on start", () => {
    const { start } = useMemberEvents({});
    start();
    start();

    expect(FakeEventSource.instances).toHaveLength(1);
    expect(FakeEventSource.instances[0].url).toBe("/members/events");
  });

  it("forwards created events to onCreated", () => {
    const onCreated = vi.fn();
    const member = buildMember();
    useMemberEvents({ onCreated }).start();

    FakeEventSource.latest().emit("created", memberEventPayload(member));

    expect(onCreated).toHaveBeenCalledWith(member);
  });

  it("forwards updated events to onUpdated", () => {
    const onUpdated = vi.fn();
    const member = buildMember({ name: "Giulia Bianchi" });
    useMemberEvents({ onUpdated }).start();

    FakeEventSource.latest().emit("updated", memberEventPayload(member));

    expect(onUpdated).toHaveBeenCalledWith(member);
  });

  it("forwards deleted events to onDeleted with the member id", () => {
    const onDeleted = vi.fn();
    useMemberEvents({ onDeleted }).start();

    FakeEventSource.latest().emit("deleted", { member_id: "member-1", member: null });

    expect(onDeleted).toHaveBeenCalledWith("member-1");
  });

  it("closes the connection on stop", () => {
    const { start, stop } = useMemberEvents({});
    start();
    stop();

    expect(FakeEventSource.latest().closed).toBe(true);
  });
});
