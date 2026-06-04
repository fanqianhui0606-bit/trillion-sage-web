"use client";

import { useReducer, useEffect, useCallback, useRef } from "react";
import type {
  QuizBank,
  QuizConfig,
  WheelData,
  QuizState,
  MajorMatchResult,
  UserScores,
} from "@/lib/types";
import { computeObjectiveScores } from "@/lib/quiz-scoring";
import { rankMajors } from "@/lib/cosine-similarity";
import { calculatePracticalShare } from "@/lib/value-orientation";
import { DIMENSION_ORDER } from "@/lib/constants";

type Action =
  | { type: "DATA_LOADED"; bank: QuizBank; config: QuizConfig; wheel: WheelData; edition: string }
  | { type: "LOAD_ERROR"; error: string }
  | { type: "START_QUIZ" }
  | { type: "NEXT_QUESTION" }
  | { type: "PREV_QUESTION" }
  | { type: "SET_ANSWER"; questionId: string; answer: string | string[] }
  | { type: "SUBMIT" }
  | { type: "RESULT_READY"; scores: UserScores; matches: MajorMatchResult[] }
  | { type: "RESTORE"; saved: Partial<QuizState> };

const STORAGE_KEY_BASE = "quiz_flow_page_state";

function detectEdition(): string {
  if (typeof window === "undefined") return "user";
  const e = new URLSearchParams(window.location.search).get("edition") || "";
  const lower = e.toLowerCase();
  if (lower === "simple" || lower === "简易" || lower === "体验" || lower === "免费") return "simple";
  if (lower === "inspect" || lower === "检验") return "inspect";
  return "user";
}

function storageKey(edition: string): string {
  return edition === "simple" ? `${STORAGE_KEY_BASE}_simple` : STORAGE_KEY_BASE;
}

function initState(edition: string): QuizState {
  return {
    phase: "loading",
    currentIndex: 0,
    answers: {},
    userScores: null,
    matches: null,
    error: null,
    bank: undefined,
    config: undefined,
    wheel: undefined,
    edition,
  };
}

function reducer(state: QuizState, action: Action): QuizState {
  switch (action.type) {
    case "DATA_LOADED":
      return {
        ...state,
        phase: "cover",
        error: null,
        bank: action.bank,
        config: action.config,
        wheel: action.wheel,
        edition: action.edition,
      };

    case "LOAD_ERROR":
      return { ...state, phase: "loading", error: action.error };

    case "START_QUIZ":
      return { ...state, phase: "answering", currentIndex: 0, answers: {} };

    case "NEXT_QUESTION": {
      const qs = state.bank?.questions.length ?? 0;
      if (state.currentIndex >= qs - 1) return state;
      return { ...state, currentIndex: state.currentIndex + 1 };
    }

    case "PREV_QUESTION":
      if (state.currentIndex <= 0) return state;
      return { ...state, currentIndex: state.currentIndex - 1 };

    case "SET_ANSWER":
      return {
        ...state,
        answers: { ...state.answers, [action.questionId]: action.answer },
      };

    case "SUBMIT":
      return { ...state, phase: "submitting" };

    case "RESULT_READY":
      return {
        ...state,
        phase: "result",
        userScores: action.scores,
        matches: action.matches,
      };

    case "RESTORE":
      return {
        ...state,
        ...action.saved,
        phase: (action.saved.phase as QuizState["phase"]) ?? state.phase,
      };

    default:
      return state;
  }
}

