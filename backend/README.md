# StandUpStrip Backend

A lightweight async standup tool with AI-powered summaries for remote teams.

## Features

- ✅ User authentication with JWT
- ✅ Team management (create, update, delete, member management)
- ✅ Daily standup submissions (yesterday/today/blockers)
- ✅ AI-powered standup summaries
- ✅ RESTful API
- ✅ Secure endpoints with role-based access

## Tech Stack

- **Java 21**
- **Spring Boot 4.0.1**
- **Spring Security** with JWT
- **Spring Data JPA**
- **H2 Database** (Development)
- **PostgreSQL** (Production)
- **Lombok**
- **Maven**

## Getting Started

### Prerequisites

- Java 21 or higher
- Maven 3.6+

### Running Locally

1. **Clone the repository**
   ```bash
   cd standupmeet/backend
   ```

2. **Build the project**
   ```bash
   mvn clean install
   ```

3. **Run the application**
   ```bash
   mvn spring-boot:run
   ```

The application will start on `http://localhost:8080`

### H2 Console

Access the H2 database console at: `http://localhost:8080/h2-console`

- **JDBC URL**: `jdbc:h2:mem:standupdb`
- **Username**: `sa`
- **Password**: (leave empty)

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get JWT token |

### Team Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/teams` | Create team |
| GET | `/api/teams` | Get my teams |
| GET | `/api/teams/{id}` | Get team by ID |
| PUT | `/api/teams/{id}` | Update team |
| DELETE | `/api/teams/{id}` | Delete team (soft) |
| POST | `/api/teams/{id}/members` | Add member |
| DELETE | `/api/teams/{id}/members/{userId}` | Remove member |

### Standup Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/standups/teams/{teamId}` | Submit standup |
| PUT | `/api/standups/{id}` | Update standup |
| GET | `/api/standups/teams/{teamId}?date={date}` | Get standups by date |
| GET | `/api/standups/teams/{teamId}/range?startDate={start}&endDate={end}` | Get standups range |
| DELETE | `/api/standups/{id}` | Delete standup |

### Summary Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/summaries/teams/{teamId}/generate?date={date}` | Generate AI summary |
| GET | `/api/summaries/teams/{teamId}?date={date}` | Get summary |
| GET | `/api/summaries/teams/{teamId}/range?startDate={start}&endDate={end}` | Get summaries range |

## Testing with Postman

Import the Postman collection: `StandUpStrip_Postman_Collection.json`

1. Run `Register User` to create an account
2. Run `Login` - the JWT token is automatically saved
3. All other endpoints use the token automatically

## Database Schema

See [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) for complete schema documentation.

## Configuration

### Development (application.properties)

```properties
spring.datasource.url=jdbc:h2:mem:standupdb
spring.jpa.hibernate.ddl-auto=update
```

### Production (application-prod.properties)

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/standupdb
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.jpa.hibernate.ddl-auto=validate
```

### Environment Variables

```bash
# JWT Configuration
JWT_SECRET=your-secret-key-min-256-bits

# AI Configuration (for future enhancement)
AI_API_KEY=your-openai-or-gemini-key
AI_MODEL=gpt-4
```

## Project Structure

```
src/main/java/com/siamcode/backend/
├── controller/      # REST controllers
├── service/         # Business logic
├── repository/      # Data access
├── entity/          # JPA entities
├── dto/            # Data transfer objects
│   ├── request/    # Request DTOs
│   └── response/   # Response DTOs
├── security/       # JWT authentication
├── config/         # Configuration classes
├── exception/      # Custom exceptions
└── util/           # Utility classes
```

## License

MIT License
