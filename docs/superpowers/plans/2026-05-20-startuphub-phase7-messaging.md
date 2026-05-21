# StartupHub Phase 7 One-to-One Messaging Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build one-to-one direct messaging with inbox summaries, lazy conversation creation, unread tracking, read-on-open behavior, and browser inbox integration.

**Architecture:** Add `Conversation` and `Message` as first-class domain entities, expose them through a messaging service and REST controller, and integrate the inbox into the existing authenticated web shell at `/app/messages`. Reuse the current JWT/cookie auth flow, author summary pattern, and frontend page-script approach.

**Tech Stack:** Java 17, Spring Boot 3.3.5, Spring Security, Spring MVC, Spring Data JPA, Hibernate, Thymeleaf, Bootstrap 5, vanilla JavaScript, MySQL, H2 test profile, JUnit 5, Mockito, MockMvc

---

## File Structure

### Files to modify

- `developer.md` - record final Phase 7 architecture and testing instructions
- `tracker.md` - mark messaging done
- `src/main/java/com/startuphub/controller/WebController.java` - add the inbox page route
- `src/main/resources/templates/feed.html` - add messages navigation link
- `src/main/resources/templates/discovery.html` - add messages navigation link
- `src/main/resources/templates/profile.html` - add messages navigation link
- `src/main/resources/templates/startups.html` - add messages navigation link
- `src/main/resources/templates/startup-detail.html` - add messages navigation link
- `src/main/resources/templates/notifications.html` - add messages navigation link
- `src/main/resources/static/css/app.css` - add inbox layout styling

### Files to create

- `src/main/java/com/startuphub/entity/Conversation.java`
- `src/main/java/com/startuphub/entity/Message.java`
- `src/main/java/com/startuphub/dto/SendMessageRequest.java`
- `src/main/java/com/startuphub/dto/MessageResponse.java`
- `src/main/java/com/startuphub/dto/ConversationSummaryResponse.java`
- `src/main/java/com/startuphub/repository/ConversationRepository.java`
- `src/main/java/com/startuphub/repository/MessageRepository.java`
- `src/main/java/com/startuphub/service/MessagingService.java`
- `src/main/java/com/startuphub/controller/MessagingController.java`
- `src/test/java/com/startuphub/service/MessagingServiceTest.java`
- `src/test/java/com/startuphub/controller/MessagingControllerTest.java`
- `src/main/resources/templates/messages.html`
- `src/main/resources/static/js/messages.js`

## Task 1: Define the Phase 7 contract with failing tests

**Files:**
- Create: `src/test/java/com/startuphub/service/MessagingServiceTest.java`
- Create: `src/test/java/com/startuphub/controller/MessagingControllerTest.java`

- [ ] **Step 1: Write the failing service tests**

Add tests for:

```java
@Test
void sendMessageCreatesConversationWhenMissing() { }

@Test
void getConversationMarksIncomingMessagesAsRead() { }

@Test
void listConversationsReturnsNewestFirstWithUnreadCounts() { }

@Test
void sendMessageRejectsSelfMessaging() { }
```

Key assertions:
- first message creates the conversation lazily
- loading a conversation marks the other user’s messages as read
- inbox summaries are ordered by latest message time descending
- self-message attempts fail with `IllegalArgumentException`

- [ ] **Step 2: Write the failing controller tests**

Add tests for:

