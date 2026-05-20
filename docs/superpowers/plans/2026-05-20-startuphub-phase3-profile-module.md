# StartupHub Phase 3 Profile Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Phase 3 profile module with editable user profiles, public profile views, and follower/following relationships.

**Architecture:** Reuse the existing `User` entity for editable profile fields and add a dedicated `UserFollow` join entity for the social graph. Extend the current Spring Boot layered structure with profile DTOs, a follow repository, a profile service, and a profile controller, all using the existing JWT-backed security context for ownership.

**Tech Stack:** Java 17, Spring Boot 3.3.5, Spring Security, Spring Data JPA, Hibernate, MySQL, H2 test profile, JUnit 5, Mockito, MockMvc

---

## File Structure

### Files to modify

- `developer.md` - update Phase 3 architecture and test instructions
- `tracker.md` - mark Phase 3 progress and completion
- `src/main/java/com/startuphub/exception/GlobalExceptionHandler.java` - map bad profile follow attempts if needed through existing JSON error flow

### Files to create

- `src/main/java/com/startuphub/dto/UpdateProfileRequest.java`
- `src/main/java/com/startuphub/dto/ProfileResponse.java`
- `src/main/java/com/startuphub/dto/ProfileSummaryResponse.java`
- `src/main/java/com/startuphub/entity/UserFollow.java`
- `src/main/java/com/startuphub/repository/UserFollowRepository.java`
- `src/main/java/com/startuphub/service/ProfileService.java`
- `src/main/java/com/startuphub/controller/ProfileController.java`
- `src/test/java/com/startuphub/service/ProfileServiceTest.java`
- `src/test/java/com/startuphub/controller/ProfileControllerTest.java`

## Task 1: Define the Phase 3 contract with failing tests

**Files:**
- Create: `src/test/java/com/startuphub/service/ProfileServiceTest.java`
- Create: `src/test/java/com/startuphub/controller/ProfileControllerTest.java`

- [ ] **Step 1: Write the failing service tests**

Add tests for:

```java
@Test
void updateProfileAppliesOnlyProvidedFields() { }

@Test
void followUserReturnsCurrentProfileState() { }

@Test
void followUserDoesNothingWhenAlreadyFollowing() { }

@Test
void listFollowersReturnsProfileSummaries() { }
```

Key assertions:
- nullable update fields leave existing values unchanged
- self-follow is rejected
- duplicate follow does not create duplicate rows
- follower/following lists map user summaries correctly

- [ ] **Step 2: Write the failing controller tests**

Add tests for:

