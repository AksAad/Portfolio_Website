const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            } else {
                entry.target.classList.remove("visible");
            }
        });
    },
    { threshold: 0.08 }
);

observer.observe(document.querySelector(".projects-frame"));
observer.observe(document.querySelector(".building-frame"));
observer.observe(document.querySelector(".milestones-frame"));
observer.observe(document.querySelector(".about-frame"));

const navbar = document.querySelector(".navbar");
let lastScrollY  = 0;
let navbarHidden = false;

window.addEventListener("scroll", () => {
    const currentY = window.scrollY;
    if (currentY > lastScrollY && currentY > 80) {
        navbar.classList.add("navbar--hidden");
        navbarHidden = true;
    } else {
        navbar.classList.remove("navbar--hidden");
        navbarHidden = false;
    }
    lastScrollY = currentY;
});

document.addEventListener("mousemove", (e) => {
    if (e.clientY < 80) {
        navbar.classList.remove("navbar--hidden");
    } else if (navbarHidden) {
        navbar.classList.add("navbar--hidden");
    }
});

// ── Navbar smooth scroll ──
const navTargets = { Home: "home", Projects: "projects", Milestones: "milestones", About: "about" };
document.querySelectorAll(".nav-item").forEach(item => {
    item.addEventListener("click", () => {
        const id = navTargets[item.textContent.trim()];
        const target = document.getElementById(id);
        if (target) target.scrollIntoView({ behavior: "smooth" });
    });
});

const cursorRing = document.createElement("div");
const cursorDot  = document.createElement("div");
cursorRing.className = "cursor-ring";
cursorDot.className  = "cursor-dot";
document.body.appendChild(cursorRing);
document.body.appendChild(cursorDot);

let mouseX = -100, mouseY = -100;
let ringX  = -100, ringY  = -100;

document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
});

function animateCursor() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    cursorRing.style.transform = `translate(${ringX}px, ${ringY}px)`;
    requestAnimationFrame(animateCursor);
}
animateCursor();

document.querySelectorAll("a, button, .nav-item, .projects-storm").forEach(el => {
    el.addEventListener("mouseenter", () => cursorRing.classList.add("cursor-ring--hover"));
    el.addEventListener("mouseleave", () => cursorRing.classList.remove("cursor-ring--hover"));
});

// I-beam cursor for typable inputs — hide the custom ring, show native text cursor
document.querySelectorAll("input, textarea").forEach(el => {
    el.addEventListener("mouseenter", () => {
        cursorRing.style.opacity = "0";
        cursorDot.style.opacity  = "0";
    });
    el.addEventListener("mouseleave", () => {
        cursorRing.style.opacity = "1";
        cursorDot.style.opacity  = "1";
    });
});

const storm = document.querySelector(".projects-storm");
let rotation = 0, speed = 0, hovering = false;
const MAX_SPEED = 25, ACCELERATION = 0.4, FRICTION = 0.98;

storm.addEventListener("mouseenter", () => {
    hovering = true;
    setTimeout(() => {
        if (hovering) {
            speed += 5;
            if (speed > MAX_SPEED) speed = MAX_SPEED;
            if (speed === MAX_SPEED) triggerFireworks();
        }
    }, 500);
});
storm.addEventListener("mouseleave", () => { hovering = false; });

function animateStorm() {
    speed = hovering ? Math.min(speed + ACCELERATION, MAX_SPEED) : speed * FRICTION;
    rotation += speed;
    storm.style.transform = `rotate(${rotation}deg)`;
    requestAnimationFrame(animateStorm);
}
animateStorm();

function triggerFireworks() {
    for (let i = 0; i < 40; i++) {
        const p = document.createElement("div");
        p.className = "firework";
        document.body.appendChild(p);
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        const a = Math.random() * 2 * Math.PI;
        const d = Math.random() * 200 + 100;
        const dx = Math.cos(a) * d, dy = Math.sin(a) * d;
        p.style.left = x + "px";
        p.style.top  = y + "px";
        p.animate([
            { transform: "translate(0,0)", opacity: 1 },
            { transform: `translate(${dx}px,${dy}px)`, opacity: 0 }
        ], { duration: 800, easing: "ease-out" });
        setTimeout(() => p.remove(), 800);
    }
}

const CHARSET         = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&?!";
const CHAR_SPEED      = 18;  
const CHAR_REVEAL     = 28;  
const SCRAMBLE_ROUNDS = 5;   

function randChar() {
    return CHARSET[Math.floor(Math.random() * CHARSET.length)];
}

const DECIPHER_SELECTORS = [
    ".project-desc",
    ".project-tech",
    ".project-link",
    ".more-link",
    ".building-row > div",
    ".building-heading",
    ".timeline-desc",
    ".timeline-title",
].join(", ");

