document.addEventListener('DOMContentLoaded', () => {
  // ─── Theme Switching ───────────────────────────────────────────────────────
  const themeBtns = {
    light:    document.getElementById('theme-light'),
    eyecare:  document.getElementById('theme-eyecare'),
    dark:     document.getElementById('theme-dark')
  };

  function setTheme(theme) {
    document.body.className = `theme-${theme}`;
    Object.keys(themeBtns).forEach(k => themeBtns[k].classList.remove('active'));
    if (themeBtns[theme]) themeBtns[theme].classList.add('active');
  }

  Object.keys(themeBtns).forEach(k => {
    themeBtns[k].addEventListener('click', () => setTheme(k));
  });

  // ─── Tab Switching ──────────────────────────────────────────────────────────
  const tabBtns     = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.target).classList.add('active');
    });
  });

  // ─── DOM refs ───────────────────────────────────────────────────────────────
  const searchInput      = document.getElementById('search-input');
  const btnPaste         = document.getElementById('btn-paste');
  const btnClear         = document.getElementById('btn-clear');
  const resultsContainer = document.getElementById('results-container');
  const categoryResults  = document.getElementById('category-results');
  const manualTableBody  = document.getElementById('manual-table-body');

  // ─── Paste button ───────────────────────────────────────────────────────────
  btnPaste.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        searchInput.value = text;
        handleSearch(text);
        return;
      }
    } catch (e) {
      console.warn('Clipboard API failed:', e);
    }
    // Fallback: if text already in box, analyse it
    if (searchInput.value.trim()) {
      handleSearch(searchInput.value);
    } else {
      alert('您的瀏覽器阻擋了自動讀取剪貼簿的權限。\n\n請在上方框框中直接按 Ctrl+V 貼上藥歷文字，系統會自動分析！');
    }
  });

  // ─── Clear button ───────────────────────────────────────────────────────────
  btnClear.addEventListener('click', () => {
    searchInput.value = '';
    resultsContainer.classList.add('hidden');
    categoryResults.innerHTML  = '';
    manualTableBody.innerHTML  = '';
  });

  // ─── Live-type search ───────────────────────────────────────────────────────
  searchInput.addEventListener('input', e => handleSearch(e.target.value));

  // ─── Severity helpers ───────────────────────────────────────────────────────
  // parser.js uses item.severity = "contraindicated" | "interactive" | "safe" | "unknown"
  function getSeverityInfo(severity) {
    switch (severity) {
      case 'contraindicated':
        return { tag: 'danger',  label: '⛔ 禁忌' };
      case 'interactive':
        return { tag: 'warning', label: '⚠️ 潛在交互' };
      case 'safe':
        return { tag: 'safe',   label: '✅ 安全' };
      default:
        return { tag: 'caution', label: 'ℹ️ 未分類' };
    }
  }

  // ─── Main search handler ────────────────────────────────────────────────────
  function handleSearch(text) {
    if (!text || !text.trim()) {
      resultsContainer.classList.add('hidden');
      return;
    }
    resultsContainer.classList.remove('hidden');

    // 1) Categorised view (tab-auto)
    const cat = parseAndCategorizeCloudPrescription(text);
    renderCategories(cat);

    // 2) Raw interaction list (tab-manual)
    const results = searchInteractions(text);
    renderManualTable(results);
  }

  // ─── Categorised render ─────────────────────────────────────────────────────
  // parser.js returns { contraindicated:[], interactive:[], safe:[], unknown:[] }
  function renderCategories(cat) {
    categoryResults.innerHTML = '';

    const sections = [
      { key: 'contraindicated', title: '⛔ 禁忌 / 建議避免 — 不可與 Paxlovid 併用',           cssClass: 'danger'  },
      { key: 'interactive',     title: '⚠️ 潛在交互作用 — 需調整劑量或加強監測',             cssClass: 'warning' },
      { key: 'safe',            title: '✅ 安全 / 無顯著交互作用',                            cssClass: 'safe'    },
      { key: 'unknown',         title: 'ℹ️ 無法辨識或無明確禁忌 (請參閱仿單)',                cssClass: 'caution' }
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

        const dateStr    = item.visitDate   ? `[${item.visitDate}] ` : '';
        const genericStr = item.genericName ? item.genericName       : '';
        const brandStr   = item.brandName   ? item.brandName         : '';
        const headline   = genericStr || brandStr || item.originalLine || '';
        const { tag, label } = getSeverityInfo(item.severity);

        // Build suggestion text from DICT if available
        let suggText = '';
        if (item.severity === 'contraindicated' || item.severity === 'interactive') {
          const kw = item.drugKey || '';
          if (DICT && DICT[kw]) {
            let raw = DICT[kw];
            if (raw.startsWith('{') && raw.includes('}')) {
              raw = raw.substring(raw.indexOf('}') + 1).trim();
            }
            if (raw) suggText = `<div class="drug-sugg">📋 ${raw}</div>`;
          }
        }

        card.innerHTML = `
          <div style="flex:1; min-width:0">
            <div class="drug-name">${dateStr}${headline}</div>
            ${genericStr && brandStr ? `<div class="drug-date">${genericStr} / ${brandStr}</div>` : ''}
            ${suggText}
          </div>
          <div style="margin-left:12px; white-space:nowrap">
            <span class="tag ${tag}">${label}</span>
          </div>
        `;
        secDiv.appendChild(card);
      });

      categoryResults.appendChild(secDiv);
    });

    if (!anyResult) {
      categoryResults.innerHTML = '<p style="color:var(--text-secondary); text-align:center; padding:24px">查無符合藥品交互作用紀錄</p>';
    }
  }

  // ─── Manual table render ────────────────────────────────────────────────────
  function renderManualTable(results) {
    manualTableBody.innerHTML = '';
    if (!results || results.length === 0) {
      manualTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-secondary)">查無符合記錄</td></tr>';
      return;
    }

    results.forEach(item => {
      const tr = document.createElement('tr');

      const tdDate  = document.createElement('td');
      tdDate.textContent = item.visit_date || '';

      const tdRaw   = document.createElement('td');
      tdRaw.textContent  = item.user_drug_str || '';

      const tdGen   = document.createElement('td');
      tdGen.textContent  = item.generic || '';

      const tdBrand = document.createElement('td');
      tdBrand.textContent = item.brand || '';

      // The searchInteractions result doesn't carry severity directly;
      // derive it from whether keyword appears in HTA lists
      const kw = (item.generic + ' ' + item.brand).toLowerCase();
      let severityLabel = 'ℹ️ 未分類';
      let tagClass      = 'caution';
      if (proh && proh.some(p => kw.includes(p))) {
        severityLabel = '⛔ 禁忌'; tagClass = 'danger';
      } else if (dont && dont.some(d => kw.includes(d))) {
        severityLabel = '❌ 建議避免'; tagClass = 'danger';
      } else if (pote && pote.some(p => kw.includes(p))) {
        severityLabel = '⚠️ 潛在交互'; tagClass = 'warning';
      } else if ((safe && safe.some(s => kw.includes(s))) ||
                 (safe2 && safe2.some(s => kw.includes(s)))) {
        severityLabel = '✅ 安全'; tagClass = 'safe';
      }

      const tdStatus = document.createElement('td');
      tdStatus.innerHTML = `<span class="tag ${tagClass}">${severityLabel}</span>`;

      tr.appendChild(tdDate);
      tr.appendChild(tdRaw);
      tr.appendChild(tdGen);
      tr.appendChild(tdBrand);
      tr.appendChild(tdStatus);
      manualTableBody.appendChild(tr);
    });
  }
});
