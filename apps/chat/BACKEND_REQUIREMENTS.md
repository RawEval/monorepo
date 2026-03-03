# Chat App Backend API Requirements

This document outlines **every backend API requirement** necessary for the core functioning of the chat application within the monorepo. It focuses on the essential workflows: multiple chat sessions, file attachments, marking AI responses as wrong, and viewing payouts for approved feedback.

All APIs should return data in JSON format unless specified otherwise.

---

## 1. Authentication & Security APIs

**Base Path:** `/auth`

### 1.1. Login [PUBLIC]

- **Endpoint:** `POST /auth/login`
- **Request:** FormData or JSON `{ "email": "...", "password": "..." }`
- **Response:** `{ "access_token": "...", "refresh_token": "...", "token_type": "bearer" }`

### 1.2. Register [PUBLIC]

- **Endpoint:** `POST /auth/register`
- **Request:** `{ "email": "...", "password": "...", "full_name": "..." }`
- **Response:** `{ "id": 1, "email": "...", "full_name": "..." }`

### 1.3. Get Current User [PROTECTED]

- **Endpoint:** `GET /users/me`
- **Response:** `{ "id": 1, "email": "...", "full_name": "...", "avatar_url": "..." }`

### 1.4. Logout [PROTECTED]

- **Endpoint:** `POST /auth/logout`
- **Request:** `{ "refresh_token": "..." }` (Optional)
- **Response:** `200 OK`

---

## 2. Chat & LLM Workflows (Multiple Conversations)

**Base Path:** `/execute` & `/sessions`
_(All endpoints are **PROTECTED**)_

The app supports multiple chat sessions per user.

### 2.1. Execute Chat Workflow (Send Message)

- **Endpoint:** `POST /execute`
- **Request:**
  ```json
  {
    "workflow_name": "chat_session",
    "workflow_type": "single_model",
    "user_prompt": "...",
    "session_id": 123, // Omit to create a new session
    "models": [{ "provider": "openai", "model": "gpt-4o" }],
    "files": [
      { "file_type": "image", "s3_key": "...", "filename": "example.png" }
    ]
  }
  ```
- **Response:** Workflow results containing the Assistant's reply and the backend `session_id`.

### 2.2. List User Sessions (Sidebar Chat History)

- **Endpoint:** `GET /sessions?page=1&page_size=20&order_dir=desc`
- **Response:** A paginated list of the user's past chat sessions.

### 2.3. Get Session Detail (Load specific conversation)

- **Endpoint:** `GET /sessions/:id?include_messages=true`
- **Response:** The session details along with the full array of chronological messages.

### 2.4. Update Session (Rename conversation)

- **Endpoint:** `PATCH /sessions/:id`
- **Request:** `{ "title": "New Conversation Title" }`
- **Response:** `200 OK`

### 2.5. Delete Session (Remove conversation)

- **Endpoint:** `DELETE /sessions/:id`
- **Response:** `200 OK`

---

## 3. File Management (Attachments)

**Base Path:** `/upload-files`
_(All endpoints **PROTECTED**)_

### 3.1. Upload Files

- **Endpoint:** `POST /upload-files`
- **Request:** `multipart/form-data` with one or multiple `files`
- **Response:**
  ```json
  {
    "files": [
      {
        "filename": "...",
        "s3_key": "...",
        "s3_url": "...",
        "file_size_bytes": 1024
      }
    ]
  }
  ```

---

## 4. Feedback, QA & Payouts (The "Mark as Wrong" Flow)

**Base Path:** `/data` & `/prompts` & `/failed-prompts`
_(All endpoints **PROTECTED**)_

This section manages the core mechanic of marking AI responses as wrong, routing them for QA, and tracking the resulting payouts.

### 4.1. Ingest Prompt Data

- **Endpoint:** `POST /data/ingest`
- **Description:** Used to sync the user's prompt and the assistant's response into the main database before flagging it.
- **Request:** `{ "query_text": "...", "model_responses": { ... } }`
- **Response:** `{ "prompt_id": 1, "status": "completed" }`

### 4.2. Mark Message As Wrong

- **Endpoint:** `POST /prompts/:promptId/mark-wrong`
- **Description:** Flags the previously ingested prompt as containing an incorrect response, moving it to the 'pending' state for QA.
- **Response:** `200 OK`

### 4.3. List Marked Responses (Payouts View)

- **Endpoint:** `GET /failed-prompts/?skip=0&limit=100&status=pending`
- **Description:** Retrieves the list of responses marked as wrong by the user, including their QA status (`pending`, `approved`, `rejected`, `paid`) and payout amounts.
- **Response:** An array of `FailedPromptResponse` items.

### 4.4. Get User Earnings Stats

- **Endpoint:** `GET /users/me/earnings` _(Currently missing in Frontend API integration)_
- **Description:** Provides summary statistics for the Payouts page header cards.
- **Response:**
  ```json
  {
    "total_earned": 150.0,
    "pending_earnings": 25.0,
    "pending_qa_count": 5,
    "total_responses": 42
  }
  ```
