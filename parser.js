// ── 健保代碼智慧補全字典（結合手動優先覆蓋與官方 45,175 筆完整資料庫）───────────
function getNhiCodeEntry(code) {
  if (!code) return null;
  const c = code.trim().toUpperCase();
  // 1. 手動校正字典優先 (包含特定 severity 覆寫)
  if (typeof NHI_CODE_LOOKUP !== 'undefined') {
    if (NHI_CODE_LOOKUP[c]) return NHI_CODE_LOOKUP[c];
    if (c.length >= 10 && NHI_CODE_LOOKUP[c.substring(0, 10)]) return NHI_CODE_LOOKUP[c.substring(0, 10)];
  }
  // 2. 全台灣官方健保藥品資料庫 (45,175 筆)
  if (typeof window !== 'undefined' && window.NHI_DB) {
    const raw = window.NHI_DB[c] || (c.length >= 10 ? window.NHI_DB[c.substring(0, 10)] : null);
    if (raw && Array.isArray(raw)) {
      return {
        generic: raw[0] || "",
        brand: raw[1] || ""
      };
    }
  }
  return null;
}
if (typeof window !== 'undefined') {
  window.getNhiCodeEntry = getNhiCodeEntry;
}

const NHI_CODE_LOOKUP = {
  "BC23373100": { generic: "Valsartan", brand: "DIOVAN 80MG", severity: "interactive" },
  "AC57114100": { generic: "Amlodipine (Besylate)", brand: "Amlodipine 5mg", severity: "interactive" },
  "AC262331G0": { generic: "Flunarizine (Hcl)", brand: "FLUNAZON CAPSULES 5MG", severity: "safe" },
  "AC26233160": { generic: "Flunarizine (Hcl)", brand: "FLUNAZON CAPSULES 5MG", severity: "safe" },
  "AC39087100": { generic: "Pentoxifylline", brand: "TRENFYLLINE S.R.F.C. 400MG", severity: "safe" },
  "AB45412100": { generic: "Piracetam", brand: "NOOPOL F.C. TABLETS 1200MG", severity: "safe" },
  "AC22209100": { generic: "Chlorzoxazone", brand: "ANROKIN TABLETS", severity: "safe" },
  "AC57791100": { generic: "Famotidine", brand: "Famotidine 20mg", severity: "safe" },
  "BC14822100": { generic: "Amiodarone Hcl", brand: "CORDARONE TABLETS", severity: "contraindicated" },
  "BC187411G0": { generic: "Lorazepam", brand: "ATIVAN TABLETS 0.5MG", severity: "interactive" },
  "BC18741160": { generic: "Lorazepam", brand: "ATIVAN TABLETS 0.5MG", severity: "interactive" },
  "BC21571100": { generic: "Amlodipine (Besylate)", brand: "NORVASC TABLETS 5MG", severity: "interactive" },
  "BC216411G0": { generic: "Doxazosin (Mesylate)", brand: "DOXABEN TABLET 2MG", severity: "interactive" },
  "BC21641160": { generic: "Doxazosin (Mesylate)", brand: "DOXABEN TABLET 2MG", severity: "interactive" },
  "BC24131100": { generic: "Rosuvastatin Calcium", brand: "CRESTOR 10MG FILM-COATED TABLETS", severity: "interactive" },
  "BC24645100": { generic: "Valsartan", brand: "Diovan Film-Coated Tablets 40mg", severity: "interactive" },
  "BC23374100": { generic: "Valsartan", brand: "DIOVAN 160MG", severity: "interactive" },
  "AC60574100": { generic: "Tamsulosin Hcl", brand: "Tamlosin 0.4mg", severity: "interactive" },
  "AC58548100": { generic: "Tamsulosin Hcl", brand: "Tamlosin D Tablets 0.2mg", severity: "interactive" },
  "AC57216100": { generic: "Niacin ; Lovastatin", brand: "500/20mg", severity: "contraindicated" },
  "AC45960435": { generic: "Sulfamethoxazole", brand: "SINOMIN OPHTHALMIC SOLUTION", severity: "safe" },
  "BC15292421": { generic: "Carteolol Hcl", brand: "ARTEOPTIC 2% OPHTHALMIC SOLUTION", severity: "safe" },
  "AC577911G0": { generic: "Famotidine", brand: "Famotidine 20mg", severity: "safe" },
  "AC103581G0": { generic: "Diltiazem (Hcl)", brand: "HERBESSER TABLETS 30MG", severity: "interactive" },
  "AC10358160": { generic: "Diltiazem (Hcl)", brand: "HERBESSER TABLETS 30MG", severity: "interactive" },
  "BC25072100": { generic: "Valsartan ; Amlodipine Besylate", brand: "Exforge 5/160mg", severity: "interactive" },
  "BC09554100": { generic: "Digoxin", brand: "LANOXIN DIGOXIN 0.25MG", severity: "interactive" },
  "AC22908100": { generic: "Spironolactone", brand: "SPIRONOLACTONE TABLETS", severity: "safe" },
  "AC46166100": { generic: "Iron (Hydroxide Polymaltose Complex)", brand: "TEDALIN CHEWABLE TABLETS", severity: "safe" },
  "A026078100": { generic: "Phenylephrine ; Brompheniramine", brand: "NOSEMIN TABLETS", severity: "safe" },
  "AC19706100": { generic: "Diphenidol Hcl", brand: "DIFENDOL S.C. TABLETS", severity: "safe" },
  "BC25413100": { generic: "Tamsulosin Hcl", brand: "Harnalidge OCAS 0.4mg", severity: "interactive" },
  "BC22768100": { generic: "Risperidone", brand: "RISPERDAL Film Coated TABLET 2MG", severity: "interactive" },
  "AC47486197": { generic: "Piracetam", brand: "HAMGO GRANULES 1200MG", severity: "safe" },
  "AC373441G0": { generic: "Aspirin", brand: "BOKEY 100MG", severity: "safe" },
  "AC37344160": { generic: "Aspirin", brand: "BOKEY 100MG", severity: "safe" },
  "A043488100": { generic: "Sennoside A+B(Calcium)", brand: "SENNAPUR TABLETS", severity: "safe" },
  "AC36350500": { generic: "Bisacodyl", brand: "BISADYL SUPPOSITORIES 10MG", severity: "safe" },
  "BC240391G0": { generic: "Bisoprolol Fumarate", brand: "CONCOR 1.25", severity: "safe" },
  "BC24039160": { generic: "Bisoprolol Fumarate", brand: "CONCOR 1.25", severity: "safe" },
  "BC25533100": { generic: "Levothyroxine Sodium", brand: "ELTROXIN 50mcg", severity: "safe" },
  "NC017521G0": { generic: "Imipramine Hcl", brand: "FRONIL", severity: "safe" },
  "NC01752160": { generic: "Imipramine Hcl", brand: "FRONIL", severity: "safe" },
  "A023521100": { generic: "Magnesium Oxide", brand: "MAGNESIUM OXIDE", severity: "safe" },
  "A037697100": { generic: "Sennoside A+B", brand: "THROUGH", severity: "safe" },
  "AC41577100": { generic: "Potassium Citrate", brand: "DESTONE 540MG", severity: "safe" },
  "AC427541G0": { generic: "Benzbromarone", brand: "EURICON 50MG", severity: "safe" },
  "AC42754160": { generic: "Benzbromarone", brand: "EURICON 50MG", severity: "safe" },
  "AC62078121": { generic: "Calcium Polystyrene Sulfonate", brand: "KALIMATE POWDER", severity: "safe" },
  "B020735429": { generic: "Hypromellose", brand: "ARTELAC EYE DROPS", severity: "safe" },
  "B020735420": { generic: "Hypromellose", brand: "ARTELAC EYE DROPS", severity: "safe" },
  "BC21628421": { generic: "Pirenoxine", brand: "KARY UNI", severity: "safe" },
  "AB45993100": { generic: "Acetylcysteine", brand: "ACTEIN 600MG", severity: "safe" },
  "AB15993100": { generic: "Acetylcysteine", brand: "ACTEIN 600MG", severity: "safe" },
  "BC230161G0": { generic: "Fexofenadine Hydrochloride", brand: "ALLEGRA 60MG", severity: "safe" },
  "BC23016160": { generic: "Fexofenadine Hydrochloride", brand: "ALLEGRA 60MG", severity: "safe" },
  "BC26301443": { generic: "Indacaterol Maleate ; Glycopyrronium Bromide", brand: "Ultibro Breezhaler", severity: "safe" },
  "A040833157": { generic: "Methylephedrine ; Chlorpheniramine ; Guaiacol", brand: "SECORINE SYRUP", severity: "safe" },
  "AC60851457": { generic: "Azelastine ; Fluticasone", brand: "Dufanas Nasal Spray", severity: "safe" },
  "A027040100": { generic: "Dexchlorpheniramine Maleate", brand: "DEX-CTM 2MG", severity: "safe" },
  "AC19616329": { generic: "Betamethasone (Dipropionate)", brand: "BETAMETHASONE OINT", severity: "safe" }
};

