// Setup
const canvas = document.getElementById("world");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const {Engine, Render, World, Bodies, Body, Constraint, Mouse, MouseConstraint, Composite} = Matter;

const engine = Engine.create();
const world = engine.world;

// Rendering
const render = Render.create({
    canvas: canvas,
    engine: engine,
    options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: "#2c2f33"
    }
});

Render.run(render);

// Floor
const floor = Bodies.rectangle(window.innerWidth / 2, window.innerHeight - 30, window.innerWidth, 60, {
    isStatic: true,
    render: { fillStyle: "#222" }
});
World.add(world, floor);

// Ragdoll
function createPerson(x, y) {
    // Body parts sizes
    const head = Bodies.circle(x, y, 18, {density: 0.001, friction: 0.1, restitution: 0.2, render: {fillStyle: "#e0e0e0"}});
    const torso = Bodies.rectangle(x, y + 38, 18, 56, {density: 0.002, friction: 0.1, restitution: 0.2, render: {fillStyle: "#e0e0e0"}});
    const upperArmL = Bodies.rectangle(x - 20, y + 28, 36, 12, {density: 0.001, friction: 0.1, restitution: 0.2, render: {fillStyle: "#b0b0b0"}});
    const upperArmR = Bodies.rectangle(x + 20, y + 28, 36, 12, {density: 0.001, friction: 0.1, restitution: 0.2, render: {fillStyle: "#b0b0b0"}});
    const lowerArmL = Bodies.rectangle(x - 42, y + 28, 32, 10, {density: 0.001, friction: 0.1, restitution: 0.2, render: {fillStyle: "#888"}});
    const lowerArmR = Bodies.rectangle(x + 42, y + 28, 32, 10, {density: 0.001, friction: 0.1, restitution: 0.2, render: {fillStyle: "#888"}});
    const upperLegL = Bodies.rectangle(x - 9, y + 78, 12, 38, {density: 0.001, friction: 0.1, restitution: 0.2, render: {fillStyle: "#b0b0b0"}});
    const upperLegR = Bodies.rectangle(x + 9, y + 78, 12, 38, {density: 0.001, friction: 0.1, restitution: 0.2, render: {fillStyle: "#b0b0b0"}});
    const lowerLegL = Bodies.rectangle(x - 9, y + 108, 10, 32, {density: 0.001, friction: 0.1, restitution: 0.2, render: {fillStyle: "#888"}});
    const lowerLegR = Bodies.rectangle(x + 9, y + 108, 10, 32, {density: 0.001, friction: 0.1, restitution: 0.2, render: {fillStyle: "#888"}});

    // Constraints (joints)
    const constraints = [
        Constraint.create({bodyA: head, pointA: {x:0, y:18}, bodyB: torso, pointB: {x:0, y:-28}, stiffness: 0.6}),
        Constraint.create({bodyA: torso, pointA: {x:-9, y:-24}, bodyB: upperArmL, pointB: {x:18, y:0}, stiffness: 0.6}),
        Constraint.create({bodyA: torso, pointA: {x:9, y:-24}, bodyB: upperArmR, pointB: {x:-18, y:0}, stiffness: 0.6}),
        Constraint.create({bodyA: upperArmL, pointA: {x:-18, y:0}, bodyB: lowerArmL, pointB: {x:16, y:0}, stiffness: 0.5}),
        Constraint.create({bodyA: upperArmR, pointA: {x:18, y:0}, bodyB: lowerArmR, pointB: {x:-16, y:0}, stiffness: 0.5}),
        Constraint.create({bodyA: torso, pointA: {x:-5, y:28}, bodyB: upperLegL, pointB: {x:0, y:-18}, stiffness: 0.8}),
        Constraint.create({bodyA: torso, pointA: {x:5, y:28}, bodyB: upperLegR, pointB: {x:0, y:-18}, stiffness: 0.8}),
        Constraint.create({bodyA: upperLegL, pointA: {x:0, y:18}, bodyB: lowerLegL, pointB: {x:0, y:-16}, stiffness: 0.6}),
        Constraint.create({bodyA: upperLegR, pointA: {x:0, y:18}, bodyB: lowerLegR, pointB: {x:0, y:-16}, stiffness: 0.6}),
    ];

    const parts = [head, torso, upperArmL, upperArmR, lowerArmL, lowerArmR, upperLegL, upperLegR, lowerLegL, lowerLegR];

    const group = Body.nextGroup(true);
    parts.forEach(b => b.collisionFilter.group = group);

    World.add(world, [...parts, ...constraints]);
    return {parts, constraints};
}

// Box
function createBox(x, y) {
    const w = 60 + Math.random()*40;
    const h = 30 + Math.random()*30;
    const box = Bodies.rectangle(x, y, w, h, {
        restitution: 0.2,
        friction: 0.8,
        density: 0.002,
        render: {fillStyle: "#66b1ff"}
    });
    World.add(world, box);
    return box;
}

// Mouse control
const mouse = Mouse.create(render.canvas);
const mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
        stiffness: 0.2,
        render: {visible: false}
    }
});
World.add(world, mouseConstraint);

// Buttons
document.getElementById("add-person").onclick = () => {
    createPerson(150 + Math.random()*300, 100);
};
document.getElementById("add-box").onclick = () => {
    createBox(150 + Math.random()*300, 100);
};
document.getElementById("clear").onclick = () => {
    World.clear(world, false);
    World.add(world, floor);
};

// Responsive resize
window.addEventListener("resize", () => {
    render.canvas.width = window.innerWidth;
    render.canvas.height = window.innerHeight;
    Render.lookAt(render, {
        min: {x: 0, y: 0},
        max: {x: window.innerWidth, y: window.innerHeight}
    });
    Body.setPosition(floor, {x: window.innerWidth / 2, y: window.innerHeight - 30});
    Body.setVertices(floor, [
        {x: 0, y: window.innerHeight - 60},
        {x: window.innerWidth, y: window.innerHeight - 60},
        {x: window.innerWidth, y: window.innerHeight},
        {x: 0, y: window.innerHeight}
    ]);
});

// Start engine
Engine.run(engine);
