# StartupHub Phase 4 Discovery Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Phase 4 discovery layer with user search, suggested connections, notifications, and a personalized feed.

**Architecture:** Reuse the existing user, follow, post, like, and comment graph, and add a `Notification` entity plus discovery-focused services and DTOs. Keep the current Spring Boot layered structure, use JWT-backed current-user resolution for personalization, and reuse the existing `PostResponse` contract for the personalized feed.

**Tech Stack:** Java 17, Spring Boot 3.3.5, Spring Security, Spring Data JPA, Hibernate, MySQL, H2 test profile, JUnit 5, Mockito, MockMvc

---

## File Structure

### Files to modify

- `developer.md` - update Phase 4 architecture and test instructions
- `tracker.md` - mark Phase 4 progress and completion
- `src/main/java/com/startuphub/service/PostService.java` - emit notifications for likes and comments
- `src/main/java/com/startuphub/service/ProfileService.java` - emit notifications for follows
- `src/main/java/com/startuphub/repository/PostRepository.java` - add personalized feed query
- `src/main/java/com/startuphub/repository/UserRepository.java` - add case-insensitive search query

### Files to create

- `src/main/java/com/startuphub/dto/NotificationResponse.java`
- `src/main/java/com/startuphub/dto/SearchUserResponse.java`
- `src/main/java/com/startuphub/dto/SuggestedConnectionResponse.java`
- `src/main/java/com/startuphub/entity/Notification.java`
- `src/main/java/com/startuphub/entity/NotificationType.java`
- `src/main/java/com/startuphub/repository/NotificationRepository.java`
- `src/main/java/com/startuphub/service/DiscoveryService.java`
- `src/main/java/com/startuphub/service/NotificationService.java`
- `src/main/java/com/startuphub/controller/DiscoveryController.java`
- `src/test/java/com/startuphub/service/DiscoveryServiceTest.java`
- `src/test/java/com/startuphub/controller/DiscoveryControllerTest.java`

## Task 1: Define the Phase 4 contract with failing tests

**Files:**
- Create: `src/test/java/com/startuphub/service/DiscoveryServiceTest.java`
- Create: `src/test/java/com/startuphub/controller/DiscoveryControllerTest.java`

- [ ] **Step 1: Write the failing service tests**

Add tests for:

```java
@Test
void searchUsersReturnsCaseInsensitiveMatches() { }

@Test
void suggestionsExcludeCurrentAndFollowedUsers() { }

@Test
void discoveryFeedReturnsOwnAndFollowedPostsNewestFirst() { }

@Test
void markNotificationReadReturnsUpdatedNotification() { }
```

Key assertions:
- search matches across `name` and `email`
- suggestions are sorted by follower count and exclude current/already-followed users
- discovery feed includes only own and followed-user posts
- notification read is idempotent and recipient-scoped

- [ ] **Step 2: Write the failing controller tests**

Add tests for:

