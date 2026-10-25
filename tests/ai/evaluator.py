"""
STEP 8 — Evaluator Model Configuration & Run Metadata Recorder

Manages evaluator selection, parameters (temperature=0), and automatic run metadata logging.
Supported providers: Groq (openai/gpt-oss-120b or openai/gpt-oss-20b), OpenAI (gpt-4o-mini), or synthetic test judge.
"""

import os
import subprocess
from datetime import datetime, timezone
from typing import Any, Dict, Optional
import requests
import deepeval
from deepeval.models.base_model import DeepEvalBaseLLM


def get_git_commit_timestamp() -> str:
    """Retrieves the timestamp of the latest git commit."""
    try:
        ts = subprocess.check_output(
            ["git", "log", "-1", "--format=%cI"],
            text=True,
            timeout=5,
        ).strip()
        return ts or datetime.now(timezone.utc).isoformat()
    except Exception:
        return datetime.now(timezone.utc).isoformat()


def build_run_metadata(
    evaluator_provider: str = "Groq",
    evaluator_model: str = "openai/gpt-oss-120b",
    evaluator_temperature: float = 0.0,
    dataset_version: str = "calibration_dataset.json:v1.0",
    rubric_version: str = "rubric.md:v1.0",
) -> Dict[str, Any]:
    """Generates standardized run metadata record per Step 8 requirements."""
    return {
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "chatbot_application": "Faruk Assistant",
        "chatbot_deployment": "https://hasanfaruk25-faruk-assistant.hf.space/gradio/",
        "chatbot_underlying_provider": "Groq",
        "evaluator_provider": evaluator_provider,
        "evaluator_model": evaluator_model,
        "evaluator_temperature": evaluator_temperature,
        "deepeval_version": getattr(deepeval, "__version__", "4.3.1"),
        "dataset_version": dataset_version,
        "rubric_version": rubric_version,
        "git_commit_timestamp": get_git_commit_timestamp(),
    }


class GroqEvaluator(DeepEvalBaseLLM):
    """
    Evaluator model adapter for Groq using DeepEval's Base LLM interface.
    Default model: openai/gpt-oss-120b, temperature: 0.0.
    """

    def __init__(
        self,
        model: str = "openai/gpt-oss-120b",
        api_key: Optional[str] = None,
        temperature: float = 0.0,
    ):
        self.model_name = model
        self.api_key = api_key or os.getenv("GROQ_API_KEY", "").strip()
        self.temperature = temperature
        super().__init__(model=model)

    def load_model(self):
        return self

    def get_model_name(self, *args, **kwargs) -> str:
        return self.model_name

    def generate(self, prompt: str, schema=None, *args, **kwargs) -> str:
        if not self.api_key:
            raise RuntimeError(
                "GROQ_API_KEY is missing. Please set GROQ_API_KEY to run the Groq evaluator."
            )

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload: Dict[str, Any] = {
            "model": self.model_name,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": self.temperature,
        }
        if schema:
            payload["response_format"] = {"type": "json_object"}

        r = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=60,
        )
        r.raise_for_status()
        data = r.json()
        return data["choices"][0]["message"]["content"]

    async def a_generate(self, prompt: str, schema=None, *args, **kwargs) -> str:
        return self.generate(prompt, schema=schema, *args, **kwargs)
