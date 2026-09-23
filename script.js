let currentTabIndex = 0;
const searchInput = document.getElementById('searchInput');
const clearBtn = document.getElementById('clearBtn');

// XSS防止用エスケープ関数
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>"']/g, function(m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m];
  });
}

// 🌟 クリップボード管理（別プロファイル間でも保持可能）
const setAppClipboard = (type, data) => {
  localStorage.setItem('launch_clipboard', JSON.stringify({ type, data }));
};
const getAppClipboard = () => {
  try {
    return JSON.parse(localStorage.getItem('launch_clipboard'));
  } catch (e) {
    return null;
  }
};

const toggleClearBtn = () => {
  const hasQuery = searchInput.value.trim().length > 0;
  clearBtn.style.display = hasQuery ? 'flex' : 'none';
  if (hasQuery) document.body.classList.add('has-query');
  else document.body.classList.remove('has-query');
};
searchInput.addEventListener('input', toggleClearBtn); 
clearBtn.addEventListener('click', () => { searchInput.value = ''; toggleClearBtn(); searchInput.focus(); });

const applySetting = (id, key, prefix, defaultVal) => {
  const el = document.getElementById(id);
  let val = localStorage.getItem(key) || defaultVal;
  el.value = val;
  const applyCls = () => {
    Array.from(el.options).forEach(opt => document.body.classList.remove(`${prefix}-${opt.value}`));
    document.body.classList.add(`${prefix}-${el.value}`);
  };
  applyCls();
  el.addEventListener('change', (e) => { localStorage.setItem(key, e.target.value); applyCls(); });
};

applySetting('settingLayoutMode', 'layout_mode', 'layout', 'single');
applySetting('settingFabSize', 'fab_size', 'fab-size', 'medium');
applySetting('settingGridSize', 'grid_size', 'grid-size', '140');

const settingLinkOpenMode = document.getElementById('settingLinkOpenMode');
if (localStorage.getItem('link_open_mode')) {
  settingLinkOpenMode.value = localStorage.getItem('link_open_mode');
} else {
  settingLinkOpenMode.value = 'blank';
  localStorage.setItem('link_open_mode', 'blank');
}
settingLinkOpenMode.addEventListener('change', (e) => localStorage.setItem('link_open_mode', e.target.value));

const settingDefaultSearchEngine = document.getElementById('settingDefaultSearchEngine');
if (localStorage.getItem('default_search_engine')) {
  settingDefaultSearchEngine.value = localStorage.getItem('default_search_engine');
} else {
  settingDefaultSearchEngine.value = 'google';
  localStorage.setItem('default_search_engine', 'google');
}
settingDefaultSearchEngine.addEventListener('change', (e) => localStorage.setItem('default_search_engine', e.target.value));

function openLink(url) {
  if(!url) return;
  const mode = settingLinkOpenMode.value;
  if (mode === 'self') window.location.href = url;
  else window.open(url, '_blank', 'noopener,noreferrer');
}

let isEditMode = localStorage.getItem('edit_mode') !== 'false';
const navEditToggle = document.getElementById('nav-edit-toggle');
const updateEditMode = () => {
  if (isEditMode) {
    document.body.classList.remove('read-only-mode');
    document.getElementById('icon-edit-on').style.display = 'block'; document.getElementById('icon-edit-off').style.display = 'none';
    document.getElementById('label-edit-toggle').textContent = '編集：オン'; navEditToggle.classList.add('active');
  } else {
    document.body.classList.add('read-only-mode');
    document.getElementById('icon-edit-on').style.display = 'none'; document.getElementById('icon-edit-off').style.display = 'block';
    document.getElementById('label-edit-toggle').textContent = '編集：オフ'; navEditToggle.classList.remove('active');
  }
  localStorage.setItem('edit_mode', isEditMode);
};
updateEditMode();
navEditToggle.addEventListener('click', () => { isEditMode = !isEditMode; updateEditMode(); });

const openModalUi = (id) => document.getElementById(id).classList.add('show');
const closeModalUi = (id) => document.getElementById(id).classList.remove('show');
document.querySelectorAll('.glass-modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => { 
    if(e.target === overlay && !overlay.classList.contains('edit-modal-overlay') && !overlay.classList.contains('confirm-modal-overlay')) overlay.classList.remove('show'); 
  });
});

document.getElementById('nav-profiles').addEventListener('click', () => openModalUi('profilesModal'));
document.getElementById('nav-settings').addEventListener('click', () => openModalUi('settingsModal'));

let confirmCallback = null;
const confirmModal = document.getElementById('confirmModal');
function showConfirm(title, message, isDanger, callback, isAlert = false) {
  document.getElementById('confirmTitle').textContent = title;
  document.getElementById('confirmMessage').textContent = message;
  const okBtn = document.getElementById('confirmOkBtn');
  const cancelBtn = document.getElementById('confirmCancelBtn');
  
  if (isAlert) {
    cancelBtn.style.display = 'none';
    okBtn.style.background = 'var(--app-blue)';
    okBtn.textContent = 'OK';
  } else {
    cancelBtn.style.display = 'block';
    if (isDanger) {
      okBtn.style.background = '#ff3b30';
      okBtn.textContent = '削除';
    } else {
      okBtn.style.background = 'var(--app-blue)';
      okBtn.textContent = 'OK';
    }
  }
  confirmCallback = callback;
  confirmModal.classList.add('show');
}
document.getElementById('confirmCancelBtn').addEventListener('click', () => confirmModal.classList.remove('show'));
document.getElementById('confirmOkBtn').addEventListener('click', () => {
  if(confirmCallback) confirmCallback();
  confirmModal.classList.remove('show');
});

const modeSwitchBtn = document.getElementById('modeSwitchBtn');
modeSwitchBtn.addEventListener('click', () => { 
  document.body.classList.toggle('mode-search');
  if (document.body.classList.contains('mode-search')) { toggleClearBtn(); setTimeout(() => searchInput.focus(), 100); } 
  else { document.body.classList.remove('has-query'); searchInput.blur(); }
});

