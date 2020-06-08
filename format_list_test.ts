import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { formatList } from "./format_list.ts";

Deno.test({
  name: "should leave the string untouched when given an empty list",
  fn() {
    assertEquals(formatList("test string", []), "test string");
    assertEquals(formatList("foo bar", ["baz", "faz"]), "foo bar");
    assertEquals(formatList("", ["a", "b"]), "");
  },
});

Deno.test({
  name: "should not change a string if the tags don't match up",
  fn() {
    assertEquals(formatList("foo $2 bar", ["faz"]), "foo $2 bar");
    assertEquals(formatList("foo $1 bar", []), "foo $1 bar");
    assertEquals(formatList("foo $1 $3 bar", ["faz", "baz"]), "foo baz $3 bar");
    assertEquals(formatList("foo $5 bar", ["faz"]), "foo $5 bar");
  },
});

Deno.test(
  {
    name: "should replace all tags that have a relevant list index",
    fn() {
      assertEquals(formatList("foo $0 baz", ["bar"]), "foo bar baz");
      assertEquals(formatList("foo $1 baz", ["bar", "faz"]), "foo faz baz");
      assertEquals(
        formatList("foo $0 baz $1", ["bar", "faz"]),
        "foo bar baz faz",
      );
      assertEquals(
        formatList("f$0o $1 b$2z", ["o", "bar", "a"]),
        "foo bar baz",
      );
    },
  },
);

Deno.test({
  name: "should properly handle index offset options",
  fn() {
    assertEquals(
      formatList("foo $1 bar", ["baz"], { indexStart: 1 }),
      "foo $1 bar",
    );
    assertEquals(
      formatList("foo $1 bar", ["baz"], { indexStart: 2 }),
      "foo $1 bar",
    );
    assertEquals(
      formatList("foo $1 bar", ["baz"], { indexStart: 3 }),
      "foo $1 bar",
    );
    assertEquals(
      formatList("foo $1 bar", ["baz"], { indexStart: 4 }),
      "foo $1 bar",
    );
  },
});

Deno.test({
  name: "should properly handle tag offset options",
  fn() {
    assertEquals(
      formatList("foo $1 baz", ["bar"], { tagStart: 1 }),
      "foo bar baz",
    );
    assertEquals(
      formatList("foo $2 baz", ["bar"], { tagStart: 2 }),
      "foo bar baz",
    );
    assertEquals(
      formatList("foo $3 baz", ["bar"], { tagStart: 3 }),
      "foo bar baz",
    );
    assertEquals(
      formatList("foo $4 baz", ["bar"], { tagStart: 4 }),
      "foo bar baz",
    );
  },
});

Deno.test(
  {
    name: "should properly handle mixed tag and index offset options",
    fn() {
      assertEquals(
        formatList(
          "foo $0 baz",
          [undefined, "bar"] as any,
          { tagStart: 0, indexStart: 1 },
        ),
        "foo bar baz",
      );
      assertEquals(
        formatList(
          "foo $3 baz",
          [undefined, "faz", "bar", "baz"] as any,
          { tagStart: 3, indexStart: 2 },
        ),
        "foo bar baz",
      );
      assertEquals(
        formatList(
          "foo $2 baz",
          [undefined, undefined, undefined, "bar"] as any,
          { tagStart: 2, indexStart: 3 },
        ),
        "foo bar baz",
      );
      assertEquals(
        formatList("foo $4 baz", ["bar"], { tagStart: 4, indexStart: 4 }),
        "foo $4 baz",
      );
      assertEquals(
        formatList("foo $4 baz", ["bar"], { tagStart: 5, indexStart: 4 }),
        "foo $4 baz",
      );
      assertEquals(
        formatList(
          "foo $2 baz",
          [undefined, undefined, undefined, undefined, undefined, "bar"] as any,
          { tagStart: 1, indexStart: 4 },
        ),
        "foo bar baz",
      );
      assertEquals(
        formatList(
          "foo $6 baz",
          [undefined, undefined, undefined, "bar"] as any,
          { tagStart: 4, indexStart: 1 },
        ),
        "foo bar baz",
      );
    },
  },
);

Deno.test({
  name: "should handle custom tag prefixes",
  fn() {
    assertEquals(
      formatList("foo &0 baz", ["bar"], { tagStr: "&" }),
      "foo bar baz",
    );
    assertEquals(
      formatList("foo $0 baz", ["bar"], { tagStr: "&" }),
      "foo $0 baz",
    );
    assertEquals(
      formatList("foo ^0 baz", ["bar"], { tagStr: "^" }),
      "foo bar baz",
    );
    assertEquals(
      formatList("foo £0 baz", ["bar"], { tagStr: "£" }),
      "foo bar baz",
    );
  },
});

Deno.test({
  name: "should work for regex results",
  fn() {
    let match: RegExpMatchArray = "foo bar baz".match(/(b..) (b..)/)!;
    assertEquals(
      formatList("group 1: $1, group 2: $2", match),
      "group 1: bar, group 2: baz",
    );
    match = "foo bar baz".match(/(b..)+/g)!;
    assertEquals(
      formatList("group 1: $0, group 2: $1", match),
      "group 1: bar, group 2: baz",
    );
  },
});
