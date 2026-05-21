# StartupHub Phase 4 Discovery Module Design

## Scope

This design covers the Phase 4 discovery and engagement slice:

- search users by name or email
- suggest connections
- provide a personalized discovery feed
- provide a notification feed
- mark notifications as read

This phase excludes advanced search filters, unread counters, push delivery, follower-based ranking, and media/content moderation workflows.

## Recommended Approach

Build a single discovery module that reuses the existing user, follow, post, like, and comment graph, plus a new notification entity.

Why this approach:

- it gives the app meaningful retention features after auth, posts, and profiles
- it avoids inventing parallel feed or notification data models
- it keeps the client contract compact by reusing `PostResponse`
- it fits naturally into the current layered Spring Boot architecture

## Architecture

The module will follow the existing layered structure:

- `controller`: discovery and notification endpoints
- `service`: search logic, suggestion logic, personalized feed assembly, notification lifecycle
- `repository`: JPA access for notifications and discovery queries
- `entity`: existing `User`, `Post`, `UserFollow`, `PostLike`, `Comment` plus new `Notification`
- `dto`: search, suggestion, and notification response payloads

Authenticated ownership and personalization will always come from the JWT principal already set in the `SecurityContext`.

## Data Model

### Notification

- `id: Long`
- `recipient: User`
- `actor: User`
- `type: NotificationType`
- `post: Post nullable`
- `message: String`
- `isRead: boolean`
- `createdAt: LocalDateTime`

### NotificationType

- `FOLLOW`
- `POST_LIKE`
- `POST_COMMENT`

Behavior:

- created only when the actor and recipient differ
- stores a human-readable message at creation time
- defaults `isRead` to `false`

## Search and Suggestion Rules

### User Search

- case-insensitive across `name` and `email`
- bounded to top 10 results
- excludes no users by default, but the current user can appear only if matched unless explicitly filtered in implementation

### Suggested Connections

- excludes the current user
- excludes users already followed by the current user
- sorted by follower count descending
- bounded result set for practicality in this phase

## Personalized Feed Rules

The discovery feed should return posts authored by:

- the current user
- users followed by the current user

Ordering:

- newest-first by `createdAt`

Response:

- reuse existing `PostResponse`

## API Contract

### GET `/api/discovery/search/users?q=...`

Searches users by `name` or `email`.

Response:

- `200 OK`
- list of `SearchUserResponse`

### GET `/api/discovery/suggestions`

Returns suggested connections for the current user.

Response:

- `200 OK`
- list of `SuggestedConnectionResponse`

### GET `/api/discovery/feed`

Returns the personalized discovery feed for the current user.

Response:

- `200 OK`
- list of `PostResponse`

### GET `/api/notifications`

Returns the current user’s notifications ordered newest-first.

Response:

- `200 OK`
- list of `NotificationResponse`

### PUT `/api/notifications/{notificationId}/read`

Marks a notification as read for the current user.

Behavior:

- idempotent
- only the recipient may mark it read

Response:

- `200 OK`
- updated `NotificationResponse`

## Response Design

### SearchUserResponse

Will include:

- `id`
- `name`
- `email`
- `bio`
- `profilePhoto`
- `role`
- `followedByCurrentUser`

### SuggestedConnectionResponse

Will include:

- `id`
- `name`
- `email`
- `bio`
- `profilePhoto`
- `role`
- `followerCount`

### NotificationResponse

Will include:

- `id`
- `type`
- `message`
- `isRead`
- `createdAt`
- `actor`
- `postId nullable`

## Notification Creation Rules

Create notifications when:

- a user follows another user
- a user likes a post owned by another user
- a user comments on a post owned by another user

Do not create notifications when:

- the actor and recipient are the same user

## Error Handling

The existing JSON error structure remains in place.

Handled cases for this phase:

- invalid notification ownership -> `404` or `400` depending on lookup strategy
- unauthorized requests -> `401`
- generic unexpected failures -> `500`

## Testing Strategy

Automated verification:

- service tests for search, suggestions, personalized feed, notification creation, and mark-as-read behavior
- controller tests for endpoint status codes and JSON payload structure
- full Maven test run

Runtime verification:

- start the app against MySQL
- register multiple users
- create follow, post, like, and comment activity
- verify search, suggestions, personalized feed, and notifications with `curl`

## Risks and Decisions

- storing notification messages directly favors simplicity over localization flexibility
- follower-count ranking is intentionally simple and deterministic for this phase
- no git repository exists in this workspace, so this spec cannot be committed here
