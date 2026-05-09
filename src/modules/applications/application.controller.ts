import { Request, Response } from "express";

import { uploadResumeToStorage }
    from "./resume.service";

export class ApplicationController {
    async uploadResume(
        req: Request,
        res: Response
    ) {
        try {
            const file = req.file;

            if (!file) {
                return res.status(400).json({
                    success: false,
                    message: "Resume is required",
                });
            }

            const organizationId =
                "org-id";

            const candidateId =
                "candidate-id";

            const path =
                await uploadResumeToStorage(
                    file,
                    organizationId,
                    candidateId
                );

            return res.json({
                success: true,
                path,
            });

        } catch (error) {
            console.error(error);

            return res.status(500).json({
                success: false,
                message: "Upload failed",
            });
        }
    }
}