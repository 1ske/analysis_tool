# Lab Results Analysis Tool - Implementation Plan

## Overview
Build a medical lab analysis dashboard using **SvelteKit** (fullstack) with a **dark mode, sleek UI**. The tool analyzes if patient test values fall within age-and-gender-matched reference intervals from regional medical data.

**Tech Stack:**
- Frontend: Svelte 5 with TailwindCSS (dark theme)
- Backend: SvelteKit server routes (+server.ts)
- Data: good_reference.json (reference intervals), patient_data.json (patient records)

## Key Features
1. **Patient Selection**: Left-aligned hamburger menu with searchable patient list
2. **Lab Dashboard**: Display all tests for selected patient with visual range indicators
3. **Smart Analysis**: Match test values to age-appropriate reference intervals
4. **Status Indicators**: Clear visual feedback (Normal/Low/High) with color coding
5. **Dark UI**: Sleek gray tones, minimal design, medical-grade readability

## Architecture

### Backend (SvelteKit Server Routes)
```
src/routes/api/
├── patients/
│   ├── +server.ts          # GET list all patients
│   └── [patientId]/
│       └── +server.ts      # GET single patient with analysis
└── analyze/
    └── +server.ts          # POST analysis request
```

### Frontend (Svelte Components)
```
src/lib/
├── components/
│   ├── PatientDrawer.svelte        # Left hamburger menu, patient list
│   ├── LabCard.svelte              # Individual test display
│   ├── StatusBadge.svelte          # Normal/Low/High indicator
│   ├── RangeVisualizer.svelte      # Horizontal bar chart
│   └── Dashboard.svelte            # Main layout container
├── services/
│   └── analysisService.ts          # Core analysis logic
├── types/
│   └── medical.ts                  # TypeScript interfaces
└── utils/
    ├── colors.ts                   # Color mapping for statuses
    └── ageCalculator.ts            # Age-in-days calculation
```

### Data & Utils
```
src/
├── lib/data/
│   ├── referenceIntervals.ts       # Loaded good_reference.json
│   └── patientData.ts              # Loaded patient_data.json
└── routes/
    └── +page.svelte                # Main page layout
```

## Implementation Phases

### Phase 1: Project Setup & Data Loading
- Initialize SvelteKit project with Svelte 5
- Configure TailwindCSS with dark mode
- Load and parse good_reference.json and patient_data.json
- Create TypeScript interfaces for medical data types
- Create color & theming utilities (gray/slate dark theme)

### Phase 2: Core Analysis Logic
- `ageCalculator.ts`: Calculate patient age in days from birth_date and test_date
- `analysisService.ts`: Match test values to reference intervals
  - Find appropriate interval by gender, age range
  - Calculate offset percentage (0-100%) for bar visualization
  - Determine status: "normal" | "low" | "high"
- `medical.ts`: TypeScript types for Patient, TestResult, ReferenceInterval, Analysis

### Phase 3: Backend API Routes
- `GET /api/patients`: Return list of all patients (id, name, gender, age)
- `GET /api/patients/[patientId]`: Return patient + analyzed tests
- Analysis endpoint that returns: value, reference_min, reference_max, status, offset%

### Phase 4: Frontend Components
- `StatusBadge.svelte`: Color-coded status with icon
- `RangeVisualizer.svelte`: Horizontal bar with min/max markers and value indicator
- `LabCard.svelte`: Composite component (test name, value, unit, status badge, range bar)
- `Dashboard.svelte`: Grid layout displaying LabCards
- `PatientDrawer.svelte`: Left-aligned hamburger menu with search input and patient list

### Phase 5: Main Layout & Integration
- `+page.svelte`: Top-level layout with header, menu trigger, dashboard
- Wire up patient selection → fetch patient data → display results
- Ensure dark theme is applied globally

### Phase 6: Polish & Testing
- Visual refinement (spacing, typography, dark colors)
- Responsive design
- Error handling for missing data
- Empty states

## Key Decisions & Design Notes

### Color Scheme (Dark Theme)
- **Background**: Slate-900 (#0f172a)
- **Cards**: Slate-800 (#1e293b)
- **Text**: Slate-100 (#f1f5f9)
- **Normal**: Emerald (#10b981)
- **High**: Amber (#f59e0b)
- **Low**: Red (#dc2626)

### Data Flow
1. User selects patient from left drawer
2. Frontend fetches: `GET /api/patients/[patientId]`
3. Backend:
   - Loads patient record
   - For each test, calculates age in days
   - Finds matching reference interval (gender + age bracket)
   - Compares value to reference_min/max
   - Returns analyzed data
4. Frontend renders LabCards with visual indicators

### Age Calculation
- Parse `birth_date` and test `date` as ISO strings
- Calculate difference in milliseconds
- Convert to days (Math.floor(ms / 86400000))
- Match to reference interval where: `age_days_min <= ageDays < age_days_max`

### Status Logic
- `value < reference_min` → "low" (Red)
- `value > reference_max` → "high" (Amber)
- `reference_min <= value <= reference_max` → "normal" (Emerald)

### Offset Percentage (for bar visualization)
- Calculate where value sits between min and max
- Formula: `((value - reference_min) / (reference_max - reference_min)) * 100`
- Clamp to 0-100% for out-of-range values

## Testing Strategy
- Unit tests for `ageCalculator.ts` (various age scenarios)
- Unit tests for `analysisService.ts` (matching logic, status determination)
- Integration test: fetch patient → analyze → verify results
- Visual inspection of dark theme and component spacing

## Files to Create/Modify
```
NEW:
src/routes/+page.svelte
src/routes/+layout.svelte
src/routes/api/patients/+server.ts
src/routes/api/patients/[patientId]/+server.ts
src/lib/components/Dashboard.svelte
src/lib/components/PatientDrawer.svelte
src/lib/components/LabCard.svelte
src/lib/components/StatusBadge.svelte
src/lib/components/RangeVisualizer.svelte
src/lib/services/analysisService.ts
src/lib/types/medical.ts
src/lib/utils/colors.ts
src/lib/utils/ageCalculator.ts
src/lib/data/referenceIntervals.ts
src/lib/data/patientData.ts
tailwind.config.ts
svelte.config.js

MODIFY:
package.json (add SvelteKit, TailwindCSS deps)
```

## Notes
- Reference intervals use `age_days_min` and `age_days_max` buckets
- Some intervals have gender-specific variants; default to "both"
- Patient data currently includes `status` field; our analysis recalculates this
- Dark gray theme reduces eye strain for medical professionals
- Minimize UI clutter—only show essential info (test name, value, range, status)
