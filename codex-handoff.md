# Digicom Dashboard — Codex Handoff Context

## 1. Project Overview

This project is a take-home coding assignment for Digicom.

The goal is to implement a small web-based communication analytics dashboard using synthetic phone communication data.

The solution should demonstrate:

- Clean, pragmatic implementation
- Meaningful KPIs and visualizations
- Filtering across dashboard data
- Basic automated testing
- Docker-based startup
- Clear documentation of assumptions, limitations, and AI usage

**Important:** Keep the implementation deliberately lean. This is a coding assignment, not a production contact-center platform. Avoid unnecessary abstractions, excessive layering, or overengineering.

## 2. Technology Stack

### Backend

- C# / .NET 10
- ASP.NET Core
- Entity Framework Core
- SQLite
- CsvHelper for CSV parsing

### Frontend

- Angular 22
- TypeScript
- Angular signals
- Tailwind CSS 4
- Apache ECharts via ngx-echarts
- Vitest
- pnpm

### Development Environment

- macOS
- .NET SDK 10
- Node.js 24
- Angular CLI 22
- Docker

Project directory:

`~/Projects/digicom-dashboard`

Existing backend endpoint:

`GET /api/dashboard`

Existing SQLite database location:

`data/digicom.db`

The actual repository should be inspected before modifying any implementation.

## 3. Current Architecture and Implementation Status

The intended architecture is:

```text
Angular frontend
       |
       | HTTP
       v
ASP.NET Core API
       |
       v
EF Core / SQLite
       ^
       |
CSV import on initial startup
```

Previously discussed or implemented components:

- ASP.NET Core backend
- SQLite database
- CommunicationEvent entity
- Dashboard API endpoint
- Angular dashboard
- Contacts-over-time visualization
- Average waiting time by department visualization

Planned or discussed additions:

- Waiting time vs. QualityScore scatter plot
- Period filtering
- CSV importer
- Minimal unit tests
- Docker Compose
- README documentation

**Do not assume all planned components have already been implemented. Inspect the repository first.**

## 4. Synthetic Dataset

The latest dataset is:

`digicom_communications_600.csv`

It contains **600 synthetic communication events** distributed across 20 working days.

Original date range:

September 14 – October 9, 2026.

Daily event volumes vary between 24 and 39 events, averaging 30 events per working day.

The dataset was developed in stages:

1. Initial 400-event CSV
2. Revised 400-event CSV with Austrian phone prefixes, numeric extensions, and an additional department
3. Final 600-event CSV, retaining the existing 400 records and adding 200 new records

Use the 600-event version.

### 4.1 CSV Schema

The CSV contains these 11 columns:

| Column               | Type     | Description                            |
| -------------------- | -------- | -------------------------------------- |
| `Timestamp`          | DateTime | Communication timestamp                |
| `Direction`          | string   | `inbound` or `outbound`                |
| `Channel`            | string   | Always `phone`                         |
| `CustomerId`         | string   | Synthetic customer identifier          |
| `Department`         | string   | Department name                        |
| `Agent`              | int      | Numeric telephone extension            |
| `CallerNumber`       | string   | Synthetic Austrian-format phone number |
| `DurationSeconds`    | int      | Call duration                          |
| `WaitingTimeSeconds` | int      | Waiting time                           |
| `Status`             | string   | Communication outcome                  |
| `QualityScore`       | int      | Simulated score from 1 to 5            |

Allowed status values:

- `answered`
- `missed`
- `abandoned`
- `failed`

### 4.2 Departments and Extensions

| Department |  Events | Extensions               |
| ---------- | ------: | ------------------------ |
| Support    |     318 | 21–24                    |
| Sales      |     122 | 31–33                    |
| Accounting |      62 | 41–42                    |
| Orders     |      98 | 51–53                    |
| **Total**  | **600** | **12 unique extensions** |

Extensions are numeric and unique across departments.

The same extension must not belong to multiple departments.

### 4.3 Phone Numbers

