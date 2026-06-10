import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// =====================================================
// QUESTION TIME RULES
// =====================================================

const QUESTION_TIME_RULES = {
    TEXT: {
        EASY: 60,
        MEDIUM: 120,
        HARD: 180,
    },

    RADIO: {
        EASY: 30,
        MEDIUM: 45,
        HARD: 60,
    },

    MULTIPLE_SELECT: {
        EASY: 45,
        MEDIUM: 60,
        HARD: 90,
    },

    VOICE_SPEAK: {
        EASY: 120,
        MEDIUM: 180,
        HARD: 240,
    },

    VOICE_TYPE: {
        EASY: 120,
        MEDIUM: 180,
        HARD: 240,
    },
};

const getQuestionTime = (
    type: string,
    difficulty: string,
): number => {
    return (
        QUESTION_TIME_RULES?.[
        type as keyof typeof QUESTION_TIME_RULES
        ]?.[
        difficulty as keyof typeof QUESTION_TIME_RULES.TEXT
        ] ?? 60
    );
};

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

Allowed Question Types:
${config.types.join(", ")}

Rules:
- Return valid JSON only
- Do not include markdown
- Generate professional interview questions
- difficulty must be EASY, MEDIUM, or HARD
- type must be one of the allowed question types
- Add realistic weights
- Add estimated answerTimeSeconds for each question

Weight Rules:
EASY = 5
MEDIUM = 10
HARD = 20

Answer Time Rules:
- EASY: 30-60 seconds
- MEDIUM: 60-180 seconds
- HARD: 180-600 seconds
- Coding questions may require more time
- System design questions may require the highest time
- Time should reflect realistic interview expectations

JSON format:

[
  {
    "question": "",
    "type": "",
    "difficulty": "",
    "weight": 10,
    "timeLimitSeconds": 120,
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

        const questions = JSON.parse(content);

        return questions.map((question: any) => ({
            ...question,

            timeLimitSeconds: getQuestionTime(
                question.type,
                question.difficulty,
            ),
        }));
    };