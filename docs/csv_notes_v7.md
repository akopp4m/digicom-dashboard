# Synthetic Test Data — v7

These notes document the synthetic test data required by §4 of [Digicom_Aufgabenstellung.pdf](Digicom_Aufgabenstellung.pdf): generation, AI assistance, assumptions, intentional anomalies, plausibility checks, and limitations. KPI definitions and visualization explanations also support §5–7 and the submission documentation in §12.

The dataset copy in this folder is `digicom_communications_v7.csv`. The application imports the identical `backend/Digicom.Api/data/digicom_communications_v7.csv` file, relative to the repository root. Statistics were recalculated directly from v7 on 14 October 2026.

## Relation to the exercise

| Exercise requirement | Dataset implementation |
| --- | --- |
| Only synthetic communication data | Artificial communication events and identifiers; no real customer records were used intentionally |
| At least 300 events over several workdays | 793 events across 20 weekdays in the original CSV |
| CSV or JSON input | CSV, imported into SQLite on initial application startup |
| Required fields and phone channel | All 11 listed fields; `CallerNumber` implements “Anrufernummer,” and `Agent` is the selected extension |
| QualityScore from 1 to 5 | Scores use this range when present; restriction to answered inbound contacts is a project assumption, not specified by the exercise |
| AI-assisted data creation or conception | AI assistance was used to design and generate synthetic data and deliberate patterns |
| At least three deliberate anomalies | Midday inbound concentration, elevated Support waiting times, and lower quality at longer waits, measured below |
| Document plausibility and weaknesses | Checks, modeling assumptions, and limitations are described below |

The exercise's AI-assisted **test-data creation** requirement is separate from its optional runtime management-summary and quality-assessment features. These notes describe data creation; they do not claim a runtime AI integration.

## Generation and AI usage

The dataset contains **793 synthetic phone communication events** across **20 weekdays**, from **14 September to 9 October 2026**. It is intended to demonstrate dashboard KPIs, filtering, and visualizations, rather than represent a real contact center.

The data was developed iteratively with AI assistance: define the field structure and departments, generate artificial phone events, introduce operational patterns, and revise the data after plausibility checks. AI assisted with data generation and the design of relationships between direction, status, duration, waiting time, and quality. The generated values were then checked programmatically rather than accepted as evidence of real operational behavior.

No real customer or communication data was intentionally used. The exact original generator and complete generation prompts were not preserved, so the checked-in CSV is the reproducible input artifact rather than the output of a preserved generator. A precise prompt or byte-for-byte regeneration procedure cannot be supplied from the available artifacts.

### v7 correction

v7 was derived from v6 by clearing QualityScore on **90 unanswered inbound contacts**:

| Status | Scores cleared |
| --- | ---: |
| Missed | 37 |
| Abandoned | 36 |
| Failed | 17 |
| **Total** | **90** |

All **544 answered inbound scores** were preserved. No rows were added or removed, and all other field values remained unchanged. Outbound contacts already had no quality scores.

## Data structure

| Field | Description |
| --- | --- |
| `Timestamp` | Communication date and time, without a timezone suffix in the CSV |
| `Direction` | `inbound` or `outbound` |
| `Channel` | Always `phone` |
| `CustomerId` | Synthetic customer identifier |
| `Department` | Support, Sales, Accounting, or Orders |
| `Agent` | Positive numeric telephone extension; each extension belongs to one department |
| `CallerNumber` | Synthetic phone number using the Austrian `+43` prefix |
| `DurationSeconds` | Conversation duration in seconds |
| `WaitingTimeSeconds` | Waiting time in seconds |
| `Status` | `answered`, `missed`, `abandoned`, or `failed` |
| `QualityScore` | Integer from 1 to 5 for answered inbound contacts; empty for all other contacts |

An empty QualityScore means **not rated**, not zero. The score column is retained on every row, but its value is nullable. The exercise lists QualityScore as 1–5 without defining missing ratings. This implementation deliberately limits ratings to answered inbound conversations; it does not claim that the exercise requires this restriction.

## Distribution

| Department | Events | Agent extensions | Average inbound wait | Average answered inbound quality |
| --- | ---: | --- | ---: | ---: |
| Support | 430 | 20–29 | 129.05 s | 2.70 / 5 |
| Sales | 150 | 31–33 | 36.82 s | 4.13 / 5 |
| Accounting | 85 | 41–42 | 36.19 s | 3.91 / 5 |
| Orders | 128 | 51–53 | 47.09 s | 3.69 / 5 |
| **Total** | **793** | **18 distinct extensions** | | |

| Direction | Events |
| --- | ---: |
| Inbound | 651 |
| Outbound | 142 |

| Status | Events |
| --- | ---: |
| Answered | 668 |
| Missed | 55 |
| Abandoned | 43 |
| Failed | 27 |

Daily volumes range from **24 to 167 contacts**, averaging **39.65 contacts** per represented weekday.

## Synthetic anomalies and measured patterns

The following three patterns were deliberately modeled to make the dashboard useful for analytical exploration, as requested in §4. They correspond to the exercise's examples of time-of-day load peaks, increased waiting times, and poorer quality at longer waits. The figures describe synthetic patterns, not real business findings. v7 also contains additional daily volume spikes.

### 1. Midday inbound concentration

**257 of 651 inbound contacts (39.5%)** occur between **11:00 inclusive and 13:00 exclusive**, using the CSV clock times.

