'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, AlertTriangle, ChevronDown, Loader2, Search } from 'lucide-react';
import { cn } from '@raweval/utils';
import { useSessionDomains, useDomains } from '../api/get-domains';
import type { MarkMessageFailedRequest, DomainWithSubdomains } from '@raweval/types';

interface MarkWrongModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (request: MarkMessageFailedRequest) => void;
  isSubmitting: boolean;
  sessionId?: number;
  messageContent?: string;
}

export function MarkWrongModal({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  sessionId,
  messageContent,
}: MarkWrongModalProps) {
  const [failureReason, setFailureReason] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [selectedSubdomain, setSelectedSubdomain] = useState<string | null>(null);
  const [domainSearch, setDomainSearch] = useState('');
  const [showDomainPicker, setShowDomainPicker] = useState(false);

  const { data: sessionDomains } = useSessionDomains(sessionId);
  const { data: allDomains } = useDomains();

  // Pre-fill with auto-detected primary domain
  useEffect(() => {
    if (sessionDomains?.domains?.length && !selectedDomain) {
      const primary = sessionDomains.domains.find((d) => d.is_primary);
      if (primary) {
        setSelectedDomain(primary.domain_name);
        setSelectedSubdomain(primary.subdomain_name ?? null);
      }
    }
  }, [sessionDomains, selectedDomain]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setFailureReason('');
      setDescription('');
      setSelectedDomain(null);
      setSelectedSubdomain(null);
      setDomainSearch('');
      setShowDomainPicker(false);
    }
  }, [open]);

  const handleSubmit = useCallback(() => {
    const request: MarkMessageFailedRequest = {};

    if (failureReason.trim()) {
      request.failure_reason = failureReason.trim();
    }
    if (description.trim()) {
      request.description = description.trim();
    }
    if (selectedDomain) {
      request.domain = selectedDomain;
    }
    if (selectedSubdomain) {
      request.subdomain = selectedSubdomain;
    }

    onSubmit(request);
  }, [failureReason, description, selectedDomain, selectedSubdomain, onSubmit]);

  const filteredDomains = allDomains?.domains?.filter((d: DomainWithSubdomains) => {
    if (!domainSearch) return true;
    const q = domainSearch.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      (d.display_name?.toLowerCase().includes(q)) ||
      d.subdomains.some(
        (s) => s.name.toLowerCase().includes(q) || s.display_name?.toLowerCase().includes(q)
      )
    );
  }) ?? [];

  const detectedDomains = sessionDomains?.domains ?? [];

  // Resolve display name for the currently selected domain
  const selectedDomainDisplay = (() => {
    if (!selectedDomain) return null;
    // Try to find display name from the full domain list
    const found = allDomains?.domains?.find((d: DomainWithSubdomains) => d.name === selectedDomain);
    const domainLabel = found?.display_name || selectedDomain;
    if (selectedSubdomain) {
      const subFound = found?.subdomains?.find((s) => s.name === selectedSubdomain);
      return `${domainLabel} / ${subFound?.display_name || selectedSubdomain}`;
    }
    return domainLabel;
  })();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Mark response as wrong"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative mx-4 flex w-full max-w-lg flex-col overflow-hidden rounded-xl border shadow-xl"
        style={{
          background: 'var(--color-bg-base)',
          borderColor: 'var(--color-border)',
          maxHeight: 'calc(100vh - 80px)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: 'var(--color-signal-subtle)' }}
            >
              <AlertTriangle className="h-4 w-4" style={{ color: 'var(--color-signal)' }} />
            </div>
            <div>
              <h2
                className="text-sm font-medium"
                style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-body)' }}
              >
                Mark as wrong
              </h2>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Help improve AI by reporting failures
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 transition-colors hover:bg-black/5"
            aria-label="Close"
          >
            <X className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4" style={{ maxHeight: '60vh' }}>
          {/* Preview snippet */}
          {messageContent && (
            <div
              className="mb-4 rounded-lg px-3 py-2.5 text-xs"
              style={{
                background: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-body)',
                lineHeight: '1.5',
              }}
            >
              <span
                className="mb-1 block text-[10px] font-medium uppercase tracking-wider"
                style={{ color: 'var(--color-text-faint)', fontFamily: 'var(--font-mono)' }}
              >
                Response being reported
              </span>
              {messageContent.length > 200
                ? messageContent.slice(0, 200) + '...'
                : messageContent}
            </div>
          )}

          {/* Domain Selection */}
          <div className="mb-4">
            <label
              className="mb-2 block text-xs font-medium"
              style={{
                color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.06em',
              }}
            >
              Domain
            </label>

            {/* Auto-detected domains */}
            {detectedDomains.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {detectedDomains.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => {
                      setSelectedDomain(d.domain_name);
                      setSelectedSubdomain(d.subdomain_name ?? null);
                      setShowDomainPicker(false);
                    }}
                    className={cn(
                      'rounded-md border px-2.5 py-1 text-xs transition-colors',
                      selectedDomain === d.domain_name
                        ? 'font-medium'
                        : 'hover:border-[var(--color-border-strong)]'
                    )}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--text-xs)',
                      letterSpacing: '0.04em',
                      background:
                        selectedDomain === d.domain_name
                          ? 'var(--color-signal-subtle)'
                          : 'var(--color-bg-surface)',
                      borderColor:
                        selectedDomain === d.domain_name
                          ? 'var(--color-signal-border)'
                          : 'var(--color-border)',
                      color:
                        selectedDomain === d.domain_name
                          ? 'var(--color-signal)'
                          : 'var(--color-text-secondary)',
                    }}
                  >
                    {d.domain_name}
                    {d.subdomain_name && ` / ${d.subdomain_name}`}
                    {d.confidence && (
                      <span style={{ opacity: 0.6, marginLeft: '4px' }}>
                        {Math.round(d.confidence * 100)}%
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Manual domain picker toggle */}
            <button
              onClick={() => setShowDomainPicker(!showDomainPicker)}
              className="flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors"
              style={{
                background: 'var(--color-bg-base)',
                borderColor: 'var(--color-border)',
                color: selectedDomain ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                fontFamily: 'var(--font-body)',
              }}
            >
              <span>
                {selectedDomainDisplay || 'Select or change domain...'}
              </span>
              <ChevronDown
                className="h-4 w-4"
                style={{
                  color: 'var(--color-text-faint)',
                  transform: showDomainPicker ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.15s',
                }}
              />
            </button>

            {/* Domain picker dropdown */}
            {showDomainPicker && (
              <div
                className="mt-1 overflow-hidden rounded-lg border"
                style={{
                  background: 'var(--color-bg-base)',
                  borderColor: 'var(--color-border)',
                  maxHeight: '200px',
                }}
              >
                {/* Search */}
                <div
                  className="flex items-center gap-2 px-3 py-2"
                  style={{ borderBottom: '1px solid var(--color-border)' }}
                >
                  <Search className="h-3.5 w-3.5" style={{ color: 'var(--color-text-faint)' }} />
                  <input
                    type="text"
                    placeholder="Search domains..."
                    value={domainSearch}
                    onChange={(e) => setDomainSearch(e.target.value)}
                    className="flex-1 bg-transparent text-sm outline-none"
                    style={{
                      color: 'var(--color-text-primary)',
                      fontFamily: 'var(--font-body)',
                    }}
                    autoFocus
                  />
                </div>

                {/* Domain list */}
                <div className="max-h-[160px] overflow-y-auto">
                  {filteredDomains.map((domain: DomainWithSubdomains) => (
                    <div key={domain.id}>
                      <button
                        onClick={() => {
                          setSelectedDomain(domain.name);
                          setSelectedSubdomain(null);
                          setShowDomainPicker(false);
                        }}
                        className="flex w-full items-center px-3 py-1.5 text-left text-sm transition-colors hover:bg-[var(--color-bg-surface)]"
                        style={{
                          color:
                            selectedDomain === domain.name && !selectedSubdomain
                              ? 'var(--color-signal)'
                              : 'var(--color-text-primary)',
                          fontWeight:
                            selectedDomain === domain.name && !selectedSubdomain ? 500 : 400,
                          fontFamily: 'var(--font-body)',
                        }}
                      >
                        {domain.display_name || domain.name}
                      </button>
                      {domain.subdomains.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => {
                            setSelectedDomain(domain.name);
                            setSelectedSubdomain(sub.name);
                            setShowDomainPicker(false);
                          }}
                          className="flex w-full items-center px-3 py-1.5 pl-7 text-left text-xs transition-colors hover:bg-[var(--color-bg-surface)]"
                          style={{
                            color:
                              selectedDomain === domain.name && selectedSubdomain === sub.name
                                ? 'var(--color-signal)'
                                : 'var(--color-text-muted)',
                            fontWeight:
                              selectedDomain === domain.name && selectedSubdomain === sub.name
                                ? 500
                                : 400,
                            fontFamily: 'var(--font-body)',
                          }}
                        >
                          {sub.display_name || sub.name}
                        </button>
                      ))}
                    </div>
                  ))}
                  {filteredDomains.length === 0 && (
                    <div
                      className="px-3 py-3 text-center text-xs"
                      style={{ color: 'var(--color-text-faint)' }}
                    >
                      No domains found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Failure Reason */}
          <div className="mb-4">
            <label
              className="mb-2 block text-xs font-medium"
              style={{
                color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.06em',
              }}
            >
              What&apos;s wrong? <span style={{ color: 'var(--color-text-faint)', fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              type="text"
              value={failureReason}
              onChange={(e) => setFailureReason(e.target.value)}
              placeholder="e.g., Factual error, hallucination, outdated info..."
              className="w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--color-signal-border)]"
              style={{
                background: 'var(--color-bg-base)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-body)',
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label
              className="mb-2 block text-xs font-medium"
              style={{
                color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.06em',
              }}
            >
              Details <span style={{ color: 'var(--color-text-faint)', fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the specific error or what should be corrected..."
              rows={3}
              className="w-full resize-none rounded-md border px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--color-signal-border)]"
              style={{
                background: 'var(--color-bg-base)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-body)',
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between gap-3 px-5 py-3"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <p className="text-[11px]" style={{ color: 'var(--color-text-faint)', fontFamily: 'var(--font-mono)' }}>
            Our QC team will review this report
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-md border px-4 py-2 text-xs font-medium transition-colors hover:bg-[var(--color-bg-surface)]"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-secondary)',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.04em',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-medium transition-colors disabled:opacity-60"
              style={{
                background: 'var(--color-signal)',
                color: 'var(--color-text-inverse)',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.04em',
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit report'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
