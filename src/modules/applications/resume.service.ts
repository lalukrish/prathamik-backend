import path from "path";

import { supabase }
    from "../../config/supabase";

export const uploadResumeToStorage =
    async (
        file: Express.Multer.File,

        organizationId: string,

        candidateId: string,
    ) => {
        // ============================================
        // File Extension
        // ============================================

        const fileExt =
            path.extname(
                file.originalname,
            );

        // ============================================
        // File Name
        // ============================================

        const fileName =
            `${Date.now()}${fileExt}`;

        // ============================================
        // File Path
        // ============================================

        const filePath = path.join(
            organizationId,
            candidateId,
            fileName,
        );

        // ============================================
        // Upload File
        // ============================================

        const { data, error } =
            await supabase.storage
                .from("resumes")
                .upload(
                    filePath,
                    file.buffer,
                    {
                        contentType:
                            file.mimetype,

                        upsert: false,
                    },
                );

        if (error) {
            throw error;
        }

        // ============================================
        // Public URL
        // ============================================

        const {
            data: publicUrlData,
        } = supabase.storage
            .from("resumes")
            .getPublicUrl(data.path);

        // ============================================
        // Return
        // ============================================

        return {
            path: data.path,

            publicUrl:
                publicUrlData.publicUrl,
        };
    };