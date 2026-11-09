"""Dry-run, evidence-preserving pyramid join. Never writes prototype modules.

Uses exact normalized brand/title/year, all version candidates, and conservative
English note identities. Current frontend concentration remains a constraint.
"""
import ast
import csv
import gzip
import hashlib
import importlib.util
import io
import json
import re
import subprocess
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / "research/catalog-pyramids"
OUT = ROOT / "research/catalog-pyramids-discovery/bulk-dry-run"
spec = importlib.util.spec_from_file_location("original_importer", ROOT / "scripts/import-catalog-pyramids.py")
original = importlib.util.module_from_spec(spec)
spec.loader.exec_module(original)
normalize = original.normalize
STAGES = original.STAGES

# Only explicit concentration suffixes are removed; version words remain intact.
CONCENTRATIONS = {
    "eau de parfum intense": "edp intense", "eau de toilette intense": "edt intense",
    "eau de parfum legere": "edp legere", "eau de parfum absolue": "edp absolue",
    "extrait de parfum": "extrait", "eau de toilette": "edt", "eau de parfum": "edp",
    "eau de cologne": "edc", "cologne intense": "cologne intense",
    "pure parfum": "pure parfum", "pure perfume": "pure perfume",
    "parfum de toilette": "parfum de toilette", "perfume oil": "perfume oil",
    "solid perfume": "solid perfume", "body spray": "body spray",
    "parfum": "parfum", "perfume": "perfume", "extrait": "extrait",
    "cologne": "cologne", "elixir": "elixir", "edp": "edp", "edt": "edt", "edc": "edc",
}
SUFFIXES = sorted(CONCENTRATIONS, key=len, reverse=True)
ALIASES = {
    "cedar": "cedarwood", "gaiac wood": "guaiac wood", "gaiacwood": "guaiac wood",
    "guaiacwood": "guaiac wood", "lily of the valley": "lily of the valley",
    "lily of valley": "lily of the valley", "violet leaves": "violet leaf",
    "ciste labdanum": "labdanum", "oud agarwood": "oud", "agarwood": "oud",
    "incense olibanum": "olibanum", "frankincense": "olibanum",
    "frankincense resin": "olibanum", "cypriol nagarmota": "cypriol",
    "nagarmotha": "cypriol", "nagarmota": "cypriol", "patchouly": "patchouli",
    "praline": "praline", "juniper berries": "juniper berry", "aldehydes": "aldehyde",
    "mandarin orange": "mandarin", "mate tea": "mate", "aniseed": "anise",
    "elemi resin": "elemi", "tobacco accord": "tobacco", "tobacco leaf": "tobacco",
    "tonka beans": "tonka bean", "black currant": "blackcurrant",
    "citrus fruits": "citrus", "citrus notes": "citrus", "citruses": "citrus",
    "aquatic notes": "aquatic", "marine notes": "marine", "woody notes": "woods",
    "woody note": "woods", "fruity notes": "fruits", "floral notes": "flowers",
}
REGIONS = sorted("atlas|alaskan|american|arabian|assam|australian|bourbon|brazilian|bulgarian|calabrian|cambodian|chinese|comorian|egyptian|english|florentine|french|grasse|guatemalan|guatemala|haitian|himalayan|indian|indonesian|italian|jamaican|japanese|java|javanese|lebanese|madagascan|madagascar|malayan|mexican|moroccan|morocco|mysore|new caledonian|nigerian|peruvian|persian|provencal|russian|siam|sicilian|somalian|spanish|sri lankan|sulawesi|sumatra|tahitian|taif|texas|thai|tunisian|turkish|venezuelan|virginia".split("|"), key=len, reverse=True)
GENERIC_NOTES = {"flowers", "fruits", "woods", "citrus", "green notes", "aromatic notes", "spicy notes", "spices", "fresh notes", "aquatic", "marine", "ozonic notes", "balsamic notes", "gourmand accord", "gourmand notes", "animalic notes"}
THRESHOLDS = {
    "overlap2_target80_source50_jaccard50": (2, .8, .5, .5),
    "overlap2_target80_source60_jaccard60": (2, .8, .6, .6),
    "overlap3_target80_source60_jaccard60": (3, .8, .6, .6),
    "overlap3_target90_source75_jaccard70": (3, .9, .75, .7),
}
PROPOSAL_THRESHOLD = "overlap3_target80_source60_jaccard60"
EXPLICIT_THRESHOLD = (2, .5, .5, 1 / 3)
EXCLUDED_SOURCE_URLS = {"https://www.parfumo.com/Perfumes/Alviero_Martini/Geo_Uomo"}


