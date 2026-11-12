import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
const baseline = JSON.parse(
  readFileSync(
    new URL("../docs/security/npm-audit-baseline.json", import.meta.url),
    "utf8",
  ),
);
let output;
try {
  output = execFileSync("npm", ["audit", "--json"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
} catch (e) {
  output = e.stdout;
  if (!output) {
    console.error("npm audit unavailable; no security result can be claimed");
    process.exit(2);
  }
}
let report;
try {
  report = JSON.parse(output);
} catch {
  console.error("Invalid npm audit response");
  process.exit(2);
}
if (report.error || !report.metadata) {
  console.error("npm audit failed; review registry connectivity");
  process.exit(2);
}
const known = new Set(
  baseline.knownHighCritical.map(
    (x) => `${x.name}:${x.severity}:${x.advisories.join(",")}`,
  ),
);
const current = Object.entries(report.vulnerabilities || {})
  .filter(([, v]) => ["high", "critical"].includes(v.severity))
  .map(([name, v]) => ({
    name,
    severity: v.severity,
    advisories: v.via
      .filter((x) => typeof x === "object")
      .map((x) => x.url)
      .sort(),
  }));
const introduced = current.filter(
  (x) => !known.has(`${x.name}:${x.severity}:${x.advisories.join(",")}`),
);
console.log(
  JSON.stringify(
    {
      counts: report.metadata.vulnerabilities,
      knownHighCritical: current,
      newHighCritical: introduced,
    },
    null,
    2,
  ),
);
if (introduced.length) {
  console.error("New/unreviewed high or critical dependency findings detected");
  process.exitCode = 1;
} else
  console.log(
    "No new high/critical findings versus the reviewed baseline. Known findings remain; this is not a clean audit.",
  );
