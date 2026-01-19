# RawEval Monorepo - Package Purposes & Responsibilities

This document outlines the purpose and responsibilities of each package in the RawEval monorepo.

## 📦 Package Overview

### Apps (`apps/`)

#### `apps/landing` - Public Marketing Site
**Purpose:** Public-facing marketing website for www.raweval.com

**Responsibilities:**
- Marketing pages (home, features, pricing, about)
- Expert recruitment landing pages
- Chat platform landing pages
- Organization/enterprise pages
- SEO and content marketing
- Public documentation

**Key Features:**
- Hero sections, feature showcases
- Expert tier system explanations
- Platform workflow visualizations
- Security and trust indicators
- Call-to-action sections

**Routes:**
- `/` - Homepage
- `/chat` - Chat platform landing
- `/experts` - Expert recruitment
- `/organizations` - Enterprise/org landing
- `/how-it-works/*` - Process explanations

---

#### `apps/chat` - User Chat Interface
**Purpose:** Main chat application for chat.raweval.com

**Responsibilities:**
- User authentication (login, signup)
- Chat interface with AI assistant
- Message history and project management
- Settings and profile management
- Payouts/earnings display
- Flagging incorrect responses

**Key Features:**
- Real-time chat with LLM integration
- File uploads (images, PDFs, etc.)
- Session/project management
- User profile and settings
- Payment tracking

**API Integration:**
- Authentication (`authService`)
- Chat messages (`chatService`, `llmCallsService`)
- User management (`usersService`)
- Prompts (`promptsService`)
- Payments (`paymentsService`)

**Routes:**
- `/login`, `/signup` - Authentication
- `/chat` - Main chat interface
- `/history` - Chat history
- `/projects` - Project management
- `/settings` - User settings
- `/payouts` - Earnings tracking

---

#### `apps/experts` - Expert Workbench
**Purpose:** Secure workbench for experts.raweval.com

**Responsibilities:**
- Expert registration and onboarding
- Task browsing and acceptance
- Secure task execution environment
- Earnings tracking
- Performance metrics
- Tier progression

**Key Features:**
- Landing page for expert recruitment
- Workbench dashboard with available tasks
- Secure session monitoring (camera, keystroke)
- Real-time earnings display
- Performance analytics
- Tier-based task allocation

**API Integration:**
- Expert registration (`expertsService`)
- Task management (`workbenchService`)
- User authentication (`authService`)
- Payments (`paymentsService`)

**Routes:**
- `/` - Landing page
- `/register` - Expert registration
- `/workbench` - Main workbench dashboard
- `/earnings` - Payment history
- `/profile` - Expert profile

---

#### `apps/admin` - Internal Admin Dashboard
**Purpose:** Internal admin dashboard for admin.raweval.com

**Responsibilities:**
- Platform-wide statistics and analytics
- Expert management and monitoring
- Task tracking and status
- Prompt management
- Payment oversight
- Quality control

**Key Features:**
- Real-time dashboard with KPIs
- Expert management (tier, verification, performance)
- Task monitoring and allocation
- Revenue and payment tracking
- System health monitoring

**API Integration:**
- Expert management (`expertsService`)
- Task/workbench management (`workbenchService`)
- Prompt management (`promptsService`)
- Payment statistics (`paymentsService`)
- User management (`usersService`)

**Routes:**
- `/` - Landing page
- `/dashboard` - Main admin dashboard
- `/experts` - Expert management
- `/tasks` - Task monitoring
- `/payments` - Payment oversight
- `/analytics` - Advanced analytics

---

### Packages (`packages/`)

#### `packages/api-client` - API Client Library
**Purpose:** Centralized HTTP client for all API interactions

**Responsibilities:**
- HTTP request/response handling
- Authentication token management
- Request/response interceptors
- Error handling and retry logic
- Timeout and cancellation
- FormData support for file uploads

**Key Features:**
- Retry with exponential backoff
- Request cancellation
- Automatic token injection
- Error transformation
- Support for multiple base URLs (main API + LLM Calls API)

**Exports:**
- `ApiClient` class
- `apiClient` singleton instance
- Error classes (`ApiError`, `NetworkError`, `TimeoutError`, `ValidationError`)
- Interceptor types and utilities

---

#### `packages/auth` - Authentication & Authorization
**Purpose:** Authentication and RBAC (Role-Based Access Control)

**Responsibilities:**
- Token storage and retrieval
- Session management
- Permission checking
- Role-based access control
- User role definitions

**Key Features:**
- JWT token storage (localStorage)
- Token expiration handling
- Permission matrix for roles
- Workspace role support
- Session validation

**Exports:**
- `storeToken()`, `getStoredToken()`, `clearToken()`
- `hasPermission()`, `getUserRole()`
- Permission constants
- RBAC utilities

---

#### `packages/types` - Shared TypeScript Types
**Purpose:** Shared TypeScript type definitions

**Responsibilities:**
- API request/response types
- Domain model types (User, Expert, Chat, etc.)
- Common utility types
- Type exports for all packages

**Key Types:**
- `User`, `Expert`, `ExpertTier`
- `ChatMessage`, `ChatSession`
- `Prompt`, `Task`, `Payment`
- `ApiResponse`, `PaginatedResponse`
- `Permission`, `UserRole`, `WorkspaceRole`

