// ============================================================
// Quiz data types
// ============================================================

export interface QuizOption {
  id: string;
  text: string;
  scores: Record<string, number>;
}

export interface Question {
  id: string;
  section: "objective" | "subjective";
  objectiveTrack?: "habits" | "ability";
  type: "single" | "multi" | "boolean";
  stem: string;
  options: QuizOption[];
  maxScores: Record<string, number>;
}

export interface CatalogReference {
  label: string;
  links: { text: string; url: string }[];
}

export interface QuizMeta {
  title?: string;
  edition?: string;
  objectiveQuestionCount: number;
  objectiveHabitsCount: number;
  objectiveAbilityCount: number;
  subjectiveQuestionCount: number;
  objectiveDimensionOrder: string[];
  fullDimensionOrder?: string[];
  lockedDimensions?: string[];
  subjectiveDimensions: SubjectiveDimension[];
  catalogReference?: CatalogReference;
  notes?: string[];
}

export interface SubjectiveDimension {
  id: string;
  label: string;
  axis: "ideal" | "practical";
}

export interface QuizBank {
  version: string;
  meta: QuizMeta;
  questions: Question[];
}

export interface ScoringCalibration {
  objectiveWeight: number;
  subjectiveWeight: number;
  objectiveHabitsWeight: number;
  objectiveAbilityWeight: number;
  objectiveDimensionCap: number;
}

export interface QuizConfig {
  version: string;
  description?: string;
  activeQuestionIds: string[] | null;
  shuffleWithinSection: boolean;
  shuffleOptions: boolean;
  quizBlend?: {
    objectiveWeight: number;
    subjectiveWeight: number;
  };
  valueOrientationTiers?: string;
  scoringCalibration: ScoringCalibration;
  dimensionWeights: Record<string, number>;
}

// ============================================================
// 14-dimension competency types
// ============================================================

export type CompetencyVector = Record<string, number>;

export interface UserScores {
  objective: CompetencyVector;
  subjective: {
    interestAmbition: number;
    practicalBenefit: number;
    practicalShare: number;
    valueTier: number;
  };
  subjectInterest?: Record<string, number>;
}

// ============================================================
// Major profile types (wheel-data.json)
// ============================================================

export interface Level3Major {
  code: string;
  name: string;
}

export interface Level2Major {
  id: string;
  name: string;
  parents: string[];
  officialIntro: string;
  profile: CompetencyVector;
  profileAuto: CompetencyVector;
  level3: Level3Major[];
}

export interface Level1Major {
  id: string;
  name: string;
  profile: CompetencyVector;
}

export interface WheelData {
  dimensions: string[];
  level1: Level1Major[];
  level2: Level2Major[];
}

// ============================================================
// Major intro types (majors-intro.json)
// ============================================================

export interface MajorIntro {
  code: string;
  name: string;
  intro: string;
  tags?: string[];
  careers?: string[];
}

// ============================================================
// 3D graph types (graph.json)
// ============================================================

export interface GraphNode {
  id: string;
  title: string;
  level: 1 | 2 | 3 | 4;
  intensity: number;
  position: [number, number, number];
  definition: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  relation: "hierarchical" | "peer";
  strength: "h" | "m" | "l";
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// ============================================================
// Value orientation types
// ============================================================

export interface ValueOrientationTier {
  tier: number;
  label: string;
  description: string;
  minShare: number;
  maxShare: number;
}

export interface ValueOrientationTiersData {
  tiers: ValueOrientationTier[];
}

// ============================================================
// Match / recommendation result
// ============================================================

export interface MajorMatchResult {
  majorId: string;
  majorName: string;
  score: number;
  officialIntro: string;
  parents: string[];
  valueSim?: number;
  interestSim?: number;
  habitsSim?: number;
  abilitySim?: number;
  objectiveSimLegacy?: number;
}

// ============================================================
// Quiz state machine
// ============================================================

export type QuizPhase = "loading" | "cover" | "answering" | "interest" | "submitting" | "result";

export interface QuizState {
  phase: QuizPhase;
  currentIndex: number;
  answers: Record<string, string | string[]>;
  subjectInterest?: Record<string, number>;
  userName?: string;
  activationCode?: string;
  userScores: UserScores | null;
  matches: MajorMatchResult[] | null;
  error: string | null;
  bank?: QuizBank;
  config?: QuizConfig;
  wheel?: WheelData;
  edition?: string;
}
