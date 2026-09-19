let currentTabIndex = 0;
const searchInput = document.getElementById('searchInput');
const clearBtn = document.getElementById('clearBtn');

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

// リンクの開き方の設定
const settingLinkOpenMode = document.getElementById('settingLinkOpenMode');
if (localStorage.getItem('link_open_mode')) {
  settingLinkOpenMode.value = localStorage.getItem('link_open_mode');
} else {
  settingLinkOpenMode.value = 'blank';
  localStorage.setItem('link_open_mode', 'blank');
}
settingLinkOpenMode.addEventListener('change', (e) => localStorage.setItem('link_open_mode', e.target.value));

// ▼ デフォルト検索エンジンの設定 ▼
const settingDefaultSearchEngine = document.getElementById('settingDefaultSearchEngine');
if (localStorage.getItem('default_search_engine')) {
  settingDefaultSearchEngine.value = localStorage.getItem('default_search_engine');
} else {
  settingDefaultSearchEngine.value = 'google'; // 初期値
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

// ガラスモーダル関連
const openModalUi = (id) => document.getElementById(id).classList.add('show');
const closeModalUi = (id) => document.getElementById(id).classList.remove('show');
document.querySelectorAll('.glass-modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => { 
    if(e.target === overlay && !overlay.classList.contains('edit-modal-overlay') && !overlay.classList.contains('confirm-modal-overlay')) overlay.classList.remove('show'); 
  });
});

document.getElementById('nav-profiles').addEventListener('click', () => openModalUi('profilesModal'));
document.getElementById('nav-settings').addEventListener('click', () => openModalUi('settingsModal'));

// カスタム確認モーダル関数
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

// 🌟 アイテム追加・編集モーダル関数
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
  if (modalCallback) modalCallback(document.getElementById('modalInput1').value, document.getElementById('modalInput2').value, document.getElementById('modalInput3').value, document.getElementById('modalInput4').value, document.getElementById('modalInputEncoding').value); 
  customModal.classList.remove('show'); 
});