const BRAND_OR_GENERIC_TO_CODE = {
  "amiodarone": "BC14822100",
  "cordarone": "BC14822100",
  "lorazepam": "BC187411G0",
  "ativan": "BC187411G0",
  "amlodipine": "BC21571100",
  "norvasc": "BC21571100",
  "doxazosin": "BC216411G0",
  "doxaben": "BC216411G0",
  "rosuvastatin": "BC24131100",
  "crestor": "BC24131100",
  "diovan": "BC24645100",
  "valsartan": "BC24645100",
  "tamlosin": "AC60574100",
  "harnalidge": "BC25413100",
  "tamsulosin": "BC25413100",
  "risperdal": "BC22768100",
  "risperidone": "BC22768100",
  "hamgo": "AC47486197",
  "piracetam": "AC47486197",
  "bokey": "AC373441G0",
  "aspirin": "AC373441G0",
  "sennapur": "A043488100",
  "sennoside": "A043488100",
  "bisadyl": "AC36350500",
  "bisacodyl": "AC36350500",
  "concor": "BC240391G0",
  "bisoprolol": "BC240391G0",
  "eltroxin": "BC25533100",
  "levothyroxine": "BC25533100",
  "fronil": "NC017521G0",
  "imipramine": "NC017521G0",
  "magnesium oxide": "A023521100",
  "through": "A037697100",
  "destone": "AC41577100",
  "euricon": "AC427541G0",
  "benzbromarone": "AC427541G0",
  "kalimate": "AC62078121",
  "artelac": "B020735429",
  "kary uni": "BC21628421",
  "pirenoxine": "BC21628421",
  "actein": "AB45993100",
  "acetylcysteine": "AB45993100",
  "allegra": "BC230161G0",
  "fexofenadine": "BC230161G0",
  "ultibro": "BC26301443",
  "secorine": "A040833157",
  "dufanas": "AC60851457",
  "dex-ctm": "A027040100"
};

function cleanGenericName(rawGeneric) {
  if (!rawGeneric) return "";
  
  let cleaned = rawGeneric.trim();
  
  // 清理尾部表格雜訊符號（如 ~~, ~, -, _ 等）
  cleaned = cleaned.replace(/[\~\_\-\=\|\\\/]+$/g, '').trim();

  // OCR 常見醫學詞尾修復 (如 Hcl 被誤認成 Hd, Hci, Hel, Hct 等)
  cleaned = cleaned.replace(/\bHd\b/g, 'Hcl')
                   .replace(/\bHci\b/g, 'Hcl')
                   .replace(/\bHel\b/g, 'Hcl')
                   .replace(/\bHct\b/g, 'Hcl')
                   .replace(/\bTab\b/gi, 'Tablets')
                   .replace(/\bCap\b/gi, 'Capsules');

  // 先清除開頭括號包覆的 ATC 英文分類（如 (Agents acting on the renin-angiotensin system) Valsartan）
  cleaned = cleaned.replace(/^\([^\)]*[\)\s]*/, '')
                   .replace(/^（[^）]*[）\s]*/, '')
                   .replace(/^\[[^\]]*[\]\s]*/, '');

  const keywords = [];
  if (typeof proh !== 'undefined') keywords.push(...proh);
  if (typeof dont !== 'undefined') keywords.push(...dont);
  if (typeof pote !== 'undefined') keywords.push(...pote);
  if (typeof safe !== 'undefined') keywords.push(...safe);
  if (typeof safe2 !== 'undefined') keywords.push(...safe2);
  if (typeof DICT !== 'undefined') keywords.push(...Object.keys(DICT));
  
  // 排除鹽類詞以避免誤判主藥名
  const saltWords = new Set(["calcium", "sodium", "potassium", "hydrochloride", "hcl", "maleate", "besylate", "mesylate", "fumarate", "succinate", "tartrate", "acetate", "sulfate", "hydrate", "citrate", "phosphate"]);

  const uniqueKeywords = Array.from(new Set(keywords))
    .filter(k => k.length > 2 && !saltWords.has(k.toLowerCase()))
    .sort((a, b) => b.length - a.length);
  
  const rawLower = cleaned.toLowerCase();
  let firstIdx = -1;
  
  for (const kw of uniqueKeywords) {
    const idx = rawLower.indexOf(kw);
    if (idx !== -1) {
      if (firstIdx === -1 || idx < firstIdx) {
        firstIdx = idx;
      }
    }
  }
  
  if (firstIdx !== -1) {
    let result = cleaned.substring(firstIdx).trim();
    result = result.replace(/^[\(\（\[\{\:\;\,\.\—\-\~\s]+/, '').replace(/[\~\_\-\=\|\\\/]+$/g, '').trim();
    return result;
  }
  
  while (cleaned.startsWith('(') || cleaned.startsWith('（')) {
    const openChar = cleaned[0];
    const closeChar = openChar === '(' ? ')' : '）';
    const closeIdx = cleaned.indexOf(closeChar);
    if (closeIdx !== -1) {
      cleaned = cleaned.substring(closeIdx + 1).trim();
    } else {
      break;
    }
  }
  
  const atcPrefixes = [
    "作用在腎素-血管緊張素系統上的藥劑(agents acting on the renin-angiotensin system)",
    "作用在腎素-血管緊張素系統上的藥劑（agents acting on the renin-angiotensin system）",
    "作用在腎素-血管緊張素系統上的藥劑",
    "agents acting on the renin-angiotensin system",
    "agents acting on the renin-angiotensin",
    "renin-angiotensin system",
    "renin-angiotensin",
    "beta blocking agents",
    "drugs for obstructive airway diseases",
    "cough and cold preparations",
    "nasal preparations",
    "antithrombotic agents",
    "thyroid therapy",
    "lipid modifying agents",
    "lipid modifying",
    "psycholeptics", "psychoanaleptics", "ophthalmologicals", "antiepileptics",
    "laxatives", "diabetes", "antipruritics", "urologicals",
    "antihistamines", "corticosteroids", "anti-inflammatory"
  ];
  const cleanedLower = cleaned.toLowerCase();
  for (const prefix of atcPrefixes) {
    const pIdx = cleanedLower.indexOf(prefix);
    if (pIdx !== -1) {
      const endIdx = pIdx + prefix.length;
      let temp = cleaned.substring(endIdx).trim();
      if (temp.startsWith('.') || temp.startsWith(')') || temp.startsWith('）') || temp.startsWith(']') || temp.startsWith('}') || temp.startsWith(';') || temp.startsWith('；')) {
        temp = temp.substring(1).trim();
      }
      cleaned = temp;
      break;
    }
  }
  
  cleaned = cleaned.replace(/^(?:system|agents?|preparations?|therapy|diseases?|derivatives?|use)[\)\]\s\.\,\;\:—\-]*/i, '').trim();
  cleaned = cleaned.replace(/^[Yy]\s+/, '').trim();
  return cleaned;
}

