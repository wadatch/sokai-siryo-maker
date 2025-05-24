declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export const initGoogleAnalytics = () => {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  
  // 測定IDが設定されていない場合は初期化をスキップ
  if (!measurementId) {
    console.log('Google Analytics: 測定IDが設定されていないため、HTMLでの初期化もスキップされます');
    return;
  }

  // HTMLで静的に挿入されるため、ここでの動的挿入はスキップ
  console.log('Google Analytics: HTMLで静的に初期化済み', measurementId);
  
  // Google Analyticsが正しく読み込まれているかチェック
  if (typeof window.gtag === 'function') {
    console.log('✅ Google Analytics: 正常に読み込まれています');
  } else {
    console.log('⚠️ Google Analytics: まだ読み込まれていません（HTMLからの読み込み中）');
  }
};

export const initGoogleSearchConsole = () => {
  console.log('🔍 Google Search Console: 初期化開始');
  
  const searchConsoleCode = import.meta.env.VITE_GOOGLE_SEARCH_CONSOLE_CODE;
  console.log('🔍 VITE_GOOGLE_SEARCH_CONSOLE_CODE:', searchConsoleCode);
  console.log('🔍 typeof searchConsoleCode:', typeof searchConsoleCode);
  console.log('🔍 searchConsoleCode length:', searchConsoleCode?.length);
  
  // 環境変数の確認
  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  console.log('🔍 環境変数確認 - GA_ID:', gaId ? '設定済み' : '未設定');
  console.log('🔍 環境変数確認 - SEARCH_CONSOLE:', searchConsoleCode ? '設定済み' : '未設定');
  
  // 検証コードが設定されていない場合
  if (!searchConsoleCode) {
    console.warn('❌ Google Search Console: 検証コードが設定されていないため、HTMLでのメタタグ挿入もスキップされます');
    return;
  }

  // HTMLで静的に挿入されたメタタグをチェック
  const existingMeta = document.querySelector('meta[name="google-site-verification"]');
  if (existingMeta) {
    console.log('✅ Google Search Console: HTMLで静的に追加されたメタタグが見つかりました:', existingMeta);
    return;
  } else {
    console.warn('⚠️ Google Search Console: メタタグが見つかりません。ビルド時の環境変数設定を確認してください');
  }
}; 