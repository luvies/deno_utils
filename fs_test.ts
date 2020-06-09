import {
  existsKind,
  existsKindSync,
  infoAdjust,
  tryGetLStat,
  tryGetLStatSync,
} from "./fs.ts";
import { assert, assertEquals } from "./test_deps.ts";

Deno.test({
  name: "infoAdjust",
  async fn() {
    const info = await Deno.lstat("fs.ts");

    assert(info.isFile);
    assert(!info.isDirectory);
    assert(!info.isSymlink);

    const adj = infoAdjust(info);

    assertEquals(adj.kind, "file");

    const { isFile: _, isDirectory: __, isSymlink: ___, ...restInfo } = info;
    const { kind: ____, ...restAdj } = adj;

    assertEquals(restInfo, restAdj);

    const dir = await Deno.lstat(".vscode").then(infoAdjust);

    assertEquals(dir.kind, "dir");
  },
});

Deno.test({
  name: "tryGetLStat",
  async fn() {
    const fs_ts = await tryGetLStat("fs.ts");
    assert(typeof fs_ts !== "undefined");
    assertEquals(fs_ts.kind, "file");

    const vscode = await tryGetLStat(".vscode");
    assert(typeof vscode !== "undefined");
    assertEquals(vscode.kind, "dir");

    const missing = await tryGetLStat("missing.ext");
    assert(typeof missing === "undefined");
  },
});

Deno.test({
  name: "tryGetLStatSync",
  fn() {
    const fs_ts = tryGetLStatSync("fs.ts");
    assert(typeof fs_ts !== "undefined");
    assertEquals(fs_ts.kind, "file");

    const vscode = tryGetLStatSync(".vscode");
    assert(typeof vscode !== "undefined");
    assertEquals(vscode.kind, "dir");

    const missing = tryGetLStatSync("missing.ext");
    assert(typeof missing === "undefined");
  },
});

Deno.test({
  name: "existsKind",
  async fn() {
    assert(await existsKind("fs.ts", "file"));
    assert(!(await existsKind("fs.ts", "dir")));
    assert(!(await existsKind("fs.ts", "symlink")));

    assert(!(await existsKind(".vscode", "file")));
    assert(await existsKind(".vscode", "dir"));
    assert(!(await existsKind(".vscode", "symlink")));

    assert(!(await existsKind("missing.ext", "file")));
    assert(!(await existsKind("missing.ext", "dir")));
    assert(!(await existsKind("missing.ext", "symlink")));
  },
});

Deno.test({
  name: "existsKindSync",
  fn() {
    assert(existsKindSync("fs.ts", "file"));
    assert(!existsKindSync("fs.ts", "dir"));
    assert(!existsKindSync("fs.ts", "symlink"));

    assert(!existsKindSync(".vscode", "file"));
    assert(existsKindSync(".vscode", "dir"));
    assert(!existsKindSync(".vscode", "symlink"));

    assert(!existsKindSync("missing.ext", "file"));
    assert(!existsKindSync("missing.ext", "dir"));
    assert(!existsKindSync("missing.ext", "symlink"));
  },
});
