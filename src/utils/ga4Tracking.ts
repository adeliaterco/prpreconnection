// 
// GA4 TRACKING SYSTEM - FIXED FOR DIRECT GTAG
// 

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

class GA4Tracking {
  
  // ✅ Checks if gtag is available
  private isAvailable(): boolean {
    return typeof window !== 'undefined' && typeof window.gtag === 'function';
  }

  // ✅ Sends event via window.gtag() - CORRECT FOR DIRECT GA4
  private sendEvent(eventName: string, params?: Record<string, any>) {
    if (this.isAvailable()) {
      window.gtag('event', eventName, {
        ...params
      });
      console.log(`📊 GA4 Event Sent: ${eventName}`, params);
    } else {
      console.warn(`⚠️ GA4 (gtag) not available for: ${eventName}`);
      // Fallback para não perder o evento caso o script demore a carregar
      if (typeof window !== 'undefined') {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(['event', eventName, params]);
      }
    }
  }

  // --- LANDING PAGE ---
  landingPageView() {
    this.sendEvent('page_view', {
      page_title: 'Landing Page',
      page_location: window.location.href,
      page_path: '/'
    });
  }

  landingCTAClick() {
    this.sendEvent('cta_click', {
      button_name: 'Start Analysis',
      button_location: 'landing_primary',
      page: 'landing'
    });
  }

  landingScrollDepth(depth: number) {
    this.sendEvent('scroll_depth', {
      depth_percentage: depth,
      page: 'landing'
    });
  }

  // --- CHAT ---
  chatPageView() {
    this.sendEvent('page_view', {
      page_title: 'Chat Analysis',
      page_location: window.location.href,
      page_path: '/chat'
    });
  }

  chatStarted() {
    this.sendEvent('chat_started', {
      page: 'chat'
    });
  }

  questionAnswered(questionId: number, questionText: string, answer: string) {
    this.sendEvent('question_answered', {
      question_id: questionId,
      question_text: questionText,
      answer: answer,
      page: 'chat'
    });
  }

  chatCompleted() {
    this.sendEvent('chat_completed', {
      page: 'chat'
    });
  }

  chatCTAClick() {
    this.sendEvent('cta_click', {
      button_name: 'See My Personalized Plan',
      button_location: 'chat_complete',
      page: 'chat'
    });
  }

  // --- RESULT ---
  resultPageView() {
    this.sendEvent('page_view', {
      page_title: 'Result Page',
      page_location: window.location.href,
      page_path: '/result'
    });
  }

  revelationViewed(revelationName: string, revelationNumber: number) {
    this.sendEvent('revelation_viewed', {
      revelation_name: revelationName,
      revelation_number: revelationNumber,
      page: 'result'
    });
  }

  videoStarted() {
    this.sendEvent('video_started', {
      video_name: 'VSL Personalized Plan',
      page: 'result'
    });
  }

  videoProgress(progress: number) {
    this.sendEvent('video_progress', {
      progress_percentage: progress,
      video_name: 'VSL Personalized Plan',
      page: 'result'
    });
  }

  videoCompleted() {
    this.sendEvent('video_completed', {
      video_name: 'VSL Personalized Plan',
      page: 'result'
    });
  }

  videoButtonUnlocked(params: { unlock_time_seconds: number; video_name: string }) {
    this.sendEvent('video_button_unlocked', {
      ...params,
      page: 'result'
    });
  }

  offerRevealed() {
    this.sendEvent('offer_revealed', {
      page: 'result'
    });
  }

  phaseProgressionClicked(params: { phase_from: number; phase_to: number; button_name: string }) {
    this.sendEvent('phase_progression_clicked', {
      ...params,
      page: 'result'
    });
  }

  ctaBuyClicked(position: string) {
    this.sendEvent('cta_buy_clicked', {
      button_position: position,
      page: 'result'
    });
  }

  spotsUpdated(spotsLeft: number) {
    this.sendEvent('spots_updated', {
      spots_left: spotsLeft,
      page: 'result'
    });
  }

  // --- PURCHASE ---
  purchaseInitiated(params: { product_name: string; price: number; currency: string }) {
    this.sendEvent('purchase_initiated', {
      ...params,
      page: 'result'
    });
  }

  purchaseCompleted(params: { product_name: string; price: number; currency: string; transaction_id?: string }) {
    this.sendEvent('purchase', {
      ...params
    });
  }
}

export const ga4Tracking = new GA4Tracking();