Phone numbers use the Austrian country code `+43` and recognizable Austrian geographic/mobile prefixes.

Examples of prefixes:

- `+43 664`
- `+43 676`
- `+43 699`
- `+43 1`
- `+43 732`

Subscriber numbers are synthetic. They have not been verified as unassigned.

No real customer data was intentionally used.

### 4.4 Data Consistency Rules

The following assumptions apply:

- Every record has all 11 required fields.
- `Direction` is either `inbound` or `outbound`.
- `Channel` is always `phone`.
- `Status` uses one of the four allowed values.
- `QualityScore` is an integer between 1 and 5.
- Duration and waiting time are nonnegative.
- Answered calls have positive duration.
- Unanswered calls have zero duration.
- Outbound calls have zero waiting time.
- Agent extensions do not overlap between departments.

QualityScore is populated even for unanswered calls because the assignment requires the field for every event.

However, analytical relationships between waiting time and QualityScore should preferably be evaluated using **answered inbound calls only**.

## 5. Three Intentionally Introduced Anomalies

The dataset contains three deliberately introduced patterns intended to be discoverable through dashboard analytics.

These are synthetic anomalies, not findings from real customer data.

### Anomaly 1 — Midday Inbound Traffic Peak

A disproportionately large number of inbound contacts occur between 11:00 and 13:00.

Measured distribution:

- Total inbound events: 458
- Inbound events between 11:00 and 13:00: 232
- Share: approximately 50.7%

Expected visualization:

Contacts over time, ideally grouped by hour.

The midday peak should be clearly visible.

### Anomaly 2 — Elevated Waiting Times in Support

Support has significantly higher inbound waiting times than other departments.

Measured values:

| Group             | Average inbound waiting time |
| ----------------- | ---------------------------: |
| Support           |                 62.5 seconds |
| Other departments |            28.2–45.4 seconds |

Expected visualization:

Average waiting time by department.

Support should stand out.

Possible interpretation:

Increased workload or insufficient staffing capacity.

This is a simulated interpretation, not an established cause.

### Anomaly 3 — Waiting Time vs. QualityScore

Longer waiting times tend to correlate with lower QualityScore values.

For answered inbound calls:

**Pearson correlation coefficient: approximately −0.571.**

Expected visualization:

Scatter plot:

- X-axis: WaitingTimeSeconds
- Y-axis: QualityScore
- Dataset: answered inbound events

The relationship is intentionally noisy rather than deterministic.

A negative correlation does not establish causation.

## 6. CSV Import Strategy

The agreed approach is to use the CSV as the source of the synthetic dataset and import it into SQLite.

**Do not implement a separate random-data seeder.**

### Expected Startup Behavior

1. Initialize the database using the project's existing EF Core approach.
2. Check whether `CommunicationEvents` already contains data.
3. If data exists, skip importing.
4. If empty, load the CSV.
5. Parse all records.
6. Validate the dataset.
7. Shift all timestamps using one common offset.
8. Insert the events into SQLite.
9. Save the data transactionally.

The importer should execute automatically during application startup.

No CSV upload endpoint or administrative interface is required.

### Timestamp Shifting

The CSV contains historical timestamps.

The importer should shift them so that the latest date in the dataset corresponds to the current date at import time.

Conceptually:

```csharp
var latestDate = records.Max(x => x.Timestamp).Date;
var offset = DateTime.Today - latestDate;

var shiftedTimestamp = row.Timestamp.Add(offset);
```

Apply the **same offset to every record**.

This preserves:

- Time-of-day distribution
- Relative spacing between records
- Weekday patterns within the dataset
- All three intentional anomalies

Note that aligning the last date with today does not guarantee that every shifted date remains a working day if the offset is not a multiple of seven days.

Also consider the runtime timezone if Docker uses UTC.

### CSV Parsing

Use CsvHelper.

Suggested package installation:

```bash
dotnet add package CsvHelper
```

