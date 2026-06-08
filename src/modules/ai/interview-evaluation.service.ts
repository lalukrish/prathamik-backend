import OpenAI from "openai";
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
export const evaluateWithAI =
    async ({
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
${JSON.stringify(
            qaPairs,
            null,
            2
        )}

Return JSON only:

{
  "technicalScore": number,
  "communicationScore": number,
  "problemSolvingScore": number,
  "overallScore": number,
  "strengths": [],
  "weaknesses": [],
  "feedback": ""
}
`;

        const response =
            await openai.responses.create({
                model: "gpt-4.1-mini",
                input: prompt,
            });

        return JSON.parse(
            response.output_text
        );
    };