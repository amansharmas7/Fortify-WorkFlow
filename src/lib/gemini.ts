export interface ProcessStep {
  title: string;
  description: string;
  role: string;
  tools?: string[];
}

export interface ProcessTemplate {
  title: string;
  description: string;
  targetAudience: string;
  steps: ProcessStep[];
}

/**
 * Requests a process template from the same-origin server API.
 * The Gemini credential is never imported into or embedded in the browser bundle.
 */
export async function generateProcessTemplate(prompt: string): Promise<ProcessTemplate> {
  const response = await fetch("/api/generate-process", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ prompt }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      payload && typeof payload.error === "string"
        ? payload.error
        : "The process template could not be generated.";
    throw new Error(message);
  }

  return payload as ProcessTemplate;
}
