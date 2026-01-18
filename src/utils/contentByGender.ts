import { QuizData } from '../types/quiz';

// 
// GENDER-BASED PERSONALIZATION FUNCTIONS - ENGLISH VERSION
// 

export function getTitle(gender: string): string {
    return gender === 'MALE' 
        ? 'Why She Left' 
        : 'Why He Left';
}

export function getLoadingMessage(gender: string): string {
    return gender === 'MALE'
        ? 'Generating your specific protocol to win her back...'
        : 'Generating your specific protocol to win him back...';
}

/**
 * Ultra-Personalized Diagnosis
 * Transforms quiz data into a narrative of authority and empathy.
 */
export function getCopy(quizData: QuizData): string {
    const pronoun = quizData.gender === 'MALE' ? 'her' : 'him';
    const exPronoun = quizData.gender === 'MALE' ? 'She' : 'He';
    const possessive = quizData.gender === 'MALE' ? 'her' : 'his';
    
    const whoEnded = quizData.whoEnded || '';
    const timeSeparation = quizData.timeSeparation || '';
    const currentSituation = quizData.currentSituation || '';
    const reason = quizData.reason || '';

    // 
    // 1. INTRO LOGIC (WHO ENDED IT)
    // 
    let intro = '';
    
    if (whoEnded.includes('SHE ENDED IT') || whoEnded.includes('HE ENDED IT')) {
        intro = `Based on the fact that ${exPronoun} decided to end the relationship, we understand there was a deterioration in the "value switches" that ${pronoun} perceived in you. `;
    } 
    else if (whoEnded.includes('I ENDED IT')) {
        intro = `Considering that you were the one who ended it, the challenge now is to reverse the feeling of rejection that ${pronoun} processed, transforming it into a new opportunity. `;
    }
    else if (whoEnded.includes('MUTUAL DECISION')) {
        intro = `Considering that the decision was mutual, the challenge now is to identify if there's still genuine interest from both sides and rebuild the attraction from scratch. `;
    }
    else {
        intro = `Considering the context of the breakup, the challenge now is to understand the emotional dynamics that led to this point and reverse them strategically. `;
    }

    // 
    // 2. URGENCY LOGIC (TIME SINCE SEPARATION)
    // 
    let urgency = '';
    if (timeSeparation.includes('LESS THAN 1 WEEK') || timeSeparation.includes('1-4 WEEKS')) {
        urgency = `You're in the **IDEAL time window**. ${exPronoun}'s brain still has chemical traces of your presence, which makes reconnection easier if you act now. `;
    } else if (timeSeparation.includes('1-6 MONTHS')) {
        urgency = `Although time has passed (${timeSeparation}), neuroscience explains that emotional memories can be reactivated through the right stimuli. `;
    } else if (timeSeparation.includes('MORE THAN 6 MONTHS')) {
        urgency = `Although time has passed (${timeSeparation}), neuroscience explains that emotional memories can be reactivated through the right stimuli. `;
    }

    // 
    // 3. CONTACT LOGIC (CURRENT SITUATION)
    // 
    let insight = '';
    if (currentSituation.includes('NO CONTACT') || currentSituation.includes('IGNORING ME') || currentSituation.includes('BLOCKED')) {
        insight = `The fact that there's no contact is, ironically, your biggest advantage. We're in the "cortisol spike cleanup" phase, preparing the ground for an impactful return. `;
    } else {
        insight = `The current contact indicates that the emotional thread hasn't been cut, but we need to be careful not to saturate ${possessive} dopamine system with desperation. `;
    }

    // 4. Breakup Reason
    let reasonInsight = '';
    if (reason) {
        reasonInsight = `Analyzing that the main reason was "${reason}", the protocol will focus on neutralizing that specific objection in ${possessive} subconscious. `;
    }

    return `It wasn't because of lack of love.

${intro}

${urgency}

${insight}

${reasonInsight}

The key is not to beg, but to understand ${possessive} psychology and act strategically. In the next step, I'm going to reveal EXACTLY the scientific step-by-step so that ${pronoun} feels that you ARE the right person.`;
}

