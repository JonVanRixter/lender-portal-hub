# DealerGuard POC — CTA Button & Reporting Accuracy Test Checklist

## AUTH
- [ ] Login with test@lender.com / Password123 → redirects to /dashboard
- [ ] Login with wrong credentials → error message shown, stays on login
- [ ] Navigate to /dashboard without login → redirects to /login
- [ ] Logout button → clears session, redirects to /login

## DASHBOARD
- [ ] Critical Alerts KPI count = number of "Threshold Breach" + "Pending" alerts in alerts.json (expected: 3)
- [ ] Average Risk Score = mean of all 11 dealer scores (expected: ~66.5)
- [ ] Donut chart shows: Green=4, Amber=5, Red=2
- [ ] Clicking Green segment → dealer list filters to Green only
- [ ] Clicking Amber segment → dealer list filters to Amber only
- [ ] Clicking Red segment → dealer list filters to Red only
- [ ] Top Risk Dealers widget shows: Horizon (35), Summit (42), Northgate (55), Riverside (58), Castle (61)
- [ ] Clicking a dealer in Top Risk widget → navigates to /dealers/:id
- [ ] Notification bell shows count = number of Pending alerts (expected: 13)
- [ ] Bell dropdown shows 5 most recent alerts
- [ ] "View All Alerts" link in bell dropdown → navigates to /alerts

## DEALERS LIST (/dealers)
- [ ] All 11 dealers display in table
- [ ] Search for "summit" → shows Summit Cars only
- [ ] Filter to Red → shows Summit Cars and Horizon Motors only
- [ ] Filter to Amber → shows 5 amber dealers only
- [ ] Filter to Green → shows 4 green dealers only
- [ ] Sort by Score ascending → Horizon (35) first
- [ ] Sort by Score descending → Lakeside (91) first
- [ ] Click any dealer row → navigates to /dealers/:id for correct dealer
- [ ] "Add New Dealer" button → opens onboarding flow

## DEALER DETAIL (/dealers/:id)
- [ ] Score badge and RAG status match dealers.json for each dealer
- [ ] All 8 section cards display with correct Pass/Fail/Pending from sections[]
- [ ] Audit history timeline shows correct number of entries per dealer
- [ ] Score trend arrows: ↑ up, ↓ down, → neutral match auditHistory[].change
- [ ] Key Actions table shows correct actions per dealer
- [ ] Documents panel shows only documents for current dealer (dealerId match)
- [ ] CSS gauge shows correct score and Reward/Oversight badge
- [ ] CSS: Lakeside (91) = Reward; Summit (42) = Oversight
- [ ] "Request Re-Audit" button → opens modal with warning, reason dropdown, justification field
- [ ] Re-audit modal Confirm → appends new Pending entry to audit history in UI
- [ ] Re-audit modal Cancel → closes modal, no change
- [ ] "Download Full Report" button → shows toast "PDF export available in full MVP"
- [ ] For d010 (Summit) → verify all Red section cards displayed correctly
- [ ] For d011 (Horizon) → verify FCA Auth section shows Red/Fail

## DOCUMENTS (/documents)
- [ ] All 37 documents display in table
- [ ] Dealer Name column resolves from dealerId (not showing raw ID)
- [ ] Expired documents (e.g. doc015, doc016) show red "EXPIRED" badge
- [ ] Expiring Soon documents show orange tag
- [ ] Valid documents show green badge
- [ ] Filter by "Expired" → shows only expired documents (expected: 11)
- [ ] Filter by "Expiring Soon" → shows only expiring documents
- [ ] Filter by DBS category → shows only DBS documents
- [ ] Search "Summit" → shows only Summit Cars documents
- [ ] "Upload Document" button → opens modal with dealer select, category, file, expiry
- [ ] Upload form submit → appends to document list in UI with computed status
- [ ] Delete button → confirmation modal appears
- [ ] Delete confirm → removes document from list

## ALERTS (/alerts)
- [ ] All 15 alerts display
- [ ] Filter by "Pending" → shows 13 alerts
- [ ] Filter by "Acknowledged" → shows 2 alerts (al012, al013)
- [ ] Filter by "High" severity → shows correct subset
- [ ] Filter by "Threshold Breach" type → shows 3 alerts
- [ ] "Acknowledge" button on Pending alert → opens modal
- [ ] Acknowledge confirm → status changes to Acknowledged in UI
- [ ] After acknowledging → bell badge count decrements by 1
- [ ] Dealer names resolve correctly (not raw dealer IDs)

## REPORTS (/reports)
- [ ] Donut chart: Green=4, Amber=5, Red=2
- [ ] Average score KPI = 66.5 (or to 1dp)
- [ ] Score distribution bar chart: 0–24=0, 25–49=2, 50–74=7, 75–100=2 (Note: score bands use < not <=)
- [ ] Section heatmap: Horizon Motors row shows all Red (except Legal Status = Green)
- [ ] Section heatmap: Lakeside Prestige row shows all Green
- [ ] Section heatmap: Complaints Handling row shows Red for Northgate, Riverside, Summit, Horizon
- [ ] CSS table: 4 Reward, 7 Oversight
- [ ] Document summary: Valid=16, Expiring Soon=10, Expired=11
- [ ] Alerts summary: Threshold Breach Pending=3, Document Expiry Pending=8, Manual Review Pending=3 (approx — verify against alerts.json)
- [ ] Open Actions count matches sum of keyActions where status="Open" across all dealers
- [ ] Dealer report dropdown → selecting a dealer populates all report sections below
- [ ] Dealer report: selecting d010 shows Red RAG, score 42, all 4 open critical actions
- [ ] "Download PDF" button → toast shown

## DO NOT DEAL (/do-not-deal)
- [ ] All 5 banned entities display in table
- [ ] Entity types shown correctly (Dealer vs Director)
- [ ] "Add to Do Not Deal List" button → opens modal
- [ ] All modal fields validate (notes required, entity name required)
- [ ] Submit → appends entity to list in UI

## SETTINGS (/settings)
- [ ] RAG threshold sliders default at Green=75, Amber=50–74, Red<50
- [ ] Changing thresholds → confirmation modal appears
- [ ] Confirm threshold change → toast confirms recalculation
- [ ] Team management table loads with sample users
- [ ] "Add User" button → modal opens with Email + Role fields
- [ ] Notification preference toggles save without error
- [ ] Theme toggle switches light/dark correctly

## NAVIGATION
- [ ] All 7 sidebar links navigate to correct routes without error
- [ ] Active sidebar item highlighted correctly on each route
- [ ] Global search: typing "summit" → shows Summit Cars in dropdown
- [ ] Global search: typing "DBS" → shows relevant documents
- [ ] Global search: clicking result → navigates to correct page
- [ ] Header notification bell visible on all pages
- [ ] User profile dropdown shows name and logout option on all pages
- [ ] Mobile: sidebar collapses to hamburger at <768px breakpoint
