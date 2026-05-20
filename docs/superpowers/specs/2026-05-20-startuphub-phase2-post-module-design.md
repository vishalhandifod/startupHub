# StartupHub Phase 2 Post Module Design

## Scope

This design covers the Phase 2 social interaction slice:

- create posts
- list the global feed
- fetch a single post
- like and unlike posts
- add comments
- list comments for a post
- enforce authenticated ownership from the JWT principal

This phase excludes profile relationships, follower-based feeds, post editing, post deletion, media upload handling, and notifications.

## Recommended Approach

Implement posts, likes, and comments together as one bounded module.

Why this approach:

- it creates a complete and testable social interaction workflow
- it avoids near-term schema churn from splitting comments into a later phase
- it fits the current auth model cleanly without redesigning security
- it keeps the API simple enough for direct end-to-end manual testing

## Architecture

The module will follow the existing layered structure:

- `controller`: HTTP endpoints for posts, likes, and comments
- `service`: ownership-aware business logic, feed ordering, and response mapping
- `repository`: JPA access for posts, comments, and likes
- `entity`: `Post`, `Comment`, and `PostLike`
- `dto`: request and response payloads for post and comment workflows

The authenticated user will always come from the `SecurityContext` populated by the JWT filter. No post or comment endpoint will accept user ids from the client.

## Data Model

### Post

- `id: Long`
- `content: String`
- `imageUrl: String nullable`
- `author: User`
- `createdAt: LocalDateTime`

Behavior:

- belongs to one user
- ordered newest-first in feed responses
- cascades comments and likes on delete

### Comment

- `id: Long`
- `content: String`
- `post: Post`
- `author: User`
- `createdAt: LocalDateTime`

Behavior:

- belongs to one post
- belongs to one user
- ordered oldest-first within a post thread unless changed later

### PostLike

- `id: Long`
- `post: Post`
- `user: User`
- `createdAt: LocalDateTime`

Behavior:

- one row per `(post, user)` pair
- unique constraint on `(post_id, user_id)`
- used to compute `likedByCurrentUser` and `likeCount`

## Validation Rules

- post content: required, non-blank, max `2000` characters
- comment content: required, non-blank, max `500` characters
- image URL: optional plain string for this phase

## API Contract

### POST `/api/posts`

Creates a post for the current authenticated user.

Request body:

- `content`
- `imageUrl`

Response:

- `201 Created`
- `PostResponse`

### GET `/api/posts`

Returns the global feed ordered by newest first.

Response:

- `200 OK`
- list of `PostResponse`

### GET `/api/posts/{postId}`

Returns one post by id.

Response:

- `200 OK`
- `PostResponse`
- `404 Not Found` if the post does not exist

### POST `/api/posts/{postId}/likes`

Likes a post for the current user.

Behavior:

- if not yet liked, create the like
- if already liked, do not create a duplicate
- always return the current post state

Response:

- `200 OK`
- `PostResponse`

### DELETE `/api/posts/{postId}/likes`

Unlikes a post for the current user.

Behavior:

- if liked, remove the like
- if not liked, still return the current post state

Response:

- `200 OK`
- `PostResponse`

### POST `/api/posts/{postId}/comments`

Adds a comment to a post for the current user.

Request body:

- `content`

Response:

- `201 Created`
- `CommentResponse`

### GET `/api/posts/{postId}/comments`

Returns comments for a single post.

Response:

- `200 OK`
- list of `CommentResponse`

## Response Design

### PostResponse

Will include:

- `id`
- `content`
- `imageUrl`
- `createdAt`
- `author`
- `likeCount`
- `commentCount`
- `likedByCurrentUser`

### Author Summary

Embed a lightweight user summary in post and comment responses:

- `id`
- `name`
- `email`
- `profilePhoto`
- `role`

### CommentResponse

Will include:

- `id`
- `content`
- `createdAt`
- `author`
- `postId`

## Error Handling

The existing JSON error structure remains in place:

```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Post not found",
  "path": "/api/posts/99"
}
```

Handled cases for this phase:

- invalid post/comment payloads -> `400`
- missing post -> `404`
- unauthorized requests -> `401`
- generic unexpected failures -> `500`

## Testing Strategy

Automated verification:

- service tests for create post, like/unlike behavior, comment creation, and feed ordering
- controller tests for endpoint status codes and JSON payload structure
- full Maven test run

Runtime verification:

- start the app against MySQL
- create a user and token through Phase 1 auth
- create posts, like/unlike them, add comments, and fetch the feed with `curl`

## Risks and Decisions

- using a global feed now avoids blocking on follower relationships
- storing `imageUrl` as a plain string keeps Phase 2 focused on API behavior rather than file upload infrastructure
- likes are intentionally idempotent to simplify client behavior and retries
- no git repository exists in this workspace, so this spec cannot be committed here
