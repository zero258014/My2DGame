
//主人公たちのdata

let characters = {
    characterA: {
        position: {
            x: 200,
            y: 300
        },
        image: {
            src: "img/playerRight.png"
        },
        frames: {
            max: 4,
            speed: 10
        },
        animate: true,
        hp: 100,
        totalhp: 100,
        name: "主人公",
        attacks: [attacks.slash, attacks.fireball]
    }
}