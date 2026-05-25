import { Worker } from "bullmq";

import { prisma } from "../config/db";

import { redisConnection } from "../config/redis";

import { resumeParser } from "../modules/ai/resume.parser";

// ============================================
// Processing Log Helper
// ============================================

const createProcessingLog = async (
    applicationId: string,
    step: string,
    status: string,
    message?: string,
) => {
    try {
        await prisma.processingLog.create({
            data: {
                applicationId,
                step,
                status,
                message,
            },
        });
    } catch (error) {
        console.error(
            "PROCESSING LOG ERROR:",
            error,
        );
    }
};

// ============================================
// Application Worker
// ============================================

export const applicationWorker =
    new Worker(
        "application-processing",

        async (job) => {
            const { applicationId } =
                job.data;

            try {
                console.log(
                    "===================================",
                );

                console.log(
                    "APPLICATION WORKER STARTED",
                );

                // ============================================
                // Worker Started Log
                // ============================================

                await createProcessingLog(
                    applicationId,
                    "WORKER_STARTED",
                    "SUCCESS",
                    "Worker started successfully",
                );

                // ============================================
                // Get Application
                // ============================================

                const application =
                    await prisma.application.findUnique(
                        {
                            where: {
                                id: applicationId,
                            },

                            include: {
                                candidate: true,
                                job: true,
                                resume: true,
                            },
                        },
                    );

                if (!application) {
                    throw new Error(
                        "Application not found",
                    );
                }

                // ============================================
                // Prevent Duplicate Processing
                // ============================================

                if (
                    application.processingStatus ===
                    "COMPLETED" ||

                    application.parsedData
                ) {
                    console.log(
                        "ALREADY PROCESSED",
                    );

                    await createProcessingLog(
                        applicationId,
                        "DUPLICATE_SKIPPED",
                        "SUCCESS",
                        "Application already processed",
                    );

                    return;
                }

                // ============================================
                // Resume Validation
                // ============================================

                if (
                    !application.resume
                        ?.resumeUrl
                ) {
                    throw new Error(
                        "Resume URL missing",
                    );
                }

                // ============================================
                // Update Processing Status
                // ============================================

                await prisma.application.update(
                    {
                        where: {
                            id: applicationId,
                        },

                        data: {
                            processingStatus:
                                "PROCESSING",
                        },
                    },
                );

                await createProcessingLog(
                    applicationId,
                    "PROCESSING_STARTED",
                    "SUCCESS",
                    "AI processing started",
                );

                // ============================================
                // AI Resume Parsing
                // ============================================

                const aiData =
                    await resumeParser.parseResume(
                        application.resume
                            .resumeUrl,

                        application.job
                            .description,
                    );

                await createProcessingLog(
                    applicationId,
                    "AI_PARSING_COMPLETED",
                    "SUCCESS",
                    "Resume parsed successfully",
                );

                // ============================================
                // Candidate Parsed Data
                // ============================================

                const candidateParsedData =
                {
                    profile: {
                        name:
                            aiData
                                ?.candidate
                                ?.name ||
                            "",

                        location:
                            aiData
                                ?.candidate
                                ?.location ||
                            "",

                        currentRole:
                            aiData
                                ?.candidate
                                ?.currentRole ||
                            "",

                        linkedinUrl:
                            aiData
                                ?.candidate
                                ?.linkedinUrl ||
                            "",
                    },

                    skills:
                        aiData
                            ?.candidate
                            ?.skills ||
                        [],

                    summary:
                        aiData
                            ?.candidate
                            ?.summary ||
                        "",

                    education:
                        aiData
                            ?.candidate
                            ?.education ||
                        [],

                    workExperience:
                        aiData
                            ?.candidate
                            ?.workExperience ||
                        [],

                    projects:
                        aiData
                            ?.candidate
                            ?.projects ||
                        [],

                    aiSummary:
                        aiData?.aiSummary ||
                        "",
                };

                // ============================================
                // Application Parsed Data
                // ============================================

                const applicationParsedData =
                {
                    scoring: {
                        overallScore:
                            aiData
                                ?.scoring
                                ?.overallScore ||
                            0,

                        skillMatchScore:
                            aiData
                                ?.scoring
                                ?.skillMatchScore ||
                            0,

                        experienceScore:
                            aiData
                                ?.scoring
                                ?.experienceScore ||
                            0,

                        communicationScore:
                            aiData
                                ?.scoring
                                ?.communicationScore ||
                            0,

                        matchedSkills:
                            aiData
                                ?.scoring
                                ?.matchedSkills ||
                            [],

                        missingSkills:
                            aiData
                                ?.scoring
                                ?.missingSkills ||
                            [],

                        strengths:
                            aiData
                                ?.scoring
                                ?.strengths ||
                            [],

                        weaknesses:
                            aiData
                                ?.scoring
                                ?.weaknesses ||
                            [],
                    },
                };

                // ============================================
                // Update Candidate
                // ============================================

                await prisma.candidate.update(
                    {
                        where: {
                            id:
                                application.candidateId,
                        },

                        data: {
                            // ============================================
                            // NEVER OVERRIDE USER INPUTS
                            // ============================================

                            currentRole:
                                aiData
                                    ?.candidate
                                    ?.currentRole,

                            linkedinUrl:
                                aiData
                                    ?.candidate
                                    ?.linkedinUrl,

                            // ============================================
                            // Resume Enrichment
                            // ============================================

                            skills:
                                aiData
                                    ?.candidate
                                    ?.skills ||
                                [],

                            parsedData:
                                candidateParsedData,
                        },
                    },
                );

                await createProcessingLog(
                    applicationId,
                    "CANDIDATE_UPDATED",
                    "SUCCESS",
                    "Candidate updated successfully",
                );

                // ============================================
                // Update Application
                // ============================================

                await prisma.application.update(
                    {
                        where: {
                            id: applicationId,
                        },

                        data: {
                            processingStatus:
                                "COMPLETED",

                            overallScore:
                                aiData
                                    ?.scoring
                                    ?.overallScore ||
                                0,

                            aiSummary:
                                aiData?.aiSummary ||
                                "",

                            matchedSkills:
                                aiData
                                    ?.scoring
                                    ?.matchedSkills ||
                                [],

                            missingSkills:
                                aiData
                                    ?.scoring
                                    ?.missingSkills ||
                                [],

                            parsedData:
                                applicationParsedData,
                        },
                    },
                );

                await createProcessingLog(
                    applicationId,
                    "APPLICATION_UPDATED",
                    "SUCCESS",
                    "Application updated successfully",
                );

                // ============================================
                // Create / Update Candidate Score
                // ============================================

                await prisma.candidateScore.upsert(
                    {
                        where: {
                            applicationId,
                        },

                        update: {
                            resumeScore:
                                aiData
                                    ?.scoring
                                    ?.overallScore ||
                                0,

                            overallScore:
                                aiData
                                    ?.scoring
                                    ?.overallScore ||
                                0,
                        },

                        create: {
                            applicationId,

                            resumeScore:
                                aiData
                                    ?.scoring
                                    ?.overallScore ||
                                0,

                            overallScore:
                                aiData
                                    ?.scoring
                                    ?.overallScore ||
                                0,

                            interviewScore: 0,

                            cheatScore: 0,
                        },
                    },
                );

                await createProcessingLog(
                    applicationId,
                    "CANDIDATE_SCORE_UPDATED",
                    "SUCCESS",
                    "Candidate score updated successfully",
                );

                console.log(
                    "APPLICATION PROCESSING COMPLETED",
                );

                console.log(
                    "===================================",
                );
            } catch (error) {
                console.error(
                    "APPLICATION WORKER ERROR:",
                    error,
                );

                // ============================================
                // Update Failed Status
                // ============================================

                await prisma.application.update(
                    {
                        where: {
                            id: applicationId,
                        },

                        data: {
                            processingStatus:
                                "FAILED",

                            processingError:
                                error instanceof
                                    Error
                                    ? error.message
                                    : "Unknown error",
                        },
                    },
                );

                await createProcessingLog(
                    applicationId,
                    "PROCESSING_FAILED",
                    "FAILED",
                    error instanceof Error
                        ? error.message
                        : "Unknown error",
                );

                throw error;
            }
        },

        {
            connection:
                redisConnection,

            // ============================================
            // Dev Safe Concurrency
            // ============================================

            concurrency: 2,
        },
    );

applicationWorker.on(
    "completed",

    (job) => {
        console.log(
            `JOB COMPLETED: ${job.id}`,
        );
    },
);

applicationWorker.on(
    "failed",

    (job, err) => {
        console.log(
            `JOB FAILED: ${job?.id}`,
        );

        console.error(err);
    },
);

console.log("🚀 AI Worker Running");