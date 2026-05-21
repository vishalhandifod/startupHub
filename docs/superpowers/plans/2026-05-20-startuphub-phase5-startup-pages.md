# StartupHub Phase 5 Startup Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build startup/company pages as a first-class module with owner-managed profiles, public listing and detail views, and idempotent follow and unfollow behavior.

**Architecture:** Add a dedicated `Startup` entity plus a `StartupFollow` join entity, then expose startup CRUD-lite and follow APIs through a new controller and service. Reuse the existing JWT-backed current-user resolution, author summary pattern, global JSON error handling, and Spring Data repositories.

**Tech Stack:** Java 17, Spring Boot 3.3.5, Spring Security, Spring Data JPA, Hibernate, MySQL, H2 test profile, JUnit 5, Mockito, MockMvc

---

## File Structure

### Files to modify

- `developer.md` - record final Phase 5 architecture and testing instructions
- `tracker.md` - mark the startup-pages work done and keep later phases as TODO
- `src/main/java/com/startuphub/exception/GlobalExceptionHandler.java` - add explicit forbidden handling if needed

### Files to create

- `src/main/java/com/startuphub/entity/Startup.java`
- `src/main/java/com/startuphub/entity/StartupFollow.java`
- `src/main/java/com/startuphub/dto/CreateStartupRequest.java`
- `src/main/java/com/startuphub/dto/UpdateStartupRequest.java`
- `src/main/java/com/startuphub/dto/StartupResponse.java`
- `src/main/java/com/startuphub/dto/StartupSummaryResponse.java`
- `src/main/java/com/startuphub/repository/StartupRepository.java`
- `src/main/java/com/startuphub/repository/StartupFollowRepository.java`
- `src/main/java/com/startuphub/service/StartupService.java`
- `src/main/java/com/startuphub/controller/StartupController.java`
- `src/test/java/com/startuphub/service/StartupServiceTest.java`
- `src/test/java/com/startuphub/controller/StartupControllerTest.java`

## Task 1: Define the Phase 5 contract with failing tests

**Files:**
- Create: `src/test/java/com/startuphub/service/StartupServiceTest.java`
- Create: `src/test/java/com/startuphub/controller/StartupControllerTest.java`

- [ ] **Step 1: Write the failing service tests**

Add tests for:

```java
@Test
void createStartupCreatesOwnedStartup() { }

@Test
void updateStartupRejectsNonOwner() { }

@Test
void listStartupsReturnsNewestFirstSummaries() { }

@Test
void followStartupIsIdempotent() { }
```

Key assertions:
- startup is created for the authenticated user
- duplicate or non-owner cases are rejected at the service boundary
- list results are newest-first and include follower counts
- follow returns current state and does not create duplicate `StartupFollow` rows

- [ ] **Step 2: Write the failing controller tests**

Add tests for:

```java
@Test
void createStartupReturnsCreated() throws Exception { }

@Test
void updateStartupReturnsOk() throws Exception { }

@Test
void listStartupsReturnsOk() throws Exception { }

@Test
void getStartupReturnsOk() throws Exception { }

@Test
void followStartupReturnsOk() throws Exception { }

@Test
void nonOwnerUpdateReturnsForbidden() throws Exception { }
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `./mvnw -q -Dtest=StartupServiceTest,StartupControllerTest test`
Expected: FAIL because the startup entities, DTOs, repositories, service, and controller do not exist yet.

## Task 2: Add startup entities and repositories

**Files:**
- Create: `src/main/java/com/startuphub/entity/Startup.java`
- Create: `src/main/java/com/startuphub/entity/StartupFollow.java`
- Create: `src/main/java/com/startuphub/repository/StartupRepository.java`
- Create: `src/main/java/com/startuphub/repository/StartupFollowRepository.java`
- Test: `src/test/java/com/startuphub/service/StartupServiceTest.java`

- [ ] **Step 1: Implement the minimal entities**

Requirements:
- `Startup` fields: `id`, `name`, `slug`, `description`, `logoUrl`, `website`, `industry`, `location`, `owner`, `createdAt`
- `StartupFollow` fields: `id`, `user`, `startup`, `createdAt`
- `slug` unique on `Startup`
- unique `(user_id, startup_id)` on `StartupFollow`
- `@PrePersist` for timestamps

- [ ] **Step 2: Implement the repositories**

Required methods:

```java
Optional<Startup> findBySlug(String slug);
boolean existsBySlug(String slug);
List<Startup> findAllByOrderByCreatedAtDesc();

