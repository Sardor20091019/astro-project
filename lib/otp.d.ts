export declare function generateAndSendOtp(email: string, ip: string): Promise<void>;
export declare function verifyOtp(email: string, inputToken: string): Promise<{
    success: boolean;
}>;
