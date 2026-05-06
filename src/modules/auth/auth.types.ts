export type AccessTokenPayload = {
    id: string;
    orgId: string;
    role: string;
};

export type RefreshTokenPayload = {
    userId: string;
};

export type LoginDTO = {
    email: string;
    password: string;
};