/* ── Full Onboarding Workflow Types ── */

export type PreScreenResult = "Pass" | "Fail" | "Unable to Verify" | "Pending Review" | "Refer to TCG" | null;
export type ChecklistSectionResult = "Pass" | "Fail" | "Pending" | "Refer to TCG" | null;
export type OnboardingAppStatus = "draft" | "pre-screening" | "checklist" | "pending-approval" | "approved" | "rejected";

/* ── Pre-Screening ── */

export interface CompaniesHouseCheck {
  companyStatus: "Active" | "Dormant" | "In Liquidation" | "Dissolved" | "Other" | "";
  director1Name: string;
  director2Name: string;
  pscDisclosed: "Yes" | "No" | "Not Applicable" | "";
  addressMatches: "Yes" | "No" | "";
  notes: string;
  result: PreScreenResult;
}

export interface FcaRegisterCheck {
  fcaRefNumber: string;
  authorisationType: "Full Authorisation" | "Appointed Representative" | "Not Authorised" | "";
  consumerCredit: "Yes" | "No" | "";
  insuranceDistribution: "Yes" | "No" | "";
  authorisationStatus: "Current" | "Lapsed" | "Cancelled" | "Not Found" | "";
  tradingNameMatches: "Yes" | "No" | "";
  notes: string;
  result: PreScreenResult;
}

export interface FinancialStandingCheck {
  creditCheckSource: "Manual Review" | "Credit Agency" | "";
  creditScore: number | null;
  ccjsPresent: "Yes" | "No" | "Unknown" | "";
  ccjCount: number | null;
  ccjTotalValue: number | null;
  ccjMostRecentDate: string;
  accountsFiledOnTime: "Yes" | "No" | "Not Yet Due" | "";
  insolvencyNotices: "Yes" | "No" | "";
  notes: string;
  result: PreScreenResult;
}

export interface SanctionsAmlCheck {
  sanctionsCompleted: "Yes" | "No" | "";
  sanctionsResult: "Clear" | "Match Found" | "Possible Match" | "";
  sanctionsDetails: string;
  pepCompleted: "Yes" | "No" | "";
  pepResult: "No PEPs" | "PEP Identified" | "";
  pepDetails: string;
  adverseMediaCompleted: "Yes" | "No" | "";
  adverseMediaResult: "None" | "Minor" | "Significant" | "";
  adverseMediaDetails: string;
  notes: string;
  result: PreScreenResult;
}

export interface WebsiteTradingCheck {
  websiteActive: "Yes" | "No" | "";
  aprVisible: "Yes" | "No" | "Not Applicable" | "";
  riskWarnings: "Yes" | "No" | "Not Applicable" | "";
  websiteConsistent: "Yes" | "No" | "";
  notes: string;
  result: PreScreenResult;
}

export interface PreScreeningData {
  companiesHouse: CompaniesHouseCheck;
  fcaRegister: FcaRegisterCheck;
  financialStanding: FinancialStandingCheck;
  sanctionsAml: SanctionsAmlCheck;
  websiteTrading: WebsiteTradingCheck;
}

/* ── Checklist section data (8 sections) ── */

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
}

export interface DbsStaffRow {
  id: string;
  staffName: string;
  role: string;
  dbsLevel: "Basic" | "Standard" | "Enhanced" | "";
  certificateDate: string;
  expiryDate: string;
}

export interface TrainingRow {
  id: string;
  staffName: string;
  role: "F&I Manager" | "Dealer Principal" | "Sales Executive" | "Other" | "";
  qualification: string;
  provider: string;
  completionDate: string;
  expiryDate: string;
}

export interface ChecklistSection1 {
  companyActive: "Yes" | "No" | "Unable to Confirm" | "";
  companyType: "Limited Company" | "LLP" | "Sole Trader" | "Partnership" | "";
  director1Name: string;
  director1Dob: string;
  director1Nationality: string;
  director2Name: string;
  director2Dob: string;
  director2Nationality: string;
  director3Name: string;
  director3Dob: string;
  director3Nationality: string;
  pscDisclosed: "Yes" | "No" | "";
  pscName: string;
  pscOwnership: string;
  addressConfirmed: "Yes" | "No" | "";
  addressChanged12Months: "Yes" | "No" | "";
  companyAge: number | null;
  notes: string;
  files: UploadedFile[];
  result: ChecklistSectionResult;
  complete: boolean;
}

