#!/usr/bin/env node
const fs = require("fs");
const {
  DynamoDBClient,
} = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  ScanCommand,
  BatchWriteCommand,
} = require("@aws-sdk/lib-dynamodb");

const region = process.env.AWS_REGION || "us-west-2";
const mappingPath = process.env.MAPPING_FILE || "./table-mapping.json";
const dryRun = process.env.DRY_RUN === "1";

const client = new DynamoDBClient({ region });
const ddb = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function scanAll(tableName) {
  const items = [];
  let ExclusiveStartKey;
  do {
    const res = await ddb.send(new ScanCommand({ TableName: tableName, ExclusiveStartKey }));
    if (res.Items) items.push(...res.Items);
    ExclusiveStartKey = res.LastEvaluatedKey;
  } while (ExclusiveStartKey);
  return items;
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function normalizeTagsItem(item) {
  const isCanonicalTag =
    item?.PK === "TAG" &&
    typeof item?.SK === "string" &&
    item.SK.startsWith("TAG#");

  if (!isCanonicalTag) return item;

  const normalized = { ...item };

  if (Array.isArray(normalized.hierarchy_path)) {
    normalized.hierarchy_path = normalized.hierarchy_path
      .filter((segment) => typeof segment === "string")
      .map((segment) => segment.trim())
      .filter(Boolean);
  } else if (typeof normalized.hierarchy_path === "string") {
    const segments = normalized.hierarchy_path
      .split("/")
      .map((segment) => segment.trim())
      .filter(Boolean);
    normalized.hierarchy_path = segments.length
      ? segments
      : normalized.normalized_name
        ? [normalized.normalized_name]
        : [];
  } else {
    normalized.hierarchy_path = normalized.normalized_name
      ? [normalized.normalized_name]
      : [];
  }

  if (!Array.isArray(normalized.aliases)) {
    normalized.aliases = normalized.aliases ? [String(normalized.aliases)] : [];
  }

  return normalized;
}

async function batchWriteWithRetry(tableName, items) {
  const batches = chunk(items, 25);

  for (const batch of batches) {
    let requestItems = {
      [tableName]: batch.map((Item) => ({ PutRequest: { Item } })),
    };

    let attempts = 0;
    while (true) {
      const res = await ddb.send(new BatchWriteCommand({ RequestItems: requestItems }));
      const unprocessed = res.UnprocessedItems?.[tableName] || [];
      if (unprocessed.length === 0) break;

      attempts += 1;
      if (attempts > 10) {
        throw new Error(`Too many retries writing to ${tableName}`);
      }

      requestItems = { [tableName]: unprocessed };
      await sleep(200 * Math.pow(2, attempts));
    }
  }
}

async function countTable(tableName) {
  let total = 0;
  let ExclusiveStartKey;
  do {
    const res = await ddb.send(new ScanCommand({
      TableName: tableName,
      Select: "COUNT",
      ExclusiveStartKey,
    }));
    total += res.Count || 0;
    ExclusiveStartKey = res.LastEvaluatedKey;
  } while (ExclusiveStartKey);
  return total;
}

async function run() {
  const mapping = JSON.parse(fs.readFileSync(mappingPath, "utf-8"));
  if (!Array.isArray(mapping) || mapping.length === 0) {
    throw new Error(`Mapping file ${mappingPath} is empty or invalid`);
  }

  for (const row of mapping) {
    const oldTable = row.OldTable;
    const newTable = row.NewTable;
    const entity = row.Entity || "Unknown";

    if (!oldTable || !newTable) {
      throw new Error(`Invalid mapping row for ${entity}: missing OldTable or NewTable`);
    }
    if (oldTable === newTable) {
      throw new Error(`Invalid mapping row for ${entity}: OldTable and NewTable are the same`);
    }
    if (oldTable.length < 4 || newTable.length < 4) {
      throw new Error(`Invalid mapping row for ${entity}: table names look truncated`);
    }
    if (!oldTable.includes("-dev") || !newTable.includes("-devtwo")) {
      throw new Error(
        `Invalid mapping row for ${entity}: expected dev -> devtwo, got ${oldTable} -> ${newTable}`
      );
    }

    console.log(`\n=== ${entity} ===`);
    console.log(`Old: ${oldTable}`);
    console.log(`New: ${newTable}`);

    const sourceItems = await scanAll(oldTable);
    const items =
      entity === "Tags"
        ? sourceItems.map(normalizeTagsItem)
        : sourceItems;

    console.log(`Read ${items.length} items from ${oldTable}`);

    if (!dryRun && items.length > 0) {
      await batchWriteWithRetry(newTable, items);
      console.log(`Wrote ${items.length} items to ${newTable}`);
    } else {
      console.log(`Dry run or empty table, skipping writes`);
    }

    const oldCount = await countTable(oldTable);
    const newCount = await countTable(newTable);
    console.log(`Count check -> old=${oldCount}, new=${newCount}`);
  }

  console.log("\nMigration complete.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
