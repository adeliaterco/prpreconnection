import { useState, useEffect, useRef } from 'react';
import { tracking } from '../utils/tracking';
import { storage } from '../utils/storage';
import { playKeySound } from '../utils/animations';
import { QuizAnswer } from '../types/quiz';
import { getCompletionBadge } from '../utils/contentByGender';
import { ga4Tracking } from '../utils/ga4Tracking';

interface ChatProps {
  onNavigate: (page: string) => void;
}

interface Message {
  type: 'bot' | 'user';
  text: string;
  isTyping?: boolean;
}

interface Question {
  id: number;
  text: string;
  options?: string[];
  optionsByGender?: {
    MALE: string[];
    FEMALE: string[];
  };
  response: string;
  responseByGender?: {
    MALE: string;
    FEMALE: string;
  };
  dataKey: 'gender' | 'timeSeparation' | 'whoEnded' | 'relationshipDuration' | 'currentSituation' | 'exSituation' | 'commitmentLevel';
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: 'To calibrate the analysis, I need to know: what is your gender?',
    options: ['MALE', 'FEMALE'],
    response: 'Got it.',
    responseByGender: {
      MALE: 'Perfect. I\'m going to calibrate the analysis based on the specific patterns of female behavior after a breakup. Every answer you give will help me understand exactly what\'s happening with her.',
      FEMALE: 'Perfect. I\'m going to calibrate the analysis based on the specific patterns of male behavior after a breakup. Every answer you give will help me understand exactly what\'s happening with him.'
    },
    dataKey: 'gender',
  },
  {
    id: 2,
    text: 'Understood. Now, how long has it been since you separated?',
    options: ['LESS THAN 1 WEEK', '1-4 WEEKS', '1-6 MONTHS', 'MORE THAN 6 MONTHS'],
    response: 'Recorded.',
    responseByGender: {
      MALE: 'Recorded. Time is crucial. During this period, her brain goes through specific chemical phases. The more recent the separation, the more active her emotional memory. We\'re going to use that strategically.',
      FEMALE: 'Recorded. Time is crucial. During this period, his brain goes through specific chemical phases. The more recent the separation, the more active his emotional memory. We\'re going to use that strategically.'
    },
    dataKey: 'timeSeparation',
  },
  {
    id: 3,
    text: 'Good. And how was the separation? Who took the initiative?',
    optionsByGender: {
      MALE: ['SHE ENDED IT', 'I ENDED IT', 'MUTUAL DECISION'],
      FEMALE: ['HE ENDED IT', 'I ENDED IT', 'MUTUAL DECISION']
    },
    response: 'Right.',
    responseByGender: {
      MALE: 'I understand. When she makes the decision to end things, it means something activated an emotional "switch" in her brain. The good news: that switch can be reversed if you know exactly which buttons to press. And that\'s what we\'re going to discover.',
      FEMALE: 'I understand. When he makes the decision to end things, it means something activated an emotional "switch" in his brain. The good news: that switch can be reversed if you know exactly which buttons to press. And that\'s what we\'re going to discover.'
    },
    dataKey: 'whoEnded',
  },
  {
    id: 4,
    text: 'Recorded. How long were you together?',
    options: ['LESS THAN 6 MONTHS', '6 MONTHS-1 YEAR', '1-3 YEARS', 'MORE THAN 3 YEARS'],
    response: 'Ok.',
    responseByGender: {
      MALE: 'Perfect. The relationship time defines how many "emotional anchors" you created in her memory. The longer together, the deeper the neural connections. That works in your favor if you use the right protocol.',
      FEMALE: 'Perfect. The relationship time defines how many "emotional anchors" you created in his memory. The longer together, the deeper the neural connections. That works in your favor if you use the right protocol.'
    },
    dataKey: 'relationshipDuration',
  },
  {
    id: 5,
    text: 'What is your current situation with your ex?',
    options: ['NO CONTACT', 'IGNORING ME', 'BLOCKED', 'ONLY NECESSARY TOPICS', 'WE TALK SOMETIMES', 'WE ARE FRIENDS', 'INTIMATE ENCOUNTERS'],
    response: 'Analyzing...',
    responseByGender: {
      MALE: 'Key information. The current level of contact reveals exactly what emotional phase she\'s in. Each scenario requires a different protocol. If there\'s no contact, we use one strategy. If there\'s communication, we use a completely different one.',
      FEMALE: 'Key information. The current level of contact reveals exactly what emotional phase he\'s in. Each scenario requires a different protocol. If there\'s no contact, we use one strategy. If there\'s communication, we use a completely different one.'
    },
    dataKey: 'currentSituation',
  },
  {
    id: 6,
    text: 'Analyzing... Now, crucial information: is your ex already with someone else?',
    optionsByGender: {
      MALE: ['SHE\'S SINGLE', 'I\'M NOT SURE', 'CASUAL DATING', 'SERIOUS RELATIONSHIP', 'MULTIPLE PEOPLE'],
      FEMALE: ['HE\'S SINGLE', 'I\'M NOT SURE', 'CASUAL DATING', 'SERIOUS RELATIONSHIP', 'MULTIPLE PEOPLE']
    },
    response: 'Crucial.',
    responseByGender: {
      MALE: 'Understood. This changes the map, but not the destination. Even if she\'s with someone, there are specific psychological protocols that work. In fact, in some cases, this can be used strategically in your favor.',
      FEMALE: 'Understood. This changes the map, but not the destination. Even if he\'s with someone, there are specific psychological protocols that work. In fact, in some cases, this can be used strategically in your favor.'
    },
    dataKey: 'exSituation',
  },
  {
    id: 7,
    text: 'Last question to complete the analysis: on a scale of 1 to 4, how much do you want to get this relationship back?',
    optionsByGender: {
      MALE: ['1 - NOT SURE', '2 - CONSIDERING IT', '3 - I WANT IT A LOT', '4 - I WANT IT WITH ALL MY HEART'],
      FEMALE: ['1 - NOT SURE', '2 - CONSIDERING IT', '3 - I WANT IT A LOT', '4 - I WANT IT WITH ALL MY HEART']
    },
    response: 'Analysis complete!',
    responseByGender: {
      MALE: 'Analysis complete! Your commitment level defines the intensity of the protocol. The more committed you are, the more powerful the techniques I\'ll reveal to you. Now I have everything I need to show you the exact path to win her back.',
      FEMALE: 'Analysis complete! Your commitment level defines the intensity of the protocol. The more committed you are, the more powerful the techniques I\'ll reveal to you. Now I have everything I need to show you the exact path to win him back.'
    },
    dataKey: 'commitmentLevel',
  }
];

