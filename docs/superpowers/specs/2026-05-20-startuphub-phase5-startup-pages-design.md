# StartupHub Phase 5 Startup Pages Design

## Scope

This design covers the next backend slice for StartupHub:

- create startup/company pages separate from user profiles
- update startup/company pages by the owner
- view public startup pages
- list startup pages
- follow and unfollow startup pages

This phase excludes team-member management, startup messaging, media upload pipelines, frontend rendering, and startup search filters.

## Recommended Approach

Build a dedicated `Startup` module with a single owner user and a separate `StartupFollow` relationship.

Why this approach:

- it adds a true company identity layer instead of overloading user profiles
- it keeps authorization simple by reusing the current owner-based JWT model
- it leaves a clean path to multi-admin startups in a later phase
- it gives the frontend a stable startup-specific API contract before media uploads and UI work begin

## Architecture

The module will follow the existing layered structure:

- `controller`: startup create, update, view, list, follow, and unfollow endpoints
- `service`: startup ownership checks, mapping, listing, and follow lifecycle
- `repository`: JPA access for startups and startup follows
- `entity`: new `Startup` and `StartupFollow`
- `dto`: create, update, full response, and summary response payloads

Authenticated ownership and follow state will always come from the current JWT principal.

## Data Model

### Startup

- `id: Long`
- `name: String`
- `slug: String`
- `description: String`
- `logoUrl: String nullable`
- `website: String nullable`
- `industry: String nullable`
- `location: String nullable`
- `owner: User`
- `createdAt: LocalDateTime`

Behavior:

- `slug` is unique
- `slug` is stable after creation in this phase
- one owner user manages the startup
- one user may own multiple startups if needed

### StartupFollow

- `id: Long`
- `user: User`
- `startup: Startup`
- `createdAt: LocalDateTime`

Behavior:

- unique pair on `(user_id, startup_id)`
- supports idempotent follow and unfollow behavior

## Rules and Validation

### Create

- `name` is required
- `slug` is required
- `description` max length is `2000`
- `slug` must be unique

### Update

- only the owner may update the startup
- nullable request fields mean "leave unchanged"
- `slug` is not editable in this phase

### Follow and Unfollow

- authenticated user may follow any startup
- follow is idempotent
- unfollow is idempotent

## API Contract

### POST `/api/startups`

Creates a startup page owned by the current user.

Response:

- `201 Created`
- `StartupResponse`

### PUT `/api/startups/{startupId}`

Updates an owned startup page.

Response:

- `200 OK`
- `StartupResponse`

### GET `/api/startups/{startupId}`

Returns a public startup page.

Response:

- `200 OK`
- `StartupResponse`

### GET `/api/startups`

Returns all startup pages newest-first.

Response:

- `200 OK`
- list of `StartupSummaryResponse`

### POST `/api/startups/{startupId}/follow`

Follows a startup page.

Response:

- `200 OK`
- `StartupResponse`

### DELETE `/api/startups/{startupId}/follow`

Unfollows a startup page.

Response:

- `200 OK`
- `StartupResponse`

## Response Design

### CreateStartupRequest

Will include:

- `name`
- `slug`
- `description`
- `logoUrl`
- `website`
- `industry`
- `location`

### UpdateStartupRequest

Will include:

- `name nullable`
- `description nullable`
- `logoUrl nullable`
- `website nullable`
- `industry nullable`
- `location nullable`

### StartupResponse

Will include:

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

### StartupSummaryResponse

Will include:

- `id`
- `name`
- `slug`
- `logoUrl`
- `industry`
- `location`
- `createdAt`
- `followerCount`

## Error Handling

The existing JSON error contract remains in place.

Handled cases for this phase:

- duplicate slug -> `409`
- startup not found -> `404`
- non-owner update attempt -> `403`
- invalid request payload -> `400`
- unauthorized request -> `401`

## Testing Strategy

Automated verification:

- service tests for startup creation, owner-only updates, listing, and idempotent follow behavior
- controller tests for create, update, list, public fetch, follow, unfollow, and ownership enforcement
- full Maven test run

Runtime verification:

- start the app against MySQL
- register at least two users
- create a startup with one user
- verify public fetch and listing
- verify owner update succeeds and non-owner update fails
- verify follow and unfollow behavior with `curl`

## Risks and Decisions

- single-owner authorization is intentionally chosen to keep the phase bounded
- stable slugs avoid URL and identity churn in the first startup-page release
- no git repository exists in this workspace, so this spec cannot be committed here
