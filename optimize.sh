#!/bin/bash

# 画像を整形・最適化を行うスクリプト
# REQUIRE: ImageMagick (magick)
# Usage: ./optimize.sh READDIR WRITEDIR

set -euo pipefail

readonly READDIR=$1
readonly WRITEDIR=$2

# ImageMagick がインストールされているかチェック
command -v magick >/dev/null || {
  echo "Error: ImageMagick (magick) is required" >&2
  exit 1
}

# 引数チェック
if [[ -z "${READDIR}" || -z "${WRITEDIR}" ]]; then
  echo "Usage: ./optimize.sh READDIR WRITEDIR" >&2
  exit 1
fi

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
imagefiles=("${READDIR}"/*.{jpeg,jpg,JPEG,JPG,png,PNG})
shopt -u nullglob

# 画像ファイルが存在しない場合
if [[ ${#imagefiles[@]} -eq 0 ]]; then
  echo "Error: No image files found in ${READDIR} directory" >&2
  exit 1
fi

# ファイルを処理
success_count=0
error_count=0

for readfile in "${imagefiles[@]}"; do
  # ファイル名を取得（パスを削除）
  filename=$(basename "$readfile")
  # 拡張子を取得
  extension="${filename##*.}"
  # ベース名（拡張子なし）を取得
  basename="${filename%.*}"
  
  writefile="${WRITEDIR}/${basename}.${extension}"
  
  # 最適化を実行
  echo "Optimizing: ${readfile} → ${writefile}"
  
  if magick "${readfile}" \
      -resize 1000x \
      -quality 90 \
      "${writefile}"; then
    echo "  ✓ Success"
    ((success_count++))
  else
    echo "  ✗ Failed" >&2
    ((error_count++))
  fi
done

echo ""
echo "Completed: ${success_count} succeeded, ${error_count} failed"

if [[ ${error_count} -gt 0 ]]; then
  exit 1
fi
