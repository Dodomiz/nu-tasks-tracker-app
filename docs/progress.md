# Progress

## 2025-12-14

### Fixed Runtime Errors
- Fixed `System.Reflection.ReflectionTypeLoadException` with Microsoft.OpenApi package
  - Downgraded `Swashbuckle.AspNetCore` from 10.0.1 to 7.2.0 for .NET 9 compatibility
  - Version 10.x has dependency conflicts with Microsoft.OpenApi that cause runtime type load failures
  - Application now builds and runs successfully

### Code Fixes
- Fixed missing `using TasksTracker.Api.Core.Domain;` in AuthController.cs
- Fixed `UpdateAsync` method signature in AuthService.cs (added missing `user.Id` parameter)

### Improvements
- Fixed startup logging in Program.cs to display correct URLs:
  - Now uses `IServerAddressesFeature` to get actual bound addresses after server starts
  - Logs each listening address (e.g., http://localhost:5199, https://localhost:7023)
  - Shows Swagger UI link with correct port in non-Production environments
  - Previously logged incorrect port 5000 because `app.Urls` was empty before binding
- Fixed duplicate logging issue:
  - Removed duplicate sink configuration in Program.cs (Console and File)
  - Now reads all Serilog configuration from appsettings.json via `.ReadFrom.Configuration()`
  - Sinks were configured both in code and config, causing each log to appear twice
- Enabled Swagger UI in all non-Production environments (Development, Staging)
  - Changed condition from `IsDevelopment()` to `!IsProduction()`
  - Explicitly set RoutePrefix for clarity

### Cleanup
- Removed start-dev.sh script
