import applicationRepository from "./application.repository";
import { ApplicationStatus } from "./application.types";

export class ApplicationService {
    async changeStatus(
        applicationId: string,
        status: ApplicationStatus,
        userId: string,
        orgId: string
    ) {
        const application =
            await applicationRepository.findById(applicationId, orgId);

        if (!application) {
            throw new Error("Application not found");
        }

        // const validStatuses = Object.values(ApplicationStatus);

        // if (!validStatuses.includes(status)) {
        //     throw new Error("Invalid application status");
        // }

        return applicationRepository.updateStatus(
            applicationId,
            status,
            userId
        );
    }
}

export default new ApplicationService();