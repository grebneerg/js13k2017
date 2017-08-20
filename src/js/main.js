

// var playing = true;

// //Game state: 0 -> orbiting, 1 -> transferring between orbits
// var state = 0;

// var movement = {};

// var c = document.querySelector('a-entity[camera]'); //the camera
// console.log(c.components);
// document.querySelector('a-entity[cursor]').addEventListener('click', (evt) => {
//     console.log(evt);
//     let intersection = evt.detail.intersection;
//     let pos = c.getAttribute('position');
//     let time = intersection.distance * 1000 / 15.7;
//     movement.x = (intersection.point.x - pos.x) / (time / 10);
//     movement.y = (intersection.point.y - pos.y) / (time / 10);
//     movement.z = (intersection.point.z - pos.z) / (time / 10);
//     movement.dest = intersection.point;
//     state = 1;
// });
// // c.setAttribute('position', '50 0 4');
// console.log(c.getAttribute('position'));

// var d = Math.PI * 2 / (10000/10);
// var angle = 0;
// //game loop
// var gameLoop = setInterval(() => {
//     switch (state) {
//         case 0:
//             let xy = c.getAttribute('position');
//             let loc = computeLoc(xy.x, xy.y, angle);
//             angle = loc.a;
//             c.setAttribute('position', {x: loc.x, y: loc.y});
//             break;
//         case 1:
//             let xyz = c.getAttribute('position');
//             c.setAttribute('position', {x: xyz.x + movement.x, y: xyz.y + movement.y, z: xyz.z + movement.z});
//             // if (movement.dest.x > c.getAttribute('position').x || movement.dest.y > c.getAttribute('position').y || movement.dest.z > c.getAttribute('position').z) {
//             //     console.log("hit!");
//             //     state = 0;
//             // }
//             break;
//     }
// }, 10);

// var computeLoc = (x, y, a) => {
//     let angle = (a + d) % (2 * Math.PI);

//     return {
//         a: angle,
//         x: 50 * Math.cos(angle),
//         y: 50 * Math.sin(angle),
//     }
// }