function cleanGenericName(rawGeneric) {
  if (!rawGeneric) return "";
  
  let cleaned = rawGeneric.trim();
  
  // OCR 常見醫學詞尾修復 (如 Hcl 被誤認成 Hd, Hci, Hel, Hct 等)
  cleaned = cleaned.replace(/\bHd\b/g, 'Hcl')
                   .replace(/\bHci\b/g, 'Hcl')
                   .replace(/\bHel\b/g, 'Hcl')
                   .replace(/\bHct\b/g, 'Hcl')
                   .replace(/\bTab\b/gi, 'Tablets')
                   .replace(/\bCap\b/gi, 'Capsules');

  const keywords = [];
  if (typeof proh !== 'undefined') keywords.push(...proh);
  if (typeof dont !== 'undefined') keywords.push(...dont);
  if (typeof pote !== 'undefined') keywords.push(...pote);
  if (typeof safe !== 'undefined') keywords.push(...safe);
  if (typeof safe2 !== 'undefined') keywords.push(...safe2);
  if (typeof DICT !== 'undefined') keywords.push(...Object.keys(DICT));
  
  const uniqueKeywords = Array.from(new Set(keywords)).filter(k => k.length > 2);
  
  const rawLower = cleaned.toLowerCase();
  let firstIdx = -1;
  
  for (const kw of uniqueKeywords) {
    let searchFrom = 0;
    while (true) {
      const idx = rawLower.indexOf(kw, searchFrom);
      if (idx === -1) break;
      
      // Skip matches that are inside parentheses (e.g. Sennoside A+B(Calcium) → 'calcium' is inside brackets)
      // Count unmatched open parens before this position
      let depth = 0;
      for (let ci = 0; ci < idx; ci++) {
        if (cleaned[ci] === '(' || cleaned[ci] === '（') depth++;
        else if (cleaned[ci] === ')' || cleaned[ci] === '）') depth--;
      }
      if (depth > 0) {
        searchFrom = idx + 1;
        continue; // this match is inside parentheses — skip it
      }
      
      // Accept this match
      if (firstIdx === -1 || idx < firstIdx) {
        firstIdx = idx;
      }
      break;
    }
  }
  
  if (firstIdx !== -1) {
    return cleaned.substring(firstIdx).trim();
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
    "psycholeptics", "ophthalmologicals", "antiepileptics", "lipid modifying",
    "laxatives", "renin-angiotensin", "diabetes", "antipruritics", "urologicals",
    "antihistamines", "corticosteroids", "nasal preparations", "anti-inflammatory"
  ];
  const cleanedLower = cleaned.toLowerCase();
  for (const prefix of atcPrefixes) {
    const pIdx = cleanedLower.indexOf(prefix);
    if (pIdx !== -1) {
      const endIdx = pIdx + prefix.length;
      let temp = cleaned.substring(endIdx).trim();
      if (temp.startsWith('.') || temp.startsWith(')') || temp.startsWith('）') || temp.startsWith(';') || temp.startsWith('；')) {
        temp = temp.substring(1).trim();
      }
      cleaned = temp;
      break;
    }
  }
  
  cleaned = cleaned.replace(/^[Yy]\s+/, '').trim();
  return cleaned;
}

