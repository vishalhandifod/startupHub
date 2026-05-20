# StartupHub Phase 1 Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Phase 1 authentication for StartupHub with MySQL-backed registration/login, JWT security, and a protected current-user endpoint.

**Architecture:** Rename the project to the `com.startuphub` base package, keep a layered Spring Boot structure, and implement stateless authentication with a JWT request filter. Persist users with Spring Data JPA, expose auth endpoints through explicit DTOs, and centralize validation and error responses with a controller advice.

**Tech Stack:** Java 17, Spring Boot 3.x, Spring Security, Spring Data JPA, Hibernate, MySQL, JJWT, Maven, JUnit 5, MockMvc

---

## File Structure

### Files to modify

- `pom.xml` - align Spring Boot version and add JJWT/test dependencies
- `tracker.md` - track Phase 1 progress and mark completion
- `developer.md` - record final architecture, package structure, and curl testing commands

### Files to delete or replace

- `src/main/resources/application.yaml` - replaced by `application.properties`
- `src/main/java/com/hub/startuphub/StartuphubApplication.java` - replaced under renamed package
- `src/test/java/com/hub/startuphub/StartuphubApplicationTests.java` - replaced under renamed package

### Files to create

- `src/main/resources/application.properties`
- `src/main/java/com/startuphub/StartuphubApplication.java`
- `src/main/java/com/startuphub/config/JwtConfig.java`
- `src/main/java/com/startuphub/config/SecurityConfig.java`
- `src/main/java/com/startuphub/controller/AuthController.java`
- `src/main/java/com/startuphub/dto/LoginRequest.java`
- `src/main/java/com/startuphub/dto/RegisterRequest.java`
- `src/main/java/com/startuphub/dto/AuthResponse.java`
- `src/main/java/com/startuphub/dto/UserResponse.java`
- `src/main/java/com/startuphub/entity/Role.java`
- `src/main/java/com/startuphub/entity/User.java`
- `src/main/java/com/startuphub/exception/ApiErrorResponse.java`
- `src/main/java/com/startuphub/exception/DuplicateResourceException.java`
- `src/main/java/com/startuphub/exception/InvalidCredentialsException.java`
- `src/main/java/com/startuphub/exception/GlobalExceptionHandler.java`
- `src/main/java/com/startuphub/repository/UserRepository.java`
- `src/main/java/com/startuphub/security/CustomUserDetails.java`
- `src/main/java/com/startuphub/security/CustomUserDetailsService.java`
- `src/main/java/com/startuphub/security/JwtAuthenticationFilter.java`
- `src/main/java/com/startuphub/security/JwtTokenProvider.java`
- `src/main/java/com/startuphub/service/AuthService.java`
- `src/test/java/com/startuphub/service/AuthServiceTest.java`
- `src/test/java/com/startuphub/controller/AuthControllerTest.java`

## Task 1: Align project skeleton and configuration

**Files:**
- Modify: `pom.xml`
- Delete: `src/main/resources/application.yaml`
- Create: `src/main/resources/application.properties`
- Create: `src/main/java/com/startuphub/StartuphubApplication.java`
- Delete: `src/main/java/com/hub/startuphub/StartuphubApplication.java`
- Delete: `src/test/java/com/hub/startuphub/StartuphubApplicationTests.java`

- [ ] **Step 1: Write the failing bootstrap test expectation**

```java
package com.startuphub;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class StartuphubApplicationTests {

    @Test
    void contextLoads() {
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `./mvnw -q -Dtest=StartuphubApplicationTests test`
Expected: FAIL because the `com.startuphub` application class does not exist yet.

- [ ] **Step 3: Write minimal implementation**

```java
package com.startuphub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class StartuphubApplication {

    public static void main(String[] args) {
        SpringApplication.run(StartuphubApplication.class, args);
    }
}
```

Use this `application.properties` content:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/startuphub_db
spring.datasource.username=root
spring.datasource.password=StartuphubPass123
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
server.port=8080
jwt.secret=StartupHubSuperSecretJWTKey2025XYZ
jwt.expiration=86400000
```

Update `pom.xml` to use Spring Boot 3.x and include:

