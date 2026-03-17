// ---------------------------------------------------------------------------
// Domain System Types
// Covers: domain listing, auto-detection, domain requests, domain changes
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Domain Listing — GET /failure/domains
// ---------------------------------------------------------------------------

export interface DomainItem {
  id: number;
  name: string;
  display_name?: string | null;
  description?: string | null;
}

export interface DomainWithSubdomains extends DomainItem {
  subdomains: DomainItem[];
}

export interface DomainListResponse {
  total: number;
  top_level_count: number;
  subdomain_count: number;
  domains: DomainWithSubdomains[];
}

// ---------------------------------------------------------------------------
// Conversation Domains — GET /sessions/{id}/domains
// ---------------------------------------------------------------------------

export interface ConversationDomain {
  id: number;
  domain_id: number;
  domain_name: string;
  subdomain_name?: string | null;
  source: string;
  confidence?: number | null;
  is_primary: boolean;
  turn_number?: number | null;
}

export interface ConversationDomainsResponse {
  session_id: number;
  total: number;
  domains: ConversationDomain[];
}

// ---------------------------------------------------------------------------
// Domain Requests — POST /failure/domain-requests
// ---------------------------------------------------------------------------

export interface DomainRequestCreate {
  domain_name: string;
  display_name?: string | null;
  description?: string | null;
  parent_domain_name?: string | null;
  conversation_id?: number | null;
}

export interface DomainRequestResponse {
  id: number;
  domain_name: string;
  display_name?: string | null;
  description?: string | null;
  parent_domain_name?: string | null;
  status: string;
  conversation_id?: number | null;
  created_at?: string | null;
  message: string;
}

// ---------------------------------------------------------------------------
// Domain Change — PATCH /failure/conversations/{id}/domain
// ---------------------------------------------------------------------------

export interface UserDomainChangeRequest {
  new_domain: string;
  new_subdomain?: string | null;
  reason?: string | null;
}

export interface UserDomainChangeResponse {
  conversation_id: number;
  fpf_id: number;
  old_domain?: string | null;
  new_domain: string;
  new_subdomain?: string | null;
  changed: boolean;
  routed_to_pre_review?: boolean;
  new_status?: string | null;
  reviewers_assigned?: number;
  message: string;
}
