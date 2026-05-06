<!-- hire-ai-backend/
│
├── src/
│   ├── config/
│   │   ├── db.ts
│   │   ├── redis.ts
│   │   ├── env.ts
│   │   └── logger.ts
│
│   ├── modules/
│   │
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.repository.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.validator.ts
│   │   │   └── auth.types.ts
│   │
│   │   ├── users/
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.repository.ts
│   │   │   └── user.routes.ts
│   │
│   │   ├── jobs/
│   │   │   ├── job.controller.ts
│   │   │   ├── job.service.ts
│   │   │   ├── job.repository.ts
│   │   │   ├── job.routes.ts
│   │   │   └── job.ai.ts
│   │
│   │   ├── candidates/
│   │   │   ├── candidate.controller.ts
│   │   │   ├── candidate.service.ts
│   │   │   ├── candidate.repository.ts
│   │   │   └── candidate.routes.ts
│   │
│   │   ├── applications/
│   │   │   ├── application.controller.ts
│   │   │   ├── application.service.ts
│   │   │   ├── application.repository.ts
│   │   │   ├── application.routes.ts
│   │   │   ├── application.queue.ts
│   │   │   └── application.types.ts
│   │
│   │   ├── ai/
│   │   │   ├── ai.service.ts
│   │   │   ├── resume.parser.ts
│   │   │   ├── embedding.service.ts
│   │   │   ├── scoring.service.ts
│   │   │   └── prompt.templates.ts
│   │
│   │   ├── interviews/
│   │   │   ├── interview.controller.ts
│   │   │   ├── interview.service.ts
│   │   │   └── interview.routes.ts
│   │
│   │   └── analytics/
│   │       ├── analytics.service.ts
│   │       └── analytics.controller.ts
│
│   ├── queues/
│   │   ├── queue.ts
│   │   ├── application.worker.ts
│   │   └── retry.strategy.ts
│
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── rateLimit.middleware.ts
│   │   └── validation.middleware.ts
│
│   ├── utils/
│   │   ├── apiResponse.ts
│   │   ├── asyncHandler.ts
│   │   ├── encryption.ts
│   │   └── constants.ts
│
│   ├── types/
│   │   └── global.d.ts
│
│   ├── routes/
│   │   └── index.ts
│
│   ├── app.ts
│   └── server.ts
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── scripts/
│   ├── seed.ts
│   └── create-admin.ts
│
├── tests/
│   ├── unit/
│   └── integration/
│
├── .env
├── package.json
└── tsconfig.json -->
