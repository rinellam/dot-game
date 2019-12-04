
// Init game canvas
const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 116;
var ctx = canvas.getContext("2d");

// Listen for clicks on game canvas
canvas.addEventListener("click", isHit, false);

// Listen clicks on play/pause button
const btn = document.getElementById("toggle");
btn.addEventListener("click", toggle, false);

// Set bubble falling speed from slider input
const slider = document.getElementById("speed");
let bubbleSpeed = slider.value;
slider.addEventListener("change", function(e) {
  bubbleSpeed = e.target.value;
});

// Init score and counter
let score = 0;
const scoreCounter = document.getElementById("score");
scoreCounter.innerText = score;

// Init vars
let playing = false;
let bubbleArray = new Array();

// Clear canvas and re-render
function setup() {
  var grd = ctx.createLinearGradient(0, 0, 0, canvas.height / 2);
  grd.addColorStop(0, "#bffff3");
  grd.addColorStop(1, "#004cbf");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Draw a bubble
function drawBubble(bubble) {
  const bubblePath = new Path2D();
  const radius = bubble.d / 2;
  bubblePath.arc(bubble.x, bubble.y, radius, 0, 2 * Math.PI);
  ctx.fillStyle = bubble.bonus ? "yellow" : "white";
  ctx.fill(bubblePath);
  bubble.path = bubblePath;
}

// Update the position of a bubble
// If it is offscreen remove it
// else apply gravity.
function updateBubblePos(bubble) {
  if (bubble.y > canvas.height) {
    bubbleArray = bubbleArray.filter(item => bubble.id !== item.id);
  } else {
    // This is the reason FPS is calculated.
    // To determine how many px to animate
    // per RaF call.
    bubble.y = bubble.y + bubbleSpeed / fps;
    // Rare bonus bubbles move diagonally
    if (bubble.bonus) {
      bubble.x = bubble.x + bubble.direction * (bubbleSpeed / 50);
    }
  }
}

// Create a new bubble
let bubbleId = 1;
function createNewBubble() {
  let newBubble = new Object();
  newBubble.id = bubbleId;
  bubbleId++;
  // Create rare and valuable "bonus" bubbles
  if (Math.random() > .95) {
    newBubble.d = 20;
    newBubble.value = 50; // High value because of difficulty
    newBubble.bonus = true;
    newBubble.direction = Math.round(Math.random()) * 2 - 1; // Randomize left/right drift
  } else {
    newBubble.d = Math.round(Math.random() * 10) * 10;
    newBubble.value = 11 - newBubble.d / 10;
  }
  const num = Math.floor(Math.random() * canvas.width);
  if (num < newBubble.d) {
    newBubble.x = newBubble.d + 10;
  } else if (num > canvas.width - newBubble.d) {
    newBubble.x = canvas.width - newBubble.d + 10;
  } else {
    newBubble.x = num;
  }
  newBubble.y = 0 - (newBubble.d / 2);
  bubbleArray.push(newBubble);
}

// Hit detection 
function isHit(e) {
  if (playing) {
    // Contextualize event cords to canvas
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.x;
    const clickY = e.clientY - rect.y;
    // Check if bubble is hit using native
    // isPointInPath method.
    bubbleArray.forEach(function(bubble) {
      if (ctx.isPointInPath(bubble.path, clickX, clickY)) {
        bubbleArray = bubbleArray.filter(item => bubble.id !== item.id);
        updateScore(bubble.value);
      }
    });
  }
}

// Update the score
function updateScore(bubbleValue) {
  score = score + bubbleValue;
  scoreCounter.innerText = score;
}

// FPS options and vars
const decimalPlaces = 2;
const updateEachSecond = 0.1;
const decimalPlacesRatio = Math.pow(10, decimalPlaces);
let timeMeasurements = [];
let fps = 0;

// Game loop
function game() {
  // FPS Timer
  timeMeasurements.push(performance.now());
  const msPassed = timeMeasurements[timeMeasurements.length - 1] - timeMeasurements[0];
  // Update FPS
  if (msPassed >= updateEachSecond * 1000) {
    fps =
      Math.round(
        (timeMeasurements.length / msPassed) * 1000 * decimalPlacesRatio
      ) / decimalPlacesRatio;
  }
  // Once a second add a new bubble and reset FPS timer
  if (msPassed >= 1000) {
    createNewBubble();
    timeMeasurements = [];
  }

  setup(); // Clear game canvas
  bubbleArray.forEach(updateBubblePos); // Update bubbles position
  bubbleArray.forEach(drawBubble); // Draw bubbles

  // If currently playing continue loop
  if (playing) {
    requestAnimationFrame(game);
  }
}
const animation = requestAnimationFrame(game);

// Toggle play/pause
function toggle() {
  playing = !playing;
  playing ? setTimeout(() => game(), 100) : game();
  btn.innerText = playing ? "Pause" : "Play";
  btn.classList.toggle("playing");
  timeMeasurements = []; // Clear previous FPS timer
}

// MDN resize throttling
(function() {
  var throttle = function(type, name, obj) {
    obj = obj || window;
    var running = false;
    var func = function() {
      if (running) { return; }
      running = true;
      requestAnimationFrame(function() {
        obj.dispatchEvent(new CustomEvent(name));
        running = false;
      });
    };
    obj.addEventListener(type, func);
  };

  throttle("resize", "optimizedResize");
})();

// handle throttled resize events
window.addEventListener("optimizedResize", function() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - 116;
  setup();
});