function preprocessOcrText(rawText) {
  if (!rawText || !rawText.trim()) return rawText;

  // 若文字中已含有多個 Tab 欄位分隔字元（表示是由健保署雲端藥歷直接複製貼上的格式），直接略過 OCR 前處理，確保第一筆院所名稱不被吃掉
  if ((rawText.match(/\t/g) || []).length >= 3) {
    return rawText;
  }

  const lines = rawText.split(/[\r\n]+/).map(l => l.trim()).filter(l => l.length > 0);
  const reconstructedLines = [];
  let buffer = [];
  let runningProviderCode = "";
  let runningVisitType = "";
  let runningSource = "";

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // ── OCR 字元修正：替換常見數字/字母混淆 ──────────────────────────────
    // 0. 清除健保碼中間夾雜的表格斜線/豎線（例如 BC233/4100 或 BC233|4100 -> BC23374100 或 BC23314100）
    line = line.replace(/([A-Za-z]{1,2}\d{2,4})[\/\\|](\d{3,5})/g, (m, p1, p2) => {
      // 在台灣健保碼中，斜線最常是 7 或 1 被誤判
      return p1 + '7' + p2;
    });

    // 修復健保碼中間被 OCR 插入空格（例如 BC240391 G0 -> BC240391G0, BC23374 100 -> BC23374100）
    line = line.replace(/\b([A-Za-z]{1,2}\d{2,7})\s+([A-Za-z0-9]{2,6})\b/g, (m, p1, p2) => {
      if ((p1.length + p2.length) >= 9 && (p1.length + p2.length) <= 11) {
        return p1 + p2;
      }
      return m;
    });
    line = line.replace(/\b([A-Za-z]{1,2}\d{6,8})\s+([A-Za-z0-9]{1,3})\b/g, (m, p1, p2) => {
      if ((p1.length + p2.length) >= 9 && (p1.length + p2.length) <= 11) {
        return p1 + p2;
      }
      return m;
    });

    // 修復首字元被誤讀：8C→BC, 0D→OD, 1BC→IBC
    line = line.replace(/([^A-Za-z]|^)8([A-Za-z]\d{5,9}[A-Za-z0-9]{0,3})/g, '$1B$2');
    line = line.replace(/([^A-Za-z]|^)0([A-Za-z]\d{5,9}[A-Za-z0-9]{0,3})/g, '$1O$2');
    line = line.replace(/([^A-Za-z]|^)1([A-Za-z]{2}\d{5,9}[A-Za-z0-9]{0,3})/g, '$1I$2');

    // ── 僅修復確定是健保碼但夾雜了明顯 OCR 字母錯誤的 token ────────────────
    line = line.replace(/([A-Za-z]{1,2})((?=[0-9A-Za-z]{6,10})[0-9A-Za-z]+)/g, (match, prefix, rest) => {
      const digitCount = (rest.match(/\d/g) || []).length;
      const letterCount = (rest.match(/[A-Za-z]/g) || []).length;
      if (digitCount >= 4 && letterCount >= 1 && letterCount <= 4 && (prefix.length + rest.length) <= 12) {
        let fixedRest = "";
        for (let i = 0; i < rest.length; i++) {
          let c = rest[i];
          if (/[oO]/.test(c)) fixedRest += '0';
          else if (/[lI]/.test(c)) fixedRest += '1';
          else if (/[sS]/.test(c)) fixedRest += '5';
          else if (/[zZ]/.test(c)) fixedRest += '2';
          else fixedRest += c;
        }
        return prefix.toUpperCase() + fixedRest;
      }
      return match;
    });

    // ── 分離附著在英文字母旁的健保代碼（僅當前後有 3 個以上英文字母時，避免拆斷 G0, 60 等代碼後綴） ────────────────
    line = line.replace(/([a-z]{3,})([A-Za-z]{1,2}\d{5,9}[A-Za-z0-9]{0,3})/gi, '$1 $2');
    line = line.replace(/([A-Za-z]{1,2}\d{5,9}[A-Za-z0-9]{0,3})([A-Za-z]{3,})/gi, '$1 $2');

    let codeMatch = line.match(/\b([A-Za-z]{1,2}\d{5,9}[A-Za-z0-9]{0,3})\b/);
    let code = "";
    if (codeMatch) {
      const cStr = codeMatch[1];
      if (cStr.length >= 8 && cStr.length <= 11) {
        code = cStr;
      }
    }
    let isKeywordFallback = false;

    // 若 OCR 漏認了健保代碼，但該行含有已知藥物關鍵字，自動由字典補全代碼
    if (!code && !line.includes('\t')) {
      const lineLower = line.toLowerCase();
      for (const kw of Object.keys(BRAND_OR_GENERIC_TO_CODE)) {
        if (lineLower.includes(kw)) {
          code = BRAND_OR_GENERIC_TO_CODE[kw];
          isKeywordFallback = true;
          break;
        }
      }
    }

    if (code && !line.includes('\t')) {
      const dateMatch = line.match(/(\d{2,4}[\/\.-]\d{1,2}[\/\.-]\d{1,2})/);
      const date = dateMatch ? dateMatch[1] : "";

      let source = "";
      let visitType = "";
      let providerCode = "";

      for (let j = buffer.length - 1; j >= 0; j--) {
        const bLine = buffer[j];
        const provMatch = bLine.match(/\b([0-9ILOilo|\/][A-Za-z0-9\/]{8,9})\b/);
        if (provMatch && !providerCode) {
          const pC = provMatch[1].toUpperCase().replace(/I|L|\|/g, '1').replace(/O/g, '0').replace(/\//g, '7');
          if (pC.length === 10) {
            providerCode = pC;
          }
        } else if ((bLine === "門診" || bLine === "住診" || bLine === "藥局" || bLine === "急診") && !visitType) {
          visitType = bLine;
        } else if (!source) {
          let candidate = bLine.replace(/^\d+\s+/, '').trim(); // 去掉前置序號
          candidate = candidate.replace(/^[\(\)（）\s\.\-]+|[\(\)（）\s\.\-]+$/g, '').trim();
          const hasChinese = /[\u4e00-\u9fa5]/.test(candidate);
          const isShort = candidate.length >= 2 && candidate.length <= 12;
          const isDiagnosis = /病|炎|症|癌|瘤|障礙|疾病|感染|損傷|骨折|慢性|急性|原發|多發|未明|高血壓|過敏|接觸|皮膚|性|乳房|女性|男性|部位/.test(candidate);
          const isMostlyEnglish = (candidate.replace(/[^A-Za-z]/g, '').length / candidate.length) > 0.5;
          const isJunkLine = /^[0-9\s\.\-\|\/\\@#\*\(\)（）]+$/.test(candidate);
          if (hasChinese && isShort && !isDiagnosis && !isMostlyEnglish && !isJunkLine) {
            source = candidate;
          }
        }
      }
      if (!source && providerCode && (typeof window !== 'undefined' && window.PROVIDER_DB && window.PROVIDER_DB[providerCode])) {
        source = window.PROVIDER_DB[providerCode];
      }

      let leftPart = "";
      let rightPart = "";
      if (!isKeywordFallback && line.includes(code)) {
        const parts = line.split(code);
        leftPart = parts[0].trim();
        rightPart = parts[1] ? parts[1].trim() : "";
      } else {
        if (date) {
          const dParts = line.split(date);
          leftPart = dParts[0].trim();
          rightPart = dParts[1] ? dParts[1].trim() : "";
        } else {
          leftPart = line;
        }
      }

      let brand = "";
      if (rightPart && date) {
        brand = rightPart.split(date)[0].trim();
      } else {
        brand = rightPart;
      }
      // 去除 OCR 表格線符號造成的前綴/尾綴垃圾（如 | / - 等）
      brand = brand.replace(/^[\s|\-\/]+/, '').replace(/[\s|\-\/]+$/, '').replace(/\s+/g, ' ').trim();

      let generic = "";
      let searchStr = leftPart;

      // ── 檢查 leftPart 是否含有院所代碼與就醫別（單列 OCR 模式）────────────────────
      if (!providerCode) {
        const provMatch = leftPart.match(/\b([0-9ILOilo|\/][A-Za-z0-9\/]{8,9})\b/);
        if (provMatch) {
          const pC = provMatch[1].toUpperCase().replace(/I|L|\|/g, '1').replace(/O/g, '0').replace(/\//g, '7');
          if (pC.length === 10) {
            providerCode = pC;
          }
        }
      }
      if (!visitType) {
        const vtMatch = leftPart.match(/門診|住診|藥局|急診/);
        if (vtMatch) {
          visitType = vtMatch[0];
        }
      }

      if (!source) {
        const stripped = leftPart.replace(/^\d+\s+/, '');
        const chineseWords = stripped.match(/[\u4e00-\u9fa5]+/g);
        if (chineseWords) {
          for (const word of chineseWords) {
            if (word.length >= 2 && word.length <= 12 && !/病|炎|症|癌|瘤|障礙|疾病|感染|損傷|骨折|慢性|急性|原發|多發|未明|高血壓|過敏|接觸|皮膚|性|乳房|女性|男性|部位|劑|藥|液|類|抗|固醇/.test(word)) {
              source = word;
              break;
            }
          }
        }
      }
      if (!source && providerCode && (typeof window !== 'undefined' && window.PROVIDER_DB && window.PROVIDER_DB[providerCode])) {
        source = window.PROVIDER_DB[providerCode];
      }

      if (providerCode && leftPart.includes(providerCode)) {
        searchStr = leftPart.split(providerCode)[1].trim();
      } else if (visitType && leftPart.includes(visitType)) {
        searchStr = leftPart.split(visitType)[1].trim();
      }

      let lastChineseIdx = -1;
      for (let k = 0; k < searchStr.length; k++) {
        if (/[\u4e00-\u9fa5]/.test(searchStr[k])) {
          lastChineseIdx = k;
        }
      }

      let englishPart = lastChineseIdx !== -1 ? searchStr.substring(lastChineseIdx + 1).trim() : searchStr;

      // ── OCR 防錯：ATC 分類說明可能殘留在 englishPart 前面 ─────────────────────
      const lastCloseParenIdx = Math.max(englishPart.lastIndexOf('）'), englishPart.lastIndexOf(')'));
      if (lastCloseParenIdx !== -1 && lastCloseParenIdx < englishPart.length - 1) {
        const afterParen = englishPart.substring(lastCloseParenIdx + 1).trim();
        if (afterParen.length >= 3 && /^[A-Za-z]/.test(afterParen)) {
          englishPart = afterParen;
        }
      }

      generic = cleanGenericName(englishPart);

      // ── 如果同一行中找不到有效學名，從前方的 buffer 往回尋找學名行 ────────────────
      if (!generic || generic.length < 2) {
        for (let j = buffer.length - 1; j >= 0; j--) {
          const bLine = buffer[j].trim();
          if (!bLine) continue;
          let candidateGeneric = bLine;
          const cCloseIdx = Math.max(candidateGeneric.lastIndexOf('）'), candidateGeneric.lastIndexOf(')'), candidateGeneric.lastIndexOf(']'));
          if (cCloseIdx !== -1 && cCloseIdx < candidateGeneric.length - 1) {
            candidateGeneric = candidateGeneric.substring(cCloseIdx + 1).trim();
          }
          const cleanedCandidate = cleanGenericName(candidateGeneric);
          if (cleanedCandidate && cleanedCandidate.length >= 3 && /^[A-Za-z]/.test(cleanedCandidate)) {
            generic = cleanedCandidate;
            break;
          }
        }
      }

      // ── 檢查診所名稱是否誤抓到診斷詞（如「能 性 (原 發 性 )」）───────────────
      if (source && /病|炎|症|癌|瘤|障礙|疾病|感染|損傷|骨折|慢性|急性|原發|多發|未明|高血壓|能\s*性/.test(source)) {
        source = "";
      }

      // ── 如果同一行中找不到日期，嘗試從右側或是歷史緩衝尋找日期 ──────────────
      let finalDate = date;
      if (!finalDate) {
        for (let j = buffer.length - 1; j >= 0; j--) {
          const dM = buffer[j].match(/(\d{2,4}[\/\.-]\d{1,2}[\/\.-]\d{1,2})/);
          if (dM) {
            finalDate = dM[1];
            break;
          }
        }
      }

      // 更新跨列持久狀態（解決表格 OCR 模式中，就醫別/院所代碼位於藥物行下方之問題）
      if (providerCode) runningProviderCode = providerCode;
      if (visitType) runningVisitType = visitType;
      if (source) runningSource = source;

      const curProviderCode = providerCode || runningProviderCode;
      const curVisitType = visitType || runningVisitType;
      const curSource = source || runningSource;

      // OCR 辨識：優先使用 PROVIDER_DB 官方全名，次之使用辨識到的院所名稱 (source)，最後才退回 —
      let finalSource = "";
      if (curProviderCode && typeof window !== 'undefined' && window.PROVIDER_DB && window.PROVIDER_DB[curProviderCode]) {
        const clinicName = window.PROVIDER_DB[curProviderCode];
        finalSource = curVisitType ? `${clinicName}（${curVisitType}）` : clinicName;
      } else if (curSource) {
        finalSource = curVisitType ? `${curSource}（${curVisitType}）` : curSource;
      } else if (curVisitType) {
        finalSource = `—（${curVisitType}）`;
      }

      // NHI Code Dictionary fallback: if generic is empty, garbled, or code exists in dictionary, canonicalize generic & brand
      const entry = typeof getNhiCodeEntry === 'function' ? getNhiCodeEntry(code) : (typeof NHI_CODE_LOOKUP !== 'undefined' ? NHI_CODE_LOOKUP[code] : null);
      if (entry) {
        generic = entry.generic || generic;
        brand = entry.brand || "";
      } else {
        // 若非代碼字典確認之商品名，且帶有 OCR 殘缺雜訊（如純劑量、怪符號、短字母碎片），直接清空避免怪字
        if (!brand || brand.length < 3 || /^(\.?\d+[\/\.\d]*(mg|mcg|g|%)?(\s*(hs|bid|tid|qd|qn|po|pc|tab|cap)\b)*[\s\d]*)$/i.test(brand) || /[\~\^\_\|\\]/.test(brand) || /cl\s*p\s*9|ap\s*ss/i.test(brand)) {
          brand = "";
        }
      }

      const reconstructed = `${finalSource}\t${generic}\t${code}\t${brand}\t${finalDate}`;
      reconstructedLines.push(reconstructed);
      
      buffer = [];
    } else {
      if (line.includes('\t')) {
        reconstructedLines.push(line);
      } else {
        // 檢查該行是否包含日期（可能是上一行代碼換行後的日期行）
        const dM = line.match(/(\d{2,4}[\/\.-]\d{1,2}[\/\.-]\d{1,2})/);
        if (dM && reconstructedLines.length > 0) {
          const lastIdx = reconstructedLines.length - 1;
          const cols = reconstructedLines[lastIdx].split('\t');
          // 若最後一行的日期欄位為空，將此日期補入
          if (cols.length >= 4 && (!cols[4] || !cols[4].trim())) {
            cols[4] = dM[1];
            reconstructedLines[lastIdx] = cols.join('\t');
          }
        }
        buffer.push(line);
      }
    }
  }

  // 檢查未被 consume 的 buffer 中是否有遺漏辨識的已知藥物行
  if (buffer.length > 0) {
    for (const bLine of buffer) {
      const bLower = bLine.toLowerCase();
      for (const kw of Object.keys(BRAND_OR_GENERIC_TO_CODE)) {
        if (bLower.includes(kw)) {
          const rescuedCode = BRAND_OR_GENERIC_TO_CODE[kw];
          const entry = NHI_CODE_LOOKUP[rescuedCode];
          if (entry) {
            const dM = bLine.match(/(\d{2,4}[\/\.-]\d{1,2}[\/\.-]\d{1,2})/);
            const rDate = dM ? dM[1] : "";
            reconstructedLines.push(`\t${entry.generic}\t${rescuedCode}\t${entry.brand}\t${rDate}`);
          }
          break;
        }
      }
    }
  }

  return reconstructedLines.join('\n');
}

function searchInteractions(text) {
  text = preprocessOcrText(text);
  const found = [];
  if (!text || !text.trim()) {
    return found;
  }

  const blacklist = [
    "機轉 / 臨床表現", "建議：", "嚴重程度：", "發生速度：",
    "分類(專科", "發現", "Paxlovid", "列印日期:"
  ];

  const linesRaw = text.split(/[\r\n]+/).map(s => s.trim()).filter(s => s.length > 0);
  const lines = [];

  for (const rL of linesRaw) {
    if (blacklist.some(bad => rL.includes(bad))) {
      continue;
    }
    let targetLine = rL;
    const pos = rL.indexOf("原本用藥：");
    if (pos !== -1) {
      targetLine = rL.substring(pos + 5).trim();
    }
    if (targetLine.length > 0) {
      lines.push(targetLine);
    }
  }

  if (lines.length === 0 && text.trim().length > 0) {
    lines.push(text.trim());
  }

  const codeRe = /^[A-Za-z]{1,3}\d{6,10}[A-Za-z0-9]{0,3}(?:（[^）]+）|\([^)]+\))?$/;
  const dateRe = /^\d{2,4}[/\.-]\d{1,2}[/\.-]\d{1,2}/;
  const re1 = /^(\S+)\s+(.*?\(.*?\))\s+(\S+)\s+(\S+)\s+(\S+)\s+(.*?。)\s*(.*)$/;
  const re2 = /^(\S+)\s+(.*?\(.*?\))\s+(\S+)\s+(\S+)\s+(\S+)\s+(.*)$/;

  // Brand name → generic name aliases for OCR (ensures brand names read from screenshots still match)
  const brandAliasReplacer = (line) => line
    .replace(/\bdiovan\b/gi, 'valsartan')
    .replace(/\bconcor\b/gi, 'bisoprolol')
    .replace(/\beltroxin\b/gi, 'levothyroxine')
    .replace(/\ballegra\b/gi, 'fexofenadine')
    .replace(/\bdex-ctm\b/gi, 'dexchlorpheniramine')
    .replace(/\beuricon\b/gi, 'benzbromarone')
    .replace(/\bartelac\b/gi, 'hypromellose')
    .replace(/\bkary\s*uni\b/gi, 'pirenoxine')
    .replace(/\bdufanas\b/gi, 'azelastine')
    .replace(/\btamlosin\b/gi, 'tamsulosin')
    .replace(/\bfronil\b/gi, 'imipramine')
    .replace(/\bactein\b/gi, 'acetylcysteine')
    .replace(/\bultibro\b/gi, 'indacaterol')
    .replace(/\bsecorine\b/gi, 'methylephedrine')
    .replace(/\bkalimate\b/gi, 'calcium polystyrene')
    .replace(/\bdestone\b/gi, 'potassium citrate');

  const interactions = medicalData.paxlovid_interactions;

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const lineRaw = lines[lineIdx];
    const line = brandAliasReplacer(lineRaw); // apply brand→generic substitution for OCR
    const lineU = line.toUpperCase();

    for (const item of interactions) {
      const generic = item.generic.toUpperCase();
      const brand = item.brand.toUpperCase();

      const genTokens = generic
        .replace(/\+/g, ",")
        .split(",")
        .map(t => t.trim())
        .filter(t => t.length > 2);

      const brandTokens = brand
        .replace(/\//g, ",")
        .split(",")
        .map(t => t.trim())
        .filter(t => t.length > 2);

      const allKeywords = [...genTokens, ...brandTokens];

      let isMatched = false;
      let firstMatchIdx = 999999;

      for (const kw of allKeywords) {
        if (kw) {
          const pos = lineU.indexOf(kw);
          if (pos !== -1) {
            isMatched = true;
            firstMatchIdx = Math.min(firstMatchIdx, pos);
          }
        }
      }

      // Substring fallback for single line manual searches
      if (!isMatched && lines.length === 1 && lineU.length > 2) {
        for (const kw of allKeywords) {
          if (kw && kw.includes(lineU)) {
            isMatched = true;
            firstMatchIdx = 0;
            break;
          }
        }
      }

      if (isMatched) {
        let finalDrugName = line;
        let visitDateRaw = "";
        let foundByCode = false;

        if (line.includes("\t")) {
          const cols = line.split("\t").map(c => c.trim()).filter(c => c.length > 0);

          // 1. Try code match
          for (let i = 0; i < cols.length; i++) {
            if (codeRe.test(cols[i])) {
              if (i + 1 < cols.length) {
                finalDrugName = cols[i + 1];
                foundByCode = true;
                break;
              }
            }
          }

          // 2. Keyword proximity match
          if (!foundByCode) {
            let maxColIdx = -1;
            let bestMatchingCol = null;
            for (let colIdx = 0; colIdx < cols.length; colIdx++) {
              const colU = cols[colIdx].toUpperCase();
              for (const kw of allKeywords) {
                if (kw && colU.includes(kw)) {
                  if (colIdx > maxColIdx) {
                    maxColIdx = colIdx;
                    bestMatchingCol = cols[colIdx];
                  }
                  break;
                }
              }
            }
            if (bestMatchingCol !== null) {
              finalDrugName = bestMatchingCol;
            }
          }

          // 3. Unified Date Scanner
          const targetIdx = cols.indexOf(finalDrugName);
          if (targetIdx !== -1) {
            for (let j = targetIdx + 1; j < cols.length; j++) {
              if (dateRe.test(cols[j])) {
                visitDateRaw = cols[j];
                break;
              }
            }
          }
          if (!visitDateRaw) {
            for (const c of cols) {
              if (dateRe.test(c)) {
                visitDateRaw = c;
                break;
              }
            }
          }
        }

        // Parse signatures for deduplication
        let mechSig = item.text;
        let suggSig = "";

        const caps1 = item.text.match(re1);
        if (caps1) {
          mechSig = caps1[6]?.trim() || "";
          suggSig = caps1[7]?.trim() || "";
        } else {
          const caps2 = item.text.match(re2);
          if (caps2) {
            mechSig = caps2[6]?.trim() || "";
          }
        }

        // Generate date sort key
        let dateKey = "0000/00/00";
        if (visitDateRaw) {
          const parts = visitDateRaw.split(/[\/\.-]/);
          if (parts.length >= 3) {
            const y = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10);
            const d = parseInt(parts[2], 10);
            if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
              dateKey = `${y.toString().padStart(4, "0")}/${m.toString().padStart(2, "0")}/${d.toString().padStart(2, "0")}`;
            }
          }
        }

        found.push({
          text: item.text,
          generic: item.generic,
          brand: item.brand,
          user_drug_str: finalDrugName,
          visit_date: visitDateRaw,
          date_key: dateKey,
          sort_score: lineIdx * 10000 + firstMatchIdx,
          mech_sig: mechSig,
          sugg_sig: suggSig,
          has_code: foundByCode,
        });
      }
    }
  }

  // Deduplication
  const championMap = new Map();
  for (const item of found) {
    const key = `${item.visit_date}|${item.mech_sig}|${item.sugg_sig}`;
    const incumbent = championMap.get(key);
    if (!incumbent) {
      championMap.set(key, item);
    } else {
      if (item.has_code && !incumbent.has_code) {
        championMap.set(key, item);
      }
    }
  }

  const finalList = Array.from(championMap.values());

  // Final Sort
  finalList.sort((a, b) => {
    if (b.date_key !== a.date_key) {
      return b.date_key.localeCompare(a.date_key);
    }
    return a.sort_score - b.sort_score;
  });

  return finalList;
}