```java
@Test
void listConversationsReturnsOk() throws Exception { }

@Test
void getConversationReturnsOk() throws Exception { }

@Test
void sendMessageReturnsCreated() throws Exception { }

@Test
void selfMessageReturnsBadRequest() throws Exception { }
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `./mvnw -q -Dtest=MessagingServiceTest,MessagingControllerTest test`
Expected: FAIL because the messaging entities, DTOs, repositories, service, and controller do not exist yet.

## Task 2: Add messaging entities and repositories

**Files:**
- Create: `src/main/java/com/startuphub/entity/Conversation.java`
- Create: `src/main/java/com/startuphub/entity/Message.java`
- Create: `src/main/java/com/startuphub/repository/ConversationRepository.java`
- Create: `src/main/java/com/startuphub/repository/MessageRepository.java`

- [ ] **Step 1: Implement the minimal entities**

Requirements:
- `Conversation`: `id`, `participantOne`, `participantTwo`, `createdAt`
- `Message`: `id`, `conversation`, `sender`, `content`, `isRead`, `createdAt`
- timestamps via `@PrePersist`
- `Message.content` max length `2000`

- [ ] **Step 2: Implement repository support**

Required methods:

```java
List<Conversation> findByParticipantOneIdOrParticipantTwoId(Long participantOneId, Long participantTwoId);
Optional<Conversation> findByParticipantOneIdAndParticipantTwoId(Long participantOneId, Long participantTwoId);
List<Message> findByConversationIdOrderByCreatedAtAsc(Long conversationId);
Optional<Message> findTopByConversationIdOrderByCreatedAtDesc(Long conversationId);
long countByConversationIdAndSenderIdNotAndIsReadFalse(Long conversationId, Long senderId);
```

- [ ] **Step 3: Run service tests to verify they still fail later**

Run: `./mvnw -q -Dtest=MessagingServiceTest test`
Expected: FAIL later because the service, mappings, and controller are still missing.

## Task 3: Add messaging DTOs

**Files:**
- Create: `src/main/java/com/startuphub/dto/SendMessageRequest.java`
- Create: `src/main/java/com/startuphub/dto/MessageResponse.java`
- Create: `src/main/java/com/startuphub/dto/ConversationSummaryResponse.java`

- [ ] **Step 1: Implement request DTO**

`SendMessageRequest` should include:
- `recipientId`
- `content`

Validation:
- `recipientId` required
- `content` non-blank
- `content` max length `2000`

- [ ] **Step 2: Implement response DTOs**

`MessageResponse` should contain:
- `id`
- `conversationId`
- `sender`
- `content`
- `isRead`
- `createdAt`

`ConversationSummaryResponse` should contain:
- `conversationId`
- `otherParticipant`
- `lastMessagePreview`
- `lastMessageTime`
- `unreadCount`

## Task 4: Implement messaging service with TDD

**Files:**
- Create: `src/main/java/com/startuphub/service/MessagingService.java`
- Test: `src/test/java/com/startuphub/service/MessagingServiceTest.java`

- [ ] **Step 1: Implement the public service API**

Required methods:

```java
List<ConversationSummaryResponse> getConversations();
List<MessageResponse> getConversationMessages(Long otherUserId);
MessageResponse sendMessage(SendMessageRequest request);
```

Behavior:
- current user resolved from `AuthService`
- reject self-messaging with `IllegalArgumentException`
- resolve or create conversation lazily on send or open
- mark incoming messages as read on conversation open
- sort inbox summaries by latest message timestamp descending

- [ ] **Step 2: Add pair normalization**

Ensure conversations are unique regardless of user order by sorting user ids before pair lookup/creation.

- [ ] **Step 3: Run service tests**

Run: `./mvnw -q -Dtest=MessagingServiceTest test`
Expected: PASS

## Task 5: Implement the messaging controller

**Files:**
- Create: `src/main/java/com/startuphub/controller/MessagingController.java`
- Test: `src/test/java/com/startuphub/controller/MessagingControllerTest.java`

- [ ] **Step 1: Implement endpoints**

Add:
- `GET /api/messages/conversations`
- `GET /api/messages/conversations/{userId}`
- `POST /api/messages`

- [ ] **Step 2: Use existing JSON error handling**

Self-message and blank-content cases should surface through the global error contract with `400`.

- [ ] **Step 3: Run controller tests**

Run: `./mvnw -q -Dtest=MessagingControllerTest test`
Expected: PASS

## Task 6: Add the inbox page and browser integration

**Files:**
- Modify: `src/main/java/com/startuphub/controller/WebController.java`
- Create: `src/main/resources/templates/messages.html`
- Create: `src/main/resources/static/js/messages.js`
- Modify: existing app templates listed in File Structure
- Modify: `src/main/resources/static/css/app.css`

- [ ] **Step 1: Add the web route**

Add:
- `GET /app/messages`

- [ ] **Step 2: Add messages navigation links**

Update the existing app-shell templates so the inbox is reachable from all authenticated screens.

- [ ] **Step 3: Build the inbox template**

Requirements:
- left-side conversation list
- right-side active thread
- compose form
- page root ids for JS hooks

- [ ] **Step 4: Build `messages.js`**

Behavior:
- load conversation summaries from `/api/messages/conversations`
- open a conversation when the user clicks a summary
- send messages with `POST /api/messages`
- poll periodically to refresh summaries and active thread

- [ ] **Step 5: Extend CSS for inbox layout**

Add a responsive two-column layout that collapses cleanly on mobile.

## Task 7: Full verification and docs update

**Files:**
- Modify: `tracker.md`
- Modify: `developer.md`

- [ ] **Step 1: Run the full test suite**

Run: `./mvnw test`
Expected: PASS

- [ ] **Step 2: Update tracker**

Mark direct messaging done.

- [ ] **Step 3: Update developer context**

Document:
- conversation/message data model
- messaging endpoints
- inbox page route
- how unread tracking works
- browser/manual test steps

- [ ] **Step 4: Optional live verification**

Run the app and verify:
- send a message between two users
- refresh inbox and check ordering
- open a conversation and confirm unread count clears
- use the browser inbox page end to end

## Self-Review

Spec coverage check:
- inbox list, conversation open, send message, and read-on-open behavior are covered in Tasks 1 through 6
- one-to-one only scope and self-message rejection are covered in Tasks 1, 4, and 5
- web page integration is covered in Task 6
- docs and end-to-end verification are covered in Task 7

Placeholder scan:
- no `TODO`, `TBD`, or undefined instructions remain inside the plan body

Type consistency:
- `ConversationSummaryResponse`, `MessageResponse`, `SendMessageRequest`, and the `MessagingService` method names are used consistently across tasks
