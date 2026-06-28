import { Router } from "express";
// import jobRoutes from "../modules/jobs/job.routes";
// import authRoutes from "../modules/auth/auth.routes";
// import userRoutes from "../modules/users/user.routes";
// import publicRoutes from "../modules/public/public.routes";
// import candidateRoutes from "../modules/candidates/candidate.routes";
// import { authMiddleware } from "../middlewares/auth.middleware";
// import AdminRoutes from "../modules/admin/admin.routes";
// import interviewRoutes from "../modules/interviews/interview.routes";
// import applicationRoutes from "../modules/applications/application.routes";
// import questionBankRoutes from "../modules/question-bank/questionBank.routes";
// import { getInterviewByToken } from "../modules/interviews/interview.controller";
import AuthSectionNew from "../modules/auth-section/auth.routes";
import mockTest from "../modules/mock-test/mock-test.route";
import mockQuestion from "../modules/mock-question/question.route";
import tests from "../modules/test-session/test-session.routes";
import subjects from "../modules/subject/subject.routes";
import dashboard from "../modules/dashboard/dashboard.routes";
import users from "../modules/user/Users.routes";
import results from "../modules/result/result.routes";
import transaction from "../modules/transaction/transaction.routes";
import studyGroup from "../modules/study-group/studygroup.routes";

const router = Router();

// private routes
// router.use("/jobs", authMiddleware, jobRoutes);
// router.use("/auth", authRoutes);
// router.use("/user", authMiddleware, userRoutes);
// router.use("/candidate", authMiddleware, candidateRoutes);
// router.use("/admin", authMiddleware, AdminRoutes);
// router.use("/question-bank", questionBankRoutes);
// router.use("/interviews", authMiddleware, interviewRoutes);
// router.use("/applications", authMiddleware, applicationRoutes);

router.use("/auth", AuthSectionNew);
router.use("/mock-tests", mockTest);
router.use("/mock-question/", mockQuestion);

router.use("/test-session/", tests);
router.use("/results/", results);

router.use("/subjects/", subjects);
router.use("/dashboard/", dashboard);
router.use("/users/", users);
router.use("/transactions/", transaction);
router.use("/study-groups/", studyGroup);

// public routes
// router.use("/public", publicRoutes);
// router.get("/public/candidate/interview/:token", getInterviewByToken);

export default router;
