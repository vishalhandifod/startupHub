# StartupHub Phase 1 Auth Design

## Scope

This design covers Phase 1 only:

- MySQL-backed user registration
- Login with JWT
- Protected current-user endpoint
- Validation and JSON error handling
- Package rename to `com.startuphub`

This design excludes post, profile, feed, search, and frontend work.

## Recommended Approach

Use stateless JWT authentication with Spring Security, a single `User` entity, and explicit request/response DTOs.

Why this approach:

- It matches the requested stack directly
- It keeps the auth boundary small and testable
- It supports future social features without reworking auth contracts
- It avoids session state on the server

## Architecture

The application will use a standard layered structure:

- `controller`: HTTP request/response handling
- `service`: auth logic, registration, login, current-user retrieval
- `repository`: JPA access to users
- `security`: JWT parsing, token generation, request filtering, user details loading
- `config`: Spring Security and JWT property wiring
- `exception`: centralized JSON error handling

Request flow:

1. Client sends register or login request
2. Controller validates input DTO
3. Service performs duplicate checks or credential verification
4. Service generates JWT with `userId`, `email`, and `role`
5. Controller returns JSON auth response
6. Protected requests pass through JWT filter
7. Filter validates bearer token and populates `SecurityContext`
8. Protected controller reads authenticated principal

## Data Model

### User

- `id: Long`
- `name: String`
- `email: String`
- `password: String`
- `bio: String nullable`
- `profilePhoto: String nullable`
- `role: Role`
- `createdAt: LocalDateTime`

Constraints:

- `email` unique and non-null
- `name` non-null
- `password` stored as BCrypt hash
- `role` stored as string enum
- `createdAt` set automatically on insert

### Role

- `USER`
- `ADMIN`

Registrations default to `USER`.

## API Contract

### POST `/api/auth/register`

Request body:

- `name`
- `email`
- `password`

Behavior:

- validates required fields
- validates email format
- validates password minimum length of 8
- rejects duplicate email with `409 Conflict`
- creates a new user
- returns `201 Created`

Response body:

- `token`
- `tokenType`
- `expiresIn`
- `user`

### POST `/api/auth/login`

Request body:

- `email`
- `password`

Behavior:

- validates required fields
- verifies email exists
- verifies password matches stored BCrypt hash
- returns `401 Unauthorized` for invalid credentials
- returns `200 OK` with the same auth payload shape as register

### GET `/api/auth/me`

Behavior:

- requires bearer token
- returns current authenticated user without password
- returns `200 OK`

## Security Design

### JWT

- library: `io.jsonwebtoken:jjwt-api:0.11.5` with impl and jackson modules
- signing secret from configuration
- expiration: 24 hours
- claims: `userId`, `email`, `role`

### Spring Security

- disable CSRF for REST API
- use stateless session management
- allow anonymous access to:
  - `/api/auth/register`
  - `/api/auth/login`
- require authentication for all other `/api/**` endpoints
- use `BCryptPasswordEncoder`
- register JWT filter before username/password auth filter

### User Details

`CustomUserDetailsService` loads users by email. The JWT filter resolves the token, validates it, loads the user, and sets an authenticated principal into the security context only when the token is valid.

## Error Handling

All API errors will return JSON. Standard response shape:

```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Email already registered",
  "path": "/api/auth/register"
}
```

Handled cases:

- validation errors
- duplicate email
- invalid credentials
- malformed or expired JWT
- generic unexpected server errors

## Configuration

The project will switch from `application.yaml` to `src/main/resources/application.properties` with:

- MySQL connection to `startuphub_db`
- Hibernate `ddl-auto=update`
- SQL logging enabled
- JWT secret and expiration
- `server.port=8080`

## Testing Strategy

Automated verification:

- unit or slice tests for auth service/controller behavior where practical
- compile and test via Maven

Runtime verification:

- run MySQL in Docker
- start Spring Boot app
- verify register, login, and `/me` using `curl`

## Risks and Decisions

- The generated project currently uses Spring Boot `4.0.6`, but requested implementation targets Spring Boot 3.x. This should be normalized during Phase 1 to avoid version drift.
- Docker startup may require local runtime permissions.
- No git repository is present, so this spec cannot be committed in the current workspace state.
