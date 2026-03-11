// Simple color options
export const colors = [
  { id: "beige", name: "Beige", hex: "#fcf5e5" },
  { id: "blue", name: "Blue", hex: "#e3f2fd" },
  { id: "green", name: "Green", hex: "#e0f2f1" },
];

// Get current color from storage
export function getSavedColor() {
  return localStorage.getItem("spots_bg_color") || "beige";
}

// Save and apply color
export function applyColor(colorId) {
  const color = colors.find((c) => c.id === colorId);
  if (color) {
    localStorage.setItem("spots_bg_color", colorId);
    document.querySelector(".page").style.backgroundColor = color.hex;
  }
}

// Load color on page load
export function loadSavedColor() {
  const savedColorId = getSavedColor();
  applyColor(savedColorId);
}
