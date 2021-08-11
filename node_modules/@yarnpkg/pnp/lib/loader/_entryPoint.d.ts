import { NativePath } from '@yarnpkg/fslib';
import { PnpApi } from '../types';
import { MakeApiOptions } from './makeApi';
declare const defaultApi: PnpApi & {
    /**
     * Can be used to generate a different API than the default one (for example
     * to map it on `/` rather than the local directory path, or to use a
     * different FS layer than the default one).
     */
    makeApi: ({ basePath, fakeFs, pnpapiResolution, ...rest }: Partial<MakeApiOptions> & {
        basePath?: NativePath | undefined;
    }) => PnpApi;
    /**
     * Will inject the specified API into the environment, monkey-patching FS. Is
     * automatically called when the hook is loaded through `--require`.
     */
    setup: (api?: PnpApi | undefined) => void;
};
export default defaultApi;
