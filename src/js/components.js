AFRAME.registerComponent('orbit', {
    schema: {
        ir: {type: "number"},
        or: {type: "number"}
    },
    
    multiple: true,
    
    init: function() {
        this.orbiting = false;
        console.log(this);
        let el = this.el;
        let orbits = [];
        for (let i = 0; i < 3; i++) {
            orbits[i] = document.createElement("a-ring");
            orbits[i].setAttribute("radius-outer", this.data.or);
            orbits[i].setAttribute("radius-inner", this.data.ir);
            orbits[i].setAttribute("color", "white");
            orbits[i].setAttribute("opacity", "0.1");
            orbits[i].setAttribute("material", "side:double");
            orbits[i].addEventListener('mouseenter', this.mouseEnter);
            orbits[i].addEventListener('mouseleave', this.mouseExit);
            el.appendChild(orbits[i]);
        }
        
        
        
        orbits[0].setAttribute("rotation", "0 0 0");
        orbits[1].setAttribute("rotation", "0 90 90");
        orbits[2].setAttribute("rotation", "90 90 0");
        
        this.orbits = orbits;
        
        if (el.getAttribute("id") === "destination") {
            el.setAttribute('color', "blue");
        } else {
            let colors = ["red","brown","orange"];
            el.setAttribute('color', colors[Math.floor(Math.random() * colors.length)]);
        }
        
    },
    
    enterOrbit: function() {
        this.orbiting = true;
        for (let i = 0; i < 3; i++) {
            this.el.removeChild(this.orbits[i]);
        }
    },
    exitOrbit: function() {
        this.orbiting = false;
        for (let i = 0; i < 3; i++) {
            this.orbits[i].setAttribute("material", "side:double");
            this.el.appendChild(this.orbits[i]);
        }
        console.log("exit")
    },
    
    mouseEnter: (evt) => {
        evt.target.setAttribute("opacity",'0.5');
    },
    mouseExit: (evt) => {
        evt.target.setAttribute("opacity",'0.1');
    }
});

AFRAME.registerComponent('moon', {
    // dependencies: ['position', 'camera','look-controls'],
    init: function() {
        console.log(this);
        this.d = Math.PI * 2 / (5000/10); // distance to orbit per frame in radians
        this.t = 0;
        this.state = 0; //Game state: 0 -> orbiting; 1 -> traveling between orbits
        this.time = 0;
        this.movement = {}; //Will hold info about how far we move per tick in state 1
        this.r = "000"; //represents current rotation so we can tell what plane we are on
        this.orbiting = document.querySelector("#initial").components.orbit; // holds the orbit component we are currently in
        this.orbiting.enterOrbit();
        this.oldOrbit = null;
        this.o = this.orbiting.el.getAttribute('position'); //Center of the current orbit
        this.o.h = 100; // Distance from center of current orbit
        
        //Adding camera, look-controls, and cursor to this element
        let newX = this.o.x + this.o.h;
        this.el.setAttribute('position', {x: newX, y: this.o.y, z: this.o.z});
        this.el.setAttribute('camera', '');
        this.el.setAttribute('look-controls', '');
        let cursor = document.createElement('a-entity'); //Cursor stuff from here down
        cursor.setAttribute("click-everywhere", "");
        cursor.setAttribute('cursor', 'fuse:false;downEvents:gp-down;upEvents:gp-up');
        cursor.setAttribute('raycaster', 'far: 1500');
        cursor.setAttribute('position', '0 0 -1');
        cursor.setAttribute('geometry', 'primitive: ring; radiusInner: 0.01; radiusOuter: 0.02');
        cursor.setAttribute('material', 'color: white; shader: flat');
        this.el.appendChild(cursor);
        
        this.planes = { //different methods for orbiting depending on plane.
            "000": (c,x,y,z) => {
                let loc = this.computeLoc(x - this.o.x, y - this.o.y);
                c.setAttribute('position', {x: loc.x + this.o.x, y: loc.y + this.o.y, z: this.o.z});
            },
            "09090": (c,x,y,z) => {
                let loc = this.computeLoc(y - this.o.y, z - this.o.z);
                c.setAttribute('position', {x: this.o.x, y: loc.x + this.o.y, z: loc.y + this.o.z});
            },
            "90900": (c,x,y,z) => {
                let loc = this.computeLoc(x - this.o.x, z - this.o.z);
                c.setAttribute('position', {x: loc.x + this.o.x, y: this.o.y, z: loc.y + this.o.z});
            },
        };
        this.el.querySelector('a-entity[cursor]').addEventListener('click', (evt) => { //Handling clicking on an orbit. here I'm taking advantage of arrow functions using lexical scoping for `this`
            if (this.state === 0 && !evt.detail.intersectedEl.parentEl.components.orbit.orbiting) { //Verify it's not the same planet
                console.log(evt);
                let intersection = evt.detail.intersection;
                let pos = this.el.getAttribute('position');
                let time = intersection.distance;
                let m = {};
                m.t = (time / 10);
                m.x = (intersection.point.x - pos.x) / m.t;
                m.y = (intersection.point.y - pos.y) / m.t;
                m.z = (intersection.point.z - pos.z) / m.t;
                m.dest = intersection.point;
                this.movement = m;
                let rotation = evt.detail.intersectedEl.getAttribute('rotation');
                console.log(rotation);
                this.r = "" + rotation.x + rotation.y + rotation.z; //string to determine what orbiting method should be used
                console.log(this.r);
                
                this.oldOrbit = this.orbiting;
                // this.orbiting.exitOrbit();
                console.log(this.oldOrbit);
                this.orbiting = evt.detail.intersectedEl.parentEl.components.orbit;
                
                this.o = evt.detail.intersectedEl.parentEl.getAttribute('position');
                this.orbiting.enterOrbit(); //this has to be after the above line because it removes access to an object needed there
                
                
                switch (this.r) { //calculate distance based on plane
                    case "000":
                        this.o.h = this.dist(intersection.point.x, this.o.x, intersection.point.y, this.o.y);
                        this.angle = Math.atan2(intersection.point.y - this.o.y, intersection.point.x - this.o.x);
                        break;
                    case "09090":
                        this.o.h = this.dist(intersection.point.y, this.o.y, intersection.point.z, this.o.z);
                        this.angle = Math.atan2(intersection.point.y - this.o.y, intersection.point.z - this.o.z);;
                        break;
                    case "90900":
                        this.o.h = this.dist(intersection.point.z, this.o.z, intersection.point.x, this.o.x);
                        this.angle = Math.atan2(intersection.point.x - this.o.x, intersection.point.z - this.o.z);
                        break;
                }
                console.log(this.o.h);
                
                console.log(this.o);
                
                this.state = 1;
            }
        });
    },
    tick: function(t) {
        if (t - this.time < 10) return;
        let c = this.el;
        // console.log(c.getAttribute('position'));
        switch (this.state) {
            case 0:
                let xy = c.getAttribute('position');
                
                this.planes[this.r](c,xy.x,xy.y,xy.z);
                break;
            case 1:
                let m = this.movement;
                let xyz = c.getAttribute('position');
                c.setAttribute('position', {x: xyz.x + m.x, y: xyz.y + m.y, z: xyz.z + m.z});
                this.t++;
                if (this.t > m.t) {
                    c.setAttribute('position', m.dest);
                    console.log("hit!");
                    this.t = 0;
                    this.state = 0;
                    console.log(this.oldOrbit);
                    this.oldOrbit.exitOrbit();
                    console.log(this.orbiting)
                }
                break;
        }
    },
    computeLoc: function(x, y) {

        let angle = Math.atan2(y, x) + this.d;

        return {
            a: angle,
            x: this.o.h * Math.cos(angle),
            y: this.o.h * Math.sin(angle),
        }
    },
    dist: function(x1, x2, y1, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    },
});

