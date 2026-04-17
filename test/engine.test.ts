import test from "node:test";
import assert from "node:assert/strict";
import { GEOXEngine } from "../src/engine/GEOXEngine.js";

const GEOX = new GEOXEngine();

test("GEOXEngine — generateScenarios returns array of GEOXScenarioContract", async () => {
  const scenarios = await GEOX.generateScenarios("primary");
  assert.ok(Array.isArray(scenarios));
  assert.ok(scenarios.length > 0);
  for (const s of scenarios) {
    assert.ok(typeof s.id === "string");
    assert.ok(typeof s.name === "string");
    assert.ok(typeof s.physicalConstraints === "object");
    assert.ok(typeof s.probability === "number");
    assert.ok(["ESTIMATE", "HYPOTHESIS"].includes(s.tag));
  }
});

test("GEOXEngine — primary scenario has higher probability", async () => {
  const primary = await GEOX.generateScenarios("primary");
  const secondary = await GEOX.generateScenarios("secondary");
  assert.ok(primary[0].probability >= secondary[0].probability);
});

test("GEOXEngine — scenario has physicalConstraints with maxExtractionRate", async () => {
  const scenarios = await GEOX.generateScenarios("primary");
  const s = scenarios[0];
  assert.ok(typeof s.physicalConstraints.maxExtractionRate === "number");
  assert.ok(typeof s.physicalConstraints.seismicRiskIndex === "number");
  assert.ok(typeof s.physicalConstraints.environmentalImpact === "number");
});

test("GEOXEngine — HYPOTHESIS tag has fewer grounding evidence", async () => {
  const scenarios = await GEOX.generateScenarios("primary");
  const hypothesis = scenarios.find((s) => s.tag === "HYPOTHESIS");
  const estimate = scenarios.find((s) => s.tag === "ESTIMATE");
  assert.ok(hypothesis);
  assert.ok(estimate);
  assert.ok(hypothesis.groundingEvidence.length <= estimate.groundingEvidence.length);
});

test("GEOXEngine — all scenarios have groundingEvidence array", async () => {
  const scenarios = await GEOX.generateScenarios("primary");
  for (const s of scenarios) {
    assert.ok(Array.isArray(s.groundingEvidence));
  }
});

test("WealthEngine — allocate returns WealthAllocationContract array", async () => {
  const { WealthEngine } = await import("../src/engine/WealthEngine.js");
  const wealth = new WealthEngine();
  const scenarios = await GEOX.generateScenarios("primary");
  const allocations = await wealth.allocate(scenarios);
  assert.ok(Array.isArray(allocations));
  for (const a of allocations) {
    assert.ok(typeof a.id === "string");
    assert.ok(typeof a.capitalRequired === "number");
    assert.ok(typeof a.computeJoules === "number");
    assert.ok(typeof a.expectedROI === "object");
    assert.ok(typeof a.maruahScore === "number");
    assert.ok(typeof a.reversibility === "number");
  }
});

test("WealthEngine — high seismic risk increases capitalRequired", async () => {
  const { WealthEngine } = await import("../src/engine/WealthEngine.js");
  const wealth = new WealthEngine();
  const lowRisk = { id: "low", name: "Low Risk", physicalConstraints: { maxExtractionRate: 500, seismicRiskIndex: 0.1, environmentalImpact: 0.1 }, probability: 0.9, tag: "ESTIMATE" as const, groundingEvidence: ["Low risk"] };
  const highRisk = { id: "high", name: "High Risk", physicalConstraints: { maxExtractionRate: 800, seismicRiskIndex: 0.45, environmentalImpact: 0.7 }, probability: 0.3, tag: "HYPOTHESIS" as const, groundingEvidence: [] };
  const allocLow = await wealth.allocate([lowRisk]);
  const allocHigh = await wealth.allocate([highRisk]);
  assert.ok(allocHigh[0].capitalRequired > allocLow[0].capitalRequired);
});

test("WealthEngine — high environmental impact reduces maruahScore", async () => {
  const { WealthEngine } = await import("../src/engine/WealthEngine.js");
  const wealth = new WealthEngine();
  const lowEnv = { id: "low", name: "Low", physicalConstraints: { maxExtractionRate: 500, seismicRiskIndex: 0.1, environmentalImpact: 0.1 }, probability: 0.9, tag: "ESTIMATE" as const, groundingEvidence: [] };
  const highEnv = { id: "high", name: "High", physicalConstraints: { maxExtractionRate: 800, seismicRiskIndex: 0.4, environmentalImpact: 0.7 }, probability: 0.3, tag: "HYPOTHESIS" as const, groundingEvidence: [] };
  const allocLow = await wealth.allocate([lowEnv]);
  const allocHigh = await wealth.allocate([highEnv]);
  assert.ok(allocLow[0].maruahScore > allocHigh[0].maruahScore);
});

test("WealthEngine — HYPOTHESIS scenarios get higher knowledgeDelta", async () => {
  const { WealthEngine } = await import("../src/engine/WealthEngine.js");
  const wealth = new WealthEngine();
  const estimate = { id: "est", name: "Est", physicalConstraints: { maxExtractionRate: 500, seismicRiskIndex: 0.2, environmentalImpact: 0.3 }, probability: 0.7, tag: "ESTIMATE" as const, groundingEvidence: ["Data"] };
  const hypothesis = { id: "hyp", name: "Hyp", physicalConstraints: { maxExtractionRate: 700, seismicRiskIndex: 0.4, environmentalImpact: 0.5 }, probability: 0.4, tag: "HYPOTHESIS" as const, groundingEvidence: [] };
  const allocEst = await wealth.allocate([estimate]);
  const allocHyp = await wealth.allocate([hypothesis]);
  assert.ok(allocHyp[0].expectedROI.knowledge > allocEst[0].expectedROI.knowledge);
});

test("WealthEngine — ROI object has financial, knowledge, peace components", async () => {
  const { WealthEngine } = await import("../src/engine/WealthEngine.js");
  const wealth = new WealthEngine();
  const scenarios = await GEOX.generateScenarios("primary");
  const allocations = await wealth.allocate(scenarios);
  for (const a of allocations) {
    assert.ok(typeof a.expectedROI.financial === "number");
    assert.ok(typeof a.expectedROI.knowledge === "number");
    assert.ok(typeof a.expectedROI.peace === "number");
  }
});

test("WealthEngine — reversibility = 1 - (environmentalImpact / 2)", async () => {
  const { WealthEngine } = await import("../src/engine/WealthEngine.js");
  const wealth = new WealthEngine();
  const s = { id: "t", name: "T", physicalConstraints: { maxExtractionRate: 500, seismicRiskIndex: 0.2, environmentalImpact: 0.6 }, probability: 0.5, tag: "ESTIMATE" as const, groundingEvidence: [] };
  const alloc = await wealth.allocate([s]);
  assert.ok(Math.abs(alloc[0].reversibility - (1 - 0.6 / 2)) < 0.01);
});
