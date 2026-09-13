#!/bin/bash

# 画像を整形・最適化を行うスクリプト
# REQUIRE: ImageMagick (magick)
# Usage: ./optimize.sh READDIR WRITEDIR

set -euo pipefail

# 引数チェック
if [[ $# -ne 2 ]]; then
  echo "Usage: ./optimize.sh READDIR WRITEDIR" >&2
  exit 1
fi

readonly READDIR=$1
readonly WRITEDIR=$2

# ImageMagick がインストールされているかチェック
command -v magick >/dev/null || {
  echo "Error: ImageMagick (magick) is required" >&2
  exit 1
}

# ディレクトリの存在確認
if [[ ! -d "${READDIR}" ]]; then
  echo "Error: ${READDIR} directory does not exist" >&2
  exit 1
fi

# 書き込み用ディレクトリの作成
if [[ ! -d "${WRITEDIR}" ]]; then
  echo "Creating ${WRITEDIR} directory..."
  mkdir -p "${WRITEDIR}" || {
    echo "Error: Failed to create ${WRITEDIR} directory" >&2
    exit 1
  }
fi

# 画像ファイルを配列で取得（nullglob対応）
shopt -s nullglob
image_files=("${READDIR}"/*.{jpeg,jpg,JPEG,JPG,png,PNG})
shopt -u nullglob

# 画像ファイルが存在しない場合
if [[ ${#image_files[@]} -eq 0 ]]; then
  echo "Error: No image files found in ${READDIR} directory" >&2
  exit 1
fi

# ファイルを処理
success_count=0
error_count=0

for read_file in "${image_files[@]}"; do
  # ファイル名を取得（パスを削除）
  filename=$(basename "$read_file")
  # 拡張子を取得
  extension="${filename##*.}"
  # ベース名（拡張子なし）を取得
  base_name="${filename%.*}"

  write_file="${WRITEDIR}/${base_name}.${extension}"

  # 最適化を実行
  echo "Optimizing: ${read_file} → ${write_file}"

  if magick "${read_file}" \
      -resize 1000x \
      -quality 90 \
      "${write_file}"; then
    echo "  ✓ Success"
    ((success_count += 1))
  else
    echo "  ✗ Failed" >&2
    ((error_count += 1))
  fi
done

echo ""
echo "Completed: ${success_count} succeeded, ${error_count} failed"

if [[ ${error_count} -gt 0 ]]; then
  exit 1
fi
