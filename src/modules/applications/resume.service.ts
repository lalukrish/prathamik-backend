import { supabase } from "../../config/supabase";

export const uploadResumeToStorage = async (
    file: Express.Multer.File,
    organizationId: string,
    candidateId: string
) => {
    const fileExt =
        file.originalname.split(".").pop();

    const fileName = `
${Date.now()}.${fileExt}
`;

    const filePath = `
${organizationId}/${candidateId}/${fileName}
`;

    const { data, error } = await supabase
        .storage
        .from("resumes")
        .upload(filePath, file.buffer, {
            contentType: file.mimetype,
        });

    if (error) {
        throw error;
    }

    return data.path;
};