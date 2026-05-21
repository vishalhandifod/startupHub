# StartupHub Developer Context

## Current Status

- Project root: `/home/parth-bhattad/noteApp/test/startuphub`
- Source root: `/home/parth-bhattad/noteApp/test/startuphub/src`
- Current phase: Phase 7 one-to-one messaging complete
- Git status: no `.git` repository detected in this workspace

## Tech Stack

- Java 17
- Spring Boot 3.3.5
- Spring Security for authentication/authorization
- Spring Data JPA with Hibernate
- MySQL as primary database
- JWT via `io.jsonwebtoken` (`jjwt`)
- Validation via Bean Validation
- API style: REST JSON endpoints
- H2 test profile for deterministic automated tests

## Existing Project Baseline

- `pom.xml` exists at the project root
- Main application class currently exists and will be renamed into the `com.startuphub` package
- Current config is a minimal `application.yaml`; this will be replaced with `application.properties`
- `src/main/resources/static` and `src/main/resources/templates` exist but are not used in Phase 1

## Final Package Structure

- `com.startuphub`
- `com.startuphub.config`
- `com.startuphub.controller`
- `com.startuphub.dto`
- `com.startuphub.entity`
- `com.startuphub.exception`
- `com.startuphub.repository`
- `com.startuphub.security`
- `com.startuphub.service`

Phase 2 additions:

- `PostController`
- `PostService`
- `Post`, `Comment`, `PostLike`
- `PostRepository`, `CommentRepository`, `PostLikeRepository`
- `CreatePostRequest`, `CreateCommentRequest`
- `AuthorSummaryResponse`, `PostResponse`, `CommentResponse`
- `ResourceNotFoundException`

Phase 3 additions:

- `ProfileController`
- `ProfileService`
- `UserFollow`
- `UserFollowRepository`
- `UpdateProfileRequest`
- `ProfileResponse`, `ProfileSummaryResponse`

Phase 4 additions:

- `DiscoveryController`
- `DiscoveryService`
- `NotificationService`
- `Notification`, `NotificationType`
- `NotificationRepository`
- `SearchUserResponse`, `SuggestedConnectionResponse`, `NotificationResponse`

Planned Phase 5 additions:

- `StartupController`
- `StartupService`
- `Startup`, `StartupFollow`
- `StartupRepository`, `StartupFollowRepository`
- `CreateStartupRequest`, `UpdateStartupRequest`
- `StartupResponse`, `StartupSummaryResponse`

Implemented Phase 5 additions:

- `StartupController`
- `StartupService`
- `Startup`, `StartupFollow`
- `StartupRepository`, `StartupFollowRepository`
- `CreateStartupRequest`, `UpdateStartupRequest`
- `StartupResponse`, `StartupSummaryResponse`

Planned Phase 6 additions:

- web page controllers for frontend routes
- HTML templates under `src/main/resources/templates`
- static CSS and JavaScript under `src/main/resources/static`
- cookie-aware auth support
- upload service and upload endpoints
- local file serving configuration for uploaded assets

Implemented Phase 6 additions:

- `WebController`
- `UploadController`
- `FileStorageService`
- `WebMvcConfig`, `WebProperties`
- `UploadResponse`
- HTML templates under `src/main/resources/templates`
- static CSS and JavaScript under `src/main/resources/static`

Planned Phase 7 additions:

- `Conversation`, `Message`
- conversation and message repositories
- messaging service and controller
- messages web route and page JavaScript

Implemented Phase 7 additions:

- `Conversation`, `Message`
- `ConversationRepository`, `MessageRepository`
- `MessagingService`, `MessagingController`
- messages web route and page JavaScript

## Phase 1 Architecture Decisions

