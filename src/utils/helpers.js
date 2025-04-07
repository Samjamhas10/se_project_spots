export function setButtonText({
  btn,
  isLoading,
  defaultText = "Save",
  loadingText = "Saving...",
}) {
  if (isLoading) {
    btn.textContent = loadingText;
    console.log(`Setting Text to ${loadingText}`);
  } else {
    btn.textContent = defaultText;
  }
}
