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
    if ((window as any).__trackingLoaded) return;
    (window as any).__trackingLoaded = true;

    // ========================================
    // ✅ GA4 - INICIALIZAÇÃO CORRETA
    // ========================================
    window.dataLayer = window.dataLayer || [];
    // Função gtag corrigida para o padrão oficial
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };
    
    window.gtag('js', new Date());
    window.gtag('config', 'G-QGN1GLM8HF', {
      page_path: window.location.pathname,
    });

    const ga4Script = document.createElement('script');
    ga4Script.async = true;
    ga4Script.src = 'https://www.googletagmanager.com/gtag/js?id=G-QGN1GLM8HF';
    document.head.appendChild(ga4Script);

    // ========================================
    // ✅ UTMIFY PIXEL
    // ========================================
    window.pixelId = "6968cae0711ae3d779186ed8";
    const pixelScript = document.createElement('script');
    pixelScript.async = true;
    pixelScript.defer = true;
    pixelScript.src = 'https://cdn.utmify.com.br/scripts/pixel/pixel.js';
    document.head.appendChild(pixelScript);

    // ========================================
    // ✅ UTMIFY UTMs
    // ========================================
    const utmsScript = document.createElement('script');
    utmsScript.async = true;
    utmsScript.defer = true;
    utmsScript.src = 'https://cdn.utmify.com.br/scripts/utms/latest.js';
    utmsScript.setAttribute('data-utmify-prevent-xcod-sck', '');
    utmsScript.setAttribute('data-utmify-prevent-subids', '');
    document.head.appendChild(utmsScript);

  }, []);

  return <>{children}</>;
}