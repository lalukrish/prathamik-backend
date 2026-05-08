import { prisma } from "../../config/db";

import { ApplyJobDTO } from "./public.types";

import { uploadResumeToStorage } from "./resume.service";

export class PublicService {
    async applyJob(
        jobId: string,
        payload: ApplyJobDTO,
        file?: Express.Multer.File
    ) {
        //////////////////////////////////////////////////
        // CHECK JOB
        //////////////////////////////////////////////////

        const job = await prisma.job.findUnique({
            where: {
                id: jobId,
            },
        });

        if (!job) {
            throw new Error("Job not found");
        }

        //////////////////////////////////////////////////
        // CHECK EXISTING APPLICATION
        //////////////////////////////////////////////////

        const existingCandidate =
            await prisma.candidate.findFirst({
                where: {
                    email: payload.email,
                },
            });

        if (existingCandidate) {
            const existingApplication =
                await prisma.application.findFirst({
                    where: {
                        candidateId:
                            existingCandidate.id,

                        jobId,
                    },
                });

            if (existingApplication) {
                throw new Error(
                    "Already applied for this job"
                );
            }
        }

        //////////////////////////////////////////////////
        // CREATE / UPDATE CANDIDATE
        //////////////////////////////////////////////////

        let candidate = existingCandidate;

        if (!candidate) {
            candidate =
                await prisma.candidate.create({
                    data: {
                        name: payload.name,

                        email: payload.email,

                        phone: payload.phone,

                        currentRole:
                            payload.currentRole,

                        totalExperience:
                            payload.totalExperience,

                        skills:
                            payload.skills || [],

                        expectedSalary:
                            payload.expectedSalary,

                        currentCTC:
                            payload.currentCTC,

                        noticePeriod:
                            payload.noticePeriod,

                        isOnNoticePeriod:
                            payload.isOnNoticePeriod,

                        linkedinUrl:
                            payload.linkedinUrl,

                        orgId: job.orgId,
                    },
                });
        }

        //////////////////////////////////////////////////
        // UPLOAD RESUME
        //////////////////////////////////////////////////

        let resumeId:
            | string
            | undefined;

        if (file) {
            const resumeUrl =
                await uploadResumeToStorage(
                    file,
                    candidate.id
                );

            const resume =
                await prisma.resume.create({
                    data: {
                        candidateId:
                            candidate.id,

                        resumeUrl,

                        fileName:
                            file.originalname,

                        fileSize: file.size,

                        mimeType:
                            file.mimetype,
                    },
                });

            resumeId = resume.id;
        }

        //////////////////////////////////////////////////
        // CREATE APPLICATION
        //////////////////////////////////////////////////

        const application =
            await prisma.application.create({
                data: {
                    candidateId:
                        candidate.id,

                    jobId,

                    resumeId,

                    source: "applied",
                },
            });

        //////////////////////////////////////////////////
        // RETURN
        //////////////////////////////////////////////////

        return {
            candidate,
            application,
        };
    }
}