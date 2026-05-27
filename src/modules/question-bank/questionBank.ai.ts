import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// =====================================================
// GENERATE QUESTIONS
// =====================================================

export const generateQuestionsWithAI =
    async ({
        job,
        config,
    }: any) => {
        const prompt = `
Generate ${config.count} interview questions.

Job Title:
${job.title}

Job Description:
${job.description}

Required Skills:
${job.skills?.join(", ")}

Difficulty:
${config.difficulty}

Question Types:
${config.types.join(", ")}

Rules:
- Return valid JSON only
- Do not include markdown
- Generate professional interview questions
- Add realistic weights
- Weight range:
  EASY = 5
  MEDIUM = 10
  HARD = 20

JSON format:

[
  {
    "question": "",
    "type": "",
    "difficulty": "",
    "weight": 10,
    "skillTags": [],
    "options": []
  }
]
`;

        const response =
            await openai.chat.completions.create({
                model: "gpt-4.1-mini",

                messages: [
                    {
                        role: "user",
                        content: prompt,
                    },
                ],

                temperature: 0.7,
            });

        const content =
            response.choices[0].message.content;

        if (!content) {
            throw new Error(
                "AI failed to generate questions",
            );
        }

        return JSON.parse(content);
    };