The CSV headers correspond directly to the proposed import DTO properties, so convention-based mapping should be sufficient.

### Suggested Structure

A single importer class is sufficient:

`Data/CommunicationCsvImporter.cs`

Suggested public method:

```csharp
Task ImportIfEmptyAsync(
    string csvPath,
    CancellationToken cancellationToken = default);
```

Suggested dependencies:

- Existing EF Core DbContext
- ILogger

Do not introduce repositories, factories, generic import frameworks, or unnecessary interfaces solely for this feature.

### Suggested Import DTO

```csharp
private sealed class CommunicationCsvRow
{
    public DateTime Timestamp { get; set; }
    public string Direction { get; set; } = "";
    public string Channel { get; set; } = "";
    public string CustomerId { get; set; } = "";
    public string Department { get; set; } = "";
    public int Agent { get; set; }
    public string CallerNumber { get; set; } = "";
    public int DurationSeconds { get; set; }
    public int WaitingTimeSeconds { get; set; }
    public string Status { get; set; } = "";
    public int QualityScore { get; set; }
}
```

Map this DTO to the existing `CommunicationEvent` entity.

Adapt the mapping to the actual repository's entity definitions rather than assuming all properties are identical.

### Validation

Before inserting records, validate at least:

- CSV is not empty.
- Required values are present.
- Direction and status values are valid.
- QualityScore is within 1–5.
- Duration and waiting time are nonnegative.
- Answered calls have positive duration.
- Unanswered calls have zero duration.
- Outbound waiting time is zero.

Validation should happen before database insertion to avoid partially importing invalid datasets.

### Database Transaction

Use an EF Core transaction for the insert.

Conceptual flow:

```csharp
await using var transaction =
    await db.Database.BeginTransactionAsync(cancellationToken);

db.CommunicationEvents.AddRange(events);
await db.SaveChangesAsync(cancellationToken);

await transaction.CommitAsync(cancellationToken);
```

The implementation should be idempotent for normal application restarts: an already-populated database must not receive duplicate records.

### Startup Integration

Register the importer as a scoped service.

Invoke it from `Program.cs` using an application service scope before `app.Run()`.

Resolve the CSV path relative to the application's content root.

The proposed path is:

`Data/digicom_communications_600.csv`

Ensure the file is included in the published application for Docker deployment.

Use the repository's existing EF Core database initialization strategy. Do not mix `EnsureCreated` and migrations without reviewing the current implementation.

## 7. Dashboard KPIs

The assignment requires the following metrics:

- Total communication events
- Inbound count
- Outbound count
- Answered count
- Missed count
- Abandoned count
- Failed count
- Average duration
- Average waiting time
- Average QualityScore
- Reachability rate
- Distribution by department

Check how each metric is currently defined before modifying it.

In particular, document the denominator used for reachability rate and which statuses are included in duration, waiting-time, and quality averages.

Avoid silently changing KPI semantics.

## 8. Visualizations

### Existing or Previously Discussed

**Contacts over time**

- Inbound/outbound series
- Aggregation by time interval
- Should expose the midday traffic peak

**Average waiting time by department**

- Department comparison
- Should expose the elevated Support waiting time

### Planned Third Visualization

**Waiting time vs. QualityScore**

Use an ECharts scatter plot.

Recommended data selection:

```text
Direction == inbound
Status == answered
```

Axes:

```text
X: WaitingTimeSeconds
Y: QualityScore
```

This should reveal the intended negative correlation.

Keep the visualization implementation consistent with the existing Angular/ECharts approach.

## 9. Dashboard Filtering

A time-period filter was planned with the following options:

- All
- Today
- Yesterday
- Last 7 days
- Last 30 days

Day.js was discussed for date handling.

The filter should affect:

- All KPIs
- All visualizations
- Any AI-generated analysis, if implemented

The intended approach was to pass the selected date range to the dashboard API through query parameters.

Avoid independently filtering only individual charts on the frontend.

The backend should provide consistent results for the selected period.

