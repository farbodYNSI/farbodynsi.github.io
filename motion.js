const oldSections = {
  "#research": "research.html",
  "#projects": "projects.html",
  "#teaching": "courses.html",
  "#about": "index.html#about-me"
};

const canvas = document.querySelector("#robot-map");
if (canvas && oldSections[location.hash]) {
  location.replace(oldSections[location.hash]);
} else if (canvas) {
  startRobotDemo(canvas);
}

function startRobotDemo(canvas) {
  const context = canvas.getContext("2d");
  if (!context) return;
  const persian = document.documentElement.lang === "fa";
  const mapFont = persian
    ? `17px ${getComputedStyle(canvas).getPropertyValue("--persian-font").trim()}`
    : "15px monospace";

  const width = canvas.width;
  const height = canvas.height;
  const signal = "#ccfc63";
  const cyan = "#6ae1da";
  const route = [
    [112, 408], [236, 408], [275, 375], [275, 268],
    [310, 230], [452, 230], [488, 194], [488, 120], [620, 120]
  ];
  const obstacles = [[88, 113, 132, 108], [89, 266, 132, 78], [333, 290, 128, 117], [543, 216, 91, 112]];
  const segments = route.slice(1).map(([x, y], index) => {
    const [startX, startY] = route[index];
    return { x, y, startX, startY, length: Math.hypot(x - startX, y - startY) };
  });
  const distance = segments.reduce((sum, segment) => sum + segment.length, 0);

  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const button = document.querySelector("#motion-toggle");
  let playing = !reducedMotion.matches;
  let visible = true;
  let frame = 0;
  let lastTime = null;
  let elapsed = 2200;

  function draw(time) {
    context.fillStyle = "#111b20";
    context.fillRect(0, 0, width, height);
    context.lineWidth = 1;
    context.strokeStyle = "#27383f";
    context.beginPath();
    for (let x = 24; x < width; x += 24) {
      context.moveTo(x, 0);
      context.lineTo(x, height);
    }
    for (let y = 16; y < height; y += 24) {
      context.moveTo(0, y);
      context.lineTo(width, y);
    }
    context.stroke();

    context.strokeStyle = "#52686d";
    context.strokeRect(53, 60, 617, 395);
    for (const [x, y, w, h] of obstacles) {
      context.fillStyle = "#203239";
      context.fillRect(x, y, w, h);
      context.strokeRect(x, y, w, h);
      context.strokeRect(x + 7, y + 7, w - 14, h - 14);
    }

    context.strokeStyle = signal;
    context.lineWidth = 2;
    context.setLineDash([6, 6]);
    context.beginPath();
    for (const [x, y] of route) context.lineTo(x, y);
    context.stroke();
    context.setLineDash([]);

    context.fillStyle = "#acc1c3";
    context.font = mapFont;
    context.textAlign = "left";
    context.fillText(persian ? "شروع" : "START", 78, 441);
    context.fillText(persian ? "هدف" : "GOAL", 593, 95);
    context.fillStyle = signal;
    context.beginPath();
    context.arc(620, 120, 12, 0, 2 * Math.PI);
    context.stroke();
    context.fillRect(617, 117, 6, 6);

    let remaining = (time % 13000) / 13000 * distance;
    const segment = segments.find(item => {
      if (remaining <= item.length) return true;
      remaining -= item.length;
      return false;
    });
    const progress = remaining / segment.length;
    const x = segment.startX + (segment.x - segment.startX) * progress;
    const y = segment.startY + (segment.y - segment.startY) * progress;
    const heading = Math.atan2(segment.y - segment.startY, segment.x - segment.startX);
    const azimuth = time / 360;
    context.save();
    context.translate(x, y);
    context.fillStyle = "#6ae1da25";
    context.strokeStyle = cyan;
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(0, 0);
    context.arc(0, 0, 82, azimuth - .7, azimuth);
    context.closePath();
    context.fill();
    context.stroke();
    context.strokeStyle = "#6ae1da50";
    context.beginPath();
    context.arc(0, 0, 82, 0, 2 * Math.PI);
    context.stroke();
    context.rotate(heading);
    context.fillStyle = "#0a171a";
    context.fillRect(-15, -12, 30, 24);
    context.strokeStyle = signal;
    context.lineWidth = 2;
    context.strokeRect(-15, -12, 30, 24);
    context.fillStyle = signal;
    context.fillRect(-8, -16, 16, 4);
    context.fillRect(-8, 12, 16, 4);
    context.fillRect(7, -4, 4, 8);
    context.restore();
  }

  function tick(time) {
    if (lastTime !== null) elapsed += Math.min(time - lastTime, 70);
    lastTime = time;
    draw(elapsed);
    frame = requestAnimationFrame(tick);
  }

  function sync() {
    cancelAnimationFrame(frame);
    lastTime = null;
    const pauseLabel = persian ? "توقف حرکت" : "Pause motion";
    const playLabel = persian ? "پخش حرکت" : "Play motion";
    button.textContent = playing ? pauseLabel : playLabel;
    if (playing && visible && !document.hidden) frame = requestAnimationFrame(tick);
    else draw(elapsed);
  }

  button.hidden = false;
  button.addEventListener("click", () => {
    playing = !playing;
    sync();
  });
  reducedMotion.addEventListener("change", event => {
    playing = !event.matches;
    sync();
  });
  document.addEventListener("visibilitychange", sync);
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  });
  observer.observe(canvas);
  sync();
  if (persian) {
    document.fonts.ready.then(() => {
      if (!playing || !visible || document.hidden) draw(elapsed);
    });
  }
}
