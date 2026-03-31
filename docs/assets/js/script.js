const picture = document.getElementById("picture");

const JsonPath = "./data.json";
const PictureTitle = "写真一覧";

// Json attributes
// {
//  "path": "string",
//  "bonus": "string"
//  "flag": "string",
//  "album": "string",
// }

// JSONファイルを読み取り、データを出力する関数
async function fetchJson() {
	try {
		const response = await fetch(JsonPath, { cache: "no-store" });
		const data = await response.json();
		return data;
	} catch (error) {
		console.error(error);
	}
}

// 写真のリストを生成する関数
// <div>
//   <h2>...</h2>
//   ...
// </div>
async function createPictureList() {
	const jsonData = await fetchJson();
	const myTitle = document.createElement("h2");

	myTitle.textContent = PictureTitle;

	const hyperRushTitle = "ハイパーラッシュ";
	const hyperRushData = jsonData.filter((data) => data.album === "hyper-rush");
	const discupURTitle = "ディスクアップUR";
	const discupURData = jsonData.filter((data) => data.album === "discup-ur");
	const hyperRushAlbum = createAlbum(hyperRushTitle, hyperRushData);
	const discupURAlbum = createAlbum(discupURTitle, discupURData);

	picture.appendChild(myTitle);
	picture.appendChild(hyperRushAlbum);
	picture.appendChild(discupURAlbum);
}

// 画像のアルバムを生成する関数
// <div class="area">
//   <div class="list">
//     <div class="item">
//       <div class="image">
//         <img />
//       </div>
//       <div class="bonus">...</div>
//       <div class="flag">...</div>
//     </div>
//   </div>
// </div>
function createAlbum(title, data) {
	const myArea = document.createElement("div");
	const myTitle = document.createElement("h3");
	const myList = document.createElement("div");

	myArea.classList.add("area");
	myList.classList.add("list");
	myTitle.textContent = title;
	data.forEach(async (data) => {
		const myItem = document.createElement("div");
		const myItemImgWrap = document.createElement("div");
		const myItemImg = document.createElement("img");
		const myItemBonus = document.createElement("div");
		const myItemFlag = document.createElement("div");

		myItem.classList.add("item");
		myItemImgWrap.classList.add("image");
		myItemBonus.classList.add("bonus");
		myItemFlag.classList.add("flag");

		myItemImg.src = data.path;
		myItemBonus.textContent = "ボーナス: " + data.bonus;
		myItemFlag.textContent = "フラグ: " + data.flag;

		myItemImgWrap.appendChild(myItemImg);
		myItem.appendChild(myItemImgWrap);
		myItem.appendChild(myItemBonus);
		myItem.appendChild(myItemFlag);

		myList.appendChild(myItem);
	});

	myArea.appendChild(myTitle);
	myArea.appendChild(myList);

	return myArea;
}

createPictureList();
