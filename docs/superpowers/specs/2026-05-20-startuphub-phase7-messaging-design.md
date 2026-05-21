# StartupHub Phase 7 One-to-One Messaging Design

## Scope

This design covers the first messaging release for StartupHub:

- one-to-one inbox conversations
- open a conversation with another user
- send messages
- list inbox conversations
- unread tracking and read-on-open behavior
- web page integration in the existing app shell

This phase excludes group chat, typing indicators, websockets, attachments, and message reactions.

## Recommended Approach

Build a direct messaging module with a durable `Conversation` entity and a `Message` entity, plus a web page backed by the existing cookie-auth browser experience.

Why this approach:

- it creates a complete usable inbox instead of a thin message API
- it keeps the scope narrow by focusing only on one-to-one chats
- it fits the current layered architecture and existing web shell
- it leaves room for future realtime upgrades without changing the core data model

## Architecture

The messaging layer will introduce:

- `Conversation` and `Message` entities
- repositories for pair lookup, conversation listing, and message history
- a messaging service for pair resolution, read-state handling, and summary mapping
- a messaging controller for JSON APIs
- a web page route for the inbox screen
- page JavaScript added to the current frontend shell

Authenticated identity will always come from the current JWT principal or browser auth cookie.

## Data Model

### Conversation

- `id: Long`
- `participantOne: User`
- `participantTwo: User`
- `createdAt: LocalDateTime`

Behavior:

- exactly one conversation exists per user pair
- pair uniqueness is enforced independent of participant order

### Message

- `id: Long`
- `conversation: Conversation`
- `sender: User`
- `content: String`
- `isRead: boolean`
- `createdAt: LocalDateTime`

Behavior:

- `content` is required and non-blank
- `content` max length is `2000`
- messages are ordered oldest-first inside a conversation
- incoming messages are marked read when the current user opens the conversation

## API Contract

### GET `/api/messages/conversations`

Returns the current user’s inbox conversation summaries ordered newest-first by latest message timestamp.

Response:

- `200 OK`
- list of `ConversationSummaryResponse`

### GET `/api/messages/conversations/{userId}`

Returns the conversation with another user. If no conversation exists, create it lazily and return an empty history.

Behavior:

- marks messages from the other participant as read

Response:

- `200 OK`
- list of `MessageResponse`

### POST `/api/messages`

Sends a message to another user.

Request:

- `SendMessageRequest`

Response:

- `201 Created`
- `MessageResponse`

## Web Route

### GET `/app/messages`

Returns the inbox page within the existing authenticated app shell.

## Response Design

### SendMessageRequest

Will include:

- `recipientId`
- `content`

### MessageResponse

Will include:

- `id`
- `conversationId`
- `sender`
- `content`
- `isRead`
- `createdAt`

### ConversationSummaryResponse

Will include:

- `conversationId`
- `otherParticipant`
- `lastMessagePreview`
- `lastMessageTime`
- `unreadCount`

## Rules and Validation

- self-messaging is rejected with `400`
- blank message content is rejected with `400`
- missing target user returns `404`
- inbox summaries are ordered by latest activity descending
- opening a conversation is idempotent and safe to repeat

## Frontend Design

The inbox page should fit inside the existing web app:

- left column: conversation list
- right column: active message thread
- compose box at bottom
- simple polling for refresh is acceptable in this phase

This phase does not require realtime transport.

## Error Handling

The existing JSON error contract remains in place.

Handled cases for this phase:

- self message -> `400`
- blank content -> `400`
- target user not found -> `404`
- unauthorized access -> `401`

## Testing Strategy

Automated verification:

- service tests for conversation creation, send message, unread counts, and read-on-open behavior
- controller tests for inbox list, conversation fetch, send message, and self-message rejection
- web route test for `/app/messages`
- full Maven test run

Runtime verification:

- start the app against MySQL
- register at least two users
- send messages between them
- verify inbox list ordering
- verify unread counts and read-on-open behavior
- verify the browser inbox UI through the authenticated shell

## Risks and Decisions

- conversation creation on first open is intentionally chosen to reduce UI friction
- polling is acceptable because this phase prioritizes completeness over realtime complexity
- group chat is intentionally deferred to avoid destabilizing the first inbox release
- no git repository exists in this workspace, so this spec cannot be committed here
