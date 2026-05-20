# StartupHub Phase 3 Profile Module Design

## Scope

This design covers the Phase 3 profile and relationship slice:

- view the current authenticated profile
- update the current authenticated profile
- view any public user profile
- follow a user
- unfollow a user
- list followers
- list following

This phase excludes follower-based feed filtering, profile privacy modes, username handles, media upload infrastructure, and notifications.

## Recommended Approach

Extend the existing user model with a follower graph rather than introducing a separate profile aggregate.

Why this approach:

- the `User` entity already owns the editable profile fields needed for this phase
- it avoids duplicating identity and profile data
- it keeps follow relationships isolated in a single join entity
- it produces a complete social identity layer that fits the existing auth and post modules

## Architecture

The module will follow the existing layered structure:

- `controller`: profile and follow endpoints
- `service`: profile update logic, public profile assembly, and follow/unfollow behavior
- `repository`: JPA access for users and follow relationships
- `entity`: existing `User` plus new `UserFollow`
- `dto`: profile update and profile response payloads

Authenticated ownership will always come from the JWT principal already set in the `SecurityContext`.

## Data Model

### User

The existing `User` entity will continue to own:

- `name`
- `bio`
- `profilePhoto`
- `role`
- `createdAt`

No new profile table is needed for this phase.

### UserFollow

- `id: Long`
- `follower: User`
- `following: User`
- `createdAt: LocalDateTime`

Behavior:

- one row per `(follower, following)` pair
- unique constraint on `(follower_id, following_id)`
- self-follow is rejected at the service layer

## Validation Rules

- `name`: optional in update requests, but if supplied must be non-blank
- `bio`: optional, max `500` characters
- `profilePhoto`: optional plain string URL/path

## API Contract

### GET `/api/profile/me`

Returns the current authenticated user profile.

Response:

- `200 OK`
- `ProfileResponse`

### PUT `/api/profile/me`

Updates the current authenticated user profile.

Request body:

- `name`
- `bio`
- `profilePhoto`

Behavior:

- null fields mean leave the existing value unchanged
- non-null `name` must not be blank

Response:

- `200 OK`
- updated `ProfileResponse`

### GET `/api/profile/{userId}`

Returns the public profile for a user id.

Response:

- `200 OK`
- `ProfileResponse`
- `404 Not Found` if the user does not exist

### POST `/api/profile/{userId}/follow`

Follows the target user from the current authenticated user.

Behavior:

- idempotent if already following
- rejects self-follow with `400`

Response:

- `200 OK`
- target user `ProfileResponse`

### DELETE `/api/profile/{userId}/follow`

Unfollows the target user from the current authenticated user.

Behavior:

- idempotent if not currently following

Response:

- `200 OK`
- target user `ProfileResponse`

### GET `/api/profile/{userId}/followers`

Returns the follower list for the target user.

Response:

- `200 OK`
- list of `ProfileSummaryResponse`

### GET `/api/profile/{userId}/following`

Returns the users followed by the target user.

Response:

- `200 OK`
- list of `ProfileSummaryResponse`

## Response Design

### ProfileResponse

Will include:

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

### ProfileSummaryResponse

Will include:

- `id`
- `name`
- `email`
- `bio`
- `profilePhoto`
- `role`

## Error Handling

The existing JSON error structure remains in place.

Handled cases for this phase:

- invalid profile update payloads -> `400`
- missing user -> `404`
- self-follow attempt -> `400`
- unauthorized requests -> `401`
- generic unexpected failures -> `500`

## Testing Strategy

Automated verification:

- service tests for profile update, follow/unfollow behavior, and follower/following retrieval
- controller tests for endpoint status codes and JSON payload shape
- full Maven test run

Runtime verification:

- start the app against MySQL
- register two users
- update one profile
- follow/unfollow between users
- fetch public profile, followers, and following with `curl`

## Risks and Decisions

- storing `profilePhoto` as a plain string keeps Phase 3 focused on profile behavior rather than file storage
- using nullable update fields reduces endpoint count and keeps the client contract small
- no git repository exists in this workspace, so this spec cannot be committed here
