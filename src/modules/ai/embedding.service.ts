import OpenAI from "openai";

export class EmbeddingService {
    private openai?: OpenAI;

    constructor() {
        if (process.env.OPENAI_API_KEY) {
            this.openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY,
            });
        }
    }

    async generate(text: string): Promise<number[]> {
        if (!this.openai) {
            console.warn("⚠️ OpenAI key missing → using fallback embedding");

            return this.fallbackEmbedding(text);
        }

        try {
            const response = await this.openai.embeddings.create({
                model: "text-embedding-3-small",
                input: text,
            });

            return response.data[0].embedding;
        } catch (error) {
            console.error("❌ OpenAI embedding failed:", error);

            return this.fallbackEmbedding(text);
        }
    }

    private fallbackEmbedding(text: string): number[] {
        const size = 1536;

        const arr = new Array(size).fill(0);

        for (let i = 0; i < text.length; i++) {
            arr[i % size] += text.charCodeAt(i) / 255;
        }

        return arr;
    }
}