// ▼ JSONから読み込んだ初期データ (フォールバック用) ▼
const defaultAppData = [
  {
    "folderName": "ウェブ",
    "engines": [
      { "isHeading": true, "name": "ポータル" },
      { "name": "Google", "url": "https://www.google.com/search?q=", "home": "https://www.google.com", "domain": "google.com", "iconUrl": "", "encoding": "UTF-8" },
      { "name": "Yahoo! JAPAN", "url": "https://search.yahoo.co.jp/search?p=", "home": "https://www.yahoo.co.jp", "domain": "yahoo.co.jp", "iconUrl": "", "encoding": "UTF-8" },
      { "name": "DuckDuckGo", "url": "https://duckduckgo.com/?q=", "home": "https://duckduckgo.com", "domain": "duckduckgo.com", "iconUrl": "", "encoding": "UTF-8" },
      { "isHeading": true, "name": "メール／カレンダー／コミュニケーション" },
      { "name": "Calendar", "url": "https://calendar.google.com/calendar/u/0/r/search?q=", "home": "https://calendar.google.com/calendar/", "domain": "calendar.google.com", "iconUrl": "https://play-lh.googleusercontent.com/vEoqLbT_QkYcEaawWBRc22N6i98OUtOUpM1LmKdVs_xx7lCsUyFfV0ZiqoUXjMijUteiBhhN4K5MpoF96FRNOg=w480-h960-rw", "encoding": "UTF-8" },
      { "name": "outlook", "url": "", "home": "https://outlook.office.com/mail/", "domain": "outlook.office.com", "iconUrl": "https://img.utdstc.com/icon/f00/db2/f00db21aa992c5b8de82d2862b72fa6fe477319ff7051483a1e3e636ebb7d59d:200", "encoding": "UTF-8" },
      { "name": "gmail", "url": "https://mail.google.com/mail/u/0/#search/", "home": "https://mail.google.com/mail/u/0/#inbox", "domain": "mail.google.com", "iconUrl": "https://play-lh.googleusercontent.com/c6KD_8-GvnGRJA4lRQ4y5YnUa3-LOeYAS7ubw1jWyB9bmr6Kj6zzRvh2A5WBB-Vd3e6zhElmhDv07fCJx2Fc=w480-h960-rw", "encoding": "UTF-8" },
      { "name": "slack", "url": "", "home": "https://app.slack.com/client/", "domain": "app.slack.com", "iconUrl": "", "encoding": "UTF-8" },
      { "name": "teams", "url": "", "home": "https://teams.microsoft.com/v2/", "domain": "teams.microsoft.com", "iconUrl": "", "encoding": "UTF-8" },
      { "isHeading": true, "name": "動画／画像" },
      { "name": "YouTube", "url": "https://www.youtube.com/results?search_query=", "home": "https://www.youtube.com", "domain": "youtube.com", "iconUrl": "", "encoding": "UTF-8" },
      { "name": "画像検索", "url": "https://www.google.com/search?tbm=isch&q=", "home": "https://www.google.com/imghp", "domain": "google.com", "iconUrl": "", "encoding": "UTF-8" },
      { "name": "リアルタイム", "url": "https://search.yahoo.co.jp/realtime/search?p=", "home": "https://search.yahoo.co.jp/realtime", "domain": "search.yahoo.co.jp", "iconUrl": "https://play-lh.googleusercontent.com/R3K6pxTPN6gGj91GOpikk30D6kWiPH59OpY4SqF4ZJGrX_vCFQEbBUT8aAOCLIzyKbHj2xcn5JspJw-icaK3tRw=w480-h960-rw", "encoding": "UTF-8" },
      { "isHeading": true, "name": "ツール" },
      { "name": "notion", "url": "", "home": "https://www.notion.so", "domain": "www.notion.so", "iconUrl": "", "encoding": "UTF-8" },
      { "name": "todoint", "url": "https://app.todoist.com/app/search/aaa", "home": "https://app.todoist.com/", "domain": "app.todoist.com", "iconUrl": "https://play-lh.googleusercontent.com/03uYCmB2qWmmr-rIL8X_gj20wdIxLPW3bmqf1ZSNlwf_ZjuQYGnNnOB-8ig2CBzwqyf5meCgOgUEzxvC1QY6rg=s96-rw", "encoding": "UTF-8" },
      { "name": "raindrop", "url": "https://app.raindrop.io/my/0/", "home": "https://app.raindrop.io/my/0", "domain": "app.raindrop.io", "iconUrl": "", "encoding": "UTF-8" },
      { "name": "simplenote", "url": "", "home": "https://app.simplenote.com/", "domain": "app.simplenote.com", "iconUrl": "", "encoding": "UTF-8" }
    ]
  },
  {
    "folderName": "AI",
    "engines": [
      { "isHeading": true, "name": "AI" },
      { "name": "chatGPT", "url": "", "home": "https://chatgpt.com/", "domain": "chatgpt.com", "iconUrl": "", "encoding": "UTF-8" },
      { "name": "claude", "url": "", "home": "https://claude.ai/chat/", "domain": "claude.ai", "iconUrl": "", "encoding": "UTF-8" },
      { "name": "gemini", "url": "", "home": "https://gemini.google.com/", "domain": "gemini.google.com", "iconUrl": "", "encoding": "UTF-8" },
      { "name": "deepseek", "url": "", "home": "https://chat.deepseek.com/", "domain": "chat.deepseek.com", "iconUrl": "", "encoding": "UTF-8" },
      { "name": "perplexity", "url": "https://www.perplexity.ai/search?q=", "home": "https://www.perplexity.ai/", "domain": "www.perplexity.ai", "iconUrl": "", "encoding": "UTF-8" }
    ]
  },
  {
    "folderName": "ニュース",
    "engines": [
      { "isHeading": true, "name": "ポータル" },
      { "name": "Yahooニュース", "url": "https://news.yahoo.co.jp/search?p=", "home": "https://news.yahoo.co.jp", "domain": "news.yahoo.co.jp", "iconUrl": "", "encoding": "UTF-8" },
      { "name": "Googleニュース", "url": "https://news.google.com/search?q=", "home": "https://news.google.com/home?hl=ja&gl=JP", "domain": "news.google.com", "iconUrl": "", "encoding": "UTF-8" },
      { "name": "47news", "url": "https://www.47news.jp/search?q=", "home": "https://www.47news.jp/", "domain": "www.47news.jp", "iconUrl": "", "encoding": "UTF-8" },
      { "name": "日経", "url": "https://www.nikkei.com/search?keyword=", "home": "https://www.nikkei.com", "domain": "www.nikkei.com", "iconUrl": "", "encoding": "UTF-8" },
      { "isHeading": true, "name": "国際ニュース" },
      { "name": "ロイター", "url": "https://www.reuters.com/jp/site-search/?query=", "home": "https://jp.reuters.com", "domain": "jp.reuters.com", "iconUrl": "", "encoding": "UTF-8" },
      { "name": "CNN", "url": "", "home": "https://www.cnn.co.jp", "domain": "www.cnn.co.jp", "iconUrl": "", "encoding": "UTF-8" },
      { "name": "BBC", "url": "", "home": "https://www.bbc.com/japanese", "domain": "www.bbc.com", "iconUrl": "", "encoding": "UTF-8" },
      { "name": "afpbb", "url": "https://www.afpbb.com/search?fulltext=", "home": "https://www.afpbb.com/", "domain": "www.afpbb.com", "iconUrl": "", "encoding": "UTF-8" },
      { "isHeading": true, "name": "記事" },
      { "name": "はてな", "url": "https://b.hatena.ne.jp/q/", "home": "https://b.hatena.ne.jp/hotentry/all", "domain": "b.hatena.ne.jp", "iconUrl": "", "encoding": "UTF-8" }
    ]
  },
  {
    "folderName": "エンタメ",
    "engines": [
      { "isHeading": true, "name": "動画" },
      { "name": "Youtube", "url": "https://www.youtube.com/results?search_query=", "home": "https://www.youtube.com", "domain": "www.youtube.com", "iconUrl": "", "encoding": "UTF-8" },
      { "name": "Netflix", "url": "https://www.netflix.com/search?q=", "home": "https://www.netflix.com", "domain": "www.netflix.com", "iconUrl": "", "encoding": "UTF-8" },
      { "name": "Prime Video", "url": "https://www.amazon.co.jp/s?i=instant-video&k=", "home": "https://www.amazon.co.jp/Prime-Video", "domain": "amazon.co.jp", "iconUrl": "", "encoding": "UTF-8" },
      { "name": "TVer", "url": "https://tver.jp/search/", "home": "https://tver.jp", "domain": "tver.jp", "iconUrl": "", "encoding": "UTF-8" },
      { "name": "abema", "url": "https://abema.tv/search?q=", "home": "https://abema.tv/", "domain": "abema.tv", "iconUrl": "", "encoding": "UTF-8" },
      { "isHeading": true, "name": "SNS" },
      { "name": "X", "url": "https://twitter.com/search?q=", "home": "https://x.com/", "domain": "x.com", "iconUrl": "", "encoding": "UTF-8" },
      { "name": "Instagram", "url": "https://www.instagram.com/explore/tags/", "home": "https://www.instagram.com", "domain": "instagram.com", "iconUrl": "", "encoding": "UTF-8" },
      { "name": "tiktok", "url": "https://www.tiktok.com/search?q=", "home": "https://www.tiktok.com/", "domain": "www.tiktok.com", "iconUrl": "", "encoding": "UTF-8" }
    ]
  },
  {
    "folderName": "ショッピング",
    "engines": [
      { "isHeading": true, "name": "総合通販" },
      { "name": "Amazon", "url": "https://www.amazon.co.jp/s?k=", "home": "https://www.amazon.co.jp", "domain": "amazon.co.jp", "iconUrl": "", "encoding": "UTF-8" },
      { "name": "楽天市場", "url": "https://search.rakuten.co.jp/search/mall/", "home": "https://www.rakuten.co.jp", "domain": "rakuten.co.jp", "iconUrl": "", "encoding": "UTF-8" },
      { "name": "Y!ショッピング", "url": "https://shopping.yahoo.co.jp/search?p=", "home": "https://shopping.yahoo.co.jp", "domain": "shopping.yahoo.co.jp", "iconUrl": "", "encoding": "UTF-8" },
      { "name": "ヨドバシ", "url": "https://www.yodobashi.com/?word=", "home": "https://www.yodobashi.com", "domain": "www.yodobashi.com", "iconUrl": "https://play-lh.googleusercontent.com/AHhokkIYtJ2I-7OVd_a5IUD_xlYr_I3i580VXak9U9a5wdGWui7fBA96Ae-W_Zt6GM3Y0v-ntYpMpnSIgD3mMg=w480-h960-rw", "encoding": "UTF-8" },
      { "isHeading": true, "name": "フリマ／オークション" },
      { "name": "メルカリ", "url": "https://jp.mercari.com/search?keyword=", "home": "https://jp.mercari.com", "domain": "mercari.com", "iconUrl": "", "encoding": "UTF-8" },
      { "name": "ヤフオク!", "url": "https://auctions.yahoo.co.jp/search/search?p=", "home": "https://auctions.yahoo.co.jp", "domain": "auctions.yahoo.co.jp", "iconUrl": "", "encoding": "UTF-8" },
      { "name": "Yahooフリマ", "url": "https://paypayfleamarket.yahoo.co.jp/search/", "home": "https://paypayfleamarket.yahoo.co.jp/", "domain": "paypayfleamarket.yahoo.co.jp", "iconUrl": "", "encoding": "UTF-8" },
      { "name": "minne", "url": "https://minne.com/category/saleonly?input_method=typing&q=", "home": "https://minne.com/", "domain": "minne.com", "iconUrl": "", "encoding": "UTF-8" },
      { "isHeading": true, "name": "海外" },
      { "name": "temu", "url": "https://www.temu.com/search_result.html?search_key=", "home": "https://www.temu.com/jp", "domain": "www.temu.com", "iconUrl": "", "encoding": "UTF-8" },
      { "name": "Qoo10", "url": "https://www.qoo10.jp/gmkt.inc/Search/Default.aspx?keyword=", "home": "https://www.qoo10.jp", "domain": "qoo10.jp", "iconUrl": "", "encoding": "UTF-8" },
      { "isHeading": true, "name": "価格" },
      { "name": "価格.com", "url": "https://kakaku.com/search_results/?query=", "home": "https://kakaku.com", "domain": "kakaku.com", "iconUrl": "", "encoding": "SJIS" },
      { "name": "keepa", "url": "https://keepa.com/#!search/5-", "home": "https://keepa.com/", "domain": "keepa.com", "iconUrl": "", "encoding": "UTF-8" }
    ]
  },
  {
    "folderName": "お店",
    "engines": [
      { "isHeading": true, "name": "雑貨" },
      { "name": "無印良品", "url": "https://www.muji.com/jp/ja/store/search/cmdty/", "home": "https://www.muji.com/jp/ja/store", "domain": "www.muji.com", "iconUrl": "", "encoding": "UTF-8" },
      { "name": "ニトリ", "url": "https://www.nitori-net.jp/ec/search/?q=", "home": "https://www.nitori-net.jp", "domain": "www.nitori-net.jp", "iconUrl": "", "encoding": "UTF-8" },
      { "name": "ダイソー", "url": "https://jp.daisonet.com/search?type=product&q=", "home": "https://jp.daisonet.com/", "domain": "jp.daisonet.com", "iconUrl": "", "encoding": "UTF-8" },
      { "isHeading": true, "name": "ファッション" },
      { "name": "ユニクロ", "url": "https://www.uniqlo.com/jp/ja/search?q=", "home": "https://www.uniqlo.com/jp/ja/", "domain": "www.uniqlo.com", "iconUrl": "", "encoding": "UTF-8" },
      { "name": "zozotown", "url": "https://zozo.jp/search/?p_keyv=", "home": "https://zozo.jp", "domain": "zozo.jp", "iconUrl": "", "encoding": "SJIS" },
      { "isHeading": true, "name": "家電" }
    ]
  },
  {
    "folderName": "辞書",
    "engines": [
      { "isHeading": true, "name": "辞書" },
      { "name": "Wikipedia", "url": "https://ja.wikipedia.org/wiki/Special:Search?search=", "home": "https://ja.wikipedia.org", "domain": "wikipedia.org", "iconUrl": "", "encoding": "UTF-8" },
      { "name": "Weblio辞書", "url": "https://www.weblio.jp/content/", "home": "https://www.weblio.jp", "domain": "www.weblio.jp", "iconUrl": "https://play-lh.googleusercontent.com/mgzo238CIcMk1PrQzyqxY_YKgQEF_9hO9H8eRi_yB9OVhirE5NDRMd9bi6WJdXDc7s5RIfLO_o6Jky4B4qDx2Bw=s96-rw", "encoding": "UTF-8" },
      { "name": "コトバンク", "url": "https://kotobank.jp/word/", "home": "https://kotobank.jp", "domain": "kotobank.jp", "iconUrl": "", "encoding": "UTF-8" },
      { "name": "英辞郎", "url": "https://eow.alc.co.jp/search?q=", "home": "https://eow.alc.co.jp", "domain": "alc.co.jp", "iconUrl": "", "encoding": "UTF-8" },
      { "isHeading": true, "name": "翻訳" },
      { "name": "英→和（DeepL）", "url": "https://www.deepl.com/translator?#en/ja/", "home": "https://www.deepl.com/translator?#en/ja/", "domain": "www.deepl.com", "iconUrl": "", "encoding": "UTF-8" },
      { "name": "和→英（DeepL）", "url": "https://www.deepl.com/translator?#ja/en/", "home": "https://www.deepl.com/translator?#ja/en/", "domain": "www.deepl.com", "iconUrl": "", "encoding": "UTF-8" }
    ]
  },
  {
    "folderName": "素材",
    "engines": [
      { "isHeading": true, "name": "画像" },
      { "name": "usnplash", "url": "https://unsplash.com/ja/s/%E5%86%99%E7%9C%9F/", "home": "https://unsplash.com/ja", "domain": "unsplash.com", "iconUrl": "", "encoding": "UTF-8" },
      { "name": "pixabay", "url": "https://pixabay.com/ja/images/search/", "home": "https://pixabay.com/ja/", "domain": "pixabay.com", "iconUrl": "", "encoding": "UTF-8" },
      { "isHeading": true, "name": "サウンド" },
      { "name": "効果音ラボ", "url": "https://soundeffect-lab.info/sound/search.php?s=", "home": "https://soundeffect-lab.info/sound/anime/", "domain": "soundeffect-lab.info", "iconUrl": "", "encoding": "UTF-8" },
      { "name": "freesound", "url": "https://freesound.org/search/?q=", "home": "https://freesound.org/", "domain": "freesound.org", "iconUrl": "", "encoding": "UTF-8" }
    ]
  }
];
// ▲ JSONデータここまで ▲

