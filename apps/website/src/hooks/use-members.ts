import { useCallback, useEffect, useState } from "react";
import type { ListMembersResult } from "api-contract/schemas";
import { errorMessage, listMembers } from "@/lib/members.ts";

type Status = "loading" | "error" | "ready";

export interface MembersQuery {
  page: number;
  limit: number;
  search: string;
}

export interface UseMembersResult {
  data: ListMembersResult | null;
  status: Status;
  error: string | null;
  /** Re-fetch the current page — call after a create/update/delete. */
  refresh: () => void;
}

/**
 * Loads one page of members and reloads whenever the query changes or
 * `refresh` is called. A guard drops responses from superseded requests, so
 * fast typing in the search box cannot clobber newer results.
 */
export function useMembers({ page, limit, search }: MembersQuery): UseMembersResult {
  const [data, setData] = useState<ListMembersResult | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => setVersion((current) => current + 1), []);

  useEffect(() => {
    let active = true;
    setStatus("loading");

    listMembers({ page, limit, search: search || undefined })
      .then((result) => {
        if (!active) return;
        setData(result);
        setError(null);
        setStatus("ready");
      })
      .catch((cause: unknown) => {
        if (!active) return;
        setData(null);
        setError(errorMessage(cause));
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [page, limit, search, version]);

  return { data, status, error, refresh };
}