```java
@Test
void getMyProfileReturnsOk() throws Exception { }

@Test
void updateMyProfileReturnsOk() throws Exception { }

@Test
void getPublicProfileReturnsOk() throws Exception { }

@Test
void followUserReturnsOk() throws Exception { }

@Test
void selfFollowReturnsBadRequest() throws Exception { }
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `./mvnw -q -Dtest=ProfileServiceTest,ProfileControllerTest test`
Expected: FAIL because the Phase 3 DTO, entity, repository, service, and controller classes do not exist yet.

## Task 2: Add the follow graph entity and repository

**Files:**
- Create: `src/main/java/com/startuphub/entity/UserFollow.java`
- Create: `src/main/java/com/startuphub/repository/UserFollowRepository.java`
- Test: `src/test/java/com/startuphub/service/ProfileServiceTest.java`

- [ ] **Step 1: Implement the minimal `UserFollow` entity**

Requirements:
- fields: `id`, `follower`, `following`, `createdAt`
- JPA relations to `User`
- unique constraint on `(follower_id, following_id)`
- `@PrePersist` for `createdAt`

- [ ] **Step 2: Implement the repository**

Required methods:

```java
long countByFollowingId(Long userId);
long countByFollowerId(Long userId);
boolean existsByFollowerIdAndFollowingId(Long followerId, Long followingId);
Optional<UserFollow> findByFollowerIdAndFollowingId(Long followerId, Long followingId);
List<UserFollow> findByFollowingId(Long userId);
List<UserFollow> findByFollowerId(Long userId);
```

- [ ] **Step 3: Run service tests to verify they still fail later**

Run: `./mvnw -q -Dtest=ProfileServiceTest test`
Expected: FAIL later because DTOs, service, and controller wiring are still missing.

## Task 3: Add profile DTOs and bad-request handling

**Files:**
- Create: `src/main/java/com/startuphub/dto/UpdateProfileRequest.java`
- Create: `src/main/java/com/startuphub/dto/ProfileResponse.java`
- Create: `src/main/java/com/startuphub/dto/ProfileSummaryResponse.java`
- Modify: `src/main/java/com/startuphub/exception/GlobalExceptionHandler.java`
- Test: `src/test/java/com/startuphub/controller/ProfileControllerTest.java`

- [ ] **Step 1: Implement request validation**

Requirements:
- `name`: nullable, but if non-null must not be blank
- `bio`: nullable, max `500`
- `profilePhoto`: nullable plain string

- [ ] **Step 2: Implement response DTOs**

`ProfileResponse` should contain:
- `id`
- `name`
- `email`
- `bio`
- `profilePhoto`
- `role`
- `createdAt`
- `followerCount`
- `followingCount`
- `followedByCurrentUser`

`ProfileSummaryResponse` should contain:
- `id`
- `name`
- `email`
- `bio`
- `profilePhoto`
- `role`

- [ ] **Step 3: Ensure bad-request profile errors stay JSON-only**

Use existing exception handling flow so self-follow or invalid profile operations return clean `400` JSON responses.

- [ ] **Step 4: Run controller tests to verify they still fail later**

Run: `./mvnw -q -Dtest=ProfileControllerTest test`
Expected: FAIL later because the controller and service are still missing.

## Task 4: Implement the profile service with TDD

**Files:**
- Create: `src/main/java/com/startuphub/service/ProfileService.java`
- Test: `src/test/java/com/startuphub/service/ProfileServiceTest.java`

- [ ] **Step 1: Implement service methods**

Required methods:

```java
ProfileResponse getMyProfile();
ProfileResponse updateMyProfile(UpdateProfileRequest request);
ProfileResponse getProfile(Long userId);
ProfileResponse followUser(Long userId);
ProfileResponse unfollowUser(Long userId);
List<ProfileSummaryResponse> getFollowers(Long userId);
List<ProfileSummaryResponse> getFollowing(Long userId);
```

- [ ] **Step 2: Implement service behavior**

Behavior:
- current user resolved from `AuthService`
- target user loaded from `UserRepository` or `ResourceNotFoundException("User not found")`
- self-follow rejected with `IllegalArgumentException("You cannot follow yourself")`
- follow/unfollow idempotent
- nullable update fields leave existing values unchanged

- [ ] **Step 3: Implement response mapping**

Map `User` and follow graph state into:
- `ProfileResponse`
- `ProfileSummaryResponse`

`ProfileResponse` must include `followerCount`, `followingCount`, and `followedByCurrentUser`.

- [ ] **Step 4: Run service tests to verify they pass**

Run: `./mvnw -q -Dtest=ProfileServiceTest test`
Expected: PASS

## Task 5: Implement the profile controller

**Files:**
- Create: `src/main/java/com/startuphub/controller/ProfileController.java`
- Test: `src/test/java/com/startuphub/controller/ProfileControllerTest.java`

- [ ] **Step 1: Implement endpoints**

Add:
- `GET /api/profile/me`
- `PUT /api/profile/me`
- `GET /api/profile/{userId}`
- `POST /api/profile/{userId}/follow`
- `DELETE /api/profile/{userId}/follow`
- `GET /api/profile/{userId}/followers`
- `GET /api/profile/{userId}/following`

- [ ] **Step 2: Ensure validation and JSON-only responses**

Use `@Valid` on `PUT /api/profile/me` and keep controller returns aligned with the existing REST JSON pattern.

- [ ] **Step 3: Run controller tests to verify they pass**

Run: `./mvnw -q -Dtest=ProfileControllerTest test`
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

- [ ] **Step 3: Verify the live Phase 3 flow**

Run a sequence like:

```bash
curl -i -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Carol","email":"carol.phase3@example.com","password":"password123"}'
```

```bash
curl -i -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Dave","email":"dave.phase3@example.com","password":"password123"}'
```

```bash
curl -i -X PUT http://localhost:8080/api/profile/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <carol-token>" \
  -d '{"bio":"Founder building in public","profilePhoto":"https://example.com/carol.png"}'
```

```bash
curl -i -X POST http://localhost:8080/api/profile/<dave-id>/follow \
  -H "Authorization: Bearer <carol-token>"
```

```bash
curl -i http://localhost:8080/api/profile/<dave-id> \
  -H "Authorization: Bearer <carol-token>"
```

```bash
curl -i http://localhost:8080/api/profile/<dave-id>/followers \
  -H "Authorization: Bearer <dave-token>"
```

Expected:
- profile update returns `200`
- follow returns `200`
- public profile returns `200`
- followers list returns `200`

- [ ] **Step 4: Update docs**

Update `tracker.md`:
- mark Phase 3 tasks done
- keep Phase 4 TODO items visible

Update `developer.md`:
- final Phase 3 package additions
- Phase 3 endpoint list
- test and curl commands
