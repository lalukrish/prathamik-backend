export type AccessTokenPayload = {
    userId: string;
    role?: string;
};

export type RefreshTokenPayload = {
    userId: string;
};

export type LoginDTO = {
    email: string;
    password: string;
};