- Phase 1 will use stateless JWT authentication
- `/api/auth/register` and `/api/auth/login` will return both JWT metadata and sanitized user details
- `/api/auth/me` will be a protected endpoint backed by the authenticated JWT principal
- Passwords will be stored with BCrypt hashing
- JWT will include `userId`, `email`, and `role` claims
- Global exception handling will keep all API error responses in a consistent JSON shape
- `JwtConfig` is bound from properties to keep token expiry and signing secret centralized
- `CustomUserDetails` wraps the domain `User` so the security layer stays aligned with JPA data
- `spring-boot-starter-test` plus `spring-security-test` cover auth unit and MVC tests

## Database Configuration Plan

Phase 1 uses MySQL in Docker with the following Spring configuration in `src/main/resources/application.properties`:

- `spring.datasource.url=jdbc:mysql://localhost:3306/startuphub_db`
- `spring.datasource.username=root`
- `spring.datasource.password=StartuphubPass123`
- `spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver`
- `spring.jpa.hibernate.ddl-auto=update`
- `spring.jpa.show-sql=true`
- `spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect`
- `server.port=8080`
- `jwt.secret=StartupHubSuperSecretJWTKey2025XYZ`
- `jwt.expiration=86400000`

## Implemented Phase 1 Features

- User registration endpoint: `POST /api/auth/register`
- User login endpoint: `POST /api/auth/login`
- Protected current-user endpoint: `GET /api/auth/me`
- JWT generation with `userId`, `email`, and `role` claims
- JWT request filter populating the Spring Security context
- Duplicate email handling with `409 Conflict`
- Invalid credential handling with `401 Unauthorized`
- Bean validation on register/login payloads
- Consistent JSON error responses via `@ControllerAdvice`

## Feature Roadmap

### Phase 1

- User registration
- User login
- JWT generation and validation
- Protected current-user endpoint
- Validation and global error handling

### Phase 2

- Post creation
- Feed retrieval
- Like/unlike post
- Comment support
- Post ownership rules

## Phase 2 Design Decisions

- Phase 2 will add a complete post interaction slice: posts, comments, and likes
- Feed scope is global and ordered newest-first by `createdAt`
- Authenticated ownership comes only from the JWT principal
- Likes are API-idempotent for better client behavior
- Post content max length: `2000`
- Comment content max length: `500`
- Post responses will include author summary, like count, comment count, and `likedByCurrentUser`
- Post comments are returned oldest-first
- Likes are backed by a unique `(post_id, user_id)` database constraint

## Implemented Phase 2 Features

- Create post endpoint: `POST /api/posts`
- Global feed endpoint: `GET /api/posts`
- Single post endpoint: `GET /api/posts/{postId}`
- Like post endpoint: `POST /api/posts/{postId}/likes`
- Unlike post endpoint: `DELETE /api/posts/{postId}/likes`
- Create comment endpoint: `POST /api/posts/{postId}/comments`
- List comments endpoint: `GET /api/posts/{postId}/comments`
- Missing post handling via `404 Not Found`
- Ownership derived from the authenticated JWT principal only

### Phase 3

- Profile update
- Profile photo support
- Startup bio/about sections
- Follow/unfollow users or startups

## Phase 3 Design Decisions

- Phase 3 will reuse `User` for editable profile fields instead of creating a separate profile table
- A new `UserFollow` entity will model follower/following relationships
- Profile updates will use a single `PUT /api/profile/me` endpoint with nullable fields treated as no-change
- Follow and unfollow operations will be API-idempotent
- Public profile responses will include follow counts and `followedByCurrentUser`

## Implemented Phase 3 Features

- Current profile endpoint: `GET /api/profile/me`
- Current profile update endpoint: `PUT /api/profile/me`
- Public profile endpoint: `GET /api/profile/{userId}`
- Follow endpoint: `POST /api/profile/{userId}/follow`
- Unfollow endpoint: `DELETE /api/profile/{userId}/follow`
- Followers list endpoint: `GET /api/profile/{userId}/followers`
- Following list endpoint: `GET /api/profile/{userId}/following`
- Self-follow rejection with `400 Bad Request`
- Follower/following counts and `followedByCurrentUser` on profile responses

### Phase 4