**Exports:**
- All types from `src/index.ts`
- API-specific types from `src/auth-api.ts`, `src/api.ts`

---

#### `packages/ui` - Shared UI Components
**Purpose:** Shared Shadcn UI components

**Responsibilities:**
- Reusable React components
- Consistent design system
- Component variants and styling
- Accessibility support

**Key Components:**
- `Button`, `Card`, `Badge`, `Input`
- `Avatar`, `Separator`, `ScrollArea`
- `DropdownMenu`, `Dialog`, `Sheet`
- All Shadcn components

**Rules:**
- Components are generated via Shadcn MCP server
- Do NOT edit components directly
- Each component in separate file
- Direct imports: `@raweval/ui/button`

---

#### `packages/utils` - Shared Utilities
**Purpose:** Pure utility functions

**Responsibilities:**
- Formatting functions (currency, numbers, dates)
- URL generation for apps
- Common helper functions
- Validation utilities

**Key Functions:**
- `formatCurrency()`, `formatNumber()`, `formatPercentage()`
- `getAppUrl()`, `getAppUrls()` - App URL generation
- `cn()` - Class name utility (clsx + tailwind-merge)

**Rules:**
- Pure functions only (no side effects)
- Fully tested
- No React-specific code
- No dependencies on other packages (except types)

---

#### `packages/config` - Shared Configuration
**Purpose:** Shared configuration files

**Responsibilities:**
- Tailwind CSS configuration
- TypeScript configuration
- ESLint/Prettier configs
- Global CSS and theme

**Key Files:**
- `tailwind.config.ts` - Tailwind configuration
- `theme.css` - Global theme variables
- `tsconfig.json` - TypeScript base config

---

#### `packages/db` - Database Client
**Purpose:** Database client and schema (future)

**Responsibilities:**
- Database connection
- Schema definitions
- Query builders
- Migration utilities

**Status:** Placeholder for future database integration

---

## 🔄 Data Flow

### Authentication Flow
```
User → apps/chat → authService.login() → @raweval/api-client → Backend API
                                                              ↓
Response → storeToken() (@raweval/auth) → localStorage
```

### Chat Message Flow
```
User → apps/chat → chatService.sendMessage() → llmCallsService.executeDirect()
                                                              ↓
LLM Call Host API → Response → ChatMessage → UI Update
```

### Expert Task Flow
```
Expert → apps/experts → workbenchService.getAvailableTasks() → Backend API
                                                              ↓
Tasks → UI Display → workbenchService.submitTask() → Backend API
```

### Admin Monitoring Flow
```
Admin → apps/admin → expertsService.getExperts() → Backend API
                  → promptsService.getPrompts() → Backend API
                  → paymentsService.getPaymentStatistics() → Backend API
                                                              ↓
Aggregated Stats → Dashboard UI
```

## 🔌 API Integration

### Main API Endpoints
- Base URL: `NEXT_PUBLIC_API_URL` (default: `http://localhost:8000`)
- Version: `v1`
- Authentication: Bearer token in `Authorization` header

**Key Endpoints:**
- `/api/v1/auth/*` - Authentication
- `/api/v1/experts/*` - Expert management
- `/api/v1/workbench/*` - Task management
- `/api/v1/prompts/*` - Prompt management
- `/api/v1/payments/*` - Payment operations
- `/api/v1/users/*` - User management

### LLM Calls API Endpoints
- Base URL: `NEXT_PUBLIC_LLM_CALLS_API_URL` (defaults to main API URL)
- Direct LLM calls: `/dynamic-llm-calls/execute`
- Workflow execution: `/llm-calls/execute`
- File uploads: `/llm-calls/upload-files`
- Health check: `/health`

## 📋 Service Layer Architecture

All apps follow a consistent service layer pattern:

```
Component → Service → API Client → Backend
```

**Service Classes:**
- Extend `ApiService` base class
- Use `this.client` for HTTP requests
- Handle responses with `handleResponse()`
- Located in `apps/{app}/services/`

**Example:**
```typescript
// apps/chat/services/chat-service.ts
export class ChatService extends ApiService {
  async sendMessage(message: string, options: SendMessageOptions) {
    const response = await this.client.post('/chat/messages', {
      message,
      ...options,
    });
    return this.handleResponse(response);
  }
}
```

## 🚀 Development Workflow

1. **Add New Feature:**
   - Create service in `apps/{app}/services/`
   - Add types to `packages/types/src/`
   - Create components in `apps/{app}/features/{feature}/components/`
   - Use services in components

2. **Add Shared Component:**
   - Use Shadcn MCP server to add to `packages/ui/src/`
   - Import directly: `@raweval/ui/component-name`

3. **Add API Endpoint:**
   - Add service method in appropriate service
   - Add types to `packages/types/src/`
   - Update API client if needed

## 📝 Notes

- All packages follow strict dependency rules (no cycles)
- Services are testable in isolation
- Types are shared across all packages
- UI components are reusable across apps
- Configuration is centralized in `packages/config`

---

**Last Updated:** 2026-01-26
**Monorepo Version:** 1.0.0
