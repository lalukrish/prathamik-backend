import { Request, Response } from "express";
import applicationService from "./application.service";

class ApplicationController {
    async changeStatus(req: Request, res: Response) {
        try {
            const { applicationId } = req.params;
            const { status } = req.body;

            const userId = req.user?.id as string;
            const orgId = req.user?.orgId as string;
            if (!orgId) {
                throw new Error("Organization ID is required");
            }
            if (!userId) {
                throw new Error("User ID is required");
            }

            const result = await applicationService.changeStatus(
                applicationId,
                status,
                userId,
                orgId
            );

            return res.status(200).json({
                success: true,
                message: "Application status updated successfully",
                data: result,
            });
        } catch (error: any) {
            console.log(error)
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }
}

export default new ApplicationController();