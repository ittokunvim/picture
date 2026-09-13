const picture = document.getElementById("picture");
const imageModal = document.getElementById("image-modal");
const imageModalImage = imageModal.querySelector(".image-modal-image");
const imageModalCaption = imageModal.querySelector(".image-modal-caption");
const imageModalClose = imageModal.querySelector(".image-modal-close");

const jsonPath = "./data.json";
const pictureTitle = "写真一覧";

// JSON attributes
// {
//  "path": "string",
//  "description": "string",
//  "createdAt": "string",
// }

// JSONファイルを読み取り、データを出力する関数
async function fetchJson() {
	const response = await fetch(jsonPath, { cache: "no-store" });
	if (!response.ok) {
		throw new Error(`写真データの取得に失敗しました (${response.status})`);
	}
	return response.json();
}

// 写真のリストを生成する関数
// <div>
//   <h2>...</h2>
//   ...
// </div>
async function createPictureList() {
	const titleElement = document.createElement("h2");
	titleElement.textContent = pictureTitle;
	picture.appendChild(titleElement);

	try {
		const jsonData = await fetchJson();
		picture.appendChild(createAlbum(jsonData));
	} catch (error) {
		console.error(error);
		const errorMessage = document.createElement("p");
		errorMessage.textContent = "写真を読み込めませんでした。";
		picture.appendChild(errorMessage);
	}
}

// 画像のアルバムを生成する関数
// <div class="area">
//   <div class="list">
//     <div class="item">
//       <div class="image">
//         <img />
//       </div>
//       <div class="description">...</div>
//   <div class="created-at">...</div>
//     </div>
//   </div>
// </div>
function createAlbum(pictures) {
	const areaElement = document.createElement("div");
	const listElement = document.createElement("div");

	areaElement.classList.add("area");
	listElement.classList.add("list");
	pictures.forEach((picture) => {
		const itemElement = document.createElement("div");
		const imageButton = document.createElement("button");
		const imageElement = document.createElement("img");
		const descriptionElement = document.createElement("div");
		const createdAtElement = document.createElement("div");

		itemElement.classList.add("item");
		imageButton.classList.add("image");
		imageButton.classList.add("image-button");
		descriptionElement.classList.add("description");
		createdAtElement.classList.add("created-at");

		imageElement.src = picture.path;
		imageElement.alt = picture.description;
		descriptionElement.textContent = picture.description;
		createdAtElement.textContent =
			"作成日時：" + formatDate(picture.createdAt);

		imageButton.appendChild(imageElement);
		imageButton.addEventListener("click", () => openImageModal(picture));
		itemElement.appendChild(imageButton);
		itemElement.appendChild(descriptionElement);
		itemElement.appendChild(createdAtElement);

		listElement.appendChild(itemElement);
	});

	areaElement.appendChild(listElement);

	return areaElement;
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
	const [year, month, day] = createdAt.split("-");
	return `${year}年${Number(month)}月${Number(day)}日`;
}

createPictureList();
