# Backend requirements review

Reviewed against `../Digicom_Aufgabenstellung.pdf` (German, 11 pages).
Scope: backend source, schema/migration, CSV, tests, Dockerfile, repository README/Compose, and frontend consumers relevant to the API contract. No browser or Docker runtime verification was performed. AI features are optional and reduced test coverage is accepted per user clarification. `minseed.sql` is excluded from scope and will be deleted separately.

## Changes made

- Renamed `DashboardResponse`, `CommunicationEventResponse`, and `DepartmentStatisticsResponse` to `DashboardDto`, `CommunicationEventDto`, and `DepartmentStatisticsDto`, including calculation service and test references. JSON property names remain unchanged; generated OpenAPI schema names change.
- Split combined CSV validation checks into field-specific errors, including record and row context. Validation still stops at the first error and inserts nothing when validation fails. Row numbering assumes the supplied single-line CSV records; multiline quoted records would need parser-provided physical row numbers.
- Explained why case-insensitive conversion is configured separately for three enum types: CsvHelper caches converter options by CLR type. These are three distinct settings, not repeated configuration of one option.

## Requirements cross-check

| Requirement | Finding |
| --- | --- |
| CSV/JSON input (§3–4) | CSV importer exists; startup imports only into an empty database. JSON is an alternative, not additionally required. |
| At least 300 events over several workdays (§4) | CSV has 793 records on 20 weekdays, 2026-09-14 through 2026-10-09. |
| Required fields and categorical values (§4) | Entity and CSV contain all specified fields. CallerNumber corresponds to Anrufernummer. Agent is modeled as an integer extension. |
| At least three deliberate anomalies (§4) | Data shows high Support waits, low Support quality, and volume peaks on October 8–9. Intentional construction and AI provenance are not documented in the repository README. |
| Central KPIs (§5) | All listed scalar counts, averages, reachability, and department statistics are calculated. Time development is supplied as event timestamps and aggregated by the frontend. |
| At least two visualizations (§6) | Frontend source contains contact trend, department count/wait/quality charts, and a wait/quality heatmap. Rendering was not verified. |
| At least one filter (§7) | Backend supports a UTC date range, inclusive start and exclusive end; calculations use the filtered records. No other filter is required. |
| Docker startup (§3) | Backend Dockerfile and root Compose/Nginx integration exist. Root README documents startup. Images were not built in this review. |
| AI (§8–10) | Optional per user clarification. Both AI files are empty placeholders. No requirement gap counted. |
| Tests (§11) | Nine existing tests pass after changes. Reduced coverage is accepted. |
| README and technical documentation (§4–5, §12) | Root README covers startup and persistence, but lacks KPI definitions, data generation/provenance, assumptions, anomaly design, limitations, and test commands. Optional AI/routing descriptions can explicitly say they are not implemented. |

The PDF itself is inconsistent: page 1 labels AI optional, page 2 includes it among minimum requirements. Routing recommendations appear in testing/documentation sections without a defined feature elsewhere. Neither is treated as additional required work here.

## Findings, ordered by practical impact

### 1. Timestamp ordering is an implicit API dependency

`GetDashboard.cs:55` materializes the query without `OrderBy`. SQL does not guarantee row order. The frontend contact-trend chart uses the first and last records as the full-history range, then assumes every event has a bucket. Unordered data can therefore truncate the range or cause a missing-bucket error.

Recommendation: explicitly order the endpoint query by Timestamp, then Id, or make the chart calculate min/max timestamps. The backend ordering provides a clear API contract.

### 2. UTC is assigned on import but not preserved by the SQLite model

`CommunicationCsvImporter.cs:59` labels timestamps UTC with `DateTime.SpecifyKind`; this labels the clock time rather than converting from a source timezone. The CSV has no timezone suffix, so its timezone must be an explicit assumption. The SQLite DateTime mapping does not retain DateTime.Kind on round-trip; no UTC read conversion is configured in AppDbContext. Consequently response timestamps can lack `Z`, and browser parsing can interpret them as local time. Existing tests compare clock values but do not assert Kind or serialized timezone suffixes.

Recommendation: document the CSV timezone, convert appropriately at ingestion, and ensure retrieved/serialized instants have an explicit UTC representation. Check browser-local date filtering against this same convention.

### 3. KPI and heatmap quality populations differ

`DashboardCalculationService.cs:110` averages QualityScore only for answered inbound events. The frontend heatmap includes every scored inbound event, including missed/abandoned/failed records. The CSV contains scores for some unanswered contacts, so this is a real population difference.

The PDF requests an average QualityScore without defining that restriction. Neither choice is automatically wrong, but the displayed KPIs and visualization need clear, consistent labels or a common population. The DTO omits Status, so the heatmap cannot independently reproduce the backend's answered-only filter.

Recommendation: explicitly define the intended quality population. Either include all scored inbound contacts in both places, or expose Status/filter heatmap data to match answered-only scoring.

### 4. Missing observations become misleading zero scores

The calculation service returns 0 when there are no usable QualityScores, no answered calls, or no inbound calls. QualityScore has a valid range of 1–5, so zero means no data, not poor quality. A department with only outbound events also receives zero wait/quality values.

