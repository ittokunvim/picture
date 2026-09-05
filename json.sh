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

readonly READDIR=$1
readonly WRITEFILE=$2

# jqコマンドがインストールされているかチェック
command -v jq >/dev/null || {
  echo "jq is required" >&2
  exit 1
}

# 引数チェック
if [[ -z "${READDIR}" || -z "${WRITEFILE}" ]]; then
  echo "Usage: ./json.sh READDIR WRITEFILE" >&2
  exit 1
fi

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
imagefiles=("${READDIR}"/*.{jpeg,jpg,JPG,png})
shopt -u nullglob

# 画像ファイルが存在しない場合
if [[ ${#imagefiles[@]} -eq 0 ]]; then
  echo "Error: No image files found in ${READDIR} directory" >&2
  exit 1
fi

# JSONデータを作成
json_data="["

for f in "${imagefiles[@]}"; do
  # ファイル名から日付を取得
  filename=$(basename "$f")
  date_part="${filename:0:8}"
  
  # YYYYMMDD形式を確認（オプション）
  if [[ ! ${date_part} =~ ^[0-9]{8}$ ]]; then
    echo "Warning: ${filename} does not match YYYYMMDD format" >&2
    continue
  fi
  
  # YYYY-MM-DD形式に変換
  formatted_date="${date_part:0:4}-${date_part:4:2}-${date_part:6:2}"
  
  # JSON要素を追加
  json_data+="{\"path\":\"${f}\",\"description\":\"\",\"createdAt\":\"${formatted_date}\"},"
done

# 末尾のカンマを削除
json_data="${json_data%,}]"

# jqでJSONファイルに追加
if ! jq --argjson items "$(jq -n "${json_data}" | jq -c '.[]')" \
    '.[] | . as $item | empty' "${WRITEFILE}" 2>/dev/null; then
  # パイプで複数の要素を追加
  jq ". += ${json_data}" "${WRITEFILE}" > tmp.json || {
    echo "Error: Failed to update JSON file" >&2
    exit 1
  }
  mv tmp.json "${WRITEFILE}"
else
  echo "Successfully updated ${WRITEFILE}" >&2
fi

