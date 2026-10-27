// =====================================================================
// 🎯 【コントローラー】js/main.js
// ゲスト用アプリ（index.html）のエントリーポイント
// =====================================================================

import { initGuestData, openTableModal, openGuestModal } from './modal.js';
import { sendInquiry } from './api.js';

// アプリの状態管理
const state = {
  selectedTable: null,
  selectedGuest: null
};

document.addEventListener('DOMContentLoaded', async () => {
  console.log("Share the Moments: ゲストアプリを初期化中...");

  // 1. 起動時にGASからゲスト名簿を非同期でバックグラウンド取得・キャッシュ
  await initGuestData();
  console.log("ゲスト名簿の読み込みが完了しました。");

  // 2. UIのイベントリスナー（ボタンクリック等）のバインド
  initEventListeners();
});

function initEventListeners() {
  // テーブル選択ボタンのクリック
  const tableSelectBtn = document.getElementById('tableSelectBtn'); // 実際のHTMLのIDに合わせてください
  if (tableSelectBtn) {
    tableSelectBtn.addEventListener('click', () => {
      openTableModal((table) => {
        state.selectedTable = table;
        tableSelectBtn.textContent = table; // 選択されたテーブル名をボタンに表示
        console.log("選択されたテーブル:", table);
      });
    });
  }

  // ゲスト名選択ボタンのクリック
  const guestSelectBtn = document.getElementById('guestSelectBtn');
  if (guestSelectBtn) {
    guestSelectBtn.addEventListener('click', () => {
      if (!state.selectedTable) {
        alert("先にテーブルを選択してください");
        return;
      }
      openGuestModal(state.selectedTable, (guestName) => {
        state.selectedGuest = guestName;
        guestSelectBtn.textContent = guestName; // 選択された名前をボタンに表示
        console.log("選択されたゲスト名:", guestName);
      });
    });
  }

  // 問い合わせ送信フォームのバインド（例）
  const inquiryForm = document.getElementById('inquiryForm');
  if (inquiryForm) {
    inquiryForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const messageInput = document.getElementById('inquiryMessage');
      const message = messageInput ? messageInput.value : "";

      if (!state.selectedTable || !state.selectedGuest) {
        alert("テーブル番号とお名前を選択してください");
        return;
      }

      const res = await sendInquiry(state.selectedTable, state.selectedGuest, message);
      if (res.success) {
        alert("問い合わせを送信しました！");
        messageInput.value = "";
      } else {
        alert("送信に失敗しました。");
      }
    });
  }
}
