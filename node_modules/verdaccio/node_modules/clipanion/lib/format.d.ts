export interface ColorFormat {
    header(str: string): string;
    bold(str: string): string;
    error(str: string): string;
    code(str: string): string;
}
export declare const richFormat: ColorFormat;
export declare const textFormat: ColorFormat;
export declare function formatMarkdownish(text: string, { format, paragraphs }: {
    format: ColorFormat;
    paragraphs: boolean;
}): string;