- Search and discovery
- Startup directory
- Connection suggestions
- Notifications baseline

### Phase 5

- Startup/company pages separate from user profiles
- Direct messaging or inbox
- Post media upload handling
- Frontend UI with Bootstrap 5

## Phase 4 Design Decisions

- Phase 4 will add a cohesive discovery layer with user search, suggested connections, notifications, and a personalized feed
- Search will be case-insensitive across `name` and `email` with a bounded top-10 result set
- Suggested connections will exclude the current user and already-followed users, and rank by follower count
- Notifications will be created for follow, like, and comment events
- The personalized discovery feed will reuse the existing `PostResponse` shape
- Notification reads are recipient-scoped and idempotent
- Follow, like, and comment notifications are skipped when the actor and recipient are the same user

## Implemented Phase 4 Features

- User search endpoint: `GET /api/discovery/search/users?q=...`
- Suggested connections endpoint: `GET /api/discovery/suggestions`
- Personalized discovery feed endpoint: `GET /api/discovery/feed`
- Notifications list endpoint: `GET /api/notifications`
- Notification read endpoint: `PUT /api/notifications/{notificationId}/read`
- Follow notifications emitted from `ProfileService.followUser(...)`
- Like and comment notifications emitted from `PostService.likePost(...)` and `PostService.addComment(...)`
- Notification payloads include actor summary, read state, type, timestamp, and optional `postId`

## Phase 5 Design Decisions

- Phase 5 starts with startup/company pages as a separate backend module
- A startup has exactly one owner user in this phase
- Startup slugs are unique and stable after creation
- Startup follow and unfollow operations will be idempotent
- Public startup listing will be newest-first

## Implemented Phase 5 Features

- Create startup endpoint: `POST /api/startups`
- Update startup endpoint: `PUT /api/startups/{startupId}`
- Public startup endpoint: `GET /api/startups/{startupId}`
- Startup listing endpoint: `GET /api/startups`
- Follow startup endpoint: `POST /api/startups/{startupId}/follow`
- Unfollow startup endpoint: `DELETE /api/startups/{startupId}/follow`
- Owner-only startup updates enforced with `403 Forbidden`
- Unique stable startup slugs enforced with `409 Conflict`
- Idempotent startup follow and unfollow behavior

## Implemented Phase 6 Features

- Landing/auth web page: `GET /`
- Authenticated feed page: `GET /app/feed`
- Discovery page: `GET /app/discovery`
- Profile page: `GET /app/profile`
- Startup list and startup detail pages: `GET /app/startups`, `GET /app/startups/{startupId}`
- Notifications page: `GET /app/notifications`
- JWT auth cookie set on register and login
- Logout endpoint clearing auth cookie: `POST /api/auth/logout`
- JWT authentication now works from bearer header or auth cookie
- Upload endpoints:
  - `POST /api/uploads/profile-photo`
  - `POST /api/uploads/post-image`
  - `POST /api/uploads/startup-logo`
- Uploaded files are served from the configured local uploads directory

## Implemented Phase 7 Features

- Inbox summaries endpoint: `GET /api/messages/conversations`
- Open conversation endpoint: `GET /api/messages/conversations/{userId}`
- Send message endpoint: `POST /api/messages`
- Inbox page route: `GET /app/messages`
- Lazy one-to-one conversation creation
- Unread counts on conversation summaries
- Read-on-open behavior for incoming messages
- Responsive inbox UI integrated into the existing app shell

## Verification