```java
@Test
void searchUsersReturnsOk() throws Exception { }

@Test
void suggestionsReturnsOk() throws Exception { }

@Test
void discoveryFeedReturnsOk() throws Exception { }

@Test
void notificationsReturnsOk() throws Exception { }

@Test
void markNotificationReadReturnsOk() throws Exception { }
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `./mvnw -q -Dtest=DiscoveryServiceTest,DiscoveryControllerTest test`
Expected: FAIL because the Phase 4 DTO, entity, repository, service, and controller classes do not exist yet.

## Task 2: Add notification entities and repository

**Files:**
- Create: `src/main/java/com/startuphub/entity/Notification.java`
- Create: `src/main/java/com/startuphub/entity/NotificationType.java`
- Create: `src/main/java/com/startuphub/repository/NotificationRepository.java`
- Test: `src/test/java/com/startuphub/service/DiscoveryServiceTest.java`

- [ ] **Step 1: Implement the minimal notification model**

Requirements:
- `Notification` fields: `id`, `recipient`, `actor`, `type`, `post`, `message`, `isRead`, `createdAt`
- `NotificationType` enum: `FOLLOW`, `POST_LIKE`, `POST_COMMENT`
- default `isRead=false`
- `@PrePersist` for `createdAt`

- [ ] **Step 2: Implement the repository**

Required methods:

```java
List<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId);
Optional<Notification> findByIdAndRecipientId(Long notificationId, Long recipientId);
```

- [ ] **Step 3: Run service tests to verify they still fail later**

Run: `./mvnw -q -Dtest=DiscoveryServiceTest test`
Expected: FAIL later because DTOs, discovery logic, and controller wiring are still missing.

## Task 3: Add discovery DTOs and repository queries

**Files:**
- Create: `src/main/java/com/startuphub/dto/NotificationResponse.java`
- Create: `src/main/java/com/startuphub/dto/SearchUserResponse.java`
- Create: `src/main/java/com/startuphub/dto/SuggestedConnectionResponse.java`
- Modify: `src/main/java/com/startuphub/repository/UserRepository.java`
- Modify: `src/main/java/com/startuphub/repository/PostRepository.java`
- Test: `src/test/java/com/startuphub/controller/DiscoveryControllerTest.java`

- [ ] **Step 1: Implement response DTOs**

`SearchUserResponse` should contain:
- `id`
- `name`
- `email`
- `bio`
- `profilePhoto`
- `role`
- `followedByCurrentUser`

`SuggestedConnectionResponse` should contain:
- `id`
- `name`
- `email`
- `bio`
- `profilePhoto`
- `role`
- `followerCount`

`NotificationResponse` should contain:
- `id`
- `type`
- `message`
- `isRead`
- `createdAt`
- `actor`
- `postId`

- [ ] **Step 2: Add repository support**

Add:
- case-insensitive top-10 user search on `name` and `email`
- post query for authors in a list ordered newest-first

- [ ] **Step 3: Run controller tests to verify they still fail later**

Run: `./mvnw -q -Dtest=DiscoveryControllerTest test`
Expected: FAIL later because the service and controller are still missing.

## Task 4: Implement discovery and notification services with TDD

**Files:**
- Create: `src/main/java/com/startuphub/service/DiscoveryService.java`
- Create: `src/main/java/com/startuphub/service/NotificationService.java`
- Modify: `src/main/java/com/startuphub/service/PostService.java`
- Modify: `src/main/java/com/startuphub/service/ProfileService.java`
- Test: `src/test/java/com/startuphub/service/DiscoveryServiceTest.java`

- [ ] **Step 1: Implement `NotificationService`**

Required methods:

```java
void createFollowNotification(User actor, User recipient);
void createPostLikeNotification(User actor, User recipient, Post post);
void createPostCommentNotification(User actor, User recipient, Post post);
List<NotificationResponse> getNotifications();
NotificationResponse markAsRead(Long notificationId);
```

Behavior:
- do not create notifications when actor equals recipient
- messages stored as plain strings
- mark-as-read is idempotent
- notification lookup is recipient-scoped

- [ ] **Step 2: Implement `DiscoveryService`**

Required methods:

```java
List<SearchUserResponse> searchUsers(String query);
List<SuggestedConnectionResponse> getSuggestions();
List<PostResponse> getDiscoveryFeed();
```

Behavior:
- current user resolved from `AuthService`
- search bounded to 10
- suggestions exclude current/already-followed users and sort by follower count desc
- discovery feed includes own posts plus followed-user posts newest-first

- [ ] **Step 3: Wire notification creation into existing services**

Update:
- `ProfileService.followUser(...)` to create follow notification
- `PostService.likePost(...)` to create like notification when a new like is created
- `PostService.addComment(...)` to create comment notification

- [ ] **Step 4: Run service tests to verify they pass**

Run: `./mvnw -q -Dtest=DiscoveryServiceTest test`
Expected: PASS

## Task 5: Implement the discovery controller

**Files:**
- Create: `src/main/java/com/startuphub/controller/DiscoveryController.java`
- Test: `src/test/java/com/startuphub/controller/DiscoveryControllerTest.java`

- [ ] **Step 1: Implement endpoints**

Add:
- `GET /api/discovery/search/users?q=...`
- `GET /api/discovery/suggestions`
- `GET /api/discovery/feed`
- `GET /api/notifications`
- `PUT /api/notifications/{notificationId}/read`

- [ ] **Step 2: Keep responses JSON-only**

Return DTO lists or DTO payloads aligned with the existing REST JSON pattern.

- [ ] **Step 3: Run controller tests to verify they pass**

Run: `./mvnw -q -Dtest=DiscoveryControllerTest test`
Expected: PASS

## Task 6: Full verification and docs update

**Files:**
- Modify: `tracker.md`
- Modify: `developer.md`

- [ ] **Step 1: Run the full test suite**

Run: `./mvnw test`
Expected: PASS

- [ ] **Step 2: Start the app against MySQL**

Run: `./mvnw spring-boot:run`
Expected: app starts on `8080` and connects to MySQL.

- [ ] **Step 3: Verify the live Phase 4 flow**

Run a sequence like:

```bash
curl -i http://localhost:8080/api/discovery/search/users?q=car \
  -H "Authorization: Bearer <token>"
```

```bash
curl -i http://localhost:8080/api/discovery/suggestions \
  -H "Authorization: Bearer <token>"
```

```bash
curl -i http://localhost:8080/api/discovery/feed \
  -H "Authorization: Bearer <token>"
```

```bash
curl -i http://localhost:8080/api/notifications \
  -H "Authorization: Bearer <token>"
```

```bash
curl -i -X PUT http://localhost:8080/api/notifications/<id>/read \
  -H "Authorization: Bearer <token>"
```

Expected:
- search returns `200`
- suggestions returns `200`
- personalized feed returns `200`
- notifications returns `200`
- mark-read returns `200`

- [ ] **Step 4: Update docs**

Update `tracker.md`:
- mark Phase 4 tasks done

Update `developer.md`:
- final Phase 4 package additions
- Phase 4 endpoint list
- test and curl commands
