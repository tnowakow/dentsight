# Functional Test Scripts — Dentsight

## 1. Alert Trigger Flow: Hygiene Re-care Drop
**Scenario:** Verify that an alert is generated when hygiene re-care rates fall below the defined target (80%).
- **Pre-conditions:** System is seeded with historical re-care data; current rate is >80%.
- **Test Steps:**
    1. Update `hygiene_recare_rate` for a specific practice to 75% via API or database seed.
    2. Trigger the alert engine processing job (or wait for scheduled interval).
    3. Check the 'Active Alerts' panel on the Overview Dashboard.
- **Expected Outcome:** An active alert card appears in the dashboard with a warning message: "Hygiene re-care rate dropped to 75% (target: 85%) — could be costing ~$12K/month".

## 2. Valuation Calculation Accuracy
**Scenario:** Verify that the valuation engine correctly calculates the practice value range based on EBITDA and market multiple.
- **Pre-conditions:** Practice data exists with $485,000 EBITDA and a multiplier of 6.8x.
- **Test Steps:**
    1. Navigate to the 'Valuation' tab.
    2. Inspect the calculated valuation range displayed on the dashboard.
- **Expected Outcome:** The displayed range must show a low estimate of $3.29M and a high estimate of $3.80M (matching the formula: $485K * 6.8 = $3.29M-$3.80M).

## 3. Denial Rate Flagging
**Scenario:** Verify that insurance denial rates are flagged when they exceed the 8% threshold for any payer.
- **Pre-conditions:** Database contains insurance claim data with various denial rates.
- **Test Steps:**
    1. Insert or update a record for 'United Healthcare' where `denial_rate` is set to 10%.
    2. Refresh the 'Financials' tab in the dashboard.
- **Expected Outcome:** A warning indicator (e.g., red text or icon) appears next to United Healthcare in the 'Denial rate by payer' chart, indicating a rate >8%.