- `./mvnw test` passes
- `AuthServiceTest` verifies register/login/current-user service behavior
- `PostServiceTest` verifies create post, feed ordering, idempotent likes, and comment creation
- `ProfileServiceTest` verifies partial profile updates, follow idempotency, self-follow rejection, and follower mapping
- `DiscoveryServiceTest` verifies case-insensitive search, suggestion filtering/ranking, personalized feed membership, and notification read behavior
- `StartupServiceTest` verifies startup creation, owner-only updates, newest-first listing, and idempotent follow behavior
- `JwtAuthenticationFilterTest` verifies cookie-based JWT authentication
- `MessagingServiceTest` verifies lazy conversation creation, unread handling, inbox ordering, and self-message rejection
- `AuthControllerTest` verifies register response, duplicate email conflict, and protected `/me`
- `PostControllerTest` verifies create post, feed, like, comment, and missing-post behavior
- `ProfileControllerTest` verifies profile fetch/update, follow, self-follow rejection, and follower list behavior
- `DiscoveryControllerTest` verifies Phase 4 discovery and notification endpoints
- `StartupControllerTest` verifies startup create, update, list, get, follow, and forbidden non-owner updates
- `WebControllerTest` verifies landing and authenticated page routes
- `UploadControllerTest` verifies upload success and empty-upload validation
- `MessagingControllerTest` verifies conversation listing, message retrieval, send-message behavior, and self-message rejection
- `StartuphubApplicationTests` runs on an H2-backed `test` profile for stable context loading
- `src/test/resources/mockito-extensions/org.mockito.plugins.MockMaker` forces the subclass mock maker because the sandboxed JDK cannot attach Mockito's inline agent
- Live runtime verification passed against MySQL on `localhost:3306`
- Verified responses:
  - `POST /api/auth/register` returned `201 Created`
  - `POST /api/auth/login` returned `200 OK`
  - `GET /api/auth/me` returned `200 OK` with sanitized user data
  - `POST /api/posts` returned `201 Created`
  - `GET /api/posts` returned `200 OK`
  - `POST /api/posts/1/likes` returned `200 OK`
  - `POST /api/posts/1/comments` returned `201 Created`
  - `GET /api/posts/1/comments` returned `200 OK`
  - `PUT /api/profile/me` returned `200 OK`
  - `POST /api/profile/{userId}/follow` returned `200 OK`
  - `GET /api/profile/{userId}` returned `200 OK`
  - `GET /api/profile/{userId}/followers` returned `200 OK`
  - `GET /api/profile/{userId}/following` returned `200 OK`

## How To Test Auth Endpoints

Start the MySQL container:

```bash
docker run --name startuphub-mysql \
  -e MYSQL_ROOT_PASSWORD=StartuphubPass123 \
  -e MYSQL_DATABASE=startuphub_db \
  -p 3306:3306 \
  -d mysql:latest
```

Start the app:

```bash
./mvnw spring-boot:run
```

Register:

```bash
curl -i -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"password123"}'
```

Login:

```bash
curl -i -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"password123"}'
```

Fetch current user:

```bash
curl -i http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer <token>"
```

## How To Test Post Endpoints

Create a post:

```bash
curl -i -X POST http://localhost:8080/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"content":"First startup update","imageUrl":null}'
```

Fetch the feed:

```bash
curl -i http://localhost:8080/api/posts \
  -H "Authorization: Bearer <token>"
```

Fetch a single post:

```bash
curl -i http://localhost:8080/api/posts/1 \
  -H "Authorization: Bearer <token>"
```

Like a post:

```bash
curl -i -X POST http://localhost:8080/api/posts/1/likes \
  -H "Authorization: Bearer <token>"
```

Unlike a post:

```bash
curl -i -X DELETE http://localhost:8080/api/posts/1/likes \
  -H "Authorization: Bearer <token>"
```

Add a comment:

```bash
curl -i -X POST http://localhost:8080/api/posts/1/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"content":"Looks good"}'
```

List comments:

```bash
curl -i http://localhost:8080/api/posts/1/comments \
  -H "Authorization: Bearer <token>"
```

## How To Test Profile Endpoints

Fetch your profile:

```bash
curl -i http://localhost:8080/api/profile/me \
  -H "Authorization: Bearer <token>"
```

Update your profile:

```bash
curl -i -X PUT http://localhost:8080/api/profile/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"bio":"Founder building in public","profilePhoto":"https://example.com/me.png"}'
```

Fetch a public profile:

