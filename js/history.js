// =====================================================================
// 📜 【履歴管理モジュール】js/history.js
// サーバーサイド（スプレッドシート）から送信履歴を取得し、画面に美しく描画
// =====================================================================

import { fetchUserHistory } from './api.js';

/**
 * ユーザーの送信履歴をサーバーから取得し、指定されたコンテナに描画する
 * @param {String} tableNo - テーブル番号
 * @param {String} userName - ゲスト名
 * @param {String} containerId - 描画先のDOM要素のID
 */
export async function loadAndRenderHistory(tableNo, userName, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '<p class="loading-text">送信履歴を読み込み中...</p>';

  // api.jsを経由してサーバーから該当ユーザーの履歴をフェッチ
  const historyList = await fetchUserHistory(tableNo, userName);

  container.innerHTML = '';

  if (!historyList || historyList.length === 0) {
    container.innerHTML = '<p class="no-history-text">まだ送信された写真はありません</p>';
    return;
  }

  // タイムスタンプごとにグループ化するか、時系列でカードを描画
  historyList.forEach(item => {
    const card = document.createElement('div');
    card.className = 'history-card';
    
    card.innerHTML = `
      <div class="history-img-wrapper">
        <img src="${item.url}" alt="送信写真" loading="lazy">
      </div>
      <div class="history-info">
        <span class="history-date">${item.date}</span>
        ${item.message ? `<p class="history-msg">"${item.message}"</p>` : ''}
      </div>
    `;
    container.appendChild(card);
  });
}
