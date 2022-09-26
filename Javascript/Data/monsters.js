
//モンスターのdata

let monsters = {
    slime: {
        position: {
            x: 770,
            y: 300
        },
        image: {
            src: "img/slime.png"
        },
        frames: {
            max: 4,
            speed: 10
        },
        animate: true,
        isEnemy: true,
        hp: 50,
        totalhp: 50,
        name: "スライム",
        attacks: [attacks.tackle, attacks.poison]
    }
}