let modalCallback = null;
const customModal = document.getElementById('customModal');
function openEditModal(title, v1, v2, v3, v4, enc, modeType, callback, onPresetClick) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalInput1').value = v1 || ""; document.getElementById('modalInput2').value = v2 || ""; 
  document.getElementById('modalInput3').value = v3 || ""; document.getElementById('modalInput4').value = v4 || "";
  document.getElementById('modalInputEncoding').value = enc || "UTF-8";
  
  document.getElementById('modalInput1').style.display = 'block';
  if (modeType === 'item') {
    document.getElementById('modalInput1').placeholder = "名前 (例: Google)";
    document.getElementById('modalInput2').style.display = 'block'; document.getElementById('modalInput3').style.display = 'block';
    document.getElementById('modalInputEncoding').style.display = 'block'; document.getElementById('modalInput4').style.display = 'block';
  } else {
    if (modeType === 'folder') document.getElementById('modalInput1').placeholder = "フォルダ名を入力";
    else if (modeType === 'profile') document.getElementById('modalInput1').placeholder = "プロファイル名を入力";
    else document.getElementById('modalInput1').placeholder = "小見出しを入力";

    document.getElementById('modalInput2').style.display = 'none'; document.getElementById('modalInput3').style.display = 'none';
    document.getElementById('modalInputEncoding').style.display = 'none'; document.getElementById('modalInput4').style.display = 'none';
  }

  const presetBtn = document.getElementById('modalPresetBtn');
  if (onPresetClick) {
    presetBtn.style.display = 'block';
    presetBtn.onclick = () => {
      customModal.classList.remove('show');
      onPresetClick();
    };
  } else {
    presetBtn.style.display = 'none';
    presetBtn.onclick = null;
  }

  modalCallback = callback; customModal.classList.add('show');
  setTimeout(() => document.getElementById('modalInput1').focus(), 100);
}

document.getElementById('modalCancelBtn').addEventListener('click', () => customModal.classList.remove('show'));
document.getElementById('modalSaveBtn').addEventListener('click', () => { 
  if (modalCallback) modalCallback(
    document.getElementById('modalInput1').value, 
    document.getElementById('modalInput2').value, 
    document.getElementById('modalInput3').value, 
    document.getElementById('modalInput4').value, 
    document.getElementById('modalInputEncoding').value
  ); 
  customModal.classList.remove('show'); 
});

function enginesToGroups(engines = []) {
  const groups = [];
  let currentGroup = null;

  engines.forEach(item => {
    if (item.isHeading) {
      currentGroup = { heading: item.name || "", items: [] };
      groups.push(currentGroup);
    } else {
      if (!currentGroup) {
        currentGroup = { heading: "", items: [] };
        groups.push(currentGroup);
      }
      currentGroup.items.push(item);
    }
  });

  if (groups.length === 0) {
    groups.push({ heading: "", items: [] });
  }
  return groups;
}

function groupsToEngines(groups = []) {
  const engines = [];
  groups.forEach(g => {
    if (g.heading) {
      engines.push({ isHeading: true, name: g.heading });
    }
    if (Array.isArray(g.items)) {
      engines.push(...g.items);
    }
  });
  return engines;
}

// プロファイル管理
let profiles = JSON.parse(localStorage.getItem('launch_profiles')) || [];
let currentProfileId = localStorage.getItem('launch_current_profile_id');

const fallbackDefaultData = [
  {
    folderName: "ウェブ",
    engines: [
      { isHeading: true, name: "ポータル" },
      { name: "Google", url: "https://www.google.com/search?q=", home: "https://www.google.com", domain: "google.com", iconUrl: "", encoding: "UTF-8" },
      { name: "Yahoo! JAPAN", url: "https://search.yahoo.co.jp/search?p=", home: "https://www.yahoo.co.jp", domain: "yahoo.co.jp", iconUrl: "", encoding: "UTF-8" }
    ]
  }
];

if (profiles.length === 0) {
  profiles.push({ id: 'default', name: 'デフォルト', data: fallbackDefaultData });
  currentProfileId = 'default';
  localStorage.setItem('launch_profiles', JSON.stringify(profiles));
  localStorage.setItem('launch_current_profile_id', currentProfileId);
}

if (!currentProfileId || !profiles.find(p => p.id === currentProfileId)) {
  currentProfileId = profiles[0].id;
  localStorage.setItem('launch_current_profile_id', currentProfileId);
}

let appData = profiles.find(p => p.id === currentProfileId).data;

function saveAppData() {
  let p = profiles.find(x => x.id === currentProfileId);
  if(p) p.data = appData;
  localStorage.setItem('launch_profiles', JSON.stringify(profiles));
}

