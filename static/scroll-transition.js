
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
            for (let i = 0; i < text.length; i++) {
                const ch = text[i];
                const span = document.createElement("span");
                span.dataset.real = ch;
                if (ch === " " || ch === "\n" || ch === "\r") {
                    span.className = "dc-space";
                    span.textContent = ch;
                } else {
                    span.className = isLink ? "dc-char dc-char--link" : "dc-char";
                    span.textContent = ch;
                }
                frag.appendChild(span);
            }
            node.replaceWith(frag);
        } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== "SCRIPT") {
            Array.from(node.childNodes).forEach(processNode);
        }
    }

    Array.from(el.childNodes).forEach(processNode);
    el.dataset.decipherReady = "1";

    requestAnimationFrame(() => {
        el.querySelectorAll(".dc-char:not(.dc-char--link)").forEach(span => {
            const w = span.getBoundingClientRect().width;
            span.style.minWidth = w + "px";
        });
    });
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