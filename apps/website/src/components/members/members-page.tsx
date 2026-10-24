import { PlusIcon, RefreshCwIcon, SearchIcon, UsersIcon } from "lucide-react";
import { useEffect, useState } from "react";
import type { Member } from "api-contract/schemas";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMembers } from "@/hooks/use-members.ts";
import { useIsMobile } from "@/hooks/use-mobile.ts";
import { formatDate } from "@/lib/format.ts";
import { DeleteMemberDialog } from "./delete-member-dialog.tsx";
import { MemberActionsMenu } from "./member-actions-menu.tsx";
import { MemberFormDialog } from "./member-form-dialog.tsx";

const PAGE_SIZE = 10;

export function MembersPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [deleting, setDeleting] = useState<Member | null>(null);

  // Debounce the search box so typing does not fire a request per keystroke.
  useEffect(() => {
    const handle = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(handle);
  }, [searchInput]);

  const { data, status, error, refresh } = useMembers({ page, limit: PAGE_SIZE, search });

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const members = data?.items ?? [];
  const showSkeleton = status === "loading" && data === null;
  // Phones get a stacked card list: the table needs horizontal scrolling there,
  // which hides the row actions behind a swipe.
  const isMobile = useIsMobile();

  // Deleting the last row of a page can leave us past the end; snap back.
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(member: Member) {
    setEditing(member);
    setFormOpen(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Members</h1>
        <p className="text-sm text-muted-foreground">
          Manage the people in your directory — create, edit, and remove members.
        </p>
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Directory</CardTitle>
          <CardDescription>
            {total} {total === 1 ? "member" : "members"}
          </CardDescription>
          <CardAction>
            <Button onClick={openCreate}>
              <PlusIcon />
              Add member
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <div className="relative max-w-sm">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="Search by name or email"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              aria-label="Search members"
            />
          </div>

          {status === "error" ? (
            <Empty className="border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <RefreshCwIcon />
                </EmptyMedia>
                <EmptyTitle>Could not load members</EmptyTitle>
                <EmptyDescription>{error}</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="outline" onClick={refresh}>
                  Try again
                </Button>
              </EmptyContent>
            </Empty>
          ) : showSkeleton ? (
            <div className="flex flex-col gap-2" aria-busy="true" aria-label="Loading members">
              {Array.from({ length: 5 }, (_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          ) : members.length === 0 ? (
            <Empty className="border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <UsersIcon />
                </EmptyMedia>
                <EmptyTitle>{search ? "No matching members" : "No members yet"}</EmptyTitle>
                <EmptyDescription>
                  {search
                    ? "Try a different name or email."
                    : "Add your first member to get started."}
                </EmptyDescription>
              </EmptyHeader>
              {!search && (
                <EmptyContent>
                  <Button onClick={openCreate}>
                    <PlusIcon />
                    Add member
                  </Button>
                </EmptyContent>
              )}
            </Empty>
          ) : (
            <>
              {isMobile ? (
                <ItemGroup className="gap-3">
                  {members.map((member) => (
                    <Item
                      key={member.id}
                      role="listitem"
                      variant="outline"
                      className="items-start gap-4"
                    >
                      <ItemContent className="min-w-0">
                        <ItemTitle className="w-full text-base">
                          {member.firstName} {member.lastName}
                        </ItemTitle>
                        <ItemDescription className="break-all">{member.email}</ItemDescription>
                        <dl className="mt-0.5 grid grid-cols-2 gap-x-4 gap-y-1">
                          <div className="min-w-0">
                            <dt className="text-xs text-muted-foreground">Date of birth</dt>
                            <dd>{formatDate(member.dateOfBirth)}</dd>
                          </div>
                          <div className="min-w-0">
                            <dt className="text-xs text-muted-foreground">Phone</dt>
                            <dd className="truncate">{member.phoneNumber ?? "—"}</dd>
                          </div>
                        </dl>
                      </ItemContent>
                      <ItemActions>
                        <MemberActionsMenu
                          member={member}
                          onEdit={openEdit}
                          onDelete={setDeleting}
                          className="size-8"
                        />
                      </ItemActions>
                    </Item>
                  ))}
                </ItemGroup>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Date of birth</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">
                          {member.firstName} {member.lastName}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{member.email}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(member.dateOfBirth)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {member.phoneNumber ?? "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <MemberActionsMenu
                            member={member}
                            onEdit={openEdit}
                            onDelete={setDeleting}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </>
          )}
        </CardContent>

        <CardFooter className="justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1 || status === "loading"}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page >= totalPages || status === "loading"}
            >
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>

      <MemberFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        member={editing}
        onSaved={refresh}
      />
      <DeleteMemberDialog
        member={deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        onDeleted={refresh}
      />
    </div>
  );
}
