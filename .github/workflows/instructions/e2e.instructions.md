---
applyTo: "tests/e2e/**/*"
---

# Playwright E2E Test Rules (Anti-Flaky)

## Non-negotiables
- NEVER use fixed waits: `waitForTimeout`, `sleep`, arbitrary delays.
- Tests must be deterministic and CI-safe.
- Prefer Playwright auto-waiting via locators and assertions.

## Selectors
- Prefer `data-testid` selectors only.
- Avoid brittle selectors:
  - No `nth-child`, deep CSS chains, or dynamic IDs.
  - Avoid text-only selectors unless the text is a stable UI label.
- If a stable selector does not exist, suggest adding a `data-testid`.

## Waiting & Sync
- After any action that triggers a UI change, assert the expected final state.
- Use explicit network waits only when required.
- Do NOT rely on timing assumptions.

## Assertions
- Every test MUST assert a final, user-visible outcome.
- If a test contains multiple assertions, use **soft assertions**:
  - `expect.soft(...)`
- Use hard assertions for critical setup or navigation checks.

## UI Consistency (Portfolio Requirement)
- All pages MUST use the **exact same header design as the Home page**.
- Do NOT create new header layouts, styles, or variants.
- Reuse the same:
  - HTML structure
  - CSS classes
  - Navigation layout
  - Branding elements
- If a header already exists on the Home page, it must be reused via:
  - shared component
  - partial include
  - layout wrapper
- If a page is missing the shared header, suggest importing or reusing the Home page header instead of redesigning it.

## Test Design
- One user flow per test.
- Tests must be isolated and order-independent.
- Avoid shared mutable state.

## Output Rules (Copilot)
- Generated tests must follow:
  - Arrange → Act → Assert
- If multiple validations are required, use soft assertions.
- If UI structure consistency is required, validate against the Home page structure.
- If requirements are unclear, ask for clarification instead of guessing.
