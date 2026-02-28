# Dashboard / Settings / Login Performance Audit (2026-03-01)

## Scope
- Login submit -> dashboard redirect
- Dashboard -> Settings route switch
- Settings -> Patients tab content render
- Settings -> Dashboard route switch

## Harness
- Script: `scripts/perf/measure_dashboard_settings_login.py`
- Runtime: `pnpm build` + `pnpm start` (production mode)
- Browser: Playwright Chromium (headless)
- Iterations: 5 route/tab loops (login measured once per run)

## Baseline (Before Optimization)
- `login_redirect p50`: `269.66ms`
- `dashboard_to_settings p50`: `250.23ms`
- `settings_patients_tab p50`: `1664.67ms`
- `settings_to_dashboard p50`: `68.93ms`

Raw summary:

```json
{
  "label": "baseline_before_optimization",
  "base_url": "http://127.0.0.1:3006",
  "iterations": 5,
  "results": {
    "login_redirect": {
      "samples_ms": [269.66],
      "p50_ms": 269.66,
      "p95_ms": 269.66,
      "avg_ms": 269.66
    },
    "dashboard_to_settings": {
      "samples_ms": [87.85, 202.2, 250.23, 254.59, 366.55],
      "p50_ms": 250.23,
      "p95_ms": 366.55,
      "avg_ms": 232.28
    },
    "settings_patients_tab": {
      "samples_ms": [422.31, 429.1, 1664.67, 1674.01, 1679.45],
      "p50_ms": 1664.67,
      "p95_ms": 1679.45,
      "avg_ms": 1173.91
    },
    "settings_to_dashboard": {
      "samples_ms": [58.37, 63.93, 68.93, 71.28, 71.33],
      "p50_ms": 68.93,
      "p95_ms": 71.33,
      "avg_ms": 66.77
    }
  }
}
```

## After Optimization
- `login_redirect p50`: `241.84ms` (-10.32%)
- `dashboard_to_settings p50`: `42.86ms` (-82.87%)
- `settings_patients_tab p50`: `12.56ms` (-99.25%)
- `settings_to_dashboard p50`: `42.41ms` (-38.47%)

Raw summary:

```json
{
  "base_url": "http://127.0.0.1:3007",
  "iterations": 5,
  "results": {
    "login_redirect": {
      "samples_ms": [241.84],
      "p50_ms": 241.84,
      "p95_ms": 241.84,
      "avg_ms": 241.84
    },
    "dashboard_to_settings": {
      "samples_ms": [34.36, 39.11, 42.86, 439.16, 812.48],
      "p50_ms": 42.86,
      "p95_ms": 812.48,
      "avg_ms": 273.59
    },
    "settings_to_dashboard": {
      "samples_ms": [30.36, 31.12, 42.41, 44.54, 54.06],
      "p50_ms": 42.41,
      "p95_ms": 54.06,
      "avg_ms": 40.5
    },
    "settings_patients_tab": {
      "samples_ms": [9.22, 9.94, 12.56, 12.71, 17.14],
      "p50_ms": 12.56,
      "p95_ms": 17.14,
      "avg_ms": 12.31
    }
  }
}
```

## Notes
- `dashboard_to_settings` has two high outliers in the post-run sample (`439ms`, `812ms`) while median dropped sharply.
- Patients tab empty-state latency shows the largest and most consistent improvement.
- For production verification, run the same script against the deployed URL with a dedicated test account.
