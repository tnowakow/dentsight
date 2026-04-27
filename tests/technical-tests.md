# Technical Test Scripts — Dentsight

## 1. API Endpoint Validation
**Scenario:** Ensure all core metrics and valuation endpoints are reachable and return valid JSON structures.
- **Endpoints to Test:**
    - `GET /api/v1/metrics/overview` (Verify presence of health score, production, etc.)
    - `GET /api/v1/alerts/active` (Verify alert array contains objects)
    - `GET /api/v1/valuation/estimate` (Verify EBITDA and range fields)
- **Test Steps:**
    1. Execute `curl` or use a test runner to hit each endpoint with a valid JWT.
- **Expected Outcome:** Each request returns HTTP 200 OK and a schema-compliant JSON response containing the expected keys.

## 2. Database Security: Row Level Security (RLS) Checks
**Scenario:** Verify that users can only access data belonging to their authenticated practice ID.
- **Pre-conditions:** Two separate practices exist in the database (`practice_A` and `practice_B`). Test user is authenticated as `user_A`.
- **Test Steps:**
    1. Execute a query via the API for `SELECT * FROM production_metrics WHERE practice_id = 'practice_B'`.
- **Expected Outcome:** The response returns an empty set or specifically filtered results that do not include `practice_B` data, proving RLS policies are correctly applied to prevent cross-tenant data leakage.

## 3. Error Handling & Resilience
**Scenario:** Verify the system handles invalid authentication and missing/malformed data gracefully.
- **Test Cases:**
    - **Invalid Token:** Send request with `Authorization: Bearer expired_token`.
        - **Expected Outcome:** HTTP 401 Unauthorized.
    - **Missing Data:** Request metrics for a practice that has zero historical records in the `appnt` table.
        - **Expected Outcome:** HTTP 200 OK with zeroed/null values (no system crash).
    - **Malformed Payload:** POST to valuation endpoint with invalid EBITDA string (`"EBITDA": "not_a_number"`).
        - **Expected Outcome:** HTTP 400 Bad Request with descriptive error message.
