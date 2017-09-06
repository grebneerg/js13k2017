vr = false;

window.onload = () => {
    document.querySelector("#begin").addEventListener('click',() => {
        let galaxy = document.createElement("a-scene");
        galaxy.setAttribute("galaxy", "");
        galaxy.addEventListener("enter-vr", () => {
            vr = true;
        });
        galaxy.addEventListener("exit-vr", () => {
            vr = false;
        });
        let intro = document.querySelector("#intro");
        let parent = intro.parentElement;
        intro.setAttribute("style", "display:none;");
        parent.appendChild(galaxy);
    });
}

