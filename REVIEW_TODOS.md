# Final review: TODOs and documentation notes

Decisions agreed on 14 October 2026. This file records pending work; it does not implement changes or replace the final README and technical documentation.

## Implementation TODOs

- [ ] **Align the heatmap with the quality KPIs.** v7 clears quality scores on unanswered contacts, and the application and tests now reference v7. The chart's existing inbound/non-null filter therefore selects answered, rated inbound contacts from this dataset without changing the API contract. Update the heatmap label and verify its focused tests against this data rule. Existing databases retain their previously imported data until reset.
- [x] **Delete outdated project notes.** Deleted `codex-handoff.md` and `backend/BACKEND_REVIEW.md`. Relevant assumptions are preserved in the documentation checklist below for the final documentation. These files contained obsolete dataset counts, anomaly statistics, and findings that had already been resolved.

## Items to document

### Agreed scope and exclusions

- [ ] AI management summaries and AI quality assessments are optional and not implemented. Describe this explicitly; do not imply that empty placeholder files provide working AI features. Routing recommendations are also not implemented.
- [ ] Automated testing is deliberately limited, as agreed for the exercise. Describe the central behavior covered and the remaining coverage limits.
- [ ] Robust request-failure handling is outside the exercise scope. A failed period request can retain previous results while the dropdown shows the newly requested period, and the connection badge can still display “Dashboard aktiv.” Errors are logged to the console.
- [ ] Loading indicators, a retry action, and an explicit empty-results message are outside the exercise scope. Initial loading or failure can leave only the header visible; an empty period has no dedicated explanation.
- [ ] Accessibility was not a priority for this exercise. No WCAG AA or AXE compliance claim should be made. Known gaps include low contrast for small KPI unit text, charts without accessible data alternatives, and an English document language declaration despite predominantly German content.

### Data and time assumptions

- [ ] The authoritative dataset is `backend/Digicom.Api/data/digicom_communications_v7.csv`, currently containing 793 events. Recalculate final anomaly figures from this file rather than copying earlier 600-event statistics.
- [ ] Explain synthetic-data creation and AI assistance, the deliberate anomalies, plausibility checks, and limitations. State that quality scores are simulated and that synthetic Austrian-format phone numbers are not verified as unassigned.
- [ ] QualityScore is nullable and populated only for answered inbound contacts in v7. All 544 answered inbound contacts have scores; outbound and unanswered contacts have none. v7 clears 90 unanswered inbound scores from v6 and preserves all other values. This is an explicit assumption relative to the assignment's listed 1–5 field. The importer validates the score range and rejects outbound scores, but does not enforce the absence of scores on unanswered inbound contacts.
- [ ] CSV timestamps have no timezone suffix and are treated as UTC. On first import, one common offset moves the latest source date to the current UTC date while preserving time-of-day and relative spacing.
- [ ] Shifting dates does not preserve weekdays and can place contacts on weekends or later on the current day. Imported dates do not move again on restart, so “Today” can become empty as the demo ages. This behavior is accepted as outside the exercise scope.
- [ ] Period boundaries and chart display use the browser's local timezone. The frontend sends ISO timestamps to the API; the backend applies an inclusive start and exclusive end, `[from, to)`.
- [ ] Explain importer assumptions: positive numeric agent extensions, nonnegative durations and waits, positive duration for answered contacts, zero duration for unanswered contacts, and zero waiting time for outbound contacts. Explain the interpretation of abandoned contacts, including the assignment's “Sprachbox” terminology.

### Calculations and visualizations

- [ ] Document every count and the calculation populations: duration averages answered contacts in both directions; waiting time averages all inbound contacts; quality averages non-null scores on answered inbound contacts; reachability is answered inbound divided by all inbound, multiplied by 100.
- [ ] Department counts include both directions; department averages use the same populations restricted to each department. Missing averages and rates with no eligible denominator are unavailable, rather than zero.
- [ ] Describe all five charts, hourly versus daily contact aggregation, and how period filtering updates all KPIs and charts.
- [ ] Document that the heatmap filters inbound contacts with non-null scores and displays each rating's percentage within its waiting-time band. With v7 this population is answered inbound contacts. Databases previously initialized from v6 retain rated unanswered contacts until reset.

### Startup, architecture, tests, and limitations

- [ ] Include the technology stack, frontend/API/SQLite architecture, data model, local startup, Docker startup, and API usage.
- [ ] Explain that SQLite is stored in the backend container without a volume. Restart preserves the database; removing the container discards it. Startup applies migrations and imports the CSV only when no events exist.
- [ ] State the single-instance demo assumption and that a malformed or missing startup CSV prevents startup. Import initialization is not designed for concurrent backend instances.
- [ ] Include test commands: run `dotnet test --no-restore` from `backend` after restoring dependencies, and `pnpm test --watch=false` from `frontend/digicom-dashboard` after installing dependencies. The backend directory contains the test-runner configuration; running the command from the repository root does not select it automatically.
- [ ] Record known limitations and possible future improvements without presenting them as required exercise work.

## Review verification baseline

Before the pending TODOs, the review verified:

- 9 backend tests and 10 frontend tests passed.
- The Angular production build succeeded.
- Docker startup served the frontend and proxied API requests successfully.
- All scalar dashboard KPIs matched an independent calculation from the 793-row CSV.
- Valid, empty, and invalid API date filters behaved as expected.
- Restarting the backend returned identical dashboard data with no duplicate import.

Browser rendering, responsive layouts, and a full AXE audit were not verified. Rerun the relevant checks after implementing the heatmap change; this baseline is not verification of pending work.
