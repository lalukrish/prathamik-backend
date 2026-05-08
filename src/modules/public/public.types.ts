import { z } from "zod";

import { applyJobSchema }
    from "./public.validator";

export type ApplyJobDTO =
    z.infer<typeof applyJobSchema>["body"];