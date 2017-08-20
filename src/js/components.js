AFRAME.registerComponent('orbit', {
    schema: {
        ir: {type: "number"},
        or: {type: "number"}
    },
    
    multiple: true,
    
    init: function() {
        console.log(this);
        let el = this.el;
        let orbits = [];
        for (let i = 0; i < 3; i++) {
            orbits[i] = document.createElement("a-ring");
            orbits[i].setAttribute("radius-outer", this.data.or);
            orbits[i].setAttribute("radius-inner", this.data.ir);
            orbits[i].setAttribute("color", "red");
            orbits[i].setAttribute("opacity", "0.5");
            orbits[i].setAttribute("material", "side:double");
            el.appendChild(orbits[i]);
        }
        
        orbits[0].setAttribute("rotation", "0 0 0");
        orbits[1].setAttribute("rotation", "0 90 90");
        orbits[2].setAttribute("rotation", "90 90 0");
        
        this.orbits = orbits;
    }
});

AFRAME.registerComponent('moon', {
    dependencies: ['position', 'camera','look-controls'],
    init: function() {
        this.d = Math.PI * 2 / (10000/10);
        this.state = 0;
        this.time = 0;
        this.angle = 0;
        this.movement = {};
        this.el.querySelector('a-entity[cursor]').addEventListener('click', (evt) => {
            console.log(evt);
            let intersection = evt.detail.intersection;
            let pos = this.el.getAttribute('position');
            let time = intersection.distance * 1000 / 15.7;
            let m = {}
            m.x = (intersection.point.x - pos.x) / (time / 10);
            m.y = (intersection.point.y - pos.y) / (time / 10);
            m.z = (intersection.point.z - pos.z) / (time / 10);
            m.dest = intersection.point;
            this.movement = m;
            this.state = 1;
        });
    },
    tick: function(t) {
        if (t - this.time < 10) return;
        let c = this.el;
        switch (this.state) {
            case 0:
                let xy = c.getAttribute('position');
                let loc = this.computeLoc(xy.x, xy.y, this.angle);
                this.angle = loc.a;
                c.setAttribute('position', {x: loc.x, y: loc.y});
                break;
            case 1:
                let m = this.movement;
                let xyz = c.getAttribute('position');
                c.setAttribute('position', {x: xyz.x + m.x, y: xyz.y + m.y, z: xyz.z + m.z});
                // if (movement.dest.x > c.getAttribute('position').x || movement.dest.y > c.getAttribute('position').y || movement.dest.z > c.getAttribute('position').z) {
                //     console.log("hit!");
                //     state = 0;
                // }
                break;
        }
    },
    computeLoc: function(x, y, a) {
        let angle = (a + this.d) % (2 * Math.PI);
    
        return {
            a: angle,
            x: 50 * Math.cos(angle),
            y: 50 * Math.sin(angle),
        }
    }
});