export interface ChecklistSection2 {
  fcaRefNumber: string;
  authorisationType: "Full Authorisation" | "Appointed Representative" | "Other" | "";
  principalName: string;
  consumerCredit: "Yes" | "No" | "";
  insuranceDistribution: "Yes" | "No" | "";
  expiryDate: string;
  conditions: "Yes" | "No" | "";
  conditionDetails: string;
  screenshotTaken: "Yes" | "No" | "";
  notes: string;
  files: UploadedFile[];
  result: ChecklistSectionResult;
  complete: boolean;
}

export interface ChecklistSection3 {
  creditSource: "Manual Review" | "CreditSafe" | "";
  creditScore: number | null;
  creditRating: string;
  ccjsOnRecord: "Yes" | "No" | "";
  ccjCount: number | null;
  ccjTotalValue: number | null;
  ccjMostRecent: string;
  ccjUnderAppeal: "Yes" | "No" | "";
  windingUpPetition: "Yes" | "No" | "";
  insolvencyHistory: "Yes" | "No" | "";
  insolvencyDetails: string;
  latestAccountsFiled: "Yes" | "No" | "Not yet due" | "";
  accountsFilingDate: string;
  accountsOverdue: "Yes" | "No" | "";
  turnover: number | null;
  netProfitLoss: number | null;
  yearsOfAccounts: number | null;
  notes: string;
  files: UploadedFile[];
  result: ChecklistSectionResult;
  complete: boolean;
}

export interface ChecklistSection4 {
  sanctionsCompleted: "Yes" | "No" | "";
  sanctionsResult: "Clear" | "Possible Match" | "Match Found" | "";
  sanctionsDetails: string;
  referToTcg: boolean;
  pepCompleted: "Yes" | "No" | "";
  pepResult: "No PEPs" | "PEP Identified" | "";
  pepName: string;
  pepNature: string;
  pepRiskNotes: string;
  adverseMediaCompleted: "Yes" | "No" | "";
  adverseMediaResult: "None" | "Minor Historical" | "Ongoing" | "Significant" | "";
  adverseMediaDetails: string;
  sourceOfFunds: "Yes" | "No" | "Not Applicable" | "";
  cddLevel: "Standard" | "Enhanced" | "Simplified" | "";
  enhancedCddCompleted: "Yes" | "No" | "N/A" | "";
  notes: string;
  files: UploadedFile[];
  result: ChecklistSectionResult;
  complete: boolean;
}

export interface ChecklistSection5 {
  staffRows: DbsStaffRow[];
  allStaffHaveDbs: "Yes" | "No" | "Partial" | "";
  anyExpired: "Yes" | "No" | "";
  renewalProcess: "Yes" | "No" | "N/A" | "";
  notes: string;
  files: UploadedFile[];
  result: ChecklistSectionResult;
  complete: boolean;
}

export interface ChecklistSection6 {
  trainingRows: TrainingRow[];
  allStaffQualified: "Yes" | "No" | "Partial" | "";
  cpdMaintained: "Yes" | "No" | "";
  trainingReviewed: "Yes" | "No" | "";
  notes: string;
  files: UploadedFile[];
  result: ChecklistSectionResult;
  complete: boolean;
}

export interface ChecklistSection7 {
  writtenProcedure: "Yes" | "No" | "";
  complaintsLogMaintained: "Yes" | "No" | "";
  complaintsCount12Months: number | null;
  resolvedWithin8Weeks: number | null;
  fosReferrals: number | null;
  fosUpheld: number | null;
  systemicPatterns: "Yes" | "No" | "";
  systemicDetails: string;
  customerFacingPublished: "Yes" | "No" | "";
  notes: string;
  files: UploadedFile[];
  result: ChecklistSectionResult;
  complete: boolean;
}

export interface ChecklistSection8 {
  websiteUrl: string;
  aprDisplayed: "Yes" | "No" | "Not Applicable" | "";
  riskWarnings: "Yes" | "No" | "Not Applicable" | "";
  clearFairNotMisleading: "Yes" | "No" | "";
  termsAndConditions: "Yes" | "No" | "";
  privacyPolicy: "Yes" | "No" | "";
  compliantSocialMedia: "Yes" | "No" | "Not Applicable" | "";
  notes: string;
  files: UploadedFile[];
  result: ChecklistSectionResult;
  complete: boolean;
}

export interface ChecklistData {
  section1: ChecklistSection1;
  section2: ChecklistSection2;
  section3: ChecklistSection3;
  section4: ChecklistSection4;
  section5: ChecklistSection5;
  section6: ChecklistSection6;
  section7: ChecklistSection7;
  section8: ChecklistSection8;
}

/* ── Full Application ── */