// プロファイル管理ロジック
let profiles = JSON.parse(localStorage.getItem('launch_profiles')) || [];
let currentProfileId = localStorage.getItem('launch_current_profile_id');

if (profiles.length === 0) {
  let oldData = JSON.parse(localStorage.getItem('app_data_v2'));
  if (oldData) profiles.push({ id: 'default', name: 'デフォルト (移行済み)', data: oldData });
  else profiles.push({ id: 'default', name: 'デフォルト', data: defaultAppData });
  currentProfileId = 'default';
  localStorage.setItem('launch_profiles', JSON.stringify(profiles));
  localStorage.setItem('launch_current_profile_id', currentProfileId);
}
if (!currentProfileId || !profiles.find(p => p.id === currentProfileId)) {
  currentProfileId = profiles[0].id; localStorage.setItem('launch_current_profile_id', currentProfileId);
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
  profiles.forEach((p, index) => {
    const isActive = p.id === currentProfileId;
    const card = document.createElement('div');
    card.className = `profile-card ${isActive ? 'active' : ''}`;
    
    // ドラッグ＆ドロップの設定
    card.setAttribute('draggable', 'true');
    
    card.addEventListener('dragstart', (e) => {
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
        if (e.clientY >= rect.top + rect.height / 2) {
          newIndex++;
        }
        
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
      <span class="profile-name">${p.name}</span>
    `;
    
    // プロファイル切り替え時に確実にスクロールをリセットする
    card.onclick = () => {
      if(!isActive) {
        currentProfileId = p.id; localStorage.setItem('launch_current_profile_id', currentProfileId);
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
      const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob);
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
        if(currentProfileId === p.id) { currentProfileId = profiles[0].id; appData = profiles[0].data; localStorage.setItem('launch_current_profile_id', currentProfileId); renderApp(); }
        localStorage.setItem('launch_profiles', JSON.stringify(profiles)); renderProfilesList();
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
      profiles.push({ id: newId, name: name.trim(), data: JSON.parse(JSON.stringify(defaultAppData)) });
      localStorage.setItem('launch_profiles', JSON.stringify(profiles));
      renderProfilesList();
    }
  });
}

// 🌟 インポート処理
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

// 🌟 全プロファイル一括エクスポート
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

// 検索履歴処理
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
    item.innerHTML = `<div class="history-text"><svg viewBox="0 0 24 24"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg><span>${query}</span></div><div class="history-remove"><svg viewBox="0 0 24 24" width="16" height="16"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></div>`;
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

// ▼ 変更箇所：Enterキーでの検索は、必ず設定したデフォルトエンジンを使う ▼
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

function showContextMenu(e, type, target) {
  if (!isEditMode) return;
  window.currentContextTarget = target; window.currentContextType = type;
  const menu = document.getElementById('contextMenu');
  document.querySelectorAll('.menu-item, .menu-divider').forEach(el => el.style.display = 'none');
  if (type === 'item') { document.querySelectorAll('.menu-type-item, .menu-type-edit').forEach(el => el.style.display = 'flex'); document.getElementById('menuDivider').style.display = 'block'; }
  else if (type === 'folder') { document.querySelectorAll('.menu-type-folder').forEach(el => el.style.display = 'flex'); }
  else if (type === 'heading') { document.querySelectorAll('.menu-type-edit').forEach(el => el.style.display = 'flex'); }
  menu.style.display = 'block';
  let x = e.clientX, y = e.clientY;
  if (x + menu.offsetWidth > window.innerWidth) x -= menu.offsetWidth;
  if (y + menu.offsetHeight > window.innerHeight) y -= menu.offsetHeight;
  menu.style.left = `${x}px`; menu.style.top = `${y}px`;
}
document.addEventListener('click', (e) => { if (e.button !== 2) document.getElementById('contextMenu').style.display = 'none'; });

const tabsContainer = document.getElementById('tabsContainer'); 
const sliderContainer = document.getElementById('sliderContainer');
let draggedItem = null; let draggedTab = null;

// 無関係な要素（古い画面）のコールバックを無視する
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

const updateDOMData = () => {
  document.querySelectorAll('#sliderContainer .folder').forEach((fDiv, fIdx) => {
    const newEngines = [];
    fDiv.querySelectorAll('.section-group').forEach(group => {
      const heading = group.querySelector('.section-heading');
      if (heading) newEngines.push({ isHeading: true, name: heading.dataset.name });
      Array.from(group.querySelectorAll('.grid > .card')).forEach(card => {
        newEngines.push({ name: card.dataset.name, url: card.dataset.url, home: card.dataset.home, domain: card.dataset.domain, iconUrl: card.dataset.iconUrl, encoding: card.dataset.encoding });
      });
    });
    appData[fIdx].engines = newEngines;
  });
  saveAppData(); renderApp();
};

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
    console.warn('default.jsonの取得に失敗しました。内蔵のデフォルトデータを使用します。', e);
  }
  
  if (!parsedData) parsedData = defaultAppData;

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
        let iconHtml = item.iconUrl ? `<img src="${item.iconUrl}" onerror="this.onerror=null; this.src='https://www.google.com/s2/favicons?domain=${item.domain}&sz=128';" alt="${item.name}">` : `<img src="https://www.google.com/s2/favicons?domain=${item.domain}&sz=128" onerror="this.onerror=null; this.src='https://logo.clearbit.com/${item.domain}';" alt="${item.name}">`;
        card.innerHTML = `
          <div class="card-icon">${iconHtml}</div>
          <div class="card-title">${item.name}</div>
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
  tabsContainer.innerHTML = ''; sliderContainer.innerHTML = ''; tabObserver.disconnect();
  
  const folderDivsToObserve = [];

  appData.forEach((folder, index) => {
    const tab = document.createElement('div'); tab.className = `tab ${index === currentTabIndex ? 'active' : ''}`; tab.textContent = folder.folderName; tab.dataset.index = index; tab.setAttribute('draggable', 'true');
    tab.addEventListener('click', () => { sliderContainer.scrollLeft = sliderContainer.clientWidth * index; });
    tab.addEventListener('dragstart', (e) => { if(!isEditMode) return e.preventDefault(); draggedTab = tab; setTimeout(() => tab.classList.add('dragging'), 0); });
    tab.addEventListener('dragend', () => { 
      if(!draggedTab) return; draggedTab.classList.remove('dragging'); 
      const currentTabs = Array.from(tabsContainer.querySelectorAll('.tab:not(.add-folder-btn)')); 
      appData = currentTabs.map(t => appData[parseInt(t.dataset.index)]); 
      currentTabIndex = currentTabs.indexOf(draggedTab) !== -1 ? currentTabs.indexOf(draggedTab) : 0;
      saveAppData(); renderApp(); draggedTab = null; 
    });
    tab.addEventListener('dragover', e => { 
      e.preventDefault(); 
      if (draggedTab && draggedTab !== tab) { const rect = tab.getBoundingClientRect(); if (e.clientX < rect.left + rect.width / 2) tabsContainer.insertBefore(draggedTab, tab); else tabsContainer.insertBefore(draggedTab, tab.nextSibling); } 
      else if (draggedItem && draggedItem.classList.contains('card')) tab.classList.add('drag-over'); 
    });
    tab.addEventListener('dragleave', () => tab.classList.remove('drag-over'));
    tab.addEventListener('drop', e => { 
      e.preventDefault(); tab.classList.remove('drag-over'); 
      if (draggedItem && draggedItem.classList.contains('card')) { 
        const firstGrid = document.querySelector(`#app-folder-${index} .folder-columns .grid`);
        if(firstGrid) { firstGrid.appendChild(draggedItem); currentTabIndex = index; updateDOMData(); }
      } 
    });
    tab.addEventListener('contextmenu', (e) => { e.preventDefault(); showContextMenu(e, 'folder', tab); });
    tabsContainer.appendChild(tab);

    const folderDiv = document.createElement('div'); folderDiv.className = 'folder'; folderDiv.id = `app-folder-${index}`;
    const folderInner = document.createElement('div'); folderInner.className = 'folder-inner';
    const folderColumns = document.createElement('div'); folderColumns.className = 'folder-columns';
    
    folderColumns.addEventListener('dragover', e => {
      e.preventDefault(); 
      if (draggedItem && draggedItem.classList.contains('section-heading')) {
        const targetGroup = e.target.closest('.section-group'); const draggedGroup = draggedItem.closest('.section-group');
        if (targetGroup && targetGroup !== draggedGroup && !draggedTab) {
          const rect = targetGroup.getBoundingClientRect();
          if (e.clientY < rect.top + rect.height / 2) folderColumns.insertBefore(draggedGroup, targetGroup); else folderColumns.insertBefore(draggedGroup, targetGroup.nextSibling);
        }
      } else if (draggedItem && draggedItem.classList.contains('card')) {
        const targetGroup = e.target.closest('.section-group'); const targetCard = e.target.closest('.card');
        if (targetCard && targetCard !== draggedItem && !draggedTab) {
          const rect = targetCard.getBoundingClientRect();
          let isAfter = e.clientX > rect.left + rect.width / 2;
          if (e.clientY < rect.top + rect.height * 0.25) isAfter = false;
          if (e.clientY > rect.bottom - rect.height * 0.25) isAfter = true;
          if (isAfter) targetCard.parentElement.insertBefore(draggedItem, targetCard.nextSibling); else targetCard.parentElement.insertBefore(draggedItem, targetCard);
        } else if (targetGroup && !targetCard && !draggedTab) {
          const targetGrid = targetGroup.querySelector('.grid');
          if (targetGrid && draggedItem.parentElement !== targetGrid) { 
            targetGrid.appendChild(draggedItem);
          }
        }
      }
    });

    let currentGroup = null; let currentGrid = null;
    const createGroup = (headingData) => {
      currentGroup = document.createElement('div'); currentGroup.className = 'section-group';
      if (headingData) {
        const heading = document.createElement('div'); heading.className = 'section-heading'; heading.textContent = headingData.name; heading.dataset.name = headingData.name; heading.setAttribute('draggable', 'true');
        heading.addEventListener('dragstart', (e) => { if(!isEditMode) return e.preventDefault(); draggedItem = heading; setTimeout(() => { heading.classList.add('dragging'); currentGroup.classList.add('dragging-group'); }, 0); });
        heading.addEventListener('dragend', () => { if(!draggedItem) return; draggedItem.classList.remove('dragging'); currentGroup.classList.remove('dragging-group'); updateDOMData(); draggedItem = null; });
        heading.addEventListener('contextmenu', (e) => { e.preventDefault(); showContextMenu(e, 'heading', heading); });
        currentGroup.appendChild(heading);
      }
      currentGrid = document.createElement('div'); currentGrid.className = 'grid'; currentGroup.appendChild(currentGrid); folderColumns.appendChild(currentGroup);
    };

    if (folder.engines.length === 0 || !folder.engines[0].isHeading) createGroup(null);

    folder.engines.forEach((item) => {
      if (item.isHeading) {
        createGroup(item);
      } else {
        const btn = document.createElement('div'); btn.className = 'card'; 
        btn.dataset.name = item.name; btn.dataset.url = item.url || ""; btn.dataset.home = item.home || ""; 
        btn.dataset.domain = item.domain || ""; btn.dataset.iconUrl = item.iconUrl || ""; btn.dataset.encoding = item.encoding || "UTF-8"; btn.setAttribute('draggable', 'true'); btn.dataset.hasSearch = item.url ? "true" : "false"; 
        btn.addEventListener('click', (e) => { 
          if (e.metaKey || e.ctrlKey) return; 
          if (document.body.classList.contains('mode-search')) { const query = searchInput.value.trim(); if (query === "") openLink(item.home); else if (item.url) executeSearch(item.url, item.home, item.encoding); } 
          else openLink(item.home); 
        });
        btn.addEventListener('dragstart', (e) => { if(!isEditMode) return e.preventDefault(); draggedItem = btn; setTimeout(() => btn.classList.add('dragging'), 0); });
        btn.addEventListener('dragend', () => { if(!draggedItem) return; draggedItem.classList.remove('dragging'); updateDOMData(); draggedItem = null; });
        btn.addEventListener('contextmenu', (e) => { e.preventDefault(); showContextMenu(e, 'item', btn); });
        let iconHtml = item.iconUrl ? `<img src="${item.iconUrl}" onerror="this.onerror=null; this.src='https://www.google.com/s2/favicons?domain=${item.domain}&sz=128';" alt="${item.name}">` : `<img src="https://www.google.com/s2/favicons?domain=${item.domain}&sz=128" onerror="this.onerror=null; this.src='https://logo.clearbit.com/${item.domain}';" alt="${item.name}">`;
        btn.innerHTML = `<div class="card-icon">${iconHtml}</div><div class="card-title">${item.name}</div>`; currentGrid.appendChild(btn);
      }
    });
    folderInner.appendChild(folderColumns);

    const actionBtns = document.createElement('div');
    actionBtns.style.display = 'flex';
    actionBtns.style.gap = '12px';
    actionBtns.style.marginTop = '16px';

    const addItemBtn = document.createElement('div');
    addItemBtn.className = 'add-heading-btn';
    addItemBtn.style.flex = '1';
    addItemBtn.style.marginTop = '0';
    addItemBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>アイテムを追加`;
    addItemBtn.addEventListener('click', () => {
      openEditModal("アイテムを追加", "", "", "", "", "UTF-8", 'item', 
        (name, homeUrl, searchUrl, iconUrl, enc) => { 
          if (!homeUrl || !name) return; if (!homeUrl.startsWith('http')) homeUrl = 'https://' + homeUrl; if (searchUrl && !searchUrl.startsWith('http')) searchUrl = 'https://' + searchUrl; 
          let domain = ""; try { domain = new URL(homeUrl).hostname; } catch(err){}
          appData[index].engines.push({ name: name, url: searchUrl || "", home: homeUrl, domain: domain, iconUrl: iconUrl || "", encoding: enc, isHeading: false });
          saveAppData(); renderApp();
        },
        () => {
          openJsonSelectModal(index);
        }
      );
    });

    const addHeadingBtn = document.createElement('div'); 
    addHeadingBtn.className = 'add-heading-btn'; 
    addHeadingBtn.style.flex = '1'; 
    addHeadingBtn.style.marginTop = '0';
    addHeadingBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>小見出しを追加`;
    addHeadingBtn.addEventListener('click', () => openEditModal("小見出しを追加", "", "", "", "", "", 'heading', (name) => { if (name && name.trim()) { appData[index].engines.push({ isHeading: true, name: name.trim() }); saveAppData(); renderApp(); } }));

    actionBtns.appendChild(addItemBtn);
    actionBtns.appendChild(addHeadingBtn);
    folderInner.appendChild(actionBtns); 

    folderDiv.appendChild(folderInner); 
    sliderContainer.appendChild(folderDiv); 
    
    folderDivsToObserve.push(folderDiv); 
  });

  const addFolderBtn = document.createElement('div'); addFolderBtn.className = 'tab add-folder-btn'; addFolderBtn.textContent = '＋ 追加'; addFolderBtn.title = '新しいフォルダを追加';
  addFolderBtn.addEventListener('click', () => { openEditModal("フォルダを追加", "", "", "", "", "", 'folder', (name) => { if (name && name.trim()) { appData.push({ folderName: name.trim(), engines: [] }); saveAppData(); renderApp(); setTimeout(() => { sliderContainer.scrollLeft = sliderContainer.scrollWidth; }, 100); } }); });
  tabsContainer.appendChild(addFolderBtn);

  // スクロール位置を確実に確定させてから監視をスタート
  setTimeout(() => { 
    if(sliderContainer.children.length > currentTabIndex) {
      sliderContainer.scrollLeft = sliderContainer.clientWidth * currentTabIndex; 
    }
    folderDivsToObserve.forEach(div => tabObserver.observe(div));
  }, 10);
}
renderApp();

document.getElementById('menuOpen').addEventListener('click', () => { if (window.currentContextTarget) window.open(window.currentContextTarget.dataset.home, '_blank', 'noopener,noreferrer'); document.getElementById('contextMenu').style.display = 'none'; });

document.getElementById('menuEdit').addEventListener('click', () => {
  const target = window.currentContextTarget; const type = window.currentContextType; if (!target) return;
  if (type === 'item') {
    openEditModal("編集", target.dataset.name, target.dataset.home, target.dataset.url, target.dataset.iconUrl || "", target.dataset.encoding || "UTF-8", 'item', 
    (newName, newHome, newUrl, newIconUrl, newEnc) => {
      if (newName) target.dataset.name = newName; 
      if (newHome) { if (!newHome.startsWith('http')) newHome = 'https://' + newHome; target.dataset.home = newHome; try{ target.dataset.domain = new URL(newHome).hostname; }catch(e){} }
      if (newUrl !== undefined) { if (newUrl && !newUrl.startsWith('http')) newUrl = 'https://' + newUrl; target.dataset.url = newUrl; }
      target.dataset.iconUrl = newIconUrl; target.dataset.encoding = newEnc; updateDOMData();
    }, null);
  } else if (type === 'heading') { 
    openEditModal("小見出しを編集", target.dataset.name, "", "", "", "", 'heading', (newName) => { if (newName) { target.dataset.name = newName; updateDOMData(); } }, null); 
  }
  document.getElementById('contextMenu').style.display = 'none';
});

document.getElementById('menuCopy').addEventListener('click', () => { if (window.currentContextTarget) { navigator.clipboard.writeText(window.currentContextTarget.dataset.home).then(() => { const btn = document.getElementById('menuCopy'); const orig = btn.innerHTML; btn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>Copied!`; setTimeout(() => btn.innerHTML = orig, 1500); }); } });

document.getElementById('menuRemove').addEventListener('click', () => { 
  const target = window.currentContextTarget; 
  if (target) { 
    target.style.transform = 'scale(0.8)'; target.style.opacity = '0'; 
    setTimeout(() => { target.remove(); updateDOMData(); }, 200); 
  } 
  document.getElementById('contextMenu').style.display = 'none'; 
});

document.getElementById('menuRenameFolder').addEventListener('click', () => { 
  const target = window.currentContextTarget; 
  if (target) { 
    const folder = appData[parseInt(target.dataset.index)]; 
    openEditModal("フォルダ名を変更", folder.folderName, "", "", "", "", 'folder', (newName) => { 
      if (newName && newName.trim()) { folder.folderName = newName.trim(); saveAppData(); renderApp(); } 
    }, null); 
  } 
  document.getElementById('contextMenu').style.display = 'none'; 
});

document.getElementById('menuRemoveFolder').addEventListener('click', () => { 
  const target = window.currentContextTarget; 
  if (target) { 
    if (appData.length <= 1) return showConfirm("エラー", "最後のフォルダは削除できません。", false, null, true);
    showConfirm("フォルダの削除", "このフォルダと中身をすべて削除しますか？", true, () => { 
      appData.splice(parseInt(target.dataset.index), 1); 
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