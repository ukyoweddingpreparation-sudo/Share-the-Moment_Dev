// =====================================================================
// 📱 【PWAモジュール】js/pwa.js
// ホーム画面追加のカスタムプロンプト（「はい」「今はしない」）を制御
// =====================================================================

let deferredPrompt = null;

export function initPWA() {
  // すでにインストール済みの場合は実行しない
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return;
  }

  // 「今はしない」が選択されていたら一定期間表示しない
  if (localStorage.getItem('pwa_dismissed') === 'true') {
    return;
  }

  // Androidなどのブラウザ標準プロンプトイベントをキャッチ
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // 標準のダサいバナーを非表示にする
    deferredPrompt = e;  // イベントを保持
    
    // 独自のカスタムインストールモーダルを表示する関数を呼ぶ
    showCustomInstallModal();
  });
}

/**
 * 独自の「ホーム画面に追加しますか？」モーダルを表示
 */
function showCustomInstallModal() {
  const modal = document.getElementById('pwaInstallModal'); // HTML側に用意するモーダルのID
  if (!modal) return;
  modal.style.display = 'block';

  const yesBtn = document.getElementById('pwaInstallYes');
  const noBtn = document.getElementById('pwaInstallNo');

  if (yesBtn) {
    yesBtn.onclick = async () => {
      modal.style.display = 'none';
      if (deferredPrompt) {
        deferredPrompt.prompt(); // Androidのインストール確認を起動
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          console.log('ユーザーがPWAインストールを承認しました');
        }
        deferredPrompt = null;
      } else {
        // iOS等、自動起動できない場合のガイドモーダルを表示
        showIosGuideModal();
      }
    };
  }

  if (noBtn) {
    noBtn.onclick = () => {
      modal.style.display = 'none';
      localStorage.setItem('pwa_dismissed', 'true');
    };
  }
}

function showIosGuideModal() {
  const iosModal = document.getElementById('iosGuideModal');
  if (iosModal) {
    iosModal.style.display = 'block';
  }
}
