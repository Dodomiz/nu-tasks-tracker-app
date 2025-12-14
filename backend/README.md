# TasksTracker API - ASP.NET Core Backend

## Overview

This is the backend API for the NU Tasks Management Application, built with ASP.NET Core 9, MongoDB, and following a feature-based layered architecture.

## Project Structure

```
backend/src/TasksTracker.Api/
├── Features/                     # Feature-based organization
│   ├── Auth/                     # Authentication feature
│   │   ├── Controllers/          # Auth HTTP endpoints
│   │   ├── Services/             # Auth business logic
│   │   └── Models/               # Auth DTOs and requests
│   ├── Groups/                   # Group management feature
│   ├── Tasks/                    # Task management feature
│   ├── Notifications/            # Notification feature
│   ├── Leaderboard/              # Gamification and leaderboard
│   ├── Races/                    # Competitive races
│   ├── Rewards/                  # Rewards system
│   └── Messages/                 # Messaging between users
├── Core/                         # Core domain and interfaces
│   ├── Domain/                   # Domain models (User, Group, Task, etc.)
│   ├── Interfaces/               # Repository interfaces
│   ├── Middleware/               # Custom middleware (Error handling, etc.)
│   └── Extensions/               # Extension methods
├── Infrastructure/               # Infrastructure layer
│   ├── Data/                     # MongoDB context and settings
│   ├── Repositories/             # MongoDB repositories
│   └── ServerAccess/             # External service integrations (Email, Push, Storage)
├── Program.cs                    # Application startup and configuration
└── appsettings.json              # Application configuration

```

## Technology Stack

- **.NET 9** - Latest .NET framework
- **ASP.NET Core 9** - Web API framework
- **MongoDB** - NoSQL document database
- **MongoDB.Driver 3.5.2** - Official MongoDB C# driver
- **JWT Bearer Authentication** - Token-based authentication
- **Serilog** - Structured logging
- **Swashbuckle (Swagger)** - API documentation

## Prerequisites

- .NET 9 SDK
- MongoDB 4.4+ (local or MongoDB Atlas)
- An IDE (Visual Studio 2022, VS Code, or Rider)

## Getting Started

### 1. Install Dependencies

```bash
cd backend/src/TasksTracker.Api
dotnet restore
```

### 2. Configure MongoDB

Update `appsettings.json` or `appsettings.Development.json`:

```json
{
  "MongoDbSettings": {
    "ConnectionString": "mongodb://localhost:27017",
    "DatabaseName": "TasksTrackerDb_Dev",
    "MaxConnectionPoolSize": 100
  }
}
```

### 3. Configure JWT Secret

**IMPORTANT:** Change the JWT secret key in production!

```json
{
  "JwtSettings": {
    "SecretKey": "your-secure-256-bit-secret-key-minimum-32-characters",
    "Issuer": "TasksTrackerApi",
    "Audience": "TasksTrackerClients"
  }
}
```

### 4. Run the Application

```bash
dotnet run
```

Or with watch mode (auto-reload on changes):

```bash
dotnet watch run
```

The API will be available at:
- **HTTPS:** https://localhost:7001
- **HTTP:** http://localhost:5000
- **Swagger UI:** https://localhost:7001/swagger

### 5. Access Swagger Documentation

Open your browser and navigate to:
```
https://localhost:7001/swagger
```

## Architecture Patterns

### Layered Architecture

The project follows a clean layered architecture:

1. **Controller Layer** - HTTP request/response handling, input validation
2. **Service Layer** - Business logic, orchestration, authorization
3. **Repository Layer** - Data access, MongoDB queries
4. **ServerAccess Layer** - Third-party integrations (Email, Push, Storage)

### Feature-Based Organization

Each feature (Auth, Groups, Tasks, etc.) has its own folder containing:
- **Controllers** - API endpoints
- **Services** - Business logic
- **Models** - DTOs, requests, responses

### Dependency Injection

All services use constructor-based dependency injection with .NET 9 primary constructors:

```csharp
public class UserRepository(MongoDbContext context) : BaseRepository<User>(context, "users"), IUserRepository
{
    // Implementation
}
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout and invalidate tokens

### Health Check

- `GET /health` - API health status

## Configuration

### MongoDB Collections

The following collections are used:
- `users` - User accounts and authentication
- `groups` - Groups and members
- `tasks` - Task assignments
- `notifications` - User notifications
- `messages` - Private messages
- `races` - Competitive task races
- `rewards` - User rewards
- `leaderboards` - Pre-calculated rankings

### Logging

Logs are written to:
- **Console** - All environments
- **File** - `logs/tasksTracker-{Date}.log` (rolling daily)

Log levels can be configured in `appsettings.json`:

```json
{
  "Serilog": {
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft": "Warning"
      }
    }
  }
}
```

## Development Guidelines

### Adding a New Feature

1. Create feature folder: `Features/NewFeature/{Controllers,Services,Models}`
2. Create controller in `Controllers/NewFeatureController.cs`
3. Create service interface and implementation in `Services/`
4. Create DTOs in `Models/`
5. Register services in `Program.cs`

### Adding a New Repository

1. Create domain model in `Core/Domain/`
2. Create repository interface in `Core/Interfaces/`
3. Create repository implementation in `Infrastructure/Repositories/`
4. Register repository in `Program.cs`

### Error Handling

All exceptions are caught by `ErrorHandlingMiddleware` and returned as standardized API responses:

```json
{
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": []
  },
  "success": false
}
```

## Testing

### Run Tests

```bash
cd backend/tests
dotnet test
```

### Code Coverage

```bash
dotnet test /p:CollectCoverage=true /p:CoverageReportFormat=opencover
```

## Building for Production

```bash
dotnet publish -c Release -o ./publish
```

## Docker Support (Coming Soon)

```bash
docker build -t taskstracker-api .
docker run -p 5000:80 taskstracker-api
```

## Environment Variables

For production deployment, use environment variables instead of appsettings.json:

```bash
export MongoDbSettings__ConnectionString="mongodb://..."
export JwtSettings__SecretKey="your-production-secret"
```

## Contributing

1. Follow existing code patterns
2. Use primary constructors for dependency injection
3. Implement async/await for all I/O operations
4. Write unit tests for business logic
5. Update API documentation (XML comments)

## Next Steps

- [ ] Implement Authentication Service (JWT generation, password hashing)
- [ ] Implement Group Management endpoints
- [ ] Implement Task CRUD operations
- [ ] Add Email Service integration (SendGrid)
- [ ] Add Push Notification service (FCM/APNS)
- [ ] Add File Storage service (Azure Blob/S3)
- [ ] Implement unit and integration tests
- [ ] Add CI/CD pipeline

## License

[Your License Here]

## Support

For issues and questions, please contact [Your Contact Info]
