import { supabase } from "../../config/supabase";

export const uploadResumeToStorage = async (
  file: Express.Multer.File,
  candidateId: string,
) => {
  const fileExt = file.originalname.split(".").pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `${candidateId}/${fileName}`;
  const { data, error } = await supabase.storage
    .from("i-bucket")
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
    });

  if (error) {
    console.error("SUPABASE UPLOAD ERROR:", error);
    throw new Error(error.message);
  }

  const { data: signedUrlData, error: signedUrlError } =
    await supabase.storage
      .from("i-bucket")
      .createSignedUrl(filePath, 3600);

  if (signedUrlError) {
    console.error("SIGNED URL ERROR:", signedUrlError);
    throw new Error(signedUrlError.message);
  }

  return {
    storagePath: filePath,
    resumeUrl: signedUrlData.signedUrl,
  };
};