const BZD_GENERICS = [
  "midazolam", "triazolam", "diazepam", "clonazepam", "chlordiazepoxide", 
  "alprazolam", "lorazepam", "oxazepam", "temazepam", "flurazepam", 
  "estazolam", "brotizolam", "bromazepam", "flunitrazepam", "fludiazepam", "etizolam"
];

const BZD_BRAND_TO_GENERIC = {
  "lendormin": "brotizolam",
  "lendorm": "brotizolam",
  "戀多眠": "brotizolam",
  "ativan": "lorazepam",
  "anxicam": "lorazepam",
  "wempty": "lorazepam",
  "lowen": "lorazepam",
  "安定文": "lorazepam",
  "xanax": "alprazolam",
  "alpraline": "alprazolam",
  "kinax": "alprazolam",
  "solax": "alprazolam",
  "贊安諾": "alprazolam",
  "景安寧": "alprazolam",
  "valium": "diazepam",
  "dupin": "diazepam",
  "煩寧": "diazepam",
  "dormicum": "midazolam",
  "導眠靜": "midazolam",
  "rivotril": "clonazepam",
  "ripam": "clonazepam",
  "利福全": "clonazepam",
  "eurodin": "estazolam",
  "eszo": "estazolam",
  "悠樂丁": "estazolam",
  "lexotan": "bromazepam",
  "柔速瑞": "bromazepam",
  "立舒保": "bromazepam",
  "modipanol": "flunitrazepam",
  "fm2": "flunitrazepam",
  "氟硝西泮": "flunitrazepam",
  "erispan": "fludiazepam",
  "癒利舒盼": "fludiazepam",
  "halcion": "triazolam",
  "酣樂欣": "triazolam",
  "librium": "chlordiazepoxide",
  "serax": "oxazepam",
  "normison": "temazepam",
  "dalmadorm": "flurazepam",
  "達眠": "flurazepam",
  "depas": "etizolam",
"etizolan": "etizolam",
  "戴帕斯": "etizolam"
};