let draggedProfileItem = null;
function renderProfilesList() {
  const container = document.getElementById('profileListContainer');
  container.innerHTML = '';
  profiles.forEach((p) => {
    const isActive = p.id === currentProfileId;
    const card = document.createElement('div');
    card.className = `profile-card ${isActive ? 'active' : ''}`;
    card.setAttribute('draggable', 'true');
    
    card.addEventListener('dragstart', () => {
      draggedProfileItem = p;
      setTimeout(() => card.style.opacity = '0.4', 0);
    });

    card.addEventListener('dragover', (e) => {
      e.preventDefault();
      const rect = card.getBoundingClientRect();
      if (e.clientY < rect.top + rect.height / 2) {
        card.style.borderTop = '2px solid var(--app-blue)';
        card.style.borderBottom = '';
      } else {
        card.style.borderTop = '';
        card.style.borderBottom = '2px solid var(--app-blue)';
      }
    });

    card.addEventListener('dragleave', () => {
      card.style.borderTop = '';
      card.style.borderBottom = '';
    });

    card.addEventListener('drop', (e) => {
      e.preventDefault();
      card.style.borderTop = '';
      card.style.borderBottom = '';
      
      if (draggedProfileItem && draggedProfileItem !== p) {
        const oldIndex = profiles.indexOf(draggedProfileItem);
        let newIndex = profiles.indexOf(p);
        
        const rect = card.getBoundingClientRect();
        if (e.clientY >= rect.top + rect.height / 2) newIndex++;
        
        profiles.splice(oldIndex, 1);
        if (oldIndex < newIndex) newIndex--;
        profiles.splice(newIndex, 0, draggedProfileItem);
        
        localStorage.setItem('launch_profiles', JSON.stringify(profiles));
        renderProfilesList();
      }
    });

    card.addEventListener('dragend', () => {
      card.style.opacity = '1';
      draggedProfileItem = null;
    });

    const info = document.createElement('div');
    info.className = 'profile-info';
    info.innerHTML = `
      <div class="profile-icon">
        <svg viewBox="0 0 24 24" style="width:20px;height:20px;"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
      </div>
      <span class="profile-name">${escapeHtml(p.name)}</span>
    `;
    
    card.onclick = () => {
      if(!isActive) {
        currentProfileId = p.id;
        localStorage.setItem('launch_current_profile_id', currentProfileId);
        appData = profiles.find(x => x.id === currentProfileId).data; 
        currentTabIndex = 0; 
        const slider = document.getElementById('sliderContainer');
        if (slider) slider.scrollLeft = 0;
        renderApp(); 
        renderProfilesList();
      }
      closeModalUi('profilesModal');
    };

    const actions = document.createElement('div');
    actions.className = 'profile-actions';

    const exportBtn = document.createElement('button');
    exportBtn.className = 'profile-action-btn'; exportBtn.title = 'エクスポート';
    exportBtn.innerHTML = '<svg viewBox="0 0 24 24" style="width:18px;height:18px;"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>';
    exportBtn.onclick = (e) => {
      e.stopPropagation();
      const dateStr = new Date().toISOString().split('T')[0];
      const exportObj = { type: 'launch_profile_v1', name: p.name, app_data: p.data };
      const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `${p.name}_${dateStr}.json`; a.click(); URL.revokeObjectURL(url);
    };
    actions.appendChild(exportBtn);

    const editBtn = document.createElement('button');
    editBtn.className = 'profile-action-btn edit-only'; editBtn.title = '名前変更';
    editBtn.innerHTML = '<svg viewBox="0 0 24 24" style="width:18px;height:18px;"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>';
    editBtn.onclick = (e) => { 
      e.stopPropagation(); 
      openEditModal("プロファイル名を変更", p.name, "", "", "", "", 'profile', (newName) => {
        if(newName && newName.trim()) { 
          p.name = newName.trim(); 
          localStorage.setItem('launch_profiles', JSON.stringify(profiles)); 
          renderProfilesList(); 
        }
      });
    };
    actions.appendChild(editBtn);

    const delBtn = document.createElement('button');
    delBtn.className = 'profile-action-btn delete edit-only'; delBtn.title = '削除';
    delBtn.innerHTML = '<svg viewBox="0 0 24 24" style="width:18px;height:18px;"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.12-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z"/></svg>';
    delBtn.onclick = (e) => { 
      e.stopPropagation(); 
      if(profiles.length <= 1) return showConfirm("エラー", "最後のプロファイルは削除できません。", false, null, true);
      showConfirm("プロファイルの削除", `「${p.name}」を削除してもよろしいですか？`, true, () => {
        profiles = profiles.filter(x => x.id !== p.id);
        if(currentProfileId === p.id) { 
          currentProfileId = profiles[0].id; 
          appData = profiles[0].data; 
          localStorage.setItem('launch_current_profile_id', currentProfileId); 
          renderApp(); 
        }
        localStorage.setItem('launch_profiles', JSON.stringify(profiles)); 
        renderProfilesList();
      });
    };
    if(profiles.length > 1) actions.appendChild(delBtn);

    card.appendChild(info);
    card.appendChild(actions);
    container.appendChild(card);
  });
}
renderProfilesList();

function createNewProfile() {
  openEditModal("プロファイル作成", "新しいプロファイル", "", "", "", "", 'profile', (name) => {
    if (name && name.trim()) {
      const newId = 'profile_' + Date.now();
      profiles.push({ id: newId, name: name.trim(), data: JSON.parse(JSON.stringify(fallbackDefaultData)) });
      localStorage.setItem('launch_profiles', JSON.stringify(profiles));
      renderProfilesList();
    }
  });
}

document.getElementById('importProfileBtn').addEventListener('click', () => { document.getElementById('importFileInput').click(); });
document.getElementById('importFileInput').addEventListener('change', (e) => {
  const file = e.target.files[0]; if (!file) return; const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const d = JSON.parse(event.target.result);
      if (d.type === 'launch_profile_v1' && d.app_data) {
        profiles.push({ id: 'profile_' + Date.now(), name: (d.name || "インポート") + " (コピー)", data: d.app_data });
      } else if (d.app_data_v2) {
        profiles.push({ id: 'profile_' + Date.now(), name: "インポート (旧データ)", data: d.app_data_v2 });
      } else { throw new Error(); }
      localStorage.setItem('launch_profiles', JSON.stringify(profiles));
      showConfirm("完了", "プロファイルのインポートが完了しました。", false, null, true);
      renderProfilesList();
    } catch (err) { showConfirm("エラー", "無効なJSONファイルです。", false, null, true); }
    e.target.value = ''; 
  }; reader.readAsText(file);
});

document.getElementById('exportAllProfilesBtn').addEventListener('click', () => {
  const dateStr = new Date().toISOString().split('T')[0];
  profiles.forEach((p, index) => {
    setTimeout(() => {
      const exportObj = { type: 'launch_profile_v1', name: p.name, app_data: p.data };
      const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); 
      a.href = url; 
      a.download = `${p.name}_${dateStr}.json`; 
      a.click(); 
      URL.revokeObjectURL(url);
    }, index * 400); 
  });
});

// 検索履歴
let searchHistory = JSON.parse(localStorage.getItem('search_history')) || [];
function saveSearchHistory(query) {
  if (!query) return; searchHistory = searchHistory.filter(q => q !== query); searchHistory.unshift(query);
  if (searchHistory.length > 10) searchHistory.pop(); localStorage.setItem('search_history', JSON.stringify(searchHistory));
}
function renderHistory() {
  const dropdown = document.getElementById('historyDropdown'); dropdown.innerHTML = '';
  if (searchHistory.length === 0) { dropdown.innerHTML = '<div class="history-empty">検索履歴はありません</div>'; return; }
  searchHistory.forEach(query => {
    const item = document.createElement('div'); item.className = 'history-item';
    item.innerHTML = `<div class="history-text"><svg viewBox="0 0 24 24"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg><span>${escapeHtml(query)}</span></div><div class="history-remove"><svg viewBox="0 0 24 24" width="16" height="16"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></div>`;
    item.querySelector('.history-text').addEventListener('click', () => { searchInput.value = query; toggleClearBtn(); dropdown.classList.remove('show'); searchInput.focus(); });
    item.querySelector('.history-remove').addEventListener('click', (e) => { e.stopPropagation(); searchHistory = searchHistory.filter(q => q !== query); localStorage.setItem('search_history', JSON.stringify(searchHistory)); renderHistory(); });
    dropdown.appendChild(item);
  });
}
document.getElementById('historyBtn').addEventListener('click', (e) => { e.stopPropagation(); renderHistory(); document.getElementById('historyDropdown').classList.toggle('show'); });
document.addEventListener('click', (e) => { if (!document.getElementById('historyDropdown').contains(e.target) && !document.getElementById('historyBtn').contains(e.target)) document.getElementById('historyDropdown').classList.remove('show'); });

