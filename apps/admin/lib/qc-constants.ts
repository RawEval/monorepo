// ─── Fraud Signal Metadata ────────────────────────────────────────────────────
// Maps the 7 heuristic fraud signal types from the QC pipeline to human-readable
// names, descriptions, and risk context for admin UI display.

export const FRAUD_SIGNAL_META: Record<
  string,
  { label: string; description: string; riskNote: string }
> = {
  ambiguity_signal: {
    label: 'Ambiguity',
    description:
      'Detects prompts that are unanswerable or intentionally ambiguous, making any response arguably "wrong."',
    riskNote: 'High scores suggest the user may be exploiting vague prompts to game failure marking.',
  },
  adversarial_patterns: {
    label: 'Adversarial Patterns',
    description:
      'Scans for jailbreak attempts, prompt injection, or bypass patterns designed to force model errors.',
    riskNote: 'Indicates the user may be deliberately causing failures through adversarial prompts.',
  },
  temporal_gap: {
    label: 'Temporal Gap',
    description:
      'Flags conversations marked as failed long after the original interaction, suggesting retroactive manipulation.',
    riskNote: 'Large gaps between conversation time and failure marking are suspicious.',
  },
  rate_anomaly: {
    label: 'Rate Anomaly',
    description:
      'Detects unusually high failure-marking rates within a 30-minute or 24-hour window for a single user.',
    riskNote: 'Burst marking patterns often indicate automated or coordinated abuse.',
  },
  constraint_coherence: {
    label: 'Constraint Coherence',
    description:
      'Identifies prompts with excessive or contradictory constraints that make correct answers nearly impossible.',
    riskNote: 'Overloaded constraints are a common tactic to manufacture failures.',
  },
  preference_masquerade: {
    label: 'Preference Masquerade',
    description:
      'Detects subjective preferences disguised as objective failures (e.g., "I don\'t like the tone" marked as incorrect).',
    riskNote: 'Style or preference disagreements should not be marked as factual failures.',
  },
  repeat_marking: {
    label: 'Repeat Marking',
    description:
      'Tracks duplicate failure marks on the same or very similar prompts. 20+ marks in 48 hours triggers automatic FraudBlock.',
    riskNote: 'Automatic FraudBlock: wallet frozen for 48h, conversation status set to "rejected" (terminal).',
  },
};

// ─── QC Config Field Metadata ────────────────────────────────────────────────
// Explains what each QC configuration threshold controls for admin operators.

export const QC_CONFIG_META: Record<string, { label: string; description: string }> = {
  min_cohen_kappa: {
    label: "Cohen's Kappa",
    description:
      'Minimum pairwise inter-rater agreement between any two annotators. Below this threshold, annotations are flagged for disagreement review.',
  },
  min_fleiss_kappa: {
    label: "Fleiss' Kappa",
    description:
      'Multi-rater agreement across all annotators simultaneously. Measures whether annotators agree beyond random chance.',
  },
  min_krippendorff: {
    label: "Krippendorff's Alpha",
    description:
      'Reliability coefficient that handles missing data and multiple coders. More robust than Kappa for incomplete annotation sets.',
  },
  min_percentage_agreement: {
    label: '% Agreement',
    description:
      'Simple percentage of annotators who agree on the verdict. Easy to interpret but does not account for chance agreement.',
  },
  consistency_threshold: {
    label: 'Consistency',
    description:
      'Threshold for internal consistency of an annotator across similar items. Low values may indicate careless annotation.',
  },
  entropy_low_threshold: {
    label: 'Entropy Low',
    description:
      'Semantic entropy below this value means high model agreement (the model gives similar answers across re-generations). Low entropy = likely reliable answer.',
  },
  threshold_excellent: {
    label: 'Excellent',
    description: 'Quality band: scores at or above this threshold are rated "Excellent" — highest confidence in the QC verdict.',
  },
  threshold_good: {
    label: 'Good',
    description: 'Quality band: scores at or above this threshold are rated "Good" — strong confidence in the QC verdict.',
  },
  threshold_acceptable: {
    label: 'Acceptable',
    description: 'Quality band: scores at or above this threshold are rated "Acceptable" — moderate confidence, may need review.',
  },
  threshold_poor: {
    label: 'Poor',
    description: 'Quality band: scores below the "Acceptable" threshold fall here — low confidence, human review recommended.',
  },
  expected_annotator_count: {
    label: 'Expected Annotators',
    description: 'Total number of annotators (across all tiers) expected for each conversation before QC can finalize.',
  },
  auto_flag_enabled: {
    label: 'Auto Flag',
    description: 'When enabled, conversations that breach thresholds are automatically flagged for review without manual intervention.',
  },
  collusion_min_repeat_batches: {
    label: 'Collusion Min Batches',
    description: 'Minimum number of repeat batches needed to trigger a collusion flag between annotators.',
  },
  outlier_disagreement_threshold: {
    label: 'Outlier Disagreement',
    description: 'If an annotator disagrees beyond this threshold compared to peers, they are flagged as an outlier.',
  },
  tier_dominance_divergence_threshold: {
    label: 'Tier Dominance Divergence',
    description: 'Maximum allowed divergence between tier-level consensus scores before triggering cross-tier review.',
  },
  consecutive_low_agreement_probation: {
    label: 'Low Agreement Probation',
    description: 'Number of consecutive low-agreement batches before an annotator is placed on probation.',
  },
};

