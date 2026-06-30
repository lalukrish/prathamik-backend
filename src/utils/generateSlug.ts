import slugify from "slugify";
import { prisma } from "../config/db";

export const generateUniqueSlug = async (title: string) => {
  // const baseSlug = slugify(title, {
  //     lower: true,
  //     strict: true,
  //     trim: true,
  // });

  // let slug = baseSlug;
  // let counter = 1;

  // while (true) {
  //     const existingJob = await prisma.job.findUnique({
  //         where: {
  //             slug,
  //         },
  //     });

  //     if (!existingJob) {
  //         break;
  //     }

  //     slug = `${baseSlug}-${counter}`;
  //     counter++;
  // }

  return "slug";
};