export default function Chat({ onNavigate }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typewriterTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ========================================
  // ✅ UTM PRESERVATION SYSTEM
  // ========================================
  const ensureUTMs = () => {
    try {
      const storedUTMs = localStorage.getItem('quiz_utms');
      if (storedUTMs) {
        const utms = JSON.parse(storedUTMs);
        console.log('✅ UTMs preserved in Chat:', utms);
        
        // Sync with URL if empty
        if (window.location.search === '' && Object.keys(utms).length > 0) {
          const utmString = Object.entries(utms)
            .map(([key, value]) => `${key}=${encodeURIComponent(value as string)}`)
            .join('&');
          window.history.replaceState({}, '', `${window.location.pathname}?${utmString}`);
          console.log('✅ UTMs attached to Chat URL');
        }
      } else {
        console.log('ℹ️ No stored UTMs found');
      }
    } catch (error) {
      console.error('❌ Error preserving UTMs:', error);
    }
  };

  useEffect(() => {
    // ✅ ENSURE UTMs ARE PRESERVED
    ensureUTMs();
    
    ga4Tracking.chatPageView();
    ga4Tracking.chatStarted();

    const initialMessage: Message = {
      type: 'bot',
      text: 'Hi. I\'m Dr. Sarah Mitchell, specialist in relationship recovery through behavioral psychology. My system detected your search for answers. I\'m here to analyze your case.',
      isTyping: true,
    };

    setMessages([initialMessage]);

    typewriterTimeoutRef.current = setTimeout(() => {
      setMessages([{ ...initialMessage, isTyping: false }]);
      setTimeout(() => setShowOptions(true), 300);
    }, initialMessage.text.length * 50);

    return () => {
      if (typewriterTimeoutRef.current) clearTimeout(typewriterTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleStartAnalysis = () => {
    playKeySound();
    setShowOptions(false);
    setCurrentQuestion(0);
    askQuestion(0);
  };

  const askQuestion = (questionIndex: number) => {
    const question = QUESTIONS[questionIndex];
    const newMessage: Message = {
      type: 'bot',
      text: question.text,
      isTyping: true,
    };

    setMessages(prev => [...prev, newMessage]);

    typewriterTimeoutRef.current = setTimeout(() => {
      setMessages(prev => prev.map((msg, idx) => idx === prev.length - 1 ? { ...msg, isTyping: false } : msg));
      setTimeout(() => setShowOptions(true), 300);
    }, question.text.length * 50);
  };

  const handleAnswer = (option: string) => {
    playKeySound();
    const question = QUESTIONS[currentQuestion];

    setMessages(prev => [...prev, { type: 'user', text: option }]);
    setShowOptions(false);
    setIsProcessing(true);

    const answer: QuizAnswer = {
      questionId: question.id,
      question: question.text,
      answer: option,
    };

    const quizData = storage.getQuizData();
    quizData.answers.push(answer);
    quizData[question.dataKey] = option;
    storage.saveQuizData(quizData);

    ga4Tracking.questionAnswered(question.id, question.text, option);

    const newProgress = ((currentQuestion + 1) / QUESTIONS.length) * 100;
    setProgress(newProgress);

    setTimeout(() => {
      setIsProcessing(false);

      let responseText = question.response;
      
      if (question.responseByGender && quizData.gender) {
        const gender = quizData.gender as 'MALE' | 'FEMALE';
        responseText = question.responseByGender[gender] || question.response;
      }

      const responseMessage: Message = {
        type: 'bot',
        text: responseText,
        isTyping: true,
      };

      setMessages(prev => [...prev, responseMessage]);

      typewriterTimeoutRef.current = setTimeout(() => {
        setMessages(prev => prev.map((msg, idx) => idx === prev.length - 1 ? { ...msg, isTyping: false } : msg));

        if (currentQuestion < QUESTIONS.length - 1) {
          setTimeout(() => {
            setCurrentQuestion(currentQuestion + 1);
            askQuestion(currentQuestion + 1);
          }, 800);
        } else {
          ga4Tracking.chatCompleted();
          
          setTimeout(() => {
            const finalMessage: Message = {
              type: 'bot',
              text: 'Analysis complete. Your personalized plan is ready to be revealed. Click below to access it.',
              isTyping: true,
            };
            setMessages(prev => [...prev, finalMessage]);

            typewriterTimeoutRef.current = setTimeout(() => {
              setMessages(prev => prev.map((msg, idx) => idx === prev.length - 1 ? { ...msg, isTyping: false } : msg));
              setTimeout(() => setShowOptions(true), 300);
            }, finalMessage.text.length * 50);
          }, 1000);
        }
      }, responseText.length * 50);
    }, 1500);
  };

  const handleViewPlan = () => {
    ga4Tracking.chatCTAClick();
    onNavigate('result');
  };

  const getQuestionOptions = (question: Question): string[] => {
    const quizData = storage.getQuizData();
    
    if (question.optionsByGender && quizData.gender) {
      const gender = quizData.gender as 'MALE' | 'FEMALE';
      return question.optionsByGender[gender] || question.options || [];
    }
    
    return question.options || [];
  };

  const isComplete = progress === 100;
  const quizData = storage.getQuizData();

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="progress-text">ANALYSIS: {Math.round(progress)}%</p>
        {isProcessing && <p className="processing-text">ANALYZING DATA...</p>}
      </div>

      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.type}`}>
            {msg.type === 'bot' && (
              <div className="avatar-small">SM</div>
            )}
            <div className="message-bubble">
              {msg.isTyping ? (
                <TypewriterText text={msg.text} />
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="processing-indicator">
            <div className="spinner"></div>
          </div>
        )}

        {showOptions && currentQuestion === -1 && (
          <div className="options-container">
            <button className="option-button" onClick={handleStartAnalysis}>
              START ANALYSIS
            </button>
          </div>
        )}

        {showOptions && currentQuestion >= 0 && currentQuestion < QUESTIONS.length && !isComplete && (
          <div className="options-container">
            {getQuestionOptions(QUESTIONS[currentQuestion]).map((option, idx) => (
              <button key={idx} className="option-button" onClick={() => handleAnswer(option)}>
                {option}
              </button>
            ))}
          </div>
        )}

        {showOptions && isComplete && (
          <div className="options-container">
            <div 
              className="completion-badge" 
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: '24px',
                background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(74, 222, 128, 0.1))',
                borderRadius: '16px',
                marginBottom: '16px',
                border: '2px solid rgba(234, 179, 8, 0.5)',
                boxShadow: '0 8px 24px rgba(234, 179, 8, 0.3)'
              }}
            >
              <div style={{
                fontSize: 'clamp(1.5rem, 5vw, 2rem)',
                fontWeight: '900',
                color: 'rgb(250, 204, 21)',
                textAlign: 'center',
                lineHeight: '1.3'
              }}>
                {getCompletionBadge(quizData.gender || 'MALE').title}
              </div>
              <div style={{
                fontSize: 'clamp(1rem, 4vw, 1.25rem)',
                color: 'white',
                lineHeight: '1.6',
                textAlign: 'center'
              }}>
                {getCompletionBadge(quizData.gender || 'MALE').subtitle}
              </div>
            </div>
            <button className="option-button cta-final" onClick={handleViewPlan}>
              SEE MY PERSONALIZED PLAN
            </button>
            <p className="completion-count">+9,247 plans revealed</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

function TypewriterText({ text }: { text: string }) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 50);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text]);

  return <span>{displayText}<span className="cursor">▋</span></span>;
}
