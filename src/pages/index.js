import "./index.css";
import {
  enableValidation,
  settings,
  resetValidation,
  disableButton,
} from "../scripts/validation.js";
import Api from "../utils/Api.js";

// const initialCards = [
//   {
//     name: "Val Thorens",
//     link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/1-photo-by-moritz-feldmann-from-pexels.jpg",
//   },

//   {
//     name: "Restaurant terrace",
//     link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/2-photo-by-ceiline-from-pexels.jpg",
//   },
//   {
//     name: "An outdoor cafe",
//     link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/3-photo-by-tubanur-dogan-from-pexels.jpg",
//   },
//   {
//     name: "A very long bridge, over the forest and through the trees",
//     link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/4-photo-by-maurice-laschet-from-pexels.jpg",
//   },
//   {
//     name: "Tunnel with morning light",
//     link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/5-photo-by-van-anh-nguyen-from-pexels.jpg",
//   },
//   {
//     name: "Mountain house",
//     link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/6-photo-by-moritz-feldmann-from-pexels.jpg",
//   },
// ];

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "166c6acc-ad57-4210-878a-b822a32c3faa",
    "Content-Type": "application/json",
  },
});

// api
//   .addCard({
//     name,
//     link,
//   })
//   .then((newCard) => {
//     renderCard(newCard);
//   })
//   .catch((err) => console.log("Error adding card:", err));

api
  .getAppInfo()
  .then(([userInfo, cards]) => {
    console.log("Received cards:", cards);
    cards.forEach((item) => {
      console.log("Processing card:", item);
      renderCard(item, "append");
    });

    profileAvatar.src = userInfo.avatar;
    profileName.textContent = userInfo.name;
    jobElement.textContent = userInfo.about;
  })
  .catch(console.error);

// Profile elements
const profileEditButton = document.querySelector(".profile__edit-btn");
const cardModalButton = document.querySelector(".profile__add-btn");
const avatarModalButton = document.querySelector(".profile__avatar-btn");
const profileName = document.querySelector(".profile__name");
const jobElement = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__avatar");

// Edit form elements
const editModal = document.querySelector("#edit-modal");
const editFormElement = editModal.querySelector(".modal__form");
const editModalCloseBtn = editModal.querySelector(".modal__close-btn");
const editModalNameInput = editModal.querySelector("#profile-name-input");
const editModalDescriptionInput = editModal.querySelector(
  "#profile-description-input"
);

// Delete form elements
const deleteModal = document.querySelector("#delete-modal");
const deleteForm = deleteModal.querySelector(".modal__form");

// Card form elements
const cardModal = document.querySelector("#add-card-modal");
const cardFormElement = cardModal.querySelector(".modal__form");
const cardSubmitBtn = cardModal.querySelector(".modal__submit-btn");
const cardModalCloseBtn = cardModal.querySelector(".modal__close-btn");
const cardNameInput = cardModal.querySelector("#add-card-name-input");
const cardLinkInput = cardModal.querySelector("#add-card-link-input");

// Preview image popup elements
const previewModal = document.querySelector("#preview-modal");
const previewModalImageEl = previewModal.querySelector(".modal__image");
const previewModalCaptionEl = previewModal.querySelector(".modal__caption");
const modalCloseTypePreview = previewModal.querySelector(
  ".modal__close-btn_type_preview"
);

// Card related elements
const cardTemplate = document.querySelector("#card-template");
const cardsList = document.querySelector(".cards__list");
console.log("Cards list element:", cardsList);
const modals = document.querySelectorAll(".modal");

let selectedCard, selectedCardId;

// Avatar form element
const avatarModal = document.querySelector("#avatar-modal");
const avatarFormElement = avatarModal.querySelector(".modal__form");
const avatarSubmitBtn = avatarModal.querySelector(".modal__submit-btn");
const avatarModalCloseBtn = avatarModal.querySelector(".modal__close-btn");
const avatarInput = avatarModal.querySelector("#profile-avatar-input");

modalCloseTypePreview.addEventListener("click", () => {
  closeModal(previewModal);
});

// Load initial cards when page loads
// api
//   .getInitialCards()
//   .then((cards) => {
//     console.log("Cards received:", cards);
//     cards.forEach((data) => {
//       renderCard(data);
//     });
//   })
//   .catch(console.error);

