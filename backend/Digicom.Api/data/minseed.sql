INSERT INTO CommunicationEvents
    (Timestamp, Direction, Channel, CustomerId, Department, Agent, CallerNumber,
     DurationSeconds, WaitingTimeSeconds, Status, QualityScore)
VALUES
    ('2026-10-05 08:15:00', 'Inbound',  'Phone', 'CUST-001', 'Sales',      'EXT-101', '+436601234567',
     185, 12, 'Answered', 5),

    ('2026-10-05 08:42:00', 'Inbound',  'Phone', 'CUST-002', 'Support',    'EXT-203', '+436602345678',
     420, 48, 'Answered', 3),

    ('2026-10-05 09:10:00', 'Outbound', 'Phone', 'CUST-003', 'Sales',      'EXT-102', '+436603456789',
     95,  0, 'Answered', 4),

    ('2026-10-05 09:35:00', 'Inbound',  'Phone', 'CUST-004', 'Support',    'EXT-204', '+436604567890',
     0,   75, 'Abandoned', 1),

    ('2026-10-05 10:20:00', 'Inbound',  'Phone', 'CUST-005', 'Accounting',  'EXT-301', '+436605678901',
     30,  20, 'Missed', 1);