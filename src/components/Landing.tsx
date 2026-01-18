import { useEffect } from 'react';
import { storage } from '../utils/storage';
import { ga4Tracking } from '../utils/ga4Tracking';

interface LandingProps {
    onNavigate: (page: string) => void;
}

export default function Landing({ onNavigate }: LandingProps) {
    // ========================================
    // ✅ UTM CAPTURE SYSTEM
    // ========================================
    const captureUTMs = () => {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const utms: Record<string, string> = {};

            // Capture standard UTMs
            const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
            utmParams.forEach(param => {
                const value = urlParams.get(param);
                if (value) utms[param] = value;
            });

            // Capture Click IDs
            const clickIds = ['fbclid', 'gclid', 'ttclid'];
            clickIds.forEach(param => {
                const value = urlParams.get(param);
                if (value) utms[param] = value;
            });

            // Store in localStorage
            if (Object.keys(utms).length > 0) {
                localStorage.setItem('quiz_utms', JSON.stringify(utms));
                console.log('✅ UTMs captured:', utms);
            } else {
                console.log('ℹ️ No UTMs found in URL');
            }
        } catch (error) {
            console.error('❌ Error capturing UTMs:', error);
        }
    };

    useEffect(() => {
        // ✅ CAPTURE UTMs AS SOON AS PAGE LOADS
        captureUTMs();
        ga4Tracking.landingPageView();
    }, []);

    const handleCTAClick = () => {
        ga4Tracking.landingCTAClick();
        onNavigate('chat');
    };

    return (
        <div className="landing-container">
            <div className="matrix-bg"></div>
            <div className="scanlines"></div>

            <div className="content-wrapper">
                <main className="landing-main-simple">
                    
                    {/* ========================================
                        HEADLINE - US MARKET VERSION
                        ======================================== */}
                    <h1 className="headline-simple">
                        <span className="alert-emoji">⚠️</span>
                        <span className="headline-text">
                            <span className="highlight-orange">WARNING</span>: There's a <span className="highlight-orange-italic">dirty trick</span>, but <span className="highlight-orange">effective</span> to get your ex back... 💔, and <span className="highlight-orange">it's right here</span>! So don't use <span className="highlight-orange">this 👇</span> if you're not ready for them to <span className="highlight-orange">come back begging</span>!
                        </span>
                    </h1>

                    {/* CTA BUTTON WITH PULSE ANIMATION */}
                    <div className="cta-section-simple">
                        <button className="cta-button-simple" onClick={handleCTAClick}>
                            <span className="cta-glow"></span>
                            <span className="cta-icon">⏰</span>
                            <span className="cta-text">DISCOVER BEFORE IT'S TOO LATE</span>
                        </button>
                    </div>

                </main>

                {/* MINIMALIST FOOTER */}
                <footer className="landing-footer-simple">
                    <p className="disclaimer-simple">
                        100% private and confidential analysis
                    </p>
                </footer>
            </div>

            {/* INLINE CSS - MOBILE OPTIMIZED */}
            <style>{`
                .landing-container {
                    min-height: 100vh;
                    min-height: -webkit-fill-available;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    background: #000;
                    overflow: hidden;
                    padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
                }

                .matrix-bg {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 0;
                }

                .scanlines {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 1;
                    pointer-events: none;
                }

                .content-wrapper {
                    position: relative;
                    z-index: 2;
                    width: 100%;
                    max-width: 800px;
                    padding: clamp(1rem, 4vw, 2rem);
                }

                .landing-main-simple {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: clamp(1.5rem, 5vw, 3rem);
                    min-height: 70vh;
                }

                /* HEADLINE WITH ORANGE/YELLOW HIGHLIGHTS */
                .headline-simple {
                    text-align: center;
                    font-size: clamp(1.5rem, 6vw, 2.5rem);
                    line-height: 1.3;
                    color: #fff;
                    font-weight: 700;
                    margin: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: clamp(0.5rem, 2vw, 1rem);
                }

                .alert-emoji {
                    font-size: clamp(2.5rem, 10vw, 4rem);
                    animation: pulse 2s infinite;
                }

                .headline-text {
                    font-size: clamp(1.3rem, 5vw, 2.2rem);
                    font-weight: 700;
                    line-height: 1.4;
                }

                /* ORANGE/YELLOW GRADIENT HIGHLIGHTS */
                .highlight-orange {
                    background: linear-gradient(135deg, #FFB800 0%, #FF8C00 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    font-weight: 800;
                }

                .highlight-orange-italic {
                    background: linear-gradient(135deg, #FFB800 0%, #FF8C00 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    font-weight: 800;
                    font-style: italic;
                }

                @keyframes pulse {
                    0%, 100% { 
                        opacity: 1; 
                        transform: scale(1);
                    }
                    50% { 
                        opacity: 0.7; 
                        transform: scale(1.1);
                    }
                }

                /* CTA WITH PULSE ANIMATION */
                .cta-section-simple {
                    width: 100%;
                    display: flex;
                    justify-content: center;
                    padding: 0 clamp(0.5rem, 2vw, 1rem);
                }

                .cta-button-simple {
                    background: linear-gradient(135deg, #ff3b3b 0%, #ff6b6b 100%);
                    color: #fff;
                    border: none;
                    border-radius: clamp(12px, 3vw, 16px);
                    padding: clamp(1.25rem, 4vw, 2rem) clamp(1.5rem, 5vw, 3rem);
                    font-size: clamp(1rem, 4vw, 1.5rem);
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 8px 24px rgba(255, 59, 59, 0.4);
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: clamp(0.5rem, 2vw, 1rem);
                    width: 100%;
                    max-width: 500px;
                    text-transform: uppercase;
                    letter-spacing: clamp(0.5px, 0.2vw, 1px);
                    animation: pulse-cta 2s ease-in-out infinite;
                    touch-action: manipulation;
                    -webkit-tap-highlight-color: transparent;
                    -webkit-user-select: none;
                    user-select: none;
                    min-height: 56px;
                }

                @keyframes pulse-cta {
                    0%, 100% { 
                        transform: scale(1);
                        box-shadow: 0 8px 24px rgba(255, 59, 59, 0.4);
                    }
                    50% { 
                        transform: scale(1.03);
                        box-shadow: 0 12px 32px rgba(255, 59, 59, 0.6);
                    }
                }

                .cta-button-simple:hover {
                    transform: translateY(-4px) scale(1.02);
                    box-shadow: 0 12px 32px rgba(255, 59, 59, 0.6);
                    animation: none;
                }

                .cta-button-simple:active {
                    transform: translateY(-2px) scale(1.01);
                    box-shadow: 0 6px 20px rgba(255, 59, 59, 0.5);
                }

                .cta-icon {
                    font-size: clamp(1.25rem, 5vw, 2rem);
                }

                .cta-text {
                    position: relative;
                    z-index: 2;
                }

                .cta-glow {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                    animation: glow-slide 3s infinite;
                    z-index: 1;
                }

                @keyframes glow-slide {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }

                /* MINIMALIST FOOTER */
                .landing-footer-simple {
                    text-align: center;
                    padding: clamp(1rem, 4vw, 2rem) 0;
                    margin-top: clamp(2rem, 6vw, 4rem);
                }

                .disclaimer-simple {
                    font-size: clamp(0.75rem, 3vw, 0.85rem);
                    color: rgba(255, 255, 255, 0.5);
                    margin: 0;
                }

                /* RESPONSIVE - Mobile-first approach */
                @media (max-width: 480px) {
                    .cta-button-simple {
                        flex-direction: column;
                        gap: 0.5rem;
                        padding: 1.25rem 1rem;
                    }
                }
            `}</style>
        </div>
    );
}