const executeSearch = (engineUrl, engineHome, encoding = 'UTF-8') => { 
  const query = searchInput.value.trim(); 
  if (query && engineUrl) {
    saveSearchHistory(query);
    let encodedQuery = (encoding === 'UTF-8' || typeof Encoding === 'undefined') ? encodeURIComponent(query) : Encoding.urlEncode(Encoding.convert(Encoding.stringToCode(query), encoding, 'UNICODE'));
    openLink(engineUrl + encodedQuery); 
  } else openLink(engineHome);
  searchInput.blur();
};

searchInput.addEventListener('keypress', (e) => { 
  if (e.key === 'Enter') { 
    const engine = localStorage.getItem('default_search_engine') || 'google';
    let searchUrl = "https://www.google.com/search?q=";
    let homeUrl = "https://www.google.com";

    if (engine === 'yahoo') {
      searchUrl = "https://search.yahoo.co.jp/search?p=";
      homeUrl = "https://www.yahoo.co.jp";
    } else if (engine === 'bing') {
      searchUrl = "https://www.bing.com/search?q=";
      homeUrl = "https://www.bing.com";
    } else if (engine === 'duckduckgo') {
      searchUrl = "https://duckduckgo.com/?q=";
      homeUrl = "https://duckduckgo.com";
    }

    executeSearch(searchUrl, homeUrl, 'UTF-8');
  } 
});

// 🌟 コンテキストメニュー表示
function showContextMenu(e, type, targetData) {
  if (!isEditMode) return;
  window.currentContextTarget = targetData; 
  window.currentContextType = type;
  const menu = document.getElementById('contextMenu');
  
  // 初期化：すべての専用項目を非表示
  menu.querySelectorAll('.menu-item, .menu-divider').forEach(el => el.style.display = 'none');
  
  const clip = getAppClipboard();

  if (type === 'item') { 
    document.querySelectorAll('.menu-type-item, .menu-type-edit').forEach(el => el.style.display = 'flex'); 
    document.getElementById('menuDividerItem').style.display = 'block'; 
    document.getElementById('menuDividerDelete').style.display = 'block'; 
    if (clip && clip.type === 'item') document.getElementById('menuPasteItem').style.display = 'flex';
  } else if (type === 'heading') { 
    document.querySelectorAll('.menu-type-edit, .menu-type-heading').forEach(el => el.style.display = 'flex'); 
    document.getElementById('menuDividerDelete').style.display = 'block'; 
    if (clip && clip.type === 'item') document.getElementById('menuPasteItem').style.display = 'flex';
  } else if (type === 'folder') { 
    document.querySelectorAll('.menu-type-folder').forEach(el => el.style.display = 'flex'); 
    document.getElementById('menuDividerDelete').style.display = 'block'; 
    if (clip && clip.type === 'folder') document.getElementById('menuPasteFolder').style.display = 'flex';
  } else if (type === 'folder-area') {
    // フォルダ内の背景エリア
    if (clip && clip.type === 'group') document.getElementById('menuPasteHeading').style.display = 'flex';
    if (clip && clip.type === 'folder') document.getElementById('menuPasteFolder').style.display = 'flex';
    if (!clip || (clip.type !== 'group' && clip.type !== 'folder')) return; // 貼るものがなければ出さない
  }

  menu.style.display = 'block';
  let x = e.clientX, y = e.clientY;
  if (x + menu.offsetWidth > window.innerWidth) x -= menu.offsetWidth;
  if (y + menu.offsetHeight > window.innerHeight) y -= menu.offsetHeight;
  menu.style.left = `${x}px`; menu.style.top = `${y}px`;
}
document.addEventListener('click', (e) => { if (e.button !== 2) document.getElementById('contextMenu').style.display = 'none'; });

const tabsContainer = document.getElementById('tabsContainer'); 
const sliderContainer = document.getElementById('sliderContainer');

let draggedGroupData = null; 
let draggedCardData = null;  
let draggedTab = null;

const tabObserver = new IntersectionObserver((entries) => { 
  entries.forEach(entry => { 
    if (entry.isIntersecting && sliderContainer.contains(entry.target)) { 
      tabsContainer.querySelectorAll('.tab').forEach(t => t.classList.remove('active')); 
      const idx = parseInt(entry.target.id.split('-')[2]); 
      const activeTab = tabsContainer.querySelector(`.tab[data-index="${idx}"]`); 
      if (activeTab) { 
        activeTab.classList.add('active'); 
        activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' }); 
        currentTabIndex = idx; 
      } 
    } 
  }); 
}, { root: sliderContainer, rootMargin: '0px', threshold: 0.6 });

