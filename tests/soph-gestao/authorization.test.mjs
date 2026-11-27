// Run: npm install --no-save --package-lock=false @electric-sql/pglite@0.3.15
// Then: node --test tests/soph-gestao/authorization.test.mjs
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { after, before, test } from "node:test";
import { PGlite } from "@electric-sql/pglite";

const ownerA = "11111111-1111-1111-1111-111111111111";
const ownerB = "22222222-2222-2222-2222-222222222222";
const companyA = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const companyB = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
const missingCompany = "cccccccc-cccc-cccc-cccc-cccccccccccc";
const records = "erp_fixture.records";
const companies = "erp_fixture_private.companies";
const benefits = "erp_fixture_private.benefits";

let db;

before(async () => {
  // No network client, connection string, or persistent database directory.
  db = new PGlite();
  await db.exec(await readFile(new URL("./fixtures/authorization.sql", import.meta.url), "utf8"));
});

after(async () => {
  await db?.close();
});

async function asOwner(tx, owner) {
  await tx.exec("set local role authenticated");
  await tx.query("select set_config('request.jwt.claim.sub', $1, true)", [owner]);
}

// Each scenario starts from the fixture and discards any changes.
const rollback = new Error("fixture rollback");
async function scenario(run) {
  await assert.rejects(db.transaction(async (tx) => {
    await run(tx);
    throw rollback;
  }), (error) => error === rollback);
}

for (const [owner, ownCompany, otherCompany, ownId, otherId] of [
  [ownerA, companyA, companyB, 1, 2],
  [ownerB, companyB, companyA, 2, 1],
]) {
  test(`owner of record ${ownId} can read, insert, and update only her company`, () => scenario(async (tx) => {
    await asOwner(tx, owner);
    assert.deepEqual((await tx.query(`select id from ${records}`)).rows, [{ id: ownId }]);
    assert.equal((await tx.query(`update ${records} set body = 'updated' where id = $1`, [ownId])).affectedRows, 1);
    assert.equal((await tx.query(`insert into ${records} values ($1, 3, $2, 'new row')`, [ownCompany, ownId])).affectedRows, 1);
    for (const target of [otherCompany, missingCompany]) {
      assert.deepEqual((await tx.query(`select id from ${records} where company_id = $1`, [target])).rows, []);
    }
    assert.equal((await tx.query(`update ${records} set body = 'denied' where id = $1`, [otherId])).affectedRows, 0);
    await tx.exec("reset role");
    assert.deepEqual((await tx.query(`select body from ${records} where id = $1`, [otherId])).rows, [
      { body: otherId === 1 ? "record a" : "record b" },
    ]);
  }));

  test(`owner of record ${ownId} cannot insert into the other company`, async () => {
    await assert.rejects(db.transaction(async (tx) => {
      await asOwner(tx, owner);
      await tx.query(`insert into ${records} values ($1, 3, null, 'denied')`, [otherCompany]);
    }), { code: "42501" });
    assert.deepEqual((await db.query(`select id from ${records} order by id`)).rows, [{ id: 1 }, { id: 2 }]);
  });
}

test("anon has no direct access", async () => {
  await assert.rejects(db.transaction(async (tx) => {
    await tx.exec("set local role anon");
    await tx.query(`select * from ${records}`);
  }), { code: "42501" });
});

test("missing identity, unsupported ownership, or forged plan never grants access", () => scenario(async (tx) => {
  await tx.exec("set local role authenticated");
  await tx.query("select set_config('request.jwt.claim.sub', '', true)");
  assert.deepEqual((await tx.query(`select id from ${records}`)).rows, []);
  await asOwner(tx, "33333333-3333-3333-3333-333333333333");
  await tx.query("select set_config('request.jwt.claims', $1, true)", [
    JSON.stringify({ plan: "premium", hasErpAccess: true, isAdmin: true }),
  ]);
  assert.deepEqual((await tx.query(`select id from ${records}`)).rows, []);
}));