AFRAME.registerComponent('galaxy', {
    schema: {
        x: {type: "number", default: 5},
        y: {type: "number", default: 5},
        z: {type: "number", default: 5}
    },
    
    init: function() {
        this.planets = [];
        for (let x = 0; x < this.data.x; x++) {
            this.planets[x] = [];
            for (let y = 0; y < this.data.y; y++) {
                this.planets[x][y] = []
                for (let z = 0; z < this.data.z; z++) {
                    let p = document.createElement('a-sphere');
                    let r = Math.floor(Math.random() * 60 + 20);
                    let ir = r + Math.floor(Math.random() * 50 + 20);
                    let or = ir + Math.floor(Math.random() * 75 + 15);
                    let tx = x * 500 + Math.floor(Math.random() * 300 - 150);
                    let ty = y * 500 + Math.floor(Math.random() * 300 - 150);
                    let tz = z * 500 + Math.floor(Math.random() * 300 - 150);
                    p.setAttribute('position', {x: tx, y: ty, z: tz});
                    p.setAttribute("radius", r);
                    p.setAttribute('orbit', {ir : ir, or: or});
                    this.planets[x][y][z] = p;
                    this.el.appendChild(p);
                }
            }
        }
        let initial = this.planets[Math.floor(Math.random() * this.data.x)][Math.floor(Math.random() * this.data.y)][Math.floor(Math.random() * this.data.z)]
        initial.setAttribute('id', 'initial');
        let destination;
        do {
            destination = this.planets[Math.floor(Math.random() * this.data.x)][Math.floor(Math.random() * this.data.y)][Math.floor(Math.random() * this.data.z)];
        } while (destination === initial);
        destination.setAttribute("id", "destination");
        let moon = document.createElement('a-entity');
        moon.setAttribute('moon', '');
        this.el.appendChild(moon);
        let sky = document.createElement('a-sky');
        sky.setAttribute('color', 'black');
        this.el.appendChild(sky);
    }
});

AFRAME.registerComponent('click-everywhere', {
    init: function() {
        console.log("click-everywhere");
    },
    tick: function() {
        let gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
        let foundPressedBtn = false;
        for (let i = 0; i < gamepads.length && !foundPressedBtn; i++) {
            if (gamepads[i] === null) continue;
            let btns = gamepads[i].buttons;
            for (let j = 0; j < btns.length && !foundPressedBtn; j++) {
                if (btns[j].pressed) {
                    this.el.emit('gp-down');
                    this.el.emit('gp-up');
                    foundPressedBtn = true;
                }
            }
        }
    }
});