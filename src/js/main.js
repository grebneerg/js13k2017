var playing = true;

var c = document.querySelector('a-entity[camera]'); //the camera
console.log(c.components);
// c.setAttribute('position', '50 0 4');
console.log(c.getAttribute('position'));

var d = Math.PI * 2 / (10000/10);
var angle = 0;
//game loop
var gameLoop = setInterval(() => {
    let xy = c.getAttribute('position');
    let loc = computeLoc(xy.x, xy.y, angle);
    angle = loc.a;
    c.setAttribute('position', {x: loc.x, y: loc.y})
}, 10);

var computeLoc = (x, y, a) => {
    let angle = (a + d) % (2 * Math.PI);

    return {
        a: angle,
        x: 50 * Math.cos(angle),
        y: 50 * Math.sin(angle),
    }
}