for (const [label, setup] of [
  ["no benefit", `delete from ${benefits} where user_id = $1`],
  ["wrong product", `update ${benefits} set product = 'premium' where user_id = $1`],
  ["future benefit", `update ${benefits} set starts_at = now() + interval '1 hour' where user_id = $1`],
  ["revoked benefit", `update ${benefits} set revoked_at = now() where user_id = $1`],
  ["exact expiry", `update ${benefits} set expires_at = now() where user_id = $1`],
  ["past expiry", `update ${benefits} set expires_at = now() - interval '1 second' where user_id = $1`],
  ["inactive company", `update ${companies} set active = false where owner_user_id = $1`],
]) {
  test(`denies a previously authorized identity after ${label}`, () => scenario(async (tx) => {
    await asOwner(tx, ownerA);
    assert.deepEqual((await tx.query(`select id from ${records}`)).rows, [{ id: 1 }]);
    await tx.exec("reset role");
    await tx.query(setup, [ownerA]);
    await asOwner(tx, ownerA);
    assert.deepEqual((await tx.query(`select id from ${records}`)).rows, []);
    assert.equal((await tx.query(`update ${records} set body = 'denied' where id = 1`)).affectedRows, 0);
    await tx.exec("reset role");
    assert.deepEqual((await tx.query(`select body from ${records} where id = 1`)).rows, [{ body: "record a" }]);
  }));
}

test("permits access one microsecond before expiry", () => scenario(async (tx) => {
  await tx.query(`update ${benefits} set expires_at = now() + interval '1 microsecond' where user_id = $1`, [ownerA]);
  await asOwner(tx, ownerA);
  assert.deepEqual((await tx.query(`select id from ${records}`)).rows, [{ id: 1 }]);
}));

test("authenticated users cannot change company ownership or move records", async () => {
  for (const [sql, value] of [
    [`update ${companies} set owner_user_id = $1`, ownerA],
    [`update ${records} set company_id = $1 where id = 1`, companyB],
  ]) {
    await assert.rejects(db.transaction(async (tx) => {
      await asOwner(tx, ownerA);
      await tx.query(sql, [value]);
    }), { code: "42501" });
  }
  assert.deepEqual((await db.query(`select company_id from ${records} where id = 1`)).rows, [{ company_id: companyA }]);
});

test("same-company references succeed and cross-company references fail", async () => {
  await scenario(async (tx) => {
    await asOwner(tx, ownerA);
    assert.equal((await tx.query(`insert into ${records} values ($1, 3, 1, 'valid')`, [companyA])).affectedRows, 1);
  });
  await assert.rejects(db.transaction(async (tx) => {
    await asOwner(tx, ownerA);
    await tx.query(`insert into ${records} values ($1, 3, 2, 'denied')`, [companyA]);
  }), { code: "23503" });
  assert.deepEqual((await db.query(`select id from ${records} where id = 3`)).rows, []);
});

test("only one owner slot exists per company", async () => {
  await assert.rejects(db.query(
    `insert into ${companies} (id, owner_user_id) values ($1, $2)`, [companyA, ownerB],
  ), { code: "23505" });
  assert.deepEqual((await db.query(`select owner_user_id from ${companies} where id = $1`, [companyA])).rows, [
    { owner_user_id: ownerA },
  ]);
});

test("a malformed gateway identity fails closed", async () => {
  await assert.rejects(db.transaction(async (tx) => {
    await asOwner(tx, "invalid-subject");
    await tx.query(`select id from ${records}`);
  }), { code: "22P02" });
});

test("an owner cannot manufacture or extend an ERP benefit via the data role", async () => {
  await assert.rejects(db.transaction(async (tx) => {
    await asOwner(tx, ownerA);
    await tx.query(`update ${benefits} set expires_at = now() + interval '1 year' where user_id = $1`, [ownerA]);
  }), { code: "42501" });
});
