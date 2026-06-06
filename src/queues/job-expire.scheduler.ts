import { jobExpireQueue } from "./job-expire.queue";
export const registerJobExpireJob = async () => {
    await jobExpireQueue.add(
        "expire-jobs",
        {},
        {
            repeat: {
                every: 60 * 60 * 1000,
            },
            removeOnComplete: 100,
            removeOnFail: 100,
        },
    );
    console.log("📅 Job Expire Scheduler Registered");
};
