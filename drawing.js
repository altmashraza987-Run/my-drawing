
const canvas = document.getElementById("drawingCanvas");
const ctx = canvas.getContext("2d");

const frame = document.getElementById("canvasFrame");
const emptyHint = document.getElementById("emptyHint");
const colorPicker = document.getElementById("colorPicker");
const brushSize = document.getElementById("brushSize");
const sizeValue = document.getElementById("sizeValue");

const pencilBtn = document.getElementById("pencilBtn");
const eraserBtn = document.getElementById("eraserBtn");
const undoBtn = document.getElementById("undoBtn");
const clearBtn = document.getElementById("clearBtn");
const saveBtn = document.getElementById("saveBtn");

let drawing = false;
let tool = "pencil";
let hasDrawing = false;
let lastX = 0;
let lastY = 0;
let history = [];
let savedSnapshot = null;

let canvasWidth = 0;
let canvasHeight = 0;
let pixelRatio = 1;

function setupCanvas() {
  const rect = frame.getBoundingClientRect();

  if (rect.width <= 0 || rect.height <= 0) return;

  const oldWidth = canvasWidth;
  const oldHeight = canvasHeight;

  let oldImage = null;

  if (oldWidth > 0 && oldHeight > 0) {
    const temp = document.createElement("canvas");
    temp.width = oldWidth;
    temp.height = oldHeight;

    temp.getContext("2d").drawImage(
      canvas, 0, 0, oldWidth, oldHeight
    );

    oldImage = temp;
  }

  canvasWidth = rect.width;
  canvasHeight = rect.height;
  pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = Math.round(canvasWidth * pixelRatio);
  canvas.height = Math.round(canvasHeight * pixelRatio);

  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  if (oldImage) {
    ctx.drawImage(
      oldImage, 0, 0, oldWidth, oldHeight,
      0, 0, canvasWidth, canvasHeight
    );
  }
}

function saveHistory() {
  history.push(canvas.toDataURL("image/png"));

  if (history.length > 30) {
    history.shift();
  }
}

function restoreImage(dataURL) {
  const img = new Image();

  img.onload = function () {
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
    updateHint();
  };

  img.src = dataURL;
}

function updateHint() {
  emptyHint.classList.toggle("hidden", hasDrawing);
}

function getPosition(event) {
  const rect = canvas.getBoundingClientRect();

  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
}

function startDrawing(event) {
  if (event.button !== undefined && event.button !== 0) return;

  event.preventDefault();

  drawing = true;

  const pos = getPosition(event);
  lastX = pos.x;
  lastY = pos.y;

  saveHistory();

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(lastX + 0.01, lastY + 0.01);
  ctx.strokeStyle = tool === "eraser" ? "#ffffff" : colorPicker.value;
  ctx.lineWidth = Number(brushSize.value);
  ctx.stroke();

  hasDrawing = true;
  updateHint();

  canvas.setPointerCapture(event.pointerId);
}

function draw(event) {
  if (!drawing) return;

  event.preventDefault();

  const pos = getPosition(event);

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(pos.x, pos.y);

  ctx.strokeStyle = tool === "eraser" ? "#ffffff" : colorPicker.value;
  ctx.lineWidth = Number(brushSize.value);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();

  lastX = pos.x;
  lastY = pos.y;
}

function stopDrawing() {
  drawing = false;
  ctx.beginPath();
}

function setTool(selectedTool) {
  tool = selectedTool;

  pencilBtn.classList.toggle("active", tool === "pencil");
  eraserBtn.classList.toggle("active", tool === "eraser");

  canvas.style.cursor = tool === "eraser" ? "cell" : "crosshair";
}

pencilBtn.addEventListener("click", function () {
  setTool("pencil");
});

eraserBtn.addEventListener("click", function () {
  setTool("eraser");
});

brushSize.addEventListener("input", function () {
  sizeValue.textContent = brushSize.value + " px";
});

document.querySelectorAll(".swatch").forEach(function (swatch) {
  swatch.addEventListener("click", function () {
    colorPicker.value = swatch.dataset.color;
    setTool("pencil");

    document.querySelectorAll(".swatch").forEach(function (item) {
      item.classList.remove("selected");
    });

    swatch.classList.add("selected");
  });
});

colorPicker.addEventListener("input", function () {
  setTool("pencil");

  document.querySelectorAll(".swatch").forEach(function (item) {
    item.classList.toggle(
      "selected",
      item.dataset.color.toLowerCase() === colorPicker.value.toLowerCase()
    );
  });
});

undoBtn.addEventListener("click", function () {
  if (history.length === 0) return;

  const previousImage = history.pop();

  restoreImage(previousImage);
  hasDrawing = history.length > 0;
  updateHint();
});

clearBtn.addEventListener("click", function () {
  if (!confirm("Are you sure you want to clear your drawing?")) {
    return;
  }

  saveHistory();

  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  hasDrawing = false;
  updateHint();
});

saveBtn.addEventListener("click", function () {
  const exportCanvas = document.createElement("canvas");

  exportCanvas.width = canvas.width;
  exportCanvas.height = canvas.height;

  const exportCtx = exportCanvas.getContext("2d");

  exportCtx.fillStyle = "#ffffff";
  exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
  exportCtx.drawImage(canvas, 0, 0);

  const link = document.createElement("a");
  link.download = "my-drawing.png";
  link.href = exportCanvas.toDataURL("image/png");
  link.click();
});

canvas.addEventListener("pointerdown", startDrawing);
canvas.addEventListener("pointermove", draw);
canvas.addEventListener("pointerup", stopDrawing);
canvas.addEventListener("pointercancel", stopDrawing);
canvas.addEventListener("lostpointercapture", stopDrawing);

window.addEventListener("resize", setupCanvas);

setupCanvas();
