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
    console.log('Google Analytics: 測定IDが設定されていないため、初期化をスキップします');
    return;
  }

  // Google Analyticsのスクリプトを動的に追加
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script1);

  // 初期化スクリプトを動的に追加
  const script2 = document.createElement('script');
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${measurementId}');
  `;
  document.head.appendChild(script2);
  
  console.log('Google Analytics: 初期化完了', measurementId);
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
  
  // 検証コードが設定されていない場合は初期化をスキップ
  if (!searchConsoleCode) {
    console.warn('❌ Google Search Console: 検証コードが設定されていないため、メタタグの追加をスキップします');
    return;
  }

  // 既存のメタタグをチェック
  const existingMeta = document.querySelector('meta[name="google-site-verification"]');
  if (existingMeta) {
    console.log('⚠️ Google Search Console: 既存のメタタグが見つかりました:', existingMeta);
    return;
  }

  // Google Search Console検証メタタグを動的に追加
  const meta = document.createElement('meta');
  meta.name = 'google-site-verification';
  meta.content = searchConsoleCode;
  document.head.appendChild(meta);
  
  console.log('✅ Google Search Console: 検証メタタグを追加しました');
  console.log('🔍 追加されたメタタグ:', meta);
  
  // 追加確認
  const addedMeta = document.querySelector('meta[name="google-site-verification"]');
  console.log('🔍 追加後の確認:', addedMeta);
}; 