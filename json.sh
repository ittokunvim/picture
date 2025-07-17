#!/bin/bash

# 画像のデータを格納したJSONファイルを作成する
# REQUIRE: jq
# Usage: ./json.sh ALBUM READDIR WRITEFILE

readonly ALBUM=$1
readonly READDIR=$2
readonly WRITEFILE=$3


# もし引数が渡されていなければ終了
if [[ (-z ${ALBUM} || -z ${READDIR}) || -z ${WRITEFILE} ]]; then
	echo "Usage: ./json.sh ALBUM READDIR WRITEFILE"
	exit
fi

# もしアルバムの引数がなければ終了
if [[ ("${ALBUM}" != "hyper-rush" && "${ALBUM}" != "discup-ur") ]]; then
	echo "Wrong kind: ${ALBUM}"
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

# JSONファイルに追加する要素の文字列を定義
json="["

function set_hyperrush_json() {
	for img in ${imagefiles[@]}; do
		# 読み取る画像ファイルのパスを定義
		readfile=${READDIR}/${img}
		# JSONを定義
		data="{\"path\":\"${readfile}\",\"bonus\":\"HB\",\"flag\":\"E\",\"album\":\"hyper-rush\"},"
		# JSONに値を追加
		json="${json}${data}"
	done
	# JSONの最後の要素のコンマを削除し、鉤括弧を閉める
	json="${json/%?/}]";
}

function set_discupur_json() {
	for img in ${imagefiles[@]}; do
		# 読み取る画像ファイルのパスを定義
		readfile=${READDIR}/${img}
		# JSONを定義
		data="{\"path\":\"${readfile}\",\"bonus\":\"BB\",\"flag\":\"\",\"album\":\"discup-ur\"},"
		# JSONに値を追加
		json="${json}${data}"
	done
	# JSONの最後の要素のコンマを削除し、鉤括弧を閉める
	json="${json/%?/}]";
}

case "${ALBUM}" in
	'hyper-rush')
		set_hyperrush_json
		;;
	'discup-ur')
		set_discupur_json
		;;
	*)
		echo "${ALBUM} is not found"
		exit
		;;
esac

# jq '. += [{"path":"","bonus":"BB","flag":"","album":"discup-ur"}]' data.json > tmp.json && mv tmp.json data.json

# もし引数のJSONがファイルでなければ終了
if [ ! -f ${WRITEFILE} ]; then
	echo "${WRITEFILE} is not file"
	exit
fi

jq --argjson add "${json}" '. += [$add]' ${WRITEFILE} > tmp.json
mv tmp.json ${WRITEFILE}