// ─── Verdict Theming ─────────────────────────────────────────────────────────

export function getVerdictTheme(verdict?: string | null): string {
  switch (verdict) {
    case 'FailedPrompt':
      return 'bg-red-500/10 text-red-600 border-red-500/30';
    case 'FalsePositive':
      return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30';
    case 'NeedsHumanReview':
      return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30';
    case 'FraudBlock':
      return 'bg-purple-500/10 text-purple-600 border-purple-500/30';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
}

export function getVerdictLabel(verdict?: string | null): string {
  switch (verdict) {
    case 'FailedPrompt':
      return 'Confirmed Failure';
    case 'FalsePositive':
      return 'False Positive';
    case 'NeedsHumanReview':
      return 'Needs Human Review';
    case 'FraudBlock':
      return 'Fraud Blocked';
    default:
      return verdict ?? 'Pending';
  }
}

// ─── Attribution Field Labels ────────────────────────────────────────────────

export const ATTRIBUTION_FIELDS: Record<string, { label: string; description: string }> = {
  ambiguous_prompt: {
    label: 'Ambiguous Prompt',
    description: 'The prompt was unclear or open to multiple interpretations, leading to a response that missed the user\'s intent.',
  },
  underspecified_input: {
    label: 'Underspecified Input',
    description: 'Critical context or constraints were missing from the prompt, making a fully correct answer impossible.',
  },
  model_hallucination: {
    label: 'Model Hallucination',
    description: 'The model fabricated facts, references, or data that do not exist — a core model reliability failure.',
  },
  model_reasoning_error: {
    label: 'Reasoning Error',
    description: 'The model\'s logical chain broke down — incorrect deductions, math errors, or flawed step-by-step reasoning.',
  },
  missing_external_knowledge: {
    label: 'Missing Knowledge',
    description: 'The correct answer required information beyond the model\'s training data or current context window.',
  },
  adversarial_prompt: {
    label: 'Adversarial Prompt',
    description: 'The prompt was designed to trick or exploit the model, potentially a fraud indicator.',
  },
};

// ─── Pipeline Status Labels ──────────────────────────────────────────────────

export const PIPELINE_STATUS_META: Record<string, { label: string; description: string }> = {
  marked_as_failed: {
    label: 'Marked as Failed',
    description: 'User or system flagged this conversation as containing a failure.',
  },
  analysis_pending: {
    label: 'Analysis Pending',
    description: 'Queued for the 14-stage QC pipeline. Waiting for compute resources.',
  },
  analysis_in_progress: {
    label: 'Analysis In Progress',
    description: 'The QC pipeline is actively running: PII scan, entropy, judges, fraud detection, etc.',
  },
  analysis_complete: {
    label: 'Analysis Complete',
    description: 'All 14 pipeline stages have completed. Verdict is ready.',
  },
  rubric_generated: {
    label: 'Rubric Generated',
    description: 'FActScore-style rubric has been created with atomic claims for annotator evaluation.',
  },
  pre_annotation_review_pending: {
    label: 'Pre-Annotation Review',
    description: 'Rubric is awaiting pre-annotation review before being sent to annotators.',
  },
  batch_pending: {
    label: 'Batch Pending',
    description: 'Waiting to be assigned to an annotation batch.',
  },
  in_annotation: {
    label: 'In Annotation',
    description: 'Annotators across all tiers are actively evaluating this conversation.',
  },
  annotation_complete: {
    label: 'Annotation Complete',
    description: 'All annotator submissions received. IAA metrics computed.',
  },
  needs_human_review: {
    label: 'Needs Human Review',
    description: 'Judges disagreed, signals conflicted, or confidence was below threshold — requires manual review.',
  },
  false_positive: {
    label: 'False Positive (Terminal)',
    description: 'Pipeline determined the original failure marking was incorrect. No payout.',
  },
  rejected: {
    label: 'Rejected / Fraud (Terminal)',
    description: 'FraudBlock triggered. User wallet frozen for 48h. This is a terminal state.',
  },
  completed: {
    label: 'Completed',
    description: 'Full QC cycle finished — verdict finalized, payout decision made.',
  },
};
