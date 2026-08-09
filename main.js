import { searchInteractions, parseAndCategorizeCloudPrescription } from './parser.js';
import { proh, dont, pote, safe as htaSafe, safe2 as htaSafe2, DICT } from './data.js';

document.addEventListener('DOMContentLoaded', () => {
  // Theme Switching
  const themes = ['light', 'eyecare', 'dark'];
  const themeBtns = {
    light: document.getElementById('theme-light'),
    eyecare: document.getElementById('theme-eyecare'),
    dark: document.getElementById('theme-dark')
  };

  function setTheme(theme) {
    document.body.className = `theme-${theme}`;
    Object.keys(themeBtns).forEach(k => themeBtns[k].classList.remove('active'));
    if (themeBtns[theme]) themeBtns[theme].classList.add('active');
  }

  Object.keys(themeBtns).forEach(k => {
    themeBtns[k].addEventListener('click', () => setTheme(k));
  });

  // Tabs Switching
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      btn.classList.add('active');
      document.getElementById(btn.dataset.target).classList.add('active');
    });
  });

  // Logic Elements
  const searchInput = document.getElementById('search-input');
  const btnPaste = document.getElementById('btn-paste');
  const btnClear = document.getElementById('btn-clear');
  const resultsContainer = document.getElementById('results-container');
  const categoryResults = document.getElementById('category-results');
  const manualTableBody = document.getElementById('manual-table-body');

  btnPaste.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        searchInput.value = text;
        handleSearch(text);
      }
    } catch (e) {
      console.warn("Clipboard access failed:", e);
      alert("無法讀取剪貼簿，請手動貼上。");
    }
  });

  btnClear.addEventListener('click', () => {
    searchInput.value = '';
    resultsContainer.classList.add('hidden');
    categoryResults.innerHTML = '';
    manualTableBody.innerHTML = '';
  });

  searchInput.addEventListener('input', (e) => {
    handleSearch(e.target.value);
  });

  function getDrugStatusInfo(drugObj) {
    let tag = '';
    let text = '';
    let category = '';
    
    if (drugObj.isProh) {
      tag = 'danger'; text = '⛔ 絕對禁忌 (Prohibited)'; category = 'prohibited';
    } else if (drugObj.isDont) {
      tag = 'danger'; text = '❌ 建議避免 (Do Not Use)'; category = 'doNotUse';
    } else if (drugObj.isPote) {
      tag = 'warning'; text = '⚠️ 潛在交互 (Potential)'; category = 'potential';
    } else if (drugObj.isSafe) {
      tag = 'safe'; text = '✅ 安全 (Safe)'; category = 'safe';
    } else {
      tag = 'caution'; text = 'ℹ️ 無明確資料'; category = 'other';
    }
    
    if (drugObj.htaid) {
      if (DICT[drugObj.htaid]) {
        text += ` - ${DICT[drugObj.htaid]}`;
      } else {
        text += ` - ${drugObj.htaid}`;
      }
    }
    
    return { tag, text, category };
  }

  function handleSearch(text) {
    if (!text.trim()) {
      resultsContainer.classList.add('hidden');
      return;
    }
    
    resultsContainer.classList.remove('hidden');
    
    // Parse results
    const results = searchInteractions(text);
    renderManualTable(results);
    
    // Categorize
    const cat = parseAndCategorizeCloudPrescription(text);
    renderCategories(cat);
  }

  function renderManualTable(results) {
    manualTableBody.innerHTML = '';
    
    results.forEach(item => {
      const tr = document.createElement('tr');
      
      const tdDate = document.createElement('td');
      tdDate.textContent = item.visit_date;
      
      const tdRaw = document.createElement('td');
      tdRaw.textContent = item.user_drug_str;
      
      const tdGen = document.createElement('td');
      tdGen.textContent = item.generic;
      
      const tdBrand = document.createElement('td');
      tdBrand.textContent = item.brand;
      
      // We categorize it to get the status tag
      const dummyCat = parseAndCategorizeCloudPrescription(item.generic + " " + item.brand);
      let statusObj = dummyCat.prohibited[0] || dummyCat.doNotUse[0] || dummyCat.potential[0] || dummyCat.safe[0] || dummyCat.other[0];
      
      let badge = document.createElement('span');
      if (statusObj) {
        const info = getDrugStatusInfo(statusObj);
        badge.className = `tag ${info.tag}`;
        badge.textContent = info.text;
      } else {
        badge.className = 'tag caution';
        badge.textContent = 'ℹ️ 無法辨識';
      }
      
      const tdStatus = document.createElement('td');
      tdStatus.appendChild(badge);
      
      tr.appendChild(tdDate);
      tr.appendChild(tdRaw);
      tr.appendChild(tdGen);
      tr.appendChild(tdBrand);
      tr.appendChild(tdStatus);
      
      manualTableBody.appendChild(tr);
    });
  }

  function renderCategories(cat) {
    categoryResults.innerHTML = '';
    
    const sections = [
      { key: 'prohibited', title: '⛔ 絕對禁忌 (Prohibited) - 絕不可與 Paxlovid 併用', class: 'danger' },
      { key: 'doNotUse', title: '❌ 建議避免 (Do Not Use) - 避免與 Paxlovid 併用', class: 'danger' },
      { key: 'potential', title: '⚠️ 潛在交互作用 (Potential Interaction) - 需調整劑量或監測', class: 'warning' },
      { key: 'safe', title: '✅ 安全/無顯著交互作用 (Safe)', class: 'safe' },
      { key: 'other', title: 'ℹ️ 無明確禁忌之藥品 (請參閱仿單)', class: 'caution' },
      { key: 'unmatched', title: '❓ 無法辨識之項目 (非藥品或查無紀錄)', class: '' }
    ];

    sections.forEach(sec => {
      const items = cat[sec.key];
      if (!items || items.length === 0) return;

      const secDiv = document.createElement('div');
      secDiv.className = 'category-section';
      
      const h3 = document.createElement('div');
      h3.className = `category-title ${sec.class}`;
      h3.textContent = `${sec.title} (${items.length})`;
      secDiv.appendChild(h3);

      items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'drug-card';
        
        let dateInfo = item.visitDateRaw ? `[${item.visitDateRaw}] ` : '';
        let drugName = item.original_text || item.text || item.raw;
        
        const info = getDrugStatusInfo(item);
        
        card.innerHTML = `
          <div>
            <div class="drug-name">${dateInfo}${drugName}</div>
            ${item.generic ? `<div class="drug-date">${item.generic} / ${item.brand}</div>` : ''}
          </div>
          <div>
             ${sec.key !== 'unmatched' ? `<span class="tag ${info.tag}">${info.text}</span>` : `<span class="tag caution">需手動確認</span>`}
          </div>
        `;
        secDiv.appendChild(card);
      });

      categoryResults.appendChild(secDiv);
    });
  }
});
