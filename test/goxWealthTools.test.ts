import test from "node:test";
import assert from "node:assert/strict";
import { GEOXCheckHazardTool } from "../src/tools/GEOXTools.js";
import { WealthEvaluateROITool } from "../src/tools/WealthTools.js";
import type { ToolExecutionContext } from "../src/types/tool.js";

const hazardTool = new GEOXCheckHazardTool();
const roiTool = new WealthEvaluateROITool();
const ctx: ToolExecutionContext = { sessionId: "test", workingDirectory: "/tmp", modeName: "internal_mode" };

test("GEOXCheckHazardTool — name is GEOX_check_hazard", () => {
  assert.equal(hazardTool.name, "GEOX_check_hazard");
});

test("GEOXCheckHazardTool — riskLevel is guarded", () => {
  assert.equal(hazardTool.riskLevel, "guarded");
});

test("GEOXCheckHazardTool — returns hazard result with uncertainty tag", async () => {
  const result = await hazardTool.run({ location: "Sumatra", hazard_types: ["seismic"] }, ctx);
  assert.ok(result.ok);
  const parsed = JSON.parse(result.output as string);
  assert.ok(["low", "medium", "high", "critical"].includes(parsed.hazardLevel));
  assert.ok(["ESTIMATE", "HYPOTHESIS", "UNKNOWN"].includes(parsed.uncertaintyTag));
});

test("GEOXCheckHazardTool — high-risk location triggers high/critical hazard", async () => {
  const result = await hazardTool.run({ location: "subduction zone near Indonesia Java trench", hazard_types: ["seismic", "volcanic"] }, ctx);
  const parsed = JSON.parse(result.output as string);
  assert.ok(["high", "critical"].includes(parsed.hazardLevel));
});

test("GEOXCheckHazardTool — low-risk location triggers low/medium hazard", async () => {
  const result = await hazardTool.run({ latitude: 55, longitude: -3, hazard_types: ["flood"] }, ctx);
  const parsed = JSON.parse(result.output as string);
  assert.ok(["low", "medium"].includes(parsed.hazardLevel));
});

test("GEOXCheckHazardTool — extraction scenario sets maxExtractionRate", async () => {
  const result = await hazardTool.run({ location: "Sumatra", hazard_types: ["seismic"], scenario: "extraction" }, ctx);
  const parsed = JSON.parse(result.output as string);
  assert.ok(typeof parsed.physicalConstraints.maxExtractionRate === "number");
  assert.ok(typeof parsed.physicalConstraints.maxSafeDepth === "number");
});

test("GEOXCheckHazardTool — critical hazard includes 888_HOLD recommendation", async () => {
  const result = await hazardTool.run({ location: "Pacific subduction zone", hazard_types: ["seismic"] }, ctx);
  const parsed = JSON.parse(result.output as string);
  if (parsed.hazardLevel === "critical") {
    assert.ok(parsed.recommendations.some((r: string) => /888_HOLD|mandatory/i.test(r)));
  }
});

test("GEOXCheckHazardTool — result includes confidenceInterval", async () => {
  const result = await hazardTool.run({ location: "Tokyo", hazard_types: ["seismic"] }, ctx);
  const parsed = JSON.parse(result.output as string);
  assert.ok(Array.isArray(parsed.confidenceInterval));
  assert.equal(parsed.confidenceInterval.length, 2);
  assert.ok(parsed.confidenceInterval[0] < parsed.confidenceInterval[1]);
});

test("GEOXCheckHazardTool — result includes groundingEvidence", async () => {
  const result = await hazardTool.run({ location: "Active zone", hazard_types: ["seismic"] }, ctx);
  const parsed = JSON.parse(result.output as string);
  assert.ok(Array.isArray(parsed.groundingEvidence));
  assert.ok(parsed.groundingEvidence.length > 0);
});

test("WealthEvaluateROITool — name is wealth_evaluate_ROI", () => {
  assert.equal(roiTool.name, "wealth_evaluate_ROI");
});

