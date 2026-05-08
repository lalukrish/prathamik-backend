import { supabase } from "../../config/supabase";

export const uploadResumeToStorage = async (
    file: Express.Multer.File,
    candidateId: string
) => {
    const fileExt =
        file.originalname.split(".").pop();

    const fileName = `
${Date.now()}.${fileExt}
`;

    const filePath = `
${candidateId}/${fileName}
`;

    const { data, error } = await supabase
        .storage
        .from("i-bucket")
        .upload(filePath, file.buffer, {
            contentType: file.mimetype,
        });

    if (error) {
        throw error;
    }

    return data.path;
};