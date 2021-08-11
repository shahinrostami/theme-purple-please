export interface Elf {
  body: {
    programs: ElfProgram[];
    sections: ElfSection[];
  };
}

export interface ElfProgram {
  type: string;
  offset: number;
  vaddr: number;
  filesz: number;
  flags: {
    w?: boolean;
  };
  data: Buffer;
}

export interface ElfSection {
  name: string;
  addr: number;
  off: number;
  size: number;
  data: Buffer;
}

export type ReadPtrFunc = (Buffer) => number;

export interface PackageVersionTable {
  [key: string]: string;
}

export type GoPackage = string;

export interface GoVersionsResult {
  mod: string;
  version: string;
}

export interface GoModulesResult {
  goVersion: string;
  name: string;
  modules: {
    [key: string]: string;
  };
}