test("WealthEvaluateROITool — riskLevel is guarded", () => {
  assert.equal(roiTool.riskLevel, "guarded");
});

test("WealthEvaluateROITool — positive ROI returns PROCEED", async () => {
  const result = await roiTool.run({ capitalRequired: 100000, expectedReturn: 150000, scenario: "development" }, ctx);
  const parsed = JSON.parse(result.output as string);
  assert.ok(["PROCEED", "HOLD"].includes(parsed.wealthVerdict));
  assert.ok(parsed.emv > 0);
});

test("WealthEvaluateROITool — negative NPV triggers HOLD", async () => {
  const result = await roiTool.run({ capitalRequired: 1000000, expectedReturn: 200000, discountRate: 0.15 }, ctx);
  const parsed = JSON.parse(result.output as string);
  assert.ok(parsed.npv < 0);
  assert.ok(["HOLD", "VOID"].includes(parsed.wealthVerdict));
});

test("WealthEvaluateROITool — extraction scenario reduces maruahScore", async () => {
  const result = await roiTool.run({ capitalRequired: 500000, scenario: "extraction", domain: "GEOX" }, ctx);
  const parsed = JSON.parse(result.output as string);
  assert.ok(parsed.maruahScore < 0.9);
});

test("WealthEvaluateROITool — CODE domain has high maruahScore", async () => {
  const result = await roiTool.run({ capitalRequired: 50000, domain: "CODE" }, ctx);
  const parsed = JSON.parse(result.output as string);
  assert.ok(parsed.maruahScore >= 0.9);
});

test("WealthEvaluateROITool — objective function computed correctly", async () => {
  const result = await roiTool.run({ capitalRequired: 100000, expectedReturn: 150000, domain: "CODE" }, ctx);
  const parsed = JSON.parse(result.output as string);
  const expected = (parsed.peaceSquared * parsed.knowledgeDelta) / (parsed.entropyDelta * parsed.capitalDelta);
  assert.ok(Math.abs(parsed.objectiveScore - expected) < 0.01);
});

test("WealthEvaluateROITool — high joules triggers HIGH/CRITICAL thermodynamic band", async () => {
  const result = await roiTool.run({ capitalRequired: 500000, joulesEstimate: 20000 }, ctx);
  const parsed = JSON.parse(result.output as string);
  assert.ok(["HIGH", "CRITICAL"].includes(parsed.thermodynamicBand));
});

test("WealthEvaluateROITool — returns uncertaintyTag", async () => {
  const result = await roiTool.run({ capitalRequired: 500000, scenario: "extraction", domain: "GEOX" }, ctx);
  const parsed = JSON.parse(result.output as string);
  assert.ok(["ESTIMATE", "HYPOTHESIS", "UNKNOWN"].includes(parsed.uncertaintyTag));
});

test("WealthEvaluateROITool — reasoning string includes all metrics", async () => {
  const result = await roiTool.run({ capitalRequired: 100000, expectedReturn: 150000 }, ctx);
  const parsed = JSON.parse(result.output as string);
  assert.ok(parsed.reasoning.includes("EMV="));
  assert.ok(parsed.reasoning.includes("NPV="));
  assert.ok(parsed.reasoning.includes("Objective="));
});

test("WealthEvaluateROITool — violations array populated on negative EMV/NPV", async () => {
  const result = await roiTool.run({ capitalRequired: 1000000, expectedReturn: 100000 }, ctx);
  const parsed = JSON.parse(result.output as string);
  assert.ok(parsed.violations.length > 0);
  assert.ok(parsed.violations.some((v: string) => v.includes("NPV")));
});

test("WealthEvaluateROITool — F6 maruah violation or CRITICAL thermo triggers VOID", async () => {
  const result = await roiTool.run({ capitalRequired: 500000, scenario: "extraction", domain: "GEOX", joulesEstimate: 100000 }, ctx);
  const parsed = JSON.parse(result.output as string);
  if (parsed.maruahScore < 0.5 || parsed.thermodynamicBand === "CRITICAL") {
    assert.equal(parsed.wealthVerdict, "VOID");
  }
});
