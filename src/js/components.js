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