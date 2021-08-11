import * as gemfile from './gemfile';
import { Files } from './try-get-spec';
export interface Spec {
    packageName: string;
    targetFile: string;
    files: Files;
}
export declare const inspectors: (typeof gemfile)[];
