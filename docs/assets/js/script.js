const picture = document.getElementById("picture");
const imageModal = document.getElementById("image-modal");
const imageModalImage = imageModal.querySelector(".image-modal-image");
const imageModalCaption = imageModal.querySelector(".image-modal-caption");
const imageModalClose = imageModal.querySelector(".image-modal-close");

const JsonPath = "./data.json";
const PictureTitle = "写真一覧";

// Json attributes
// {
//  "path": "string",
//  "description": "string",
//  "createdAt": "string",
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

  const pictures = createAlbum(jsonData)

	picture.appendChild(myTitle);
	picture.appendChild(pictures);
}

// 画像のアルバムを生成する関数
// <div class="area">
//   <div class="list">
//     <div class="item">
//       <div class="image">
//         <img />
//       </div>
//       <div class="description">...</div>
//       <div class="created_at">...</div>
//     </div>
//   </div>
// </div>
function createAlbum(data) {
	const myArea = document.createElement("div");
	const myList = document.createElement("div");

	myArea.classList.add("area");
	myList.classList.add("list");
	data.forEach(async (data) => {
		const myItem = document.createElement("div");
		const myItemImgWrap = document.createElement("button");
		const myItemImg = document.createElement("img");
		const myItemDescription = document.createElement("div");
		const myItemCreatedAt = document.createElement("div");

		myItem.classList.add("item");
		myItemImgWrap.classList.add("image");
		myItemImgWrap.classList.add("image-button");
		myItemDescription.classList.add("description");
		myItemCreatedAt.classList.add("created_at");

		myItemImg.src = data.path;
		myItemImg.alt = data.description;
		myItemDescription.textContent = data.description;
		myItemCreatedAt.textContent = "作成日時：" + formatDate(data.createdAt);

		myItemImgWrap.appendChild(myItemImg);
		myItemImgWrap.addEventListener("click", () => openImageModal(data));
		myItem.appendChild(myItemImgWrap);
		myItem.appendChild(myItemDescription);
		myItem.appendChild(myItemCreatedAt);

		myList.appendChild(myItem);
	});

	myArea.appendChild(myList);

	return myArea;
}

function openImageModal(data) {
	imageModalImage.src = data.path;
	imageModalImage.alt = data.description;
	imageModalCaption.textContent = data.description;
	imageModal.showModal();
}

function closeImageModal() {
	imageModal.close();
}

imageModal.addEventListener("close", () => {
	imageModalImage.src = "";
	imageModalImage.alt = "";
	imageModalCaption.textContent = "";
});

imageModalClose.addEventListener("click", closeImageModal);
imageModal.addEventListener("click", (event) => {
	if (event.target === imageModal) {
		closeImageModal();
	}
});

function formatDate(createdAt) {
  const date = new Date(createdAt);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}年${month}月${day}日`;
}



createPictureList();