long countByStartupId(Long startupId);
boolean existsByUserIdAndStartupId(Long userId, Long startupId);
Optional<StartupFollow> findByUserIdAndStartupId(Long userId, Long startupId);
```

- [ ] **Step 3: Run service tests to verify they still fail later**

Run: `./mvnw -q -Dtest=StartupServiceTest test`
Expected: FAIL later because DTOs, mappings, and service logic are still missing.

## Task 3: Add startup DTOs

**Files:**
- Create: `src/main/java/com/startuphub/dto/CreateStartupRequest.java`
- Create: `src/main/java/com/startuphub/dto/UpdateStartupRequest.java`
- Create: `src/main/java/com/startuphub/dto/StartupResponse.java`
- Create: `src/main/java/com/startuphub/dto/StartupSummaryResponse.java`
- Test: `src/test/java/com/startuphub/controller/StartupControllerTest.java`

- [ ] **Step 1: Implement request DTOs**

Requirements:
- `CreateStartupRequest` uses validation annotations for required `name` and `slug`
- `description` length capped at `2000`
- `UpdateStartupRequest` allows nullable fields and keeps `slug` absent

- [ ] **Step 2: Implement response DTOs**

`StartupResponse` should contain:
- `id`
- `name`
- `slug`
- `description`
- `logoUrl`
- `website`
- `industry`
- `location`
- `createdAt`
- `owner`
- `followerCount`
- `followedByCurrentUser`

`StartupSummaryResponse` should contain:
- `id`
- `name`
- `slug`
- `logoUrl`
- `industry`
- `location`
- `createdAt`
- `followerCount`

- [ ] **Step 3: Run controller tests to verify they still fail later**

Run: `./mvnw -q -Dtest=StartupControllerTest test`
Expected: FAIL later because the startup service and controller are still missing.

## Task 4: Implement startup service with TDD

**Files:**
- Create: `src/main/java/com/startuphub/service/StartupService.java`
- Modify: `src/main/java/com/startuphub/exception/GlobalExceptionHandler.java`
- Test: `src/test/java/com/startuphub/service/StartupServiceTest.java`

- [ ] **Step 1: Implement `StartupService`**

Required methods:

```java
StartupResponse createStartup(CreateStartupRequest request);
StartupResponse updateStartup(Long startupId, UpdateStartupRequest request);
StartupResponse getStartup(Long startupId);
List<StartupSummaryResponse> listStartups();
StartupResponse followStartup(Long startupId);
StartupResponse unfollowStartup(Long startupId);
```

Behavior:
- current user resolved from `AuthService`
- create rejects duplicate slug with `DuplicateResourceException`
- update only allowed for the owner; non-owner throws `AccessDeniedException`
- list returns newest-first summaries
- follow and unfollow are idempotent

- [ ] **Step 2: Add owner summary mapping**

Reuse `AuthorSummaryResponse` for the startup owner in `StartupResponse`.

- [ ] **Step 3: Ensure forbidden responses serialize cleanly**

If `AccessDeniedException` is not already converted into the existing JSON error shape, update `GlobalExceptionHandler` to return `403 Forbidden`.

- [ ] **Step 4: Run service tests to verify they pass**

Run: `./mvnw -q -Dtest=StartupServiceTest test`
Expected: PASS

## Task 5: Implement the startup controller

**Files:**
- Create: `src/main/java/com/startuphub/controller/StartupController.java`
- Test: `src/test/java/com/startuphub/controller/StartupControllerTest.java`

- [ ] **Step 1: Implement endpoints**

Add:
- `POST /api/startups`
- `PUT /api/startups/{startupId}`
- `GET /api/startups/{startupId}`
- `GET /api/startups`
- `POST /api/startups/{startupId}/follow`
- `DELETE /api/startups/{startupId}/follow`

- [ ] **Step 2: Keep responses JSON-only**

Use `201 Created` for create, `200 OK` for read/update/follow/unfollow, and align payloads with the startup DTOs.

- [ ] **Step 3: Run controller tests to verify they pass**

Run: `./mvnw -q -Dtest=StartupControllerTest test`
Expected: PASS

## Task 6: Full verification and docs update

**Files:**
- Modify: `tracker.md`
- Modify: `developer.md`

- [ ] **Step 1: Run the full test suite**

Run: `./mvnw test`
Expected: PASS

- [ ] **Step 2: Update tracker**

Mark the startup-page item done and keep direct messaging, media uploads, and frontend as remaining TODO items.

- [ ] **Step 3: Update developer context**

Document:
- final startup package additions
- startup ownership and follow decisions
- curl commands for create, list, update, follow, and unfollow

- [ ] **Step 4: Optional live verification**

Run the app and verify:
- create startup with owner token
- list startups
- fetch a startup
- update startup as owner
- attempt update as non-owner and verify `403`
- follow and unfollow startup from another user

## Self-Review

Spec coverage check:
- startup create, update, public fetch, list, follow, and unfollow are covered in Tasks 1, 4, and 5
- single-owner authorization and stable slug behavior are covered in Task 4
- validation and error codes are covered in Tasks 3, 4, and 5
- docs and verification are covered in Task 6

Placeholder scan:
- no `TODO`, `TBD`, or undefined implementation steps are left in the plan body

Type consistency:
- `StartupResponse`, `StartupSummaryResponse`, `CreateStartupRequest`, `UpdateStartupRequest`, and the `StartupService` method names are used consistently across tasks
