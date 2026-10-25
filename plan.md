# AI Evaluation Harness: Plan for Hugging Face Chatbot (Groq)

Yes. Since Antigravity can inspect, edit, run, and verify code across the workspace, the same “inspect → verify → ask → implement” discipline fits it well. Google describes Antigravity as an agent-first development environment that can operate across editor, terminal, and browser, which makes the guardrails especially important. [Google Antigravity](https://www.antigravity.google/docs/ide/overview/?utm_source=chatgpt.com)

For your Hugging Face chatbot using Groq, I would make the first version even simpler than the Agility plan: prove we can call the real chatbot, add deterministic checks, add one GEval quality metric, calibrate it against human labels, and only then expand.

## Phase 1 Goal
Build a small, trustworthy AI evaluation harness for the existing chatbot hosted on Hugging Face and powered by Groq.

Phase 1 should answer:
> **Can we automatically evaluate whether the real chatbot produces useful, correct, relevant responses using deterministic checks plus DeepEval?**

- Do not redesign the chatbot.
- Do not add LangGraph in Phase 1 unless discovery proves the chatbot already has a genuine multi-step workflow.

---

## Permanent Antigravity Rules
Add these project instructions where Antigravity will consistently see them.

### AI Evaluation Project Rules
1. Never invent endpoints, model names, prompts, schemas, requirements, secrets, or expected chatbot behavior.
2. Inspect the existing application first and cite the real file/function supporting each conclusion.
3. If required information cannot be verified, STOP and ask the human.
4. Never replace the real chatbot with a mock, stub, or reimplementation just to make the evaluation harness work.
5. Do not modify production chatbot behavior during Phase 1.
6. Do not read, create, or modify .env files without human approval.
7. Do not expose API keys, Hugging Face secrets, Groq credentials, tokens, or private user data.
8. DeepEval cloud reporting / Confident AI must remain disabled unless explicitly approved.
9. Do not modify production source files unless the human approves it. Prefer a dedicated `tests/ai` or `evaluation` directory.
10. Perform one step at a time, verify it, report the result, and STOP.

---

## Required Report After Every Step

```text
STEP:
WHAT I INSPECTED:
WHAT I CONFIRMED:
EVIDENCE:
- file:
- function/class:
- relevant finding:
WHAT I CHANGED:
HOW I VERIFIED IT:
RESULT: PASS / FAIL / BLOCKED
FILES CHANGED:
UNKNOWNS / BLOCKERS:
PROPOSED NEXT STEP:
```
*Do not proceed automatically.*

---

## STEP 1 — Discover the Real Chatbot Architecture
Inspect the project only. Do not modify code.

Identify:
- Hugging Face app framework
- UI entry point
- user-message handling
- Groq client initialization
- model name/configuration
- prompt construction
- system prompt if present
- conversation-history handling
- response parsing
- error handling
- existing tests
- existing test directory
- whether the chatbot can be invoked directly from Python
- whether tests must call a local function, HTTP endpoint, or the live Hugging Face app

Classify every finding as:
- `CONFIRMED`
- `UNKNOWN`
- `HUMAN INPUT REQUIRED`

If the real chatbot path cannot be called from automation, mark the step `BLOCKED`.
Do not create a replacement implementation.
Use the standard report and stop.

### Human Checkpoint After Step 1
Manually verify at least:
- Groq call location
- selected model
- prompt/system-prompt logic
If Antigravity's evidence does not match the code, stop and correct discovery before continuing.

---

## STEP 2 — Build the Smallest Real Baseline Test
Using only the confirmed chatbot path, create or execute one automated call to the real chatbot.
Do not add DeepEval yet.
Use a harmless prompt, for example an approved basic question.

Capture where safely possible:
- input prompt
- application model
- raw chatbot response
- parsed response
- request duration

Add only confirmed deterministic assertions such as:
- response is not empty
- response type is valid
- response parsing succeeds
- required fields exist

Do not assert semantic correctness yet.
If the real Groq-backed chatbot cannot be called, STOP.
Do not fall back to mocks.
Use the standard report and stop.

---

## STEP 3 — Create a Tiny Approved Fixture Set
Create 2–3 simple test prompts for harness validation.
These should be:
- non-sensitive
- easy for a human to judge
- representative of the chatbot's intended purpose

Do not invent the chatbot's intended domain.
If the expected chatbot scope is unclear, ask the human before creating fixtures.

Label synthetic fixtures clearly:
`SYNTHETIC / TEST-ONLY`

Example structure:
```json
{ "id": "basic-001", "input": "...", "purpose": "..." }
```
Do not create expected AI wording.
The goal is to exercise the real chatbot repeatedly, not force exact-text equality.
Use the standard report and stop.

---

## STEP 4 — Install and Configure DeepEval Safely
Inspect the repository's Python/dependency setup first.
Check for:
`pyproject.toml`, `requirements.txt`, `requirements-dev.txt`, `poetry.lock`, `uv.lock`
Check whether DeepEval already exists.
Add it only using the project's existing dependency-management strategy.
Do not upgrade unrelated dependencies.

Enforce:
```bash
DEEPEVAL_TELEMETRY_OPT_OUT=1
DEEPEVAL_DISABLE_DOTENV=1
```

Add a test preflight that fails if `CONFIDENT_API_KEY` is present.
Do not:
- run `deepeval login`
- enable Confident AI
- modify `.env`
- upload results externally

Verify DeepEval import and CLI operation with synthetic data only.
Record the DeepEval version.
Use the standard report and stop.

---

## STEP 5 — Add Deterministic Chatbot Checks
Extend the real chatbot baseline into a reusable evaluation harness.
Keep semantic judging out for now.
Possible checks, only if appropriate to the actual response structure:
- response exists
- response is parseable
- response is not blank
- no application exception occurred
- no raw provider error is shown to the user
- response structure is valid

Separate failure types:
- `APPLICATION_FAILURE`
- `GROQ/API_FAILURE`
- `AUTHENTICATION_FAILURE`
- `PARSING_FAILURE`
- `ASSERTION_FAILURE`

Do not call an API outage an AI-quality failure.
Run the 2–3 approved fixtures.
Use the standard report and stop.

---

## STEP 6 — Define the Human Quality Rubric
Do not run GEval yet.
First ask:
*What should a good chatbot answer mean for this specific chatbot?*

Draft a rubric from confirmed product goals.
Possible dimensions may include:
- correctness
- relevance
- clarity
- helpfulness
- scope adherence
- unsupported claims

Do not include dimensions that are not relevant to the chatbot.

Example only:
A good response should:
1. answer the user's question directly
2. remain factually correct
3. avoid unsupported claims
4. stay within the chatbot's intended scope
5. be understandable to the intended audience

The human must:
- `APPROVE`
- `MODIFY`
- `REJECT`

Also define the Phase 1 success criteria before seeing evaluator scores.
Use the standard report and stop.

### Human Labeling Guide
Build a small calibration dataset of approximately 10–20 chatbot responses.
Human reviewers label responses before seeing DeepEval scores.
Use:
- `GOOD`
- `BAD`
- `BORDERLINE`

Definitions:
- **GOOD:** The answer fulfills the approved rubric with no important defect.
- **BAD:** The answer has a major correctness, relevance, scope, or unsupported-claim problem.
- **BORDERLINE:** The answer is partly useful but has meaningful omissions, ambiguity, minor factual issues, or debatable quality.

Each label should include a short reason.
These labels are directional Phase 1 calibration data, not statistically significant validation.

---

## STEP 7 — Configure One GEval Metric
Implement one DeepEval GEval metric:
**Chatbot Response Quality**

- Use only the human-approved rubric.
- Do not add multiple overlapping metrics in Phase 1.
- Pass the actual user input and chatbot output to the metric.
- If additional trusted context is needed for judging factual correctness, ask the human before adding it.
- Do not silently add internet knowledge, hidden context, or expected answers.
- Do not choose the final pass threshold yet.
- Use the standard report and stop.

---

## STEP 8 — Configure the Evaluator Model
Do not assume Groq should also be the evaluator.
Ask/confirm:
- evaluator provider
- evaluator model
- specific model/version
- temperature/settings
- authentication method
- data-sharing approval

Prefer temperature 0 when supported.
Record automatically with every run:
- chatbot model
- Groq model identifier
- evaluator provider
- evaluator model/version
- evaluator temperature/settings
- DeepEval version
- dataset version
- rubric version
- Git commit timestamp

Run only a harmless evaluator smoke test first.
Use the standard report and stop.

---

## STEP 9A — Run the Calibration Evaluation
Run the approved calibration prompts through the real chatbot.
For each case record:
- input
- chatbot output
- application model
- deterministic-check result
- GEval score
- GEval reason
- run metadata

Do not expose human labels to the evaluator.
Do not modify the rubric after seeing results without creating a new rubric version.
Do not tune a threshold yet just to make results look better.
Use the standard report and stop.

---

## STEP 9B — Compare Against Humans and Test Repeatability
Now compare DeepEval results with the hidden human labels.
Measure:
- agreement on clear GOOD cases
- agreement on clear BAD cases
- behavior on BORDERLINE cases

Repeat selected cases several times.
Check whether scores/results fluctuate materially.
Also capture:
- runtime
- number of evaluator calls
- token use if available
- estimated cost if available

Record disagreements explicitly.
Do not hide or discard inconvenient results.
Use the standard report and stop.

---

## STEP 10 — Decision Gate
The human owns the success criteria.
Antigravity may analyze them but must not modify them.

Suggested Phase 1 decision criteria:
1. Evaluator agrees with humans on most clear GOOD/BAD examples.
2. Repeat runs are reasonably stable.
3. Failure reasons are understandable.
4. Cost is acceptable.
5. Runtime is acceptable.
6. Groq/application failures are distinguishable from quality failures.
7. No secrets/private data are exposed.
8. No unapproved external result upload occurs.

Classify Phase 1:
- `READY_TO_EXPAND`
- `NEEDS_CALIBRATION`
- `NOT_RELIABLE_YET`
- `BLOCKED`

Do not enable CI blocking yet.
Use the standard report and stop.

---

## Suggested Phase 1 Architecture
```text
Hugging Face Chatbot User Prompt
              ↓
    Existing chatbot code
              ↓
         Groq model
              ↓
      Chatbot Response
              ↓
  ┌───────────────────────┐
  │                       │
  ↓                       ↓
Deterministic          DeepEval
    Checks              GEval
  │                       ↓
  │                 Evaluator LLM
  │                       ↓
  │                 Score + Reason
  │                       │
  └───────────┬───────────┘
              ↓
       Human Comparison
              ↓
    Evaluation Reliability
```

---

## Out of Scope for Phase 1
Do not add yet:
- LangGraph multi-agent workflows
- self-review loops
- automatic regeneration
- RAG evaluation
- prompt-injection testing
- large model comparisons
- CI blocking
- production prompt changes
- production model changes
- Confident AI cloud reporting

---

## Phase 2 Possibilities
Once the basic harness is trustworthy, expand into:

### Model comparison
Run the same prompt dataset against multiple Groq-supported models.
Compare:
- quality
- latency
- cost
- stability

### More targeted metrics
Separate:
- correctness
- relevance
- grounding
- instruction following
*(only when each metric solves a specific problem)*

### Guardrail testing
Test:
- prompt injection
- scope violations
- system-prompt requests
- unsafe requests
*(if the chatbot has confirmed guardrail requirements)*

### LangGraph
Use LangGraph only when the chatbot actually becomes multi-step, for example:
```text
User question → Classify intent → Retrieve information → Choose tool → Call model → Review output → Return response
```
Then LangGraph becomes useful for orchestration and trajectory evaluation.

---

## Phase 1 Success Question
The project is successful when we can answer:
> **Can DeepEval provide a stable and useful quality signal for the real Hugging Face/Groq chatbot when compared with human judgment?**

The goal is **not**:
> *Can we make DeepEval produce a green PASS?*

One difference from the Agility version is that this project is a better place to experiment. Because you control the chatbot, you can learn how GEval scores behave, how stable the evaluator is, and how much the tests cost before you bring those lessons into the work application.

Antigravity is also well suited to this incremental workflow because its agent can work across code, terminal execution, and browser verification—but I would still force it to stop after every step rather than letting it autonomously complete the entire plan in one run. [Google Antigravity](https://www.antigravity.google/docs/ide/overview/?utm_source=chatgpt.com)
