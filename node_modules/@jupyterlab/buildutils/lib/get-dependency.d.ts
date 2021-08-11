#!/usr/bin/env node
/**
 * Get the appropriate dependency for a given package name.
 *
 * @param name - The name of the package.
 *
 * @returns The dependency version specifier.
 */
export declare function getDependency(name: string): Promise<string>;
