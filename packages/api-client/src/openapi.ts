/**
 * OpenAPI/Swagger Integration Utilities
 * 
 * Utilities for working with OpenAPI specs and generating types
 */

export interface OpenApiSpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  servers?: Array<{
    url: string;
    description?: string;
  }>;
  paths: Record<string, Record<string, OpenApiOperation>>;
  components?: {
    schemas?: Record<string, unknown>;
    securitySchemes?: Record<string, unknown>;
  };
}

export interface OpenApiOperation {
  operationId?: string;
  summary?: string;
  description?: string;
  tags?: string[];
  parameters?: OpenApiParameter[];
  requestBody?: {
    content?: Record<string, { schema?: unknown }>;
  };
  responses?: Record<string, OpenApiResponse>;
  security?: Array<Record<string, string[]>>;
}

export interface OpenApiParameter {
  name: string;
  in: 'query' | 'header' | 'path' | 'cookie';
  required?: boolean;
  schema?: {
    type?: string;
    format?: string;
    enum?: unknown[];
    default?: unknown;
  };
  description?: string;
}

export interface OpenApiResponse {
  description: string;
  content?: Record<string, { schema?: unknown }>;
}

/**
 * Fetch OpenAPI spec from URL
 */
export async function fetchOpenApiSpec(url: string): Promise<OpenApiSpec> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch OpenAPI spec: ${response.statusText}`);
  }
  return (await response.json()) as OpenApiSpec;
}

/**
 * Get API endpoint from OpenAPI spec
 */
export function getEndpointFromSpec(
  spec: OpenApiSpec,
  operationId: string,
): { path: string; method: string } | null {
  for (const [path, methods] of Object.entries(spec.paths)) {
    for (const [method, operation] of Object.entries(methods)) {
      if (operation.operationId === operationId) {
        return { path, method: method.toUpperCase() };
      }
    }
  }
  return null;
}

/**
 * Generate TypeScript types from OpenAPI spec (placeholder)
 * 
 * In production, use tools like:
 * - openapi-typescript: https://github.com/drwpow/openapi-typescript
 * - swagger-typescript-api: https://github.com/acacode/swagger-typescript-api
 */
export function generateTypesFromSpec(_spec: OpenApiSpec): string {
  // TODO: Implement type generation
  // This would use a library like openapi-typescript or swagger-typescript-api
  return '// Types will be generated from OpenAPI spec';
}