async function openJsonSelectModal(targetFolderIndex) {
  const modal = document.getElementById('jsonSelectModal');
  const body = document.getElementById('jsonSelectBody');
  const addBtn = document.getElementById('jsonSelectAddBtn');
  let selectedItems = [];

  modal.classList.add('show');
  body.innerHTML = '<div style="text-align: center; color: var(--text-sub); margin-top: 40px;">読み込み中...</div>';
  addBtn.disabled = true;
  addBtn.textContent = 'アイテムを追加';

  let parsedData = null;
  try {
    const res = await fetch('default.json');
    if (res.ok) {
      const json = await res.json();
      parsedData = json.app_data || json;
    }
  } catch (e) {
    console.warn('default.jsonの取得に失敗しました。内蔵データを使用します。', e);
  }
  
  if (!parsedData) parsedData = fallbackDefaultData;

  body.innerHTML = '';
  parsedData.forEach(folder => {
    const fTitle = document.createElement('h3');
    fTitle.textContent = folder.folderName;
    fTitle.style.marginTop = '32px';
    fTitle.style.marginBottom = '16px';
    fTitle.style.fontSize = '18px';
    fTitle.style.fontWeight = '700';
    fTitle.style.color = 'var(--text-main)';
    if (body.children.length === 0) fTitle.style.marginTop = '0';
    body.appendChild(fTitle);

    let currentGrid = document.createElement('div');
    currentGrid.className = 'grid';
    body.appendChild(currentGrid);

    folder.engines.forEach(item => {
      if (item.isHeading) {
        const h = document.createElement('div');
        h.textContent = item.name;
        h.style.gridColumn = '1 / -1';
        h.style.fontSize = '14px';
        h.style.fontWeight = '600';
        h.style.color = 'var(--app-blue)';
        h.style.marginTop = '16px';
        h.style.marginBottom = '4px';
        h.style.borderBottom = '1px solid var(--nav-border)';
        h.style.paddingBottom = '4px';
        currentGrid.appendChild(h);
      } else {
        const card = document.createElement('div');
        card.className = 'card selectable-card';
        let iconHtml = item.iconUrl 
          ? `<img src="${escapeHtml(item.iconUrl)}" onerror="this.onerror=null; this.src='https://www.google.com/s2/favicons?domain=${escapeHtml(item.domain)}&sz=128';" alt="${escapeHtml(item.name)}">` 
          : `<img src="https://www.google.com/s2/favicons?domain=${escapeHtml(item.domain)}&sz=128" onerror="this.onerror=null; this.src='https://logo.clearbit.com/${escapeHtml(item.domain)}';" alt="${escapeHtml(item.name)}">`;
        card.innerHTML = `
          <div class="card-icon">${iconHtml}</div>
          <div class="card-title">${escapeHtml(item.name)}</div>
          <svg class="check-icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
        `;
        
        card.onclick = () => {
          const idx = selectedItems.indexOf(item);
          if (idx === -1) {
            selectedItems.push(item);
            card.classList.add('selected');
          } else {
            selectedItems.splice(idx, 1);
            card.classList.remove('selected');
          }
          if (selectedItems.length > 0) {
            addBtn.disabled = false;
            addBtn.textContent = `${selectedItems.length}個のアイテムを追加`;
          } else {
            addBtn.disabled = true;
            addBtn.textContent = 'アイテムを追加';
          }
        };
        currentGrid.appendChild(card);
      }
    });
  });

  addBtn.onclick = () => {
    if (selectedItems.length === 0) return;
    const itemsToAdd = selectedItems.map(item => ({ ...item }));
    appData[targetFolderIndex].engines.push(...itemsToAdd);
    saveAppData();
    renderApp();
    closeModalUi('jsonSelectModal');
  };
}