const SAFE_KEYWORDS = [
  "acetaminophen",
  "paracetamol",
  "doxycycline",
  "fexofenadine",
  "pseudoephedrine",
  "diclofenac",
  "ibuprofen",
  "mefenamic acid",
  "potassium",
  "agomelatine",
  "famotidine",
  "sulfamethoxazole",
  "carteolol"
];

function getDictSuggestion(key) {
  if (!key || typeof DICT === 'undefined') return '';
  const k = key.toLowerCase().trim();
  
  // 1. 精準比對
  if (DICT[k]) return DICT[k];
  
  // 2. 清理鹽類與括號 (如 rosuvastatin calcium -> rosuvastatin, amlodipine (besylate) -> amlodipine)
  const cleanK = k.replace(/\s*[\(\（].*?[\)\）]/g, '')
                  .replace(/\s+(calcium|besylate|mesylate|hcl|hydrochloride|sodium|potassium|tartrate|fumarate|maleate|succinate|sulfate|nitrate|phosphate|citrate|acetate)\b/gi, '')
                  .trim();
  if (DICT[cleanK]) return DICT[cleanK];

  // 3. 遍歷字典鍵值進行包含搜尋
  for (const dictKey of Object.keys(DICT)) {
    if (k.includes(dictKey) || cleanK.includes(dictKey)) {
      return DICT[dictKey];
    }
  }
  return '';
}

