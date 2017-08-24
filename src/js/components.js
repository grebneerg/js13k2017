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
            orbits[i].setAttribute("color", "grey");
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
            this.el.appendChild(this.orbits[i]);
        }
    },
    
    mouseEnter: (evt) => {
        evt.target.setAttribute("opacity",'0.5');
    },
    mouseExit: (evt) => {
        evt.target.setAttribute("opacity",'0.1');
    }
});

AFRAME.registerComponent('moon', {
    dependencies: ['position', 'camera','look-controls'],
    init: function() {
        this.d = Math.PI * 2 / (10000/10); // distance to orbit per frame in radians
        this.t = 0;
        this.state = 0;
        this.time = 0;
        this.angle = 0;
        this.movement = {};
        this.r = "000";
        this.orbiting = document.querySelector("#initial").components.orbit;
        this.orbiting.enterOrbit();
        this.oldOrbit = null;
        this.o = { //important info about the planet being orbited
            x: 0,
            y: 0,
            z: 0,
            h: 50
        };
        this.planes = {
            "000": (c,x,y,z) => {
                let loc = this.computeLoc(x - this.o.x, y - this.o.y, this.angle);
                this.angle = loc.a;
                c.setAttribute('position', {x: loc.x + this.o.x, y: loc.y + this.o.y, z: this.o.z});
            },
            "09090": (c,x,y,z) => {
                let loc = this.computeLoc(y - this.o.y, z - this.o.z, this.angle);
                this.angle = loc.a;
                c.setAttribute('position', {x: this.o.x, y: loc.x + this.o.y, z: loc.y + this.o.z});
            },
            "90900": (c,x,y,z) => {
                let loc = this.computeLoc(x - this.o.x, z - this.o.z, this.angle);
                this.angle = loc.a;
                c.setAttribute('position', {x: loc.x + this.o.x, y: this.o.y, z: loc.y + this.o.z});
            },
        };
        this.el.querySelector('a-entity[cursor]').addEventListener('click', (evt) => { // here I'm taking advantage of arrow functions using lexical scoping for `this`
            if (this.state === 0 && !evt.detail.intersectedEl.parentEl.components.orbit.orbiting) {
                console.log(evt);
                let intersection = evt.detail.intersection;
                let pos = this.el.getAttribute('position');
                let time = intersection.distance * 1000 / 15.7;
                let m = {};
                m.t = (time / 10);
                m.x = (intersection.point.x - pos.x) / m.t;
                m.y = (intersection.point.y - pos.y) / m.t;
                m.z = (intersection.point.z - pos.z) / m.t;
                m.dest = intersection.point;
                this.movement = m;
                let rotation = evt.detail.intersectedEl.getAttribute('rotation');
                console.log(rotation);
                this.r = "" + rotation.x + rotation.y + rotation.z;
                console.log(this.r);
                
                this.orbiting.exitOrbit();
                this.old = this.orbiting;
                this.orbiting = evt.detail.intersectedEl.parentEl.components.orbit;
                
                this.o = evt.detail.intersectedEl.parentEl.getAttribute('position');
                
                
                
                switch (this.r) {
                    case "000":
                        this.o.h = this.dist(intersection.point.x, this.o.x, intersection.point.y, this.o.y);
                        this.angle = Math.atan2(intersection.point.y - this.o.y, intersection.point.x - this.o.x);
                        break;
                    case "09090":
                        this.o.h = this.dist(intersection.point.y, this.o.y, intersection.point.z, this.o.z);
                        this.angle = Math.atan2(intersection.point.y - this.o.y, intersection.point.z - this.o.z);;
                        break;
                    case "000":
                        this.o.h = this.dist(intersection.point.z, this.o.z, intersection.point.x, this.o.x);
                        this.angle = Math.atan2(intersection.point.x - this.o.x, intersection.point.z - this.o.z);
                        break;
                }
                
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
                    this.orbiting.enterOrbit();
                }
                break;
        }
    },
    computeLoc: function(x, y, a) {

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