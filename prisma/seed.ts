// // prisma/seed.ts

// import {
//     PrismaClient,
//     ApplicationSource,
//     ApplicationStatus,
//     UserRole,
// } from "@prisma/client";

// import { faker } from "@faker-js/faker";

// const prisma = new PrismaClient();

// async function main() {
//     console.log("🌱 Starting database seed...");

//     // =========================================================
//     // ORGANIZATION
//     // =========================================================

//     const organization = await prisma.organization.create({
//         data: {
//             name: "HAi Technologies",
//         },
//     });

//     console.log("✅ Organization created");

//     // =========================================================
//     // USERS
//     // =========================================================

//     const superAdmin = await prisma.user.create({
//         data: {
//             name: "Super Admin",
//             email: "admin@hai.com",
//             password: "hashed_password",
//             role: UserRole.SUPER_ADMIN,
//             orgId: organization.id,
//         },
//     });

//     const hrManager = await prisma.user.create({
//         data: {
//             name: "HR Manager",
//             email: "hr@hai.com",
//             password: "hashed_password",
//             role: UserRole.HR_MANAGER,
//             orgId: organization.id,
//         },
//     });

//     console.log("✅ Users created");

//     // =========================================================
//     // JOBS
//     // =========================================================

//     const jobs = [];

//     const jobData = [
//         {
//             title: "Backend Developer",
//             skills: [
//                 "Node.js",
//                 "TypeScript",
//                 "PostgreSQL",
//                 "Redis",
//                 "Prisma",
//             ],
//         },
//         {
//             title: "Frontend Developer",
//             skills: [
//                 "React",
//                 "Next.js",
//                 "Tailwind CSS",
//                 "TypeScript",
//             ],
//         },
//         {
//             title: "Full Stack Developer",
//             skills: [
//                 "Node.js",
//                 "React",
//                 "PostgreSQL",
//                 "Docker",
//             ],
//         },
//         {
//             title: "DevOps Engineer",
//             skills: [
//                 "AWS",
//                 "Docker",
//                 "Kubernetes",
//                 "CI/CD",
//             ],
//         },
//         {
//             title: "AI Engineer",
//             skills: [
//                 "Python",
//                 "OpenAI",
//                 "Vector DB",
//                 "LangChain",
//             ],
//         },
//     ];

//     for (const item of jobData) {
//         const job = await prisma.job.create({
//             data: {
//                 title: item.title,

//                 description: faker.lorem.paragraphs(5),

//                 skills: item.skills,

//                 experienceRequired: faker.number.int({
//                     min: 1,
//                     max: 8,
//                 }),

//                 createdById: superAdmin.id,

//                 orgId: organization.id,
//             },
//         });

//         jobs.push(job);
//     }

//     console.log("✅ Jobs created");

//     // =========================================================
//     // CANDIDATES
//     // =========================================================

//     const candidates = [];

//     for (let i = 0; i < 50; i++) {
//         const candidate = await prisma.candidate.create({
//             data: {
//                 name: faker.person.fullName(),

//                 email: faker.internet.email().toLowerCase(),

//                 phone: faker.phone.number("+91##########"),

//                 orgId: organization.id,
//             },
//         });

//         candidates.push(candidate);
//     }

//     console.log("✅ Candidates created");

//     // =========================================================
//     // APPLICATIONS
//     // =========================================================

//     for (const candidate of candidates) {
//         // Random job
//         const randomJob =
//             jobs[Math.floor(Math.random() * jobs.length)];

//         // Random resume score
//         const resumeScore = faker.number.int({
//             min: 50,
//             max: 98,
//         });

//         // Random interview score
//         const interviewScore = faker.number.int({
//             min: 40,
//             max: 95,
//         });

//         // Overall
//         const overallScore = Math.floor(
//             (resumeScore + interviewScore) / 2
//         );

//         // Random status
//         const statuses = [
//             ApplicationStatus.APPLIED,
//             ApplicationStatus.SHORTLISTED,
//             ApplicationStatus.INTERVIEW,
//             ApplicationStatus.REJECTED,
//         ];

//         const randomStatus =
//             statuses[
//             Math.floor(Math.random() * statuses.length)
//             ];

//         // Create application
//         const application = await prisma.application.create({
//             data: {
//                 candidateId: candidate.id,

//                 jobId: randomJob.id,

//                 orgId: organization.id,

//                 source:
//                     Math.random() > 0.5
//                         ? ApplicationSource.APPLIED
//                         : ApplicationSource.MANUAL,

//                 status: randomStatus,

//                 aiScore: overallScore,

//                 aiSummary: faker.lorem.sentences(3),

//                 missingSkills: [
//                     "Docker",
//                     "Kubernetes",
//                 ],

//                 resumeUrl:
//                     "https://example.com/resume.pdf",

//                 parsedData: {
//                     skills: [
//                         "Node.js",
//                         "React",
//                         "PostgreSQL",
//                     ],

//                     experience: faker.number.int({
//                         min: 1,
//                         max: 10,
//                     }),

//                     education: "Bachelor of Technology",
//                 },
//             },
//         });

//         // =====================================================
//         // CANDIDATE SCORE
//         // =====================================================

//         await prisma.candidateScore.create({
//             data: {
//                 applicationId: application.id,

//                 resumeScore,

//                 interviewScore,

//                 cheatScore: faker.number.int({
//                     min: 0,
//                     max: 10,
//                 }),

//                 overallScore,
//             },
//         });
//     }

//     console.log("✅ Applications created");

//     console.log("🎉 Database seed completed successfully");
// }

// main()
//     .catch((error) => {
//         console.error(error);

//         process.exit(1);
//     })
//     .finally(async () => {
//         await prisma.$disconnect();
//     });
