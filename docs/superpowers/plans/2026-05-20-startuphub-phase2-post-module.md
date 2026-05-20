# StartupHub Phase 2 Post Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Phase 2 social module with posts, global feed retrieval, likes, comments, and authenticated ownership behavior.

**Architecture:** Extend the current Spring Boot layered structure with `Post`, `Comment`, and `PostLike` entities plus dedicated repositories, DTOs, services, and controllers. Use the existing JWT-backed security context to resolve the acting user, and keep responses JSON-only with the current global exception handler.

**Tech Stack:** Java 17, Spring Boot 3.3.5, Spring Security, Spring Data JPA, Hibernate, MySQL, H2 test profile, JUnit 5, Mockito, MockMvc

---

## File Structure

### Files to modify

- `developer.md` - update Phase 2 architecture and test instructions
- `tracker.md` - mark Phase 2 progress and completion
- `src/main/java/com/startuphub/service/AuthService.java` - expose a reusable current-domain-user helper
- `src/main/java/com/startuphub/exception/GlobalExceptionHandler.java` - add `404` handling for missing resources

### Files to create

- `src/main/java/com/startuphub/dto/CreatePostRequest.java`
- `src/main/java/com/startuphub/dto/CreateCommentRequest.java`
- `src/main/java/com/startuphub/dto/AuthorSummaryResponse.java`
- `src/main/java/com/startuphub/dto/PostResponse.java`
- `src/main/java/com/startuphub/dto/CommentResponse.java`
- `src/main/java/com/startuphub/entity/Post.java`
- `src/main/java/com/startuphub/entity/Comment.java`
- `src/main/java/com/startuphub/entity/PostLike.java`
- `src/main/java/com/startuphub/exception/ResourceNotFoundException.java`
- `src/main/java/com/startuphub/repository/PostRepository.java`
- `src/main/java/com/startuphub/repository/CommentRepository.java`
- `src/main/java/com/startuphub/repository/PostLikeRepository.java`
- `src/main/java/com/startuphub/service/PostService.java`
- `src/main/java/com/startuphub/controller/PostController.java`
- `src/test/java/com/startuphub/service/PostServiceTest.java`
- `src/test/java/com/startuphub/controller/PostControllerTest.java`

## Task 1: Define the Phase 2 API contract with failing tests

**Files:**
- Create: `src/test/java/com/startuphub/service/PostServiceTest.java`
- Create: `src/test/java/com/startuphub/controller/PostControllerTest.java`

- [ ] **Step 1: Write the failing service tests**

Add tests for:

```java
@Test
void createPostCreatesPostForCurrentUser() { }

@Test
void likePostReturnsCurrentStateWhenAlreadyLiked() { }

@Test
void addCommentCreatesCommentForCurrentUser() { }

@Test
void getFeedReturnsNewestFirst() { }
```

Key assertions:
- created post belongs to authenticated user
- duplicate likes do not create duplicate rows
- comment is tied to the requested post and current user
- feed ordering is newest-first

- [ ] **Step 2: Write the failing controller tests**

Add tests for:

