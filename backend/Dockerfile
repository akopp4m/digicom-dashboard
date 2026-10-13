FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY global.json ./
COPY Digicom.Api/Digicom.Api.csproj Digicom.Api/
RUN dotnet restore Digicom.Api/Digicom.Api.csproj

COPY Digicom.Api/ Digicom.Api/
RUN dotnet publish Digicom.Api/Digicom.Api.csproj \
    --configuration Release --no-restore --output /app/publish \
    /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

ENV ASPNETCORE_ENVIRONMENT=Production \
    ASPNETCORE_HTTP_PORTS=8080

COPY --from=build /app/publish ./
RUN mkdir -p /app/data && chown -R app:app /app/data

USER app
EXPOSE 8080
ENTRYPOINT ["dotnet", "Digicom.Api.dll"]
