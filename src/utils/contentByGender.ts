import { QuizData } from '../types/quiz';

// 
// GENDER PERSONALIZATION FUNCTIONS
// 

export function getTitle(gender: string): string {
    return gender === 'HOMBRE' 
        ? 'Why She Left' 
        : 'Why He Left';
}

export function getLoadingMessage(gender: string): string {
    return gender === 'HOMBRE'
        ? 'Generating your specific protocol to win her back...'
        : 'Generating your specific protocol to win him back...';
}

/**
 * CHANGE #6: Ultra-Personalized Diagnosis
 * Transforms quiz data into an authority and empathy narrative.
 */
export function getCopy(quizData: QuizData): string {
    const pronoun = quizData.gender === 'HOMBRE' ? 'her' : 'him';
    const exPronoun = quizData.gender === 'HOMBRE' ? 'She' : 'He';
    
    const whoEnded = quizData.whoEnded || '';
    const timeSeparation = quizData.timeSeparation || '';
    const currentSituation = quizData.currentSituation || '';
    const reason = quizData.reason || '';

    // 
    // 1. INTRODUCTION LOGIC (WHO ENDED) - CORRECTED
    // 
    let intro = '';
    
    // Case 1: SHE/HE ENDED IT
    if (whoEnded.includes('ELLA TERMINÓ') || whoEnded.includes('ÉL TERMINÓ')) {
        intro = `Based on the fact that ${exPronoun} decided to end the relationship, we understand that there was wear and tear on the "value switches" that ${pronoun} perceived in you. `;
    } 
    // Case 2: I ENDED IT
    else if (whoEnded.includes('YO TERMINÉ')) {
        intro = `Considering that you were the one who ended it, the challenge now is to reverse the feeling of rejection that ${pronoun} processed, transforming it into a new opportunity. `;
    }
    // Case 3: MUTUAL DECISION
    else if (whoEnded.includes('DECISIÓN MUTUA')) {
        intro = `Considering that the decision was mutual, the challenge now is to identify if there is still genuine interest from both sides and rebuild attraction from scratch. `;
    }
    // Case 4: FALLBACK (unexpected value or empty)
    else {
        intro = `Considering the context of the breakup, the challenge now is to understand the emotional dynamics that led to this point and reverse them strategically. `;
    }

    // 
    // 2. URGENCY LOGIC (SEPARATION TIME) - IMPROVED
    // 
    let urgency = '';
    if (timeSeparation.includes('MENOS DE 1 SEMANA') || timeSeparation.includes('1-4 SEMANAS')) {
        urgency = `You're in the **IDEAL time window**. ${exPronoun}'s brain still has chemical traces of your presence, which facilitates reconnection if you act now. `;
    } else if (timeSeparation.includes('1-6 MESES')) {
        urgency = `Although time has passed (${timeSeparation}), neuroscience explains that emotional memories can be reactivated through the right stimuli. `;
    } else if (timeSeparation.includes('MÁS DE 6 MESES')) {
        urgency = `Although time has passed (${timeSeparation}), neuroscience explains that emotional memories can be reactivated through the right stimuli. `;
    }

    // 
    // 3. CONTACT LOGIC (CURRENT SITUATION) - IMPROVED
    // 
    let insight = '';
    if (currentSituation.includes('CONTACTO CERO') || currentSituation.includes('ME IGNORA') || currentSituation.includes('BLOQUEADO')) {
        insight = `The fact that there is no contact is, ironically, your biggest advantage. We're in the "cortisol peak cleanup" phase, preparing the ground for an impactful return. `;
    } else {
        insight = `Current contact indicates that the emotional thread hasn't been cut, but we must be careful not to saturate their dopamine system with desperation. `;
    }

    // 4. Reason for Breakup
    let reasonInsight = '';
    if (reason) {
        reasonInsight = `By analyzing that the main reason was "${reason}", the protocol will focus on neutralizing that specific objection in ${pronoun}'s subconscious. `;
    }

    return `It wasn't due to lack of love.

${intro}

${urgency}

${insight}

${reasonInsight}

The key is not to beg, but to understand ${pronoun}'s psychology and act strategically. In the next step, I'm going to reveal EXACTLY the scientific step-by-step process for ${pronoun} to feel that YES, you are the right person.`;
}

// ✅ INSTRUCTION #9: Quick summary + Instruction #6: Explanation of importance
export function getVentana72Copy(gender: string): string {
    const pronoun = gender === 'HOMBRE' ? 'her' : 'him';
    
    return `It doesn't matter if you separated 3 days ago or 3 months ago.

Here's the truth that behavioral psychologists discovered:

The human brain operates in 72-hour cycles.

Every time you take a STRATEGIC ACTION, ${pronoun}'s brain enters a new 72-hour cycle where everything can change.

—

Here's what's crucial:

In each of these 3 phases, there are CORRECT and INCORRECT actions.

✅ If you act correctly in each phase, ${pronoun} seeks you out.

❌ If you act incorrectly, their brain erases the attraction.

—

Your personalized plan reveals EXACTLY what to do in each phase.`;
}