export function getVentana72Copy(gender: string): string {
    const pronoun = gender === 'MALE' ? 'her' : 'him';
    const possessive = gender === 'MALE' ? 'her' : 'his';
    
    return `It doesn't matter if you separated 3 days ago or 3 months ago.

Here's the truth that behavioral psychologists discovered:

The human brain operates in 72-hour cycles.

Every time you take a STRATEGIC ACTION, ${possessive} brain enters a new 72-hour cycle where everything can change.

—

Here's what's crucial:

In each of these 3 phases, there are CORRECT and INCORRECT actions.

✅ If you act correctly in each phase, ${pronoun} seeks you out.

❌ If you act incorrectly, ${possessive} brain erases the attraction.

—

Your personalized plan reveals EXACTLY what to do in each phase.`;
}

export function getOfferTitle(gender: string): string {
    return gender === 'MALE'
        ? 'Your Plan to Win Her Back'
        : 'Your Plan to Win Him Back';
}

export function getFeatures(gender: string): string[] {
    const pronoun = gender === 'MALE' ? 'Her' : 'Him';
    const pronounLower = gender === 'MALE' ? 'her' : 'him';
    const another = gender === 'MALE' ? 'someone else' : 'someone else';
    
    return [
        `📱 MODULE 1: How to Talk to ${pronoun} (Days 1-7)`,
        `👥 MODULE 2: How to Meet ${pronoun} (Days 8-14)`,
        `❤️ MODULE 3: How to Win ${pronounLower} Back (Days 15-21)`,
        `🚨 MODULE 4: Emergency Protocol (If ${pronounLower} is with ${another})`,
        '⚡ Special Guide: The 3 Phases of 72 Hours',
        '🎯 Bonuses: Conversation Scripts + Action Plans',
        '✅ Guarantee: 30 days or your money back'
    ];
}

export function getCTA(gender: string): string {
    return gender === 'MALE'
        ? 'YES, I WANT MY PLAN TO WIN HER BACK'
        : 'YES, I WANT MY PLAN TO WIN HIM BACK';
}

export function getCompletionBadge(gender: string): { title: string; subtitle: string } {
    const pronoun = gender === 'MALE' ? 'she' : 'he';
    const possessive = gender === 'MALE' ? 'her' : 'him';
    
    return {
        title: 'YOUR ANALYSIS IS READY!',
        subtitle: `Discover exactly why ${pronoun} left and the scientific step-by-step so that ${pronoun} WANTS to come back`
    };
}

export function getFaseText(gender: string, fase: number): string {
    const pronoun = gender === 'MALE' ? 'She' : 'He';
    const pronounLower = gender === 'MALE' ? 'she' : 'he';
    const possessive = gender === 'MALE' ? 'her' : 'him';
    const oppositeGender = gender === 'MALE' ? 'him' : 'her';
    
    const fases: Record<number, string> = {
        1: `${pronoun} receives the first signal that something has changed in you.

${pronoun}'s brain abandons "relief mode" and activates "curiosity mode".

${pronoun} starts to wonder: "What's happening with ${oppositeGender}?"

⚠️ DANGER: If you act incorrectly here, you confirm that ${pronounLower} made the right decision.`,
        
        2: `${pronoun} starts to re-evaluate the memories ${pronounLower} had "archived".

Oxytocin (the attachment hormone) is reactivated.

The good moments that ${pronounLower} had "forgotten" come back to ${possessive} mind.

⚠️ DANGER: If you push too hard, ${pronounLower} closes the cycle and blocks you permanently.`,
        
        3: `${pronoun} feels the need to "close the cycle" definitively.

${pronoun}'s brain seeks emotional resolution.

This is where you reappear strategically with the Reconnection Protocol.

⚠️ DANGER: 87% of people lose their ex in this phase for not knowing what to do.`
    };
    
    return fases[fase] || '';
}
