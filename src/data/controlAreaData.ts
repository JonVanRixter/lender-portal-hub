/**
 * Control area breakdown data for each audit section.
 * Based on the Blackmore Automotive audit document structure.
 * Each dealer's section scores/results override the template results.
 */

export interface ControlArea {
  controlArea: string;
  objective: string;
  result: "Pass" | "Pending" | "Fail";
  riskRating: "High" | "Medium" | "Low";
  notes: string;
}

export type SectionControlAreas = Record<string, ControlArea[]>;

/** Template control areas per section — Blackmore (d001) baseline, all Pass */
export const sectionControlAreas: SectionControlAreas = {
  "Legal Status": [
    { controlArea: "Legal entity status", objective: "Verify company is active and not dissolved", result: "Pass", riskRating: "Medium", notes: "Companies House confirmed active" },
    { controlArea: "Trading name alignment", objective: "Confirm consistency across FCA, ICO, website", result: "Pass", riskRating: "Medium", notes: "All records aligned" },
    { controlArea: "Directors & PSCs", objective: "Confirm governance structure and 24-month change history", result: "Pass", riskRating: "Medium", notes: "Directors verified, PSCs disclosed" },
    { controlArea: "Adverse media & sanctions screening", objective: "Identify potential compliance risks", result: "Pass", riskRating: "High", notes: "Screening clear — no adverse findings" },
    { controlArea: "DBS / self-declaration", objective: "Confirm no undisclosed sanctions", result: "Pass", riskRating: "Medium", notes: "Annual self-declaration in place" },
  ],
  "FCA Authorization": [
    { controlArea: "FCA authorisation & permissions", objective: "Confirm correct authorisation status and permissions", result: "Pass", riskRating: "High", notes: "FCA ref confirmed, consumer credit permissions in place" },
    { controlArea: "Competence — training matrix", objective: "Role-based training and competence records", result: "Pass", riskRating: "High", notes: "All F&I staff certificates verified" },
    { controlArea: "SMF allocation", objective: "Oversight responsibilities mapped", result: "Pass", riskRating: "Medium", notes: "Oversight structure confirmed" },
    { controlArea: "Company House / FCA / website cross-reference", objective: "Director name and trading name consistency", result: "Pass", riskRating: "Medium", notes: "All records consistent" },
  ],
  "Financial Risk": [
    { controlArea: "Credit score & financial standing", objective: "Assess financial stability", result: "Pass", riskRating: "Medium", notes: "Score 72/100. No active CCJs" },
    { controlArea: "CCJ / insolvency history", objective: "Identify financial risk indicators", result: "Pass", riskRating: "Medium", notes: "No CCJs. Accounts filed on time" },
    { controlArea: "Filed accounts review", objective: "Confirm trading viability", result: "Pass", riskRating: "Low", notes: "Accounts filed within deadline" },
  ],
  "KYC & AML": [
    { controlArea: "KYC / IDV completed", objective: "Identity verification at application", result: "Pass", riskRating: "Medium", notes: "All checks clear" },
    { controlArea: "Sanctions & PEP screening", objective: "Screening at application and ongoing", result: "Pass", riskRating: "Medium", notes: "CreditSafe checks clear" },
    { controlArea: "Adverse media (directors)", objective: "Identify ongoing risk indicators", result: "Pass", riskRating: "High", notes: "No adverse media identified" },
    { controlArea: "Source of funds", objective: "CDD level assessment", result: "Pass", riskRating: "Medium", notes: "Standard CDD applied" },
  ],
  "DBS Compliance": [
    { controlArea: "DBS certificates — all relevant staff", objective: "Confirm DBS in place and valid", result: "Pass", riskRating: "Medium", notes: "All certificates within 3-year window" },
    { controlArea: "Renewal cycle", objective: "Confirm renewal process in place", result: "Pending", riskRating: "Medium", notes: "T. Patel certificate expires Apr 2026 — renewal flagged" },
    { controlArea: "Self-declaration", objective: "Annual declaration completed", result: "Pass", riskRating: "Medium", notes: "Declarations in place" },
  ],
  "Training & Competence": [
    { controlArea: "F&I qualifications", objective: "All regulated staff hold relevant qualifications", result: "Pass", riskRating: "High", notes: "AM qualifications held" },
    { controlArea: "CPD records", objective: "Continuing professional development maintained", result: "Pass", riskRating: "Medium", notes: "CPD records up to date" },
    { controlArea: "Training log completeness", objective: "Records reviewed within 12 months", result: "Pass", riskRating: "Medium", notes: "All records current" },
  ],
  "Complaints Handling": [
    { controlArea: "Complaint volume benchmarking", objective: "Volume vs customer sentiment", result: "Pass", riskRating: "High", notes: "Low complaint volume" },
    { controlArea: "8-week resolution SLA", objective: "All complaints resolved within SLA", result: "Pass", riskRating: "High", notes: "All within SLA" },
    { controlArea: "FOS referral rate", objective: "Measure escalation rate", result: "Pass", riskRating: "High", notes: "No FOS referrals in period" },
    { controlArea: "Root cause analysis", objective: "RCA register maintained", result: "Pass", riskRating: "Medium", notes: "RCA register in place" },
    { controlArea: "Customer sentiment score", objective: "CSS score and movement", result: "Pass", riskRating: "High", notes: "CSS 84 — Reward threshold" },
  ],
  "Website & Marketing": [
    { controlArea: "Website compliance", objective: "Clear, fair, not misleading", result: "Pass", riskRating: "Medium", notes: "Sedric scan clear" },
    { controlArea: "APR representative example", objective: "Displayed prominently", result: "Pass", riskRating: "Medium", notes: "APR visible on all finance pages" },
    { controlArea: "Risk warnings", objective: "FCA-required warnings present", result: "Pass", riskRating: "Medium", notes: "All warnings in place" },
    { controlArea: "Social media monitoring", objective: "Financial promotions compliance", result: "Pass", riskRating: "Medium", notes: "No concerns identified" },
    { controlArea: "Consumer Duty language", objective: "Updated for Consumer Duty", result: "Pass", riskRating: "High", notes: "Language updated throughout" },
  ],
};

/**
 * Get control areas for a section, adjusting results based on section score/result.
 * For non-Blackmore dealers, if the section failed/pending, some control areas inherit that status.
 */
export function getControlAreasForSection(
  sectionName: string,
  sectionResult: "Pass" | "Pending" | "Fail",
  sectionNotes: string,
): ControlArea[] {
  const template = sectionControlAreas[sectionName];
  if (!template) return [];

  // If section passed, show all as pass (template default)
  if (sectionResult === "Pass") {
    return template;
  }

  // For failed/pending sections, mark ~40% of control areas with the section's result
  // and use the section notes for the last control area
  return template.map((ca, idx) => {
    if (idx >= Math.ceil(template.length * 0.6)) {
      return {
        ...ca,
        result: sectionResult,
        notes: idx === template.length - 1 ? sectionNotes : `Under review — ${sectionResult.toLowerCase()}`,
      };
    }
    return ca;
  });
}