def concentration(value):
    value = normalize(value or "")
    return CONCENTRATIONS.get(value, value) if value else None


def title_identity(value):
    value = normalize(value)
    for label in SUFFIXES:
        if value.endswith(" " + label):
            return value[:-len(label)].strip(), CONCENTRATIONS[label]
    return value, None


def source_identity(row):
    name = normalize(row["Name"])
    brand = normalize(row["Brand"])
    year = row["Release_Year"].removesuffix(".0")
    raw_concentration = normalize(row["Concentration"])
    suffix = " ".join(part for part in [brand, year, raw_concentration] if part)
    if raw_concentration and name.endswith(" " + suffix):
        name = name[:-len(suffix)].strip()
    stem, parsed = title_identity(name)
    explicit = concentration(row["Concentration"])
    return {"brand": brand, "stem": stem, "year": year,
            "concentration": explicit or parsed,
            "concentrationConflict": bool(explicit and parsed and explicit != parsed)}


def canonical_note(value):
    # Parentheses in the original English vocabulary describe origin or odor role.
    # A named material remains that identity: Galaxolide (Musk) != Musk.
    value = re.sub(r"\s*\([^)]*\)\s*", " ", value).strip()
    value = normalize(value)
    value = re.sub(r"\s+(?:absolute|concrete|essential oil|orpur)$", "", value)
    for region in REGIONS:
        if value.startswith(region + " "):
            value = value[len(region):].strip()
            break
    return ALIASES.get(value, value)


def note_set(values):
    return {canonical_note(value) for value in values if canonical_note(value)}


def note_agreement(target_notes, source_notes):
    target, source = note_set(target_notes), note_set(source_notes)
    overlap = target & source
    informative = overlap - GENERIC_NOTES
    return {"targetCanonical": sorted(target), "sourceCanonical": sorted(source),
            "overlap": sorted(overlap), "informativeOverlap": sorted(informative),
            "overlapCount": len(overlap), "informativeOverlapCount": len(informative),
            "targetCoverage": len(overlap) / len(target) if target else 0,
            "sourceCoverage": len(overlap) / len(source) if source else 0,
            "jaccard": len(overlap) / len(target | source) if target | source else 0}


def passes(agreement, threshold):
    count, target, source, jaccard = threshold
    return (agreement["informativeOverlapCount"] >= count
            and agreement["targetCoverage"] >= target
            and agreement["sourceCoverage"] >= source
            and agreement["jaccard"] >= jaccard)


def current_catalog():
    js = "import {perfumes} from './prototype/data.js';import {productPyramids} from './prototype/catalog-zh-names.mjs';import {catalogNoteOverrides} from './prototype/catalog-note-overrides.mjs';console.log(JSON.stringify(perfumes.map(p=>({id:p.id,sourceRowIndex:p.sourceRowIndex,brand:p.brand,name:p.name,concentration:p.concentration,hasPyramid:!!p.pyramid,hasManualPyramid:!!(productPyramids[p.brand+'|'+p.name]||catalogNoteOverrides[p.id]?.pyramid)}))));"
    result = subprocess.run(["node", "--input-type=module", "-e", js], cwd=ROOT, capture_output=True, check=True, encoding="utf-8")
    rows = json.loads(result.stdout)
    return {row["sourceRowIndex"]: row for row in rows if "sourceRowIndex" in row}, [row for row in rows if "sourceRowIndex" not in row]


