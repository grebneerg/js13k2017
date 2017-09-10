vr = false;

window.onload = () => {
    document.querySelector("#begin").addEventListener('click', () => {
        let size = "";
        if (document.querySelector("#small").checked) {
            size = "";
        } else if (document.querySelector("#medium").checked) {
            size = {x:6, y:6, z:6};
        } else if (document.querySelector("#large").checked) {
            size = {x:7, y:7, z:7};
        }
        let galaxy = document.createElement("a-scene");
        galaxy.setAttribute("galaxy", size);
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

