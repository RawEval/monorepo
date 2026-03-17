'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@raweval/ui/button';
import { cn } from '@raweval/utils/cn';
import { Plus, X, Search, Loader2 } from 'lucide-react';
import {
  expertsService,
  type WorkbenchDomain,
} from '@/services/experts-service';

interface DomainSelectorProps {
  onComplete: () => void;
  suggestedDomains?: Array<{
    domain: string;
    display_name: string;
    confidence_score: number;
  }>;
}

interface DomainEntry {
  domain: string;
  displayName: string;
  proficiency: number;
}

export function DomainSelector({
  onComplete,
  suggestedDomains,
}: DomainSelectorProps) {
  const queryClient = useQueryClient();
  const [selectedDomains, setSelectedDomains] = useState<DomainEntry[]>([]);
  const [showDomainPicker, setShowDomainPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasPreFilled, setHasPreFilled] = useState(false);

  const {
    data: domainsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['available-domains'],
    queryFn: () => expertsService.getAvailableDomains(),
  });

  // Load already-saved domains from API
  // Response shape: { user_id, domains: [{ id, domain, subdomain, display_name, proficiency_score }] }
  const { data: savedDomainsResponse } = useQuery({
    queryKey: ['my-domains'],
    queryFn: () => expertsService.getMyDomains(),
  });

  // Pre-fill from saved domains first, then from suggestedDomains
  useEffect(() => {
    if (hasPreFilled) return;

    // Handle both array response and { domains: [...] } wrapper
    const savedDomainsList = Array.isArray(savedDomainsResponse)
      ? savedDomainsResponse
      : (savedDomainsResponse as unknown as { domains?: Array<{ domain?: string | null; display_name?: string | null; proficiency_score?: number | null }> })?.domains;

    // Priority 1: Load from previously saved domains
    if (savedDomainsList && savedDomainsList.length > 0) {
      const loaded: DomainEntry[] = savedDomainsList
        .filter((d) => !!d.domain)
        .map((d) => {
          const displayName = ('display_name' in d && d.display_name)
            ? String(d.display_name)
            : (d.domain ?? '').replace(/_/g, ' ').replace(/\./g, ' / ');
          return {
            domain: d.domain!,
            displayName,
            proficiency: d.proficiency_score ?? 50,
          };
        });
      if (loaded.length > 0) {
        setSelectedDomains(loaded);
        setHasPreFilled(true);
        return;
      }
    }

    // Priority 2: Pre-fill from resume auto-detection
    if (suggestedDomains && suggestedDomains.length > 0 && domainsData) {
      const preFilled: DomainEntry[] = suggestedDomains.map((s) => ({
        domain: s.domain,
        displayName: s.display_name,
        proficiency: Math.round(s.confidence_score * 100),
      }));
      setSelectedDomains(preFilled);
      setHasPreFilled(true);
    }
  }, [suggestedDomains, domainsData, savedDomainsResponse, hasPreFilled]);

  const mutation = useMutation({
    mutationFn: async (domains: DomainEntry[]) => {
      const results = [];
      for (const d of domains) {
        const result = await expertsService.setDomain(
          d.domain,
          d.proficiency,
        );
        results.push(result);
      }
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-status'] });
      queryClient.invalidateQueries({ queryKey: ['my-domains'] });
      onComplete();
    },
  });



  // Filter by search query
  const filteredDomains = useMemo(() => {
    if (!domainsData?.domains) return [];
    const query = searchQuery.toLowerCase().trim();

    // Group by parent for hierarchical display
    return domainsData.domains
      .map((parent) => {
        const matchingSubdomains = (parent.subdomains ?? []).filter(
          (sub) =>
            !selectedDomains.some((s) => s.domain === sub.name) &&
            (query === '' ||
              sub.display_name.toLowerCase().includes(query) ||
              sub.name.toLowerCase().includes(query) ||
              parent.display_name.toLowerCase().includes(query)),
        );

        const parentMatchesDirectly =
          !parent.subdomains?.length &&
          !selectedDomains.some((s) => s.domain === parent.name) &&
          (query === '' ||
            parent.display_name.toLowerCase().includes(query) ||
            parent.name.toLowerCase().includes(query));

        return {
          parent,
          subdomains: matchingSubdomains,
          showAsLeaf: parentMatchesDirectly,
        };
      })
      .filter((group) => group.subdomains.length > 0 || group.showAsLeaf);
  }, [domainsData, searchQuery, selectedDomains]);

  const addDomain = (domain: WorkbenchDomain) => {
    if (!selectedDomains.find((d) => d.domain === domain.name)) {
      setSelectedDomains((prev) => [
        ...prev,
        {
          domain: domain.name,
          displayName: domain.display_name,
          proficiency: 50,
        },
      ]);
    }
    setShowDomainPicker(false);
    setSearchQuery('');
  };

  const removeDomain = (domain: string) => {
    setSelectedDomains((prev) => prev.filter((d) => d.domain !== domain));
  };

  const updateProficiency = (domain: string, proficiency: number) => {
    setSelectedDomains((prev) =>
      prev.map((d) => (d.domain === domain ? { ...d, proficiency } : d)),
    );
  };

  const handleSubmit = () => {
    if (selectedDomains.length === 0) return;
    mutation.mutate(selectedDomains);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--color-signal)]" />
        <p className="text-sm text-[var(--color-text-muted)]">
          Loading available domains...
        </p>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12">
        <p className="text-sm text-[var(--color-error)]">
          Failed to load domains
          {error instanceof Error ? `: ${error.message}` : '.'}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => refetch()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Selected domains with sliders */}
      {selectedDomains.length > 0 && (
        <div className="space-y-4">
          {selectedDomains.map((entry) => (
            <div
              key={entry.domain}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-base)] p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--color-text-primary)]">
                  {entry.displayName}
                </span>
                <div className="flex items-center gap-3">
                  <span className="font-[family-name:var(--font-mono)] text-sm text-[var(--color-signal)]">
                    {entry.proficiency}%
                  </span>
                  <button
                    type="button"
                    onClick={() => removeDomain(entry.domain)}
                    className="text-[var(--color-text-faint)] hover:text-[var(--color-error)]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={entry.proficiency}
                onChange={(e) =>
                  updateProficiency(entry.domain, parseInt(e.target.value, 10))
                }
                className="w-full accent-[var(--color-signal)]"
              />
              <div className="mt-1 flex justify-between font-[family-name:var(--font-mono)] text-[10px] text-[var(--color-text-faint)]">
                <span>Beginner</span>
                <span>Intermediate</span>
                <span>Expert</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add domain button and picker */}
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowDomainPicker(!showDomainPicker)}
          className="gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Add Domain
        </Button>

        {showDomainPicker && (
          <div className="absolute top-full left-0 z-10 mt-2 w-80 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-base)] shadow-[var(--shadow-md)]">
            {/* Search input */}
            <div className="border-b border-[var(--color-border)] p-2">
              <div className="flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-1.5">
                <Search className="h-4 w-4 shrink-0 text-[var(--color-text-faint)]" />
                <input
                  type="text"
                  placeholder="Search domains..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent font-[family-name:var(--font-body)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-faint)] outline-none"
                  autoFocus
                />
              </div>
            </div>

            {/* Domain list */}
            <div className="max-h-60 overflow-y-auto">
              {filteredDomains.length === 0 ? (
                <p className="px-4 py-3 text-center text-sm text-[var(--color-text-muted)]">
                  No matching domains found.
                </p>
              ) : (
                filteredDomains.map((group) => (
                  <div key={group.parent.id}>
                    {/* Parent domain as a leaf (no subdomains) */}
                    {group.showAsLeaf && (
                      <button
                        type="button"
                        onClick={() => addDomain(group.parent)}
                        className={cn(
                          'w-full px-4 py-2.5 text-left text-sm text-[var(--color-text-secondary)]',
                          'hover:bg-[var(--color-bg-surface)] transition-colors',
                        )}
                      >
                        {group.parent.display_name}
                      </button>
                    )}

                    {/* Parent as a group header with subdomains */}
                    {group.subdomains.length > 0 && (
                      <>
                        <div className="px-4 pt-3 pb-1 font-[family-name:var(--font-mono)] text-[10px] font-medium tracking-wider text-[var(--color-text-faint)] uppercase">
                          {group.parent.display_name}
                        </div>
                        {group.subdomains.map((sub) => (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => addDomain(sub)}
                            className={cn(
                              'w-full px-4 py-2 pl-6 text-left text-sm text-[var(--color-text-secondary)]',
                              'hover:bg-[var(--color-bg-surface)] transition-colors',
                            )}
                          >
                            {sub.display_name}
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {selectedDomains.length === 0 && (
        <p className="text-center text-sm text-[var(--color-text-muted)]">
          Add at least one domain to continue.
        </p>
      )}

      {/* Submit */}
      <div className="flex justify-end pt-2">
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={selectedDomains.length === 0 || mutation.isPending}
        >
          {mutation.isPending ? 'Saving...' : 'Save Domains'}
        </Button>
      </div>

      {mutation.isError && (
        <p className="text-sm text-[var(--color-error)]">
          Failed to save domains. Please try again.
        </p>
      )}
    </div>
  );
}
