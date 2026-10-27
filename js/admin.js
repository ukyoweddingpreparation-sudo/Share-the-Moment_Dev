// =====================================================================
// 🎛️ 【管理者コントローラー】js/admin.js
// パスコード認証、サイネージ利用トグルの切り替え、各種管理機能を制御
// =====================================================================

import { fetchAppSettings, updateAppSettings } from './api.js';

// 仮の管理者パスコード（必要に応じて変更してください）
const ADMIN_PASSCODE = "2026"; 

document.addEventListener('DOMContentLoaded', () => {
  const authScreen = document.getElementById('authScreen');
  const adminMainScreen = document.getElementById('adminMainScreen');
  const loginBtn = document.getElementById('loginBtn');
  const passcodeIpt = document.getElementById('passcodeInput');
  const logoutBtn = document.getElementById('logoutBtn');
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  const signageToggle = document.getElementById('signageToggle');
  const toggleStatusLabel = document.getElementById('toggleStatusLabel');

  // すでにログインセッションがあるか確認
  if (sessionStorage.getItem('admin_logged_in') === 'true') {
    showAdminDashboard();
  }

  // ログインボタン
  if (loginBtn) {
    loginBtn.onclick = () => {
      if (passcodeIpt.value === ADMIN_PASSCODE) {
        sessionStorage.setItem('admin_logged_in', 'true');
        showAdminDashboard();
      } else {
        alert("パスコードが間違っています");
      }
    };
  }

  // ログアウトボタン
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      sessionStorage.removeItem('admin_logged_in');
      adminMainScreen.style.display = 'none';
      authScreen.style.display = 'flex';
      passcodeIpt.value = '';
    };
  }

  // 設定保存ボタン
  if (saveSettingsBtn) {
    saveSettingsBtn.onclick = async () => {
      const isEnabled = signageToggle.checked;
      saveSettingsBtn.textContent = "保存中...";
      
      const res = await updateAppSettings({ signageEnabled: isEnabled });
      if (res.success) {
        alert("設定を保存しました！");
      } else {
        alert("保存に失敗しました。");
      }
      saveSettingsBtn.textContent = "設定を保存";
    };
  }

  // ダッシュボードを表示する関数
  async function showAdminDashboard() {
    authScreen.style.display = 'none';
    adminMainScreen.style.display = 'block';

    // GASから現在の設定を取得して反映
    toggleStatusLabel.textContent = "設定を読み込み中...";
    const settings = await fetchAppSettings();
    
    signageToggle.checked = settings.signageEnabled;
    toggleStatusLabel.textContent = settings.signageEnabled ? "現在：利用する（ON）" : "現在：利用しない（OFF）";

    signageToggle.onchange = () => {
      toggleStatusLabel.textContent = signageToggle.checked ? "現在：利用する（ON）" : "現在：利用しない（OFF）";
    };
  }
});
