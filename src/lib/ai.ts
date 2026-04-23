import { Commit, FileChange } from "@/types";

interface AIExplanationResult {
  simpleExplanation: string;
  technicalExplanation: string;
  whyItChanged: string;
  impact: string;
}

function buildPrompt(commit: Partial<Commit>, fileChanges: FileChange[]): string {
  const diffSummary = fileChanges
    .slice(0, 10) // Limit to 10 files to stay within token limits
    .map((f) => {
      const patchPreview = f.patch ? f.patch.substring(0, 500) : "No diff available";
      return `File: ${f.filename} (${f.status}) +${f.additions}/-${f.deletions}\n${patchPreview}`;
    })
    .join("\n\n---\n\n");

  return `You are an expert code reviewer analyzing a Git commit. Analyze this commit and provide structured insights.

COMMIT INFO:
- Message: ${commit.message}
- Author: ${commit.authorName}
- Date: ${commit.committedAt}
- Files Changed: ${commit.filesChanged}
- Additions: ${commit.additions}
- Deletions: ${commit.deletions}

CODE CHANGES:
${diffSummary}

Respond ONLY with a valid JSON object (no markdown, no explanation outside JSON):
{
  "simpleExplanation": "A 1-2 sentence explanation a non-technical person could understand",
  "technicalExplanation": "A technical explanation for developers covering what code changed and how",
  "whyItChanged": "Your best guess at WHY this change was made - bug fix, feature, refactor, performance, etc.",
  "impact": "The likely impact of this change on the codebase - what it affects, risks, improvements"
}`;
}

async function callOpenAI(prompt: string): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 800,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callGroq(prompt: string): Promise<string> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama3-8b-8192",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 800,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function generateCommitExplanation(
  commit: Partial<Commit>,
  fileChanges: FileChange[]
): Promise<AIExplanationResult> {
  const prompt = buildPrompt(commit, fileChanges);

  let rawResponse: string;

  const provider = process.env.AI_PROVIDER || "groq";

  if (provider === "openai" && process.env.OPENAI_API_KEY) {
    rawResponse = await callOpenAI(prompt);
  } else if (process.env.GROQ_API_KEY) {
    rawResponse = await callGroq(prompt);
  } else if (process.env.OPENAI_API_KEY) {
    rawResponse = await callOpenAI(prompt);
  } else {
    // Return mock explanation if no AI key configured
    return getMockExplanation(commit);
  }

  // Clean and parse JSON response
  const cleaned = rawResponse
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // If parsing fails, extract content manually
    return {
      simpleExplanation: "This commit made changes to the codebase.",
      technicalExplanation: rawResponse.substring(0, 500),
      whyItChanged: "The reason for this change could not be determined.",
      impact: "Impact analysis unavailable.",
    };
  }
}

function getMockExplanation(commit: Partial<Commit>): AIExplanationResult {
  const message = commit.message || "";
  const isFeature =
    message.toLowerCase().includes("feat") || message.toLowerCase().includes("add");
  const isFix =
    message.toLowerCase().includes("fix") || message.toLowerCase().includes("bug");
  const isRefactor =
    message.toLowerCase().includes("refactor") || message.toLowerCase().includes("clean");

  if (isFix) {
    return {
      simpleExplanation: `A bug was fixed: "${message}". This likely resolves an issue users were experiencing.`,
      technicalExplanation: `Bug fix commit that addresses "${message}". The changes modify existing logic to correct incorrect behavior.`,
      whyItChanged: "This change was made to fix a bug or resolve an unexpected behavior in the application.",
      impact: "Low risk change. Fixes existing functionality without adding new features. Users affected by the bug will see the issue resolved.",
    };
  }

  if (isFeature) {
    return {
      simpleExplanation: `A new feature was added: "${message}". This brings new functionality to the application.`,
      technicalExplanation: `Feature addition: "${message}". New code paths and potentially new files were created to support this functionality.`,
      whyItChanged: "This change was made to add new functionality, likely requested by users or part of the product roadmap.",
      impact: "Medium risk. Adds new functionality which could introduce new bugs. Requires testing of the new feature and regression testing of related areas.",
    };
  }

  if (isRefactor) {
    return {
      simpleExplanation: `Code was cleaned up and improved: "${message}". No new features were added.`,
      technicalExplanation: `Refactoring commit: "${message}". Existing code structure was improved without changing functionality.`,
      whyItChanged: "This change was made to improve code quality, readability, or maintainability without changing behavior.",
      impact: "Low-medium risk. No new features but code changes could introduce subtle bugs. Improves long-term maintainability.",
    };
  }

  return {
    simpleExplanation: `Code changes were made: "${message}".`,
    technicalExplanation: `Commit: "${message}". Changes were made to ${commit.filesChanged || "several"} files with ${commit.additions || 0} additions and ${commit.deletions || 0} deletions.`,
    whyItChanged: "The exact reason for this change is unclear from the commit message alone.",
    impact: "The impact depends on which files were changed and what logic was modified.",
  };
}
