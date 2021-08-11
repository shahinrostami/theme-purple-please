export declare function actionAllowed(action: string, options: {
    org?: string;
}): Promise<{
    allowed: boolean;
    reason: string;
}>;
