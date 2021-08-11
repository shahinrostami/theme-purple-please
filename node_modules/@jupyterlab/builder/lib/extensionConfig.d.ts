import * as webpack from 'webpack';
export interface IOptions {
    packagePath?: string;
    corePath?: string;
    staticUrl?: string;
    mode?: 'development' | 'production';
    devtool?: string;
    watchMode?: boolean;
}
declare function generateConfig({ packagePath, corePath, staticUrl, mode, devtool, watchMode }?: IOptions): webpack.Configuration[];
export default generateConfig;
