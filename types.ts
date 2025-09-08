export interface SkillRecommendation {
  skill: string;
  recommendation: string;
}

export interface CareerStream {
  stream: string;
  reason: string;
}

export interface CVStructureExample {
  tip: string;
  before: string;
  after:string;
}

export interface AnalysisResult {
  id: string;
  date: string;
  name: string;
  jobTitle: string;
  cvFeedback: string[];
  skillRecommendations: SkillRecommendation[];
  careerStreams: CareerStream[];
  jobDescription: string;
  cvStructureTip: CVStructureExample;
}

export enum AppState {
    READY,
    ANALYZING,
    ANALYSIS_COMPLETE,
}

export interface VoiceFeedbackData {
    pace: string;
    clarity: string;
    confidence: string;
}

export interface ChatMessage {
    sender: 'user' | 'bot';
    text: string;
    voiceFeedback?: VoiceFeedbackData;
}

export interface WebSource {
    uri: string;
    title: string;
}

export interface GroundingChunk {
    web: WebSource;
}

export interface JournalEntry {
    id: string;
    date: string;
    content: string;
}

export type Mood = 'ecstatic' | 'happy' | 'neutral' | 'sad' | 'anxious';

export interface MoodLog {
    id: string;
    date: string;
    mood: Mood;
}
