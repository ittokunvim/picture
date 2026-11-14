#!/usr/bin/env node

// 画像のデータを格納したJSONファイルを作成する
// Usage: node json.mjs SOURCE_DIR [OUTPUT_FILE]
// ※ ESMのため拡張子は .mjs にするか、package.json に "type": "module" を指定する

import fs from "node:fs";
import path from "node:path";

const IMAGE_EXTENSIONS = new Set([".jpeg", ".jpg", ".png"]);
// docs/ をWebルートとした画像ディレクトリの相対パス
const IMAGE_PREFIX = "assets/images/";

const args = process.argv.slice(2);
const sourceDir = args[0];
const outputFile = args[1];

function showHelp() {
  console.log("Usage: node json.mjs SOURCE_DIR [OUTPUT_FILE]");
  console.log("");
  console.log("Description:");
  console.log(
    "  Scans a directory for (jpeg|jpg|png) files and generates a JSON file",
  );
  console.log("  If the output file already exists, new data will be appended");
  console.log("");
  console.log("Arguments:");
  console.log("  SOURCE_DIR   - Directory containing image files");
  console.log("  OUTPUT_FILE  - Output JSON file (optional)");
  console.log("                 If omitted, output to stdout");
  console.log("");
  console.log("Examples:");
  console.log("  node json.mjs /path/to/images");
  console.log("  node json.mjs /path/to/images output.json");
  console.log("  ./json.mjs /path/to/images docs/data.json");
}

// 今日の日付をローカル時間で YYYY-MM-DD にする
function today() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

// ヘルプ表示
if (args.includes("-h") || args.includes("--help")) {
  showHelp();
  process.exit(0);
}

// 引数のチェック
if (!sourceDir) {
  showHelp();
  process.exit(1);
}

// ディレクトリが存在するかチェック
if (!fs.existsSync(sourceDir)) {
  console.error(`Error: The directory '${sourceDir}' does not exist`);
  process.exit(1);
}

// ディレクトリであるかチェック
if (!fs.statSync(sourceDir).isDirectory()) {
  console.error(`Error: '${sourceDir}' is not a directory`);
  process.exit(1);
}

// 画像ファイルを読み込む(ディレクトリは除外)
let imageFiles = [];
try {
  imageFiles = fs
    .readdirSync(sourceDir, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isFile() &&
        IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase()),
    )
    .map((entry) => entry.name)
    .sort();
} catch (error) {
  console.error(`Error reading directory: ${error.message}`);
  process.exit(1);
}

// 画像ファイルが存在するかチェック
if (imageFiles.length === 0) {
  console.error(`Error: No image files found in the directory '${sourceDir}'`);
  process.exit(1);
}

// 標準出力はJSON専用にするため、進捗は標準エラー出力へ出す
console.error(`Found ${imageFiles.length} image file(s)`);

// 新しいJSONを生成
const createdAt = today();
const newJson = imageFiles.map((file) => ({
  path: `${IMAGE_PREFIX}${file}`,
  description: "",
  createdAt,
}));

// もし出力先の指定がなければ標準出力を行う
if (!outputFile) {
  console.log(JSON.stringify(newJson, null, 2));
  process.exit(0);
}

let jsonData = newJson;

// 既存のJSONファイルがあるかチェック
if (fs.existsSync(outputFile)) {
  try {
    const existingJson = JSON.parse(fs.readFileSync(outputFile, "utf8"));

    if (!Array.isArray(existingJson)) {
      console.error(
        `Error: Existing file '${outputFile}' must contain a JSON array`,
      );
      process.exit(1);
    }

    const existingPaths = new Set(
      existingJson.map((item) => item?.path).filter(Boolean),
    );
    const uniqueNewData = newJson.filter(
      (item) => !existingPaths.has(item.path),
    );

    jsonData = [...existingJson, ...uniqueNewData];
    console.error(`Loaded existing JSON with ${existingJson.length} item(s)`);
    console.error(`Adding ${uniqueNewData.length} new item(s)`);
    console.error(
      `(${newJson.length - uniqueNewData.length} duplicate(s) skipped)`,
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error(
        `Error: Existing file '${outputFile}' contains invalid JSON: ${error.message}`,
      );
      process.exit(1);
    }

    throw error;
  }
} else {
  console.error(`Creating new JSON file: '${outputFile}'`);
}

// ファイルに書き込む
try {
  fs.writeFileSync(
    outputFile,
    JSON.stringify(jsonData, null, 2) + "\n",
    "utf8",
  );
  console.error(
    `✓ Successfully wrote ${jsonData.length} item(s) to '${outputFile}'`,
  );
} catch (error) {
  console.error(`Error writing to file: ${error.message}`);
  process.exit(1);
}