```java
@Test
void createPostReturnsCreatedResponse() throws Exception { }

@Test
void getFeedReturnsOk() throws Exception { }

@Test
void likePostReturnsOk() throws Exception { }

@Test
void createCommentReturnsCreatedResponse() throws Exception { }

@Test
void missingPostReturnsNotFound() throws Exception { }
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `./mvnw -q -Dtest=PostServiceTest,PostControllerTest test`
Expected: FAIL because the Phase 2 DTO, entity, service, repository, controller, and exception classes do not exist yet.

## Task 2: Add the post domain model and repositories

**Files:**
- Create: `src/main/java/com/startuphub/entity/Post.java`
- Create: `src/main/java/com/startuphub/entity/Comment.java`
- Create: `src/main/java/com/startuphub/entity/PostLike.java`
- Create: `src/main/java/com/startuphub/repository/PostRepository.java`
- Create: `src/main/java/com/startuphub/repository/CommentRepository.java`
- Create: `src/main/java/com/startuphub/repository/PostLikeRepository.java`
- Test: `src/test/java/com/startuphub/service/PostServiceTest.java`

- [ ] **Step 1: Implement the minimal entities**

Requirements:
- `Post` with `id`, `content`, `imageUrl`, `author`, `createdAt`
- `Comment` with `id`, `content`, `post`, `author`, `createdAt`
- `PostLike` with `id`, `post`, `user`, `createdAt`
- use JPA relations to `User`
- enforce unique constraint on `post_id` + `user_id` for likes
- set `createdAt` with `@PrePersist`
- cascade comments and likes from post

- [ ] **Step 2: Implement the repositories**

Required methods:

```java
List<Post> findAllByOrderByCreatedAtDesc();
List<Comment> findByPostIdOrderByCreatedAtAsc(Long postId);
long countByPostId(Long postId);
long countByPostId(Long postId);
boolean existsByPostIdAndUserId(Long postId, Long userId);
Optional<PostLike> findByPostIdAndUserId(Long postId, Long userId);
```

- [ ] **Step 3: Run service tests to verify they still fail later**

Run: `./mvnw -q -Dtest=PostServiceTest test`
Expected: FAIL later because DTOs, service, and current-user wiring are still missing.

## Task 3: Add DTOs and not-found exception

**Files:**
- Create: `src/main/java/com/startuphub/dto/CreatePostRequest.java`
- Create: `src/main/java/com/startuphub/dto/CreateCommentRequest.java`
- Create: `src/main/java/com/startuphub/dto/AuthorSummaryResponse.java`
- Create: `src/main/java/com/startuphub/dto/PostResponse.java`
- Create: `src/main/java/com/startuphub/dto/CommentResponse.java`
- Create: `src/main/java/com/startuphub/exception/ResourceNotFoundException.java`
- Modify: `src/main/java/com/startuphub/exception/GlobalExceptionHandler.java`
- Test: `src/test/java/com/startuphub/controller/PostControllerTest.java`

- [ ] **Step 1: Implement request DTO validation**

Requirements:
- `CreatePostRequest.content`: `@NotBlank`, `@Size(max = 2000)`
- `CreateCommentRequest.content`: `@NotBlank`, `@Size(max = 500)`
- `imageUrl`: nullable string

- [ ] **Step 2: Implement response DTOs**

`AuthorSummaryResponse` should contain:
- `id`
- `name`
- `email`
- `profilePhoto`
- `role`

`PostResponse` should contain:
- `id`
- `content`
- `imageUrl`
- `createdAt`
- `author`
- `likeCount`
- `commentCount`
- `likedByCurrentUser`

`CommentResponse` should contain:
- `id`
- `content`
- `createdAt`
- `author`
- `postId`

- [ ] **Step 3: Add `404` exception handling**

Add `ResourceNotFoundException` and map it to `404 Not Found` in `GlobalExceptionHandler`.

- [ ] **Step 4: Run controller tests to verify they still fail later**

Run: `./mvnw -q -Dtest=PostControllerTest test`
Expected: FAIL later because the controller and service are still missing.

## Task 4: Implement the post service with TDD

**Files:**
- Create: `src/main/java/com/startuphub/service/PostService.java`
- Modify: `src/main/java/com/startuphub/service/AuthService.java`
- Test: `src/test/java/com/startuphub/service/PostServiceTest.java`

- [ ] **Step 1: Implement current-user domain lookup**

Add a helper on `AuthService`:

```java
public User getCurrentAuthenticatedUser()
```

It should return the full domain `User` from `CustomUserDetails`, and keep existing `getCurrentUser()` behavior intact.

- [ ] **Step 2: Implement `PostService` methods**

Required methods:

```java
PostResponse createPost(CreatePostRequest request);
List<PostResponse> getFeed();
PostResponse getPost(Long postId);
PostResponse likePost(Long postId);
PostResponse unlikePost(Long postId);
CommentResponse addComment(Long postId, CreateCommentRequest request);
List<CommentResponse> getComments(Long postId);
```

Behavior:
- resolve current authenticated user via `AuthService`
- load post or throw `ResourceNotFoundException("Post not found")`
- like operations are idempotent
- feed ordered newest-first
- comment list ordered oldest-first

- [ ] **Step 3: Implement response mapping**

Map entity data into:
- `AuthorSummaryResponse`
- `PostResponse` with live `likeCount`, `commentCount`, `likedByCurrentUser`
- `CommentResponse`

- [ ] **Step 4: Run service tests to verify they pass**

Run: `./mvnw -q -Dtest=PostServiceTest test`
Expected: PASS

## Task 5: Implement the post controller

**Files:**
- Create: `src/main/java/com/startuphub/controller/PostController.java`
- Test: `src/test/java/com/startuphub/controller/PostControllerTest.java`

- [ ] **Step 1: Implement endpoints**

Add:
- `POST /api/posts`
- `GET /api/posts`
- `GET /api/posts/{postId}`
- `POST /api/posts/{postId}/likes`
- `DELETE /api/posts/{postId}/likes`
- `POST /api/posts/{postId}/comments`
- `GET /api/posts/{postId}/comments`

Status rules:
- create post -> `201`
- add comment -> `201`
- all reads and likes/unlikes -> `200`

- [ ] **Step 2: Ensure validation and JSON-only responses**

Use `@Valid` on request bodies and keep controller return types aligned with the existing JSON REST pattern.

- [ ] **Step 3: Run controller tests to verify they pass**

Run: `./mvnw -q -Dtest=PostControllerTest test`
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

- [ ] **Step 3: Verify the live Phase 2 flow**

Run a sequence like:

```bash
curl -i -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Bob","email":"bob.phase2@example.com","password":"password123"}'
```

```bash
curl -i -X POST http://localhost:8080/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"content":"First startup update","imageUrl":null}'
```

```bash
curl -i http://localhost:8080/api/posts \
  -H "Authorization: Bearer <token>"
```

```bash
curl -i -X POST http://localhost:8080/api/posts/1/likes \
  -H "Authorization: Bearer <token>"
```

```bash
curl -i -X POST http://localhost:8080/api/posts/1/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"content":"Looks good"}'
```

Expected:
- post creation returns `201`
- feed returns `200`
- like returns `200`
- comment creation returns `201`

- [ ] **Step 4: Update docs**

Update `tracker.md`:
- mark Phase 2 tasks done
- list remaining Phase 3 TODO items

Update `developer.md`:
- final Phase 2 package additions
- Phase 2 endpoint list
- test and curl commands
