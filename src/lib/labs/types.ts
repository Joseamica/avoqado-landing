export type ProjectType =
  | 'web-app'
  | 'mobile-app'
  | 'dashboard'
  | 'automation'
  | 'ai-agent'
  | 'integration'
  | 'report'
  | 'other';

export type Urgency = 'hoy' | 'esta-semana' | 'este-mes' | 'sin-prisa';

export interface ContactInfo {
  name: string;
  email: string;
  whatsapp?: string;
}

export interface ExtractedFields {
  projectType?: ProjectType;
  projectTypeFreeText?: string;
  businessContext?: string;
  coreFunctionality?: string;
  integrations?: string[];
  designReference?: string;
  urgency?: Urgency;
  contact?: ContactInfo;
}

export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: number;
}

export interface ConversationState {
  sessionId: string;
  messages: ChatMessage[];
  fields: ExtractedFields;
  startedAt: number;
  lastActivityAt: number;
  submittedAt?: number;
}

export interface SubmitPayload {
  sessionId: string;
  fields: {
    projectType: ProjectType;
    projectTypeFreeText?: string;
    businessContext: string;
    coreFunctionality: string;
    integrations: string[];
    designReference: string;
    urgency: Urgency;
    contact: ContactInfo;
  };
  additionalNotes?: string;
  transcript: ChatMessage[];
}

export interface SubmitResponse {
  success: boolean;
  message: string;
}

export function missingFields(f: ExtractedFields): string[] {
  const missing: string[] = [];
  if (!f.projectType) missing.push('projectType');
  if (f.projectType === 'other' && !f.projectTypeFreeText) missing.push('projectTypeFreeText');
  if (!f.businessContext) missing.push('businessContext');
  if (!f.coreFunctionality) missing.push('coreFunctionality');
  if (!f.integrations) missing.push('integrations');
  if (!f.designReference) missing.push('designReference');
  if (!f.urgency) missing.push('urgency');
  if (!f.contact?.name || !f.contact?.email) missing.push('contact');
  return missing;
}

export function isComplete(f: ExtractedFields): boolean {
  return missingFields(f).length === 0;
}
