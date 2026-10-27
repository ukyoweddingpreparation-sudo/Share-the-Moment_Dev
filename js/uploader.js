// =====================================================================
// 📤 【アップロードモジュール】js/uploader.js
// Canvasを使った画像の軽量化（リサイズ・圧縮）とチャンク分割送信を管理
// =====================================================================

import { uploadPhotoChunk } from './api.js';

/**
 * 選択された画像ファイルを圧縮し、Base64形式の配列に変換する
 * @param {FileList|Array} files - ユーザーが選択したファイル群
 * @returns {Promise<Array>} 圧縮済み画像のオブジェクト配列
 */
export async function compressImages(files) {
  const compressedItems = [];
  const MAX_WIDTH = 1920; // 最大幅
  const MAX_HEIGHT = 1080; // 最大高さ
  const QUALITY = 0.8;     // 画質（0.0 〜 1.0）

  for (const file of files) {
    if (!file.type.startsWith('image/')) continue;

    const base64Data = await resizeImageToDataURL(file, MAX_WIDTH, MAX_HEIGHT, QUALITY);
    compressedItems.push({
      fileName: file.name || `photo_${Date.now()}.jpg`,
      base64Data: base64Data
    });
  }

  return compressedItems;
}

/**
 * 1枚の画像をCanvasでリサイズ・圧縮してDataURLにするヘルパー関数
 */
function resizeImageToDataURL(file, maxWidth, maxHeight, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // アスペクト比を維持してリサイズ計算
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // JPEG形式で圧縮
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * 複数枚の写真をチャンク（分割単位：例として3枚ずつ）に分けてサーバーへ送信する
 * @param {Array} compressedItems - 圧縮済み画像データの配列
 * @param {String} tableNo - テーブル番号
 * @param {String} userName - ゲスト名
 * @param {String} userMessage - メッセージ
 * @param {Function} onProgress - 進捗状況を通知するコールバック (optional)
 */
export async function uploadPhotosInChunks(compressedItems, tableNo, userName, userMessage, onProgress) {
  const CHUNK_SIZE = 3; // 一度に送信する枚数
  let targetFolderId = null;

  for (let i = 0; i < compressedItems.length; i += CHUNK_SIZE) {
    const chunk = compressedItems.slice(i, i + CHUNK_SIZE);
    
    if (onProgress) {
      onProgress(i + 1, compressedItems.length);
    }

    // api.jsを経由してGASにPOST送信（初回のみfolderIdがnullで新規作成、以降は同一フォルダに追加）
    const res = await uploadPhotoChunk(chunk, tableNo, userName, userMessage, targetFolderId);
    
    if (!res.success) {
      throw new Error("写真のアップロードに失敗しました");
    }

    // 2回目以降のチャンクは同じGoogleドライブフォルダに格納するためIDを保持
    targetFolderId = res.folderId;
  }

  return true;
}