export interface OnboardingApplicationFull {
  id: string;
  companyName: string;
  companiesHouseNumber: string;
  tradingName: string;
  websiteUrl: string;
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  address: {
    street: string;
    town: string;
    county: string;
    postcode: string;
  };
  status: OnboardingAppStatus;
  preScreening: PreScreeningData;
  checklist: ChecklistData;
  createdAt: string;
  updatedAt: string;
}

/* ── Defaults ── */

export function createEmptyPreScreening(): PreScreeningData {
  return {
    companiesHouse: { companyStatus: "", director1Name: "", director2Name: "", pscDisclosed: "", addressMatches: "", notes: "", result: null },
    fcaRegister: { fcaRefNumber: "", authorisationType: "", consumerCredit: "", insuranceDistribution: "", authorisationStatus: "", tradingNameMatches: "", notes: "", result: null },
    financialStanding: { creditCheckSource: "", creditScore: null, ccjsPresent: "", ccjCount: null, ccjTotalValue: null, ccjMostRecentDate: "", accountsFiledOnTime: "", insolvencyNotices: "", notes: "", result: null },
    sanctionsAml: { sanctionsCompleted: "", sanctionsResult: "", sanctionsDetails: "", pepCompleted: "", pepResult: "", pepDetails: "", adverseMediaCompleted: "", adverseMediaResult: "", adverseMediaDetails: "", notes: "", result: null },
    websiteTrading: { websiteActive: "", aprVisible: "", riskWarnings: "", websiteConsistent: "", notes: "", result: null },
  };
}

export function createEmptyChecklist(): ChecklistData {
  const emptySection = (extra: Record<string, unknown> = {}) => ({
    notes: "",
    files: [] as UploadedFile[],
    result: null as ChecklistSectionResult,
    complete: false,
    ...extra,
  });
  return {
    section1: { ...emptySection(), companyActive: "", companyType: "", director1Name: "", director1Dob: "", director1Nationality: "", director2Name: "", director2Dob: "", director2Nationality: "", director3Name: "", director3Dob: "", director3Nationality: "", pscDisclosed: "", pscName: "", pscOwnership: "", addressConfirmed: "", addressChanged12Months: "", companyAge: null },
    section2: { ...emptySection(), fcaRefNumber: "", authorisationType: "", principalName: "", consumerCredit: "", insuranceDistribution: "", expiryDate: "", conditions: "", conditionDetails: "", screenshotTaken: "" },
    section3: { ...emptySection(), creditSource: "", creditScore: null, creditRating: "", ccjsOnRecord: "", ccjCount: null, ccjTotalValue: null, ccjMostRecent: "", ccjUnderAppeal: "", windingUpPetition: "", insolvencyHistory: "", insolvencyDetails: "", latestAccountsFiled: "", accountsFilingDate: "", accountsOverdue: "", turnover: null, netProfitLoss: null, yearsOfAccounts: null },
    section4: { ...emptySection(), sanctionsCompleted: "", sanctionsResult: "", sanctionsDetails: "", referToTcg: false, pepCompleted: "", pepResult: "", pepName: "", pepNature: "", pepRiskNotes: "", adverseMediaCompleted: "", adverseMediaResult: "", adverseMediaDetails: "", sourceOfFunds: "", cddLevel: "", enhancedCddCompleted: "" },
    section5: { ...emptySection(), staffRows: [], allStaffHaveDbs: "", anyExpired: "", renewalProcess: "" },
    section6: { ...emptySection(), trainingRows: [], allStaffQualified: "", cpdMaintained: "", trainingReviewed: "" },
    section7: { ...emptySection(), writtenProcedure: "", complaintsLogMaintained: "", complaintsCount12Months: null, resolvedWithin8Weeks: null, fosReferrals: null, fosUpheld: null, systemicPatterns: "", systemicDetails: "", customerFacingPublished: "" },
    section8: { ...emptySection(), websiteUrl: "", aprDisplayed: "", riskWarnings: "", clearFairNotMisleading: "", termsAndConditions: "", privacyPolicy: "", compliantSocialMedia: "" },
  } as ChecklistData;
}

export function createEmptyApplication(): Omit<OnboardingApplicationFull, "id" | "createdAt" | "updatedAt"> {
  return {
    companyName: "",
    companiesHouseNumber: "",
    tradingName: "",
    websiteUrl: "",
    primaryContactName: "",
    primaryContactEmail: "",
    primaryContactPhone: "",
    address: { street: "", town: "", county: "", postcode: "" },
    status: "draft",
    preScreening: createEmptyPreScreening(),
    checklist: createEmptyChecklist(),
  };
}
