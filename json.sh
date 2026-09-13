#!/bin/bash

# 画像のデータを格納したJSONファイルを作成する
# REQUIRE: jq
# Usage: ./json.sh READDIR WRITEFILE
# JSON structure
# [
#   {
#     "path": "",
#     "description": "",
#     "createdAt": ""
#   }
# ]

set -euo pipefail

# 引数チェック
if [[ $# -ne 2 ]]; then
  echo "Usage: ./json.sh READDIR WRITEFILE" >&2
  exit 1
fi

readonly READDIR=$1
readonly WRITEFILE=$2

# jqコマンドがインストールされているかチェック
command -v jq >/dev/null || {
  echo "jq is required" >&2
  exit 1
}

# ディレクトリの存在確認
if [[ ! -d "${READDIR}" ]]; then
  echo "Error: ${READDIR} directory does not exist" >&2
  exit 1
fi

# ファイルの存在確認
if [[ ! -f "${WRITEFILE}" ]]; then
  echo "Error: ${WRITEFILE} is not a file" >&2
  exit 1
fi

# 画像ファイルを配列で取得（nullglob対応）
shopt -s nullglob
image_files=("${READDIR}"/*.{jpeg,JPEG,jpg,JPG,png,PNG})
shopt -u nullglob

# 画像ファイルが存在しない場合
if [[ ${#image_files[@]} -eq 0 ]]; then
  echo "Error: No image files found in ${READDIR} directory" >&2
  exit 1
fi

tmpfile=$(mktemp "${WRITEFILE}.tmp.XXXXXX")
trap 'rm -f "${tmpfile}"' EXIT

# JSONデータを作成
json_data='[]'
valid_count=0
for image_file in "${image_files[@]}"; do
  # ファイル名から日付を取得
  filename=$(basename "$image_file")
  date_part="${filename:0:8}"

  # YYYYMMDD形式を確認（オプション）
  if [[ ! ${date_part} =~ ^[0-9]{8}$ ]]; then
    echo "Warning: ${filename} does not match YYYYMMDD format" >&2
    continue
  fi

  # YYYY-MM-DD形式に変換
  formatted_date="${date_part:0:4}-${date_part:4:2}-${date_part:6:2}"

  json_data=$(jq \
    --arg path "${image_file}" \
    --arg created_at "${formatted_date}" \
    '. + [{path: $path, description: "", createdAt: $created_at}]' \
    <<<"${json_data}")
  ((valid_count += 1))
done

if [[ ${valid_count} -eq 0 ]]; then
  echo "Error: No images with a valid YYYYMMDD filename found" >&2
  exit 1
fi

if ! jq --argjson items "${json_data}" '. + $items' "${WRITEFILE}" >"${tmpfile}"; then
  echo "Error: Failed to update JSON file" >&2
  exit 1
fi

mv "${tmpfile}" "${WRITEFILE}"
trap - EXIT
echo "Successfully updated ${WRITEFILE}" >&2
