import {
  Elf,
  ElfProgram,
  GoModulesResult,
  GoVersionsResult,
  ReadPtrFunc,
} from "./types";

/**
 * Create same output as `go version -m binary-file` does
 * @param binary
 */
export function extractModulesFromBinary(binary: Elf): GoModulesResult {
  const { version: goVersion, mod } = findVers(binary);
  const { name, modules } = prepareGoDependencies(mod);

  return { goVersion, name, modules };
}

/**
 * Normalize versions to align with `snyk-go-parser`
 * @param mod
 */
function prepareGoDependencies(
  mod: string,
): Omit<GoModulesResult, "goVersion"> {
  if (!mod) {
    return { name: "", modules: {} };
  }

  const [, mainModuleLine, ...versionsLines] = mod.split("\n");
  const [, name] = mainModuleLine.split("\t");
  const modules = versionsLines.reduce((accum, curr) => {
    // Skip If for some reason after splitting there is a empty line
    if (!curr) {
      return accum;
    }

    const [, name, ver] = curr.split("\t");
    // Versions in Go have trailing 'v'
    let version = ver.substring(1);
    // In versions with hash, we only care about hash
    // v0.0.0-20200905004654-be1d3432aa8f => #be1d3432aa8f
    version = version.includes("-")
      ? `#${version.substring(version.lastIndexOf("-") + 1)}`
      : version;

    accum[name] = version;
    return accum;
  }, {});

  return { name, modules };
}

// Source
// https://github.com/golang/go/blob/46f99ce7ea97d11b0a1a079da8dda0f51df2a2d2/src/cmd/go/internal/version/version.go#L146
/**
 * Function finds and returns the Go version and
 * module version information in the executable binary
 * @param binary
 */
function findVers(binary: Elf): GoVersionsResult {
  const result = {
    version: "",
    mod: "",
  };

  const text = dataStart(binary);
  let data = readData(binary.body.programs, text, 64 * 1024) || Buffer.from([]);

  for (
    ;
    !data.toString("binary").startsWith("\xff Go buildinf:");
    data = data.slice(32)
  ) {
    if (data.length < 32) {
      return result;
    }
  }

  const ptrSize = data[14];
  const bigEndian = data[15] !== 0;

  let readPtr: ReadPtrFunc;
  if (ptrSize === 4) {
    if (bigEndian) {
      readPtr = (buffer) => buffer.readInt32BE(0);
    } else {
      readPtr = (buffer) => buffer.readInt32LE(0);
    }
  } else {
    if (bigEndian) {
      readPtr = (buffer) => Number(buffer.readBigInt64BE());
    } else {
      readPtr = (buffer) => Number(buffer.readBigInt64LE());
    }
  }

  // The build info blob left by the linker is identified by
  // a 16-byte header, consisting of buildInfoMagic (14 bytes),
  // the binary's pointer size (1 byte),
  // and whether the binary is big endian (1 byte).
  // Now we attempt to read info after metadata.
  // From 16th byte to 16th + ptrSize there is a header that points
  // to go version
  const version: string = readString(
    binary,
    ptrSize,
    readPtr,
    readPtr(data.slice(16, 16 + ptrSize)),
  );

  if (version === "") {
    return result;
  }

  result.version = version;

  // Go version header was right after metadata.
  // Modules header right after go version
  // Read next `ptrSize` bytes, this point to the
  // place where modules info is stored
  const mod: string = readString(
    binary,
    ptrSize,
    readPtr,
    readPtr(data.slice(16 + ptrSize, 16 + 2 * ptrSize)),
  );

  // This verifies that what we got are actually go modules
  // First 16 bytes are unicodes as last 16
  // Mirrors go version source code
  if (mod.length >= 33 && mod[mod.length - 17] === "\n") {
    result.mod = mod.slice(16, mod.length - 16);
  } else {
    result.mod = "";
  }

  return result;
}

// Source
// https://github.com/golang/go/blob/46f99ce7ea97d11b0a1a079da8dda0f51df2a2d2/src/cmd/go/internal/version/exe.go#L105
/**
 * Find start of section that contains module version data
 * @param binary
 */
function dataStart(binary: Elf): number {
  for (const section of binary.body.sections) {
    if (section.name === ".go.buildinfo") {
      return section.addr;
    }
  }

  for (const program of binary.body.programs) {
    if (program.type === "load" && program.flags.w === true) {
      return program.vaddr;
    }
  }

  return 0;
}

// Source
// https://github.com/golang/go/blob/46f99ce7ea97d11b0a1a079da8dda0f51df2a2d2/src/cmd/go/internal/version/exe.go#L87
/**
 * Read at most `size` of bytes from `program` that contains byte at `addr`
 * @param programs
 * @param addr
 * @param size
 */
function readData(
  programs: ElfProgram[],
  addr: number,
  size: number,
): Buffer | undefined {
  for (const program of programs) {
    const vaddr = program.vaddr;
    const filesz = program.filesz;
    if (vaddr <= addr && addr <= vaddr + filesz - 1) {
      let n = vaddr + filesz - addr;

      if (n > size) {
        n = size;
      }

      const from = addr - vaddr; // offset from the beginning of the program

      return program.data.slice(from, from + n);
    }
  }

  return undefined;
}

// Source
// https://github.com/golang/go/blob/46f99ce7ea97d11b0a1a079da8dda0f51df2a2d2/src/cmd/go/internal/version/version.go#L189
/**
 * Function returns the string at address addr in the executable x
 * @param binaryFile
 * @param ptrSize
 * @param readPtr
 * @param addr
 */
function readString(
  binaryFile: Elf,
  ptrSize: number,
  readPtr: ReadPtrFunc,
  addr: number,
): string {
  const hdr = readData(binaryFile.body.programs, addr, 2 * ptrSize);
  if (!hdr || hdr.length < 2 * ptrSize) {
    return "";
  }

  const dataAddr = readPtr(hdr);
  const dataLen = readPtr(hdr.slice(ptrSize));

  const data = readData(binaryFile.body.programs, dataAddr, dataLen);

  if (!data || data.length < dataLen) {
    return "";
  }

  return data.toString("binary");
}