```bash
curl -i http://localhost:8080/api/profile/2 \
  -H "Authorization: Bearer <token>"
```

Follow a user:

```bash
curl -i -X POST http://localhost:8080/api/profile/2/follow \
  -H "Authorization: Bearer <token>"
```

Unfollow a user:

```bash
curl -i -X DELETE http://localhost:8080/api/profile/2/follow \
  -H "Authorization: Bearer <token>"
```

List followers:

```bash
curl -i http://localhost:8080/api/profile/2/followers \
  -H "Authorization: Bearer <token>"
```

List following:

```bash
curl -i http://localhost:8080/api/profile/2/following \
  -H "Authorization: Bearer <token>"
```

## How To Test Discovery Endpoints

Search users:

```bash
curl -i "http://localhost:8080/api/discovery/search/users?q=alice" \
  -H "Authorization: Bearer <token>"
```

Get suggestions:

```bash
curl -i http://localhost:8080/api/discovery/suggestions \
  -H "Authorization: Bearer <token>"
```

Get personalized discovery feed:

```bash
curl -i http://localhost:8080/api/discovery/feed \
  -H "Authorization: Bearer <token>"
```

List notifications:

```bash
curl -i http://localhost:8080/api/notifications \
  -H "Authorization: Bearer <token>"
```

Mark a notification as read:

```bash
curl -i -X PUT http://localhost:8080/api/notifications/1/read \
  -H "Authorization: Bearer <token>"
```

## How To Test Startup Endpoints

Create a startup:

```bash
curl -i -X POST http://localhost:8080/api/startups \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"Launch Labs","slug":"launch-labs","description":"Building tools for founders","website":"https://launchlabs.example.com","industry":"SaaS","location":"Pune"}'
```

List startups:

```bash
curl -i http://localhost:8080/api/startups \
  -H "Authorization: Bearer <token>"
```

Fetch a startup:

```bash
curl -i http://localhost:8080/api/startups/1 \
  -H "Authorization: Bearer <token>"
```

Update a startup as owner:

```bash
curl -i -X PUT http://localhost:8080/api/startups/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"description":"Updated startup profile","industry":"Fintech"}'
```

Follow a startup:

```bash
curl -i -X POST http://localhost:8080/api/startups/1/follow \
  -H "Authorization: Bearer <token>"
```

Unfollow a startup:

```bash
curl -i -X DELETE http://localhost:8080/api/startups/1/follow \
  -H "Authorization: Bearer <token>"
```

## How To Test The Web App

Start the app:

```bash
./mvnw spring-boot:run
```

Open the browser:

```text
http://localhost:8080/
```

Manual browser flow:

- register from the landing page
- confirm the browser redirects to `/app/feed`
- create a post with or without an uploaded image
- open `/app/profile` and update bio or upload a profile photo
- open `/app/startups` and create a startup with a logo
- open `/app/discovery` and search users
- open `/app/notifications` and mark a notification as read
- use the logout button and confirm the app returns to the landing page

## How To Test Messaging

API flow:

```bash
curl -i http://localhost:8080/api/messages/conversations \
  -H "Authorization: Bearer <token>"
```

```bash
curl -i -X POST http://localhost:8080/api/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"recipientId":2,"content":"Hello from StartupHub"}'
```

```bash
curl -i http://localhost:8080/api/messages/conversations/2 \
  -H "Authorization: Bearer <token>"
```

Browser flow:

- open `http://localhost:8080/app/messages`
- enter a user id in the inbox sidebar
- open the conversation
- send a message
- refresh the second user session and confirm unread counts clear after opening the thread

## Phase 7 Design Decisions

- Messaging is one-to-one only in this phase
- Conversations are created lazily on first open or first send
- Read state clears when the current user opens the conversation
- Simple polling is used in the browser instead of websockets

## Phase 6 Design Decisions

