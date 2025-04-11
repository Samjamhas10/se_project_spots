import "./index.css";
import {
  enableValidation,
  settings,
  resetValidation,
  disableButton,
} from "../scripts/validation.js";
import Api from "../utils/Api.js";
import { setButtonText } from "../utils/helpers.js";

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "166c6acc-ad57-4210-878a-b822a32c3faa",
    "Content-Type": "application/json",
  },
});

api
  .getAppInfo()
  .then(([userInfo, cards]) => {
    cards.forEach((item) => {
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

const editModalNameInput = editModal.querySelector("#profile-name-input");
const editModalDescriptionInput = editModal.querySelector(
  "#profile-description-input"
);

// Delete form elements
const deleteModal = document.querySelector("#delete-modal");
const deleteForm = deleteModal.querySelector(".modal__form");
const cancelButton = document.querySelector(".modal__cancel-btn");

// Card form elements
const cardModal = document.querySelector("#add-card-modal");
const cardFormElement = cardModal.querySelector(".modal__form");
const cardSubmitBtn = cardModal.querySelector(".modal__submit-btn");

const cardNameInput = cardModal.querySelector("#add-card-name-input");
const cardLinkInput = cardModal.querySelector("#add-card-link-input");

// Preview image popup elements
const previewModal = document.querySelector("#preview-modal");
const previewModalImageEl = previewModal.querySelector(".modal__image");
const previewModalCaptionEl = previewModal.querySelector(".modal__caption");

// Card related elements
const cardTemplate = document.querySelector("#card-template");
const cardsList = document.querySelector(".cards__list");
const modals = document.querySelectorAll(".modal");

let selectedCard, selectedCardId;

// Avatar form element
const avatarModal = document.querySelector("#avatar-modal");
const avatarFormElement = avatarModal.querySelector(".modal__form");
const avatarInput = avatarModal.querySelector("#profile-avatar-input");

function getCardElement(data) {
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

  if (data.isLiked) {
    cardLikeBtn.classList.add("card__like-btn_liked");
  }

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

cancelButton.addEventListener("click", (evt) => {
  closeModal(deleteModal);
});

function handleDeleteSubmit(evt) {
  evt.preventDefault();
  const deleteButton = evt.submitter;
  setButtonText({
    btn: deleteButton,
    isLoading: true,
    defaultText: "Delete",
    loadingText: "Deleting...",
  });
  api
    .deleteCard(selectedCardId)
    .then(() => {
      selectedCard.remove();
      closeModal(deleteModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText({
        btn: deleteButton,
        isLoading: false,
        defaultText: "Delete",
        loadingText: "Deleting...",
      });
    });
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
  const submitButton = evt.submitter;
  setButtonText({ btn: submitButton, isLoading: true });
  api
    .addCard(inputValues)
    .then((cardData) => {
      renderCard(cardData, "prepend");
      closeModal(cardModal);
      disableButton(cardSubmitBtn, settings);
      cardFormElement.reset();
    })
    .catch(console.error)
    .finally(() => {
      setButtonText({ btn: submitButton, isLoading: false });
    });
}

function handleEditFormSubmit(evt) {
  evt.preventDefault();
  const submitButton = evt.submitter;
  setButtonText({
    btn: submitButton,
    isLoading: true,
    defaultText: "Save",
    loadingText: "Saving...",
  });

  api
    .editUserInfo({
      name: editModalNameInput.value,
      about: editModalDescriptionInput.value,
    })
    .then((data) => {
      profileName.textContent = data.name;
      jobElement.textContent = data.about;
      closeModal(editModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText({
        btn: submitButton,
        isLoading: false,
        defaultText: "Save",
        loadingText: "Saving...",
      });
    });
}

function handleAvatarSubmit(evt) {
  evt.preventDefault();
  const submitButton = evt.submitter;
  setButtonText({
    btn: submitButton,
    isLoading: true,
    defaultText: "Save",
    loadingText: "Saving...",
  });
  api
    .editAvatarInfo(avatarInput.value)
    .then((data) => {
      profileAvatar.src = data.avatar;
      avatarFormElement.reset();
      closeModal(avatarModal);
      disableButton(evt.submitter, settings);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText({
        btn: submitButton,
        isLoading: false,
        defaultText: "Save",
        loadingText: "Saving...",
      });
    });
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
    if (
      evt.target.classList.contains("modal_opened") ||
      evt.target.classList.contains("modal__close-btn")
    ) {
      closeModal(modal);
    }
  });
});

// click the close button on the edit profile modal to close that modal

cardModalButton.addEventListener("click", () => {
  openModal(cardModal);
});

avatarModalButton.addEventListener("click", () => {
  openModal(avatarModal);
});

avatarFormElement.addEventListener("submit", handleAvatarSubmit);
deleteForm.addEventListener("submit", handleDeleteSubmit);

editFormElement.addEventListener("submit", handleEditFormSubmit);
cardFormElement.addEventListener("submit", handleAddCardSubmit);

enableValidation(settings);
