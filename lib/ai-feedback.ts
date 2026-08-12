export type AiWritingFeedback = {
  priorityIssues: string[];
  overall: string;
  titleFeedback: string;
  lengthFeedback: string;
  fidelityFeedback: string;
  viewpointFeedback: string;
  retained: string[];
  omissions: string[];
  inaccuracies: string[];
  additions: string[];
  expression: string[];
  revisions: string[];
  improvedExample: string;
};

export const aiFeedbackSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    priorityIssues: { type: "array", items: { type: "string" } },
    overall: { type: "string" },
    titleFeedback: { type: "string" },
    lengthFeedback: { type: "string" },
    fidelityFeedback: { type: "string" },
    viewpointFeedback: { type: "string" },
    retained: { type: "array", items: { type: "string" } },
    omissions: { type: "array", items: { type: "string" } },
    inaccuracies: { type: "array", items: { type: "string" } },
    additions: { type: "array", items: { type: "string" } },
    expression: { type: "array", items: { type: "string" } },
    revisions: { type: "array", items: { type: "string" } },
    improvedExample: { type: "string" },
  },
  required: [
    "priorityIssues",
    "overall",
    "titleFeedback",
    "lengthFeedback",
    "fidelityFeedback",
    "viewpointFeedback",
    "retained",
    "omissions",
    "inaccuracies",
    "additions",
    "expression",
    "revisions",
    "improvedExample",
  ],
} as const;
