export declare const MIN_VERSION_FOR_MKDIR_RECURSIVE = "10.12.0";
/**
 * Attempts to create a directory and fails quietly if it cannot. Rather than throwing errors it logs them to stderr and returns false.
 * It will attempt to recursively nested direcotry (ex `mkdir -p` style) if it needs to but will fail to do so with Node < 10 LTS.
 * @param newDirectoryFullPath the full path to a directory to create
 * @returns true if either the directory already exists or it is successful in creating one or false if it fails to create it.
 */
export declare function createDirectory(newDirectoryFullPath: string): boolean;
/**
 * Write the given contents to a file.
 * If any errors are thrown in the process they are caught, logged, and discarded.
 * @param jsonOutputFile the path of the file you want to write.
 * @param contents the contents you want to write.
 */
export declare function writeContentsToFileSwallowingErrors(jsonOutputFile: string, contents: string): Promise<void>;
export declare function saveJsonToFileCreatingDirectoryIfRequired(jsonOutputFile: string, contents: string): Promise<void>;