function renderApp() {
  tabsContainer.innerHTML = ''; 
  sliderContainer.innerHTML = ''; 
  tabObserver.disconnect();
  
  const folderDivsToObserve = [];

  appData.forEach((folder, folderIndex) => {
    const groups = enginesToGroups(folder.engines);

    // タブ
    const tab = document.createElement('div');
    tab.className = `tab ${folderIndex === currentTabIndex ? 'active' : ''}`;
    tab.textContent = folder.folderName;
    tab.dataset.index = folderIndex;
    tab.setAttribute('draggable', 'true');

    tab.addEventListener('click', () => { 
      sliderContainer.scrollLeft = sliderContainer.clientWidth * folderIndex; 
    });

    tab.addEventListener('dragstart', (e) => { 
      if(!isEditMode) return e.preventDefault(); 
      draggedTab = tab; 
      setTimeout(() => tab.classList.add('dragging'), 0); 
    });

    tab.addEventListener('dragend', () => { 
      if(!draggedTab) return; 
      draggedTab.classList.remove('dragging'); 
      const currentTabs = Array.from(tabsContainer.querySelectorAll('.tab:not(.add-folder-btn)')); 
      appData = currentTabs.map(t => appData[parseInt(t.dataset.index)]); 
      currentTabIndex = currentTabs.indexOf(draggedTab) !== -1 ? currentTabs.indexOf(draggedTab) : 0;
      saveAppData(); 
      renderApp(); 
      draggedTab = null; 
    });

    tab.addEventListener('dragover', e => { 
      e.preventDefault(); 
      if (draggedTab && draggedTab !== tab) { 
        const rect = tab.getBoundingClientRect(); 
        if (e.clientX < rect.left + rect.width / 2) tabsContainer.insertBefore(draggedTab, tab); 
        else tabsContainer.insertBefore(draggedTab, tab.nextSibling); 
      } else if (draggedCardData) {
        tab.classList.add('drag-over'); 
      }
    });

    tab.addEventListener('dragleave', () => tab.classList.remove('drag-over'));

    tab.addEventListener('drop', e => { 
      e.preventDefault(); 
      tab.classList.remove('drag-over'); 
      if (draggedCardData) { 
        const sourceFolder = appData[draggedCardData.folderIndex];
        const sourceGroups = enginesToGroups(sourceFolder.engines);
        const [movedItem] = sourceGroups[draggedCardData.groupIndex].items.splice(draggedCardData.itemIndex, 1);
        sourceFolder.engines = groupsToEngines(sourceGroups);

        const targetFolder = appData[folderIndex];
        const targetGroups = enginesToGroups(targetFolder.engines);
        targetGroups[0].items.push(movedItem);
        targetFolder.engines = groupsToEngines(targetGroups);

        currentTabIndex = folderIndex;
        saveAppData(); 
        renderApp(); 
        draggedCardData = null;
      } 
    });

    tab.addEventListener('contextmenu', (e) => { 
      e.preventDefault(); 
      showContextMenu(e, 'folder', { folderIndex }); 
    });
    tabsContainer.appendChild(tab);

    // フォルダ要素
    const folderDiv = document.createElement('div');
    folderDiv.className = 'folder';
    folderDiv.id = `app-folder-${folderIndex}`;

    // フォルダ背景右クリックで「グループ貼り付け」「フォルダ貼り付け」
    folderDiv.addEventListener('contextmenu', (e) => {
      if (e.target.closest('.card') || e.target.closest('.section-heading') || e.target.closest('.add-heading-btn')) return;
      e.preventDefault();
      showContextMenu(e, 'folder-area', { folderIndex });
    });

    const folderInner = document.createElement('div');
    folderInner.className = 'folder-inner';

    const folderColumns = document.createElement('div');
    folderColumns.className = 'folder-columns';

    groups.forEach((group, groupIndex) => {
      const groupDiv = document.createElement('div');
      groupDiv.className = 'section-group';

      groupDiv.addEventListener('dragover', (e) => {
        if (!draggedGroupData) return;
        e.preventDefault();
        if (draggedGroupData.folderIndex === folderIndex && draggedGroupData.groupIndex !== groupIndex) {
          groupDiv.classList.add('swap-target');
        }
      });

      groupDiv.addEventListener('dragleave', () => {
        groupDiv.classList.remove('swap-target');
      });

      groupDiv.addEventListener('drop', (e) => {
        if (!draggedGroupData) return;
        e.preventDefault();
        groupDiv.classList.remove('swap-target');

        if (draggedGroupData.folderIndex === folderIndex && draggedGroupData.groupIndex !== groupIndex) {
          const fromIdx = draggedGroupData.groupIndex;
          const toIdx = groupIndex;
          const temp = groups[fromIdx];
          groups[fromIdx] = groups[toIdx];
          groups[toIdx] = temp;

          folder.engines = groupsToEngines(groups);
          saveAppData();
          renderApp();
        }
        draggedGroupData = null;
      });

      if (group.heading || isEditMode) {
        const headingDiv = document.createElement('div');
        headingDiv.className = 'section-heading';
        headingDiv.textContent = group.heading || "(無名のグループ)";
        headingDiv.setAttribute('draggable', 'true');

        headingDiv.addEventListener('dragstart', (e) => {
          if (!isEditMode) return e.preventDefault();
          draggedGroupData = { folderIndex, groupIndex };
          e.dataTransfer.effectAllowed = 'move';
          setTimeout(() => groupDiv.classList.add('dragging-group'), 0);
        });

        headingDiv.addEventListener('dragend', () => {
          groupDiv.classList.remove('dragging-group');
          document.querySelectorAll('.section-group').forEach(el => el.classList.remove('swap-target'));
          draggedGroupData = null;
        });

        headingDiv.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          showContextMenu(e, 'heading', { folderIndex, groupIndex, headingName: group.heading, group });
        });

        groupDiv.appendChild(headingDiv);
      }

      const gridDiv = document.createElement('div');
      gridDiv.className = 'grid';

      gridDiv.addEventListener('dragover', (e) => {
        if (!draggedCardData) return;
        e.preventDefault();
      });

      gridDiv.addEventListener('drop', (e) => {
        if (!draggedCardData) return;
        if (e.target.closest('.card')) return;
        e.preventDefault();

        const srcFolder = appData[draggedCardData.folderIndex];
        const srcGroups = enginesToGroups(srcFolder.engines);
        const [movedItem] = srcGroups[draggedCardData.groupIndex].items.splice(draggedCardData.itemIndex, 1);
        srcFolder.engines = groupsToEngines(srcGroups);

        const destFolder = appData[folderIndex];
        const destGroups = enginesToGroups(destFolder.engines);
        destGroups[groupIndex].items.push(movedItem);
        destFolder.engines = groupsToEngines(destGroups);

        saveAppData();
        renderApp();
        draggedCardData = null;
      });

      group.items.forEach((item, itemIndex) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.name = item.name;
        card.dataset.hasSearch = item.url ? "true" : "false";
        card.setAttribute('draggable', 'true');

        card.addEventListener('click', (e) => {
          if (e.metaKey || e.ctrlKey) return;
          if (document.body.classList.contains('mode-search')) {
            const query = searchInput.value.trim();
            if (query === "") openLink(item.home);
            else if (item.url) executeSearch(item.url, item.home, item.encoding);
          } else {
            openLink(item.home);
          }
        });

        card.addEventListener('dragstart', (e) => {
          if (!isEditMode) return e.preventDefault();
          draggedCardData = { folderIndex, groupIndex, itemIndex };
          e.stopPropagation();
          setTimeout(() => card.classList.add('dragging'), 0);
        });

        card.addEventListener('dragend', (e) => {
          e.stopPropagation();
          card.classList.remove('dragging');
          document.querySelectorAll('.card').forEach(c => c.classList.remove('card-drag-target'));
          draggedCardData = null;
        });

        card.addEventListener('dragover', (e) => {
          if (!draggedCardData) return;
          e.preventDefault();
          e.stopPropagation();
          card.classList.add('card-drag-target');
        });

        card.addEventListener('dragleave', (e) => {
          e.stopPropagation();
          card.classList.remove('card-drag-target');
        });

        card.addEventListener('drop', (e) => {
          if (!draggedCardData) return;
          e.preventDefault();
          e.stopPropagation();
          card.classList.remove('card-drag-target');

          const srcFolder = appData[draggedCardData.folderIndex];
          const srcGroups = enginesToGroups(srcFolder.engines);

          if (draggedCardData.folderIndex === folderIndex && draggedCardData.groupIndex === groupIndex) {
            const fromIdx = draggedCardData.itemIndex;
            const toIdx = itemIndex;
            const temp = srcGroups[groupIndex].items[fromIdx];
            srcGroups[groupIndex].items[fromIdx] = srcGroups[groupIndex].items[toIdx];
            srcGroups[groupIndex].items[toIdx] = temp;
            srcFolder.engines = groupsToEngines(srcGroups);
          } else {
            const [movedItem] = srcGroups[draggedCardData.groupIndex].items.splice(draggedCardData.itemIndex, 1);
            srcFolder.engines = groupsToEngines(srcGroups);

            const destFolder = appData[folderIndex];
            const destGroups = enginesToGroups(destFolder.engines);
            destGroups[groupIndex].items.splice(itemIndex, 0, movedItem);
            destFolder.engines = groupsToEngines(destGroups);
          }

          saveAppData();
          renderApp();
          draggedCardData = null;
        });

        card.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          showContextMenu(e, 'item', { folderIndex, groupIndex, itemIndex, item });
        });

        let iconHtml = item.iconUrl 
          ? `<img src="${escapeHtml(item.iconUrl)}" onerror="this.onerror=null; this.src='https://www.google.com/s2/favicons?domain=${escapeHtml(item.domain)}&sz=128';" alt="${escapeHtml(item.name)}">` 
          : `<img src="https://www.google.com/s2/favicons?domain=${escapeHtml(item.domain)}&sz=128" onerror="this.onerror=null; this.src='https://logo.clearbit.com/${escapeHtml(item.domain)}';" alt="${escapeHtml(item.name)}">`;
        
        card.innerHTML = `<div class="card-icon">${iconHtml}</div><div class="card-title">${escapeHtml(item.name)}</div>`;
        gridDiv.appendChild(card);
      });

      groupDiv.appendChild(gridDiv);
      folderColumns.appendChild(groupDiv);
    });

    folderInner.appendChild(folderColumns);

    const actionBtns = document.createElement('div');
    actionBtns.style.display = 'flex';
    actionBtns.style.gap = '12px';
    actionBtns.style.marginTop = '20px';

    const addItemBtn = document.createElement('div');
    addItemBtn.className = 'add-heading-btn';
    addItemBtn.style.flex = '1';
    addItemBtn.style.marginTop = '0';
    addItemBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>アイテムを追加`;
    addItemBtn.addEventListener('click', () => {
      openEditModal("アイテムを追加", "", "", "", "", "UTF-8", 'item', 
        (name, homeUrl, searchUrl, iconUrl, enc) => { 
          if (!homeUrl || !name) return; 
          if (!homeUrl.startsWith('http')) homeUrl = 'https://' + homeUrl; 
          if (searchUrl && !searchUrl.startsWith('http')) searchUrl = 'https://' + searchUrl; 
          let domain = ""; 
          try { domain = new URL(homeUrl).hostname; } catch(err){}
          
          appData[folderIndex].engines.push({ 
            name: name, 
            url: searchUrl || "", 
            home: homeUrl, 
            domain: domain, 
            iconUrl: iconUrl || "", 
            encoding: enc, 
            isHeading: false 
          });
          saveAppData(); 
          renderApp();
        },
        () => openJsonSelectModal(folderIndex)
      );
    });

    const addHeadingBtn = document.createElement('div'); 
    addHeadingBtn.className = 'add-heading-btn'; 
    addHeadingBtn.style.flex = '1'; 
    addHeadingBtn.style.marginTop = '0';
    addHeadingBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>小見出しを追加`;
    addHeadingBtn.addEventListener('click', () => {
      openEditModal("小見出しを追加", "", "", "", "", "", 'heading', (name) => { 
        if (name && name.trim()) { 
          appData[folderIndex].engines.push({ isHeading: true, name: name.trim() }); 
          saveAppData(); 
          renderApp(); 
        } 
      });
    });

    actionBtns.appendChild(addItemBtn);
    actionBtns.appendChild(addHeadingBtn);
    folderInner.appendChild(actionBtns); 

    folderDiv.appendChild(folderInner); 
    sliderContainer.appendChild(folderDiv); 
    folderDivsToObserve.push(folderDiv); 
  });

  const addFolderBtn = document.createElement('div'); 
  addFolderBtn.className = 'tab add-folder-btn'; 
  addFolderBtn.textContent = '＋ 追加'; 
  addFolderBtn.title = '新しいフォルダを追加';
  addFolderBtn.addEventListener('click', () => { 
    openEditModal("フォルダを追加", "", "", "", "", "", 'folder', (name) => { 
      if (name && name.trim()) { 
        appData.push({ folderName: name.trim(), engines: [] }); 
        saveAppData(); 
        renderApp(); 
        setTimeout(() => { sliderContainer.scrollLeft = sliderContainer.scrollWidth; }, 100); 
      } 
    }); 
  });
  tabsContainer.appendChild(addFolderBtn);

  setTimeout(() => { 
    if(sliderContainer.children.length > currentTabIndex) {
      sliderContainer.scrollLeft = sliderContainer.clientWidth * currentTabIndex; 
    }
    folderDivsToObserve.forEach(div => tabObserver.observe(div));
  }, 10);
}
renderApp();