// ✅ NEW: Quick summary of the 3 phases (Instruction #9)
export function getVentanaSummary(gender: string): string[] {
    return [
        '🎯 Phase 1: Activate curiosity and break expectations',
        '💡 Phase 2: Restore perceived value without pressure',
        '❤️ Phase 3: Create opportunity for emotional reconnection'
    ];
}

// ✅ NEW: Explanation of importance (Instruction #6)
export function getVentanaImportance(): string[] {
    return [
        '🔬 Backed by behavioral neuroscience',
        '⏰ Each 72h cycle rewrites emotional memories',
        '🎯 Acting correctly = renewed attraction',
        '⚠️ Acting incorrectly = definitive emotional closure'
    ];
}

export function getOfferTitle(gender: string): string {
    return gender === 'HOMBRE'
        ? 'Your Plan to Win Her Back'
        : 'Your Plan to Win Him Back';
}

export function getFeatures(gender: string): string[] {
    const pronoun = gender === 'HOMBRE' ? 'Her' : 'Him';
    const pronounLower = gender === 'HOMBRE' ? 'her' : 'him';
    const another = gender === 'HOMBRE' ? 'another' : 'another';
    
    return [
        `📱 MODULE 1: How to Talk to ${pronoun} (Days 1-7)`,
        `👥 MODULE 2: How to Meet ${pronoun} (Days 8-14)`,
        `❤️ MODULE 3: How to Win ${pronounLower} Back (Days 15-21)`,
        `🚨 MODULE 4: Emergency Protocol (If ${pronounLower} is with someone else)`,
        '⚡ Special Guide: The 3 Phases of 72 Hours',
        '🎯 Bonuses: Conversation Scripts + Action Plans',
        '✅ Guarantee: 30 days or your money back'
    ];
}

export function getCTA(gender: string): string {
    return gender === 'HOMBRE'
        ? 'YES, I WANT MY PLAN TO WIN HER BACK'
        : 'YES, I WANT MY PLAN TO WIN HIM BACK';
}

export function getCompletionBadge(gender: string): { title: string; subtitle: string } {
    const pronoun = gender === 'HOMBRE' ? 'her' : 'him';
    
    return {
        title: 'YOUR ANALYSIS IS READY!',
        subtitle: `Discover exactly why ${pronoun} left and the scientific step-by-step process for ${pronoun} to WANT to come back`
    };
}

// ✅ REFACTORED: Now returns structured object (Instructions #2, #3, #8)
export function getFaseText(gender: string, fase: number): { 
    title: string; 
    timeRange: string;
    summary: string; 
    bullets: string[];
    warning: string;
} {
    const pronoun = gender === 'HOMBRE' ? 'She' : 'He';
    const pronounLower = gender === 'HOMBRE' ? 'her' : 'him';
    const oppositeGender = gender === 'HOMBRE' ? 'him' : 'her';
    
    const fases: Record<number, { title: string; timeRange: string; summary: string; bullets: string[]; warning: string }> = {
        1: {
            title: 'Curiosity Activation',
            timeRange: '0-24 HOURS',
            summary: `${pronoun} receives the first signal that something has changed in you and their brain activates "curiosity mode"`,
            bullets: [
                `✨ ${pronoun} abandons the "post-breakup relief" mode`,
                '🧠 Their brain detects changes in your behavior',
                `💭 They start wondering: "What's happening with ${oppositeGender}?"`,
                '🔄 The neurological curiosity circuit is activated'
            ],
            warning: `⚠️ If you act incorrectly here, you confirm that ${pronounLower} made the right decision`
        },
        
        2: {
            title: 'Restoration of Perceived Value',
            timeRange: '24-48 HOURS',
            summary: `${pronoun} starts to reevaluate archived memories and oxytocin is reactivated`,
            bullets: [
                `🧬 Oxytocin (the bonding hormone) becomes active again`,
                `💫 The good moments that ${pronounLower} had "forgotten" return to their mind`,
                '🎭 Their brain reconstructs your image in a more positive way',
                '🔓 Emotional defenses start to weaken'
            ],
            warning: `⚠️ If you push too hard, ${pronounLower} closes the cycle and blocks you permanently`
        },
        
        3: {
            title: 'Strategic Reconnection',
            timeRange: '48-72 HOURS',
            summary: `${pronoun} feels the need to "close the emotional loop" and here you reappear with the Protocol`,
            bullets: [
                `🎯 ${pronoun} seeks a definitive emotional resolution`,
                '💝 Latent attachment seeks conscious expression',
                '🚪 This is where you reappear strategically',
                '⚡ Critical moment to apply the Reconnection Protocol'
            ],
            warning: '⚠️ 87% of people lose their ex in this phase by not knowing what to do'
        }
    };
    
    return fases[fase] || {
        title: '',
        timeRange: '',
        summary: '',
        bullets: [],
        warning: ''
    };
}