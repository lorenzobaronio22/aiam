import type { Member } from "api-contract";

/**
 * Demo data so a freshly started dev server has something to show. It is only
 * used by `createServices()` in development; tests always pass their own seed.
 */
export const sampleMembers: Member[] = [
  {
    id: "0b6f9c2a-1a2b-4c3d-8e4f-5a6b7c8d9e0f",
    firstName: "Ada",
    lastName: "Lovelace",
    email: "ada.lovelace@example.com",
    dateOfBirth: "1815-12-10",
    phoneNumber: "+44 20 7946 0101",
    address: "12 St. James's Square, London",
    notes: "Wrote the first published algorithm.",
    createdAt: "2026-01-02T09:15:00.000Z",
    updatedAt: "2026-01-02T09:15:00.000Z",
  },
  {
    id: "1c7a0d3b-2b3c-4d4e-9f50-6b7c8d9e0f1a",
    firstName: "Grace",
    lastName: "Hopper",
    email: "grace.hopper@example.com",
    dateOfBirth: "1906-12-09",
    phoneNumber: "+1 202 555 0142",
    address: "1 Navy Yard, Arlington, VA",
    notes: "Coined the term 'debugging'.",
    createdAt: "2026-01-03T14:30:00.000Z",
    updatedAt: "2026-01-03T14:30:00.000Z",
  },
  {
    id: "2d8b1e4c-3c4d-4e5f-a061-7c8d9e0f1a2b",
    firstName: "Alan",
    lastName: "Turing",
    email: "alan.turing@example.com",
    dateOfBirth: "1912-06-23",
    phoneNumber: "+44 20 7946 0143",
    address: "Bletchley Park, Milton Keynes",
    createdAt: "2026-01-04T11:45:00.000Z",
    updatedAt: "2026-01-04T11:45:00.000Z",
  },
  {
    id: "3e9c2f5d-4d5e-4f60-b172-8d9e0f1a2b3c",
    firstName: "Katherine",
    lastName: "Johnson",
    email: "katherine.johnson@example.com",
    dateOfBirth: "1918-08-26",
    phoneNumber: "+1 757 555 0164",
    address: "Langley Research Center, Hampton, VA",
    notes: "Calculated trajectories for Project Mercury.",
    createdAt: "2026-01-05T08:00:00.000Z",
    updatedAt: "2026-01-05T08:00:00.000Z",
  },
  {
    id: "4f0d3a6e-5e6f-4071-c283-9e0f1a2b3c4d",
    firstName: "Margaret",
    lastName: "Hamilton",
    email: "margaret.hamilton@example.com",
    dateOfBirth: "1936-08-17",
    phoneNumber: "+1 617 555 0185",
    createdAt: "2026-01-06T16:20:00.000Z",
    updatedAt: "2026-01-06T16:20:00.000Z",
  },
];
