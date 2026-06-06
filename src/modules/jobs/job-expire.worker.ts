import { JobRepository } from "./job.repository";


const jobRepo = new JobRepository();
export const processExpiredJobs = async () => {
    try {
        const jobs = await jobRepo.findExpiredJobs();

        if (jobs.length === 0) {
            return;
        }

        console.log(`📌 Found ${jobs.length} expired job(s)`);

        for (const job of jobs) {
            await jobRepo.disableJob(job.id);

            console.log(`✅ Job disabled: ${job.title}`);
        }
    } catch (error) {
        console.error("❌ Job Expire Worker Failed", error);
    }
};
