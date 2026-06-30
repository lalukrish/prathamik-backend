// import "express";

// declare global {
//   namespace Express {
//     interface UserPayload {
//       userId: string;
//       role: string;
//       sessionId?: string;
//       orgId?: string | null;
//       iat?: number;
//       exp?: number;
//     }

//     interface Request {
//       user?: UserPayload;
//     }
//   }
// }

// export {};

import "express";

declare global {
  namespace Express {
    interface UserPayload {
      userId: string;
      role: string;
      sessionId?: string;
      orgId?: string | null;
      iat?: number;
      exp?: number;
    }

    interface Request {
      user?: UserPayload;
    }
  }
}

declare module "express-serve-static-core" {
  interface ParamsDictionary {
    [key: string]: string;
  }
}

export {};
