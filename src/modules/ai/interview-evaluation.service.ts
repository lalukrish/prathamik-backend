import OpenAI from "openai";
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
export const evaluateWithAI = async ({
    jobTitle,
    jobDescription,
    qaPairs,
}: {
    jobTitle: string;
    jobDescription: string;
    qaPairs: any[];
}) => {
    const prompt = `
You are a senior technical interviewer.

Job Title:
${jobTitle}

Job Description:
${jobDescription}

Candidate Answers:
${JSON.stringify(qaPairs, null, 2)}

Instructions:

1. Score each answer from 0 to its maxScore.
2. Never exceed maxScore.
3. Consider technical accuracy, depth, clarity and completeness.
4. Return JSON only.

{
  "questions":[
    {
      "answerId":"string",
      "score":number,
      "maxScore":number
    }
  ],
  "technicalScore":number (out of 10),
  "communicationScore":number (out of 10),
  "problemSolvingScore":number (out of 10),
  "overallScore":number (out of 10),
  "strengths":[],
  "weaknesses":[],
  "feedback":"..."
}
`;

    const response = await openai.responses.create({
        model: "gpt-4.1-mini",
        input: prompt,
    });

    let content = response.output_text.trim();

    content = content
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```$/i, "")
        .trim();

    return JSON.parse(content);
};