// 🌟 コンテキストメニューのアクション設定
document.getElementById('menuOpen').addEventListener('click', () => { 
  if (window.currentContextTarget && window.currentContextTarget.item) {
    window.open(window.currentContextTarget.item.home, '_blank', 'noopener,noreferrer'); 
  }
  document.getElementById('contextMenu').style.display = 'none'; 
});

document.getElementById('menuCopy').addEventListener('click', () => { 
  if (window.currentContextTarget && window.currentContextTarget.item) { 
    navigator.clipboard.writeText(window.currentContextTarget.item.home).then(() => { 
      const btn = document.getElementById('menuCopy'); 
      const orig = btn.innerHTML; 
      btn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>Copied!`; 
      setTimeout(() => btn.innerHTML = orig, 1500); 
    }); 
  } 
});

// アイテムのコピー
document.getElementById('menuCopyItem').addEventListener('click', () => {
  const target = window.currentContextTarget;
  if (target && target.item) {
    setAppClipboard('item', JSON.parse(JSON.stringify(target.item)));
  }
  document.getElementById('contextMenu').style.display = 'none';
});

// グループのコピー
document.getElementById('menuCopyHeading').addEventListener('click', () => {
  const target = window.currentContextTarget;
  if (target && target.group) {
    setAppClipboard('group', JSON.parse(JSON.stringify(target.group)));
  }
  document.getElementById('contextMenu').style.display = 'none';
});

// フォルダのコピー
document.getElementById('menuCopyFolder').addEventListener('click', () => {
  const target = window.currentContextTarget;
  if (target && target.folderIndex !== undefined) {
    const folder = appData[target.folderIndex];
    setAppClipboard('folder', JSON.parse(JSON.stringify(folder)));
  }
  document.getElementById('contextMenu').style.display = 'none';
});

// アイテムのペースト
document.getElementById('menuPasteItem').addEventListener('click', () => {
  const target = window.currentContextTarget;
  const clip = getAppClipboard();
  if (target && clip && clip.type === 'item') {
    const { folderIndex, groupIndex } = target;
    const groups = enginesToGroups(appData[folderIndex].engines);
    const itemIndex = target.itemIndex !== undefined ? target.itemIndex + 1 : groups[groupIndex].items.length;
    groups[groupIndex].items.splice(itemIndex, 0, JSON.parse(JSON.stringify(clip.data)));
    appData[folderIndex].engines = groupsToEngines(groups);
    saveAppData();
    renderApp();
  }
  document.getElementById('contextMenu').style.display = 'none';
});

// グループのペースト
document.getElementById('menuPasteHeading').addEventListener('click', () => {
  const target = window.currentContextTarget;
  const clip = getAppClipboard();
  if (target && clip && clip.type === 'group') {
    const { folderIndex } = target;
    const groups = enginesToGroups(appData[folderIndex].engines);
    const copyGroup = JSON.parse(JSON.stringify(clip.data));
    copyGroup.heading = (copyGroup.heading || "グループ") + " (コピー)";
    groups.push(copyGroup);
    appData[folderIndex].engines = groupsToEngines(groups);
    saveAppData();
    renderApp();
  }
  document.getElementById('contextMenu').style.display = 'none';
});

// フォルダのペースト
document.getElementById('menuPasteFolder').addEventListener('click', () => {
  const clip = getAppClipboard();
  if (clip && clip.type === 'folder') {
    const copyFolder = JSON.parse(JSON.stringify(clip.data));
    copyFolder.folderName = copyFolder.folderName + " (コピー)";
    appData.push(copyFolder);
    saveAppData();
    renderApp();
    setTimeout(() => { sliderContainer.scrollLeft = sliderContainer.scrollWidth; }, 100);
  }
  document.getElementById('contextMenu').style.display = 'none';
});

document.getElementById('menuEdit').addEventListener('click', () => {
  const target = window.currentContextTarget; 
  const type = window.currentContextType; 
  if (!target) return;

  if (type === 'item') {
    const { folderIndex, groupIndex, itemIndex, item } = target;
    openEditModal("編集", item.name, item.home, item.url, item.iconUrl || "", item.encoding || "UTF-8", 'item', 
      (newName, newHome, newUrl, newIconUrl, newEnc) => {
        const groups = enginesToGroups(appData[folderIndex].engines);
        const curItem = groups[groupIndex].items[itemIndex];
        if (newName) curItem.name = newName; 
        if (newHome) { 
          if (!newHome.startsWith('http')) newHome = 'https://' + newHome; 
          curItem.home = newHome; 
          try { curItem.domain = new URL(newHome).hostname; } catch(e){} 
        }
        if (newUrl !== undefined) { 
          if (newUrl && !newUrl.startsWith('http')) newUrl = 'https://' + newUrl; 
          curItem.url = newUrl; 
        }
        curItem.iconUrl = newIconUrl; 
        curItem.encoding = newEnc; 
        appData[folderIndex].engines = groupsToEngines(groups);
        saveAppData();
        renderApp();
      }, null);
  } else if (type === 'heading') { 
    const { folderIndex, groupIndex, headingName } = target;
    openEditModal("小見出しを編集", headingName, "", "", "", "", 'heading', (newName) => { 
      if (newName) { 
        const groups = enginesToGroups(appData[folderIndex].engines);
        groups[groupIndex].heading = newName.trim();
        appData[folderIndex].engines = groupsToEngines(groups);
        saveAppData();
        renderApp();
      } 
    }, null); 
  }
  document.getElementById('contextMenu').style.display = 'none'; 
});

document.getElementById('menuRemove').addEventListener('click', () => { 
  const target = window.currentContextTarget; 
  if (target && target.item) { 
    const { folderIndex, groupIndex, itemIndex } = target;
    const groups = enginesToGroups(appData[folderIndex].engines);
    groups[groupIndex].items.splice(itemIndex, 1);
    appData[folderIndex].engines = groupsToEngines(groups);
    saveAppData();
    renderApp();
  } 
  document.getElementById('contextMenu').style.display = 'none'; 
});

document.getElementById('menuRemoveHeading').addEventListener('click', () => {
  const target = window.currentContextTarget;
  if (target && target.headingName !== undefined) {
    showConfirm("小見出しの削除", `「${target.headingName}」を削除しますか？\n（含まれるアイテムは上のグループと統合されます）`, true, () => {
      const { folderIndex, groupIndex } = target;
      const groups = enginesToGroups(appData[folderIndex].engines);
      if (groupIndex > 0) {
        groups[groupIndex - 1].items.push(...groups[groupIndex].items);
        groups.splice(groupIndex, 1);
      } else {
        groups[groupIndex].heading = "";
      }
      appData[folderIndex].engines = groupsToEngines(groups);
      saveAppData();
      renderApp();
    });
  }
  document.getElementById('contextMenu').style.display = 'none';
});

document.getElementById('menuRenameFolder').addEventListener('click', () => { 
  const target = window.currentContextTarget; 
  if (target) { 
    const folder = appData[target.folderIndex]; 
    openEditModal("フォルダ名を変更", folder.folderName, "", "", "", "", 'folder', (newName) => { 
      if (newName && newName.trim()) { 
        folder.folderName = newName.trim(); 
        saveAppData(); 
        renderApp(); 
      } 
    }, null); 
  } 
  document.getElementById('contextMenu').style.display = 'none'; 
});

document.getElementById('menuRemoveFolder').addEventListener('click', () => { 
  const target = window.currentContextTarget; 
  if (target) { 
    if (appData.length <= 1) return showConfirm("エラー", "最後のフォルダは削除できません。", false, null, true);
    showConfirm("フォルダの削除", "このフォルダと中身をすべて削除しますか？", true, () => { 
      appData.splice(target.folderIndex, 1); 
      if (currentTabIndex >= appData.length) currentTabIndex = Math.max(0, appData.length - 1);
      saveAppData(); 
      renderApp(); 
    }); 
  } 
  document.getElementById('contextMenu').style.display = 'none'; 
});

document.getElementById('initDataBtn').addEventListener('click', () => { 
  showConfirm("データ初期化", "すべての設定と全プロファイルを初期化し、デフォルトに戻します。\n本当によろしいですか？", true, () => { 
    localStorage.clear(); 
    location.reload(); 
  }); 
});