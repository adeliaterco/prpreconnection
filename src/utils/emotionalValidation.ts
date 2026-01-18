import { QuizData } from '../types/quiz';

// ========================================
// EMOTIONAL VALIDATION BASED ON RESPONSES
// ========================================

export function getEmotionalValidation(quizData: QuizData): string {
  let validation = '';
  const pronoun = quizData.gender === 'MALE' ? 'her' : 'him';
  const possessive = quizData.gender === 'MALE' ? 'she' : 'he';
  
  // Validation by separation time
  if (quizData.timeSeparation === 'LESS THAN 1 WEEK') {
    validation = `Your separation is recent. That means there's still a window of opportunity where ${possessive} thinks about you constantly. `;
  } else if (quizData.timeSeparation === 'MORE THAN 6 MONTHS') {
    validation = `Time has passed, but that doesn't mean it's impossible. There are psychological patterns that work even after months. `;
  } else {
    validation = `The time that has passed is crucial. You're in a phase where ${possessive} still has fresh memories, but the patterns are changing. `;
  }
  
  // Validation by who ended it
  if (quizData.whoEnded === 'SHE ENDED IT' || quizData.whoEnded === 'HE ENDED IT') {
    validation += `And the fact that ${possessive} ended it is actually an advantage, because it means ${possessive} had to make a difficult decision and that leaves an emotional imprint.`;
  } else if (quizData.whoEnded === 'I ENDED IT') {
    validation += `And the fact that you ended it completely changes the dynamic. ${possessive.charAt(0).toUpperCase() + possessive.slice(1)} might be waiting for you to make the first move.`;
  }
  
  return validation;
}

export function getSituationInsight(quizData: QuizData): string {
  const pronoun = quizData.gender === 'MALE' ? 'her' : 'him';
  const possessive = quizData.gender === 'MALE' ? 'she' : 'he';
  
  const insights: Record<string, string> = {
    'NO CONTACT': `No contact can be strategic, but it can also be creating distance. You need to know WHEN to break it.`,
    'IGNORING ME': `If ${possessive} ignores you, there's a specific psychological reason. It's not personal, it's a defense mechanism we can reverse.`,
    'BLOCKED': `Being blocked seems definitive, but it's an extreme emotional reaction that indicates there are still strong feelings.`,
    'ONLY NECESSARY TOPICS': `Minimal communication is a sign that ${possessive} is building emotional barriers, but still keeps a channel open.`,
    'WE TALK SOMETIMES': `Occasional communication is a golden opportunity. You're in the perfect phase to apply the protocol.`,
    'WE ARE FRIENDS': `"Friendship" after a breakup is an emotional minefield. It can be your biggest advantage or your worst enemy.`,
    'INTIMATE ENCOUNTERS': `Intimate encounters indicate that physical attraction is still alive, but the deep emotional connection is missing.`
  };
  
  return insights[quizData.currentSituation || ''] || '';
}
