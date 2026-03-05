'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Globe,
  Plus,
  Loader2,
  X,
  ChevronRight,
  FolderTree,
  Users,
  Layers,
  FileText,
  Search,
} from 'lucide-react';
import {
  adminDomainsService,
  type CreateDomainRequest,
  type DomainResponse,
} from '@/services/admin/domains-service';
import { queryKeys } from '@/lib/react-query/query-keys';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@raweval/ui/card';
import { Button } from '@raweval/ui/button';
import { Badge } from '@raweval/ui/badge';
import { cn } from '@raweval/utils';

export default function DomainsPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'root' | 'child'>('all');
  const [newDomain, setNewDomain] = useState<CreateDomainRequest>({
    name: '',
    display_name: '',
    description: '',
  });

  const { data: domainsData, isLoading } = useQuery({
    queryKey: queryKeys.domains.list(true),
    queryFn: () => adminDomainsService.listDomains(true),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateDomainRequest) =>
      adminDomainsService.createDomain(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.domains.all });
      setShowCreate(false);
      setNewDomain({ name: '', display_name: '', description: '' });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (domainId: number) =>
      adminDomainsService.deactivateDomain(domainId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.domains.all });
    },
  });

  const domains = domainsData?.domains ?? [];
  const totalDomains = domainsData?.total ?? 0;

  const rootDomains = domains.filter((d) => !d.parent_domain_id);
  const childDomains = domains.filter((d) => !!d.parent_domain_id);

  const filteredDomains = domains.filter((d) => {
    const matchesSearch =
      !search ||
      d.display_name.toLowerCase().includes(search.toLowerCase()) ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.parent_domain_name ?? '').toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'root' && !d.parent_domain_id) ||
      (filter === 'child' && !!d.parent_domain_id);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Domain Management
          </h1>
          <p className="text-muted-foreground">
            {totalDomains} domains ({rootDomains.length} root,{' '}
            {childDomains.length} sub-domains)
          </p>
        </div>
        <Button className="gap-2 shadow-sm" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" />
          Create Domain
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-4">
          <div className="text-muted-foreground text-xs font-medium">
            Total Domains
          </div>
          <div className="text-foreground mt-1 text-2xl font-bold">
            {totalDomains}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-muted-foreground text-xs font-medium">
            Root Domains
          </div>
          <div className="text-foreground mt-1 text-2xl font-bold">
            {rootDomains.length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-muted-foreground text-xs font-medium">
            With Tasks
          </div>
          <div className="text-foreground mt-1 text-2xl font-bold">
            {domains.filter((d) => d.task_count > 0).length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-muted-foreground text-xs font-medium">
            With Experts
          </div>
          <div className="text-foreground mt-1 text-2xl font-bold">
            {domains.filter((d) => d.expert_count > 0).length}
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <input
            className="border-input bg-background focus:ring-ring w-full rounded-lg border py-2 pl-10 pr-3 text-sm focus:ring-2 focus:outline-none"
            placeholder="Search domains..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1">
          {(['all', 'root', 'child'] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              className="capitalize"
              onClick={() => setFilter(f)}
            >
              {f === 'child' ? 'Sub-domains' : f}
            </Button>
          ))}
        </div>
      </div>

      {/* Create Domain Modal */}
      {showCreate && (
        <CreateDomainModal
          newDomain={newDomain}
          setNewDomain={setNewDomain}
          createMutation={createMutation}
          rootDomains={rootDomains}
          onClose={() => setShowCreate(false)}
        />
      )}

      {/* Domain grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="bg-muted/50 h-16" />
              <CardContent className="bg-muted/30 mt-4 h-20" />
            </Card>
          ))}
        </div>
      ) : filteredDomains.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDomains.map((domain) => (
            <DomainCard
              key={domain.id}
              domain={domain}
              onDeactivate={(id) => {
                if (confirm(`Deactivate "${domain.display_name}"?`)) {
                  deactivateMutation.mutate(id);
                }
              }}
              isDeactivating={deactivateMutation.isPending}
            />
          ))}
          <button
            className="border-border/50 bg-muted/10 hover:bg-muted/20 hover:border-primary/50 group flex h-full min-h-[220px] flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all"
            onClick={() => setShowCreate(true)}
          >
            <div className="bg-background border-border flex h-12 w-12 items-center justify-center rounded-full border shadow-sm transition-transform group-hover:scale-110">
              <Plus className="text-primary h-6 w-6" />
            </div>
            <h4 className="text-foreground mt-4 text-sm font-bold">
              Add New Domain
            </h4>
            <p className="text-muted-foreground mt-1 px-4 text-xs">
              Create a new expertise domain.
            </p>
          </button>
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
            <Globe className="text-muted-foreground h-10 w-10" />
            <p className="text-sm font-medium">No domains found</p>
            <p className="text-muted-foreground text-xs">
              {search
                ? 'Try adjusting your search.'
                : 'Create the first domain to get started.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function DomainCard({
  domain,
  onDeactivate,
  isDeactivating,
}: {
  domain: DomainResponse;
  onDeactivate: (id: number) => void;
  isDeactivating: boolean;
}) {
  return (
    <Card
      className={cn(
        'flex flex-col shadow-sm transition-shadow hover:shadow-md',
        !domain.is_active && 'opacity-60'
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg',
              domain.is_active
                ? 'bg-primary/10 text-primary'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {domain.parent_domain_id ? (
              <FolderTree className="h-5 w-5" />
            ) : (
              <Globe className="h-5 w-5" />
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <Badge
              variant={domain.is_active ? 'secondary' : 'destructive'}
              className="text-[10px]"
            >
              {domain.is_active ? 'Active' : 'Inactive'}
            </Badge>
            {!domain.parent_domain_id && (
              <Badge variant="outline" className="text-[10px]">
                Root
              </Badge>
            )}
          </div>
        </div>
        <div className="mt-3">
          <CardTitle className="text-base font-bold">
            {domain.display_name}
          </CardTitle>
          {domain.parent_domain_name && (
            <div className="text-muted-foreground mt-0.5 flex items-center gap-1 text-xs">
              <ChevronRight className="h-3 w-3" />
              {domain.parent_domain_name}
            </div>
          )}
          <CardDescription className="mt-1 line-clamp-2 min-h-[32px] text-xs">
            {domain.description || 'No description provided.'}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-3 pb-4">
        <div className="flex flex-wrap gap-2">
          <StatBadge
            icon={<FileText className="h-3 w-3" />}
            label="Tasks"
            value={domain.task_count}
          />
          <StatBadge
            icon={<Users className="h-3 w-3" />}
            label="Experts"
            value={domain.expert_count}
          />
          <StatBadge
            icon={<Layers className="h-3 w-3" />}
            label="Batches"
            value={domain.batch_count}
          />
        </div>

        {domain.children.length > 0 && (
          <div>
            <p className="text-muted-foreground mb-1 text-[10px] font-medium uppercase tracking-wider">
              Sub-domains ({domain.children.length})
            </p>
            <div className="flex flex-wrap gap-1">
              {domain.children.slice(0, 5).map((child) => (
                <Badge
                  key={child.id}
                  variant="outline"
                  className="text-[10px]"
                >
                  {child.display_name}
                </Badge>
              ))}
              {domain.children.length > 5 && (
                <Badge variant="outline" className="text-[10px]">
                  +{domain.children.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
          <span>
            Slug:{' '}
            <span className="text-foreground font-mono">{domain.name}</span>
          </span>
          <span>Max batch: {domain.max_batch_size}</span>
          <span>Min annotators: {domain.default_min_annotators}</span>
          <span>Auto threshold: {domain.auto_batch_threshold}</span>
        </div>
      </CardContent>

      <CardFooter className="border-border/50 bg-muted/10 flex justify-between border-t px-6 py-3">
        <span className="text-muted-foreground text-[11px]">
          {new Date(domain.created_at).toLocaleDateString()}
        </span>
        {domain.is_active && (
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:bg-destructive/10 h-7 text-xs"
            onClick={() => onDeactivate(domain.id)}
            disabled={isDeactivating}
          >
            Deactivate
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

function StatBadge({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="border-border bg-muted/30 flex items-center gap-1.5 rounded-md border px-2 py-1">
      {icon}
      <span className="text-muted-foreground text-[10px]">{label}</span>
      <span className="text-foreground text-xs font-semibold">{value}</span>
    </div>
  );
}

function CreateDomainModal({
  newDomain,
  setNewDomain,
  createMutation,
  rootDomains,
  onClose,
}: {
  newDomain: CreateDomainRequest;
  setNewDomain: (d: CreateDomainRequest) => void;
  createMutation: { mutate: (d: CreateDomainRequest) => void; isPending: boolean; error: Error | null };
  rootDomains: DomainResponse[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="border-border bg-background w-full max-w-md rounded-xl border p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between">
          <h2 className="text-base font-semibold">Create Domain</h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-3">
          <Field label="Name (slug) *">
            <input
              className="border-input bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
              placeholder="e.g., machine-learning"
              value={newDomain.name}
              onChange={(e) =>
                setNewDomain({ ...newDomain, name: e.target.value })
              }
            />
          </Field>
          <Field label="Display Name *">
            <input
              className="border-input bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
              placeholder="e.g., Machine Learning"
              value={newDomain.display_name}
              onChange={(e) =>
                setNewDomain({ ...newDomain, display_name: e.target.value })
              }
            />
          </Field>
          <Field label="Description">
            <input
              className="border-input bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
              placeholder="Optional description..."
              value={newDomain.description}
              onChange={(e) =>
                setNewDomain({ ...newDomain, description: e.target.value })
              }
            />
          </Field>
          <Field label="Parent Domain (optional)">
            <select
              className="border-input bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
              value={newDomain.parent_domain_id ?? ''}
              onChange={(e) =>
                setNewDomain({
                  ...newDomain,
                  parent_domain_id: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                })
              }
            >
              <option value="">None (root domain)</option>
              {rootDomains.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.display_name}
                </option>
              ))}
            </select>
          </Field>
        </div>
        {createMutation.error && (
          <p className="text-destructive mt-2 text-xs">
            {createMutation.error.message}
          </p>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={
              !newDomain.name ||
              !newDomain.display_name ||
              createMutation.isPending
            }
            onClick={() => createMutation.mutate(newDomain)}
          >
            {createMutation.isPending && (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            )}
            Create
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-muted-foreground mb-1 block text-xs font-medium">
        {label}
      </label>
      {children}
    </div>
  );
}
