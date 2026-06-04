/**
 * Scoring validation script.
 * Runs the full scoring pipeline with sample answers and verifies:
 * 1. All 14 dimensions produce scores in [0, 5]
 * 2. Top 5 majors are returned
 * 3. Results match expected output (if available)
 *
 * Usage: npx tsx scripts/validate-scoring.ts
 */

import * as fs from "fs";
import * as path from "path";

import { computeObjectiveScores } from "../src/lib/quiz-scoring";
import { rankMajors, topKMajors } from "../src/lib/cosine-similarity";
import { DIMENSION_ORDER } from "../src/lib/constants";
import type { QuizBank, QuizConfig, WheelData, Level2Major } from "../src/lib/types";

const DATA_DIR = path.resolve(__dirname, "../public/data");
const FIXTURES_DIR = path.resolve(__dirname, "../tests/fixtures");

function loadJson<T>(filepath: string): T {
  const raw = fs.readFileSync(filepath, "utf-8");
  return JSON.parse(raw) as T;
}

function main() {
  // Load data
  const bank = loadJson<QuizBank>(path.join(DATA_DIR, "quiz-bank.json"));
  const config = loadJson<QuizConfig>(path.join(DATA_DIR, "quiz-config.json"));
  const wheel = loadJson<WheelData>(path.join(DATA_DIR, "wheel-data.json"));
  const answers = loadJson<Record<string, string | string[]>>(
    path.join(FIXTURES_DIR, "sample-answers.json")
  );

  // Run scoring
  const scores = computeObjectiveScores(bank.questions, answers, config);

  // Validate all 14 dimensions are in [0, 5]
  let allValid = true;
  for (const d of DIMENSION_ORDER) {
    const val = scores[d] ?? 0;
    if (val < 0 || val > 5) {
      console.error(`FAIL: ${d} = ${val.toFixed(3)} (out of [0, 5])`);
      allValid = false;
    }
  }
  if (allValid) {
    console.log("PASS: All 14 dimensions within [0, 5]");
  }

  // Print scores for reference
  console.log("\n14-dimension objective scores:");
  for (const d of DIMENSION_ORDER) {
    console.log(`  ${d}: ${(scores[d] ?? 0).toFixed(3)}`);
  }

  // Run recommendation
  const matches = rankMajors(
    scores,
    wheel.level2,
    config.dimensionWeights
  );
  const top5 = topKMajors(matches, 5);

  if (top5.length !== 5) {
    console.error(`FAIL: Expected 5 matches, got ${top5.length}`);
    allValid = false;
  } else {
    console.log("\nPASS: Top 5 majors returned");
    for (let i = 0; i < top5.length; i++) {
      console.log(
        `  ${i + 1}. ${top5[i].majorName} (${top5[i].majorId}): ${top5[i].score.toFixed(4)}`
      );
    }
  }

  // Compare with expected output if available
  const expectedPath = path.join(FIXTURES_DIR, "expected-output.json");
  if (fs.existsSync(expectedPath)) {
    const expected = loadJson<{
      scores: Record<string, number>;
      top5Ids: string[];
    }>(expectedPath);

    let match = true;
    for (const d of DIMENSION_ORDER) {
      if (Math.abs((scores[d] ?? 0) - (expected.scores[d] ?? 0)) > 0.01) {
        console.error(
          `MISMATCH: ${d} expected=${expected.scores[d]?.toFixed(3)} got=${(scores[d] ?? 0).toFixed(3)}`
        );
        match = false;
      }
    }
    for (let i = 0; i < expected.top5Ids.length; i++) {
      if (top5[i]?.majorId !== expected.top5Ids[i]) {
        console.error(
          `MISMATCH: rank ${i + 1} expected=${expected.top5Ids[i]} got=${top5[i]?.majorId}`
        );
        match = false;
      }
    }
    if (match) {
      console.log("\nPASS: Results match expected output");
    } else {
      console.error("\nFAIL: Results differ from expected output");
      allValid = false;
    }
  } else {
    console.log("\nINFO: No expected-output.json found — run is reference. Save this output as expected.");
  }

  if (!allValid) {
    process.exit(1);
  }
}

main();
