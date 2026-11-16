const picture = document.getElementById("picture");
const imageModal = document.getElementById("image-modal");
const imageModalImage = imageModal.querySelector(".image-modal-image");
const imageModalCaption = imageModal.querySelector(".image-modal-caption");
const imageModalClose = imageModal.querySelector(".image-modal-close");

const jsonPath = "./data.json";
const pictureTitle = "写真一覧";

// モーダルを閉じた後にフォーカスを戻すため、開いたサムネイルを覚えておく
let lastFocusedButton = null;

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
    validatePictures(jsonData);
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
    imageElement.loading = "lazy";
    imageElement.decoding = "async";
    descriptionElement.textContent = picture.description;
    createdAtElement.textContent = "作成日時：" + formatDate(picture.createdAt);
    imageButton.setAttribute(
      "aria-label",
      picture.description || `${formatDate(picture.createdAt)}の写真を拡大`,
    );

    imageButton.appendChild(imageElement);
    imageButton.addEventListener("click", () =>
      openImageModal(picture, imageButton),
    );
    itemElement.appendChild(imageButton);
    itemElement.appendChild(descriptionElement);
    itemElement.appendChild(createdAtElement);

    listElement.appendChild(itemElement);
  });

  areaElement.appendChild(listElement);

  return areaElement;
}

function openImageModal(data, button) {
  lastFocusedButton = button;
  imageModalImage.src = data.path;
  imageModalImage.alt = data.description;
  imageModalCaption.textContent = data.description;
  imageModal.showModal();
  imageModalClose.focus();
}

function closeImageModal() {
  imageModal.close();
}

// 閉じるボタン・ESCキー・背景のクリックのどれで閉じても呼ばれる
imageModal.addEventListener("close", () => {
  imageModalImage.src = "";
  imageModalImage.alt = "";
  imageModalCaption.textContent = "";

  if (lastFocusedButton?.isConnected) {
    lastFocusedButton.focus();
  }
  lastFocusedButton = null;
});

imageModalClose.addEventListener("click", closeImageModal);
imageModal.addEventListener("click", (event) => {
  if (event.target === imageModal) {
    closeImageModal();
  }
});

// 写真データを検証する関数
// 不正なデータがあれば一覧を作らずにエラー表示にするため、例外を投げる
function validatePictures(pictures) {
  if (!Array.isArray(pictures)) {
    throw new Error("写真データが配列ではありません");
  }

  pictures.forEach((picture, index) => {
    const label = `写真データ[${index}]`;

    if (typeof picture !== "object" || picture === null) {
      throw new Error(`${label} がオブジェクトではありません`);
    }
    if (typeof picture.path !== "string" || picture.path === "") {
      throw new Error(`${label} の path が不正です`);
    }
    // json.js は説明文を "" で作るため、空文字は許可する
    if (typeof picture.description !== "string") {
      throw new Error(`${label} の description が不正です`);
    }
    if (!isValidDate(picture.createdAt)) {
      throw new Error(`${label} の createdAt が不正です: ${picture.createdAt}`);
    }
  });
}

// YYYY-MM-DD 形式で、実在する日付か確かめる関数
function isValidDate(value) {
  if (typeof value !== "string") {
    return false;
  }

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return false;
  }

  const [, year, month, day] = match.map(Number);
  // 2026-02-30のような日付は Date が 3月2日に繰り上げるため、組み立て直して比べる
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function formatDate(createdAt) {
  const [year, month, day] = createdAt.split("-");
  return `${year}年${Number(month)}月${Number(day)}日`;
}

createPictureList();
