import axios from "axios";
import OpenAI from "openai";
import { toFile } from "openai/uploads";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export class ResumeParser {
    async parseResume(
        resumeUrl: string,
        jobDescription: string,
    ) {
        try {
            console.log(
                "RESUME PARSER STARTED",
            );

            // ============================================
            // Download Resume
            // ============================================

            const response =
                await axios.get(resumeUrl, {
                    responseType: "arraybuffer",
                });

            const fileBuffer = Buffer.from(
                response.data,
            );

            // ============================================
            // Upload File To OpenAI
            // ============================================

            const uploadedFile =
                await openai.files.create({
                    file: await toFile(
                        fileBuffer,
                        "resume.pdf",
                    ),

                    purpose: "assistants",
                });

            console.log(
                "OPENAI FILE:",
                uploadedFile.id,
            );

            // ============================================
            // Parse Resume
            // ============================================

            const responseAI =
                await openai.chat.completions.create({
                    model: "gpt-4.1-mini",

                    messages: [
                        {
                            role: "system",

                            content: `
You are an expert AI recruitment engine and resume parser.

Your task is to:

1. Parse the candidate resume
2. Analyze the resume against the provided Job Description
3. Score the candidate out of 10
4. Identify matched skills
5. Identify missing skills
6. Provide strengths and weaknesses
7. Generate a short hiring summary

Return ONLY valid JSON.

Job Description:
${jobDescription}

Required JSON format:

{
  "candidate": {
    "name": "",
    "email": "",
    "phone": "",
    "location": "",
    "currentRole": "",
    "linkedinUrl": "",
    "totalExperience": 0,
    "skills": [],
    "summary": "",
    "education": [],
    "workExperience": [],
    "projects": []
  },

  "scoring": {
    "overallScore": 0,
    "skillMatchScore": 0,
    "experienceScore": 0,
    "communicationScore": 0,
    "matchedSkills": [],
    "missingSkills": [],
    "strengths": [],
    "weaknesses": []
  },

  "aiSummary": ""
}
`,
                        },

                        {
                            role: "user",

                            content: [
                                {
                                    type: "text",

                                    text: "Parse this resume",
                                },

                                {
                                    type: "file",

                                    file: {
                                        file_id:
                                            uploadedFile.id,
                                    },
                                },
                            ],
                        },
                    ],

                    response_format: {
                        type: "json_object",
                    },
                });

            const parsedData = JSON.parse(
                responseAI.choices[0].message
                    .content || "{}",
            );

            console.log(
                "RESUME PARSER COMPLETED",
            );

            return parsedData;
        } catch (error) {
            console.error(
                "RESUME PARSER ERROR:",
                error,
            );

            throw error;
        }
    }
}

export const resumeParser =
    new ResumeParser();