def evaluate_source(source, catalog, existing, frontend, standalone, source_metadata, output_dir, retain_baseline):
    url_counts = Counter(row["URL"] for row in source)
    index = defaultdict(list)
    for row in source:
        identity = source_identity(row)
        # Every same-name/year version participates, even if its pyramid is empty,
        # its URL repeats, or concentration metadata contradicts its title.
        index[identity["brand"], identity["stem"], identity["year"]].append((row, identity))
    results, unmatched, unique_evidence, proposals = [], [], [], {}
    threshold_counts = Counter()
    overlap_distribution = Counter()
    for row_index, target in enumerate(catalog):
        entry = {"sourceRowIndex": row_index, "target": target, "frontend": frontend.get(row_index)}
        if row_index in existing and retain_baseline:
            match = existing[row_index]
            source_row = match["sourceRecord"]
            agreement = note_agreement(ast.literal_eval(target["ingredients"]), [note.strip() for column in STAGES.values() for note in source_row[column].split(",") if note.strip()])
            entry.update(reason="exact-concentration", retainedExisting=True, candidateSource=source_row, noteAgreement=agreement,
                         baselineAuditFlags=(["known-corrupt-source-url"] if source_row["URL"] in EXCLUDED_SOURCE_URLS else []) + ([] if passes(agreement, EXPLICIT_THRESHOLD) else ["weak-note-agreement"]))
            results.append(entry)
            proposals[str(row_index)] = {key: [note.strip() for note in source_row[column].split(",") if note.strip()] for key, column in STAGES.items()}
            proposals[str(row_index)].update(sourceUrl=source_row["URL"], sourceLabel="Parfumo 香水资料")
            continue
        if frontend.get(row_index, {}).get("hasManualPyramid") and row_index not in existing:
            entry["reason"] = "existing-product-pyramid-preserved"
            unmatched.append(entry)
            continue
        year = target["years"]
        if not re.fullmatch(r"\d{4}", year):
            entry["reason"] = "unknown-or-invalid-target-year"
            unmatched.append(entry)
            continue
        stem, named_concentration = title_identity(target["name_perfume"])
        live = frontend.get(row_index, {})
        current_concentration = concentration(live.get("concentration"))
        current_stem, current_named = title_identity(live.get("name", target["name_perfume"]))
        constraints = {item for item in [named_concentration, current_concentration, current_named] if item}
        if len(constraints) > 1:
            entry["reason"] = "target-concentration-conflict"
            unmatched.append(entry)
            continue
        if current_stem != stem or normalize(live.get("brand", target["brand"])) != normalize(target["brand"]):
            entry["reason"] = "current-catalog-identity-differs"
            unmatched.append(entry)
            continue
        required_concentration = next(iter(constraints), None)
        candidates = index[normalize(target["brand"]), stem, year]
        entry.update(candidateCountAllVersions=len(candidates), candidateUrls=[row["URL"] for row, _ in candidates], concentrationConstraint=required_concentration)
        if required_concentration:
            eligible = [(row, identity) for row, identity in candidates if identity["concentration"] in (required_concentration, None)]
        else:
            eligible = candidates
        entry["candidateCountEligible"] = len(eligible)
        if not candidates:
            reason = "no-exact-brand-name-year-candidate"
        elif not eligible:
            reason = "explicit-concentration-conflict"
        elif len(eligible) != 1:
            reason = "ambiguous-same-name-year-versions"
        else:
            row, identity = eligible[0]
            entry["candidateSource"] = row
            if row["URL"] in EXCLUDED_SOURCE_URLS:
                reason = "known-corrupt-source-url"
            elif not row["URL"] or url_counts[row["URL"]] != 1:
                reason = "duplicate-or-missing-source-url"
            elif identity["concentrationConflict"]:
                reason = "source-concentration-conflict"
            elif required_concentration and not identity["concentration"]:
                reason = "source-concentration-unconfirmed"
            else:
                missing = [key for key, column in STAGES.items() if not row[column].strip()]
                entry["missingSourceStages"] = missing
                try:
                    target_notes = ast.literal_eval(target["ingredients"])
                except (SyntaxError, ValueError):
                    target_notes = []
                source_notes = [note.strip() for column in STAGES.values() for note in row[column].split(",") if note.strip()]
                agreement = note_agreement(target_notes, source_notes)
                entry["noteAgreement"] = agreement
                if missing:
                    reason = "source-pyramid-incomplete"
                else:
                    overlap_distribution[str(agreement["informativeOverlapCount"])] += 1
                    for label, threshold in THRESHOLDS.items():
                        if passes(agreement, threshold):
                            threshold_counts[label] += 1
                    if required_concentration and passes(agreement, EXPLICIT_THRESHOLD):
                        reason = "exact-concentration-new"
                    elif not required_concentration and passes(agreement, THRESHOLDS[PROPOSAL_THRESHOLD]):
                        reason = "unique-name-year-strong-notes-proposal"
                    else:
                        reason = "note-agreement-below-proposal-threshold"
                unique_evidence.append(entry)
        entry["reason"] = reason
        if reason in ("exact-concentration-new", "unique-name-year-strong-notes-proposal"):
            results.append(entry)
            proposals[str(row_index)] = {key: [note.strip() for note in row[column].split(",") if note.strip()] for key, column in STAGES.items()}
            proposals[str(row_index)].update(sourceUrl=row["URL"], sourceLabel=source_metadata["sourceLabel"])
        else:
            unmatched.append(entry)
    report = {**source_metadata, "catalogRows": len(catalog), "sourceRows": len(source),
              "standaloneFrontendRecordsNotInRawCatalog": standalone,
              "retainedExactConcentration": len(existing) if retain_baseline else 0, "proposalThreshold": PROPOSAL_THRESHOLD,
              "explicitConcentrationThreshold": {"informativeOverlapAtLeast": 2, "targetCoverageAtLeast": .5, "sourceCoverageAtLeast": .5, "jaccardAtLeast": 1 / 3},
              "baselineWeakAgreement": sum(bool(row.get("baselineAuditFlags")) for row in results),
              "thresholds": {label: {"informativeOverlapAtLeast": values[0], "targetCoverageAtLeast": values[1], "sourceCoverageAtLeast": values[2], "jaccardAtLeast": values[3], "candidateCount": threshold_counts[label]} for label, values in THRESHOLDS.items()},
              "overlapDistributionForUniqueCompleteCandidates": dict(overlap_distribution),
              "matchedReasons": dict(Counter(row["reason"] for row in results)), "unmatchedReasons": dict(Counter(row["reason"] for row in unmatched)),
              "proposalPyramids": len(proposals), "status": "dry-run proposal; no prototype module written"}
    output_dir.mkdir(parents=True, exist_ok=True)
    for filename, value in [("report.json", report), ("matched-evidence.json", results), ("unique-candidate-evidence.json", unique_evidence), ("unmatched.json", unmatched), ("proposed-pyramids.json", proposals)]:
        (output_dir / filename).write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return report, results, unmatched, proposals


