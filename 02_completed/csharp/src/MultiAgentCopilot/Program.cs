namespace MultiAgentCopilot
{
    

    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Load configuration from appsettings.json and environment variables
            builder.Configuration.SetBasePath(Directory.GetCurrentDirectory())
                                 .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                                 .AddJsonFile("appsettings.development.json", optional: true, reloadOnChange: true)
                                 .AddEnvironmentVariables();

            // Add CORS policy
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAllOrigins",
                    policy =>
                    {
                        policy.AllowAnyOrigin()
                              .AllowAnyMethod()
                              .AllowAnyHeader();
                    });
            });


            builder.Logging.ClearProviders();
            builder.Logging.AddConsole();

            if (!builder.Environment.IsDevelopment())                
                builder.Services.AddApplicationInsightsTelemetry();

            builder.Logging.SetMinimumLevel(LogLevel.Trace);
            builder.Services.Configure<LoggerFilterOptions>(options =>
            {
                options.MinLevel = LogLevel.Trace;
            });

            //builder.AddApplicationInsightsTelemetry();

            builder.AddCosmosDBService();
            builder.AddAgentFrameworkService();
            builder.AddMCPService();

            builder.AddChatService();
            builder.Services.AddScoped<ChatEndpoints>();

            // Add services to the container.
            builder.Services.AddAuthorization();

            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            var app = builder.Build();
            app.UseCors("AllowAllOrigins");

            app.UseExceptionHandler(exceptionHandlerApp
                    => exceptionHandlerApp.Run(async context
                        => await Results.Problem().ExecuteAsync(context)));

            // Configure the HTTP request pipeline.
            app.UseSwagger();
            app.UseSwaggerUI();

            app.UseAuthorization();

            // Serve static files (Angular frontend)
            app.UseDefaultFiles();
            app.UseStaticFiles();

            // Map the chat REST endpoints:
            using (var scope = app.Services.CreateScope())
            {
                var service = scope.ServiceProvider.GetService<ChatEndpoints>();
                service?.Map(app);
            }

            // Fallback to index.html for Angular routing (must be last)
            app.MapFallbackToFile("index.html");

            app.Run();


        }
    }
}