function preprocessOcrText(rawText) {
  if (!rawText || !rawText.trim()) return rawText;

  const lines = rawText.split(/[\r\n]+/).map(l => l.trim()).filter(l => l.length > 0);
  const reconstructedLines = [];
  let buffer = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // ── OCR 字元修正：替換常見數字/字母混淆 ──────────────────────────────
    // 0. 清除健保碼中間夾雜的表格斜線/豎線（例如 BC233/4100 或 BC233|4100 -> BC23374100 或 BC23314100）
    line = line.replace(/\b([A-Za-z]{1,3}\d{2,4})[\/\\|](\d{3,5})\b/g, (m, p1, p2) => {
      // 在台灣健保碼中，斜線最常是 7 或 1 被誤判
      return p1 + '7' + p2;
    });

    // 修復首字元被誤讀：8C→BC, 0D→OD, 1BC→IBC（僅在明確為健保碼前置字母時）
    line = line.replace(/(?<![A-Za-z])8([A-Za-z]\d{5,9}[A-Za-z0-9]{0,3})\b/g, 'B$1');
    line = line.replace(/(?<![A-Za-z])0([A-Za-z]\d{5,9}[A-Za-z0-9]{0,3})\b/g, 'O$1');
    line = line.replace(/(?<![A-Za-z])1([A-Za-z][A-Za-z]\d{5,9}[A-Za-z0-9]{0,3})\b/g, 'I$1');

    // ── 僅修復確定是健保碼但夾雜了明顯 OCR 字母錯誤的 token ────────────────
    line = line.replace(/\b([A-Za-z]{1,3})((?=[0-9A-Za-z]{6,10}\b)[0-9A-Za-z]+)\b/g, (match, prefix, rest) => {
      const digitCount = (rest.match(/\d/g) || []).length;
      const letterCount = (rest.match(/[A-Za-z]/g) || []).length;
      if (digitCount >= 5 && letterCount >= 1 && letterCount <= 3 && (prefix.length + rest.length) <= 12) {
        const fixedRest = rest.replace(/[sS]/g, c => /\d/.test(rest[rest.indexOf(c)-1]||'') || /\d/.test(rest[rest.indexOf(c)+1]||'') ? '5' : c)
                              .replace(/[oO]/g, c => /\d/.test(rest[rest.indexOf(c)-1]||'') || /\d/.test(rest[rest.indexOf(c)+1]||'') ? '0' : c);
        return prefix.toUpperCase() + fixedRest;
      }
      return match;
    });

    const codeMatch = line.match(/\b([A-Za-z]{1,3}\d{5,10}[A-Za-z0-9]{0,3})\b/);
    
    if (codeMatch && !line.includes('\t')) {
      const code = codeMatch[1];
      const dateMatch = line.match(/(\d{2,4}[\/\.-]\d{1,2}[\/\.-]\d{1,2})/);
      const date = dateMatch ? dateMatch[1] : "";

      let source = "";
      let visitType = "";
      let providerCode = "";

      for (let j = buffer.length - 1; j >= 0; j--) {
        const bLine = buffer[j];
        const provMatch = bLine.match(/\b(\d[A-Za-z0-9]{9})\b/);
        if (provMatch && !providerCode) {
          providerCode = provMatch[1];
        } else if ((bLine === "門診" || bLine === "住診" || bLine === "藥局") && !visitType) {
          visitType = bLine;
        } else if (!source) {
          // ── 嚴格驗證診所名稱 ────────────────────────────────────────────────
          // 台灣健保診所名稱特徵：
          //   1. 長度合理（去掉序號後 2~12 個字元）
          //   2. 必須含有中文字元
          //   3. 不能是疾病診斷名稱（含有常見診斷關鍵字）
          //   4. 不能含有大量英文/數字（可能是診斷碼或 ATC 分類）
          let candidate = bLine.replace(/^\d+\s+/, '').trim(); // 去掉前置序號
          candidate = candidate.replace(/^[\(\)（）\s\.\-]+|[\(\)（）\s\.\-]+$/g, '').trim();
          const hasChinese = /[\u4e00-\u9fa5]/.test(candidate);
          const isShort = candidate.length >= 2 && candidate.length <= 12;
          const isDiagnosis = /病|炎|症|癌|瘤|障礙|疾病|感染|損傷|骨折|慢性|急性|原發|多發|未明|高血壓|過敏|接觸|皮膚|性/.test(candidate);
          const isMostlyEnglish = (candidate.replace(/[^A-Za-z]/g, '').length / candidate.length) > 0.5;
          const isJunkLine = /^[0-9\s\.\-\|\/\\@#\*\(\)（）]+$/.test(candidate);
          if (hasChinese && isShort && !isDiagnosis && !isMostlyEnglish && !isJunkLine) {
            source = candidate;
          }
        }
      }

      const parts = line.split(code);
      const leftPart = parts[0].trim();
      const rightPart = parts[1] ? parts[1].trim() : "";

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
        const provMatch = leftPart.match(/\b(\d[A-Za-z0-9]{9})\b/);
        if (provMatch) {
          providerCode = provMatch[1];
        }
      }
      if (!visitType) {
        const vtMatch = leftPart.match(/門診|住診|藥局/);
        if (vtMatch) {
          visitType = vtMatch[0];
        }
      }

      if (!source) {
        let beforeAnchor = "";
        if (providerCode && leftPart.includes(providerCode)) {
          beforeAnchor = leftPart.split(providerCode)[0].trim();
        } else if (visitType && leftPart.includes(visitType)) {
          beforeAnchor = leftPart.split(visitType)[0].trim();
        }
        if (beforeAnchor) {
          const stripped = beforeAnchor.replace(/門診|住診|藥局/g, ' ').replace(/\d+/g, ' ').trim();
          const chunkMatch = stripped.match(/[\u4e00-\u9fa5]+/g);
          if (chunkMatch && chunkMatch.length > 0) {
            const candidate = chunkMatch.join('').trim();
            const hasChinese = /[\u4e00-\u9fa5]/.test(candidate);
            const isShort = candidate.length >= 2 && candidate.length <= 12;
            const isDiagnosis = /病|炎|症|癌|瘤|障礙|疾病|感染|損傷|骨折|慢性|急性|原發|多發|未明|高血壓/.test(candidate);
            if (hasChinese && isShort && !isDiagnosis) {
              source = candidate;
            }
          }
        }
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
      // 例如：「for systemic use） Dexchlorpheniramine Maleate」
      //   或：「preparations） Benzbromarone」
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
          // 排除常見診斷或院所別
          const isDiag = /病|炎|症|癌|瘤|障礙|疾病|感染|損傷|骨折|慢性|急性|原發|多發|未明|高血壓/.test(bLine);
          const isMeta = /^(門診|住診|藥局|\d+|[A-Z]\d{3,4})$/.test(bLine);
          if (!isDiag && !isMeta) {
            let candidateGeneric = bLine;
            const cCloseIdx = Math.max(candidateGeneric.lastIndexOf('）'), candidateGeneric.lastIndexOf(')'));
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
      }

      // ── 檢查診所名稱是否誤抓到診斷詞（如「能 性 (原 發 性 )」）───────────────
      if (source && /病|炎|症|癌|瘤|障礙|疾病|感染|損傷|骨折|慢性|急性|原發|多發|未明|高血壓|能\s*性/.test(source)) {
        source = "";
      }

      // ── 如果同一行中找不到日期，嘗試從右側或是歷史緩衝尋找日期 ──────────────
      let finalDate = date;
      if (!finalDate) {
        // 往前找 buffer 中的日期
        for (let j = buffer.length - 1; j >= 0; j--) {
          const dM = buffer[j].match(/(\d{2,4}[\/\.-]\d{1,2}[\/\.-]\d{1,2})/);
          if (dM) {
            finalDate = dM[1];
            break;
          }
        }
      }

      let finalSource = source;
      if (visitType) {
        finalSource = finalSource ? `${finalSource}（${visitType}）` : `（${visitType}）`;
      }

      // NHI Code Dictionary fallback: if generic is empty or garbled, look up by code
      if ((!generic || generic.length < 3 || /^[A-Z\s]{1,4}$/.test(generic) || /EwEE|BEEE|TERF|ENE/i.test(generic)) && typeof NHI_CODE_LOOKUP !== 'undefined' && NHI_CODE_LOOKUP[code]) {
        const entry = NHI_CODE_LOOKUP[code];
        generic = entry.generic || generic;
        if (!brand || brand.length < 3) brand = entry.brand || brand;
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

  // 結尾未成行的純垃圾文字（劑量、頻次、代碼等）不加入輸出，避免產生零碎無效卡片
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

  const codeRe = /^[A-Za-z]{1,3}\d{5,10}[A-Za-z0-9]{0,3}(?:（[^）]+）|\([^)]+\))?$/;
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
  "agomelatine"
];

function parseAndCategorizeCloudPrescription(rawText) {
  rawText = preprocessOcrText(rawText);
  const contraindicated = [];
  const interactive = [];
  const safe = [];
  const unknown = [];

  if (!rawText || !rawText.trim()) {
    return { contraindicated, interactive, safe, unknown };
  }

  // Exact HTA normalization: remove header artifacts and normalize line endings
  let txt = rawText
    .replace(/\s*藥\s*品\s*名\s*稱/g, '')
    .replace(/\r/g, '');

  // Apply HTA brand name replacements (商品名→學名，讓 OCR 讀到商品名也能比對）
  txt = txt
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
  const codeRe = /^[A-Za-z]{1,3}\d{5,10}[A-Za-z0-9]{0,3}(?:（[^）]+）|\([^)]+\))?$/;
  const dateRe = /^\d{2,4}[\/\.-]\d{1,2}[\/\.-]\d{1,2}/;

  // ── 來源預掃描 ─────────────────────────────────────────────────────────────
  // 雲端藥歷每筆藥記錄為 4 行一組：
  //   A: {序號}\t{院所名稱}   → matches /^\d+\t/
  //   B: {門診|住診|藥局}
  //   C: {院所代碼}\t{主診斷}
  //   D: {ATC3}\t...\t{藥品代碼}\t{藥品名稱}\t{就醫日期}\t...   ← 含藥品代碼
  // 我們往回找最近的 A 行來得知來源
  const itemLineRe = /^(\d{1,3})\t(.+)/;   // 序號只有 1-3 位數，院所代碼是 10 位數不會誤判
  const visitTypeRe = /^(門診|住診|藥局)$/;
  const sourceMap = []; // sourceMap[idx] = { source, visitType }
  let lastSource = '';
  let lastVisitType = '';
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i].trim();
    const m = b.match(itemLineRe);
    if (m) { lastSource = m[2].trim(); }
    if (visitTypeRe.test(b)) { lastVisitType = b.trim(); }

    // ── OCR 重組行：第一欄格式為「院所名稱（門診/住診/藥局）」
    const firstCol = b.split('\t')[0];
    const embeddedSrcMatch = firstCol.match(/^(.+?)（(門診|住診|藥局)）$/);
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

    sourceMap[i] = { source: lastSource, visitType: lastVisitType };
  }

  const tempItems = [];

  for (let idx = 0; idx < blocks.length; idx++) {
    const block = blocks[idx];
    const blockLower = block.toLowerCase();
    const cols = block.split('\t').map(c => c.trim());

    let hasCode = false;
    let codeIdx = -1;
    for (let i = 0; i < cols.length; i++) {
      if (codeRe.test(cols[i])) {
        hasCode = true;
        codeIdx = i;
        break;
      }
    }

    let genericName = "";
    let brandName = "";
    if (hasCode) {
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
    }

    // ── 健保代碼智慧補全字典（若 OCR 學名辨識亂碼或缺失時直接校正）─────────────
    const NHI_CODE_LOOKUP = {
      "BC23374100": { generic: "Valsartan", brand: "DIOVAN 160MG", severity: "interactive" },
      "AC60574100": { generic: "Tamsulosin Hcl", brand: "Tamlosin 0.4mg", severity: "interactive" },
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

    if (hasCode) {
      const codeKey = cols[codeIdx].toUpperCase();
      // 若學名缺失，或辨識為亂碼/非標準英文字串，直接以代碼字典標準化
      const isGarbled = !genericName || genericName.length < 3 || /^[A-Za-z]{1,2}$/.test(genericName) || /^[0-9\W]+$/.test(genericName) || /EwEExER|BEEEER|TERFERERE|ENE|stage 3|日 數|ramine Hcl/i.test(genericName);
      if (NHI_CODE_LOOKUP[codeKey] && (isGarbled || !genericName)) {
        genericName = NHI_CODE_LOOKUP[codeKey].generic;
        if (!brandName) brandName = NHI_CODE_LOOKUP[codeKey].brand;
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
        if (y < 1911) {
          y += 1911; // Taiwan ROC Year to Common Era Year
          if (y < 2015 && (y + 100) <= (new Date().getFullYear() + 2)) {
            y += 100;
          }
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
    } else if (hasCode) {
      const codeKey = cols[codeIdx].toUpperCase();
      if (NHI_CODE_LOOKUP[codeKey]) {
        severity = NHI_CODE_LOOKUP[codeKey].severity;
        matchedKw = (genericName || NHI_CODE_LOOKUP[codeKey].generic).toLowerCase();
      }
    }

    let cleanLineScreen = "";
    let cleanLinePrint = "";

    if (severity === "contraindicated" || severity === "interactive") {
      let rawSugg = DICT[matchedKw] || "";
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
        const codeVal = cols[codeIdx] ? cols[codeIdx].toLowerCase() : "";
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
        const codeVal = cols[codeIdx] ? cols[codeIdx].toLowerCase() : "";
        const brandVal = brandName ? brandName.toLowerCase() : "";
        cleanLinePrint = `⛨${sourceVal}\t${genericVal}\t${codeVal}\t${brandVal}`;
      } else {
        cleanLinePrint = `⛨${block.toLowerCase()}`;
      }
    }
    
    const drugKey = matchedKw || genericName || brandName || blockLower;
    const srcInfo = sourceMap[idx] || { source: '', visitType: '' };

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
      source: srcInfo.source,
      visitType: srcInfo.visitType
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

  for (const [key, group] of groups.entries()) {
    if (group.length > 1) {
      // Sort in descending order of dateKey so the latest is first
      group.sort((a, b) => b.dateKey.localeCompare(a.dateKey));
      
      // Mark all of them as duplicate
      group.forEach((item, index) => {
        item.isDuplicate = true;
        // Pre-check only the latest one (index === 0)
        item.selectedForPrint = (index === 0);
      });
    }
  }

  // Push to final lists
  for (const parsedItem of tempItems) {
    if (parsedItem.severity === "contraindicated") {
      contraindicated.push(parsedItem);
    } else if (parsedItem.severity === "interactive") {
      interactive.push(parsedItem);
    } else if (parsedItem.severity === "safe") {
      safe.push(parsedItem);
    } else {
      unknown.push(parsedItem);
    }
  }

  // Filter and sort all unique medication entries for the summary overview
  const allItems = tempItems.filter(it => it.hasCode || it.genericName || it.brandName);
  allItems.sort((a, b) => {
    if (b.dateKey !== a.dateKey) {
      return b.dateKey.localeCompare(a.dateKey);
    }
    return 0;
  });
  
  return {
    contraindicated,
    interactive,
    safe,
    unknown,
    allItems
  };
}