def parse_weighted_notes(value):
    notes = []
    for item in value.split("|"):
        label, separator, weight = item.rpartition(":")
        # These weights are voting/intensity metadata, never perfume concentration.
        note = label if separator and re.fullmatch(r"\d+(?:\.\d+)?", weight.strip()) else item
        if note.strip():
            notes.append(note.strip())
    return notes


def adapt_fragrantica(row):
    return {"Name": row["name"], "Brand": row["brand"], "Release_Year": row["year"].removesuffix(".0"),
            "Concentration": "", "URL": row["url"],
            "Top_Notes": ",".join(parse_weighted_notes(row["notes_top"])),
            "Middle_Notes": ",".join(parse_weighted_notes(row["notes_middle"])),
            "Base_Notes": ",".join(parse_weighted_notes(row["notes_base"])),
            "OriginalRecord": row}


def stage_comparison(left, right):
    diff = {}
    for stage, column in STAGES.items():
        left_raw = {normalize(note) for note in left[column].split(",") if note.strip()}
        right_raw = {normalize(note) for note in right[column].split(",") if note.strip()}
        left_notes = note_set(left[column].split(","))
        right_notes = note_set(right[column].split(","))
        diff[stage] = {"rawEqual": left_raw == right_raw, "canonicalEqual": left_notes == right_notes,
                       "leftOnly": sorted(left_notes - right_notes), "rightOnly": sorted(right_notes - left_notes),
                       "shared": sorted(left_notes & right_notes)}
    raw_equal = all(stage["rawEqual"] for stage in diff.values())
    canonical_equal = all(stage["canonicalEqual"] for stage in diff.values())
    left_subset = all(not stage["leftOnly"] for stage in diff.values())
    right_subset = all(not stage["rightOnly"] for stage in diff.values())
    if raw_equal:
        classification = "raw-stage-sets-equal"
    elif canonical_equal:
        classification = "canonical-stage-sets-equal"
    elif left_subset or right_subset:
        classification = "one-source-stagewise-superset"
    elif all(stage["shared"] for stage in diff.values()):
        classification = "all-stages-share-core-but-differ"
    else:
        classification = "stage-conflict"
    left_positions, right_positions = defaultdict(set), defaultdict(set)
    for stage, column in STAGES.items():
        for note in note_set(left[column].split(",")):
            left_positions[note].add(stage)
        for note in note_set(right[column].split(",")):
            right_positions[note].add(stage)
    shared_notes = left_positions.keys() & right_positions.keys()
    position_conflicts = [{"note": note, "parfumoStages": sorted(left_positions[note]), "fragranticaStages": sorted(right_positions[note])}
                          for note in sorted(shared_notes) if left_positions[note] != right_positions[note]]
    compatible = bool(shared_notes) and not position_conflicts
    return {"classification": classification, "stages": diff,
            "sharedCanonicalCount": len(shared_notes), "sharedNoteStageConflicts": position_conflicts,
            "compatibleOmissions": compatible and not canonical_equal,
            "compatibleStagePositions": compatible}


