// Moon related JS was taken from here
// https://dev.to/thormeier/use-your-i-moon-gination-lets-build-a-moon-phase-visualizer-with-css-and-js-aih

const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');
let stars = [];
let shootingStars = [];
let SHOOTING_STAR_CHANCE = 0.002; // ~0.2% chance per frame

const STAR_COUNT = 200;

function createShootingStar() {
  shootingStars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height * 0.7, // only top half of the sky
    speedX: 4,  // 4-12 px/frame
    speedY: 2,  // 1-3 px/frame
    length: Math.random() * 10 + 5, // how long the trail is
    opacity: 1
  });
}

function drawShootingStars() {
  for (let i = 0; i < shootingStars.length; i++) {
    const star = shootingStars[i];

    star.length += 1.4

    ctx.beginPath();
    ctx.moveTo(star.x, star.y);
    ctx.lineTo(star.x - star.length, star.y - star.length / 2);
    ctx.strokeStyle = `rgba(255, 255, 255, ${star.opacity})`;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Update position
    star.x += star.speedX;
    star.y += star.speedY;
    star.opacity -= 0.01; // fade out

    // Remove if invisible
    if (star.opacity <= 0) {
      shootingStars.splice(i, 1);
      i--; // adjust index since we removed one
    }
  }
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function initStars() {
  stars = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.5 + 0.5,
      alpha: Math.random(),
      twinkleSpeed: Math.random() * 0.00001 + 0.005
    });
  }
}

function drawStars() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let star of stars) {
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
    ctx.fill();

    star.alpha += star.twinkleSpeed;
    if (star.alpha <= 0 || star.alpha >= 1) {
      star.twinkleSpeed = -star.twinkleSpeed;
    }
  }

  // Maybe spawn a shooting star
  if (Math.random() < SHOOTING_STAR_CHANCE) {
    createShootingStar();
  }

  drawShootingStars()
}


function animate() {
  drawStars();
  requestAnimationFrame(animate);
}

window.addEventListener('resize', () => {
  resizeCanvas();
  initStars();
});

const getMoonPhaseRotation = date => {
  const cycleLength = 29.530588 // days for moon cycle

  const knownNewMoon = new Date('2025-04-27 7:31:00Z')
  const secondsSinceKnownNewMoon = (date - knownNewMoon) / 1000
  const daysSinceKnownNewMoon = secondsSinceKnownNewMoon / 60 / 60 / 24
  const currentMoonPhasePercentage = (daysSinceKnownNewMoon % cycleLength) / cycleLength

  const rotation = 360 - Math.floor(currentMoonPhasePercentage * 360)

  return rotation
}

const setMoonRotation = deg => {
  document.querySelector('.divider').style.transform = `rotate3d(0, 1, 0, ${deg}deg)`
  const hemispheres = document.querySelectorAll('.hemisphere')
  console.log(deg)

  if (deg < 180) {
    // Left
    hemispheres[0].classList.remove('dark')
    hemispheres[0].classList.add('light')

    // Right
    hemispheres[1].classList.add('dark')
    hemispheres[1].classList.remove('light')
  } else {

    // Left
    hemispheres[0].classList.add('dark')
    hemispheres[0].classList.remove('light')

    // Right
    hemispheres[1].classList.remove('dark')
    hemispheres[1].classList.add('light')
  }

  // A bit of jank, force new moon if within 4 degrees of new moon, never is exact
  if (deg >= 358 || deg <= 2) {
    hemispheres[0].classList.remove('light')
    hemispheres[1].classList.remove('light')
    hemispheres[0].classList.add('dark')
    hemispheres[1].classList.add('dark')
  }
}

const today = new Date()
setMoonRotation(getMoonPhaseRotation(new Date(today)))

// initialize
resizeCanvas();
initStars();
animate();
