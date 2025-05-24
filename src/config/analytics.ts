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
};

export const initGoogleSearchConsole = () => {
  const searchConsoleCode = import.meta.env.VITE_GOOGLE_SEARCH_CONSOLE_CODE;
  
  // 検証コードが設定されていない場合は初期化をスキップ
  if (!searchConsoleCode) {
    console.log('Google Search Console: 検証コードが設定されていないため、メタタグの追加をスキップします');
    return;
  }

  // Google Search Console検証メタタグを動的に追加
  const meta = document.createElement('meta');
  meta.name = 'google-site-verification';
  meta.content = searchConsoleCode;
  document.head.appendChild(meta);
  
  console.log('Google Search Console: 検証メタタグを追加しました', searchConsoleCode);
}; 