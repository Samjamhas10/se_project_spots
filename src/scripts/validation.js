export const settings = {
  formSelector: ".modal__form_validate",
  inputSelector: ".modal__input",
  submitButtonSelector: ".modal__submit-btn",
  inactiveButtonClass: "modal__submit-btn_disabled",
  inputErrorClass: "modal__input_type_error",
  errorClass: "modal__error_visible",
};

// Show input error
const showInputError = (formEl, inputEl, errorMsg, config) => {
  const errorElementId = `#${inputEl.id}-error`;
  const errorMsgEl = formEl.querySelector(errorElementId);
  inputEl.classList.add(config.inputErrorClass);
  errorMsgEl.textContent = errorMsg;
  errorMsgEl.classList.add(config.errorClass);
};

// Hide input error
const hideInputError = (formEl, inputEl, config) => {
  const errorMsgEl = formEl.querySelector(`#${inputEl.id}-error`);
  inputEl.classList.remove(config.inputErrorClass);
  errorMsgEl.classList.remove(config.errorClass);
  errorMsgEl.textContent = "";
};

// Check validity of input
const checkInputValidity = (formEl, inputEl, config) => {
  if (!inputEl.validity.valid) {
    showInputError(formEl, inputEl, inputEl.validationMessage, config);
  } else {
    hideInputError(formEl, inputEl, config);
  }
};

// Check if any input is valid
const hasInvalidInput = (inputList) => {
  return inputList.some((input) => {
    return !input.validity.valid;
  });
};

// Toggle state button (enable/disable)
const toggleButtonState = (inputList, buttonEl, config) => {
  if (hasInvalidInput(inputList)) {
    disableButton(buttonEl, config);
  } else {
    buttonEl.disabled = false;
    buttonEl.classList.remove(config.inactiveButtonClass);
  }
};

// add resetValidation
export const resetValidation = (formEl, inputEl, config) => {
  inputEl.forEach((input) => {
    hideInputError(formEl, input, config);
  });
};

// Disable submit button
export const disableButton = (buttonEl, config) => {
  buttonEl.disabled = true;
  buttonEl.classList.add(config.inactiveButtonClass);
};

// Add event listeners to inputs
const setEventListeners = (formEl, config) => {
  const inputList = Array.from(formEl.querySelectorAll(config.inputSelector));
  const buttonElement = formEl.querySelector(config.submitButtonSelector);

  toggleButtonState(inputList, buttonElement, config);

  inputList.forEach((inputElement) => {
    inputElement.addEventListener("input", function () {
      checkInputValidity(formEl, inputElement, config);
      toggleButtonState(inputList, buttonElement, config);
    });
  });
};

export const enableValidation = (config) => {
  const formList = document.querySelectorAll(config.formSelector);
  formList.forEach((formEl) => {
    setEventListeners(formEl, config);
  });
};