function getCardElement(data) {
  console.log("Getting card element for:", data);
  const cardElement = cardTemplate.content
    .querySelector(".card")
    .cloneNode(true);

  const cardNameEl = cardElement.querySelector(".card__title");
  cardNameEl.textContent = data.name;

  const cardImageEl = cardElement.querySelector(".card__image");
  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;

  const cardLikeBtn = cardElement.querySelector(".card__like-btn");
  const deleteButton = cardElement.querySelector(".card__delete-btn");

  function handleLike(evt, cardId) {
    evt.preventDefault();
    const likeButton = evt.target;
    likeButton.disabled = true;
    const isLiked = likeButton.classList.contains("card__like-btn_liked");

    api
      .changeLikeStatus(cardId, isLiked)
      .then((res) => {
        likeButton.classList.toggle("card__like-btn_liked");
      })
      .catch((err) => {
        console.error("Error:", err);
      })
      .finally(() => {
        likeButton.disabled = false;
      });
  }

  cardLikeBtn.addEventListener("click", (evt) => {
    handleLike(evt, data._id);
  });

  cardImageEl.addEventListener("click", () => {
    openModal(previewModal);
    previewModalImageEl.src = data.link;
    previewModalImageEl.alt = data.name;
    previewModalCaptionEl.textContent = data.name;
  });

  deleteButton.addEventListener("click", (evt) => {
    handleDeleteCard(cardElement, data._id);
  });

  return cardElement;
}

function handleDeleteSubmit(evt) {
  evt.preventDefault();
  api
    .deleteCard(selectedCardId)
    .then(() => {
      selectedCard.remove();
      closeModal(deleteModal);
    })
    .catch(console.error);
}

function handleDeleteCard(cardElement, cardId) {
  selectedCard = cardElement;
  selectedCardId = cardId;
  openModal(deleteModal);
}

function handlePressEsc(evt) {
  if (evt.key === "Escape") {
    const modal = document.querySelector(".modal_opened");
    if (modal) {
      closeModal(modal);
    }
  }
}

function openModal(modal) {
  document.addEventListener("keydown", handlePressEsc);
  modal.classList.add("modal_opened");
}

function closeModal(modal) {
  document.removeEventListener("keydown", handlePressEsc);
  modal.classList.remove("modal_opened");
}

function renderCard(cardData, placement = "prepend") {
  console.log(`Rendering card: ${cardData.name} with placement: ${placement}`);

  const cardElement = getCardElement(cardData);
  if (placement === "append") {
    cardsList.append(cardElement);
  } else {
    cardsList.prepend(cardElement);
  }
}

function handleAddCardSubmit(evt) {
  evt.preventDefault();
  const inputValues = { name: cardNameInput.value, link: cardLinkInput.value };
  api
    .addCard(inputValues)
    .then((cardData) => {
      renderCard(cardData, "prepend");
      closeModal(cardModal);
      disableButton(cardSubmitBtn, settings);
      cardFormElement.reset();
    })
    .catch(console.error);
}

function handleEditFormSubmit(evt) {
  evt.preventDefault();
  api
    .editUserInfo({
      name: editModalNameInput.value,
      about: editModalDescriptionInput.value,
    })
    .then((data) => {
      console.log("User data received:", data);
      profileName.textContent = data.name;
      jobElement.textContent = data.about;
      closeModal(editModal);
    })
    .catch(console.error);
}

// TODO - finish avatar submission handler
function handleAvatarSubmit(evt) {
  evt.preventDefault();
  console.log(avatarInput.value);
  api
    .editAvatarInfo(avatarInput.value)
    .then((data) => {
      profileAvatar.src = data.avatar;
      avatarFormElement.reset();
      closeModal(avatarModal);
    })
    .catch(console.error);
}

profileEditButton.addEventListener("click", () => {
  editModalNameInput.value = profileName.textContent;
  editModalDescriptionInput.value = jobElement.textContent;
  openModal(editModal);
  resetValidation(
    editFormElement,
    [editModalNameInput, editModalDescriptionInput],
    settings
  );
});

// close modal overlay
modals.forEach((modal) => {
  modal.addEventListener("click", (evt) => {
    if (evt.target.classList.contains("modal_opened")) {
      closeModal(modal);
    }
  });
});

// click the close button on the edit profile modal to close that modal
editModalCloseBtn.addEventListener("click", () => {
  closeModal(editModal);
});

cardModalButton.addEventListener("click", () => {
  openModal(cardModal);
});

avatarModalButton.addEventListener("click", () => {
  openModal(avatarModal);
});

avatarFormElement.addEventListener("submit", handleAvatarSubmit);
deleteForm.addEventListener("submit", handleDeleteSubmit);

cardModalCloseBtn.addEventListener("click", () => {
  closeModal(cardModal);
});

avatarModalCloseBtn.addEventListener("click", () => {
  closeModal(avatarModal);
});

editFormElement.addEventListener("submit", handleEditFormSubmit);
cardFormElement.addEventListener("submit", handleAddCardSubmit);

enableValidation(settings);