function parseAndCategorizeCloudPrescription(rawText) {
  rawText = preprocessOcrText(rawText);
  const contraindicated = [];
  const interactive = [];
  const safeList = [];
  const unknown = [];

  if (!rawText || !rawText.trim()) {
    return { contraindicated, interactive, safe, unknown };
  }

  // Exact HTA normalization: remove header artifacts and normalize line endings
  let txt = rawText
    .replace(/\s*藥\s*品\s*名\s*稱/g, '')
    .replace(/\r/g, '');

  // Apply HTA brand name replacements & ATC translations
  txt = txt
    .replace(/\bPsycholeptics\b/gi, '精神神經安定劑 (Psycholeptics)')
    .replace(/\bPsychoanaleptics\b/gi, '精神興奮劑 (Psychoanaleptics)')
    .replace(/\bOphthalmologicals\b/gi, '眼科用藥 (Ophthalmologicals)')
    .replace(/\bAntiepileptics\b/gi, '抗癲癇藥 (Antiepileptics)')
    .replace(/\bdiovan\b/gi, 'valsartan')
    .replace(/\bconcor\b/gi, 'bisoprolol')
    .replace(/\beltroxin\b/gi, 'levothyroxine')
    .replace(/\baltace\b/gi, 'ramipril')
    .replace(/\bcrestor\b/gi, 'rosuvastatin')
    .replace(/\blipitor\b/gi, 'atorvastatin')
    .replace(/\bzocor\b/gi, 'simvastatin')
    .replace(/\bmevacor\b/gi, 'lovastatin')
    .replace(/\baltoprev\b/gi, 'lovastatin')
    .replace(/\ballegra\b/gi, 'fexofenadine')
    .replace(/\bdex-ctm\b/gi, 'dexchlorpheniramine')
    .replace(/\beuricon\b/gi, 'benzbromarone')
    .replace(/\bartelac\b/gi, 'hypromellose')
    .replace(/\bkary\s*uni\b/gi, 'pirenoxine')
    .replace(/\bdufanas\b/gi, 'azelastine')
    .replace(/\btamlosin\b/gi, 'tamsulosin')
    .replace(/\bfronil\b/gi, 'imipramine')
    .replace(/\bactein\b/gi, 'acetylcysteine')
    .replace(/\bultibro\b/gi, 'indacaterol')
    .replace(/\bsecorine\b/gi, 'methylephedrine')
    .replace(/\bkalimate\b/gi, 'calcium polystyrene')
    .replace(/\bdestone\b/gi, 'potassium citrate')
    .replace(/brilinta/gi, 'ticagrelor')
    .replace(/xarelto/gi, 'rivaroxaban')
    .replace(/eliquis/gi, 'apixaban')
    .replace(/lixiana/gi, 'edoxaban')
    .replace(/pradaxa/gi, 'dabigatran')
    .replace(/efient/gi, 'prasugrel')
    .replace(/amtrel/gi, 'amtrel含有amlodipine')
    .replace(/exforge/gi, 'exforge含有amlodipine')
    .replace(/co-diovan/gi, 'co-diovan含有valsartan')
    .replace(/galvus/gi, 'galvus含有vildagliptin')
    .replace(/trajenta/gi, 'trajenta含有linagliptin')
    .replace(/glyxambi/gi, 'glyxambi含有linagliptin')
    .replace(/actos/gi, 'actos含有pioglitazone')
    .replace(/vytorin/gi, 'vytorin含有simvastatin')
    .replace(/linicor/gi, 'linicor含有lovastatin')
    .replace(/jardiance/gi, 'jardiance含有empagliflozin')
    .replace(/qtern/gi, 'qtern含有saxagliptin')
    .replace(/ryzodeg/gi, 'ryzodeg含有insulin')
    .replace(/entresto/gi, 'entresto含有sacubitril')
    .replace(/caduet/gi, 'caduet含有atorvastatin');

  // Split by line breaks (if tab-delimited lines or OCR lines)
  const blocks = txt.split(/[\r\n]+/).map(b => b.trim()).filter(b => b.length > 0);
  
  // 台灣健保藥品代碼為 10 碼（1-2 個英文字母 + 7-9 位數字/英數，總長度為 9-11 碼）
  // 嚴格排除 ICD-10 疾病診斷碼（如 F03911, F0392, L239, N401, I10 等短代碼）
  const isNhiDrugCode = (str) => {
    if (!str) return false;
    const s = str.trim();
    return /^[A-Za-z]{1,2}\d{5,9}[A-Za-z0-9]{0,3}$/.test(s) && s.length >= 8 && s.length <= 11;
  };
  const codeRe = /^[A-Za-z]{1,2}\d{6,9}[A-Za-z0-9]{0,3}$/;
  const dateRe = /^\d{2,4}[\/\.-]\d{1,2}[\/\.-]\d{1,2}/;

  // ── 來源與就醫別預掃描 ──────────────────────────────────────────────────────
  // 雲端藥歷每筆藥記錄為 4 行一組：
  //   A: {序號}\t{院所名稱}   → matches /^\d+\t/
  //   B: {門診|住診|藥局|急診}
  //   C: {院所代碼}\t{主診斷}
  //   D: {ATC3}\t...\t{藥品代碼}\t{藥品名稱}\t{就醫日期}\t...   ← 含藥品代碼
  // 我們往回找最近的 A 行來得知來源，並建立院所代碼與名稱對照表
  const itemLineRe = /^(\d{1,3})\t(.+)/;   // 序號只有 1-3 位數，院所代碼是 10 位數不會誤判
  const visitTypeRe = /^(門診|住診|藥局|急診)$/;
  const sourceMap = []; // sourceMap[idx] = { source, visitType }
  const providerMap = {}; // 院所代碼 -> 院所名稱 對照表
  const blockProviders = new Array(blocks.length).fill(null);
  let lastSource = '';
  let lastVisitType = '';
  
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i].trim();
    const m = b.match(itemLineRe);
    if (m) { lastSource = m[2].trim(); }
    if (visitTypeRe.test(b)) { lastVisitType = b.trim(); }

    // ── OCR 重組行：第一欄格式為「院所名稱（門診/住診/藥局/急診）」
    const firstCol = b.split('\t')[0];
    const embeddedSrcMatch = firstCol.match(/^(.+?)（(門診|住診|藥局|急診)）$/);
    if (embeddedSrcMatch) {
      lastSource = embeddedSrcMatch[1].trim();
      lastVisitType = embeddedSrcMatch[2].trim();
    }

    // ── 第一筆記錄無序號：「台北醫大」這種純診所名稱行也要偵測 ───────────────
    // 雲端藥歷第一筆不含序號，後面才有「2\t台北醫大」格式。
    // 同樣套用嚴格驗證：短、有中文、不是診斷詞、不是英文為主、無 Tab
    if (!m && !embeddedSrcMatch && !visitTypeRe.test(b) && !b.includes('\t')) {
      const hasChinese = /[\u4e00-\u9fa5]/.test(b);
      const isShort = b.length >= 2 && b.length <= 12;
      const isDiagnosis = /病|炎|症|癌|瘤|障礙|疾病|感染|損傷|骨折|慢性|急性|原發|多發|未明/.test(b);
      const isMostlyEnglish = b.replace(/[^A-Za-z]/g, '').length / b.length > 0.5;
      if (hasChinese && isShort && !isDiagnosis && !isMostlyEnglish) {
        lastSource = b;
      }
    }

    // ── 建立院所代碼與名稱對照表 ──────────────────────────────────────────────
    const provMatch = b.match(/^([0-9A-Za-z]{10})\t/);
    if (provMatch) {
      const provCode = provMatch[1];
      blockProviders[i] = provCode;
      if (lastSource) {
        providerMap[provCode] = lastSource;
      }
    }

    sourceMap[i] = { source: lastSource, visitType: lastVisitType };
  }

  const tempItems = [];

  for (let idx = 0; idx < blocks.length; idx++) {
    const block = blocks[idx];
    const blockLower = block.toLowerCase();
    const cols = block.split('\t').map(c => c.trim());

    let hasCode = false;
    let codeIdx = -1;
    let lineCode = "";

    for (let i = 0; i < cols.length; i++) {
      if (isNhiDrugCode(cols[i])) {
        hasCode = true;
        codeIdx = i;
        lineCode = cols[i];
        break;
      }
    }

    let genericName = "";
    let brandName = "";
    if (hasCode && codeIdx !== -1) {
      // Look left for first non-empty column (generic name)
      for (let i = codeIdx - 1; i >= 0; i--) {
        if (cols[i]) {
          genericName = cols[i];
          break;
        }
      }
      // Look right for first non-empty column (brand name)
      for (let i = codeIdx + 1; i < cols.length; i++) {
        if (cols[i]) {
          brandName = cols[i];
          break;
        }
      }

      // 若學名缺失，或辨識為亂碼/非標準英文字串/純藥理分類，直接以代碼字典標準化
      const nhiMatch = lineCode.match(/([A-Za-z]{1,2}\d{5,9}[A-Za-z0-9]{0,3})/);
      let codeKey = nhiMatch ? nhiMatch[1].toUpperCase() : lineCode.toUpperCase();
      if (!NHI_CODE_LOOKUP[codeKey] && codeKey.length >= 10) {
        const p10 = codeKey.substring(0, 10);
        if (NHI_CODE_LOOKUP[p10]) codeKey = p10;
      }
      if (NHI_CODE_LOOKUP[codeKey]) {
        genericName = NHI_CODE_LOOKUP[codeKey].generic;
        if (!brandName || brandName.length < 3 || /cl\s*P\s*9|ap\s*ss/i.test(brandName)) brandName = NHI_CODE_LOOKUP[codeKey].brand;
      }
    } else {
      // 若無欄位被判定為健保碼，嘗試由整行正則擷取健保碼
      const codeMatch = block.match(/\b([A-Za-z]{1,2}\d{5,9}[A-Za-z0-9]{0,3})\b/);
      if (codeMatch) {
        lineCode = codeMatch[1];
        let codeKey = lineCode.toUpperCase();
        if (!NHI_CODE_LOOKUP[codeKey] && codeKey.length >= 10) {
          const p10 = codeKey.substring(0, 10);
          if (NHI_CODE_LOOKUP[p10]) codeKey = p10;
        }
        if (NHI_CODE_LOOKUP[codeKey]) {
          genericName = NHI_CODE_LOOKUP[codeKey].generic;
          brandName = NHI_CODE_LOOKUP[codeKey].brand;
          hasCode = true;
        }
      }
      // 若無標準健保碼，嘗試檢查第 0 或第 1 欄是否為學名/商品名
      if (!genericName && cols.length >= 2 && /^[A-Za-z]/.test(cols[0]) && cols[0].length >= 3 && !/^(門診|住診|藥局|急診|\d+|[A-Z]\d{2,4})$/.test(cols[0])) {
        genericName = cols[0];
        brandName = cols[1];
      }
    }


    let visitDate = "";
    const targetIdx = cols.indexOf(genericName || brandName || "");
    if (targetIdx !== -1) {
      for (let j = targetIdx + 1; j < cols.length; j++) {
        if (dateRe.test(cols[j])) {
          visitDate = cols[j];
          break;
        }
      }
    }
    if (!visitDate) {
      for (const c of cols) {
        if (dateRe.test(c)) {
          visitDate = c;
          break;
        }
      }
    }

    // Generate date sort key
    let dateKey = "0000-00-00";
    if (visitDate) {
      const parts = visitDate.split(/[\/\.-]/);
      if (parts.length >= 3) {
        let y = parseInt(parts[0], 10);
        let m = parseInt(parts[1], 10);
        let d = parseInt(parts[2], 10);
        if (y >= 1000 && y < 1911) {
          y = y % 1000;
        }
        if (y < 1911) {
          y += 1911; // Taiwan ROC Year to Common Era Year
          if (y < 2015 && (y + 100) <= (new Date().getFullYear() + 2)) {
            y += 100;
          }
        } else if (y > 2100) {
          y = (y % 1000) + 1911;
        }
        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
          dateKey = `${y.toString().padStart(4, "0")}-${m.toString().padStart(2, "0")}-${d.toString().padStart(2, "0")}`;
        }
      }
    }

    // HTA Matching sequence: proh -> dont -> pote -> safe
    const searchTarget = `${blockLower} ${(genericName || '').toLowerCase()} ${(brandName || '').toLowerCase()}`;
    const matchedProh = proh.find(k => searchTarget.includes(k));
    const matchedDont = dont.find(k => searchTarget.includes(k));
    const matchedPote = pote.find(k => searchTarget.includes(k));
    const matchedSafe = safe.find(k => searchTarget.includes(k)) || safe2.find(k => searchTarget.includes(k));

    let severity = "unknown";
    let matchedKw = "";

    if (matchedProh) {
      severity = "contraindicated";
      matchedKw = matchedProh;
    } else if (matchedDont) {
      severity = "contraindicated";
      matchedKw = matchedDont;
    } else if (matchedPote) {
      severity = "interactive";
      matchedKw = matchedPote;
    } else if (matchedSafe) {
      severity = "safe";
      matchedKw = matchedSafe;
    } else if (hasCode && lineCode) {
      const match = lineCode.match(/([A-Za-z]{1,2}\d{5,10}[A-Za-z0-9]{0,3})/);
      let codeKey = match ? match[1].toUpperCase() : lineCode.toUpperCase();
      if (!NHI_CODE_LOOKUP[codeKey] && codeKey.length >= 10) {
        const p10 = codeKey.substring(0, 10);
        if (NHI_CODE_LOOKUP[p10]) codeKey = p10;
      }
      if (NHI_CODE_LOOKUP[codeKey]) {
        severity = NHI_CODE_LOOKUP[codeKey].severity;
        matchedKw = (genericName || NHI_CODE_LOOKUP[codeKey].generic).toLowerCase();
      }
    }

    if (!genericName && matchedKw) {
      if (matchedKw.toLowerCase() === 'doxazosin') genericName = 'Doxazosin (Mesylate)';
      else if (matchedKw.toLowerCase() === 'amlodipine') genericName = 'Amlodipine (Besylate)';
      else if (matchedKw.toLowerCase() === 'valsartan') genericName = 'Valsartan';
      else if (matchedKw.toLowerCase() === 'amiodarone') genericName = 'Amiodarone Hcl';
      else if (matchedKw.toLowerCase() === 'rosuvastatin') genericName = 'Rosuvastatin Calcium';
      else if (matchedKw.toLowerCase() === 'levothyroxine') genericName = 'Levothyroxine Sodium';
      else if (matchedKw.toLowerCase() === 'lorazepam') genericName = 'Lorazepam';
      else genericName = matchedKw.charAt(0).toUpperCase() + matchedKw.slice(1);
    }

    const matchCode = lineCode ? (lineCode.match(/([A-Za-z]{1,2}\d{5,10}[A-Za-z0-9]{0,3})/) || [null, ''])[1].toUpperCase() : '';
    const entry = matchCode && typeof getNhiCodeEntry === 'function' ? getNhiCodeEntry(matchCode) : null;
    const standardGeneric = entry ? entry.generic : '';
    const standardBrand = entry ? entry.brand : '';
    if (!brandName && standardBrand) brandName = standardBrand;
    if (!genericName && standardGeneric) genericName = standardGeneric;

    // 複方藥物成分二次交互作用自動檢核（若單一成分未檢出）
    if (entry && entry.generic && (severity === 'unknown' || severity === 'safe')) {
      const parts = entry.generic.split(/[;\+]/).map(p => p.trim()).filter(Boolean);
      for (const p of parts) {
        const pLower = p.toLowerCase();
        for (const kw of (typeof proh !== 'undefined' ? proh : [])) {
          if (pLower.includes(kw.toLowerCase())) { severity = 'contraindicated'; matchedKw = kw; break; }
        }
        if (severity === 'contraindicated') break;
        for (const kw of (typeof dont !== 'undefined' ? dont : [])) {
          if (pLower.includes(kw.toLowerCase())) { severity = 'contraindicated'; matchedKw = kw; break; }
        }
        if (severity === 'contraindicated') break;
        for (const kw of (typeof pote !== 'undefined' ? pote : [])) {
          if (pLower.includes(kw.toLowerCase())) { severity = 'interactive'; matchedKw = kw; break; }
        }
        if (severity === 'interactive') break;
      }
    }

    const rawKey = (standardGeneric || matchedKw || genericName || brandName || blockLower).toLowerCase();
    const drugKey = rawKey.replace(/\s*[\(\（].*?[\)\）]/g, '')
                          .replace(/\s+(calcium|besylate|mesylate|hcl|hydrochloride|sodium|potassium|tartrate|fumarate|maleate|succinate|sulfate|nitrate|phosphate|citrate|acetate)\b/gi, '')
                          .replace(/\s+\d+(\.\d+)?(mg|mcg|g|%)?/gi, '')
                          .trim() || rawKey;

    let cleanLineScreen = "";
    let cleanLinePrint = "";

    if (severity === "contraindicated" || severity === "interactive") {
      let rawSugg = getDictSuggestion(matchedKw || genericName || drugKey);
      if (rawSugg && rawSugg.startsWith('{') && rawSugg.includes('}')) {
        rawSugg = rawSugg.substring(rawSugg.indexOf('}') + 1).trim();
      }

      const screenSugg = rawSugg ? `【${rawSugg}】👈` : `👈`;
      const printSugg = rawSugg ? `【☗☗${rawSugg}】` : ``;

      let baseLine = cols.join(" ").toLowerCase().replace(/\s+/g, " ");
      baseLine = baseLine.replace(/magnesium/g, "magnesium👈👈👈");

      const targetSearch = (genericName || matchedKw).toLowerCase();
      const posIdx = baseLine.indexOf(targetSearch);
      if (posIdx !== -1 && targetSearch.length > 0) {
        const insertPos = posIdx + targetSearch.length;
        cleanLineScreen = baseLine.substring(0, insertPos) + screenSugg + baseLine.substring(insertPos);
      } else {
        cleanLineScreen = baseLine + " " + screenSugg;
      }

      if (hasCode) {
        const sourceVal = cols[0] ? cols[0].toLowerCase() : "";
        const genericVal = genericName ? genericName.toLowerCase() : "";
        const codeVal = lineCode ? lineCode.toLowerCase() : "";
        const brandVal = brandName ? brandName.toLowerCase() : "";
        cleanLinePrint = `⛨${sourceVal}\t${genericVal}\t${codeVal}\t${brandVal}${printSugg}`;
      } else {
        cleanLinePrint = `⛨${block.toLowerCase()}\t${printSugg}`;
      }
    } else {
      cleanLineScreen = cols.join(" ").toLowerCase().replace(/\s+/g, " ");
      
      if (hasCode) {
        const sourceVal = cols[0] ? cols[0].toLowerCase() : "";
        const genericVal = genericName ? genericName.toLowerCase() : "";
        const codeVal = lineCode ? lineCode.toLowerCase() : "";
        const brandVal = brandName ? brandName.toLowerCase() : "";
        cleanLinePrint = `⛨${sourceVal}\t${genericVal}\t${codeVal}\t${brandVal}`;
      } else {
        cleanLinePrint = `⛨${block.toLowerCase()}`;
      }
    }
    
    // 往回尋找最匹配的院所名稱與就醫別（雙向補全與對照）
    let finalSource = "";
    let finalVisitType = "";

    for (let j = idx - 1; j >= 0; j--) {
      const bLine = blocks[j].trim();
      
      // 1. 尋找院所名稱
      if (!finalSource) {
        const provCode = blockProviders[j];
        if (provCode && providerMap[provCode]) {
          finalSource = providerMap[provCode];
        } else if (provCode && (typeof window !== 'undefined' && window.PROVIDER_DB && window.PROVIDER_DB[provCode])) {
          finalSource = window.PROVIDER_DB[provCode];
        } else {
          const m = bLine.match(itemLineRe);
          if (m) {
            finalSource = m[2].trim();
          } else {
            const embeddedMatch = bLine.split('\t')[0].match(/^(.+?)（(門診|住診|藥局|急診)）$/);
            if (embeddedMatch) {
              finalSource = embeddedMatch[1].trim();
            } else if (!bLine.includes('\t') && !visitTypeRe.test(bLine)) {
              const hasChinese = /[\u4e00-\u9fa5]/.test(bLine);
              const isShort = bLine.length >= 2 && bLine.length <= 12;
              const isDiagnosis = /病|炎|症|癌|瘤|障礙|疾病|感染|損傷|骨折|慢性|急性|原發|多發|未明/.test(bLine);
              const isMostlyEnglish = bLine.replace(/[^A-Za-z]/g, '').length / bLine.length > 0.5;
              if (hasChinese && isShort && !isDiagnosis && !isMostlyEnglish) {
                finalSource = bLine;
              }
            }
          }
        }
      }
      
      // 2. 尋找就醫別
      if (!finalVisitType) {
        if (visitTypeRe.test(bLine)) {
          finalVisitType = bLine;
        } else {
          const embeddedMatch = bLine.split('\t')[0].match(/^(.+?)（(門診|住診|藥局|急診)）$/);
          if (embeddedMatch) {
            finalVisitType = embeddedMatch[2].trim();
          }
        }
      }

      if (finalSource && finalVisitType) {
        break;
      }
    }

    if (!finalSource && sourceMap[idx]) finalSource = sourceMap[idx].source;
    if (!finalVisitType && sourceMap[idx]) finalVisitType = sourceMap[idx].visitType;

    tempItems.push({
      id: `block_${idx}`,
      originalLine: block,
      cleanLineScreen,
      cleanLinePrint,
      selectedForPrint: true,
      severity,
      genericName: genericName || undefined,
      brandName: brandName || undefined,
      hasCode,
      visitDate,
      dateKey,
      drugKey,
      source: finalSource,
      visitType: finalVisitType
    });
  }

  // Deduplicate and precheck latest items grouped by drugKey
  const groups = new Map();
  for (const item of tempItems) {
    if (!groups.has(item.drugKey)) {
      groups.set(item.drugKey, []);
    }
    groups.get(item.drugKey).push(item);
  }

  const validItems = [];
  for (const [key, group] of groups.entries()) {
    // Sort in descending order of dateKey so the latest with valid date is first
    group.sort((a, b) => {
      if (b.dateKey !== a.dateKey) return b.dateKey.localeCompare(a.dateKey);
      const aScore = (a.genericName ? 2 : 0) + (a.brandName ? 1 : 0);
      const bScore = (b.genericName ? 2 : 0) + (b.brandName ? 1 : 0);
      return bScore - aScore;
    });

    const hasDatedItem = group.some(it => it.visitDate && it.dateKey !== "0000-00-00");
    // 排除無日期的 OCR 殘缺碎片（若該藥物已有含日期的完整項目）
    const filteredGroup = hasDatedItem 
      ? group.filter(it => it.visitDate && it.dateKey !== "0000-00-00")
      : [group[0]];

    // 同一就醫日期的重複記錄僅保留最完整的一筆
    const uniqueDateGroup = [];
    const seenDates = new Set();
    for (const it of filteredGroup) {
      const dKey = it.visitDate || 'no_date';
      if (!seenDates.has(dKey)) {
        seenDates.add(dKey);
        uniqueDateGroup.push(it);
      }
    }

    // 臨床用藥評估原則：同一藥物僅保留「最新就醫日期」之單一有效處方，自動排除過往歷史重複紀錄
    if (uniqueDateGroup.length > 0) {
      const latestItem = uniqueDateGroup[0];
      latestItem.isDuplicate = false;
      latestItem.selectedForPrint = true;
      validItems.push(latestItem);
    }
  }

  // Push to final lists
  for (const parsedItem of validItems) {
    if (parsedItem.severity === "contraindicated") {
      contraindicated.push(parsedItem);
    } else if (parsedItem.severity === "interactive") {
      interactive.push(parsedItem);
    } else if (parsedItem.severity === "safe") {
      safeList.push(parsedItem);
    } else {
      unknown.push(parsedItem);
    }
  }

  // Filter and sort all unique medication entries for the summary overview
  const allItems = validItems.filter(it => it.hasCode || it.genericName || it.brandName);
  allItems.sort((a, b) => {
    if (b.dateKey !== a.dateKey) {
      return b.dateKey.localeCompare(a.dateKey);
    }
    return 0;
  });
  
  return {
    contraindicated,
    interactive,
    safe: safeList,
    unknown,
    allItems
  };
}