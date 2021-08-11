import { getBinjumper } from './binjumper';
export { getBinjumper };
declare type JumperOptions = {
    /**
     * The name of the jumper
     * @example 'node'
     */
    name: string;
    /**
     * The location the jumper should be saved in
     */
    dir: string;
    /**
     * The path to the executable the jumper should launch
     * @example 'C:/node/node.exe'
     */
    target: string;
    /**
     * Arguments the jumper should always launch the target with
     */
    args?: string[];
};
export declare function makeBinjumper(opts: JumperOptions): Promise<void>;
export declare function makeBinjumperSync(opts: JumperOptions): void;