- The web app uses Thymeleaf templates plus Bootstrap 5 and custom CSS rather than a separate SPA build
- JWT remains the core auth token, but browser flows use an `HttpOnly` cookie
- Frontend JavaScript calls the existing REST APIs with `credentials: include`
- File uploads are stored locally under the configured uploads directory and served back through Spring resource mapping

## Open Notes

- Hibernate logs a deprecation warning for explicit `MySQL8Dialect`; it remains set because that exact property value was requested for this phase.

## Phase 8 Design Decisions

- The primary frontend is now a standalone React 18 + Vite SPA under `/home/parth-bhattad/noteApp/test/startuphub/frontend`
- The Spring Boot backend was left unchanged; the SPA talks to it through a Vite development proxy for `/api` and `/uploads`
- SPA auth uses the existing JWT token from `/api/auth/login` and `/api/auth/register`, stored in `localStorage` and attached as a bearer token
- Tailwind CSS replaced Bootstrap for the active frontend, with a dark-first theme and client-side light mode toggle
- Client-side discovery search composes backend list endpoints where dedicated search APIs do not exist for every content type

## React SPA Structure

- `frontend/src/api`: Axios instance and domain API modules
- `frontend/src/components/common`: buttons, cards, avatars, modals, skeletons, toast provider
- `frontend/src/components/layout`: sidebar, top bar, mobile tab bar, protected route, app shell
- `frontend/src/components/post`: post card, grid, comments, create-post modal
- `frontend/src/components/user`: user card and follow button
- `frontend/src/components/startup`: startup card and startup form
- `frontend/src/contexts`: auth and notification providers
- `frontend/src/pages`: login, register, feed, discover, profile, startups, startup detail, messages, notifications
- `frontend/src/utils`: time formatting, number formatting, theme handling, API error extraction

## How To Run The React SPA

Install dependencies once:

```bash
cd /home/parth-bhattad/noteApp/test/startuphub/frontend
npm install
```

Start the backend separately:

```bash
cd /home/parth-bhattad/noteApp/test/startuphub
./mvnw spring-boot:run
```

Start the React frontend:

```bash
cd /home/parth-bhattad/noteApp/test/startuphub/frontend
npm run dev
```

Open the SPA:

```text
http://127.0.0.1:5173/
```

## Phase 8 Fixes

- Removed remaining hardcoded fallback content from feed, profile, startup, notification, and message views
- Added explicit empty-state components and skeleton loading states across list-based pages
- Corrected page/body alignment to keep content text left-aligned outside dedicated empty states and landing presentation
- Added deterministic avatar fallback colors based on a name hash
- Added route-level error boundaries for the React SPA using `react-error-boundary`
- Upgraded the messages experience from polling to authenticated STOMP over SockJS
- Added real-time notification subscription support in the React notification context

## WebSocket Messaging

- STOMP endpoint: `ws://localhost:8080/ws` with SockJS fallback at `/ws`
- Application destination prefix: `/app`
- User message queue: `/user/queue/messages`
- User notification queue: `/user/queue/notifications`
- Outbound chat send destination: `/app/chat.send`
- REST message history endpoint: `GET /api/messages/{userId}`
- REST conversation list endpoint: `GET /api/messages/conversations`

## How To Test WebSocket Messaging

Login and save the JWT from `POST /api/auth/login`, then fetch message history:

```bash
curl -i http://localhost:8080/api/messages/2 \
  -H "Authorization: Bearer <token>"
```

Fetch the inbox summary:

```bash
curl -i http://localhost:8080/api/messages/conversations \
  -H "Authorization: Bearer <token>"
```

Manual browser verification:

- run the backend on `http://localhost:8080`
- run the React SPA on `http://127.0.0.1:5173`
- open two browser tabs with two different users
- open `/messages` in both tabs
- send a message from one tab and confirm it appears instantly in the other tab
- refresh either tab and confirm the message history still loads from `GET /api/messages/{userId}`

Live local verification used during implementation:

```bash
cd /home/parth-bhattad/noteApp/test/startuphub/frontend
node .tmp-ws-verify.mjs
```