Recommendation: document zero as a no-data convention or return nullable averages/rates and show an unavailable indicator. Rates with zero denominators deserve the same explicit convention.

### 5. Dataset dates change silently and only on first import

`CommunicationCsvImporter.cs:54–59` shifts the latest source date to the current UTC date. This is absent from the README. A weekday-only dataset can shift onto weekends; preserved intervals do not preserve original weekdays. Events later today can appear to be in the future. A persistent/restarted database does not shift again, so today's demo may become empty later.

Recommendation: document this demo behavior and timezone assumptions, or preserve source dates and choose a default filter that covers the dataset. Injecting TimeProvider would make the behavior deterministic if it is retained.

### 6. Documentation is the main remaining requirements gap

The root README explains Docker/local startup and ephemeral SQLite well, but does not describe KPI formulas, synthetic-data creation and AI involvement, deliberate anomalies, plausibility checks, known limitations, or running tests.

Current formulas to document:

- Duration: mean DurationSeconds over answered events, both directions.
- Wait: mean WaitingTimeSeconds over all inbound events, all statuses.
- Quality: mean non-null QualityScore over answered inbound events.
- Reachability: answered inbound / all inbound × 100.
- Department volume: all events in the department, both directions.
- Department averages: the same wait/quality populations restricted to that department.
- Filter: `[from, to)`, with both UTC boundaries supplied together, or neither for all history.

### 7. Query and payload scale with every event

The endpoint loads complete tracked-shape entities using AsNoTracking and returns one DTO per event. CustomerId, CallerNumber, Agent, Channel, and other fields are loaded even where calculations do not use them. Calculation performs several scans and three more scans per department; this remains linear and is entirely reasonable for 793 events, but response size and allocation grow with dataset size.

Recommendation for larger data: project only required fields; aggregate KPIs/time buckets/heatmap buckets in SQL or a single in-memory pass; return chart aggregates. Do not complicate the demo merely to optimize a small dataset.

### 8. Startup import has a concurrency assumption

The empty-database check occurs before the write transaction. Two app instances can both pass that check and import duplicates, or contend on SQLite. There is no source-event uniqueness constraint. Importing on application startup also means a missing/malformed CSV prevents the application starting. CSV reading is synchronous and does not observe cancellation while parsing.

Recommendation: document single-instance/demo use. If deployment expands, move initialization to a dedicated step or guard the check and insert as one serialized operation. SaveChanges already provides an insert transaction; the explicit current transaction does not guard the initial check.

### 9. Small clarity and maintenance issues

- Endpoint Console.WriteLine statements should be removed or replaced with structured debug logging.
- `ContactAmount` is less consistent than `ContactCount`/`TotalEvents`; changing it would alter the JSON contract and require a frontend update.
- HasMaxLength describes intent but SQLite does not enforce those string lengths. If length validation matters, enforce it explicitly rather than relying on the model annotation.
- Department grouping is case-sensitive in memory. Trim removes surrounding CSV whitespace, but `Support` and `support` remain separate departments unless normalized.
- Department and Status indexes are not used by the current date-only endpoint. Fine at this size, but they add write/storage cost without an existing query need.
- Relative SQLite connection paths depend on working directory, while CSV paths use ContentRootPath. The documented launch/container paths work; other launch directories may not.
- Explicit UTC-only date query parsing is stricter than an instant-based DateTimeOffset contract; document accepted query format or normalize offsets deliberately.

## Validator versus the document

| Existing rule | Requirements status |
| --- | --- |
| Nonempty timestamp, customer ID, department, caller number | Sensible interpretation of required fields. |
| Valid direction/channel/status | Explicit: inbound/outbound, phone, answered/missed/abandoned/failed. Numeric enum representations can still parse to defined enum values; if exact CSV tokens matter, use explicit converters. |
| QualityScore 1–5 when present | Explicit range; accepting null is a dataset assumption. PDF lists QualityScore for each record without defining null handling. |
| Agent integer > 0 | Assumption. PDF says selected extension, not a positive integer; leading zeros and nonnumeric extensions are not representable. |
| Nonnegative durations/waits | Sensible plausibility assumption, not an explicit numeric rule in the PDF. |
| Outbound waiting time = 0 | Assumption, not stated. Fits supplied data. |
| Outbound QualityScore must be null | Assumption, not stated. Fits supplied data but excludes future outbound ratings. |
| Answered duration > 0 | Assumption, not stated; excludes zero-length or rounded very short calls. |
| Unanswered duration = 0 | Assumption, not stated. Clarify whether abandoned means queue abandonment or voicemail: the PDF labels it “Sprachbox”, which may involve a nonzero recording duration. |

The validator does not check dataset-level minimum size, several workdays, or at least three anomalies. The supplied CSV satisfies size/workday checks; anomaly intent requires documentation rather than an unconditional production-import validation rule. It also cannot prove data is synthetic or AI-assisted: those are provenance/documentation requirements.

Existing validation policies were preserved. Split errors identify individual fields and records but do not collect every failure into a report. CSV parsing/header/conversion errors can still occur before business validation and retain CsvHelper's own diagnostics.

## Validation

`dotnet test --no-restore`: all 9 tests passed after the changes. Docker/browser behavior and proposed improvements were reviewed from source, not executed. No optional AI implementation or test expansion was added.
