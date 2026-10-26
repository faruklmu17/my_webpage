"""
STEP 9 — Class Catalog Unit Tests

Validates catalog integrity:
- Every class has a unique ID
- Age ranges are valid (min_age <= max_age, min_age >= 5)
- Level values use known enums (beginner, intermediate, advanced)
- Topics are non-empty
- Class name is non-empty
- get_class_by_id functions accurately
"""

import sys
import os
import pytest

# Ensure repository root is on sys.path
WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
if WORKSPACE_ROOT not in sys.path:
    sys.path.insert(0, WORKSPACE_ROOT)

from agent.data.classes import (
    CLASSES,
    ALLOWED_LEVELS,
    ALLOWED_TYPES,
    ALLOWED_FORMATS,
    get_all_classes,
    get_class_by_id,
)


class TestClassCatalogDataModel:
    """Validation test suite for Faruk's structured course & tutoring catalog."""

    def test_catalog_is_non_empty(self):
        """Ensure catalog contains class definitions."""
        assert len(CLASSES) >= 4

    def test_unique_class_ids(self):
        """Required Test: Every class has a unique ID."""
        ids = [c["id"] for c in CLASSES]
        assert len(ids) == len(set(ids)), f"Duplicate class IDs found: {ids}"
        for cid in ids:
            assert isinstance(cid, str)
            assert len(cid.strip()) > 0

    def test_valid_age_ranges(self):
        """Required Test: Age ranges are valid (min_age <= max_age, min_age >= 5)."""
        for c in CLASSES:
            min_age = c.get("min_age")
            max_age = c.get("max_age")
            assert isinstance(min_age, int), f"Invalid min_age in {c['id']}"
            assert isinstance(max_age, int), f"Invalid max_age in {c['id']}"
            assert min_age >= 5, f"min_age must be >= 5 in {c['id']}, got {min_age}"
            assert min_age <= max_age, f"min_age {min_age} exceeds max_age {max_age} in {c['id']}"

    def test_level_values_use_known_enums(self):
        """Required Test: Level values use known enums."""
        for c in CLASSES:
            levels = c.get("level")
            assert isinstance(levels, list), f"level must be a list in {c['id']}"
            assert len(levels) > 0, f"level must not be empty in {c['id']}"
            for lvl in levels:
                assert lvl in ALLOWED_LEVELS, f"Unknown level '{lvl}' in {c['id']}"

    def test_topics_are_non_empty(self):
        """Required Test: Topics are non-empty list of strings."""
        for c in CLASSES:
            topics = c.get("topics")
            assert isinstance(topics, list), f"topics must be a list in {c['id']}"
            assert len(topics) > 0, f"topics must not be empty in {c['id']}"
            for t in topics:
                assert isinstance(t, str) and len(t.strip()) > 0

    def test_class_name_is_non_empty(self):
        """Required Test: Class name is non-empty string."""
        for c in CLASSES:
            name = c.get("name")
            assert isinstance(name, str)
            assert len(name.strip()) > 0

    def test_formats_and_types_valid(self):
        """Ensure formats and types conform to defined enums."""
        for c in CLASSES:
            assert c.get("type") in ALLOWED_TYPES, f"Invalid type in {c['id']}"
            for fmt in c.get("format", []):
                assert fmt in ALLOWED_FORMATS, f"Invalid format '{fmt}' in {c['id']}"

    def test_get_class_by_id(self):
        """Ensure get_class_by_id returns correct record or None."""
        c = get_class_by_id("ai_python_kids")
        assert c is not None
        assert c["name"] == "AI & Python for Kids"

        non_existent = get_class_by_id("does_not_exist_xyz")
        assert non_existent is None
