import { useState, useEffect, useRef } from 'react';
import { storage } from '../utils/storage';
import { playKeySound, getHotmartUrl } from '../utils/animations';
import { QuizAnswer } from '../types/quiz';
import { ga4Tracking } from '../utils/ga4Tracking';
import { tracking } from '../utils/tracking';
import mentionedInImage from '../assets/mentioned-in.webp';

import { 
    getTitle, 
    getLoadingMessage, 
    getCopy, 
    getVentana72Copy,
    getOfferTitle,
    getFeatures, 
    getCTA,
    getFaseText
} from '../utils/contentByGender';
import { getEmotionalValidation } from '../utils/emotionalValidation';

interface ResultProps {
    onNavigate: (page: string) => void;
}

export default function Result({ onNavigate }: ResultProps) {
    const [currentPhase, setCurrentPhase] = useState(0);
    const [fadeOutPhase, setFadeOutPhase] = useState<number | null>(null);
    const [videoButtonDelayLeft, setVideoButtonDelayLeft] = useState(20);
    const [isVideoButtonEnabled, setIsVideoButtonEnabled] = useState(false);
    const [buttonCheckmarks, setButtonCheckmarks] = useState<{[key: number]: boolean}>({
        0: false,
        1: false,
        2: false
    });

    const getInitialTime = () => {
        const savedTimestamp = localStorage.getItem('quiz_timer_start');
        if (savedTimestamp) {
            const startTime = parseInt(savedTimestamp);
            const now = Date.now();
            const elapsed = Math.floor((now - startTime) / 1000);
            const remaining = (47 * 60) - elapsed;
            return remaining > 0 ? remaining : 0;
        }
        localStorage.setItem('quiz_timer_start', Date.now().toString());
        return 47 * 60;
    };

    const [timeLeft, setTimeLeft] = useState(getInitialTime());
    const [spotsLeft, setSpotsLeft] = useState(storage.getSpotsLeft());
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [loadingStep, setLoadingStep] = useState(0);
    const [peopleBuying, setPeopleBuying] = useState(Math.floor(Math.random() * 5) + 1);

    const quizData = storage.getQuizData();
    const diagnosticoSectionRef = useRef<HTMLDivElement>(null);
    const videoSectionRef = useRef<HTMLDivElement>(null);
    const ventana72SectionRef = useRef<HTMLDivElement>(null);
    const preOfferVideoSectionRef = useRef<HTMLDivElement>(null);
    const offerSectionRef = useRef<HTMLDivElement>(null);

    const gender = quizData.gender || 'MALE';

    const loadingSteps = [
        { icon: '📊', text: 'Responses processed', duration: 0 },
        { icon: '🧠', text: 'Generating your personalized diagnosis...', duration: 1000 }
    ];

    const getUTMs = (): Record<string, string> => {
        try {
            const storedUTMs = localStorage.getItem('quiz_utms');
            return storedUTMs ? JSON.parse(storedUTMs) : {};
        } catch (error) {
            return {};
        }
    };

    const ensureUTMs = () => {
        const utms = getUTMs();
        if (Object.keys(utms).length > 0 && window.location.search === '') {
            const utmString = Object.entries(utms)
                .map(([key, value]) => `${key}=${encodeURIComponent(value as string)}`)
                .join('&');
            window.history.replaceState({}, '', `${window.location.pathname}?${utmString}`);
        }
    };

    const appendUTMsToHotmartURL = (): string => {
        const baseURL = getHotmartUrl();
        const utms = getUTMs();
        if (Object.keys(utms).length === 0) return baseURL;
        const url = new URL(baseURL);
        Object.entries(utms).forEach(([key, value]) => url.searchParams.set(key, value as string));
        return url.toString();
    };

    useEffect(() => {
        ensureUTMs();
        tracking.pageView('result');
        ga4Tracking.resultPageView();
        window.scrollTo(0, 0);

        const progressInterval = setInterval(() => {
            setLoadingProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    return 100;
                }
                return prev + 4;
            });
        }, 100);

        loadingSteps.forEach((step, index) => {
            setTimeout(() => setLoadingStep(index), step.duration);
        });

        const timerPhase1 = setTimeout(() => {
            setCurrentPhase(1);
            playKeySound();
            tracking.revelationViewed('why_left');
            ga4Tracking.revelationViewed('Why They Left', 1);
        }, 2500);

        const countdownInterval = setInterval(() => setTimeLeft(prev => (prev <= 1 ? 0 : prev - 1)), 1000);

        const spotsInterval = setInterval(() => {
            setSpotsLeft(prev => {
                if (prev > 15) {
                    const newSpots = prev - 1;
                    storage.setSpotsLeft(newSpots);
                    ga4Tracking.spotsUpdated(newSpots);
                    return newSpots;
                }
                return prev;
            });
        }, 45000);

        const buyingInterval = setInterval(() => {
            setPeopleBuying(prev => {
                const change = Math.random() > 0.5 ? 1 : -1;
                let newCount = prev + change;
                if (newCount < 1) newCount = 1;
                if (newCount > 7) newCount = 7;
                return newCount;
            });
        }, Math.floor(Math.random() * 10000) + 5000);

        return () => {
            clearInterval(progressInterval);
            clearTimeout(timerPhase1);
            clearInterval(countdownInterval);
            clearInterval(spotsInterval);
            clearInterval(buyingInterval);
        };
    }, []);

    useEffect(() => {
        let delayInterval: NodeJS.Timeout;
        if (currentPhase === 2) {
            setVideoButtonDelayLeft(20);
            setIsVideoButtonEnabled(false);

            delayInterval = setInterval(() => {
                setVideoButtonDelayLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(delayInterval);
                        setIsVideoButtonEnabled(true);
                        ga4Tracking.videoButtonUnlocked({ unlock_time_seconds: 50, video_name: 'VSL Personalized Plan' });
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (delayInterval) clearInterval(delayInterval);
        };
    }, [currentPhase]);

    useEffect(() => {
        if (currentPhase !== 2 || !videoSectionRef.current) return;
        
        const timer = setTimeout(() => {
            const vslPlaceholder = videoSectionRef.current?.querySelector('.vsl-placeholder');
            if (vslPlaceholder) {
                vslPlaceholder.innerHTML = `
                    <div style="position: relative; width: 100%; max-width: 100%; margin: 0 auto; aspect-ratio: 9 / 16; background: #000; border-radius: 8px; overflow: hidden;">
                        <vturb-smartplayer id="vid-696c0551b5b7b3215a710994" style="display: block; width: 100%; height: 100%; position: absolute; top: 0; left: 0;"></vturb-smartplayer>
                    </div>
                `;
                if (!document.querySelector('script[src*="696c0551b5b7b3215a710994"]')) {
                    const s = document.createElement("script");
                    s.src = "https://scripts.converteai.net/3a065640-eb45-46c2-91c4-76240dafeb82/players/696c0551b5b7b3215a710994/v4/player.js";
                    s.async = true;
                    document.head.appendChild(s);
                }
            }
        }, 500);
        
        return () => clearTimeout(timer);
    }, [currentPhase]);

    useEffect(() => {
        if (currentPhase !== 4 || !preOfferVideoSectionRef.current) return;
        
        const timer = setTimeout(() => {
            if (!document.querySelector('script[src*="696c0559a4304f1d777785ce"]')) {
                const s = document.createElement("script");
                s.src = "https://scripts.converteai.net/3a065640-eb45-46c2-91c4-76240dafeb82/players/696c0559a4304f1d777785ce/v4/player.js";
                s.async = true;
                document.head.appendChild(s);
            }
        }, 500);
        
        return () => clearTimeout(timer);
    }, [currentPhase]);

    useEffect(() => {
        let targetRef: React.RefObject<HTMLDivElement> | null = null;
        
        switch (currentPhase) {
            case 1:
                targetRef = diagnosticoSectionRef;
                break;
            case 2:
                targetRef = videoSectionRef;
                break;
            case 3:
                targetRef = ventana72SectionRef;
                break;
            case 4:
                targetRef = preOfferVideoSectionRef;
                break;
        }

        if (targetRef && targetRef.current) {
            setTimeout(() => {
                targetRef!.current!.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }, [currentPhase]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handlePhase1ButtonClick = () => {
        playKeySound();
        setButtonCheckmarks(prev => ({ ...prev, 0: true }));
        setFadeOutPhase(1);

        setTimeout(() => {
            setCurrentPhase(2);
            ga4Tracking.phaseProgressionClicked({ phase_from: 1, phase_to: 2, button_name: 'Unlock The Secret Video' });
            tracking.vslEvent('started');
            ga4Tracking.videoStarted();
            setFadeOutPhase(null);
        }, 400);
    };

    const handlePhase2ButtonClick = () => {
        if (!isVideoButtonEnabled) return;
        playKeySound();
        setButtonCheckmarks(prev => ({ ...prev, 1: true }));
        setFadeOutPhase(2);

        setTimeout(() => {
            setCurrentPhase(3);
            ga4Tracking.phaseProgressionClicked({ phase_from: 2, phase_to: 3, button_name: 'Reveal 72-HOUR WINDOW' });
            tracking.revelationViewed('72h_window');
            ga4Tracking.revelationViewed('72 Hour Window', 2);
            setFadeOutPhase(null);
        }, 400);
    };

    const handlePhase3ButtonClick = () => {
        playKeySound();
        setButtonCheckmarks(prev => ({ ...prev, 2: true }));
        setFadeOutPhase(3);

        setTimeout(() => {
            setCurrentPhase(4);
            ga4Tracking.phaseProgressionClicked({ phase_from: 3, phase_to: 4, button_name: 'Reveal My Personalized Plan' });
            tracking.revelationViewed('offer');
            ga4Tracking.revelationViewed('Offer Revealed', 3);
            ga4Tracking.offerRevealed();
            setFadeOutPhase(null);
        }, 400);
    };

    const handleCTAClick = () => {
        tracking.ctaClicked('result_buy');
        ga4Tracking.ctaBuyClicked('result_buy_main');
        window.open(appendUTMsToHotmartURL(), '_blank');
    };

    const getDelayEmoji = (secondsLeft: number) => {
        const progress = (50 - secondsLeft) / 50;
        if (progress < 0.2) return '😴';
        if (progress < 0.4) return '⏳';
        if (progress < 0.7) return '🔥';
        return '🚀';
    };

    const phases = ['Diagnosis', 'Video', '72h Window', 'Solution'];

    return (
        <div className="result-container">
            <div className="result-header">
                <h1 className="result-title">Your Personalized Plan Is Ready</h1>
                <div className="urgency-bar">
                    <span className="urgency-icon">⚠️</span>
                    <span className="urgency-text">Your analysis expires in: {formatTime(timeLeft)}</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: '8px' }}>
                    For security, your personalized diagnosis will only be available for 47 minutes.
                </p>
            </div>

            {currentPhase > 0 && (
                <div className="progress-bar-container fade-in">
                    {phases.map((label, index) => (
                        <div key={index} className={`progress-step ${currentPhase > index + 1 ? 'completed' : ''} ${currentPhase === index + 1 ? 'active' : ''}`}>
                            <div className="step-circle">{currentPhase > index + 1 ? '✅' : index + 1}</div>
                            <span className="step-label">{label}</span>
                        </div>
                    ))}
                </div>
            )}

            <div className="revelations-container">
                
                {currentPhase === 0 && (
                    <div className="revelation fade-in loading-box-custom">
                        <div className="loading-inner">
                            <div className="spin-brain">🧠</div>
                            <h2>ANALYZING YOUR CASE</h2>
                            <p>{getLoadingMessage(gender)}</p>
                            <div className="loading-steps-list">
                                {loadingSteps.map((step, i) => (
                                    <div key={i} className={`loading-step-item ${i <= loadingStep ? 'active' : ''}`}>
                                        {i < loadingStep ? '✅' : step.icon} {step.text}
                                    </div>
                                ))}
                            </div>
                            <div className="progress-outer"><div className="progress-inner" style={{ width: `${loadingProgress}%` }}></div></div>
                            <div className="progress-labels"><span>{loadingProgress}%</span><span>⏱️ {Math.ceil((100 - loadingProgress) / 10)}s...</span></div>
                        </div>
                    </div>
                )}

                {currentPhase === 1 && (
                    <div 
                        ref={diagnosticoSectionRef} 
                        className={`revelation fade-in ${fadeOutPhase === 1 ? 'fade-out' : ''}`}
                    >
                        <div className="revelation-header">
                            <div className="revelation-icon">💔</div>
                            <h2>{getTitle(gender)}</h2>
                        </div>
                        
                        <div className="quiz-summary-box">
                            <p className="summary-title">📋 YOUR SPECIFIC SITUATION</p>
                            <div className="summary-grid">
                                <div><span>✓</span> <strong>Time:</strong> {quizData.timeSeparation || 'Not specified'}</div>
                                <div><span>✓</span> <strong>Who ended it:</strong> {quizData.whoEnded || 'Not specified'}</div>
                                <div><span>✓</span> <strong>Contact:</strong> {quizData.currentSituation || 'Not specified'}</div>
                                <div><span>✓</span> <strong>Commitment:</strong> {quizData.commitmentLevel || 'Not specified'}</div>
                            </div>
                        </div>

                        <p className="revelation-text" style={{ whiteSpace: 'pre-line' }}>{getCopy(quizData)}</p>

                        <div className="emotional-validation">
                            <p><strong>Your specific situation:</strong><br />{getEmotionalValidation(quizData)}</p>
                        </div>

                        {buttonCheckmarks[0] ? (
                            <div className="checkmark-container">
                                <div className="checkmark-glow">✅</div>
                            </div>
                        ) : (
                            <button 
                                className="cta-button btn-green btn-size-1 btn-animation-fadein" 
                                onClick={handlePhase1ButtonClick}
                            >
                                🔓 Unlock The Secret Video
                            </button>
                        )}
                    </div>
                )}

                {currentPhase === 2 && (
                    <div 
                        ref={videoSectionRef} 
                        className={`revelation fade-in vsl-revelation ${fadeOutPhase === 2 ? 'fade-out' : ''}`}
                    >
                        <div className="revelation-header">
                            <h2>Now there's just one more step to win back the one you love.</h2>
                        </div>
                        <div className="vsl-container">
                            <div className="vsl-placeholder"></div> 
                        </div>

                        {buttonCheckmarks[1] ? (
                            <div className="checkmark-container">
                                <div className="checkmark-glow">✅</div>
                            </div>
                        ) : (
                            <div className="video-delay-indicator">
                                {!isVideoButtonEnabled ? (
                                    <>
                                        <p className="delay-text">
                                            {getDelayEmoji(videoButtonDelayLeft)} Next section in {videoButtonDelayLeft} seconds...
                                        </p>
                                        <div className="delay-progress-bar-container">
                                            <div 
                                                className="delay-progress-bar" 
                                                style={{ width: `${((50 - videoButtonDelayLeft) / 50) * 100}%` }}
                                            ></div>
                                        </div>
                                        <button 
                                            className="cta-button btn-yellow btn-size-2 btn-animation-bounce disabled" 
                                            disabled
                                        >
                                            Reveal 72-HOUR WINDOW
                                        </button>
                                    </>
                                ) : (
                                    <button 
                                        className="cta-button btn-yellow btn-size-2 btn-animation-bounce" 
                                        onClick={handlePhase2ButtonClick}
                                    >
                                        Reveal 72-HOUR WINDOW
                                    </button>
                                )}
                            </div>
                        )}

                        <div className="testimonials-section fade-in" style={{
                            marginTop: 'clamp(32px, 6vw, 48px)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'clamp(20px, 4vw, 24px)'
                        }}>
                            <div className="testimonial-card" style={{
                                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(74, 222, 128, 0.1))',
                                border: '2px solid rgba(16, 185, 129, 0.4)',
                                borderRadius: '16px',
                                padding: 'clamp(20px, 5vw, 28px)',
                                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
                                display: 'flex',
                                gap: 'clamp(16px, 4vw, 20px)',
                                alignItems: 'flex-start'
                            }}>
                                <img 
                                    src="https://comprarplanseguro.shop/wp-content/uploads/2025/08/Captura-de-Tela-2025-08-08-as-19.24.05.png" 
                                    alt="Robert Smith" 
                                    style={{
                                        width: 'clamp(60px, 15vw, 80px)',
                                        height: 'clamp(60px, 15vw, 80px)',
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        border: '3px solid rgba(16, 185, 129, 0.6)',
                                        flexShrink: 0
                                    }}
                                />
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        marginBottom: 'clamp(8px, 2vw, 12px)'
                                    }}>
                                        <strong style={{
                                            fontSize: 'clamp(1rem, 4vw, 1.25rem)',
                                            color: '#10b981'
                                        }}>
                                            Robert Smith
                                        </strong>
                                        <span style={{
                                            fontSize: 'clamp(0.75rem, 3vw, 0.875rem)',
                                            color: 'rgba(255,255,255,0.6)'
                                        }}>
                                            • 29 years • New York
                                        </span>
                                    </div>
                                    <div style={{
                                        color: '#facc15',
                                        fontSize: 'clamp(1rem, 4vw, 1.25rem)',
                                        marginBottom: 'clamp(8px, 2vw, 10px)'
                                    }}>
                                        ⭐⭐⭐⭐⭐
                                    </div>
                                    <p style={{
                                        fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)',
                                        lineHeight: '1.6',
                                        color: 'white',
                                        margin: 0,
                                        fontStyle: 'italic'
                                    }}>
                                        "She was with another guy. I was destroyed. Module 4 saved me from making fatal mistakes."
                                    </p>
                                </div>
                            </div>

                            <div className="testimonial-card" style={{
                                background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(250, 204, 21, 0.1))',
                                border: '2px solid rgba(234, 179, 8, 0.4)',
                                borderRadius: '16px',
                                padding: 'clamp(20px, 5vw, 28px)',
                                boxShadow: '0 8px 24px rgba(234, 179, 8, 0.3)',
                                display: 'flex',
                                gap: 'clamp(16px, 4vw, 20px)',
                                alignItems: 'flex-start'
                            }}>
                                <img 
                                    src="https://comprarplanseguro.shop/wp-content/uploads/2025/08/Captura-de-Tela-2025-08-08-as-19.01.05.png" 
                                    alt="James Williams" 
                                    style={{
                                        width: 'clamp(60px, 15vw, 80px)',
                                        height: 'clamp(60px, 15vw, 80px)',
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        border: '3px solid rgba(234, 179, 8, 0.6)',
                                        flexShrink: 0
                                    }}
                                />
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        marginBottom: 'clamp(8px, 2vw, 12px)'
                                    }}>
                                        <strong style={{
                                            fontSize: 'clamp(1rem, 4vw, 1.25rem)',
                                            color: '#eab308'
                                        }}>
                                            James Williams
                                        </strong>
                                        <span style={{
                                            fontSize: 'clamp(0.75rem, 3vw, 0.875rem)',
                                            color: 'rgba(255,255,255,0.6)'
                                        }}>
                                            • 32 years • Los Angeles
                                        </span>
                                    </div>
                                    <div style={{
                                        color: '#facc15',
                                        fontSize: 'clamp(1rem, 4vw, 1.25rem)',
                                        marginBottom: 'clamp(8px, 2vw, 10px)'
                                    }}>
                                        ⭐⭐⭐⭐⭐
                                    </div>
                                    <p style={{
                                        fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)',
                                        lineHeight: '1.6',
                                        color: 'white',
                                        margin: 0,
                                        fontStyle: 'italic'
                                    }}>
                                        "We hadn't talked for 5 months. In 13 days she unblocked me and texted me first."
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {currentPhase === 3 && (
                    <div 
                        ref={ventana72SectionRef} 
                        className={`revelation fade-in ventana-box-custom ${fadeOutPhase === 3 ? 'fade-out' : ''}`}
                    >
                        <div className="ventana-header-custom">
                            <span>⚡</span>
                            <h2>THE 72-HOUR WINDOW</h2>
                        </div>
                        <p className="ventana-intro" style={{ whiteSpace: 'pre-line' }}>{getVentana72Copy(gender)}</p>
                        <div className="fases-list">
                            {[1, 2, 3].map(f => (
                                <div key={f} className="fase-item-custom">
                                    <strong>PHASE {f} ({f === 1 ? '0-24h' : f === 2 ? '24-48h' : '48-72h'})</strong>
                                    <p style={{ whiteSpace: 'pre-line' }}>{getFaseText(gender, f)}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mentioned-in-container">
                            <p className="mentioned-in-title">Mentioned in</p>
                            <div className="mentioned-in-image-wrapper">
                                <img 
                                    src={mentionedInImage} 
                                    alt="As Seen In - TechCrunch, Bustle, The New York Times, Forbes" 
                                    className="ventana-img"
                                />
                            </div>
                        </div>

                        {buttonCheckmarks[2] ? (
                            <div className="checkmark-container">
                                <div className="checkmark-glow">✅</div>
                            </div>
                        ) : (
                            <button 
                                className="cta-button btn-orange btn-size-3 btn-animation-pulse" 
                                onClick={handlePhase3ButtonClick}
                            >
                                ⚡ Reveal My Personalized Plan
                            </button>
                        )}
                    </div>
                )}

                {currentPhase === 4 && (
                    <div 
                        ref={preOfferVideoSectionRef}
                        className="pre-offer-video-section fade-in"
                        style={{
                            marginBottom: 'clamp(32px, 6vw, 48px)',
                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(234, 179, 8, 0.1))',
                            border: '3px solid rgba(16, 185, 129, 0.4)',
                            borderRadius: '16px',
                            padding: 'clamp(20px, 5vw, 32px)',
                            boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)'
                        }}
                    >
                        <div style={{
                            textAlign: 'center',
                            marginBottom: 'clamp(20px, 4vw, 24px)'
                        }}>
                            <h3 style={{
                                fontSize: 'clamp(1.25rem, 5vw, 1.75rem)',
                                color: '#10b981',
                                fontWeight: '900',
                                marginBottom: 'clamp(12px, 3vw, 16px)'
                            }}>
                                🎥 FINAL MESSAGE BEFORE REVEALING YOUR PLAN
                            </h3>
                            <p style={{
                                fontSize: 'clamp(0.95rem, 4vw, 1.1rem)',
                                color: 'rgba(255,255,255,0.9)',
                                lineHeight: '1.6'
                            }}>
                                Watch this last important message before accessing your personalized solution
                            </p>
                        </div>
                        
                        <div style={{
                            position: 'relative',
                            width: '100%',
                            maxWidth: '100%',
                            margin: '0 auto',
                            aspectRatio: '9 / 16',
                            background: '#000',
                            borderRadius: '8px',
                            overflow: 'hidden'
                        }}>
                            <vturb-smartplayer 
                                id="vid-696c0559a4304f1d777785ce" 
                                style={{
                                    display: 'block',
                                    width: '100%',
                                    height: '100%',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0
                                }}
                            ></vturb-smartplayer>
                        </div>
                    </div>
                )}

                {currentPhase >= 4 && (
                    <div ref={offerSectionRef} className="revelation fade-in offer-section-custom">
                        <div className="offer-badge">EXCLUSIVE OFFER</div>
                        <h2 className="offer-title-main">{getOfferTitle(gender)}</h2>

                        <div className="value-stack-box" style={{
                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(234, 179, 8, 0.1))',
                            border: '3px solid rgba(16, 185, 129, 0.4)',
                            borderRadius: '16px',
                            padding: 'clamp(20px, 5vw, 32px)',
                            marginBottom: 'clamp(24px, 5vw, 32px)',
                            boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)'
                        }}>
                            <h3 style={{
                                fontSize: 'clamp(1.25rem, 5vw, 1.75rem)',
                                color: '#10b981',
                                textAlign: 'center',
                                marginBottom: 'clamp(16px, 4vw, 24px)',
                                fontWeight: '900'
                            }}>
                                💎 WHAT YOU GET TODAY
                            </h3>
                            
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 'clamp(8px, 2vw, 12px)',
                                marginBottom: 'clamp(16px, 4vw, 20px)'
                            }}>
                                <div className="value-item" style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: 'clamp(8px, 2vw, 12px)',
                                    background: 'rgba(0,0,0,0.3)',
                                    borderRadius: '8px'
                                }}>
                                    <span style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.1rem)' }}>
                                        📱 Module 1: How To Talk To {gender === 'MALE' ? 'Her' : 'Him'}
                                    </span>
                                    <strong style={{ color: '#10b981', fontSize: 'clamp(1rem, 4vw, 1.25rem)' }}>$27</strong>
                                </div>
                                <div className="value-item" style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: 'clamp(8px, 2vw, 12px)',
                                    background: 'rgba(0,0,0,0.3)',
                                    borderRadius: '8px'
                                }}>
                                    <span style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.1rem)' }}>👥 Module 2: How To Meet Up</span>
                                    <strong style={{ color: '#10b981', fontSize: 'clamp(1rem, 4vw, 1.25rem)' }}>$27</strong>
                                </div>
                                <div className="value-item" style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: 'clamp(8px, 2vw, 12px)',
                                    background: 'rgba(0,0,0,0.3)',
                                    borderRadius: '8px'
                                }}>
                                    <span style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.1rem)' }}>❤️ Module 3: How To Win {gender === 'MALE' ? 'Her' : 'Him'} Back</span>
                                    <strong style={{ color: '#10b981', fontSize: 'clamp(1rem, 4vw, 1.25rem)' }}>$47</strong>
                                </div>
                                <div className="value-item" style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: 'clamp(8px, 2vw, 12px)',
                                    background: 'rgba(0,0,0,0.3)',
                                    borderRadius: '8px'
                                }}>
                                    <span style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.1rem)' }}>🚨 Module 4: Emergency Protocol</span>
                                    <strong style={{ color: '#10b981', fontSize: 'clamp(1rem, 4vw, 1.25rem)' }}>$37</strong>
                                </div>
                                <div className="value-item" style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: 'clamp(8px, 2vw, 12px)',
                                    background: 'rgba(0,0,0,0.3)',
                                    borderRadius: '8px'
                                }}>
                                    <span style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.1rem)' }}>⚡ 72-Hour Special Guide</span>
                                    <strong style={{ color: '#10b981', fontSize: 'clamp(1rem, 4vw, 1.25rem)' }}>$27</strong>
                                </div>
                                <div className="value-item" style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: 'clamp(8px, 2vw, 12px)',
                                    background: 'rgba(0,0,0,0.3)',
                                    borderRadius: '8px'
                                }}>
                                    <span style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.1rem)' }}>🎯 Bonus: Scripts + Action Plans</span>
                                    <strong style={{ color: '#10b981', fontSize: 'clamp(1rem, 4vw, 1.25rem)' }}>FREE</strong>
                                </div>
                            </div>
                            
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: 'clamp(12px, 3vw, 16px)',
                                background: 'rgba(16, 185, 129, 0.2)',
                                border: '2px solid rgba(16, 185, 129, 0.5)',
                                borderRadius: '12px',
                                marginBottom: 'clamp(12px, 3vw, 16px)'
                            }}>
                                <span style={{
                                    fontSize: 'clamp(1rem, 4vw, 1.25rem)',
                                    fontWeight: '700',
                                    color: 'white'
                                }}>
                                    TOTAL VALUE:
                                </span>
                                <span style={{
                                    fontSize: 'clamp(1.25rem, 5vw, 1.5rem)',
                                    fontWeight: '900',
                                    color: '#10b981',
                                    textDecoration: 'line-through',
                                    opacity: 0.7
                                }}>
                                    $165
                                </span>
                            </div>
                            
                            <div style={{
                                background: 'rgba(250, 204, 21, 0.2)',
                                border: '2px solid rgba(250, 204, 21, 0.5)',
                                borderRadius: '12px',
                                padding: 'clamp(12px, 3vw, 16px)',
                                textAlign: 'center'
                            }}>
                                <p style={{
                                    fontSize: 'clamp(1rem, 4vw, 1.25rem)',
                                    color: '#facc15',
                                    fontWeight: '700',
                                    margin: 0
                                }}>
                                    🔥 86% OFF - TODAY ONLY
                                </p>
                            </div>
                        </div>

                        <div className="quiz-summary-box" style={{
                            background: 'rgba(234, 179, 8, 0.1)',
                            border: '2px solid rgba(234, 179, 8, 0.3)',
                            borderRadius: '12px',
                            padding: '20px',
                            marginBottom: '30px'
                        }}>
                            <p style={{
                                fontSize: 'clamp(0.875rem, 3.5vw, 1rem)',
                                color: 'rgb(253, 224, 71)',
                                marginBottom: 'clamp(12px, 3vw, 16px)',
                                fontWeight: 'bold'
                            }}>
                                Based on your specific situation:
                            </p>
                            <ul style={{
                                listStyle: 'none',
                                padding: 0,
                                margin: 0,
                                fontSize: 'clamp(0.875rem, 3.5vw, 1rem)',
                                color: 'white',
                                lineHeight: '1.8'
                            }}>
                                <li>✓ <strong>Time:</strong> {quizData.timeSeparation || 'Not specified'}</li>
                                <li>✓ <strong>Who ended it:</strong> {quizData.whoEnded || 'Not specified'}</li>
                                <li>✓ <strong>Contact:</strong> {quizData.currentSituation || 'Not specified'}</li>
                                <li>✓ <strong>Commitment:</strong> {quizData.commitmentLevel || 'Not specified'}</li>
                            </ul>
                        </div>

                        <div className="offer-features" style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'clamp(12px, 3vw, 16px)',
                            marginBottom: 'clamp(24px, 5vw, 32px)'
                        }}>
                            {getFeatures(gender).map((feature, index) => (
                                <div key={index} className="feature" style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 'clamp(10px, 3vw, 12px)',
                                    padding: 'clamp(8px, 2vw, 12px) 0'
                                }}>
                                    <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{
                                        minWidth: 'clamp(20px, 5vw, 24px)',
                                        width: 'clamp(20px, 5vw, 24px)',
                                        height: 'clamp(20px, 5vw, 24px)',
                                        marginTop: '2px',
                                        color: '#4ade80'
                                    }}>
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                    <span style={{
                                        fontSize: 'clamp(0.9rem, 3.5vw, 1.125rem)',
                                        lineHeight: '1.5',
                                        flex: 1
                                    }}>{feature}</span>
                                </div>
                            ))}
                        </div>

                        <div className="price-box">
                            <p className="price-old">Regular price: $123</p>
                            <p className="price-new">$17.00</p>
                            <p className="price-discount">💰 86% OFF TODAY</p>
                        </div>

                        <button 
                            className="cta-button btn-green btn-size-4 btn-animation-glowshake" 
                            onClick={handleCTAClick}
                            style={{
                                fontSize: 'clamp(1.1rem, 4.5vw, 1.5rem)',
                                padding: 'clamp(18px, 4vw, 24px)',
                                lineHeight: '1.4'
                            }}
                        >
                            <span style={{ display: 'block', marginBottom: '4px' }}>
                                🚀 YES, I WANT ACCESS FOR $17
                            </span>
                            <span style={{ 
                                display: 'block', 
                                fontSize: 'clamp(0.8rem, 3vw, 1rem)',
                                opacity: 0.9,
                                fontWeight: '600'
                            }}>
                                ⏰ {formatTime(timeLeft)} REMAINING
                            </span>
                        </button>

                        <div className="guarantee-section" style={{
                            background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.15), rgba(16, 185, 129, 0.1))',
                            border: '3px solid rgba(74, 222, 128, 0.4)',
                            borderRadius: '16px',
                            padding: 'clamp(20px, 5vw, 32px)',
                            margin: 'clamp(24px, 5vw, 32px) 0',
                            textAlign: 'center',
                            boxShadow: '0 8px 32px rgba(74, 222, 128, 0.3)'
                        }}>
                            <div style={{ fontSize: 'clamp(3rem, 10vw, 4rem)', marginBottom: '12px' }}>
                                🛡️
                            </div>
                            <h3 style={{
                                fontSize: 'clamp(1.25rem, 5vw, 1.75rem)',
                                color: '#4ade80',
                                marginBottom: 'clamp(12px, 3vw, 16px)',
                                fontWeight: '900'
                            }}>
                                IRONCLAD 30-DAY GUARANTEE
                            </h3>
                            <p style={{
                                fontSize: 'clamp(0.95rem, 4vw, 1.15rem)',
                                lineHeight: '1.6',
                                color: 'white',
                                marginBottom: '16px'
                            }}>
                                If in 30 days you don't see concrete results in your reconnection, 
                                <strong style={{ color: '#4ade80' }}> we refund 100% of your money</strong>, 
                                no questions asked, no hassle.
                            </p>
                            <p style={{
                                fontSize: 'clamp(0.85rem, 3.5vw, 1rem)',
                                color: 'rgba(255,255,255,0.8)',
                                fontStyle: 'italic'
                            }}>
                                ✓ ZERO risk for you<br/>
                                ✓ Refund in 24-48 hours<br/>
                                ✓ No complications
                            </p>
                        </div>

                        <div className="real-proof-box">
                            <p>⭐ <strong>4.8/5 stars</strong> (2,341 verified reviews)</p>
                            <p>📱 Last purchase 4 minutes ago</p>
                        </div>

                        <div className="trust-icons">
                            <span>🔒 Secure purchase</span>
                            <span>✅ Instant access</span>
                            <span>↩️ 30-day guarantee</span>
                        </div>

                        <div className="final-urgency-grid-optimized">
                            <div className="urgency-item-compact">
                                <span style={{ fontSize: 'clamp(0.75rem, 3vw, 0.875rem)', opacity: 0.8 }}>Time:</span>
                                <strong style={{ fontSize: 'clamp(1rem, 4vw, 1.25rem)' }}>{formatTime(timeLeft)}</strong>
                            </div>
                            <div className="urgency-item-compact">
                                <span style={{ fontSize: 'clamp(0.75rem, 3vw, 0.875rem)', opacity: 0.8 }}>Spots:</span>
                                <strong style={{ fontSize: 'clamp(1rem, 4vw, 1.25rem)' }}>{spotsLeft}/50</strong>
                            </div>
                        </div>

                        <p className="people-buying-counter" style={{
                            textAlign: 'center',
                            color: 'rgb(74, 222, 128)',
                            fontSize: 'clamp(0.75rem, 3vw, 0.875rem)',
                            marginTop: 'clamp(12px, 3vw, 16px)',
                            marginBottom: 'clamp(8px, 2vw, 12px)',
                            lineHeight: '1.5',
                            fontWeight: '500',
                            opacity: 0.85
                        }}>
                            ✨ {peopleBuying} buying now
                        </p>

                        <p className="social-proof-count" style={{
                            textAlign: 'center',
                            color: 'rgb(74, 222, 128)',
                            fontSize: 'clamp(0.75rem, 3vw, 0.875rem)',
                            marginBottom: 'clamp(8px, 2vw, 12px)',
                            lineHeight: '1.5',
                            fontWeight: '500',
                            opacity: 0.85
                        }}>
                            ✓ +9,247 successful reconnections
                        </p>

                        <p className="guarantee-text" style={{
                            textAlign: 'center',
                            fontSize: 'clamp(0.75rem, 3vw, 0.875rem)',
                            lineHeight: '1.6',
                            color: 'rgba(255, 255, 255, 0.7)',
                            padding: '0 8px'
                        }}>
                            Exclusive for those who completed the personalized analysis
                        </p>
                    </div>
                )}
            </div>

            <style>{`
                .result-container { 
                    padding: clamp(12px, 4vw, 24px); 
                    padding-bottom: max(100px, env(safe-area-inset-bottom)); 
                    min-height: 100vh;
                    min-height: -webkit-fill-available;
                }
                .result-header { 
                    text-align: center; 
                    padding: clamp(16px, 4vw, 20px); 
                    background: rgba(0,0,0,0.5); 
                    border-radius: 12px; 
                    margin-bottom: clamp(16px, 4vw, 20px); 
                }
                .result-title { 
                    font-size: clamp(1.25rem, 5vw, 2.5rem); 
                    color: white; 
                    margin: 0 0 clamp(12px, 3vw, 15px) 0; 
                    font-weight: 900; 
                    line-height: 1.3;
                }
                .urgency-bar { 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    gap: clamp(6px, 2vw, 10px); 
                    background: rgba(234, 179, 8, 0.2); 
                    padding: clamp(10px, 3vw, 12px) clamp(12px, 4vw, 20px); 
                    border-radius: 8px; 
                    border: 2px solid rgba(234, 179, 8, 0.5); 
                    flex-wrap: wrap;
                }
                .urgency-icon { font-size: clamp(1.2rem, 4vw, 1.5rem); }
                .urgency-text { color: #facc15; font-weight: bold; font-size: clamp(0.8rem, 3vw, 1.1rem); }
                .progress-bar-container { 
                    display: flex; 
                    justify-content: space-between; 
                    margin: clamp(12px, 3vw, 20px) auto; 
                    max-width: 800px; 
                    padding: clamp(10px, 3vw, 15px); 
                    background: rgba(0,0,0,0.4); 
                    border-radius: 12px; 
                    position: sticky; 
                    top: 0; 
                    z-index: 999; 
                    backdrop-filter: blur(5px); 
                    gap: clamp(4px, 2vw, 10px); 
                }
                .progress-step { 
                    flex: 1; 
                    display: flex; 
                    flex-direction: column; 
                    align-items: center; 
                    color: rgba(255,255,255,0.5); 
                    font-size: clamp(0.6rem, 2.5vw, 0.8rem); 
                }
                .step-circle { 
                    width: clamp(24px, 8vw, 32px); 
                    height: clamp(24px, 8vw, 32px); 
                    border-radius: 50%; 
                    background: rgba(255,255,255,0.2); 
                    display: flex; 
                    justify-content: center; 
                    align-items: center; 
                    margin-bottom: clamp(3px, 1vw, 5px); 
                    font-weight: bold; 
                    font-size: clamp(0.7rem, 3vw, 0.9rem);
                }
                .progress-step.active .step-circle { background: #eab308; color: black; }
                .progress-step.completed .step-circle { background: #4ade80; color: white; }
                .step-label { font-size: clamp(0.55rem, 2.2vw, 0.7rem); text-align: center; }
                .revelations-container { max-width: 800px; margin: 0 auto; }
                .revelation { 
                    background: rgba(0,0,0,0.3); 
                    border: 2px solid rgba(255,255,255,0.1); 
                    border-radius: clamp(12px, 3vw, 16px); 
                    padding: clamp(16px, 4vw, 40px); 
                    margin-bottom: clamp(20px, 5vw, 30px); 
                }
                .revelation-header { text-align: center; margin-bottom: clamp(20px, 5vw, 30px); }
                .revelation-icon { font-size: clamp(2.5rem, 8vw, 3rem); display: block; margin-bottom: clamp(10px, 3vw, 15px); }
                .revelation h2 { font-size: clamp(1.2rem, 5vw, 2rem); color: white; margin: 0; font-weight: 900; line-height: 1.3; }
                .revelation-text { font-size: clamp(0.9rem, 3.5vw, 1.2rem); line-height: 1.7; color: rgba(255,255,255,0.95); }
                .quiz-summary-box { 
                    background: rgba(234, 179, 8, 0.1); 
                    border: 2px solid rgba(234, 179, 8, 0.3); 
                    border-radius: 12px; 
                    padding: clamp(14px, 4vw, 20px); 
                    margin-bottom: clamp(20px, 5vw, 30px); 
                }
                .summary-title { color: rgb(253, 224, 71); font-weight: bold; margin-bottom: clamp(10px, 3vw, 15px); font-size: clamp(0.9rem, 3.5vw, 1rem); }
                .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(10px, 3vw, 15px); }
                .summary-grid div { font-size: clamp(0.75rem, 3vw, 1rem); color: white; }
                .summary-grid span { color: #4ade80; font-weight: bold; }
                .emotional-validation { 
                    background: rgba(74, 222, 128, 0.1); 
                    border: 2px solid rgba(74, 222, 128, 0.3); 
                    border-radius: 12px; 
                    padding: clamp(14px, 4vw, 20px); 
                    margin-top: clamp(16px, 4vw, 20px); 
                    color: #4ade80; 
                    font-size: clamp(0.85rem, 3.5vw, 1rem);
                }
                .loading-box-custom { 
                    background: rgba(234, 179, 8, 0.1); 
                    border: 2px solid #eab308; 
                    border-radius: 16px; 
                    padding: clamp(24px, 6vw, 40px); 
                    text-align: center; 
                }
                .loading-inner { display: flex; flex-direction: column; align-items: center; gap: clamp(14px, 4vw, 20px); }
                .spin-brain { font-size: clamp(3rem, 10vw, 4rem); animation: spin 2s linear infinite; }
                .loading-steps-list { display: flex; flex-direction: column; gap: clamp(8px, 2vw, 10px); text-align: left; }
                .loading-step-item { font-size: clamp(0.8rem, 3vw, 1.1rem); color: rgba(255,255,255,0.8); }
                .loading-step-item.active { color: #4ade80; font-weight: bold; }
                .progress-outer { width: 100%; height: clamp(8px, 2vw, 10px); background: rgba(255,255,255,0.2); border-radius: 5px; overflow: hidden; }
                .progress-inner { height: 100%; background: linear-gradient(90deg, #eab308, #10b981); width: 0%; transition: width 0.1s linear; }
                .progress-labels { display: flex; justify-content: space-between; font-size: clamp(0.75rem, 2.5vw, 0.95rem); color: rgba(255,255,255,0.7); }
                
                /* VIDEO CONTAINERS - RESPONSIVE */
                .vsl-container { 
                    margin: clamp(20px, 5vw, 30px) 0; 
                    position: relative;
                    width: 100%;
                }
                .vsl-placeholder { 
                    width: 100%; 
                    max-width: 400px; 
                    margin: 0 auto;
                    aspect-ratio: 9 / 16;
                    background: rgba(0,0,0,0.3);
                    border-radius: clamp(8px, 2vw, 12px);
                    overflow: hidden;
                }
                .vsl-revelation { }
                .vsl-revelation .vsl-placeholder {
                    max-height: 70vh;
                }
                .pre-offer-video-section {
                    margin: clamp(20px, 5vw, 30px) 0;
                }
                .pre-offer-video-section > div:first-of-type {
                    text-align: center;
                }
                .pre-offer-video-section > div:last-of-type {
                    aspect-ratio: 9 / 16;
                    max-width: 400px;
                    max-height: 70vh;
                    margin: 0 auto;
                    border-radius: clamp(8px, 2vw, 12px);
                    overflow: hidden;
                }
                
                .video-delay-indicator { 
                    background: rgba(0,0,0,0.4); 
                    border: 2px solid #eab308; 
                    border-radius: 12px; 
                    padding: clamp(14px, 4vw, 20px); 
                    margin-top: clamp(16px, 4vw, 20px); 
                    text-align: center; 
                    color: white; 
                    display: flex; 
                    flex-direction: column; 
                    align-items: center; 
                    gap: clamp(10px, 3vw, 15px); 
                }
                .delay-text { font-size: clamp(0.9rem, 3.5vw, 1.1rem); font-weight: bold; display: flex; align-items: center; justify-content: center; gap: clamp(6px, 2vw, 10px); }
                .delay-progress-bar-container { width: 100%; height: clamp(8px, 2vw, 10px); background: rgba(255,255,255,0.2); border-radius: 5px; overflow: hidden; }
                .delay-progress-bar { height: 100%; background: #eab308; width: 0%; transition: width 1s linear; border-radius: 5px; }
                .testimonials-section { margin-top: clamp(24px, 5vw, 48px); display: flex; flex-direction: column; gap: clamp(16px, 4vw, 24px); }
                .testimonial-card { 
                    border-radius: clamp(12px, 3vw, 16px); 
                    padding: clamp(16px, 4vw, 28px); 
                    display: flex; 
                    gap: clamp(12px, 3vw, 20px); 
                    align-items: flex-start; 
                }
                .ventana-box-custom { 
                    background: linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(234, 179, 8, 0.1)); 
                    border: 3px solid rgba(249, 115, 22, 0.5); 
                    border-radius: clamp(14px, 4vw, 20px); 
                    padding: clamp(18px, 5vw, 40px); 
                    box-shadow: 0 12px 48px rgba(249, 115, 22, 0.3); 
                }
                .ventana-header-custom { text-align: center; margin-bottom: clamp(18px, 4vw, 32px); }
                .ventana-header-custom span { font-size: clamp(2rem, 7vw, 3.5rem); display: block; margin-bottom: clamp(10px, 2vw, 16px); }
                .ventana-header-custom h2 { font-size: clamp(1.2rem, 5vw, 2rem); color: #f97316; font-weight: 900; text-transform: uppercase; letter-spacing: clamp(0.5px, 0.1vw, 1px); margin: 0; line-height: 1.3; }
                .ventana-intro { font-size: clamp(0.95rem, 3.8vw, 1.3rem); line-height: 1.7; color: white; margin-bottom: clamp(18px, 4vw, 32px); }
                .fases-list { display: flex; flex-direction: column; gap: clamp(16px, 4vw, 32px); margin: clamp(18px, 4vw, 32px) 0; width: 100%; }
                .fase-item-custom { 
                    width: 100%; 
                    background: linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(249, 115, 22, 0.1)); 
                    border: 2px solid rgba(234, 179, 8, 0.4); 
                    border-radius: clamp(12px, 3vw, 16px); 
                    padding: clamp(14px, 4vw, 28px); 
                    box-shadow: 0 8px 24px rgba(234, 179, 8, 0.2); 
                }
                .fase-item-custom strong { 
                    display: block; 
                    font-size: clamp(1rem, 4vw, 1.5rem); 
                    color: #facc15; 
                    margin-bottom: clamp(8px, 2vw, 16px); 
                    font-weight: 900; 
                    letter-spacing: 0.5px; 
                }
                .fase-item-custom p { font-size: clamp(0.85rem, 3.5vw, 1.2rem); line-height: 1.6; color: rgba(255, 255, 255, 0.95); margin: 0; }
                .ventana-img { 
                    width: 100%; 
                    max-width: 600px; 
                    border-radius: clamp(12px, 3vw, 16px); 
                    margin: clamp(18px, 4vw, 32px) auto; 
                    display: block; 
                    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.4); 
                    border: 3px solid rgba(249, 115, 22, 0.3); 
                }
                .offer-section-custom { 
                    background: rgba(0,0,0,0.3); 
                    border: 2px solid rgba(255,255,255,0.1); 
                    border-radius: clamp(12px, 3vw, 16px); 
                    padding: clamp(16px, 4vw, 40px); 
                    margin-bottom: clamp(20px, 5vw, 30px); 
                }
                .offer-badge { 
                    display: inline-block; 
                    background: #f97316; 
                    color: black; 
                    padding: clamp(6px, 2vw, 8px) clamp(12px, 3vw, 16px); 
                    border-radius: 8px; 
                    font-weight: bold; 
                    margin-bottom: clamp(14px, 4vw, 20px); 
                    font-size: clamp(0.7rem, 2.5vw, 0.95rem); 
                }
                .offer-title-main { 
                    font-size: clamp(1.2rem, 5vw, 2rem); 
                    color: white; 
                    margin: 0 0 clamp(20px, 5vw, 30px) 0; 
                    font-weight: 900; 
                    text-align: center; 
                    line-height: 1.3;
                }
                .value-stack-box { }
                .value-item { }
                .price-box { text-align: center; margin-bottom: clamp(18px, 4vw, 25px); }
                .price-old { text-decoration: line-through; opacity: 0.6; margin: 0; font-size: clamp(0.8rem, 3vw, 1.1rem); }
                .price-new { font-size: clamp(2rem, 7vw, 3.5rem); color: #facc15; font-weight: 900; margin: 5px 0; }
                .price-discount { color: #4ade80; font-weight: bold; font-size: clamp(0.8rem, 3vw, 1.1rem); }
                .offer-features { display: flex; flex-direction: column; gap: clamp(10px, 2.5vw, 16px); margin-bottom: clamp(18px, 4vw, 32px); }
                .feature { display: flex; align-items: flex-start; gap: clamp(8px, 2vw, 12px); padding: clamp(6px, 1.5vw, 12px) 0; }
                .check-icon { min-width: clamp(18px, 5vw, 24px); width: clamp(18px, 5vw, 24px); height: clamp(18px, 5vw, 24px); margin-top: 2px; color: #4ade80; }
                
                /* BUTTONS - TOUCH OPTIMIZED */
                .cta-button { 
                    width: 100%; 
                    color: black; 
                    font-weight: 900; 
                    padding: clamp(16px, 4vw, 20px); 
                    border-radius: 12px; 
                    border: 3px solid white; 
                    cursor: pointer; 
                    margin-top: clamp(16px, 4vw, 20px); 
                    transition: all 0.3s ease; 
                    display: flex; 
                    flex-direction: column; 
                    align-items: center; 
                    justify-content: center; 
                    gap: clamp(8px, 2vw, 10px); 
                    font-size: clamp(0.9rem, 3.5vw, 1.5rem);
                    min-height: 56px;
                    touch-action: manipulation;
                    -webkit-tap-highlight-color: transparent;
                    -webkit-user-select: none;
                    user-select: none;
                }
                .cta-button:disabled { opacity: 0.6; cursor: not-allowed; filter: grayscale(50%); }
                .cta-button:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 16px rgba(0,0,0,0.3); }
                .cta-button:active:not(:disabled) { transform: translateY(0); box-shadow: 0 4px 8px rgba(0,0,0,0.2); }
                .btn-green { background: #10b981; }
                .btn-green:hover:not(:disabled) { background: #059669; }
                .btn-yellow { background: #eab308; }
                .btn-yellow:hover:not(:disabled) { background: #ca8a04; }
                .btn-orange { background: #f97316; }
                .btn-orange:hover:not(:disabled) { background: #ea580c; }
                .btn-size-1 { font-size: clamp(0.9rem, 3.5vw, 1rem); }
                .btn-size-2 { font-size: clamp(0.95rem, 3.7vw, 1.125rem); }
                .btn-size-3 { font-size: clamp(1rem, 4vw, 1.25rem); }
                .btn-size-4 { font-size: clamp(1.1rem, 4.5vw, 1.5rem); }
                .btn-animation-fadein { animation: fadeIn 0.6s ease-in-out; }
                .btn-animation-bounce { animation: bounce 1s infinite; }
                .btn-animation-pulse { animation: pulse 1.5s infinite; }
                .btn-animation-glowshake { animation: glowshake 2s infinite; }
                .checkmark-container { display: flex; justify-content: center; align-items: center; margin-top: clamp(16px, 4vw, 20px); min-height: clamp(60px, 15vw, 80px); }
                .checkmark-glow { font-size: clamp(3rem, 10vw, 4rem); animation: checkmarkShine 1s ease-in-out; }
                .guarantee-section { }
                .real-proof-box { 
                    background: rgba(74, 222, 128, 0.1); 
                    border: 2px solid rgba(74, 222, 128, 0.3); 
                    border-radius: 12px; 
                    padding: clamp(12px, 3vw, 15px); 
                    text-align: center; 
                    color: #4ade80; 
                    margin: clamp(16px, 4vw, 20px) 0; 
                }
                .real-proof-box p { margin: clamp(3px, 1vw, 5px) 0; font-size: clamp(0.75rem, 3vw, 1rem); }
                .trust-icons { 
                    display: flex; 
                    justify-content: center; 
                    gap: clamp(8px, 3vw, 15px); 
                    color: #4ade80; 
                    font-size: clamp(0.7rem, 2.8vw, 0.85rem); 
                    margin-bottom: clamp(16px, 4vw, 20px); 
                    flex-wrap: wrap; 
                }
                .final-urgency-grid-optimized { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(6px, 2vw, 12px); margin: clamp(12px, 3vw, 20px) 0; }
                .urgency-item-compact { background: rgba(0,0,0,0.3); padding: clamp(8px, 2.5vw, 12px); border-radius: 8px; text-align: center; display: flex; flex-direction: column; gap: clamp(2px, 1vw, 4px); }
                .people-buying-counter { text-align: center; color: rgb(74, 222, 128); font-size: clamp(0.7rem, 2.8vw, 0.875rem); margin-top: clamp(10px, 2.5vw, 16px); margin-bottom: clamp(6px, 1.5vw, 12px); line-height: 1.5; font-weight: 500; opacity: 0.85; }
                .social-proof-count { text-align: center; color: rgb(74, 222, 128); font-size: clamp(0.7rem, 2.8vw, 0.875rem); margin-bottom: clamp(6px, 1.5vw, 12px); line-height: 1.5; font-weight: 500; opacity: 0.85; }
                .guarantee-text { text-align: center; font-size: clamp(0.7rem, 2.8vw, 0.875rem); line-height: 1.6; color: rgba(255, 255, 255, 0.7); padding: 0 clamp(4px, 2vw, 8px); }
                
                /* RESPONSIVE BREAKPOINTS */
                @media (max-width: 480px) {
                    .summary-grid { grid-template-columns: 1fr; gap: 8px; }
                    .testimonial-card { flex-direction: column; align-items: center; text-align: center; }
                    .testimonial-card img { margin: 0 auto; }
                    .testimonial-card > div { text-align: center; }
                    .testimonial-card > div > div:first-child { flex-direction: column; gap: 4px; }
                }
                
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeOut { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-20px); } }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(100%); } to { opacity: 1; transform: translateY(0); } }
                @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
                @keyframes pulse { 0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.7); } 70% { transform: scale(1.02); box-shadow: 0 0 0 10px rgba(249, 115, 22, 0); } 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(249, 115, 22, 0); } }
                @keyframes glowshake { 0%, 100% { transform: translateX(0) scale(1); box-shadow: 0 0 15px rgba(16, 185, 129, 0.8); } 25% { transform: translateX(-2px) scale(1.01); box-shadow: 0 0 20px rgba(16, 185, 129, 1); } 50% { transform: translateX(2px) scale(1); box-shadow: 0 0 15px rgba(16, 185, 129, 0.8); } 75% { transform: translateX(-2px) scale(1.01); box-shadow: 0 0 20px rgba(16, 185, 129, 1); } }
                @keyframes checkmarkShine { 0% { opacity: 0; transform: scale(0.5); filter: brightness(1); } 50% { opacity: 1; transform: scale(1.1); filter: brightness(1.8); } 100% { opacity: 1; transform: scale(1); filter: brightness(1); } }
                .fade-in { animation: fadeIn 0.6s ease-in-out; }
                .fade-out { animation: fadeOut 0.3s ease-out forwards; }
                .fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'vturb-smartplayer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { id?: string }, HTMLElement>;
        }
    }
}
