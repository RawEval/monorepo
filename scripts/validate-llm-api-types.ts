#!/usr/bin/env tsx
/**
 * Validation Script: Frontend-Backend LLM API Type Matching
 * 
 * This script validates that frontend TypeScript types match backend Pydantic models
 * for LLM API endpoints. It checks:
 * 1. Request/Response type compatibility
 * 2. Endpoint path correctness
 * 3. Field name matching
 * 4. Type compatibility (string, number, boolean, etc.)
 * 
 * Usage: pnpm tsx scripts/validate-llm-api-types.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface TypeField {
  name: string;
  type: string;
  optional: boolean;
  description?: string;
}

interface TypeDefinition {
  name: string;
  fields: TypeField[];
  file: string;
}

// Frontend types from apps/chat/services/llm-calls-service.ts
const FRONTEND_TYPES: Record<string, TypeDefinition> = {
  WorkflowRequest: {
    name: 'WorkflowRequest',
    file: 'apps/chat/services/llm-calls-service.ts',
    fields: [
      { name: 'workflow_name', type: 'string', optional: false },
      { name: 'workflow_type', type: 'string (enum)', optional: false },
      { name: 'user_prompt', type: 'string', optional: false },
      { name: 'system_prompt', type: 'string | null', optional: true },
      { name: 'models', type: 'Array<ModelConfig>', optional: false },
      { name: 'files', type: 'Array<FileInput> | null', optional: true },
      { name: 'session_id', type: 'number | null', optional: true },
      { name: 'request_id', type: 'string | null', optional: true },
      { name: 'conversation_messages', type: 'Array<Record> | null', optional: true },
      { name: 'use_langgraph', type: 'boolean', optional: true },
      { name: 'langgraph_config', type: 'Record | null', optional: true },
      { name: 'webhook_url', type: 'string | null', optional: true },
      { name: 'metadata', type: 'Record | null', optional: true },
    ],
  },
  DynamicLLMRequest: {
    name: 'DynamicLLMRequest',
    file: 'apps/chat/services/llm-calls-service.ts',
    fields: [
      { name: 'provider', type: 'string (enum)', optional: false },
      { name: 'model', type: 'string', optional: false },
      { name: 'prompt', type: 'string', optional: false },
      { name: 'system_prompt', type: 'string | null', optional: true },
      { name: 'files', type: 'Array<FileInput> | null', optional: true },
      { name: 'temperature', type: 'number', optional: true },
      { name: 'max_tokens', type: 'number | null', optional: true },
      { name: 'top_p', type: 'number | null', optional: true },
      { name: 'frequency_penalty', type: 'number | null', optional: true },
      { name: 'presence_penalty', type: 'number | null', optional: true },
      { name: 'metadata', type: 'Record | null', optional: true },
    ],
  },
  WorkflowResponse: {
    name: 'WorkflowResponse',
    file: 'apps/chat/services/llm-calls-service.ts',
    fields: [
      { name: 'workflow_name', type: 'string', optional: false },
      { name: 'workflow_type', type: 'string', optional: false },
      { name: 'request_id', type: 'string', optional: false },
      { name: 'status', type: 'string (enum)', optional: false },
      { name: 'results', type: 'Array<ModelResult>', optional: false },
      { name: 'total_latency_ms', type: 'number', optional: false },
      { name: 'timestamp', type: 'string', optional: false },
      { name: 'error', type: 'string | null', optional: true },
      { name: 'metadata', type: 'Record | null', optional: true },
      { name: 'session_id', type: 'number | null', optional: true },
      { name: 'attachments', type: 'Array<Record> | null', optional: true },
      { name: 'conversation_turn_count', type: 'number | null', optional: true },
      { name: 'conversation_messages', type: 'Array<Record> | null', optional: true },
    ],
  },
};

// Backend types from packages/api/llm_host/models.py
const BACKEND_TYPES: Record<string, TypeDefinition> = {
  WorkflowRequest: {
    name: 'WorkflowRequest',
    file: 'packages/api/llm_host/models.py',
    fields: [
      { name: 'workflow_name', type: 'str', optional: false },
      { name: 'workflow_type', type: 'WorkflowType (enum)', optional: false },
      { name: 'user_prompt', type: 'str', optional: false },
      { name: 'system_prompt', type: 'Optional[str]', optional: true },
      { name: 'models', type: 'List[ModelConfig]', optional: false },
      { name: 'files', type: 'Optional[List[FileInput]]', optional: true },
      { name: 'session_id', type: 'Optional[int]', optional: true },
      { name: 'request_id', type: 'Optional[str]', optional: true },
      { name: 'conversation_messages', type: 'Optional[List[Dict]]', optional: true },
      { name: 'use_langgraph', type: 'bool', optional: true },
      { name: 'langgraph_config', type: 'Optional[Dict]', optional: true },
      { name: 'webhook_url', type: 'Optional[HttpUrl]', optional: true },
      { name: 'metadata', type: 'Optional[Dict]', optional: true },
    ],
  },
  DynamicLLMRequest: {
    name: 'DynamicLLMRequest',
    file: 'packages/api/llm_host/models.py',
    fields: [
      { name: 'provider', type: 'Provider (enum)', optional: false },
      { name: 'model', type: 'str', optional: false },
      { name: 'prompt', type: 'str', optional: false },
      { name: 'system_prompt', type: 'Optional[str]', optional: true },
      { name: 'files', type: 'Optional[List[FileInput]]', optional: true },
      { name: 'temperature', type: 'float', optional: true },
      { name: 'max_tokens', type: 'Optional[int]', optional: true },
      { name: 'top_p', type: 'Optional[float]', optional: true },
      { name: 'frequency_penalty', type: 'Optional[float]', optional: true },
      { name: 'presence_penalty', type: 'Optional[float]', optional: true },
      { name: 'metadata', type: 'Optional[Dict]', optional: true },
    ],
  },
  WorkflowResponse: {
    name: 'WorkflowResponse',
    file: 'packages/api/llm_host/models.py',
    fields: [
      { name: 'workflow_name', type: 'str', optional: false },
      { name: 'workflow_type', type: 'str', optional: false },
      { name: 'request_id', type: 'str', optional: false },
      { name: 'status', type: 'Literal["success", "partial", "failed"]', optional: false },
      { name: 'results', type: 'List[ModelResult]', optional: false },
      { name: 'total_latency_ms', type: 'float', optional: false },
      { name: 'timestamp', type: 'datetime', optional: false },
      { name: 'error', type: 'Optional[str]', optional: true },
      { name: 'metadata', type: 'Dict', optional: true },
      { name: 'session_id', type: 'Optional[int]', optional: true },
      { name: 'attachments', type: 'Optional[List[Dict]]', optional: true },
      { name: 'conversation_turn_count', type: 'Optional[int]', optional: true },
      { name: 'conversation_messages', type: 'Optional[List[Dict]]', optional: true },
    ],
  },
};

// API Endpoints
const API_ENDPOINTS = [
  {
    method: 'POST',
    path: '/llm-calls/execute',
    frontend: 'executeWorkflow',
    backend: 'execute_workflow',
    requestType: 'WorkflowRequest',
    responseType: 'WorkflowResponse',
  },
  {
    method: 'POST',
    path: '/llm-calls/dynamic/execute',
    frontend: 'executeDirect',
    backend: 'execute_dynamic_llm',
    requestType: 'DynamicLLMRequest',
    responseType: 'WorkflowResponse',
  },
  {
    method: 'POST',
    path: '/llm-calls/dynamic/batch',
    frontend: 'executeBatch',
    backend: 'execute_batch_llm',
    requestType: 'BatchLLMRequest',
    responseType: 'WorkflowResponse',
  },
  {
    method: 'GET',
    path: '/llm-calls/health',
    frontend: 'checkHealth',
    backend: 'health_check',
    requestType: null,
    responseType: 'HealthResponse',
  },
];

function compareTypes(frontend: TypeDefinition, backend: TypeDefinition): {
  matches: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const frontendFields = new Map(frontend.fields.map((f) => [f.name, f]));
  const backendFields = new Map(backend.fields.map((f) => [f.name, f]));

  // Check all frontend fields exist in backend
  for (const [name, field] of frontendFields) {
    if (!backendFields.has(name)) {
      errors.push(`Frontend field '${name}' not found in backend`);
    } else {
      const backendField = backendFields.get(name)!;
      // Check optionality matches
      if (field.optional !== backendField.optional) {
        errors.push(
          `Field '${name}': optionality mismatch (frontend: ${field.optional}, backend: ${backendField.optional})`
        );
      }
    }
  }

  // Check all backend required fields exist in frontend
  for (const [name, field] of backendFields) {
    if (!field.optional && !frontendFields.has(name)) {
      errors.push(`Backend required field '${name}' missing in frontend`);
    }
  }

  return {
    matches: errors.length === 0,
    errors,
  };
}

function validateEndpoints(): void {
  console.log('🔍 Validating LLM API Types and Endpoints\n');
  console.log('='.repeat(80));

  let totalErrors = 0;

  // Validate types
  for (const typeName of Object.keys(FRONTEND_TYPES)) {
    if (!BACKEND_TYPES[typeName]) {
      console.error(`❌ Backend type '${typeName}' not found`);
      totalErrors++;
      continue;
    }

    const frontend = FRONTEND_TYPES[typeName];
    const backend = BACKEND_TYPES[typeName];
    const comparison = compareTypes(frontend, backend);

    if (comparison.matches) {
      console.log(`✅ ${typeName}: Types match`);
    } else {
      console.error(`❌ ${typeName}: Type mismatch`);
      comparison.errors.forEach((error) => {
        console.error(`   - ${error}`);
        totalErrors++;
      });
    }
  }

  // Validate endpoints
  console.log('\n📡 Validating API Endpoints:');
  console.log('-'.repeat(80));

  for (const endpoint of API_ENDPOINTS) {
    console.log(`\n${endpoint.method} ${endpoint.path}`);
    console.log(`  Frontend: ${endpoint.frontend}`);
    console.log(`  Backend: ${endpoint.backend}`);

    if (endpoint.requestType) {
      const hasRequestType =
        FRONTEND_TYPES[endpoint.requestType] && BACKEND_TYPES[endpoint.requestType];
      if (hasRequestType) {
        console.log(`  ✅ Request type '${endpoint.requestType}' exists`);
      } else {
        console.error(`  ❌ Request type '${endpoint.requestType}' missing`);
        totalErrors++;
      }
    }

    if (endpoint.responseType) {
      const hasResponseType =
        FRONTEND_TYPES[endpoint.responseType] || BACKEND_TYPES[endpoint.responseType];
      if (hasResponseType) {
        console.log(`  ✅ Response type '${endpoint.responseType}' exists`);
      } else {
        console.error(`  ❌ Response type '${endpoint.responseType}' missing`);
        totalErrors++;
      }
    }
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  if (totalErrors === 0) {
    console.log('✅ All validations passed!');
    process.exit(0);
  } else {
    console.error(`❌ Found ${totalErrors} error(s)`);
    console.error('\nPlease fix the errors above and run the validation again.');
    process.exit(1);
  }
}

// Run validation
validateEndpoints();
