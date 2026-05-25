import { prisma } from "../../config/db";
import { supabase } from "../../config/supabase";

import { resumeParser } from "./resume.parser";

export class AIService {
    async processApplication(
        applicationId: string,
    ) {
        try {
            // =====================================================
            // Get Application
            // =====================================================

            const application =
                await prisma.application.findUnique({
                    where: {
                        id: applicationId,
                    },

                    include: {
                        candidate: true,
                        resume: true,
                        job: true,
                    },
                });

            if (!application) {
                throw new Error(
                    "Application not found",
                );
            }

            // =====================================================
            // Validate Resume
            // =====================================================

            if (!application.resume) {
                throw new Error(
                    "Resume not found",
                );
            }

            if (
                !application.resume.storagePath
            ) {
                throw new Error(
                    "Resume storage path missing",
                );
            }

            // =====================================================
            // Update Status → parsing
            // =====================================================

            await prisma.application.update({
                where: {
                    id: applicationId,
                },

                data: {
                    processingStatus: "parsing",
                    processingError: null,
                },
            });

            // =====================================================
            // Generate Signed URL
            // =====================================================

            const { data, error } =
                await supabase.storage
                    .from("i-bucket")
                    .createSignedUrl(
                        application.resume
                            .storagePath,
                        60 * 60,
                    );

            if (
                error ||
                !data?.signedUrl
            ) {
                throw new Error(
                    "Failed to generate signed URL",
                );
            }

            const signedUrl =
                data.signedUrl;

            console.log(
                "SIGNED URL:",
                signedUrl,
            );

            // =====================================================
            // Parse Resume + Score Candidate
            // =====================================================

            const parsedData =
                await resumeParser.parseResume(
                    signedUrl,
                    application.job
                        .description,
                );

            console.log(
                "PARSED DATA:",
                parsedData,
            );

            // =====================================================
            // Update Candidate
            // =====================================================

            await prisma.candidate.update({
                where: {
                    id: application.candidateId,
                },

                data: {
                    currentRole:
                        parsedData.candidate
                            ?.currentRole ||
                        null,

                    skills:
                        parsedData.candidate
                            ?.skills || [],

                    linkedinUrl:
                        parsedData.candidate
                            ?.linkedinUrl ||
                        null,

                    totalExperience:
                        parsedData.candidate
                            ?.totalExperience ||
                        null,

                    parsedData,
                },
            });

            // =====================================================
            // Update Application
            // =====================================================

            await prisma.application.update({
                where: {
                    id: applicationId,
                },

                data: {
                    parsedData,

                    overallScore:
                        parsedData.scoring
                            ?.overallScore ||
                        null,

                    aiSummary:
                        parsedData.aiSummary ||
                        null,

                    matchedSkills:
                        parsedData.scoring
                            ?.matchedSkills ||
                        [],

                    missingSkills:
                        parsedData.scoring
                            ?.missingSkills ||
                        [],


                    processingStatus:
                        "completed",

                    processingError: null,
                },
            });

            // =====================================================
            // Create / Update Candidate Score
            // =====================================================

            await prisma.candidateScore.upsert({
                where: {
                    applicationId,
                },

                update: {
                    resumeScore:
                        Math.round(
                            parsedData.scoring
                                ?.overallScore ||
                            0,
                        ),
                },

                create: {
                    applicationId,

                    resumeScore:
                        Math.round(
                            parsedData.scoring
                                ?.overallScore ||
                            0,
                        ),
                },
            });

            console.log(
                `✅ AI processing completed for application: ${applicationId}`,
            );

            return parsedData;
        } catch (error: any) {
            console.error(
                "❌ AI PROCESSING ERROR:",
                error,
            );

            // =====================================================
            // Update Failed Status
            // =====================================================

            await prisma.application.update({
                where: {
                    id: applicationId,
                },

                data: {
                    processingStatus:
                        "failed",

                    processingError:
                        error.message ||
                        "Unknown error",
                },
            });

            throw error;
        }
    }
}

export const aiService =
    new AIService();