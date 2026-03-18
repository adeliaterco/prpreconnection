import { useState, useEffect, useRef } from 'react';

import { storage } from '../utils/storage';

import { playKeySound, getHotmartUrl } from '../utils/animations';

import { QuizAnswer } from '../types/quiz';

import { ga4Tracking } from '../utils/ga4Tracking';

import { 

    getTitle, 

    getLoadingMessage, 

    getCopy, 

    getVentana72Copy,

    getVentanaSummary,

    getVentanaImportance,

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

    const [videoButtonDelayLeft, setVideoButtonDelayLeft] = useState(10);

    const [isVideoButtonEnabled, setIsVideoButtonEnabled] = useState(false);

    const [buttonCheckmarks, setButtonCheckmarks] = useState&lt;{[key: number]: boolean}>({

        0: false,

        1: false,

        2: false

    });

    // ✅ IMPROVEMENT #2: 10-minute timer ONLY for the offer

    const [offerTimeLeft, setOfferTimeLeft] = useState(10 * 60); // 600 seconds

    

    // ✅ IMPROVEMENT #5: State for plan selection

    const [selectedPlan, setSelectedPlan] = useState<number | null>(null);

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

    const gender = quizData.gender || 'HOMBRE';

    const loadingSteps = [

        { icon: '📊', text: 'Answers processed', duration: 0 },

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

    const appendUTMsToHotmartURL = (plan?: number): string => {

        const baseURL = getHotmartUrl(plan);

        const utms = getUTMs();

        if (Object.keys(utms).length === 0) return baseURL;

        const url = new URL(baseURL);

        Object.entries(utms).forEach(([key, value]) => url.searchParams.set(key, value as string));

        return url.toString();

    };

    useEffect(() => {

        ensureUTMs();

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

            ga4Tracking.revelationViewed('Why They Left', 1);

        }, 2500);

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

                if (newCount &lt; 1) newCount = 1;

                if (newCount > 7) newCount = 7;

                return newCount;

            });

        }, Math.floor(Math.random() * 10000) + 5000);

        return () => {

            clearInterval(progressInterval);

            clearTimeout(timerPhase1);

            clearInterval(spotsInterval);

            clearInterval(buyingInterval);

        };

    }, []);

    // ✅ IMPROVEMENT #2: useEffect that starts 10min timer when reaching Phase 4

    useEffect(() => {

        if (currentPhase >= 4) {

            const offerTimer = setInterval(() => {

                setOfferTimeLeft(prev => (prev &lt;= 1 ? 0 : prev - 1));

            }, 1000);

            

            return () => clearInterval(offerTimer);

        }

    }, [currentPhase]);

    useEffect(() => {

        let delayInterval: NodeJS.Timeout;

        if (currentPhase === 2) {

            setVideoButtonDelayLeft(10);

            setIsVideoButtonEnabled(false);

            delayInterval = setInterval(() => {

                setVideoButtonDelayLeft(prev => {

                    if (prev &lt;= 1) {

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

                    <div style="position: relative; width: 100%; max-width: 400px; margin: 0 auto; aspect-ratio: 9 / 16; background: #000; border-radius: 8px; overflow: hidden;">

                        <vturb-smartplayer id="vid-69b38597faf9397e2331fc28" style="display: block; width: 100%; height: 100%; position: absolute; top: 0; left: 0;"></vturb-smartplayer>

                    </div>

                `;

                if (!document.querySelector('script[src*="69b38597faf9397e2331fc28"]')) {

                    const s = document.createElement("script");

                    s.src = "https://scripts.converteai.net/52018b5b-3f47-42a3-b3df-1e325329b52a/players/69b38597faf9397e2331fc28/v4/player.js";

                    s.async = true;

                    document.head.appendChild(s);

                }

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

            ga4Tracking.phaseProgressionClicked({ phase_from: 1, phase_to: 2, button_name: 'Unlock Secret Video' });

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

            ga4Tracking.revelationViewed('72-Hour Window', 2);

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

            ga4Tracking.revelationViewed('Offer Revealed', 3);

            ga4Tracking.offerRevealed();

            setFadeOutPhase(null);

        }, 400);

    };

    // ✅ IMPROVEMENT #5: handleCTAClick updated to validate selected plan

    const handleCTAClick = () => {

        if (!selectedPlan) {

            alert('Please choose a plan first');

            return;

        }

        ga4Tracking.ctaBuyClicked('result_buy_main');

        window.open(appendUTMsToHotmartURL(selectedPlan), '_blank');

    };

    const getDelayEmoji = (secondsLeft: number) => {

        const progress = (50 - secondsLeft) / 50;

        if (progress &lt; 0.2) return '😴';

        if (progress &lt; 0.4) return '⏳';

        if (progress &lt; 0.7) return '🔥';

        return '🚀';

    };

    const phases = ['Diagnosis', 'Video', '72h Window', 'Solution'];

    return (

        <div className="result-container">

            {/* ✅ IMPROVEMENT #1: Header WITHOUT 47-minute timer */}

            <div className="result-header">

                <h1 className="result-title">Your Personalized Plan Is Ready</h1>

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

                

                {/* PHASE 0: Loading - MAINTAINED */}

                {currentPhase === 0 && (

                    <div className="revelation fade-in loading-box-custom">

                        <div className="loading-inner">

                            <div className="spin-brain">🧠</div>

                            <h2>ANALYZING YOUR CASE</h2>

                            <p>{getLoadingMessage(gender)}</p>

                            <div className="loading-steps-list">

                                {loadingSteps.map((step, i) => (

                                    <div key={i} className={`loading-step-item ${i &lt;= loadingStep ? 'active' : ''}`}>

                                        {i &lt; loadingStep ? '✅' : step.icon} {step.text}

                                    </div>

                                ))}

                            </div>

                            <div className="progress-outer"><div className="progress-inner" style={{ width: `${loadingProgress}%` }}></div></div>

                            <div className="progress-labels"><span>{loadingProgress}%</span><span>⏱️ {Math.ceil((100 - loadingProgress) / 10)}s...</span></div>

                        </div>

                    </div>

                )}

                {/* PHASE 1: Diagnosis - MAINTAINED */}

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

                                🔓 Unlock Secret Video

                            </button>

                        )}

                    </div>

                )}

                {/* PHASE 2: VSL - MAINTAINED */}

                {currentPhase === 2 && (

                    <div 

                        ref={videoSectionRef} 

                        className={`revelation fade-in vsl-revelation ${fadeOutPhase === 2 ? 'fade-out' : ''}`}

                    >

                        <div className="revelation-header">

                            <h2>Now there's just one more step to win back the woman you love.</h2>

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

                                    &lt;>

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

                                        ⏳ Reveal 72-HOUR WINDOW

                                    </button>

                                )}

                            </div>

                        )}

                    </div>

                )}

                {/* PHASE 3: 72h Window - MAINTAINED */}

                {currentPhase === 3 && (

                    <div 

                        ref={ventana72SectionRef} 

                        className={`revelation fade-in ventana-box-custom ${fadeOutPhase === 3 ? 'fade-out' : ''}`}

                    >

                        <div className="ventana-header-custom">

                            <span>⚡</span>

                            <h2>THE 72-HOUR WINDOW</h2>

                        </div>

                        <div className="ventana-scientific-intro">

                            <p>

                                Harvard and Nature Neuroscience studies prove: there are neurochemical 72-hour windows where your ex's brain multiplies its emotional receptivity (dopamine, oxytocin, attachment). 

                                <strong> This is the scientific foundation of the process you'll see now.</strong>

                            </p>

                        </div>

                        <img 

                            src="https://comprarplanseguro.shop/wp-content/uploads/2025/10/imagem3-nova.webp" 

                            alt="72h Window - Scientific Foundation" 

                            className="ventana-img-top"

                        />

                        <p className="ventana-img-caption">

                            Science confirms: 72 hours is the critical window to reactivate emotional bonds.

                        </p>

                        <div className="ventana-importance-box">

                            <h3 className="importance-title">🔥 Why the Window is crucial</h3>

                            <div className="importance-bullets">

                                {getVentanaImportance().map((item, index) => (

                                    <div key={index} className="importance-item">{item}</div>

                                ))}

                            </div>

                        </div>

                        <p className="ventana-intro" style={{ whiteSpace: 'pre-line' }}>{getVentana72Copy(gender)}</p>

                        <div className="ventana-summary-box">

                            <h3 className="summary-quick-title">📋 Summary of the 3 phases:</h3>

                            <div className="summary-quick-list">

                                {getVentanaSummary(gender).map((item, index) => (

                                    <div key={index} className="summary-quick-item">{item}</div>

                                ))}

                            </div>

                        </div>

                        <div className="fases-list-dopamine">

                            {[1, 2, 3].map(f => {

                                const faseData = getFaseText(gender, f);

                                return (

                                    <div key={f} className="fase-card-dopamine">

                                        <div className="fase-card-header">

                                            <div className="fase-number">PHASE {f}</div>

                                            <div className="fase-timerange">{faseData.timeRange}</div>

                                        </div>

                                        <h4 className="fase-card-title">

                                            {f === 1 ? '🎯' : f === 2 ? '💡' : '❤️'} {faseData.title}

                                        </h4>

                                        <p className="fase-card-summary">{faseData.summary}</p>

                                        <div className="fase-card-bullets">

                                            {faseData.bullets.map((bullet, index) => (

                                                <div key={index} className="fase-bullet-item">

                                                    {bullet}

                                                </div>

                                            ))}

                                        </div>

                                        <div className="fase-card-warning">{faseData.warning}</div>

                                        <div className="fase-card-footer">

                                            <span className="fase-check">✔️ Phase {f} completed</span>

                                            {f &lt; 3 && <span className="fase-next">Move to next →</span>}

                                        </div>

                                    </div>

                                );

                            })}

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

                                ⚡ See My Plan And Special Price

                            </button>

                        )}

                    </div>

                )}

                {/* Pre-offer transition */}

                {currentPhase === 4 && (

                    <div 

                        ref={preOfferVideoSectionRef}

                        className="pre-offer-transition-section fade-in"

                        style={{

                            marginBottom: 'clamp(24px, 5vw, 32px)',

                            background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(234, 179, 8, 0.15))',

                            border: '3px solid rgba(249, 115, 22, 0.6)',

                            borderRadius: '16px',

                            padding: 'clamp(24px, 5vw, 32px)',

                            boxShadow: '0 8px 32px rgba(249, 115, 22, 0.4)',

                            textAlign: 'center'

                        }}

                    >

                        <div style={{ fontSize: 'clamp(2.5rem, 8vw, 3.5rem)', marginBottom: '16px' }}>

                            🎯

                        </div>

                        

                        <h3 style={{

                            fontSize: 'clamp(1.5rem, 6vw, 2rem)',

                            color: '#f97316',

                            fontWeight: '900',

                            marginBottom: 'clamp(16px, 4vw, 20px)',

                            lineHeight: '1.3'

                        }}>

                            YOU'VE REACHED THE FINAL STEP

                        </h3>

                        

                        <p style={{

                            fontSize: 'clamp(1.05rem, 4vw, 1.25rem)',

                            color: 'rgba(255,255,255,0.95)',

                            lineHeight: '1.6',

                            marginBottom: '0',

                            fontWeight: '600'

                        }}>

                            You already know your diagnosis.<br/>

                            You already saw the 72-Hour Window.<br/>

                            You already know that <strong style={{ color: '#facc15' }}>this works</strong>.<br/><br/>

                            

                            Now there's just one thing left:<br/>

                            <strong style={{ color: '#4ade80', fontSize: 'clamp(1.15rem, 4.5vw, 1.35rem)' }}>

                                APPLY IT TO YOUR CASE.

                            </strong>

                        </p>

                    </div>

                )}

                {/*  */}

                {/* PHASE 4: OFFER - WITH ALL 11 IMPROVEMENTS */}

                {/*  */}

                {currentPhase >= 4 && (

                    <div ref={offerSectionRef} className="revelation fade-in offer-section-custom">

                        

                        {/* ✅ IMPROVEMENT #2: 10-minute timer at top of offer */}

                        <div className="offer-urgency-timer" style={{

                            background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(249, 115, 22, 0.15))',

                            border: '3px solid rgba(234, 179, 8, 0.5)',

                            borderRadius: '16px',

                            padding: 'clamp(16px, 4vw, 20px)',

                            marginBottom: 'clamp(20px, 4vw, 24px)',

                            display: 'flex',

                            alignItems: 'center',

                            justifyContent: 'center',

                            gap: '12px',

                            textAlign: 'center'

                        }}>

                            <span style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)' }}>⏰</span>

                            <div>

                                <p style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1rem)', color: 'rgba(255,255,255,0.8)', margin: '0 0 4px 0' }}>

                                    Your special offer expires in:

                                </p>

                                <p style={{ fontSize: 'clamp(1.5rem, 6vw, 2rem)', color: '#facc15', fontWeight: '900', margin: 0 }}>

                                    {formatTime(offerTimeLeft)}

                                </p>

                            </div>

                        </div>

                        {/* ✅ IMPROVEMENT #3: 2 emotional photos side by side */}

                        {/* INSTRUCTION: Insert image links directly in the src="" attribute below */}

                        <div style={{

                            display: 'grid',

                            gridTemplateColumns: '1fr 1fr',

                            gap: 'clamp(8px, 2vw, 12px)',

                            marginBottom: 'clamp(16px, 3vw, 24px)'

                        }}>

                            {/* Photo 1 - PASTE THE FIRST IMAGE LINK IN src="" */}

                            <img 

                                src="https://i.ibb.co/k63yYvQZ/01-triste.png" 

                                alt="Reconciled couple - Photo 1" 

                                style={{

                                    width: '100%',

                                    height: 'auto',

                                    borderRadius: '16px',

                                    boxShadow: '0 12px 48px rgba(0, 0, 0, 0.4)',

                                    border: '3px solid rgba(249, 115, 22, 0.3)',

                                    objectFit: 'cover',

                                    display: 'block'

                                }}

                            />

                            

                            {/* Photo 2 - PASTE THE SECOND IMAGE LINK IN src="" */}

                            <img 

                                src="https://i.ibb.co/Z1KkPxC9/02-feliz.webp" 

                                alt="Reconciled couple - Photo 2" 

                                style={{

                                    width: '100%',

                                    height: 'auto',

                                    borderRadius: '16px',

                                    boxShadow: '0 12px 48px rgba(0, 0, 0, 0.4)',

                                    border: '3px solid rgba(249, 115, 22, 0.3)',

                                    objectFit: 'cover',

                                    display: 'block'

                                }}

                            />

                        </div>

                        {/* ✅ IMPROVEMENT #4: Social proof statistics */}

                        <div style={{

                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(74, 222, 128, 0.1))',

                            border: '2px solid rgba(16, 185, 129, 0.3)',

                            borderRadius: '16px',

                            padding: 'clamp(24px, 5vw, 32px)',

                            marginBottom: 'clamp(24px, 5vw, 32px)',

                            textAlign: 'center'

                        }}>

                            <h3 style={{

                                fontSize: 'clamp(1.25rem, 5vw, 1.6rem)',

                                color: '#10b981',

                                fontWeight: '900',

                                marginBottom: 'clamp(20px, 4vw, 24px)'

                            }}>

                                Join the 9,247+ men who won their ex back

                            </h3>

                            

                            <div style={{

                                display: 'grid',

                                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',

                                gap: 'clamp(16px, 4vw, 24px)'

                            }}>

                                <div>

                                    <p style={{ fontSize: 'clamp(3rem, 10vw, 4rem)', color: '#10b981', fontWeight: '900', margin: '0 0 8px 0', lineHeight: '1' }}>

                                        94%

                                    </p>

                                    <p style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'rgba(255,255,255,0.9)', margin: 0 }}>

                                        got back with their ex

                                    </p>

                                </div>

                                

                                <div>

                                    <p style={{ fontSize: 'clamp(3rem, 10vw, 4rem)', color: '#10b981', fontWeight: '900', margin: '0 0 8px 0', lineHeight: '1' }}>

                                        87%

                                    </p>

                                    <p style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'rgba(255,255,255,0.9)', margin: 0 }}>

                                        noticed changes in 13-21 days

                                    </p>

                                </div>

                                

                                <div>

                                    <p style={{ fontSize: 'clamp(3rem, 10vw, 4rem)', color: '#10b981', fontWeight: '900', margin: '0 0 8px 0', lineHeight: '1' }}>

                                        72%

                                    </p>

                                    <p style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'rgba(255,255,255,0.9)', margin: 0 }}>

                                        elevated self-esteem

                                    </p>

                                </div>

                            </div>

                        </div>

                        {/* Main title */}

                        <h2 style={{

                            fontSize: 'clamp(1.75rem, 7vw, 2.5rem)',

                            color: 'white',

                            fontWeight: '900',

                            textAlign: 'center',

                            lineHeight: '1.2',

                            marginBottom: 'clamp(12px, 3vw, 16px)'

                        }}>

                            Win Back {gender === 'HOMBRE' ? 'The Woman You Love' : 'The Man You Love'}

                        </h2>

                        

                        <p style={{

                            fontSize: 'clamp(1.05rem, 4vw, 1.25rem)',

                            color: 'rgba(255,255,255,0.85)',

                            textAlign: 'center',

                            marginBottom: 'clamp(24px, 5vw, 32px)',

                            fontStyle: 'italic'

                        }}>

                            (Or We'll Return 100% Of Your Money)

                        </p>

                        {/* ✅ IMPROVEMENT #5: 2 Plans side by side ($14 / $27) */}

                        <div style={{

                            display: 'grid',

                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',

                            gap: 'clamp(20px, 4vw, 24px)',

                            marginBottom: 'clamp(32px, 6vw, 40px)'

                        }}>

                            

                            {/* PLAN 1: ESSENTIAL - $14 */}

                            <div style={{

                                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(96, 165, 250, 0.1))',

                                border: selectedPlan === 14 ? '3px solid #3b82f6' : '2px solid rgba(59, 130, 246, 0.3)',

                                borderRadius: '16px',

                                padding: 'clamp(20px, 5vw, 28px)',

                                display: 'flex',

                                flexDirection: 'column',

                                position: 'relative',

                                transition: 'all 0.3s ease',

                                transform: selectedPlan === 14 ? 'scale(1.02)' : 'scale(1)'

                            }}>

                                <div style={{ marginBottom: 'clamp(16px, 4vw, 20px)' }}>

                                    <h3 style={{ fontSize: 'clamp(1.25rem, 5vw, 1.6rem)', color: '#3b82f6', fontWeight: '900', margin: '0 0 8px 0' }}>

                                        Essential Plan

                                    </h3>

                                    <p style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'rgba(255,255,255,0.8)', margin: 0 }}>

                                        For those who want to start

                                    </p>

                                </div>

                                

                                <div style={{ marginBottom: 'clamp(20px, 4vw, 24px)' }}>

                                    <p style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1rem)', color: 'rgba(255,255,255,0.6)', textDecoration: 'line-through', margin: '0 0 4px 0' }}>

                                        USD 97

                                    </p>

                                    <p style={{ fontSize: 'clamp(2.5rem, 8vw, 3.5rem)', color: '#3b82f6', fontWeight: '900', margin: '0 0 4px 0', lineHeight: '1' }}>

                                        $14

                                    </p>

                                    <p style={{ fontSize: 'clamp(0.85rem, 3.5vw, 1rem)', color: 'rgba(255,255,255,0.7)', margin: 0 }}>

                                        USD 0.47 per day (30 days)

                                    </p>

                                </div>

                                

                                <div style={{ marginBottom: 'clamp(20px, 4vw, 24px)', flex: 1 }}>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

                                        <div style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'white' }}>✅ Complete 72-Hour Protocol</div>

                                        <div style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'white' }}>✅ Modules 1-3 (No Contact + Attraction + Reconquest)</div>

                                        <div style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'white' }}>✅ 10 Irresistible Message Templates</div>

                                        <div style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'white' }}>✅ E-Book: 7 Steps To Be Irresistible</div>

                                        <div style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'white' }}>✅ Email Support</div>

                                        <div style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'white' }}>✅ 30-Day Guarantee</div>

                                        <div style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'rgba(255,255,255,0.4)' }}>❌ Module 4: Emergency Protocol</div>

                                        <div style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'rgba(255,255,255,0.4)' }}>❌ Priority WhatsApp Support</div>

                                        <div style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'rgba(255,255,255,0.4)' }}>❌ Private Community</div>

                                    </div>

                                </div>

                                

                                <button 

                                    onClick={() => setSelectedPlan(14)}

                                    style={{

                                        background: selectedPlan === 14 ? '#3b82f6' : 'transparent',

                                        color: 'white',

                                        fontSize: 'clamp(1rem, 4vw, 1.25rem)',

                                        fontWeight: '900',

                                        padding: 'clamp(16px, 4vw, 20px)',

                                        borderRadius: '12px',

                                        border: '3px solid #60a5fa',

                                        cursor: 'pointer',

                                        width: '100%',

                                        transition: 'all 0.3s ease'

                                    }}

                                >

                                    {selectedPlan === 14 ? '✅ PLAN SELECTED' : 'CHOOSE ESSENTIAL PLAN'}

                                </button>

                            </div>

                            

                            {/* PLAN 2: TOTAL (RECOMMENDED) - $27 */}

                            <div style={{

                                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(74, 222, 128, 0.1))',

                                border: selectedPlan === 27 ? '4px solid #10b981' : '3px solid rgba(16, 185, 129, 0.5)',

                                borderRadius: '16px',

                                padding: 'clamp(20px, 5vw, 28px)',

                                display: 'flex',

                                flexDirection: 'column',

                                position: 'relative',

                                transform: selectedPlan === 27 ? 'scale(1.05)' : 'scale(1.02)',

                                boxShadow: '0 12px 48px rgba(16, 185, 129, 0.4)',

                                transition: 'all 0.3s ease'

                            }}>

                                <div style={{

                                    position: 'absolute',

                                    top: '-12px',

                                    left: '50%',

                                    transform: 'translateX(-50%)',

                                    background: 'linear-gradient(135deg, #eab308, #f59e0b)',

                                    color: 'black',

                                    fontSize: 'clamp(0.75rem, 3vw, 0.9rem)',

                                    fontWeight: '900',

                                    padding: '6px 16px',

                                    borderRadius: '20px',

                                    whiteSpace: 'nowrap'

                                }}>

                                    ⭐ BEST SELLER • RECOMMENDED

                                </div>

                                

                                {/* Critical cases warning INSIDE the $27 card */}

                                <div style={{

                                    background: 'rgba(234, 179, 8, 0.2)',

                                    borderRadius: '8px',

                                    padding: 'clamp(8px, 2vw, 10px) clamp(12px, 3vw, 14px)',

                                    marginBottom: 'clamp(10px, 2.5vw, 12px)',

                                    marginTop: '8px',

                                    textAlign: 'center'

                                }}>

                                    <p style={{

                                        fontSize: 'clamp(0.8rem, 3vw, 0.95rem)',

                                        color: '#facc15',

                                        fontWeight: '700',

                                        margin: 0,

                                        lineHeight: '1.3'

                                    }}>

                                        ⚠️ Critical cases (she with someone else): 73% choose this plan

                                    </p>

                                </div>

                                

                                <div style={{ marginBottom: 'clamp(14px, 3.5vw, 18px)' }}>

                                    <h3 style={{ fontSize: 'clamp(1.25rem, 5vw, 1.6rem)', color: '#10b981', fontWeight: '900', margin: '0 0 8px 0' }}>

                                        Total Plan

                                    </h3>

                                    <p style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', color: 'rgba(255,255,255,0.8)', margin: 0 }}>

                                        For critical cases (she with someone else)

                                    </p>

                                </div>

                                

                                <div style={{ marginBottom: 'clamp(20px, 4vw, 24px)' }}>

                                    <p style={{ fontSize: 'clamp(0.9rem, 3.5vw, 1rem)', color: 'rgba(255,255,255,0.6)', textDecoration: 'line-through', margin: '0 0 4px 0' }}>

                                        USD 197

                                    </p>

                                    <p style={{ fontSize: 'clamp(2.5rem, 8vw, 3.5rem)', color: '#10b981', fontWeight: '900', margin: '0 0 4px 0', lineHeight: '1' }}>

                                        $27

                                    </p>

                                    <p style={{ fontSize: 'clamp(0.85rem, 3.5vw, 1rem)', color: 'rgba(255,255,255,0.7)', margin: '0 0 8px 0' }}>

                                        USD 0.90 per day (30 days)

                                    </p>

                                    <p style={{ 

                                        background: 'rgba(234, 179, 8, 0.2)',

                                        color: '#facc15',

                                        fontSize: 'clamp(0.8rem, 3vw, 0.95rem)',

                                        fontWeight: '900',

                                        padding: '4px 12px',

                                        borderRadius: '6px',

                                        display: 'inline-block'

                                    }}>

                                        LESS THAN A COFFEE

                                    </p>

                                </div>

                                

                                <div style={{ marginBottom: 'clamp(20px, 4vw, 24px)', flex: 1 }}>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

                                        <div style={{ fontSize: 'clamp(0.95rem, 3.8vw, 1.1rem)', color: '#4ade80', fontWeight: '700' }}>✅ EVERYTHING from Essential Plan +</div>

                                        <div style={{ fontSize: 'clamp(0.95rem, 3.8vw, 1.1rem)', color: '#4ade80', fontWeight: '700' }}>🔥 Module 4: Emergency Protocol</div>

                                        <div style={{ fontSize: 'clamp(0.95rem, 3.8vw, 1.1rem)', color: '#4ade80', fontWeight: '700' }}>🔥 24/7 Priority WhatsApp Support</div>

                                        <div style={{ fontSize: 'clamp(0.95rem, 3.8vw, 1.1rem)', color: '#4ade80', fontWeight: '700' }}>🔥 Private Support Community</div>

                                        <div style={{ fontSize: 'clamp(0.95rem, 3.8vw, 1.1rem)', color: '#4ade80', fontWeight: '700' }}>🔥 Extended 60-Day Guarantee</div>

                                        <div style={{ fontSize: 'clamp(0.95rem, 3.8vw, 1.1rem)', color: '#4ade80', fontWeight: '700' }}>🔥 Bonus: "How To Read Her Mind" Guide</div>

                                        <div style={{ fontSize: 'clamp(0.95rem, 3.8vw, 1.1rem)', color: '#4ade80', fontWeight: '700' }}>🔥 Lifetime Updates</div>

                                    </div>

                                </div>

                                

                                <button 

                                    onClick={() => setSelectedPlan(27)}

                                    style={{

                                        background: selectedPlan === 27 ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #10b981, #059669)',

                                        color: 'white',

                                        fontSize: 'clamp(1rem, 4vw, 1.25rem)',

                                        fontWeight: '900',

                                        padding: 'clamp(16px, 4vw, 20px)',

                                        borderRadius: '12px',

                                        border: '3px solid #4ade80',

                                        cursor: 'pointer',

                                        width: '100%',

                                        transition: 'all 0.3s ease',

                                        animation: selectedPlan !== 27 ? 'pulse 1.5s infinite' : 'none'

                                    }}

                                >

                                    {selectedPlan === 27 ? '✅ PLAN SELECTED' : '🚀 CHOOSE TOTAL PLAN (RECOMMENDED)'}

                                </button>

                            </div>

                        </div>

                        {/* ✅ MAIN CTA - OPTIMIZED POSITION (right after plans) */}

                        <button 

                            className="cta-button btn-green btn-size-4 btn-animation-pulse" 

                            onClick={handleCTAClick}

                            style={{

                                width: '100%',

                                background: selectedPlan ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(100,100,100,0.5)',

                                color: 'white',

                                fontWeight: '900',

                                padding: 'clamp(20px, 4vw, 26px)',

                                borderRadius: '16px',

                                border: selectedPlan ? '4px solid #4ade80' : '4px solid rgba(150,150,150,0.5)',

                                cursor: selectedPlan ? 'pointer' : 'not-allowed',

                                boxShadow: selectedPlan ? '0 8px 32px rgba(16, 185, 129, 0.6)' : 'none',

                                animation: selectedPlan ? 'pulse 1.5s infinite' : 'none',

                                display: 'flex',

                                flexDirection: 'column',

                                alignItems: 'center',

                                gap: 'clamp(6px, 1.5vw, 8px)',

                                marginBottom: 'clamp(16px, 3vw, 24px)',

                                transition: 'all 0.3s ease'

                            }}

                        >

                            <span style={{

                                fontSize: 'clamp(1.2rem, 4.5vw, 1.6rem)',

                                lineHeight: '1.3'

                            }}>

                                {selectedPlan 

                                    ? `🚀 ACCESS MY PLAN FOR $${selectedPlan}` 

                                    : '👆 CHOOSE A PLAN ABOVE FIRST'

                                }

                            </span>

                            <span style={{

                                fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)',

                                color: '#fef08a',

                                fontWeight: '700'

                            }}>

                                ⏰ Your analysis expires in {formatTime(offerTimeLeft)} • Only {spotsLeft} spots left

                            </span>

                            <span style={{

                                fontSize: 'clamp(0.8rem, 3vw, 0.95rem)',

                                color: 'rgba(255,255,255,0.95)',

                                fontWeight: '600'

                            }}>

                                🛡️ 30-day guarantee • Zero risk

                            </span>

                        </button>

                        {/* ✅ IMPROVEMENT #6: 2 Testimonials (Mateo + Pablo) */}

                        <div style={{

                            marginTop: 'clamp(20px, 4vw, 32px)',

                            marginBottom: 'clamp(20px, 4vw, 32px)'

                        }}>

                            <h2 style={{

                                fontSize: 'clamp(1.4rem, 5.5vw, 1.8rem)',

                                color: 'white',

                                fontWeight: '900',

                                textAlign: 'center',

                                marginBottom: 'clamp(16px, 3vw, 24px)'

                            }}>

                                What Those Who Already Won Their Ex Back Say

                            </h2>

                            

                            <div style={{

                                display: 'flex',

                                flexDirection: 'column',

                                gap: 'clamp(12px, 3vw, 16px)'

                            }}>

                                

                                {/* TESTIMONIAL 1: Mateo R. - Argentina */}

                                <div style={{

                                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(74, 222, 128, 0.1))',

                                    border: '2px solid rgba(16, 185, 129, 0.4)',

                                    borderRadius: '16px',

                                    padding: 'clamp(14px, 3.5vw, 20px)',

                                    boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',

                                    display: 'flex',

                                    gap: 'clamp(12px, 3vw, 16px)',

                                    alignItems: 'flex-start',

                                    flexDirection: 'row',

                                    flexWrap: 'wrap'

                                }}>

                                    {/* Mateo Avatar - PASTE THE PHOTO LINK IN src="" */}

                                    <img 

                                        src="https://i.ibb.co/SXrh3Tds/Generatedimage-1768685267274.png" 

                                        alt="Mateo R." 

                                        style={{

                                            width: 'clamp(55px, 14vw, 70px)',

                                            height: 'clamp(55px, 14vw, 70px)',

                                            borderRadius: '50%',

                                            objectFit: 'cover',

                                            border: '3px solid rgba(16, 185, 129, 0.6)',

                                            flexShrink: 0

                                        }}

                                    />

                                    <div style={{ flex: 1, minWidth: '200px' }}>

                                        <div style={{

                                            display: 'flex',

                                            alignItems: 'center',

                                            gap: '8px',

                                            marginBottom: 'clamp(6px, 1.5vw, 10px)',

                                            flexWrap: 'wrap'

                                        }}>

                                            <strong style={{

                                                fontSize: 'clamp(0.95rem, 3.8vw, 1.15rem)',

                                                color: '#10b981'

                                            }}>

                                                Mateo R.

                                            </strong>

                                            <span style={{

                                                fontSize: 'clamp(0.7rem, 2.8vw, 0.8rem)',

                                                color: 'rgba(255,255,255,0.6)'

                                            }}>

                                                • Buenos Aires, Argentina • 4 days ago

                                            </span>

                                        </div>

                                        <div style={{

                                            color: '#facc15',

                                            fontSize: 'clamp(0.9rem, 3.5vw, 1.1rem)',

                                            marginBottom: 'clamp(6px, 1.5vw, 8px)'

                                        }}>

                                            ⭐⭐⭐⭐⭐

                                        </div>

                                        <p style={{

                                            fontSize: 'clamp(0.85rem, 3.2vw, 1rem)',

                                            lineHeight: '1.5',

                                            color: 'white',

                                            margin: 0,

                                            fontStyle: 'italic'

                                        }}>

                                            "I'd give it ten out of five stars! At first I was skeptical about the program. I thought they were fake reviews and I had lost all hope with my girlfriend. She was already with another guy and I was destroyed. We couldn't talk without fighting, and now 4 days after starting the program, with what I learned from Module 4 (Emergency Protocol), it's not perfect but we're back together and willing to do everything to make it work. Module 4 saved me from making fatal mistakes."

                                        </p>

                                    </div>

                                </div>

                                {/* TESTIMONIAL 2: Pablo S. - Spain (SHORT) */}

                                <div style={{

                                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(74, 222, 128, 0.1))',

                                    border: '2px solid rgba(16, 185, 129, 0.4)',

                                    borderRadius: '16px',

                                    padding: 'clamp(12px, 3vw, 16px)',

                                    boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',

                                    display: 'flex',

                                    gap: 'clamp(12px, 3vw, 16px)',

                                    alignItems: 'flex-start',

                                    flexDirection: 'row',

                                    flexWrap: 'wrap'

                                }}>

                                    {/* Pablo Avatar - PASTE THE PHOTO LINK IN src="" */}

                                    <img 

                                        src="https://i.ibb.co/XdsjWTm/Generatedimage-1768481087053.png" 

                                        alt="Pablo S." 

                                        style={{

                                            width: 'clamp(55px, 14vw, 70px)',

                                            height: 'clamp(55px, 14vw, 70px)',

                                            borderRadius: '50%',

                                            objectFit: 'cover',

                                            border: '3px solid rgba(16, 185, 129, 0.6)',

                                            flexShrink: 0

                                        }}

                                    />

                                    <div style={{ flex: 1, minWidth: '200px' }}>

                                        <div style={{

                                            display: 'flex',

                                            alignItems: 'center',

                                            gap: '8px',

                                            marginBottom: 'clamp(6px, 1.5vw, 10px)',

                                            flexWrap: 'wrap'

                                        }}>

                                            <strong style={{

                                                fontSize: 'clamp(0.95rem, 3.8vw, 1.15rem)',

                                                color: '#10b981'

                                            }}>

                                                Pablo S.

                                            </strong>

                                            <span style={{

                                                fontSize: 'clamp(0.7rem, 2.8vw, 0.8rem)',

                                                color: 'rgba(255,255,255,0.6)'

                                            }}>

                                                • Madrid, Spain • Yesterday

                                            </span>

                                        </div>

                                        <div style={{

                                            color: '#facc15',

                                            fontSize: 'clamp(0.9rem, 3.5vw, 1.1rem)',

                                            marginBottom: 'clamp(6px, 1.5vw, 8px)'

                                        }}>

                                            ⭐⭐⭐⭐⭐

                                        </div>

                                        <p style={{

                                            fontSize: 'clamp(0.85rem, 3.2vw, 1rem)',

                                            lineHeight: '1.5',

                                            color: 'white',

                                            margin: 0,

                                            fontStyle: 'italic',

                                            fontWeight: '700'

                                        }}>

                                            "I got her back. I've scheduled two dates with her. I got her back."

                                        </p>

                                    </div>

                                </div>

                                

                            </div>

                        </div>

                        {/* ✅ IMPROVEMENT #7: Section of 3 benefits/transformations */}

                        <div style={{

                            marginTop: 'clamp(20px, 4vw, 32px)',

                            marginBottom: 'clamp(20px, 4vw, 32px)'

                        }}>

                            <h2 style={{

                                fontSize: 'clamp(1.4rem, 5.5vw, 1.8rem)',

                                color: 'white',

                                fontWeight: '900',

                                textAlign: 'center',

                                marginBottom: 'clamp(16px, 3vw, 24px)'

                            }}>

                                What You Get With Your Personalized Plan

                            </h2>

                            

                            <div style={{

                                display: 'flex',

                                flexDirection: 'column',

                                gap: 'clamp(12px, 3vw, 16px)'

                            }}>

                                

                                <div style={{

                                    background: 'rgba(0,0,0,0.2)',

                                    borderLeft: '4px solid #10b981',

                                    borderRadius: '8px',

                                    padding: 'clamp(12px, 3vw, 16px)',

                                    display: 'flex',

                                    gap: '12px',

                                    alignItems: 'flex-start'

                                }}>

                                    <span style={{ fontSize: 'clamp(1.8rem, 5vw, 2.2rem)', flexShrink: 0 }}>🧠</span>

                                    <p style={{

                                        fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)',

                                        color: 'white',

                                        lineHeight: '1.5',

                                        margin: 0

                                    }}>

                                        Extremely powerful techniques to <strong style={{ color: '#4ade80' }}>activate her oxytocin</strong>, adapted to your relationship profile

                                    </p>

                                </div>

                                <div style={{

                                    background: 'rgba(0,0,0,0.2)',

                                    borderLeft: '4px solid #10b981',

                                    borderRadius: '8px',

                                    padding: 'clamp(12px, 3vw, 16px)',

                                    display: 'flex',

                                    gap: '12px',

                                    alignItems: 'flex-start'

                                }}>

                                    <span style={{ fontSize: 'clamp(1.8rem, 5vw, 2.2rem)', flexShrink: 0 }}>❤️</span>

                                    <p style={{

                                        fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)',

                                        color: 'white',

                                        lineHeight: '1.5',

                                        margin: 0

                                    }}>

                                        She will be <strong style={{ color: '#4ade80' }}>helplessly and uncontrollably attracted</strong> to you

                                    </p>

                                </div>

                                <div style={{

                                    background: 'rgba(0,0,0,0.2)',

                                    borderLeft: '4px solid #eab308',

                                    borderRadius: '8px',

                                    padding: 'clamp(12px, 3vw, 16px)',

                                    display: 'flex',

                                    gap: '12px',

                                    alignItems: 'flex-start'

                                }}>

                                    <span style={{ fontSize: 'clamp(1.8rem, 5vw, 2.2rem)', flexShrink: 0 }}>💪</span>

                                    <p style={{

                                        fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)',

                                        color: 'white',

                                        lineHeight: '1.5',

                                        margin: 0

                                    }}>

                                        You'll have <strong style={{ color: '#facc15' }}>elevated confidence and self-esteem</strong>

                                    </p>

                                </div>

                                

                            </div>

                        </div>

                        {/* ✅ IMPROVEMENT #9: Compact guarantee */}

                        <div style={{

                            background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.15), rgba(16, 185, 129, 0.1))',

                            border: '3px solid rgba(74, 222, 128, 0.4)',

                            borderRadius: '16px',

                            padding: 'clamp(16px, 4vw, 24px)',

                            margin: '0 0 clamp(20px, 4vw, 32px) 0',

                            textAlign: 'center',

                            boxShadow: '0 8px 32px rgba(74, 222, 128, 0.3)'

                        }}>

                            <div style={{ fontSize: 'clamp(2.5rem, 10vw, 4rem)', marginBottom: 'clamp(10px, 2.5vw, 14px)' }}>

                                🛡️

                            </div>

                            <h3 style={{

                                fontSize: 'clamp(1.2rem, 5vw, 1.6rem)',

                                color: '#4ade80',

                                marginBottom: 'clamp(12px, 3vw, 16px)',

                                fontWeight: '900',

                                textTransform: 'uppercase'

                            }}>

                                IRONCLAD 30-DAY GUARANTEE

                            </h3>

                            <p style={{

                                fontSize: 'clamp(0.95rem, 3.8vw, 1.15rem)',

                                lineHeight: '1.6',

                                color: 'white',

                                marginBottom: 'clamp(12px, 3vw, 16px)'

                            }}>

                                If in 30 days you don't see <strong style={{ color: '#4ade80' }}>concrete results</strong> in your reconquest 

                                (messages from {gender === 'HOMBRE' ? 'her' : 'him'}, change of attitude, getting closer), 

                                <strong style={{ color: '#4ade80' }}> we'll return 100% of your money</strong>.

                            </p>

                            <div style={{

                                display: 'grid',

                                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',

                                gap: 'clamp(8px, 2vw, 12px)',

                                textAlign: 'left'

                            }}>

                                <p style={{ fontSize: 'clamp(0.85rem, 3.5vw, 1rem)', color: 'rgba(255,255,255,0.95)', margin: 0 }}>

                                    ✅ No awkward questions

                                </p>

                                <p style={{ fontSize: 'clamp(0.85rem, 3.5vw, 1rem)', color: 'rgba(255,255,255,0.95)', margin: 0 }}>

                                    ✅ No red tape

                                </p>

                                <p style={{ fontSize: 'clamp(0.85rem, 3.5vw, 1rem)', color: 'rgba(255,255,255,0.95)', margin: 0 }}>

                                    ✅ Refund in 24-48 hours

                                </p>

                                <p style={{ fontSize: 'clamp(0.85rem, 3.5vw, 1rem)', color: '#facc15', margin: 0, fontWeight: '700' }}>

                                    ✅ ZERO RISK FOR YOU

                                </p>

                            </div>

                        </div>

                        {/* ✅ IMPROVEMENT #10: Expanded FAQ (4 questions) */}

                        <div style={{

                            background: 'rgba(0,0,0,0.3)',

                            border: '2px solid rgba(255,255,255,0.1)',

                            borderRadius: '16px',

                            padding: 'clamp(14px, 3.5vw, 20px)',

                            marginBottom: 'clamp(20px, 4vw, 32px)'

                        }}>

                            <h3 style={{

                                fontSize: 'clamp(1.15rem, 4.5vw, 1.4rem)',

                                color: 'white',

                                fontWeight: '900',

                                textAlign: 'center',

                                marginBottom: 'clamp(14px, 3vw, 18px)'

                            }}>

                                ❓ FREQUENTLY ASKED QUESTIONS

                            </h3>

                            <div style={{

                                display: 'flex',

                                flexDirection: 'column',

                                gap: 'clamp(10px, 2.5vw, 14px)'

                            }}>

                                {/* Question 1 */}

                                <details style={{

                                    background: 'rgba(234, 179, 8, 0.1)',

                                    borderLeft: '4px solid #eab308',

                                    padding: 'clamp(14px, 3.5vw, 16px)',

                                    borderRadius: '8px',

                                    cursor: 'pointer'

                                }}>

                                    <summary style={{

                                        fontSize: 'clamp(1rem, 4vw, 1.15rem)',

                                        color: '#facc15',

                                        fontWeight: '700',

                                        cursor: 'pointer',

                                        listStyle: 'none'

                                    }}>

                                        ❓ Does it work if {gender === 'HOMBRE' ? 'she\'s already with someone else' : 'he\'s already with someone else'}?

                                    </summary>

                                    <p style={{

                                        fontSize: 'clamp(0.95rem, 3.8vw, 1.05rem)',

                                        color: 'rgba(255,255,255,0.9)',

                                        marginTop: 'clamp(12px, 3vw, 16px)',

                                        lineHeight: '1.6'

                                    }}>

                                        <strong style={{ color: '#4ade80' }}>✅ Yes.</strong> Module 4 (Emergency Protocol) 

                                        was created specifically for that situation. It has already saved +2,100 cases where {gender === 'HOMBRE' ? 'she was with another guy' : 'he was with another person'}.

                                    </p>

                                </details>

                                {/* Question 2 */}

                                <details style={{

                                    background: 'rgba(234, 179, 8, 0.1)',

                                    borderLeft: '4px solid #eab308',

                                    padding: 'clamp(14px, 3.5vw, 16px)',

                                    borderRadius: '8px',

                                    cursor: 'pointer'

                                }}>

                                    <summary style={{

                                        fontSize: 'clamp(1rem, 4vw, 1.15rem)',

                                        color: '#facc15',

                                        fontWeight: '700',

                                        cursor: 'pointer',

                                        listStyle: 'none'

                                    }}>

                                        ❓ How long does it take to see results?

                                    </summary>

                                    <p style={{

                                        fontSize: 'clamp(0.95rem, 3.8vw, 1.05rem)',

                                        color: 'rgba(255,255,255,0.9)',

                                        marginTop: 'clamp(12px, 3vw, 16px)',

                                        lineHeight: '1.6'

                                    }}>

                                        <strong style={{ color: '#4ade80' }}>The 72-Hour Window starts TODAY.</strong> 

                                        Most men see the first changes (messages, looks, signals) 

                                        between day 7 and 21. Emergency cases can take up to 45 days.

                                    </p>

                                </details>

                                {/* Question 3 (NEW) */}

                                <details style={{

                                    background: 'rgba(234, 179, 8, 0.1)',

                                    borderLeft: '4px solid #eab308',

                                    padding: 'clamp(14px, 3.5vw, 16px)',

                                    borderRadius: '8px',

                                    cursor: 'pointer'

                                }}>

                                    <summary style={{

                                        fontSize: 'clamp(1rem, 4vw, 1.15rem)',

                                        color: '#facc15',

                                        fontWeight: '700',

                                        cursor: 'pointer',

                                        listStyle: 'none'

                                    }}>

                                        ❓ What do I need to succeed?

                                    </summary>

                                    <p style={{

                                        fontSize: 'clamp(0.95rem, 3.8vw, 1.05rem)',

                                        color: 'rgba(255,255,255,0.9)',

                                        marginTop: 'clamp(12px, 3vw, 16px)',

                                        lineHeight: '1.6'

                                    }}>

                                        Complete the daily tasks, give feedback, and study the materials. We've designed the plan so that <strong style={{ color: '#4ade80' }}>each day brings you closer to your goal</strong>, step by step.

                                    </p>

                                </details>

                                {/* Question 4 (NEW) */}

                                <details style={{

                                    background: 'rgba(234, 179, 8, 0.1)',

                                    borderLeft: '4px solid #eab308',

                                    padding: 'clamp(14px, 3.5vw, 16px)',

                                    borderRadius: '8px',

                                    cursor: 'pointer'

                                }}>

                                    <summary style={{

                                        fontSize: 'clamp(1rem, 4vw, 1.15rem)',

                                        color: '#facc15',

                                        fontWeight: '700',

                                        cursor: 'pointer',

                                        listStyle: 'none'

                                    }}>

                                        ❓ What if I struggle to stay motivated?

                                    </summary>

                                    <p style={{

                                        fontSize: 'clamp(0.95rem, 3.8vw, 1.05rem)',

                                        color: 'rgba(255,255,255,0.9)',

                                        marginTop: 'clamp(12px, 3vw, 16px)',

                                        lineHeight: '1.6'

                                    }}>

                                        Don't worry! Our plan is designed to <strong style={{ color: '#4ade80' }}>build motivation gradually</strong>, so you won't have to rely on it too much from the start. Plus, we're here to provide you with <strong style={{ color: '#4ade80' }}>constant support</strong> and expert guidance.

                                    </p>

                                </details>

                            </div>

                        </div>

                        {/* Secondary CTA */}

                        <button 

                            className="cta-button btn-green btn-size-4 btn-animation-pulse" 

                            onClick={handleCTAClick}

                            style={{

                                width: '100%',

                                background: selectedPlan ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(100,100,100,0.5)',

                                color: 'white',

                                fontSize: 'clamp(1.25rem, 5vw, 1.75rem)',

                                fontWeight: '900',

                                padding: 'clamp(20px, 4.5vw, 28px)',

                                borderRadius: '16px',

                                border: selectedPlan ? '4px solid #4ade80' : '4px solid rgba(150,150,150,0.5)',

                                cursor: selectedPlan ? 'pointer' : 'not-allowed',

                                lineHeight: '1.3',

                                marginBottom: 'clamp(20px, 4vw, 24px)'

                            }}

                        >

                            {selectedPlan 

                                ? `✅ ACCESS MY PLAN FOR $${selectedPlan} →` 

                                : '👆 CHOOSE A PLAN ABOVE FIRST'

                            }

                        </button>

                        {/* Final urgency grid */}

                        <div style={{

                            display: 'grid',

                            gridTemplateColumns: '1fr 1fr',

                            gap: 'clamp(12px, 3vw, 16px)',

                            marginBottom: 'clamp(20px, 4vw, 24px)'

                        }}>

                            <div style={{

                                background: 'rgba(0,0,0,0.3)',

                                padding: 'clamp(12px, 3vw, 14px)',

                                borderRadius: '10px',

                                textAlign: 'center',

                                border: '2px solid rgba(234, 179, 8, 0.3)'

                            }}>

                                <p style={{ fontSize: 'clamp(0.8rem, 3vw, 0.95rem)', color: 'rgba(255,255,255,0.7)', margin: '0 0 6px 0' }}>

                                    ⏰ Expires in:

                                </p>

                                <p style={{ fontSize: 'clamp(1.1rem, 4.5vw, 1.4rem)', color: '#facc15', fontWeight: '900', margin: 0 }}>

                                    {formatTime(offerTimeLeft)}

                                </p>

                            </div>

                            <div style={{

                                background: 'rgba(0,0,0,0.3)',

                                padding: 'clamp(12px, 3vw, 14px)',

                                borderRadius: '10px',

                                textAlign: 'center',

                                border: '2px solid rgba(234, 179, 8, 0.3)'

                            }}>

                                <p style={{ fontSize: 'clamp(0.8rem, 3vw, 0.95rem)', color: 'rgba(255,255,255,0.7)', margin: '0 0 6px 0' }}>

                                    🔥 Spots:

                                </p>

                                <p style={{ fontSize: 'clamp(1.1rem, 4.5vw, 1.4rem)', color: '#f97316', fontWeight: '900', margin: 0 }}>

                                    {spotsLeft}/50

                                </p>

                            </div>

                        </div>

                        {/* Social proof footer */}

                        <div style={{

                            background: 'rgba(74, 222, 128, 0.1)',

                            border: '2px solid rgba(74, 222, 128, 0.3)',

                            borderRadius: '10px',

                            padding: 'clamp(14px, 3.5vw, 16px)',

                            textAlign: 'center',

                            marginBottom: 'clamp(16px, 4vw, 20px)'

                        }}>

                            <p style={{

                                fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)',

                                color: '#4ade80',

                                fontWeight: '700',

                                margin: 0

                            }}>

                                ⭐ 4.8/5 stars • +9,247 successful reconquests<br/>

                                <span style={{ fontSize: 'clamp(0.8rem, 3vw, 0.95rem)', opacity: 0.8 }}>

                                    ✨ {peopleBuying} people buying now

                                </span>

                            </p>

                        </div>

                        <p style={{

                            textAlign: 'center',

                            fontSize: 'clamp(0.8rem, 3vw, 0.95rem)',

                            lineHeight: '1.6',

                            color: 'rgba(255, 255, 255, 0.6)',

                            fontStyle: 'italic',

                            margin: 0

                        }}>

                            🔒 100% secure purchase • Instant access • 30-day ironclad guarantee

                        </p>

                    </div>

                )}

            </div>

            <style>{`

                .result-container { padding-bottom: 100px; }

                .result-header { text-align: center; padding: 20px; background: rgba(0,0,0,0.5); border-radius: 12px; margin-bottom: 20px; }

                .result-title { font-size: clamp(1.5rem, 6vw, 2.5rem); color: white; margin: 0; font-weight: 900; }

                .progress-bar-container { display: flex; justify-content: space-between; margin: 20px auto; max-width: 800px; padding: 15px; background: rgba(0,0,0,0.4); border-radius: 12px; position: sticky; top: 0; z-index: 999; backdrop-filter: blur(5px); gap: 10px; }

                .progress-step { flex: 1; display: flex; flex-direction: column; align-items: center; color: rgba(255,255,255,0.5); font-size: 0.8rem; }

                .step-circle { width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; justify-content: center; align-items: center; margin-bottom: 5px; font-weight: bold; }

                .progress-step.active .step-circle { background: #eab308; color: black; }

                .progress-step.completed .step-circle { background: #4ade80; color: white; }

                .step-label { font-size: 0.7rem; text-align: center; }

                .revelations-container { max-width: 800px; margin: 0 auto; }

                .revelation { background: rgba(0,0,0,0.3); border: 2px solid rgba(255,255,255,0.1); border-radius: 16px; padding: clamp(20px, 5vw, 40px); margin-bottom: 30px; }

                .revelation-header { text-align: center; margin-bottom: 30px; }

                .revelation-icon { font-size: 3rem; display: block; margin-bottom: 15px; }

                .revelation h2 { font-size: clamp(1.5rem, 6vw, 2rem); color: white; margin: 0; font-weight: 900; }

                .revelation-text { font-size: clamp(1rem, 4vw, 1.2rem); line-height: 1.8; color: rgba(255,255,255,0.95); }

                .quiz-summary-box { background: rgba(234, 179, 8, 0.1); border: 2px solid rgba(234, 179, 8, 0.3); border-radius: 12px; padding: 20px; margin-bottom: 30px; }

                .summary-title { color: rgb(253, 224, 71); font-weight: bold; margin-bottom: 15px; }

                .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }

                .summary-grid div { font-size: clamp(0.85rem, 3.5vw, 1rem); color: white; }

                .summary-grid span { color: #4ade80; font-weight: bold; }

                .emotional-validation { background: rgba(74, 222, 128, 0.1); border: 2px solid rgba(74, 222, 128, 0.3); border-radius: 12px; padding: 20px; margin-top: 20px; color: #4ade80; }

                .loading-box-custom { background: rgba(234, 179, 8, 0.1); border: 2px solid #eab308; border-radius: 16px; padding: 40px; text-align: center; }

                .loading-inner { display: flex; flex-direction: column; align-items: center; gap: 20px; }

                .spin-brain { font-size: 4rem; animation: spin 2s linear infinite; }

                .loading-steps-list { display: flex; flex-direction: column; gap: 10px; text-align: left; }

                .loading-step-item { font-size: clamp(0.9rem, 3.5vw, 1.1rem); color: rgba(255,255,255,0.8); }

                .loading-step-item.active { color: #4ade80; font-weight: bold; }

                .progress-outer { width: 100%; height: 10px; background: rgba(255,255,255,0.2); border-radius: 5px; overflow: hidden; }

                .progress-inner { height: 100%; background: linear-gradient(90deg, #eab308, #10b981); width: 0%; transition: width 0.1s linear; }

                .progress-labels { display: flex; justify-content: space-between; font-size: clamp(0.8rem, 3vw, 0.95rem); color: rgba(255,255,255,0.7); }

                .vsl-container { margin: 30px 0; }

                .vsl-placeholder { width: 100%; max-width: 400px; margin: 0 auto; }

                .video-delay-indicator { background: rgba(0,0,0,0.4); border: 2px solid #eab308; border-radius: 12px; padding: 20px; margin-top: 20px; text-align: center; color: white; display: flex; flex-direction: column; align-items: center; gap: 15px; }

                .delay-text { font-size: 1.1rem; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 10px; }

                .delay-progress-bar-container { width: 100%; height: 10px; background: rgba(255,255,255,0.2); border-radius: 5px; overflow: hidden; }

                .delay-progress-bar { height: 100%; background: linear-gradient(90deg, #eab308, #10b981); transition: width 1s linear; }

                .checkmark-container { display: flex; justify-content: center; margin: 20px 0; }

                .checkmark-glow { font-size: 4rem; animation: glow 1.5s ease-in-out infinite alternate; }

                .fade-in { animation: fadeIn 0.5s ease-out; }

                .fade-out { animation: fadeOut 0.4s ease-out forwards; }

                .cta-button { font-weight: bold; border: none; cursor: pointer; transition: all 0.3s ease; display: block; width: 100%; text-align: center; }

                .btn-green { background: linear-gradient(135deg, #10b981, #059669); color: white; }

                .btn-yellow { background: linear-gradient(135deg, #eab308, #ca8a04); color: black; }

                .btn-orange { background: linear-gradient(135deg, #f97316, #ea580c); color: white; }

                .btn-size-1 { font-size: clamp(1rem, 4vw, 1.3rem); padding: clamp(14px, 3.5vw, 18px) clamp(24px, 5vw, 32px); border-radius: 12px; }

                .btn-size-2 { font-size: clamp(1.1rem, 4.5vw, 1.4rem); padding: clamp(16px, 4vw, 20px) clamp(28px, 5.5vw, 36px); border-radius: 12px; }

                .btn-size-3 { font-size: clamp(1.2rem, 5vw, 1.5rem); padding: clamp(18px, 4.5vw, 24px) clamp(32px, 6vw, 40px); border-radius: 14px; }

                .btn-size-4 { font-size: clamp(1.3rem, 5.5vw, 1.75rem); padding: clamp(20px, 5vw, 28px) clamp(36px, 7vw, 48px); border-radius: 16px; }

                .btn-animation-fadein { animation: fadeIn 0.5s ease-out; }

                .btn-animation-bounce { animation: bounce 2s infinite; }

                .btn-animation-pulse { animation: pulse 1.5s infinite; }

                .cta-button.disabled { opacity: 0.5; cursor: not-allowed; }

                .ventana-box-custom { background: linear-gradient(180deg, rgba(249, 115, 22, 0.1) 0%, rgba(0,0,0,0.4) 100%); border: 2px solid rgba(249, 115, 22, 0.4); }

                .ventana-header-custom { text-align: center; margin-bottom: 24px; }

                .ventana-header-custom span { font-size: 3rem; display: block; margin-bottom: 12px; }

                .ventana-header-custom h2 { font-size: clamp(1.5rem, 6vw, 2.2rem); color: #f97316; margin: 0; font-weight: 900; text-transform: uppercase; }

                .ventana-scientific-intro { background: rgba(16, 185, 129, 0.1); border: 2px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: clamp(16px, 4vw, 20px); margin-bottom: 24px; }

                .ventana-scientific-intro p { font-size: clamp(0.95rem, 3.8vw, 1.1rem); color: rgba(255,255,255,0.9); line-height: 1.6; margin: 0; }

                .ventana-img-top { width: 100%; max-width: 600px; margin: 0 auto 16px auto; display: block; border-radius: 12px; border: 2px solid rgba(249, 115, 22, 0.3); }

                .ventana-img-caption { font-size: clamp(0.8rem, 3vw, 0.95rem); color: rgba(255,255,255,0.6); text-align: center; font-style: italic; margin-bottom: 24px; }

                .ventana-importance-box { background: rgba(234, 179, 8, 0.1); border: 2px solid rgba(234, 179, 8, 0.4); border-radius: 12px; padding: clamp(16px, 4vw, 20px); margin-bottom: 24px; }

                .importance-title { font-size: clamp(1.1rem, 4.5vw, 1.4rem); color: #facc15; margin: 0 0 16px 0; font-weight: 900; }

                .importance-bullets { display: flex; flex-direction: column; gap: 10px; }

                .importance-item { font-size: clamp(0.9rem, 3.5vw, 1.05rem); color: white; line-height: 1.5; }

                .ventana-intro { font-size: clamp(1rem, 4vw, 1.2rem); line-height: 1.8; color: rgba(255,255,255,0.95); margin-bottom: 24px; }

                .ventana-summary-box { background: rgba(0,0,0,0.3); border: 2px solid rgba(255,255,255,0.15); border-radius: 12px; padding: clamp(16px, 4vw, 20px); margin-bottom: 24px; }

                .summary-quick-title { font-size: clamp(1rem, 4vw, 1.2rem); color: #facc15; margin: 0 0 16px 0; font-weight: 700; }

                .summary-quick-list { display: flex; flex-direction: column; gap: 10px; }

                .summary-quick-item { font-size: clamp(0.9rem, 3.5vw, 1.05rem); color: rgba(255,255,255,0.9); line-height: 1.5; }

                .fases-list-dopamine { display: flex; flex-direction: column; gap: 20px; margin-bottom: 30px; }

                .fase-card-dopamine { background: linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(234, 179, 8, 0.05)); border: 2px solid rgba(249, 115, 22, 0.3); border-radius: 16px; padding: clamp(20px, 5vw, 28px); }

                .fase-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px; }

                .fase-number { background: linear-gradient(135deg, #f97316, #ea580c); color: white; font-size: clamp(0.8rem, 3vw, 0.95rem); font-weight: 900; padding: 6px 14px; border-radius: 20px; }

                .fase-timerange { font-size: clamp(0.8rem, 3vw, 0.95rem); color: rgba(255,255,255,0.7); font-weight: 600; }

                .fase-card-title { font-size: clamp(1.1rem, 4.5vw, 1.4rem); color: white; margin: 0 0 12px 0; font-weight: 900; }

                .fase-card-summary { font-size: clamp(0.95rem, 3.8vw, 1.1rem); color: rgba(255,255,255,0.85); line-height: 1.6; margin-bottom: 16px; }

                .fase-card-bullets { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }

                .fase-bullet-item { font-size: clamp(0.85rem, 3.5vw, 1rem); color: #4ade80; line-height: 1.5; }

                .fase-card-warning { background: rgba(234, 179, 8, 0.15); border-left: 4px solid #eab308; padding: 12px; border-radius: 8px; font-size: clamp(0.85rem, 3.5vw, 1rem); color: #facc15; margin-bottom: 16px; }

                .fase-card-footer { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }

                .fase-check { font-size: clamp(0.8rem, 3vw, 0.95rem); color: #4ade80; font-weight: 700; }

                .fase-next { font-size: clamp(0.8rem, 3vw, 0.95rem); color: rgba(255,255,255,0.6); }

                .offer-section-custom { background: linear-gradient(180deg, rgba(16, 185, 129, 0.1) 0%, rgba(0,0,0,0.4) 100%); border: 3px solid rgba(16, 185, 129, 0.4); }

                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

                @keyframes fadeOut { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-20px); } }

                @keyframes glow { from { text-shadow: 0 0 10px #4ade80, 0 0 20px #4ade80; } to { text-shadow: 0 0 20px #4ade80, 0 0 40px #4ade80, 0 0 60px #4ade80; } }

                @keyframes bounce { 0%, 20%, 50%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-10px); } 60% { transform: translateY(-5px); } }

                @keyframes pulse { 0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); } 70% { transform: scale(1.02); box-shadow: 0 0 0 15px rgba(16, 185, 129, 0); } 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }

                details summary::-webkit-details-marker { display: none; }

                details summary::before { content: '▶ '; transition: transform 0.3s; display: inline-block; }

                details[open] summary::before { transform: rotate(90deg); }

            `}</style>

        </div>

    );

}