import {
    findExpiredInterviews,
    expireInterview,
    createActivity,
} from "./interview.repository";

export const processExpiredInterviews = async () => {
    try {
        const interviews = await findExpiredInterviews();
        if (interviews.length === 0) {
            return;
        }

        for (const interview of interviews) {
            try {
                await expireInterview(interview.id);

                await createActivity({
                    interviewId: interview.id,

                    action: "EXPIRED",

                    metadata: {
                        previousStatus: interview.status,

                        expiredAt: new Date(),
                    },
                });

                console.log(`✅ Interview expired: ${interview.id}`);
            } catch (error) {
                console.error(`❌ Failed to expire interview ${interview.id}`, error);
            }
        }
    } catch (error) {
        console.error("❌ Expire worker failed", error);
    }
};
