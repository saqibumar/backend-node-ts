export interface Authenticator {
    login(user?: any): Promise<any>;
    signOut(): Promise<any>;
    refreshAccessToken(): Promise<any>;
    verifyToken(token: any): boolean;
    getUserAttributes(): Promise<any>;
    setTokens({ accessToken, idToken, refreshToken }): void;
}
