#!/bin/bash

# 画像を整形・最適化を行うスクリプト
# REQUIRE: magick
# Usage: ./optimize.sh [kind] READDIR WRITEDIR

readonly KIND=$1
readonly READDIR=$2
readonly WRITEDIR=$3

# 今日の日付をyyyymmddの形式で格納
readonly TODAY=$(date +"%Y%m%d")

# もし引数が渡されていなければ終了
if [[ (-z ${KIND} || -z ${READDIR} || -z ${WRITEDIR}) ]]; then
	echo "Usage: ./optimize.sh [hyper-rush|discup-ur] READDIR WRITEDIR"
	exit
fi

# もし引数の最適化の種類がなければ終了
if [[ ("${KIND}" != "hyper-rush" && "${KIND}" != "discup-ur") ]]; then
	echo "Wrong optimize kind: ${KIND}"
	exit
fi

# もし引数の読み取り用のディレクトリがなければ終了
if [ ! -d ${READDIR} ]; then
	echo "${READDIR} directory is not exist"
	exit
fi

# 引数の読み取り用ディレクトリ下の画像ファイルを格納
readonly imagefiles=$(ls "${READDIR}" | grep -E 'jpeg|jpg|JPG|png')

# 引数の読み取り用ディレクトリ下に画像ファイルがなければ終了
readonly firstfiles=($imagefiles)
if [ -z ${firstfiles[0]} ]; then
	echo "No image files to the under ${READDIR} directory"
	exit
fi

# 引数で指定した書き取り用のディレクトリがなければ新規作成
if [ ! -d ${WRITEDIR} ]; then
	echo "create ${WRITEDIR} directory"
	mkdir ${WRITEDIR}
fi

# ハイパーラッシュの画像最適化を行う関数
function optimize_hyperrush() {
	echo "Optimize hyper-rush"

	local count=0
	for img in ${imagefiles[@]}; do
		# 読み取る音声ファイルのパスを定義
		readfile=${READDIR}/${img}
		# カウンターを乗算
		count=$((count + 1))
		# 新しく作成する音声ファイル名を定義
		filename="${WRITEDIR}/${TODAY}_$(printf "%03d" $count).jpeg"
		# 最適化を実行
		echo "Optimize ${readfile} to ${filename}"
		magick ${readfile} -crop 3024x3024+1008+0 ${filename}
		magick ${filename} -resize 512x512 ${filename}
		magick ${filename} -quality 90 ${filename}
	done
}

# ディスクアップURの画像最適化を行う関数
function optimize_discupur() {
	echo "Optimize discup-ur"

	local count=0
	for img in ${imagefiles[@]}; do
		# 読み取る音声ファイルのパスを定義
		readfile=${READDIR}/${img}
		# カウンターを乗算
		count=$((count + 1))
		# 新しく作成する音声ファイル名を定義
		filename="${WRITEDIR}/${TODAY}_$(printf "%03d" $count).jpeg"
		# 最適化を実行
		echo "Optimize ${readfile} to ${filename}"
		magick ${readfile} -crop 3024x3024+0+512 ${filename}
		magick ${filename} -resize 512x512 ${filename}
		magick ${filename} -quality 80 ${filename}
 	done
}

# 画像の最適化を行う
case "${KIND}" in
	'hyper-rush')
		optimize_hyperrush
		;;
	'discup-ur')
		optimize_discupur
		;;
	*)
		echo "Not found optimization"
		exit
		;;
esac

