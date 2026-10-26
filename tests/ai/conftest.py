"""
AI Evaluation Harness: conftest.py
Enforces privacy and telemetry safety guardrails per project plan.
"""

import os
import pytest


def pytest_configure(config):
    """Preflight check to ensure Confident AI and telemetry remain disabled."""
    # 1. Enforce privacy environment variables
    os.environ["DEEPEVAL_TELEMETRY_OPT_OUT"] = "1"
    os.environ["DEEPEVAL_DISABLE_DOTENV"] = "1"

    # 2. Assert Confident AI cloud reporting is completely absent
    if os.getenv("CONFIDENT_API_KEY"):
        raise RuntimeError(
            "CRITICAL SECURITY GUARDRAIL: CONFIDENT_API_KEY detected in environment. "
            "Cloud reporting to Confident AI is strictly forbidden by project rules."
        )

    # 3. Load authorized GROQ_API_KEY for tests if not already set in the shell
    if not os.getenv("GROQ_API_KEY"):
        env_path = "/Users/farukhasan/Desktop/Projects/my-homelab/python_projects/faruk-assistant/.env"
        if os.path.exists(env_path):
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line.startswith("GROQ_API_KEY=") and not line.startswith("#"):
                        val = line.split("=", 1)[1].strip().strip('"').strip("'")
                        if val:
                            os.environ["GROQ_API_KEY"] = val
                            break
