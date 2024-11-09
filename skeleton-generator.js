// Callback to confirm OpenCV is ready
function onOpenCvReady() {
  document.getElementById("status").innerHTML = "OpenCV.js is ready!";
  document.getElementById("imageUpload").addEventListener("change", handleImageUpload);
}

// Function to handle image upload
function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) {
    console.error("No file selected!");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      processImage(img);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Function to process image using OpenCV
function processImage(img) {
  const canvas = document.getElementById("canvasOutput");
  const ctx = canvas.getContext("2d");
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  // Load image into OpenCV matrix
  const src = cv.imread(canvas);
  const gray = new cv.Mat();
  const blurred = new cv.Mat();
  const thresh = new cv.Mat();
  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();

  try {
    // Convert to grayscale
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

    // Apply Gaussian blur to reduce noise
    cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);

    // Apply adaptive threshold to create a binary image
    cv.adaptiveThreshold(
      blurred,
      thresh,
      255,
      cv.ADAPTIVE_THRESH_GAUSSIAN_C,
      cv.THRESH_BINARY_INV,
      11,
      2
    );

    // Find contours
    cv.findContours(
      thresh,
      contours,
      hierarchy,
      cv.RETR_EXTERNAL,
      cv.CHAIN_APPROX_SIMPLE
    );

    // Create a new MatVector to store only the large contours
    const filteredContours = new cv.MatVector();

    // Filter out large contours (e.g., the container) based on size
    for (let i = 0; i < contours.size(); i++) {
      const contour = contours.get(i);
      const area = cv.contourArea(contour);

      // Get the bounding rectangle for the contour
      const rect = cv.boundingRect(contour);

      // Ignore contours that are too small or too large (like the entire container)
      if (
        area > 500 &&
        rect.height > 30 &&
        rect.width > 30 &&
        rect.width < img.width * 0.9 &&
        rect.height < img.height * 0.9
      ) {
        filteredContours.push_back(contour);
      }
    }

    // Create an array to store the bounding box data
    const boundingBoxes = [];

    // Draw the filtered contours and collect bounding box data
    for (let i = 0; i < filteredContours.size(); i++) {
      const contour = filteredContours.get(i);
      const color = new cv.Scalar(255, 0, 0, 255); // Red color for contours
      cv.drawContours(src, filteredContours, i, color, 2, cv.LINE_8, hierarchy, 0);

      // Get the bounding rectangle for the contour
      const rect = cv.boundingRect(contour);

      // Push bounding box data (x, y, width, height) to the array
      boundingBoxes.push({
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height
      });
    }

    // Display the result on the canvas
    cv.imshow("canvasOutput", src);
    console.log("Contours drawn:", filteredContours.size());
    console.log("Bounding boxes:", boundingBoxes);

    // Generate divs based on bounding boxes and append to the document
    generateBoundingBoxDivs(boundingBoxes, 10);
  } catch (err) {
    console.error("Error processing image:", err);
  } finally {
    // Cleanup
    src.delete();
    gray.delete();
    blurred.delete();
    thresh.delete();
    contours.delete();
    filteredContours.delete(); // Don't forget to delete the filtered contours
    hierarchy.delete();
  }
}

function generateBoundingBoxDivs(boundingBoxes, radius) {
  const container = document.getElementById("boundingBoxContainer");
  container.innerHTML = ""; // Clear any existing divs

  container.style.height = "100vh;";
  container.style.display = "block";

  boundingBoxes.forEach((box) => {
    const div = document.createElement("div");

    // Set the size, position, and appearance of the div
    div.style.width = `${box.width}px`;
    div.style.height = `${box.height}px`;
    div.style.borderRadius = `${radius}px`;
    div.style.backgroundColor = "rgba(255, 0, 0, 0.5)";

    // Position the div based on the bounding box coordinates
    div.style.position = "absolute";
    div.style.left = `${box.x}px`; // Position relative to the left of the container
    div.style.top = `${box.y}px`; // Position relative to the top of the container

    container.appendChild(div);
  });
}
