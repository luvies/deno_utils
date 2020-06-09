export interface FsInfoDenoKind {
  isFile: boolean;
  isDirectory: boolean;
  isSymlink: boolean;
}

export type FsKind = "file" | "dir" | "symlink";

export interface FsInfoKind {
  kind: FsKind;
}

export type FsInfo<T extends FsInfoDenoKind> =
  & Omit<T, keyof FsInfoDenoKind>
  & FsInfoKind;

export function infoAdjust<T extends FsInfoDenoKind>(
  info: T,
): FsInfo<T> {
  const { isFile, isDirectory, isSymlink, ...rest } = info;

  let kind: FsKind;
  if (isFile) {
    kind = "file";
  } else if (isDirectory) {
    kind = "dir";
  } else if (isSymlink) {
    kind = "symlink";
  } else {
    throw new Error(`isFile || isDirectory || isSymlink === false`);
  }

  return {
    kind,
    ...rest,
  };
}

export async function tryGetLStat(
  path: string,
): Promise<FsInfo<Deno.FileInfo> | undefined> {
  try {
    return await Deno.lstat(path).then(infoAdjust);
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      return undefined;
    }

    throw err;
  }
}

export function tryGetLStatSync(
  path: string,
): FsInfo<Deno.FileInfo> | undefined {
  try {
    return infoAdjust(Deno.lstatSync(path));
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      return undefined;
    }

    throw err;
  }
}

export async function existsKind(path: string, kind: FsKind): Promise<boolean> {
  const info = await tryGetLStat(path);

  return info?.kind === kind;
}

export function existsKindSync(path: string, kind: FsKind): boolean {
  const info = tryGetLStatSync(path);

  return info?.kind === kind;
}
