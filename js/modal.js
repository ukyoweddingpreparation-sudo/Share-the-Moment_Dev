// =====================================================================
// 🪟 【UIコンポーネント】js/modal.js
// テーブル選択・ゲスト名選択のモーダル開閉および動的リスト描画を管理
// =====================================================================

import { fetchGuests } from './api.js';

let cachedGuests = {};

/**
 * ゲスト名簿を事前に取得・キャッシュする
 */
export async function initGuestData() {
  cachedGuests = await fetchGuests();
  return cachedGuests;
}

/**
 * テーブル選択モーダルを開き、取得したテーブル一覧を描画する
 * @param {Function} onSelectTable - テーブルが選択されたときのコールバック
 */
export function openTableModal(onSelectTable) {
  const modal = document.getElementById('tableModal'); // 実際のHTML上のIDに合わせて調整してください
  const listContainer = document.getElementById('tableList');
  
  if (!modal || !listContainer) return;

  listContainer.innerHTML = '';
  const tables = Object.keys(cachedGuests);

  if (tables.length === 0) {
    listContainer.innerHTML = '<p>テーブル情報が読み込めませんでした</p>';
  } else {
    tables.forEach(table => {
      const btn = document.createElement('button');
      btn.className = 'table-select-btn';
      btn.textContent = table;
      btn.onclick = () => {
        onSelectTable(table);
        closeModal('tableModal');
      };
      listContainer.appendChild(btn);
    });
  }

  modal.style.display = 'block';
}

/**
 * ゲスト名選択モーダルを開き、該当テーブルのゲスト一覧を描画する
 * @param {String} tableNo - 選択されたテーブル番号
 * @param {Function} onSelectGuest - ゲスト名が選択されたときのコールバック
 */
export function openGuestModal(tableNo, onSelectGuest) {
  const modal = document.getElementById('guestModal');
  const listContainer = document.getElementById('guestList');
  
  if (!modal || !listContainer) return;

  listContainer.innerHTML = '';
  const guests = cachedGuests[tableNo] || [];

  if (guests.length === 0) {
    listContainer.innerHTML = '<p>該当するゲストが見つかりません</p>';
  } else {
    guests.forEach(guestName => {
      const btn = document.createElement('button');
      btn.className = 'guest-select-btn';
      btn.textContent = guestName;
      btn.onclick = () => {
        onSelectGuest(guestName);
        closeModal('guestModal');
      };
      listContainer.appendChild(btn);
    });
  }

  modal.style.display = 'block';
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = 'none';
}
