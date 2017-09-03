window.onload = () => {
    document.querySelector("#begin").addEventListener('click',() => {
        let galaxy = document.createElement("a-scene");
        galaxy.setAttribute("galaxy", "");
        let intro = document.querySelector("#intro");
        let parent = intro.parentElement;
        parent.removeChild(intro);
        parent.appendChild(galaxy);
    });
}

