let lastState = "hero"; // "hero" or "projects"

window.addEventListener("scroll", () => {
    const hero = document.querySelector(".hero-section");
    const projects = document.querySelector(".projects-frame");
    const overlay = document.querySelector(".transition-overlay");

    const trigger = window.innerHeight * 0.5;
    const currentScroll = window.scrollY;

    // DOWN → hero -> projects
    if (currentScroll > trigger && lastState === "hero") {
        lastState = "projects";

        overlay.classList.add("active");
        hero.style.opacity = "0";

        setTimeout(() => {
            projects.classList.add("visible");
            overlay.classList.remove("active");
        }, 300);
    }

    // UP → projects -> hero
    else if (currentScroll <= trigger && lastState === "projects") {
        lastState = "hero";

        overlay.classList.add("active");
        projects.classList.remove("visible");

        setTimeout(() => {
            hero.style.opacity = "1";
            overlay.classList.remove("active");
        }, 300);
    }
});