## Synthetic Test Data

The application uses a CSV dataset containing **600 synthetic phone communication events** across 20 working days (September 14 – October 9, 2026).

The dataset was generated with AI assistance and is intended to provide realistic-looking communication patterns for demonstrating dashboard KPIs, filtering, and data visualizations. No real customer or communication data was used.

### Data Structure

Each event contains the following fields:

| Field                | Description                                                            |
| -------------------- | ---------------------------------------------------------------------- |
| `Timestamp`          | Date and time of the communication                                     |
| `Direction`          | `inbound` or `outbound`                                                |
| `Channel`            | `phone`                                                                |
| `CustomerId`         | Synthetic customer identifier                                          |
| `Department`         | Support, Sales, Accounting, or Orders                                  |
| `Agent`              | Numeric agent extension, unique across departments                     |
| `CallerNumber`       | Synthetic phone number using Austrian country and area/mobile prefixes |
| `DurationSeconds`    | Call duration in seconds                                               |
| `WaitingTimeSeconds` | Waiting time in seconds                                                |
| `Status`             | `answered`, `missed`, `abandoned`, or `failed`                         |
| `QualityScore`       | Simulated quality rating from 1 to 5                                   |

### Data Distribution

| Department |  Events | Agent extensions         |
| ---------- | ------: | ------------------------ |
| Support    |     318 | 21–24                    |
| Sales      |     122 | 31–33                    |
| Accounting |      62 | 41–42                    |
| Orders     |      98 | 51–53                    |
| **Total**  | **600** | **12 unique extensions** |

Daily event volumes vary between 24 and 39 contacts, with an average of 30 contacts per working day. This variation avoids artificially uniform daily volumes.

### Intentionally Introduced Anomalies

Three anomalies were deliberately introduced to make the dataset useful for analytical exploration.

**1. Inbound traffic peak around midday**

232 of 458 inbound events (50.7%) occur between 11:00 and 13:00.

This creates a noticeable traffic spike in the contacts-over-time visualization and simulates a period of unusually high incoming demand.

**2. Elevated waiting times in Support**

Support has significantly higher average waiting times for inbound calls than the other departments.

| Department        | Average inbound waiting time |
| ----------------- | ---------------------------: |
| Support           |                 62.5 seconds |
| Other departments |            28.2–45.4 seconds |

This anomaly is visible in the waiting-time-by-department visualization and may indicate insufficient capacity or increased workload.

**3. Negative relationship between waiting time and quality**

Longer waiting times are associated with lower simulated quality ratings for answered inbound calls.

The Pearson correlation coefficient is approximately **−0.571**.

The relationship includes random variation rather than being strictly deterministic. This makes it suitable for a scatter plot showing the relationship between waiting time and QualityScore.

### Assumptions and Plausibility

- All records are synthetic.
- Austrian country, mobile, and geographic prefixes are used, but the generated numbers are not verified as assigned or unassigned.
- Agent extensions are numeric and do not overlap between departments.
- Answered calls have a positive duration.
- Unanswered calls have a duration of zero.
- Outbound calls have no waiting time.
- QualityScore is populated for all records to satisfy the dataset schema, including unanswered calls.
- The dataset spans multiple working days and includes variation in call volume, duration, waiting time, and quality.
- When imported, timestamps can be shifted by a common offset relative to the current date while preserving their original distribution.

### Limitations

The dataset is designed for demonstration and testing, not for drawing real operational conclusions.

In particular:

- The anomalies were deliberately introduced rather than discovered in real communication data.
- QualityScore values are simulated and do not represent actual customer feedback.
- The negative correlation between waiting time and quality is an intentional modeling assumption and does not establish causation.
- The dataset does not model holidays, staffing schedules, call transfers, or complex contact-center routing behavior.
- The relatively small dataset of 600 events is not statistically representative of a production environment.

### AI Usage

AI assistance was used to design and generate the synthetic dataset, define realistic field relationships, and introduce the three documented anomalies.

The generated data was checked for structural consistency, valid categorical values, plausible status/duration combinations, and the presence of the intended anomalies.
