import "./style.css";

import "./skeleton";

import { onOpenCvReady } from "./skeleton";

// Call onOpenCvReady when the window has finished loading
window.onload = function () {
  onOpenCvReady();
};

document.getElementById("previewBtn").addEventListener("click", function () {
  const codeBoxContainer = document.getElementById("codeBoxContainer");
  const boundingBoxContainer = document.getElementById("boundingBoxContainer");

  // Toggle visibility between code and bounding box containers
  if (codeBoxContainer.classList.contains("hidden")) {
    // Show code container, hide bounding box
    codeBoxContainer.classList.remove("hidden");
    boundingBoxContainer.classList.add("hidden");
  } else {
    // Show bounding box container, hide code
    codeBoxContainer.classList.add("hidden");
    boundingBoxContainer.classList.remove("hidden");
  }
});
