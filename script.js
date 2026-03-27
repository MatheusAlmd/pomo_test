const focusDuration = 60 * 60;
const breakDuration = 10 * 60;

const timeDisplay = document.getElementById("timeDisplay");
const statusLabel = document.getElementById("statusLabel");
const mainToggle = document.getElementById("mainToggle");
const breakButton = document.getElementById("breakButton");
const resetButton = document.getElementById("resetButton");
const dialProgress = document.getElementById("dialProgress");

const radius = 88;
const circumference = 2 * Math.PI * radius;
dialProgress.style.strokeDasharray = `${circumference}`;

let mode = "focus";
let totalSeconds = focusDuration;
let remainingSeconds = totalSeconds;
let isRunning = false;
let timerId = null;

function formatTime(total) {
  const hours = String(Math.floor(total / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const seconds = String(total % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

function updateDial() {
  const progress = remainingSeconds / totalSeconds;
  const offset = circumference * (1 - progress);
  dialProgress.style.strokeDashoffset = `${offset}`;
}

function updateUI() {
  timeDisplay.textContent = formatTime(remainingSeconds);
  statusLabel.textContent =
    mode === "focus" ? "Sessão de foco • 1 hora" : "Pausa de recuperação • 10 minutos";
  mainToggle.textContent = isRunning ? "Pausar" : mode === "focus" ? "Iniciar foco" : "Iniciar pausa";
  updateDial();
}

function stopTimer() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
  isRunning = false;
}

function playCinematicAlarm() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const pattern = [
    { freq: 880, time: 0 },
    { freq: 660, time: 0.25 },
    { freq: 990, time: 0.5 },
    { freq: 550, time: 0.75 },
    { freq: 990, time: 1.0 },
    { freq: 440, time: 1.25 },
  ];

  pattern.forEach(({ freq, time }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0.0001, ctx.currentTime + time);
    gain.gain.exponentialRampToValueAtTime(0.45, ctx.currentTime + time + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + time + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + time);
    osc.stop(ctx.currentTime + time + 0.25);
  });

  setTimeout(() => ctx.close(), 2000);
}

function onTimerComplete() {
  stopTimer();
  remainingSeconds = 0;
  updateUI();
  playCinematicAlarm();
}

function startTimer() {
  if (isRunning) return;

  isRunning = true;
  timerId = setInterval(() => {
    remainingSeconds -= 1;

    if (remainingSeconds <= 0) {
      onTimerComplete();
      return;
    }

    updateUI();
  }, 1000);

  updateUI();
}

mainToggle.addEventListener("click", () => {
  if (isRunning) {
    stopTimer();
    updateUI();
    return;
  }

  if (remainingSeconds <= 0) {
    remainingSeconds = totalSeconds;
  }

  startTimer();
});

breakButton.addEventListener("click", () => {
  stopTimer();
  mode = "break";
  totalSeconds = breakDuration;
  remainingSeconds = breakDuration;
  updateUI();
});

resetButton.addEventListener("click", () => {
  stopTimer();
  mode = "focus";
  totalSeconds = focusDuration;
  remainingSeconds = focusDuration;
  updateUI();
});

updateUI();
