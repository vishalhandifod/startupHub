# StartupHub Phase 6 Frontend Web App Design

## Scope

This design covers the first full frontend product slice for StartupHub:

- landing and authentication web experience
- multi-page web UI for feed, discovery, profile, startups, and notifications
- `HttpOnly` JWT cookie-based browser auth
- media upload support for post images, profile photos, and startup logos

This phase excludes direct messaging, real-time updates, advanced file storage providers, and admin tooling.

## Recommended Approach

Build a multi-page Spring Boot web application on top of the existing REST APIs and domain model.

Why this approach:

- it reuses the APIs already built instead of introducing a second business layer
- it fits the current Spring Boot stack without adding a separate frontend build system
- it allows an attractive, responsive UI to ship quickly with templates, Bootstrap 5, and custom styling
- it keeps direct messaging out of the same phase so the app can be completed cleanly

## Architecture

The frontend layer will introduce:

- page controllers for web routes
- HTML templates for screen rendering
- static CSS and JavaScript assets
- cookie-aware auth support
- upload endpoints and local file storage support

The backend keeps the existing REST modules:

- auth
- posts
- profiles
- discovery and notifications
- startups

Frontend JavaScript will call existing REST APIs with `credentials: "include"` so the browser sends the auth cookie automatically.

## Authentication Design

The browser flow will use a JWT stored in an `HttpOnly` cookie.

Behavior:

- login and register set the auth cookie
- logout clears the auth cookie
- API endpoints can authenticate from either:
  - bearer token header
  - auth cookie

This keeps API clients compatible while allowing a production-like browser experience.

## Web Routes

Planned page routes:

- `GET /` -> landing page with auth entry points
- `GET /app/feed` -> authenticated feed screen
- `GET /app/discovery` -> authenticated discovery screen
- `GET /app/profile` -> authenticated profile screen
- `GET /app/startups` -> authenticated startup list
- `GET /app/startups/{startupId}` -> authenticated startup detail
- `GET /app/notifications` -> authenticated notifications screen

Optional convenience routes may redirect unauthenticated users back to `/`.

## Media Upload Design

Uploads in this phase will be stored locally on disk under an application-managed upload directory.

Supported uploads:

- post image
- profile photo
- startup logo

Behavior:

- uploaded files are stored with generated unique names
- API returns the public path string used by existing entities
- the application serves uploaded files through Spring resource mapping

This phase prioritizes a complete local app experience over cloud/object storage integration.

## UI Direction

The interface should feel like a polished founder network product:

- modern typography
- layered backgrounds and gradients
- responsive app shell
- intentional spacing and hierarchy
- visually distinct cards for posts, people, and startups

The design should avoid a generic Bootstrap admin look. Bootstrap will provide layout primitives, while custom CSS defines the visual identity.

## Screen Design

### Landing and Auth

- split hero layout or bold single-column intro
- app positioning for founders, startups, and investors
- register and login forms with inline validation feedback

### Feed

- post composer with image upload preview
- card-based feed items
- like and comment actions

### Discovery

- user search
- suggestions
- personalized feed entry points

### Profile

- profile summary card
- editable bio and profile image
- follower and following panels

### Startups

- startup listing grid
- startup detail profile
- owner edit controls
- follow button and follower count

### Notifications

- readable activity list
- read-state handling

## API and Backend Changes

Phase 6 will add:

- cookie-capable auth support
- logout endpoint
- upload endpoints
- static/resource mapping for uploaded files
- page controllers for template rendering

The existing JSON APIs remain in place.

## Error Handling

The app should support:

- JSON errors for API routes
- simple redirect or guarded-page behavior for browser routes
- upload validation failures with readable UI feedback

## Testing Strategy

Automated verification:

- controller tests for web page routes
- service and controller tests for upload handling
- auth tests updated for cookie-aware behavior
- full Maven test run

Runtime verification:

- start the app against MySQL
- register and log in through the browser flow
- create posts with images
- update profile photo
- create and edit startups with logo uploads
- verify responsive navigation and authenticated page access

## Risks and Decisions

- local disk storage is acceptable for this phase because the goal is a directly testable complete app
- `HttpOnly` cookie auth is chosen over `localStorage` for better browser security
- direct messaging is intentionally deferred because it is a separate subsystem with significant product and data-model scope
- no git repository exists in this workspace, so this spec cannot be committed here
