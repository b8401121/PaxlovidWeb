---
name: paxlovid-dev
description: >-
  Use this skill when developing, debugging, or modifying the PaxlovidWeb project.
  It contains critical rules about the architecture, tech stack (Vanilla JS), OCR vs
  copy-paste text handling, NHI code canonicalization, and Git branching workflows.
---

# PaxlovidWeb Development Skill

This skill provides guidelines, architectural principles, and runbooks for developing and maintaining the PaxlovidWeb clinical decision support system.

---

## 1. Architecture & Tech Stack Rules

- **100% Pure Vanilla Web**: Standard HTML5, CSS3, and modern JavaScript (ES6+).
- **NO Build Tools**: Do **NOT** introduce Node.js, Vite, Webpack, TypeScript, React, or Vue. The project must run directly in standard web browsers.
- **Core Files**:
  - `index.html`: Main application interface, login overlay, and tab containers.
  - `styles.css`: CSS variables, themes (Clinical Light, Eye-care Warm, Clinical Dark), responsive layouts, and `@media print` rules for A4 single-page education sheets.
  - `main.js`: UI logic, event bindings, Tesseract OCR orchestration with dual-mode fallback, and iframe-based print preview generation.
  - `nhi_lookup.js`: Official Taiwan NHI Drug Database (115年08月最新版，包含全台 45,175 筆單方與複方藥品代碼、成分學名與商品名).
  - `parser.js`: Cloud prescription parsing, OCR preprocessing, NHI code dictionary lookup (`getNhiCodeEntry` & `NHI_CODE_LOOKUP`), drug normalization (`normalizeDrugKey`), and clinical suggestion matching (`getDictSuggestion`).
  - `data.js`: Clinical database with hardcoded keyword arrays (`proh`, `dont`, `pote`, `safe`, `safe2`, `SAFE_KEYWORDS`) and the recommendation dictionary (`DICT`).

---

## 2. Text Parsing & OCR Engine Rules (`parser.js` & `main.js`)

### A. Copy-Paste vs OCR Mode Duality
- **📋 Copy-Paste Mode (Direct from MediCloud)**:
  - Input text contains Tab (`\t`) characters.
  - Bypass OCR text preprocessing (`if ((rawText.match(/\t/g) || []).length >= 3) return rawText;`).
  - **Preserve Clinic Names**: Accurately extracts clinic/hospital name (e.g. `烏來安泰診・門診`, `台北醫大・門診`), including the 1st record without leading index number.
- **📷 OCR Mode (Screenshots / Images)**:
  - Text recognized by Tesseract.js has NO tabs.
  - **Deliberately Omit Clinic Names** (`finalSource = ""`): Clinic names in OCR screenshots are noisy and prone to misreadings. OCR mode focuses strictly on drug ingredients, NHI codes, brand names, and prescription dates.

### B. OCR Dual-Mode Resilience & Preprocessing
- **Image Preprocessing**: 2x resolution upsampling on HTML5 Canvas with grayscale and contrast boosting (factor = 1.35) to preserve fine anti-aliased font strokes.
- **Network Resilience Fallback**: Tesseract worker initializes with `eng+chi_tra`. If the heavy Traditional Chinese traineddata (~15MB) fails or times out on hospital intranet/firewalls, it automatically falls back to lightweight `eng` (1MB, fast & 100% sufficient for English drug names, codes, and dates).
- **Per-Batch Reset**: Each OCR upload cleans `searchInput.value` to avoid accumulating stale test data.

### C. Drug Canonicalization & Official NHI Database (`getNhiCodeEntry` & `normalizeDrugKey`)
- **Taiwan Official NHI Database (`window.NHI_DB` in `nhi_lookup.js`)**: Contains 45,175 active NHI codes, standardizing 10-digit codes to official generic names, combination ingredients, and brand names.
- **Combo Drug Multi-Ingredient Parsing**: For combination drugs (e.g. `Valsartan ; Amlodipine Besylate`), both active ingredients are automatically evaluated against Paxlovid risk lists.
- **Salt & Suffix Normalization**: Strips salts (`calcium`, `besylate`, `mesylate`, `hcl`, `tartrate`, `fumarate`, etc.) and dosage strings when generating `drugKey`.
- **Deduplication**: Groups multiple prescriptions/refills of the same drug (e.g. chronic refill prescriptions 1/3, 2/3, 3/3 on the same date) and retains the latest, most complete item while discarding dateless OCR fragments.

### D. Clinical Advice Lookup (`getDictSuggestion`)
- Robust fuzzy lookup against `DICT` with automated salt stripping and substring search, guaranteeing that names like `Rosuvastatin Calcium`, `Amlodipine (Besylate)`, or `Tamsulosin Hcl` reliably fetch their clinical advice.

---

## 3. Severity Classification & Patient Education Sheet

### Risk Categories:
1. ⛔ **禁忌 / 建議避免** (`contraindicated`): Absolute contraindications with Paxlovid (requires 8-day suspension or alternative antiviral).
2. ⚠️ **潛在交互作用** (`interactive`): Dose adjustment, blood pressure/pulse monitoring, or modified dosing schedule required.
3. ✅ **目前無交互作用報告** (`safe`): Safe to continue as prescribed. Print checkboxes are hidden on safe cards for a clean UI.

### Always-Printable Education Sheet:
- Even when ALL medications are safe (0 warnings), the **「🖨️ 列印衛教單」** button remains **enabled**.
- The generated A4 print sheet contains core Paxlovid dosing instructions (5-day course with 8-day impact, swallow whole without crushing, pause NRICM101 for 5 days) and critical severe Covid-19 warning signs for patients.

---

## 4. Git Branching & Deployment Strategy

- **`main`**: Production release branch wired directly to GitHub Pages (`https://b8401121.github.io/PaxlovidWeb/`).
- **`stable`**: Permanent snapshot archive of verified milestone releases (e.g. `v6.8-stable`).
- **`dev`**: Active feature development and testing branch.

### Standard Release Workflow:
1. Develop and test features on `dev`.
2. Bump cache buster query string in `index.html` (e.g. `?v=X.Y-dev`).
3. Commit and push to `origin/dev`.
4. Merge `dev` into `main` and push `origin/main` for instant GitHub Pages deployment.
5. Snapshot stable milestones to `stable` and create release tags (`vX.Y-stable`).