Review the actual existing frontend and backend before implementing this.

## 10. Testing

Testing should be deliberately limited but meaningful.

The user does not want a large test suite for this assignment.

Target approximately **2–3 focused tests**, covering central behavior such as:

- CSV import into an empty database
- Skipping import when records already exist
- Rejection of invalid CSV data or validation of important KPI logic

Prefer tests that cover real behavior rather than superficial implementation details.

## 11. Docker

Docker Compose is required for convenient startup.

The eventual goal is to launch the complete application with a simple command, for example:

```bash
docker compose up --build
```

Ensure that:

- The backend starts correctly.
- The frontend can access the API.
- SQLite storage is handled appropriately.
- The CSV is available in the backend container.
- Initial database population works.
- Subsequent starts do not duplicate data.

Avoid introducing unnecessary infrastructure services.

## 12. Optional AI Features

The original assignment includes optional AI-assisted features such as:

- Management summary
- Communication quality assessment

These were deliberately deprioritized.

The core dashboard, data import, visualizations, filtering, tests, Docker setup, and documentation should take precedence.

Do not introduce an external AI integration unless explicitly requested.

## 13. README Requirements

The README should document:

- Project purpose
- Technology stack
- Local startup instructions
- Docker startup instructions
- Testing instructions
- Architecture
- Data model
- KPI definitions
- Visualizations
- Filtering
- Synthetic data generation
- Intentional anomalies
- AI usage
- Assumptions
- Dataset limitations
- Possible future improvements

### Synthetic Data Documentation

The dataset was created with AI assistance.

Document the three anomalies and their measured values:

1. Midday inbound peak: 232/458 inbound events (50.7%)
2. Support waiting time: 62.5 seconds vs. 28.2–45.4 seconds elsewhere
3. Waiting time/quality correlation: approximately −0.571

These statistics refer to the 600-record dataset and must be recalculated if the CSV changes.

Document that:

- Data is entirely synthetic.
- Phone numbers use Austrian prefixes but are not verified as unassigned.
- QualityScore is simulated.
- The anomalies are intentionally generated.
- The dataset is not representative of a real contact center.
- Correlation does not establish causation.

## 14. Dataset Reproducibility

The original dataset was generated with Python assistance.

The exact original generator source code was not preserved.

A future improvement would be a standalone script such as:

`tools/generate_test_data.py`

It should ideally support:

- Deterministic random seed
- Configurable event count
- Four departments
- Unique numeric extensions
- Synthetic Austrian-format phone numbers
- Realistic status/duration combinations
- Three intentional anomalies
- Automatic data validation
- Summary statistics

**Important:** Do not assume a newly reconstructed generator will reproduce the existing CSV byte-for-byte.

The current CSV remains the authoritative dataset unless explicitly replaced.

## 15. Implementation Priorities

Suggested remaining work:

1. Inspect the existing backend entity, DbContext, and Program.cs.
2. Implement and integrate the CSV importer.
3. Verify all 600 records import successfully.
4. Confirm the existing dashboard works with the imported data.
5. Implement or finish the period filter.
6. Add the waiting-time/quality scatter plot.
7. Add 2–3 meaningful tests.
8. Complete Docker Compose setup.
9. Finalize README documentation.

These priorities may change based on what is already present in the repository.

## 16. Working Principles for Codex

- Inspect existing code before making changes.
- Reuse existing naming conventions and project structure.
- Prefer small, targeted modifications.
- Avoid unnecessary files and abstractions.
- Do not introduce authentication or other unrelated features.
- Do not add a separate data seeder.
- Keep the CSV as the synthetic-data source of truth.
- Preserve the documented anomalies.
- Avoid changing existing API contracts without a concrete reason.
- Prefer working, understandable code over elaborate architecture.
- Run the relevant build and tests after changes.
- Clearly report what was changed and any remaining limitations.

The immediate task is to **implement the CSV importer against the actual existing backend code**, rather than blindly copying a generic implementation.
