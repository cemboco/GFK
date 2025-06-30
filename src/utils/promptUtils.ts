/*
  # Prompt Utilities für GFKCoach
  
  Hilfsfunktionen zum Arbeiten mit den KI-Prompts
*/

import { GFKPromptConfig, getPrompt, ALL_PROMPTS } from '../config/prompts';

export interface PromptVariables {
  [key: string]: string | number | boolean;
}

/**
 * Formatiert einen Prompt mit den gegebenen Variablen
 */
export const formatPrompt = (
  promptConfig: GFKPromptConfig,
  variables: PromptVariables
): { systemPrompt: string; userPrompt: string } => {
  let userPrompt = promptConfig.userPromptTemplate;
  
  // Ersetze alle Platzhalter in der Vorlage
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{${key}}`;
    userPrompt = userPrompt.replace(new RegExp(placeholder, 'g'), String(value));
  });
  
  return {
    systemPrompt: promptConfig.systemPrompt,
    userPrompt
  };
};

/**
 * Erstellt einen vollständigen Prompt für die KI
 */
export const createFullPrompt = (
  promptType: keyof typeof ALL_PROMPTS,
  variables: PromptVariables
): string => {
  const promptConfig = getPrompt(promptType);
  const { systemPrompt, userPrompt } = formatPrompt(promptConfig, variables);
  
  return `${systemPrompt}

${userPrompt}`;
};

/**
 * Erstellt einen Prompt für die GFK-Transformation
 */
export const createTransformPrompt = (
  inputText: string,
  perspective: string = 'Sender',
  context: string = ''
): string => {
  return createFullPrompt('transform', {
    input_text: inputText,
    perspective,
    context
  });
};

/**
 * Erstellt einen Prompt für den 4-Schritte-Assistenten
 */
export const createStepsPrompt = (
  currentStep: number,
  previousSteps: string,
  userResponse: string,
  stepFocus: string
): string => {
  return createFullPrompt('steps', {
    current_step: currentStep,
    previous_steps: previousSteps,
    user_response: userResponse,
    step_focus: stepFocus
  });
};

/**
 * Erstellt einen Prompt für den Bedürfnis-Explorer
 */
export const createNeedsPrompt = (
  situation: string,
  feeling: string
): string => {
  return createFullPrompt('needs', {
    situation,
    feeling
  });
};

/**
 * Erstellt einen Prompt für den Konflikt-Mediator
 */
export const createConflictPrompt = (
  personAStatement: string,
  personBStatement: string,
  context: string = ''
): string => {
  return createFullPrompt('conflict', {
    person_a_statement: personAStatement,
    person_b_statement: personBStatement,
    context
  });
};

/**
 * Erstellt einen Prompt für Feedback
 */
export const createFeedbackPrompt = (
  originalStatement: string,
  gfkVersion: string
): string => {
  return createFullPrompt('feedback', {
    original_statement: originalStatement,
    gfk_version: gfkVersion
  });
};

/**
 * Validiert, ob alle erforderlichen Variablen vorhanden sind
 */
export const validatePromptVariables = (
  promptConfig: GFKPromptConfig,
  variables: PromptVariables
): { isValid: boolean; missingVariables: string[] } => {
  const requiredVariables: string[] = [];
  const regex = /\{([^}]+)\}/g;
  let match;
  
  while ((match = regex.exec(promptConfig.userPromptTemplate)) !== null) {
    requiredVariables.push(match[1]);
  }
  
  const missingVariables = requiredVariables.filter(
    variable => !(variable in variables)
  );
  
  return {
    isValid: missingVariables.length === 0,
    missingVariables
  };
};

/**
 * Erstellt einen benutzerdefinierten Prompt mit Validierung
 */
export const createCustomPromptWithValidation = (
  systemPrompt: string,
  userTemplate: string,
  variables: PromptVariables,
  examples: string[] = [],
  outputFormat: string = ""
): { prompt: string; isValid: boolean; missingVariables: string[] } => {
  const promptConfig = {
    systemPrompt,
    userPromptTemplate: userTemplate,
    contextExamples: examples,
    outputFormat
  };
  
  const validation = validatePromptVariables(promptConfig, variables);
  const formattedPrompt = formatPrompt(promptConfig, variables);
  
  return {
    prompt: `${formattedPrompt.systemPrompt}

${formattedPrompt.userPrompt}`,
    isValid: validation.isValid,
    missingVariables: validation.missingVariables
  };
}; 