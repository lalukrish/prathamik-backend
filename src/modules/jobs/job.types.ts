export interface CreateJobDTO {
    title: string;
    description: string;

    requiredSkills: string[];
    niceToHave: string[];

    experienceMin?: number;
    experienceMax?: number;
}

export interface UpdateJobDTO {
    title?: string;
    description?: string;

    requiredSkills?: string[];
    niceToHave?: string[];

    experienceMin?: number;
    experienceMax?: number;
}