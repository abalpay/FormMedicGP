#!/usr/bin/env python3
"""Measure dashboard/settings/login interaction timings using Playwright.

Example:
  python3 scripts/perf/measure_dashboard_settings_login.py \
    --base-url http://127.0.0.1:3000 \
    --email test@formbridgegp.dev \
    --password testtest \
    --iterations 7
"""

from __future__ import annotations

import argparse
import json
import math
import statistics
import time
from dataclasses import dataclass

from playwright.sync_api import Browser, Page, sync_playwright


@dataclass
class MetricSummary:
    samples_ms: list[float]
    p50_ms: float
    p95_ms: float
    avg_ms: float


def summarize(samples: list[float]) -> MetricSummary:
    sorted_samples = sorted(samples)
    if not sorted_samples:
        return MetricSummary(samples_ms=[], p50_ms=0, p95_ms=0, avg_ms=0)

    n = len(sorted_samples)
    p50 = statistics.median(sorted_samples)
    p95_index = min(n - 1, max(0, math.ceil(0.95 * n) - 1))
    p95 = sorted_samples[p95_index]
    avg = sum(sorted_samples) / n

    return MetricSummary(
        samples_ms=[round(value, 2) for value in sorted_samples],
        p50_ms=round(p50, 2),
        p95_ms=round(p95, 2),
        avg_ms=round(avg, 2),
    )


def wait_for_patients_content(page: Page) -> None:
    page.wait_for_function(
        """() => {
          return Boolean(
            document.querySelector('[data-testid="patients-empty"]') ||
            document.querySelector('[data-testid="patients-items"]') ||
            document.querySelector('[data-testid="patients-error"]')
          );
        }""",
        timeout=20_000,
    )


def run_measurements(
    browser: Browser,
    *,
    base_url: str,
    email: str,
    password: str,
    iterations: int,
) -> dict[str, MetricSummary]:
    context = browser.new_context()
    page = context.new_page()

    metrics: dict[str, list[float]] = {
        "login_redirect": [],
        "dashboard_to_settings": [],
        "settings_to_dashboard": [],
        "settings_patients_tab": [],
    }

    page.goto(f"{base_url}/login", wait_until="networkidle")

    page.locator("#email").fill(email)
    page.locator("#password").fill(password)

    t0 = time.perf_counter()
    page.locator('[data-testid="login-submit"]').click()
    page.wait_for_url("**/dashboard", timeout=30_000)
    page.wait_for_selector('[data-testid="dashboard-content"]', timeout=30_000)
    metrics["login_redirect"].append((time.perf_counter() - t0) * 1000)

    for _ in range(iterations):
        t0 = time.perf_counter()
        page.locator('aside a[href="/dashboard/settings"]').first.click()
        page.wait_for_url("**/dashboard/settings", timeout=20_000)
        page.wait_for_selector('[data-testid="settings-page"]', timeout=20_000)
        metrics["dashboard_to_settings"].append((time.perf_counter() - t0) * 1000)

        t0 = time.perf_counter()
        page.get_by_role("tab", name="Patients").click(force=True)
        wait_for_patients_content(page)
        metrics["settings_patients_tab"].append((time.perf_counter() - t0) * 1000)

        t0 = time.perf_counter()
        page.locator('aside a[href="/dashboard"]').first.click()
        page.wait_for_url("**/dashboard", timeout=20_000)
        page.wait_for_selector('[data-testid="dashboard-content"]', timeout=20_000)
        metrics["settings_to_dashboard"].append((time.perf_counter() - t0) * 1000)

    context.close()

    return {name: summarize(samples) for name, samples in metrics.items()}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default="http://127.0.0.1:3000")
    parser.add_argument("--email", required=True)
    parser.add_argument("--password", required=True)
    parser.add_argument("--iterations", type=int, default=5)
    parser.add_argument("--headed", action="store_true")
    parser.add_argument("--output", default="")

    args = parser.parse_args()

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=not args.headed)
        summary = run_measurements(
            browser,
            base_url=args.base_url.rstrip("/"),
            email=args.email,
            password=args.password,
            iterations=max(1, args.iterations),
        )
        browser.close()

    result = {
        "base_url": args.base_url,
        "iterations": max(1, args.iterations),
        "results": {
            key: {
                "samples_ms": value.samples_ms,
                "p50_ms": value.p50_ms,
                "p95_ms": value.p95_ms,
                "avg_ms": value.avg_ms,
            }
            for key, value in summary.items()
        },
    }

    pretty = json.dumps(result, indent=2)
    print(pretty)

    if args.output:
        with open(args.output, "w", encoding="utf-8") as file:
            file.write(pretty)


if __name__ == "__main__":
    main()
