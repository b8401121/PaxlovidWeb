document.addEventListener('DOMContentLoaded', () => {
  // ─── 全域狀態 ─────────────────────────────────────────────────────────────
  let currentCat = null; // { contraindicated:[], interactive:[], safe:[], unknown:[] }

  // ─── Theme Switching ───────────────────────────────────────────────────────
  const themeBtns = {
    light:   document.getElementById('theme-light'),
    eyecare: document.getElementById('theme-eyecare'),
    dark:    document.getElementById('theme-dark')
  };
  function setTheme(t) {
    document.body.className = `theme-${t}`;
    Object.keys(themeBtns).forEach(k => themeBtns[k].classList.remove('active'));
    if (themeBtns[t]) themeBtns[t].classList.add('active');
  }
  Object.keys(themeBtns).forEach(k => themeBtns[k].addEventListener('click', () => setTheme(k)));

  // ─── Tab Switching ──────────────────────────────────────────────────────────
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.target).classList.add('active');
    });
  });

  // ─── DOM refs ───────────────────────────────────────────────────────────────
  const searchInput      = document.getElementById('search-input');
  const btnPaste         = document.getElementById('btn-paste');
  const btnClear         = document.getElementById('btn-clear');
  const btnPrint         = document.getElementById('btn-print');
  const btnCopyText      = document.getElementById('btn-copy-text');
  const resultsContainer = document.getElementById('results-container');
  const categoryResults  = document.getElementById('category-results');
  const manualTableBody  = document.getElementById('manual-table-body');

  // ─── Paste ──────────────────────────────────────────────────────────────────
  btnPaste.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) { searchInput.value = text; handleSearch(text); return; }
    } catch (e) { console.warn('Clipboard API failed:', e); }
    if (searchInput.value.trim()) { handleSearch(searchInput.value); }
    else { alert('您的瀏覽器阻擋剪貼簿權限。\n請在上方框框中直接按 Ctrl+V 貼上藥歷，系統會自動分析！'); }
  });

  // ─── Clear ─────────────────────────────────────────────────────────────────
  btnClear.addEventListener('click', () => {
    searchInput.value = '';
    resultsContainer.classList.add('hidden');
    categoryResults.innerHTML = '';
    manualTableBody.innerHTML = '';
    currentCat = null;
    btnPrint.disabled = true;
    btnCopyText.disabled = true;
  });

  // ─── Live type ─────────────────────────────────────────────────────────────
  searchInput.addEventListener('input', e => handleSearch(e.target.value));

  // ─── Print ─────────────────────────────────────────────────────────────────
  btnPrint.addEventListener('click', () => {
    if (!currentCat) return;
    const html = generatePrintHtml(currentCat);
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:none;';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow.document;
    doc.open(); doc.write(html); doc.close();
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 300);
  });

  // ─── Copy text ─────────────────────────────────────────────────────────────
  btnCopyText.addEventListener('click', () => {
    if (!currentCat) return;
    const text = generateTextReport(currentCat);
    navigator.clipboard.writeText(text).then(() => {
      btnCopyText.textContent = '✅ 已複製！';
      setTimeout(() => { btnCopyText.textContent = '📋 複製文字報告'; }, 2000);
    });
  });

  // ─── Main search ───────────────────────────────────────────────────────────
  function handleSearch(text) {
    if (!text || !text.trim()) {
      resultsContainer.classList.add('hidden');
      currentCat = null;
      btnPrint.disabled = true;
      btnCopyText.disabled = true;
      return;
    }
    resultsContainer.classList.remove('hidden');

    currentCat = parseAndCategorizeCloudPrescription(text);
    renderCategories(currentCat);
    renderManualTable(searchInteractions(text));

    const hasWarnings = currentCat.contraindicated.length + currentCat.interactive.length > 0;
    btnPrint.disabled = !hasWarnings;
    btnCopyText.disabled = !hasWarnings;
  }

  // ─── Severity ──────────────────────────────────────────────────────────────
  function getSeverityInfo(severity) {
    if (severity === 'contraindicated') return { tag: 'danger',  label: '⛔ 禁忌' };
    if (severity === 'interactive')     return { tag: 'warning', label: '⚠️ 潛在交互' };
    if (severity === 'safe')            return { tag: 'safe',    label: '✅ 安全' };
    return                                     { tag: 'caution', label: 'ℹ️ 未分類' };
  }

  // ─── Categorised render ─────────────────────────────────────────────────────
  function renderCategories(cat) {
    categoryResults.innerHTML = '';

    // 只顯示前三類，略去 unknown
    const sections = [
      { key: 'contraindicated', title: '⛔ 禁忌 / 建議避免 — 不可與 Paxlovid 併用',      cssClass: 'danger'  },
      { key: 'interactive',     title: '⚠️ 潛在交互作用 — 需調整劑量或加強監測',          cssClass: 'warning' },
      { key: 'safe',            title: '✅ 安全 / 無顯著交互作用',                         cssClass: 'safe'    }
    ];

    let anyResult = false;

    sections.forEach(sec => {
      const items = cat[sec.key] || [];
      if (items.length === 0) return;
      anyResult = true;

      const secDiv = document.createElement('div');
      secDiv.className = 'category-section';

      const header = document.createElement('div');
      header.className = `category-title ${sec.cssClass}`;
      header.textContent = `${sec.title} (${items.length})`;
      secDiv.appendChild(header);

      items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'drug-card';

        const dateStr    = item.visitDate    ? `[${item.visitDate}] `  : '';
        const genericStr = item.genericName  ? item.genericName         : '';
        const brandStr   = item.brandName    ? item.brandName           : '';
        const headline   = genericStr || brandStr || item.originalLine  || '';
        const { tag, label } = getSeverityInfo(item.severity);

        // DICT suggestion
        let suggText = '';
        if ((item.severity === 'contraindicated' || item.severity === 'interactive') && item.drugKey) {
          let raw = (DICT && DICT[item.drugKey]) || '';
          if (raw.startsWith('{') && raw.includes('}')) raw = raw.substring(raw.indexOf('}') + 1).trim();
          if (raw) suggText = `<div class="drug-sugg">📋 ${raw}</div>`;
        }

        // Checkbox (只勾最新，重複的藥不勾)
        const cbId = `cb_${item.id}`;
        const checked = item.selectedForPrint ? 'checked' : '';

        card.innerHTML = `
          <div style="flex:1; min-width:0">
            <div class="drug-name">${dateStr}${headline}</div>
            ${genericStr && brandStr ? `<div class="drug-date">${genericStr} / ${brandStr}</div>` : ''}
            ${item.isDuplicate ? `<div class="drug-date" style="color:#f59e0b">⚠️ 重複品項（已自動選取最新一筆）</div>` : ''}
            ${suggText}
          </div>
          <div style="display:flex;align-items:center;gap:10px;margin-left:12px;white-space:nowrap">
            <span class="tag ${tag}">${label}</span>
            <label style="display:flex;align-items:center;gap:4px;cursor:pointer;font-size:0.85rem" title="勾選後列入報表">
              <input type="checkbox" id="${cbId}" data-id="${item.id}" data-severity="${item.severity}" ${checked}>
              列印
            </label>
          </div>
        `;
        secDiv.appendChild(card);
      });

      categoryResults.appendChild(secDiv);
    });

    if (!anyResult) {
      categoryResults.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:24px">查無符合藥品交互作用紀錄，所有藥物均無已知禁忌 ✅</p>';
    }

    // Bind checkboxes
    categoryResults.querySelectorAll('input[type=checkbox][data-id]').forEach(cb => {
      cb.addEventListener('change', () => {
        const id  = cb.dataset.id;
        const sev = cb.dataset.severity;
        const list = currentCat[sev] || [];
        const item = list.find(x => x.id === id);
        if (item) item.selectedForPrint = cb.checked;
        updatePrintBtn();
      });
    });
  }

  function updatePrintBtn() {
    if (!currentCat) { btnPrint.disabled = true; return; }
    const count = (currentCat.contraindicated || []).filter(x => x.selectedForPrint).length
                + (currentCat.interactive     || []).filter(x => x.selectedForPrint).length;
    btnPrint.disabled = count === 0;
  }

  // ─── Manual table ───────────────────────────────────────────────────────────
  function renderManualTable(results) {
    manualTableBody.innerHTML = '';
    if (!results || results.length === 0) {
      manualTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-secondary)">查無符合記錄</td></tr>';
      return;
    }
    results.forEach(item => {
      const tr = document.createElement('tr');
      const kw = (item.generic + ' ' + item.brand).toLowerCase();
      let severityLabel = 'ℹ️ 未分類', tagClass = 'caution';
      if (proh && proh.some(p => kw.includes(p))) {
        severityLabel = '⛔ 禁忌'; tagClass = 'danger';
      } else if (dont && dont.some(d => kw.includes(d))) {
        severityLabel = '❌ 建議避免'; tagClass = 'danger';
      } else if (pote && pote.some(p => kw.includes(p))) {
        severityLabel = '⚠️ 潛在交互'; tagClass = 'warning';
      } else if ((safe && safe.some(s => kw.includes(s))) || (safe2 && safe2.some(s => kw.includes(s)))) {
        severityLabel = '✅ 安全'; tagClass = 'safe';
      }
      tr.innerHTML = `
        <td>${item.visit_date || ''}</td>
        <td>${item.user_drug_str || ''}</td>
        <td>${item.generic || ''}</td>
        <td>${item.brand || ''}</td>
        <td><span class="tag ${tagClass}">${severityLabel}</span></td>
      `;
      manualTableBody.appendChild(tr);
    });
  }

  // ─── Text report ────────────────────────────────────────────────────────────
  function generateTextReport(cat) {
    let out = 'Paxlovid不可併用的藥(需停藥8天):\n';
    cat.contraindicated.forEach(i => { out += i.cleanLineScreen + '\n'; });
    out += '\n--------------------------------------------------------------------------------\n';
    out += 'Paxlovid有交互作用的藥(需減量或停藥8天):\n';
    cat.interactive.forEach(i => { out += i.cleanLineScreen + '\n'; });
    out += '\n--------------------------------------------------------------------------------\n\n';
    out += '吃Paxlovid時無需停藥:\n';
    cat.safe.forEach(i => { out += i.cleanLineScreen + '\n'; });
    out += '\n\nPaxlovid(口服抗病毒藥)只吃5天但藥效達8天，故有交互作用的西藥8天內減量或暫停，清冠一號也需暫停5天（以免導致腹瀉）。不可磨粉或泡水。\n';
    out += '本單張並沒比對自費藥和『最近1個月內尚未上傳到健保雲端』的健保新藥。\n\n';
    out += '■■■◤以下藥物停8天◢■■■\n\n';
    cat.contraindicated.filter(i => i.selectedForPrint).forEach(i => { out += i.cleanLinePrint + '\n'; });
    out += '\n\n■■■◤以下藥物需［減量或停］8天◢■■■\n\n';
    cat.interactive.filter(i => i.selectedForPrint).forEach(i => { out += i.cleanLinePrint + '\n'; });
    return out;
  }

  // ─── Print HTML ─────────────────────────────────────────────────────────────
  function parsePrintLine(item) {
    let line = (item.cleanLinePrint || '').replace(/^⛨/, '');
    const parts = line.split('\t').map(p => p.trim());
    if (parts.length >= 4) {
      const source = parts[0], code = parts[1], name = parts[2];
      let usage = parts[3], suggestion = '';
      const sIdx = usage.indexOf('【☗☗');
      if (sIdx !== -1) {
        const eIdx = usage.indexOf('】', sIdx);
        suggestion = eIdx !== -1 ? usage.substring(sIdx + 3, eIdx).trim() : usage.substring(sIdx + 3).trim();
        usage = usage.substring(0, sIdx).trim();
      }
      return { source, code, name, usage, suggestion };
    }
    return { source: '', code: '', name: line, usage: '', suggestion: '' };
  }

  function renderTableRows(items, isDanger) {
    const selectedItems = items.filter(x => x.selectedForPrint);
    if (selectedItems.length === 0) {
      return `<tr><td colspan="2" class="empty-message">🟢 未發現此類交互作用藥物之品項。</td></tr>`;
    }
    const seen = new Set();
    const unique = [];
    for (const item of selectedItems) {
      const d = parsePrintLine(item);
      const key = (d.usage || d.code || d.name || '').trim().toLowerCase();
      if (!seen.has(key)) { seen.add(key); unique.push(item); }
    }
    return unique.map(item => {
      const d = parsePrintLine(item);
      const badgeClass = isDanger ? 'badge-danger' : 'badge-warning';
      const badgeText  = isDanger ? '絕對不可併用' : '需調整/減量';
      const icon       = isDanger ? '🔴' : '🟡';
      const displayName = d.usage || d.code || d.name || '未知名稱';
      const subDetails = (d.code || d.name) && d.usage
        ? `<div style="font-size:8.5pt;color:#475569;margin-top:2px">學名：${d.code||'-'} / 代碼：${d.name||'-'}</div>` : '';
      return `
        <tr>
          <td>
            <div style="font-weight:bold;color:#0f172a">${displayName}</div>
            ${subDetails}
          </td>
          <td>
            <div class="suggestion-text">${icon} ${d.suggestion}</div>
            <div style="margin-top:4px">
              <span class="badge ${badgeClass}">${badgeText}</span>
              <span style="font-size:8pt;color:#64748b;margin-left:6px">停藥/減量 8 天</span>
            </div>
          </td>
        </tr>`;
    }).join('');
  }

  function generatePrintHtml(cat) {
    const printDate = new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const contraRows = renderTableRows(cat.contraindicated, true);
    const interRows  = renderTableRows(cat.interactive, false);

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Paxlovid 用藥配合衛教單張</title>
  <style>
    @media print {
      body { margin:0; padding:5mm; font-size:10pt; background:#fff; }
      .counseling-box { background:#fffbeb!important; border-left:5px solid #d97706!important; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
      .emergency-box { background:#fef2f2!important; border-left:5px solid #dc2626!important; color:#991b1b!important; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
      .med-table th { background:#f1f5f9!important; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
      .badge-danger { background:#fef2f2!important; color:#dc2626!important; border:1px solid #fca5a5!important; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
      .badge-warning { background:#fffbeb!important; color:#d97706!important; border:1px solid #fcd34d!important; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
      tr { page-break-inside:avoid; }
    }
    @page { size:A4; margin:15mm 12mm; }
    body { font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Microsoft JhengHei",Arial,sans-serif; color:#1e293b; line-height:1.5; margin:0; padding:10px; }
    .header-container { border-bottom:2.5px solid #0f172a; padding-bottom:10px; margin-bottom:15px; display:flex; justify-content:space-between; align-items:flex-end; }
    .main-title { font-size:15pt; font-weight:800; color:#0f172a; margin:0; }
    .sub-title { font-size:9pt; color:#475569; margin:2px 0 0 0; }
    .hospital-brand { font-size:10.5pt; font-weight:700; color:#0284c7; text-align:right; line-height:1.3; }
    .info-grid { width:100%; border-collapse:collapse; margin-bottom:15px; background:#f8fafc; border:1px solid #e2e8f0; }
    .info-grid td { padding:8px 12px; font-size:9.5pt; border:1px solid #e2e8f0; color:#334155; }
    .safety-container { display:flex; gap:15px; margin-bottom:20px; }
    .counseling-box { flex:1; border-left:5px solid #d97706; background:#fffbeb; color:#92400e; padding:12px 15px; border-radius:0 6px 6px 0; }
    .counseling-title { font-size:11pt; font-weight:800; margin:0 0 6px 0; }
    .counseling-list { margin:0; padding-left:20px; font-size:9.5pt; line-height:1.6; }
    .emergency-box { flex:1; border-left:5px solid #dc2626; background:#fef2f2; color:#991b1b; padding:12px 15px; border-radius:0 6px 6px 0; }
    .emergency-title { font-size:11pt; font-weight:800; color:#dc2626; margin:0 0 6px 0; }
    .emergency-list { margin:0; padding-left:20px; font-size:9.5pt; line-height:1.6; }
    .section-title { font-size:11pt; font-weight:800; margin:20px 0 8px 0; padding-bottom:4px; border-bottom:2px solid #e2e8f0; }
    .section-title.danger { color:#dc2626; border-bottom-color:#fecaca; }
    .section-title.warning { color:#d97706; border-bottom-color:#fef3c7; }
    .med-table { width:100%; table-layout:fixed; border-collapse:collapse; margin-bottom:15px; font-size:9pt; }
    .med-table th { background:#f1f5f9; color:#334155; font-weight:700; padding:6px 10px; border:1px solid #cbd5e1; }
    .med-table td { padding:8px 10px; border:1px solid #e2e8f0; vertical-align:top; line-height:1.45; word-break:break-all; }
    .med-table tr:nth-child(even) { background:#f8fafc; }
    .suggestion-text { font-weight:700; color:#b91c1c; font-size:9pt; }
    .med-table.interactive .suggestion-text { color:#b45309; }
    .badge { display:inline-block; padding:1px 5px; font-size:7.5pt; font-weight:700; border-radius:4px; white-space:nowrap; }
    .badge-danger { background:#fef2f2; color:#dc2626; border:1px solid #fca5a5; }
    .badge-warning { background:#fffbeb; color:#d97706; border:1px solid #fcd34d; }
    .empty-message { padding:12px; text-align:center; color:#64748b; background:#f8fafc; border:1px dashed #cbd5e1; font-size:9pt; }
    .footer { margin-top:30px; font-size:8pt; color:#64748b; border-top:1px solid #e2e8f0; padding-top:10px; text-align:center; line-height:1.5; }
  </style>
</head>
<body>
  <div class="header-container">
    <div style="display:flex;align-items:center;gap:12px">
      <div>
        <h1 class="main-title">吳鎮宇耳鼻喉科診所 用藥安全指引報告</h1>
        <p class="sub-title">Paxlovid (口服抗病毒藥) 雲端藥歷交互作用比對單張</p>
      </div>
    </div>
    <div class="hospital-brand">
      <strong>吳鎮宇耳鼻喉科診所</strong><br>
      <span style="font-size:8pt;color:#64748b;font-weight:normal">改版日期: 2026-06-09</span>
    </div>
  </div>

  <table class="info-grid">
    <tr>
      <td style="width:25%"><strong>病人姓名:</strong> ____________________</td>
      <td style="width:25%"><strong>病歷號碼:</strong> ____________________</td>
      <td style="width:25%"><strong>列印日期:</strong> ${printDate}</td>
      <td style="width:25%"><strong>處方醫師/藥師:</strong> ____________________</td>
    </tr>
  </table>

  <div class="safety-container">
    <div class="counseling-box">
      <div class="counseling-title">🔑 Paxlovid 核心用藥安全須知</div>
      <ul class="counseling-list">
        <li><strong>只吃 5 天，影響 8 天！</strong> 藥效在體內影響持續長達 <strong>8 天</strong>。</li>
        <li><strong>配合調整用藥：</strong> 下表交互作用藥物，須於服用首日起停藥或減量至少 <strong>8 天</strong>。</li>
        <li><strong>中藥禁忌：</strong> 併用「清冠一號」<strong>必須暫停 5 天</strong>（以免腹瀉或藥效衝突）。</li>
        <li><strong>服藥方式：</strong> <strong>絕對不可磨粉、泡水、嚼碎</strong>，必須整顆配水吞服。</li>
        <li><strong>比對限制：</strong> 僅限健保雲端已上傳藥歷，不含自費及近期尚未上傳之新藥。</li>
      </ul>
    </div>
    <div class="emergency-box">
      <div class="emergency-title">🚨 確診者重症警訊 (若有以下症狀立即就醫)</div>
      <ul class="emergency-list">
        <li><strong>呼吸困難、喘：</strong> 呼吸急促或吸不到氣。</li>
        <li><strong>持續胸痛或胸悶：</strong> 胸口壓迫感或持續性疼痛。</li>
        <li><strong>意識不清：</strong> 意識混亂、言語不清或難以喚醒。</li>
        <li><strong>皮膚/嘴唇發青：</strong> 缺氧造成膚色發紫或發白。</li>
        <li><strong>無法進食或服藥：</strong> 生理機能受阻。</li>
        <li><strong>尿量顯著減少：</strong> 過去 24 小時尿量顯著減少。</li>
      </ul>
    </div>
  </div>

  <div class="section-title danger">🔴 第一類：絕對不可併用之藥物 (Contraindicated) - 須停藥 8 天</div>
  <table class="med-table contraindicated">
    <colgroup><col style="width:35%"><col style="width:65%"></colgroup>
    <thead><tr><th>藥品名稱 (學名 / 商品名)</th><th>交互作用警語與臨床處置建議</th></tr></thead>
    <tbody>${contraRows}</tbody>
  </table>

  <div class="section-title warning">🟡 第二類：需調整/減量之交互作用藥物 (Interactive) - 須密切監測或暫停 8 天</div>
  <table class="med-table interactive">
    <colgroup><col style="width:35%"><col style="width:65%"></colgroup>
    <thead><tr><th>藥品名稱 (學名 / 商品名)</th><th>交互作用警語與臨床處置建議</th></tr></thead>
    <tbody>${interRows}</tbody>
  </table>

  <div class="footer">
    ※ 本單張由「吳鎮宇耳鼻喉科診所 Paxlovid 雲端藥歷比對系統」輔助生成。用藥調整請務必遵照臨床醫師或藥師之專業指示。<br>
    © 臨床藥學與用藥安全查核單張 A4 標準格式
  </div>
</body>
</html>`;
  }
});
