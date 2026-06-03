import { z } from "zod";

export const scheduleInterviewSchema = z.object({
    applicationId: z.string().uuid(),
    templateId: z.string().uuid(),
    scheduledStartAt: z.string().datetime(),
    scheduledEndAt: z.string().datetime(),
});