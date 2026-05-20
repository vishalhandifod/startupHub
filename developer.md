# StartupHub Developer Context

## Current Status

- Project root: `/home/parth-bhattad/noteApp/test/startuphub`
- Source root: `/home/parth-bhattad/noteApp/test/startuphub/src`
- Current phase: Phase 3 design approved - profile module pending implementation
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

### Phase 4

- Search and discovery
- Startup directory
- Connection suggestions
- Notifications baseline

## Verification

- `./mvnw test` passes
- `AuthServiceTest` verifies register/login/current-user service behavior
- `PostServiceTest` verifies create post, feed ordering, idempotent likes, and comment creation
- `AuthControllerTest` verifies register response, duplicate email conflict, and protected `/me`
- `PostControllerTest` verifies create post, feed, like, comment, and missing-post behavior
- `StartuphubApplicationTests` runs on an H2-backed `test` profile for stable context loading
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

## Open Notes

- Hibernate logs a deprecation warning for explicit `MySQL8Dialect`; it remains set because that exact property value was requested for this phase.
