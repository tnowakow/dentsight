# Dentsight — Industry Requirements & Dental Workflow Specification

## 🎯 Mission Statement
Dentsight is not a reporting tool; it is an **EBITDA integrity engine**. Its purpose is to protect the valuation of independent dental practices by surfacing real-time "leakage" events—identifying where clinical production fails to convert into realized collections.

---

## 🦷 1. Dental Practice Workflows & Terminology

To ensure Dentsight provides actionable intelligence, all features must be grounded in standard dental terminology and the fundamental "Production-to-Collection" workflow.

### A. The Revenue Workflow
The lifecycle of a dental dollar follows a specific chain. Dentsight monitors for breaks in this chain:
1.  **Patient Appointment (Hygiene/Restorative):** The start of clinical activity.
2.  **Procedure Execution (CDT Codes):** Using standard CDT (Current Dental Terminology) codes to track what was done.
3.  **Production:** The gross dollar value of the procedures rendered (the "top line").
4.  **Claim Submission:** Sending data to payers (Insurance/Medicaid).
5.  **Claims Processing & Denials:** The period where insurance companies may reject or underpay claims.
6.  **Collections:** The actual cash received by the practice (the "bottom line").

### B. Critical Terminology
*   **CDT Codes:** The universal language of dental procedures (e.g., D0120 for periodic exam, D2740 for crown). Dentsight must aggregate production based on these codes to identify high-value/high-risk categories.
*   **Production vs. Collections Gap:** The most critical "truth" metric. A large gap indicates poor Revenue Cycle Management (RCM) or rising denial rates.
*   **DSO Language (Dental Service Organization):** As practices move toward acquisition, terms like **"EBITDA Normalization,"** **"Add-backs,"** and **"Multiples"** become the primary language of negotiation. Dentsight must translate clinical metrics into this financial language.
*   **Unscheduled Treatment Value:** The total dollar amount of "planned" procedures (in the treatment plan) that have not yet been booked on the schedule. This represents latent revenue.

---

## 📊 2. Key KPIs for Dental Practice Owners

Dentsight focuses exclusively on high-impact, EBITDA-driving metrics. We ignore "vanity" metrics like total patient count in favor of efficiency and leakage metrics.

### A. The Efficiency Engine (Clinical)
*   **Hygiene Re-appointment Rate:** % of hygiene patients who leave the office with their next visit scheduled. *Low rates indicate a failure in the practice's primary revenue engine.*
*   **Cost per Chair Hour:** Total clinical labor and supply costs divided by total scheduled production hours. *This identifies if the practice is over-staffed or under-utilizing expensive operatory space.*

### B. The Revenue Integrity Engine (Financial)
*   **Net Collection Rate:** (Total Collections / Total Production) × 100. *The ultimate metric for RCM health.*
*   **Denial Rate by Payer:** % of claims rejected/denied by specific carriers (e.MM., United Healthcare, Delta Dental). *High rates trigger alerts to renegotiate or change billing workflows.*
*   **Days Sales Outstanding (DSO):** The average time it takes to collect payment after a procedure is completed.

---

## 💰 3. Valuation Methodology & EBITDA Integrity

Dentsight's "Valuation Engine" must move beyond simple multipliers to provide an **EBITDA Integrity Scorecard**.

### A. EBITDA Normalization
A practice's reported EBITDA is often inflated by unadjusted owner expenses. Dentsight provides the "true" number using:
*   **Owner-Comp Normalization:** Adjusting owner salary and bonuses to a market-rate standard (Target range: **25–30% of collections**; avoid the aggressive 35% assumption).
*   **Add-back Identification:** Identifying non-recurring or discretionary expenses (e.g., one-time equipment repairs, personal travel, family member payroll) to reveal the true earning potential.

### B. Valuation Range Calculation
We do not provide a single "price tag." We provide a **Valuation Range** based on:
*   **Market Multiples:** Applying current market-clearing multiples for "add-on" practice deals (**6.5x – 7.0x EBITDA**).
*   **Sensitivity Analysis:** A feature that shows how the valuation shifts if the owner-comp percentage or the market multiple changes by ±0.5x.

---

## 🧪 4. Defined Test Scenarios

To validate the Alert Engine and Valuation Engine, the following scenarios must pass QA:

| Scenario ID | Trigger Event | Expected System Response |
|-------------|---------------|--------------------------|
| **TEST-01** | Hygiene re-appointment rate drops from 85% to 78%. | **CRITICAL ALERT:** "Hygiene re-appointment rate dropped below 80% (Current: 78%) — potential revenue loss detected." |
| **TEST-02** | United Healthcare denial rate hits 11%. | **WARNING ALERT:** "Denial rate for [Payer] exceeded 8% threshold. Review claim submissions for error patterns." |
| **TEST-03** | EBITDA is \$500k; Multiplier is 6.8x. | **VALUATION UPDATE:** Valuation range displays as \$3.4M - \$3.5M (allowing for small sensitivity buffer). |
| **TEST-04** | Owner-comp normalization is adjusted from 35% to 28%. | **INTEGRITY CHECK:** The "True EBITDA" increases, and the valuation range shifts upward accordingly. |