export function useQuizState(editionOverride?: string) {
  const editionRef = useRef<string>("user");
  // Safe init that works on both server and client
  const edition = editionOverride ?? (typeof window !== "undefined" ? detectEdition() : "user");
  editionRef.current = edition;

  const [state, dispatch] = useReducer(reducer, edition, initState);

  // Load all data on mount
  const loadData = useCallback(async () => {
    try {
      const ed = editionRef.current;
      const isSimp = ed === "simple";
      const bankUrl = isSimp ? "/data/quiz-bank-simple.json" : "/data/quiz-bank.json";
      const configUrl = isSimp ? "/data/quiz-config-simple.json" : "/data/quiz-config.json";

      const [bank, config, wheel] = await Promise.all([
        fetch(bankUrl).then((r) => r.json()),
        fetch(configUrl).then((r) => r.json()),
        fetch("/data/wheel-data.json").then((r) => r.json()),
      ]);
      dispatch({ type: "DATA_LOADED", bank, config, wheel, edition: ed });
    } catch (e) {
      dispatch({
        type: "LOAD_ERROR",
        error: e instanceof Error ? e.message : "数据加载失败",
      });
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // SessionStorage persistence
  useEffect(() => {
    const save = {
      phase: state.phase,
      currentIndex: state.currentIndex,
      answers: state.answers,
      edition: state.edition,
    };
    try {
      sessionStorage.setItem(storageKey(state.edition ?? "user"), JSON.stringify(save));
    } catch {
      // ignore quota errors
    }
  }, [state.phase, state.currentIndex, state.answers, state.edition]);

  // Restore from sessionStorage on mount
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(storageKey(edition));
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.phase === "answering" && saved.answers) {
          dispatch({ type: "RESTORE", saved });
        }
      }
    } catch {
      // ignore
    }
  }, [edition]);

  // Compute results on submit
  useEffect(() => {
    if (state.phase !== "submitting" || !state.bank || !state.config || !state.wheel) return;

    const isSimp = (state.edition ?? "user") === "simple";

    // Use setTimeout to unblock the UI
    const timer = setTimeout(() => {
      const dimOrder = isSimp
        ? state.bank!.meta.objectiveDimensionOrder
        : DIMENSION_ORDER;

      const objectiveScores = computeObjectiveScores(
        state.bank!.questions,
        state.answers,
        state.config!,
        dimOrder
      );

      // Subjective scoring — skip for simple edition
      let interestAmbition = 0;
      let practicalBenefit = 0;
      let practicalShare = 0;
      let valueTier = 3;

      if (!isSimp) {
        const subjMeta = state.bank!.meta.subjectiveDimensions;
        for (const sd of subjMeta) {
          const answer = state.answers[sd.id];
          const val = typeof answer === "string" ? parseInt(answer, 10) : 0;
          if (sd.axis === "ideal") interestAmbition += val || 0;
          else practicalBenefit += val || 0;
        }

        practicalShare = calculatePracticalShare(interestAmbition, practicalBenefit);
        valueTier = Math.min(5, Math.max(1, Math.floor(practicalShare * 5) + 1));
      }

      const scores: UserScores = {
        objective: objectiveScores,
        subjective: {
          interestAmbition,
          practicalBenefit,
          practicalShare,
          valueTier,
        },
      };

      const matches = rankMajors(
        objectiveScores,
        state.wheel!.level2,
        state.config!.dimensionWeights,
        dimOrder
      );

      // Save to localStorage
      try {
        localStorage.setItem("quiz_flow_last_snapshot", JSON.stringify({ scores, matches }));
        localStorage.setItem("quiz_flow_match_scores", JSON.stringify(objectiveScores));
      } catch {
        // ignore
      }

      dispatch({ type: "RESULT_READY", scores, matches });
    }, 50);

    return () => clearTimeout(timer);
  }, [state.phase, state.bank, state.config, state.wheel, state.answers, state.edition]);

  // Validation: find unanswered questions
  const getUnansweredIds = useCallback((): string[] => {
    if (!state.bank) return [];
    const activeIds = state.config?.activeQuestionIds ?? state.bank.questions.map((q) => q.id);
    return state.bank.questions
      .filter((q) => activeIds.includes(q.id) && !state.answers[q.id])
      .map((q) => q.id);
  }, [state.bank, state.config, state.answers]);

  return {
    state,
    dispatch,
    getUnansweredIds,
  };
}
