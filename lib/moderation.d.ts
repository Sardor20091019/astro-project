export declare function moderateImageUrl(url: string): Promise<{
    isSafe: boolean;
    reason: string;
} | {
    isSafe: boolean;
    reason?: undefined;
}>;
