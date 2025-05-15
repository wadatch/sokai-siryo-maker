declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export const initGoogleAnalytics = () => {
  // Google Analyticsのスクリプトを動的に追加
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = 'https://www.googletagmanager.com/gtag/js?id=' + import.meta.env.VITE_GA_MEASUREMENT_ID;
  document.head.appendChild(script1);

  // 初期化スクリプト
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID);
}; 