The hourly contact chart available for Today or Yesterday can show time-of-day patterns in the selected day. Longer periods use daily aggregation, so the full-dataset midday concentration is not directly displayed in that view. Browser-local display can shift the visible hours relative to the CSV/UTC clock times.

### 2. Elevated waiting times in Support

Support's average inbound waiting time is **129.05 seconds**, compared with **36.19–47.09 seconds** in the other departments. Its average answered inbound QualityScore is also lower: **2.70**, compared with **3.69–4.13** elsewhere.

The department waiting-time and quality charts expose this pattern. Increased demand or insufficient capacity are possible interpretations of the synthetic scenario, not proven causes.

### 3. Waiting time and quality relationship

Across the **544 answered inbound contacts**, the Pearson correlation between WaitingTimeSeconds and QualityScore is **−0.6264**. The calculation uses paired values from those contacts only.

| Waiting time | Rated contacts | Average QualityScore |
| --- | ---: | ---: |
| 0–25 seconds | 104 | 4.26 |
| 26–50 seconds | 112 | 3.88 |
| 51–90 seconds | 94 | 3.49 |
| Over 90 seconds | 234 | 2.52 |

These summary bands are used to describe the relationship numerically and differ from the chart's bands. The dashboard heatmap uses `[0, 15)`, `[15, 30)`, `[30, 60)`, `[60, 90)`, `[90, 120)`, and `[120, ∞)` seconds. Each cell shows a rating's share of rated contacts within that waiting-time band, rather than its share of the entire dataset.

The existing chart selects inbound contacts with a non-null score. With v7, that selection contains only answered inbound contacts. Correlation does not establish causation, and the heatmap does not calculate or display the Pearson coefficient.

### Additional daily volume spikes

**8 October contains 167 contacts**, and **9 October contains 89**. Together they account for **256/793 contacts (32.3%)**. The preceding 18 represented weekdays average **29.83 contacts per day**. The daily contacts-over-time chart makes these spikes visible.

## KPI calculation populations

The following figures use the complete, unfiltered v7 dataset:

| KPI | Definition | Value |
| --- | --- | ---: |
| Average duration | Mean duration of all answered contacts, both directions | 314.53 s |
| Average waiting time | Mean waiting time of all inbound contacts, all statuses | 89.13 s |
| Average QualityScore | Mean non-null score of answered inbound contacts | 3.30 / 5 |
| Reachability | Answered inbound / all inbound × 100 = 544/651 × 100 | 83.56% |

Department averages use these same populations restricted to the department. Counts include both directions unless explicitly labeled inbound or outbound. Missing averages and rates with no eligible denominator are unavailable, rather than zero.

## Assumptions and plausibility checks

The structural and business plausibility review checked all 793 rows for:

- All 11 columns and nonempty required values, except the intentionally nullable QualityScore.
- Allowed direction, channel, and status values.
- Parseable timestamps on 20 weekdays in the original date range.
- Positive numeric extensions, with no extension shared between departments.
- Caller numbers beginning with `+43`; this is a format check, not validation that a number is unassigned.
- Nonnegative durations and waits; positive duration on answered contacts and zero duration on unanswered contacts.
- Zero waiting time on outbound contacts.
- A score from 1 to 5 on every answered inbound contact and no score on any other contact.
- Identical documentation and API copies, preservation of all non-score values from v6, and exactly 90 cleared scores.

Dataset-level checks also recalculated the department and status distributions, event counts per date, midday concentration, departmental waits, and waiting-time/quality correlation. These establish that the dataset contains the intended patterns and meets the minimum size and original-workday requirements.

All checks passed. These are review checks on the dataset, not a claim that the startup importer enforces every rule. In particular, the importer currently rejects outbound scores but does not reject scores on unanswered inbound contacts.

Unanswered contacts are modeled with zero conversation duration, including abandoned contacts. The assignment associates abandoned contacts with “Sprachbox”; voicemail recording duration is not modeled separately.

## Import and timezone behavior

The application treats CSV clock values as UTC. On first import into an empty database, one common offset shifts the latest source date to the current UTC date. This preserves time-of-day and relative spacing, but does not preserve the original weekdays. Shifted data can include weekends or contacts later on the current day.

Dates are not shifted again on restart, and an existing database is not refreshed when the CSV changes. A database initialized from v6 retains the old unanswered quality scores until reset and imported from v7.

Period filters use browser-local calendar days and send ISO timestamps to the API. The API applies `[from, to)`: an inclusive start and exclusive end. Charts also display timestamps in browser-local time, so displayed dates and hours can differ from the CSV clock values.

## Limitations

- The data and ratings are synthetic, and anomalies are deliberately modeled; they are not real operational findings.
- Austrian-format subscriber numbers are not verified as unassigned, despite no intentional use of real customer data.
- QualityScore does not represent actual customer feedback. There are no ratings for unanswered or outbound contacts.
- One phone channel, four departments, and 793 events do not represent a production contact center.
- Holidays, staffing schedules, transfers, voicemail recordings, and complex routing behavior are not modeled separately.
- The original generator was not preserved, so regenerating this exact dataset from a seed is not currently supported.
- Timestamp shifting is a demo convenience and can reduce calendar realism. The UTC assumption and browser-local presentation must be considered when interpreting time-of-day patterns.
