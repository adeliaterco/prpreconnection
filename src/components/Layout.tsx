import { ReactNode, useEffect } from 'react';

declare global {
  interface Window {
    dataLayer: any[];
    pixelId: string;
    gtag: (...args: any[]) => void;
  }
}

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  
  useEffect(() => {
    // ========================================
    // ✅ PREVENT DUPLICATE LOADING
    // ========================================
    if ((window as any).__trackingLoaded) {
      console.log('Tracking already loaded');
      return;
    }
    (window as any).__trackingLoaded = true;

    // ========================================
    // ✅ GA4 - Google Analytics 4
    // ========================================
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', 'G-QGN1GLM8HF');

    const ga4Script = document.createElement('script');
    ga4Script.async = true;
    ga4Script.src = 'https://www.googletagmanager.com/gtag/js?id=G-QGN1GLM8HF';
    ga4Script.onload = () => console.log('✅ GA4 loaded successfully');
    document.head.appendChild(ga4Script);

    // ========================================
    // ✅ UTMIFY PIXEL
    // ========================================
    window.pixelId = "6968cae0711ae3d779186ed8";
    const pixelScript = document.createElement('script');
    pixelScript.async = true;
    pixelScript.defer = true;
    pixelScript.src = 'https://cdn.utmify.com.br/scripts/pixel/pixel.js';
    pixelScript.onload = () => console.log('✅ UTMify Pixel loaded');
    document.head.appendChild(pixelScript);

    // ========================================
    // ✅ UTMIFY UTMs (preserva UTMs até checkout)
    // ========================================
    const utmsScript = document.createElement('script');
    utmsScript.async = true;
    utmsScript.defer = true;
    utmsScript.src = 'https://cdn.utmify.com.br/scripts/utms/latest.js';
    utmsScript.setAttribute('data-utmify-prevent-xcod-sck', '');
    utmsScript.setAttribute('data-utmify-prevent-subids', '');
    utmsScript.onload = () => console.log('✅ UTMify UTMs loaded');
    document.head.appendChild(utmsScript);

    console.log("✅ All tracking scripts loaded");

  }, []);

  return (
    <>
      {children}
    </>
  );
}