function wrapElement(el) {
    if (el.dataset.decipherReady) return;
    const isLink = el.tagName === "A";

    function processNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent;
            if (!text.trim()) return;
            const frag = document.createDocumentFragment();

            // Split text into tokens: words and whitespace runs
            // This keeps words atomic so they never break mid-character
            const tokens = text.split(/(\s+)/);

            tokens.forEach(token => {
                if (!token) return;

                const isWhitespace = /^\s+$/.test(token);
                if (isWhitespace) {
                    // Render whitespace as a plain text node so the browser
                    // can use it as a natural line-break opportunity
                    frag.appendChild(document.createTextNode(token));
                    return;
                }

                // Wrap the whole word in an inline-block container so it
                // never gets split across lines by the scramble spans inside
                const wordSpan = document.createElement("span");
                wordSpan.className = "dc-word";

                for (let i = 0; i < token.length; i++) {
                    const ch = token[i];
                    const span = document.createElement("span");
                    span.dataset.real = ch;
                    span.className = isLink ? "dc-char dc-char--link" : "dc-char";
                    span.textContent = ch;
                    wordSpan.appendChild(span);
                }

                frag.appendChild(wordSpan);
            });

            node.replaceWith(frag);
        } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== "SCRIPT") {
            Array.from(node.childNodes).forEach(processNode);
        }
    }

    Array.from(el.childNodes).forEach(processNode);
    el.dataset.decipherReady = "1";
}

function startDecipher(el) {
    const chars = Array.from(el.querySelectorAll(".dc-char"));
    if (!chars.length) return;
    chars.forEach(span => {
        span.style.opacity = "0.15";
        span.textContent = randChar();
    });
    chars.forEach((span, idx) => {
        let round = 0;
        const scramble = () => {
            span.style.opacity = "0.55";
            span.textContent = randChar();
            round++;
            if (round < SCRAMBLE_ROUNDS) {
                setTimeout(scramble, CHAR_SPEED);
            } else {
                span.textContent = span.dataset.real;
                span.style.opacity = "1";
            }
        };
        setTimeout(scramble, idx * CHAR_REVEAL);
    });
}

const decipherEls = Array.from(document.querySelectorAll(DECIPHER_SELECTORS));

decipherEls.forEach(el => {
    wrapElement(el);
    requestAnimationFrame(() => {
        el.querySelectorAll(".dc-char:not(.dc-char--link)").forEach(span => {
            span.style.opacity = "0.15";
            span.textContent = randChar();
        });
    });
});

const decipherObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            startDecipher(entry.target);
            decipherObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.001 });

decipherEls.forEach(el => decipherObserver.observe(el));


// ===============================
// COMPUTER TILT (Premium subtle)
// ===============================

const computer = document.querySelector(".building-computer");

let targetRX = 0, targetRY = 0;
let currentRX = 0, currentRY = 0;
let tiltActive = false;

computer.addEventListener("mousemove", (e) => {
    const rect = computer.getBoundingClientRect();

    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    targetRY = x * 10;   // horizontal tilt
    targetRX = -y * 10;  // vertical tilt

    tiltActive = true;
});

computer.addEventListener("mouseleave", () => {
    targetRX = 0;
    targetRY = 0;
    tiltActive = false;
});

function animateComputerTilt() {
    currentRX += (targetRX - currentRX) * 2;
    currentRY += (targetRY - currentRY) * 2;

    const scale = tiltActive ? 1.04 : 1;

    computer.style.transform = `
        perspective(800px)
        rotateX(${currentRX}deg)
        rotateY(${currentRY}deg)
        scale(${scale})
    `;

    requestAnimationFrame(animateComputerTilt);
}

animateComputerTilt();


const starsContainer = document.querySelector(".milestones-stars");
const stars = document.querySelectorAll(".star");

let starHoverActive = false;

starsContainer.addEventListener("mouseenter", () => {
    if (starHoverActive) return;
    starHoverActive = true;
    stars.forEach(star => {
        star.style.transform = "scale(1.1)";
        star.style.filter = "drop-shadow(0 0 8px rgba(0,0,0,0.5))";
    });

    spawnSparkles();
});

starsContainer.addEventListener("mouseleave", () => {
    starHoverActive = false;

    stars.forEach(star => {
        star.style.transform = "scale(1)";
        star.style.filter = "none";
    });
});


// ===============================
// SPARKLE PARTICLES
// ===============================

function spawnSparkles() {
    const rect = starsContainer.getBoundingClientRect();

    for (let i = 0; i < 20; i++) {
        const p = document.createElement("div");
        p.className = "sparkle";
        document.body.appendChild(p);

        const x = rect.left + Math.random() * rect.width;
        const y = rect.top + Math.random() * rect.height;

        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 80 + 40;

        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance;

        p.style.left = `${x}px`;
        p.style.top = `${y}px`;

        p.animate([
            { transform: "translate(0,0)", opacity: 1 },
            { transform: `translate(${dx}px, ${dy}px)`, opacity: 0 }
        ], {
            duration: 700,
            easing: "ease-out"
        });

        setTimeout(() => p.remove(), 700);
    }
}