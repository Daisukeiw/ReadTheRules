import { test } from "node:test";
import assert from "node:assert/strict";
import { pedacos } from "./embedding.service.js";

test("pedacos respeita o tamanho e não perde texto", () => {
    const texto = ["a".repeat(500), "b".repeat(500), "c".repeat(4000), "d"].join("\n\n");
    const p = pedacos(texto, 1500);
    assert.ok(p.every((x) => x.length <= 1500));
    assert.equal(p.join("").replace(/\s/g, ""), texto.replace(/\s/g, ""));
    assert.deepEqual(pedacos("  "), []);
    assert.deepEqual(pedacos("curto"), ["curto"]);
});
