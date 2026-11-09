import importlib.util
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("enrichment", ROOT / "scripts/enrich-catalog-pyramids.py")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class IdentityBoundaryTests(unittest.TestCase):
    def test_only_concentration_suffix_is_removed(self):
        self.assertEqual(module.title_identity("Example Intense Eau de Parfum"), ("example intense", "edp"))
        self.assertEqual(module.title_identity("Example Eau de Parfum 2024"), ("example eau de parfum 2024", None))
        self.assertNotEqual(module.title_identity("Example Intense Eau de Parfum")[0], module.title_identity("Example Eau de Parfum")[0])

    def test_named_molecules_do_not_become_generic_odor_families(self):
        self.assertEqual(module.canonical_note("Galaxolide (Musk)"), "galaxolide")
        self.assertNotEqual(module.canonical_note("Galaxolide (Musk)"), module.canonical_note("Musk"))
        self.assertEqual(module.canonical_note("Cedarwood (Atlas)"), module.canonical_note("Atlas cedar"))
        self.assertNotEqual(module.canonical_note("Blackcurrant bud"), module.canonical_note("Blackcurrant"))

    def test_generic_note_categories_cannot_supply_identity_evidence(self):
        agreement = module.note_agreement(["Woody Notes", "Floral Notes"], ["Woods", "Flowers"])
        self.assertEqual(agreement["overlapCount"], 2)
        self.assertEqual(agreement["informativeOverlapCount"], 0)
        self.assertFalse(module.passes(agreement, (2, .5, .5, .3)))

    def test_weighted_fragrantica_notes_keep_zero_weight_labels(self):
        self.assertEqual(module.parse_weighted_notes("Tobacco Leaf:100|Spicy Notes:47|Woody Notes:0"), ["Tobacco Leaf", "Spicy Notes", "Woody Notes"])
        self.assertEqual(module.parse_weighted_notes("Unweighted note"), ["Unweighted note"])

    def test_concentration_metadata_conflict_is_visible(self):
        row = {"Name": "Example Eau de Parfum", "Brand": "Brand", "Release_Year": "2007.0", "Concentration": "Eau de Toilette"}
        self.assertTrue(module.source_identity(row)["concentrationConflict"])

    def test_stage_migration_is_a_conflict_even_with_same_total_notes(self):
        left = {"Top_Notes": "Bergamot", "Middle_Notes": "Rose", "Base_Notes": "Musk"}
        right = {"Top_Notes": "Rose", "Middle_Notes": "Bergamot", "Base_Notes": "Musk"}
        self.assertEqual(module.stage_comparison(left, right)["classification"], "stage-conflict")
        self.assertFalse(module.stage_comparison(left, right)["compatibleStagePositions"])

    def test_extra_note_is_compatible_but_extra_stage_for_same_note_is_not(self):
        left = {"Top_Notes": "Bergamot", "Middle_Notes": "Rose", "Base_Notes": "Musk"}
        extra_note = {**left, "Base_Notes": "Musk,Vanilla"}
        extra_stage = {**left, "Middle_Notes": "Rose,Musk"}
        self.assertTrue(module.stage_comparison(left, extra_note)["compatibleOmissions"])
        self.assertFalse(module.stage_comparison(left, extra_stage)["compatibleStagePositions"])


class ActualDryRunTests(unittest.TestCase):
    def test_baseline_is_preserved_verbatim(self):
        original = json.loads((ROOT / "research/catalog-pyramids.json").read_text(encoding="utf-8"))
        proposed = json.loads((module.OUT / "parfumo/proposed-pyramids.json").read_text(encoding="utf-8"))
        self.assertEqual(len(original), 313)
        for key, value in original.items():
            self.assertEqual(proposed[key], value, key)

    def test_every_new_match_satisfies_identity_and_note_constraints(self):
        for source in ["parfumo", "fragrantica"]:
            matches = json.loads((module.OUT / source / "matched-evidence.json").read_text(encoding="utf-8"))
            for match in matches:
                self.assertNotIn("\ufffd", json.dumps(match["frontend"], ensure_ascii=False))
                if match.get("retainedExisting"):
                    continue
                candidate = match["candidateSource"]
                identity = module.source_identity(candidate)
                self.assertEqual(match["candidateCountEligible"], 1)
                self.assertEqual(identity["year"], match["target"]["years"])
                self.assertRegex(identity["year"], r"^\d{4}$")
                self.assertFalse(identity["concentrationConflict"])
                self.assertNotIn(candidate["URL"], module.EXCLUDED_SOURCE_URLS)
                self.assertTrue(all(candidate[column].strip() for column in module.STAGES.values()))
                threshold = module.EXPLICIT_THRESHOLD if match["concentrationConstraint"] else module.THRESHOLDS[module.PROPOSAL_THRESHOLD]
                self.assertTrue(module.passes(match["noteAgreement"], threshold), match["sourceRowIndex"])
                if not match["concentrationConstraint"]:
                    self.assertEqual(match["candidateCountAllVersions"], 1)

    def test_approved_arrays_are_from_exactly_one_source_and_no_new_stage_conflict(self):
        approved = json.loads((module.OUT / "approved-pyramids.json").read_text(encoding="utf-8"))
        evidence = json.loads((module.OUT / "approved-evidence.json").read_text(encoding="utf-8"))
        sources = {key: json.loads((module.OUT / key / "proposed-pyramids.json").read_text(encoding="utf-8")) for key in ["parfumo", "fragrantica"]}
        for match in evidence:
            index = str(match["sourceRowIndex"])
            self.assertEqual(approved[index], sources[match["selectedSource"]][index])
            if not match.get("retainedExisting"):
                self.assertFalse(match["sharedNoteStageConflicts"])


if __name__ == "__main__":
    unittest.main()
