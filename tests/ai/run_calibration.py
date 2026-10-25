"""
STEP 9A — Run Calibration Evaluation

Executes the 10 approved calibration cases through the real chatbot,
runs deterministic validation, evaluates each case using the single GEval metric
with Groq (openai/gpt-oss-120b), and saves the complete provenance record.
"""

import json
import os
import time
from typing import Any, Dict, List
import dotenv
from gradio_client import Client
from deepeval.test_case import LLMTestCase
from tests.ai.metrics import create_chatbot_quality_metric
from tests.ai.evaluator import GroqEvaluator, build_run_metadata

ENV_PATH = "/Users/farukhasan/Desktop/Projects/my-homelab/python_projects/faruk-assistant/.env"
CHATBOT_URL = "https://hasanfaruk25-faruk-assistant.hf.space/gradio/"
ENDPOINT_NAME = "/chat_fn"
CALIBRATION_DATASET_PATH = os.path.join(os.path.dirname(__file__), "calibration_dataset.json")
RESULTS_OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "calibration_results.json")


def load_calibration_dataset() -> List[Dict[str, Any]]:
    with open(CALIBRATION_DATASET_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data.get("cases", [])


def run_calibration():
    # 1. Enforce privacy environment variables
    os.environ["DEEPEVAL_TELEMETRY_OPT_OUT"] = "1"
    os.environ["DEEPEVAL_DISABLE_DOTENV"] = "1"

    # 2. Load authorized GROQ_API_KEY
    env_vals = dotenv.dotenv_values(ENV_PATH)
    groq_api_key = env_vals.get("GROQ_API_KEY", "").strip()
    if not groq_api_key:
        raise RuntimeError(f"GROQ_API_KEY not found in {ENV_PATH}")

    # 3. Connect to live chatbot and evaluator
    print(f"Connecting to live chatbot at {CHATBOT_URL}...")
    chatbot_client = Client(CHATBOT_URL)

    print("Initializing GroqEvaluator with openai/gpt-oss-120b (temp=0.0)...")
    evaluator = GroqEvaluator(model="openai/gpt-oss-120b", api_key=groq_api_key, temperature=0.0)
    metric = create_chatbot_quality_metric(model=evaluator)

    # 4. Load calibration test cases
    cases = load_calibration_dataset()
    print(f"Running {len(cases)} calibration cases through live chatbot & GEval...")

    metadata = build_run_metadata(
        evaluator_provider="Groq",
        evaluator_model="openai/gpt-oss-120b",
        evaluator_temperature=0.0,
        dataset_version="calibration_dataset.json:v1.0",
        rubric_version="rubric.md:v1.0",
    )

    evaluation_records = []

    for idx, case in enumerate(cases, 1):
        case_id = case["id"]
        prompt = case["input"]
        category = case["category"]
        print(f"\n[{idx}/{len(cases)}] Case {case_id} ({category}):")
        print(f"  Prompt: {prompt}")

        # Real Chatbot Call
        t0 = time.time()
        try:
            raw_res = chatbot_client.predict(user_message=prompt, history=[], api_name=ENDPOINT_NAME)
            chatbot_duration = time.time() - t0
            output = raw_res[1][-1]["content"].strip()
            deterministic_pass = bool(output and not output.startswith("Error:"))
            app_error = None
        except Exception as e:
            chatbot_duration = time.time() - t0
            output = ""
            deterministic_pass = False
            app_error = str(e)

        print(f"  Response ({chatbot_duration:.2f}s): {output}")

        # GEval Measurement
        geval_score = None
        geval_reason = None
        geval_duration = 0.0

        if deterministic_pass:
            t_eval_start = time.time()
            test_case = LLMTestCase(input=prompt, actual_output=output)
            try:
                metric.measure(test_case)
                geval_score = metric.score
                geval_reason = metric.reason
            except Exception as e:
                geval_reason = f"Evaluator error: {e}"
            geval_duration = time.time() - t_eval_start
            print(f"  GEval Score: {geval_score} (evaluated in {geval_duration:.2f}s)")
            print(f"  GEval Reason: {geval_reason}")
        else:
            geval_reason = f"Skipped GEval due to chatbot failure: {app_error}"

        record = {
            "id": case_id,
            "category": category,
            "input": prompt,
            "target_constraint": case.get("target_constraint", ""),
            "chatbot_output": output,
            "chatbot_duration_sec": round(chatbot_duration, 3),
            "deterministic_pass": deterministic_pass,
            "app_error": app_error,
            "geval_score": geval_score,
            "geval_reason": geval_reason,
            "geval_duration_sec": round(geval_duration, 3),
        }
        evaluation_records.append(record)

    full_report = {
        "run_metadata": metadata,
        "summary": {
            "total_cases": len(cases),
            "deterministic_pass_count": sum(1 for r in evaluation_records if r["deterministic_pass"]),
            "average_geval_score": round(
                sum(r["geval_score"] for r in evaluation_records if r["geval_score"] is not None)
                / max(1, sum(1 for r in evaluation_records if r["geval_score"] is not None)),
                3,
            ),
        },
        "records": evaluation_records,
    }

    with open(RESULTS_OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(full_report, f, indent=2)

    print(f"\n[DONE] Saved complete calibration run to {RESULTS_OUTPUT_PATH}")
    return full_report


if __name__ == "__main__":
    run_calibration()