```xml
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.11.5</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.11.5</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.11.5</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `./mvnw -q -Dtest=StartuphubApplicationTests test`
Expected: PASS

## Task 2: Build the user domain with TDD

**Files:**
- Create: `src/main/java/com/startuphub/entity/Role.java`
- Create: `src/main/java/com/startuphub/entity/User.java`
- Create: `src/main/java/com/startuphub/repository/UserRepository.java`
- Test: `src/test/java/com/startuphub/service/AuthServiceTest.java`

- [ ] **Step 1: Write the failing service test for registration**

```java
@Test
void registerCreatesUserWithEncodedPasswordAndUserRole() {
    RegisterRequest request = new RegisterRequest("Alice", "alice@example.com", "password123");

    when(userRepository.existsByEmail("alice@example.com")).thenReturn(false);
    when(passwordEncoder.encode("password123")).thenReturn("encoded-password");
    when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
    when(jwtTokenProvider.generateToken(any(CustomUserDetails.class))).thenReturn("jwt-token");

    AuthResponse response = authService.register(request);

    assertThat(response.token()).isEqualTo("jwt-token");
    assertThat(response.user().email()).isEqualTo("alice@example.com");
    verify(userRepository).save(argThat(user ->
        user.getRole() == Role.USER && "encoded-password".equals(user.getPassword())));
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `./mvnw -q -Dtest=AuthServiceTest#registerCreatesUserWithEncodedPasswordAndUserRole test`
Expected: FAIL because entity, DTO, repository, and service types are missing.

- [ ] **Step 3: Write minimal implementation**

Create:
- `Role` enum with `USER` and `ADMIN`
- `User` JPA entity with the required fields and `@PrePersist` for `createdAt`
- `UserRepository` with `Optional<User> findByEmail(String email)` and `boolean existsByEmail(String email)`

- [ ] **Step 4: Run test to verify compilation gets further**

Run: `./mvnw -q -Dtest=AuthServiceTest#registerCreatesUserWithEncodedPasswordAndUserRole test`
Expected: FAIL later because DTOs, JWT classes, and service still do not exist.

## Task 3: Add DTOs and auth service

**Files:**
- Create: `src/main/java/com/startuphub/dto/RegisterRequest.java`
- Create: `src/main/java/com/startuphub/dto/LoginRequest.java`
- Create: `src/main/java/com/startuphub/dto/UserResponse.java`
- Create: `src/main/java/com/startuphub/dto/AuthResponse.java`
- Create: `src/main/java/com/startuphub/exception/DuplicateResourceException.java`
- Create: `src/main/java/com/startuphub/exception/InvalidCredentialsException.java`
- Create: `src/main/java/com/startuphub/service/AuthService.java`
- Test: `src/test/java/com/startuphub/service/AuthServiceTest.java`

- [ ] **Step 1: Write the failing tests for duplicate registration and login**

```java
@Test
void registerRejectsDuplicateEmail() {
    RegisterRequest request = new RegisterRequest("Alice", "alice@example.com", "password123");
    when(userRepository.existsByEmail("alice@example.com")).thenReturn(true);

    assertThatThrownBy(() -> authService.register(request))
        .isInstanceOf(DuplicateResourceException.class)
        .hasMessage("Email already registered");
}

@Test
void loginRejectsInvalidPassword() {
    User user = User.builder().email("alice@example.com").password("encoded").role(Role.USER).build();
    LoginRequest request = new LoginRequest("alice@example.com", "wrongpass");

    when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(user));
    when(passwordEncoder.matches("wrongpass", "encoded")).thenReturn(false);

    assertThatThrownBy(() -> authService.login(request))
        .isInstanceOf(InvalidCredentialsException.class)
        .hasMessage("Invalid email or password");
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `./mvnw -q -Dtest=AuthServiceTest test`
Expected: FAIL because DTOs and service methods do not exist yet.

- [ ] **Step 3: Write minimal implementation**

Create DTOs as records with validation annotations:

```java
public record RegisterRequest(
    @NotBlank(message = "Name is required") String name,
    @NotBlank(message = "Email is required") @Email(message = "Email must be valid") String email,
    @NotBlank(message = "Password is required") @Size(min = 8, message = "Password must be at least 8 characters") String password
) {}
```

`AuthService` should expose:

```java
AuthResponse register(RegisterRequest request);
AuthResponse login(LoginRequest request);
UserResponse getCurrentUser();
```

Implementation should:
- reject duplicate email
- encode password on register
- validate password match on login
- map `User` to `UserResponse`
- build `AuthResponse` with `Bearer`, `86400000`, token, and user data

- [ ] **Step 4: Run test to verify it passes**

Run: `./mvnw -q -Dtest=AuthServiceTest test`
Expected: PASS

## Task 4: Add JWT infrastructure

**Files:**
- Create: `src/main/java/com/startuphub/config/JwtConfig.java`
- Create: `src/main/java/com/startuphub/security/CustomUserDetails.java`
- Create: `src/main/java/com/startuphub/security/CustomUserDetailsService.java`
- Create: `src/main/java/com/startuphub/security/JwtTokenProvider.java`
- Test: `src/test/java/com/startuphub/service/AuthServiceTest.java`

- [ ] **Step 1: Write the failing JWT-backed auth service test**

```java
@Test
void loginReturnsTokenGeneratedFromCustomUserDetails() {
    User user = User.builder()
        .id(1L)
        .name("Alice")
        .email("alice@example.com")
        .password("encoded")
        .role(Role.USER)
        .build();

    when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(user));
    when(passwordEncoder.matches("password123", "encoded")).thenReturn(true);
    when(jwtTokenProvider.generateToken(any(CustomUserDetails.class))).thenReturn("jwt-token");

    AuthResponse response = authService.login(new LoginRequest("alice@example.com", "password123"));

    assertThat(response.token()).isEqualTo("jwt-token");
    assertThat(response.user().role()).isEqualTo("USER");
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `./mvnw -q -Dtest=AuthServiceTest#loginReturnsTokenGeneratedFromCustomUserDetails test`
Expected: FAIL because JWT support classes do not exist.

- [ ] **Step 3: Write minimal implementation**

Create:
- `JwtConfig` bound to `jwt.secret` and `jwt.expiration`
- `CustomUserDetails` implementing `UserDetails`
- `CustomUserDetailsService` loading users by email
- `JwtTokenProvider` with methods:
  - `String generateToken(CustomUserDetails userDetails)`
  - `String extractUsername(String token)`
  - `boolean isTokenValid(String token, UserDetails userDetails)`

Use JJWT claims for `userId`, `email`, and `role`.

- [ ] **Step 4: Run test to verify it passes**

Run: `./mvnw -q -Dtest=AuthServiceTest test`
Expected: PASS

## Task 5: Add the request filter and security configuration

**Files:**
- Create: `src/main/java/com/startuphub/security/JwtAuthenticationFilter.java`
- Create: `src/main/java/com/startuphub/config/SecurityConfig.java`
- Test: `src/test/java/com/startuphub/controller/AuthControllerTest.java`

- [ ] **Step 1: Write the failing protected endpoint test**

```java
@Test
void meEndpointRequiresAuthentication() throws Exception {
    mockMvc.perform(get("/api/auth/me"))
        .andExpect(status().isUnauthorized());
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `./mvnw -q -Dtest=AuthControllerTest#meEndpointRequiresAuthentication test`
Expected: FAIL because the controller and security config do not exist.

- [ ] **Step 3: Write minimal implementation**

`SecurityConfig` should:
- disable CSRF
- set stateless sessions
- permit `/api/auth/register` and `/api/auth/login`
- require authentication for `/api/**`
- register JWT filter before `UsernamePasswordAuthenticationFilter`
- expose `PasswordEncoder` bean using BCrypt

`JwtAuthenticationFilter` should:
- read `Authorization` header
- ignore missing/non-Bearer headers
- extract username from token
- load user via `CustomUserDetailsService`
- validate token and set `SecurityContext`

- [ ] **Step 4: Run test to verify it passes**

Run: `./mvnw -q -Dtest=AuthControllerTest#meEndpointRequiresAuthentication test`
Expected: PASS

## Task 6: Add controller and exception handling

**Files:**
- Create: `src/main/java/com/startuphub/controller/AuthController.java`
- Create: `src/main/java/com/startuphub/exception/ApiErrorResponse.java`
- Create: `src/main/java/com/startuphub/exception/GlobalExceptionHandler.java`
- Test: `src/test/java/com/startuphub/controller/AuthControllerTest.java`

- [ ] **Step 1: Write the failing controller tests**

```java
@Test
void registerReturnsCreatedAuthResponse() throws Exception {
    when(authService.register(any(RegisterRequest.class))).thenReturn(authResponse);

    mockMvc.perform(post("/api/auth/register")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {"name":"Alice","email":"alice@example.com","password":"password123"}
                """))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.token").value("jwt-token"))
        .andExpect(jsonPath("$.user.email").value("alice@example.com"));
}

@Test
void duplicateRegistrationReturnsConflict() throws Exception {
    when(authService.register(any(RegisterRequest.class)))
        .thenThrow(new DuplicateResourceException("Email already registered"));

    mockMvc.perform(post("/api/auth/register")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {"name":"Alice","email":"alice@example.com","password":"password123"}
                """))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.message").value("Email already registered"));
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `./mvnw -q -Dtest=AuthControllerTest test`
Expected: FAIL because controller and advice do not exist.

- [ ] **Step 3: Write minimal implementation**

`AuthController` endpoints:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

`GlobalExceptionHandler` should map:
- validation errors to `400`
- `DuplicateResourceException` to `409`
- `InvalidCredentialsException` and auth failures to `401`
- other exceptions to `500`

All responses should be JSON.

- [ ] **Step 4: Run test to verify it passes**

Run: `./mvnw -q -Dtest=AuthControllerTest test`
Expected: PASS

## Task 7: Run end-to-end verification and update docs

**Files:**
- Modify: `tracker.md`
- Modify: `developer.md`

- [ ] **Step 1: Start MySQL Docker container**

Run:

```bash
docker run --name startuphub-mysql \
  -e MYSQL_ROOT_PASSWORD=StartuphubPass123 \
  -e MYSQL_DATABASE=startuphub_db \
  -p 3306:3306 \
  -d mysql:latest
```

Expected: returns a container id.

- [ ] **Step 2: Run the full test suite**

Run: `./mvnw test`
Expected: PASS

- [ ] **Step 3: Start the application**

Run: `./mvnw spring-boot:run`
Expected: app starts on port `8080` and connects to MySQL.

- [ ] **Step 4: Verify register, login, and me**

Run:

```bash
curl -s -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"password123"}'
```

```bash
curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"password123"}'
```

```bash
curl -s http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer <token>"
```

Expected:
- register returns `201` with token and user
- login returns `200` with token and user
- me returns `200` with sanitized user data

- [ ] **Step 5: Update docs**

Update `tracker.md`:
- mark all Phase 1 tasks done
- add Phase 2 post module TODO items

Update `developer.md`:
- final package structure
- dependency and security decisions
- runtime instructions
- final curl examples
