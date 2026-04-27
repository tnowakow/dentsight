# Dentsight — UX/UI Design Specification

**Author:** Sofia (UX/UI Designer)  
**Date:** 2026-04-26  
**Project:** Dentsight — Dental Practice Intelligence Dashboard  
**Status:** Draft for Review  

---

## 🎯 Design Principles

All designs must adhere to the following core pillars to ensure the product remains an **active intelligence engine** rather than a passive reporting tool:

1.  **Alert-First Interface:** The dashboard is driven by deviation from targets. Active alerts take visual precedence over all other content on the Home screen.
    *   *Rule:* If there are active alerts, they must be at the top of the viewport.
2.  **Benchmark Context Everywhere:** No number exists in a vacuum. Every metric *must* display:
    *   Current Practice Value (Actual)
    *   Internal Target (Practice-specific goal)
    *   Industry Average (External benchmark)
3.  **Mobile-First for Dentists:** The primary use case is "between patients" checking on a smartphone.
    *   *Rule:* Vertical stacking, large touch targets (min 4\\text{px}), and simplified chart views are mandatory for screens <768\\text{px}.
4.  **Professional Dark Mode Default:** Reduce eye strain in clinical environments. Use deep grays/blacks with high-contrast typography and purposeful color coding for alerts.

---

## 🧩 Global Design Components

### 1. Alert Component (The "Pulse" of Dentsight)
*Used in the Overview panel and as inline indicators in charts.*

| State | Color Code (Tailwind) | Icon | Usage Context |
|-------|-----------------------|------|---------------|
| **Critical/Warning** | `bg-amber-500/10` border: `border-amber-500` text: `text-amber-500` | ⚠️ (Alert Triangle) | Metric drifted >5% from target (e._g., Denial Rate, Re-appointment) |
| **Success** | `bg-emerald-500/10` border: `border-emerald-500` text: `text-emerald-500` | ✅ (Check Circle) | Metric met or exceeded target |
| **Information/Info** | `bg-blue-500/10` border: `border-blue-500` text: `text-blue-500` | ℹ️ (Info Circle) | Neutral updates or milestone notifications (e.g., new expense added) |

*   **Structure:** Icon $\\rightarrow$ Bold Headline $\\rightarrow$ Descriptive Subtext ("Value is $X, target was $Y") $\\rightarrow$ Action Link (if applicable).

### 2. Benchmark Indicator
A small UI element placed next to every metric value.
*   **Format:** `[Current Value] | [Target] | [Industry Avg]`
*   **Visuals:** Use color-coded arrows ($\\uparrow \\downarrow$) to indicate direction of change vs. previous period.

---

## 🖥️ Screen Specifications

### 1. Overview (Home) — "The Command Center"
*Goal: Immediate situational awareness.*

*   **Top Section: Active Alerts Panel**
    *   A vertical stack of the **Alert Components** described above.
    *   Cards should be dismissible once reviewed.
*   **Middle Section: Practice Health Score Summary**
    *   Large, central "Health Score" (0-100) represented by a semi-circular gauge or large numeric font.
    *   Below score: 3 rapid-fire KPI cards (e.g., Net Collection Rate, Hygiene Re-appointment, Denial Rate).
*   **Bottom Section: Valuation Preview & Quick Stats Grid**
    *   **Valuation Range Card:** Large text showing `$X.XM - $Y.YM` with a small "View Detailed Valuation" button.
    *   **Quick Stats Grid (2x2):**
        1. Monthly Production ($)
        2. Unscheduled Treatment Value ($)
        3. No-Show Rate (%)
        4. Case Acceptance (%)

### 2. Operations Tab — "Clinical Efficiency"
*Goal: Identify production leaks and staffing optimization.*

*   **Chart 1: Provider Hourly Production (Bar Chart)**
    *   Y-Axis: Dollars per Hour ($/hr).
    *   X-Axis: Providers (Doctor, Hygienist A, Hygienist B).
    *   Visuals: Each bar should have a horizontal "Target Line" overlay. Use different colors for Doctors vs. Hygienists.
*   **Chart 2: Appointment Metrics Table**
    *   Columns: `Metric Name`, `Current %`, `Trend (vs Prev Month)`, `Benchmark`.
    *   Rows: No-show %, Cancellation %, Case Acceptance %.
*   **Chart 3: Hygiene Re-care Trend (Line Chart)**
    *   X-Axis: Last 12 months.
    *   Y-Axis: % Re-appointment rate.
    *   Visuals: A shaded "Target Zone" area (e.g., 80-85%) behind the line chart.

### 3. Financials Tab — "Revenue Integrity"
*Goal: Monitor payer behavior and cost management.*

*   **Chart 1: Denial Rate by Payer (Horizontal Bar Chart)**
    *   Y-Axis: Payer Name (e.g., United Healthcare, Delta Dental).
    *   X-Axis: % Denial Rate.
    *   Alerting: Any bar exceeding the 8% threshold must be colored `amber-500`.
*   **Chart 2: Production Breakdown (Pie/Donut Chart)**
    *   Segments: Insurance, Patient Responsibility, HMO.
*   **Card: Cost Analysis Dashboard**
    *   Key Metric Cards: `Cost per Chair Hour`, `Supply Cost % of Prod`, `Lab Fee % of Prod`.
    *   All cards must include the Benchmark Indicator.

### 4. Valuation Tab — "Exit Readiness"
*Goal: Transparent, math-driven practice value estimation.*

*   **Section 1: EBITDA Calculation Breakdown (Accordion/List)**
    *   `Gross Production` $\\rightarrow$ `(+) Adjustments/Add-backs` $\\rightarrow$ `(=) Normalized EBITDA`.
    *   Each line item shows the dollar amount and a "Description" tooltip.
*   **Section 2: Add-backs List (Detailed Table)**
    *   Columns: `Item Name`, `Amount`, `Category (e.g., Owner Comp, One-time expense)`.
*   **Section 3: Valuation Range Visualization**
    *   A horizontal slider/range bar showing the spectrum from **Low Estimate** to **High Estimate**.
    *   The "Most Likely" value is marked with a distinct vertical line or pointer.
*   **Footer:** Large, high-visibility `Disclaimer` text in muted gray: *"Informational estimate only — not a certified appraisal."*

---

## 📱 Mobile Responsiveness Requirements

*   **Breakpoint: <768px (Mobile/Tablet)**
    *   **Navigation:** Convert Top Tab Bar to a Bottom Navigation Bar (fixed).
    *   **Layout:** All horizontal grids (2x2, etc.) must collapse into single-empty vertical stacks.
    *   **Charts:** 
        *   Horizontal bar charts remain; Vertical bar charts should switch to horizontal for easier scrolling on portrait screens.
        *   Line/Donut charts should be simplified (reduce data points if needed).
    *   **Touch Targets:** All buttons and interactive table rows must have a minimum height of `48px`.
    *   **Typography:** Scale down headers, but maintain high contrast for legibility in bright clinical lighting.

---

## 📝 Form Layouts & Inputs

### Manual Expense Input Form (Fallback for QuickBooks/Xero integration failure)
*Goal: Quick data entry for unintegrated expenses.*

*   **Field 1: Date Picker** (Default to `today`)
*   **Field 2: Category Dropdown** (`supplies`, `lab fees`, `rent`, `utilities`, `payroll`, `other`)
*   **Field 3: Amount Input** (Numeric keyboard, currency prefix `$`)
*   **Field 4: Description Text Area** (Short text for context)
*   **Field 5: Add-back Toggle** (Boolean switch: "Is this an EBITDA add-back?")
*   **Primary Action:** `[Save Expense]` (Full width, high contrast)