def agreement_rank(match):
    agreement = match["noteAgreement"]
    return (agreement["jaccard"], min(agreement["targetCoverage"], agreement["sourceCoverage"]),
            agreement["informativeOverlapCount"], agreement["targetCoverage"], agreement["sourceCoverage"])


def main():
    raw = CACHE / "02_Parfumo_Perfumes.csv.gz"
    source = list(csv.DictReader(io.StringIO(gzip.decompress(raw.read_bytes()).decode("utf-8-sig"))))
    with (ROOT / "research/catalog-100/hf-perfumes.csv").open(encoding="utf-8-sig") as handle:
        catalog = list(csv.DictReader(handle, delimiter="|"))
    existing = {row["sourceRowIndex"]: row for row in json.loads((CACHE / "matches.json").read_text(encoding="utf-8"))}
    frontend, standalone = current_catalog()
    parfumo = evaluate_source(source, catalog, existing, frontend, standalone,
                             {"source": "Parfumo snapshot", "sourceLabel": "Parfumo 香水资料", "sourceSha256": hashlib.sha256(raw.read_bytes()).hexdigest()}, OUT / "parfumo", True)
    fragrantica_path = ROOT / "research/catalog-pyramids-discovery/astyxxx-perfumes_actual.csv"
    with fragrantica_path.open(encoding="utf-8-sig") as handle:
        fragrantica_source = [adapt_fragrantica(row) for row in csv.DictReader(handle)]
    fragrantica = evaluate_source(fragrantica_source, catalog, existing, frontend, standalone,
                                 {"source": "aStyxxx Fragrantica snapshot", "sourceLabel": "Fragrantica 香水资料", "sourceSha256": hashlib.sha256(fragrantica_path.read_bytes()).hexdigest()}, OUT / "fragrantica", False)
    parfumo_matches = {row["sourceRowIndex"]: row for row in parfumo[1]}
    fragrantica_matches = {row["sourceRowIndex"]: row for row in fragrantica[1]}
    comparisons = []
    for index in sorted(parfumo_matches.keys() & fragrantica_matches.keys()):
        left, right = parfumo_matches[index], fragrantica_matches[index]
        comparisons.append({"sourceRowIndex": index, "brand": catalog[index]["brand"], "name": catalog[index]["name_perfume"],
                            "existingBaseline": index in existing,
                            "parfumo": left, "fragrantica": right,
                            **stage_comparison(left["candidateSource"], right["candidateSource"])})
    conflict_indices = {row["sourceRowIndex"] for row in comparisons if row["classification"] not in ("raw-stage-sets-equal", "canonical-stage-sets-equal")}
    raw_difference_indices = {row["sourceRowIndex"] for row in comparisons if row["classification"] != "raw-stage-sets-equal"}
    position_conflict_indices = {row["sourceRowIndex"] for row in comparisons if not row["compatibleStagePositions"]}
    compatible_omission_indices = {row["sourceRowIndex"] for row in comparisons if row["compatibleOmissions"]}
    unique_new_indices = (parfumo_matches.keys() | fragrantica_matches.keys()) - existing.keys()
    new_dual_source_indices = (parfumo_matches.keys() & fragrantica_matches.keys()) - existing.keys()
    combined = {"status": "dry-run only; shared-note stage conflicts withheld; compatible omissions select one source unchanged",
                "parfumoMatchedReasons": parfumo[0]["matchedReasons"], "fragranticaMatchedReasons": fragrantica[0]["matchedReasons"],
                "parfumoBaselineWeakAgreement": parfumo[0]["baselineWeakAgreement"],
                "bothSourcesStrictIdentityPassed": len(comparisons),
                "stageComparisonCounts": dict(Counter(row["classification"] for row in comparisons)),
                "existingBaselineComparisonCounts": dict(Counter(row["classification"] for row in comparisons if row["existingBaseline"])),
                "uniqueNewCandidates": len(unique_new_indices), "withheldNewConflicts": len(unique_new_indices & conflict_indices),
                "newCandidatesWithoutCrossSourceConflict": len(unique_new_indices - conflict_indices),
                "newSingleSourceCandidates": len(unique_new_indices - new_dual_source_indices),
                "withheldNewRawStageDifferences": len(unique_new_indices & raw_difference_indices),
                "newCandidatesWithoutAnyRawStageDifference": len(unique_new_indices - raw_difference_indices),
                "sharedNoteStageConflictsNew": len(unique_new_indices & position_conflict_indices),
                "compatibleOmissionsNew": len(unique_new_indices & compatible_omission_indices),
                "baselineSharedNoteStageConflicts": len(existing.keys() & position_conflict_indices),
                "retainedBaseline": len(existing)}
    comparisons_by_index = {item["sourceRowIndex"]: item for item in comparisons}
    approved_evidence = []
    approved_pyramids = {}
    for index in sorted(existing.keys() | (unique_new_indices - position_conflict_indices)):
        if index in existing:
            selected_source, match = "parfumo", parfumo_matches[index]
            acceptance = "retained-existing-baseline"
        elif index in parfumo_matches and index in fragrantica_matches:
            left, right = parfumo_matches[index], fragrantica_matches[index]
            # Select one complete source unchanged. Higher Jaccard takes priority,
            # then balanced coverage and overlap count; exact ties retain Parfumo.
            selected_source, match = ("fragrantica", right) if agreement_rank(right) > agreement_rank(left) else ("parfumo", left)
            acceptance = "compatible-omissions-single-source" if comparisons_by_index[index]["compatibleOmissions"] else "matching-stage-identities-single-source"
        elif index in parfumo_matches:
            selected_source, match = "parfumo", parfumo_matches[index]
            acceptance = "single-source-strict-identity-and-notes"
        else:
            selected_source, match = "fragrantica", fragrantica_matches[index]
            acceptance = "single-source-strict-identity-and-notes"
        chosen_pyramids = parfumo[3] if selected_source == "parfumo" else fragrantica[3]
        approved_pyramids[str(index)] = chosen_pyramids[str(index)]
        approved_evidence.append({**match, "selectedSource": selected_source, "acceptanceReason": acceptance,
                                  "selectionScore": list(agreement_rank(match)),
                                  "crossSourceStageStatus": comparisons_by_index.get(index, {}).get("classification"),
                                  "sharedNoteStageConflicts": comparisons_by_index.get(index, {}).get("sharedNoteStageConflicts")})
    combined["approvedPyramids"] = len(approved_pyramids)
    combined["approvedNewPyramids"] = len(approved_pyramids) - len(existing)
    combined["approvedSelectionCounts"] = dict(Counter(row["selectedSource"] for row in approved_evidence))
    combined["approvedAcceptanceCounts"] = dict(Counter(row["acceptanceReason"] for row in approved_evidence))
    (OUT / "combined-report.json").write_text(json.dumps(combined, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (OUT / "cross-source-stage-diffs.json").write_text(json.dumps(comparisons, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    baseline_audit = [{"sourceRowIndex": index, "parfumo": parfumo_matches[index],
                       "fragrantica": fragrantica_matches.get(index),
                       "fragranticaRejectedReason": next((row["reason"] for row in fragrantica[2] if row["sourceRowIndex"] == index), None)} for index in existing]
    (OUT / "baseline-313-audit.json").write_text(json.dumps(baseline_audit, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (OUT / "approved-pyramids.json").write_text(json.dumps(approved_pyramids, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (OUT / "approved-evidence.json").write_text(json.dumps(approved_evidence, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    # Remove only the five obsolete files generated by this script's initial
    # single-source pass; the current results live in source-named subfolders.
    for filename in ["report.json", "matched-evidence.json", "unique-candidate-evidence.json", "unmatched.json", "proposed-pyramids.json"]:
        (OUT / filename).unlink(missing_ok=True)
    print(json.dumps(combined, ensure_ascii=True, indent=2))


if __name__ == "__main__":
    main()
