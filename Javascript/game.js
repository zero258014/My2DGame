let canvas = document.querySelector("canvas");
let c = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 576;


//地図上通らない座標
let collisionsMap = [];
for (let i = 0; i < collisions.length; i += 60) {
    collisionsMap.push(collisions.slice(i, 60 + i));
}

//通れないところ(壁とか)の配列
let boundaries = [];

//最初画面に表示される地図の座標
let offset = {
    x: -1700,
    y: -350
}
// 家の前の座標
//x: -100,
//y: -250
//くさの隣
//x: -1700,
//y: -350

//通れないところの座標を見えない画像を生成して、配列に入れる
collisionsMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 3661 || symbol === 1610616397) {
            boundaries.push(
                new Boundary({
                    position: {
                        x: j * Boundary.width + offset.x,
                        y: i * Boundary.height + offset.y
                    }
                })
            )
        }
    })
})

//戦闘エリア
let battleZonesMap = [];
for (let i = 0; i < battleZonesData.length; i += 60) {
    battleZonesMap.push(battleZonesData.slice(i, 60 + i));
}

let battleZones = [];
battleZonesMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 3661) {
            battleZones.push(
                new Boundary({
                    position: {
                        x: j * Boundary.width + offset.x,
                        y: i * Boundary.height + offset.y
                    }
                })
            )
        }
    })
})

//地図
let img = new Image();
img.src = "img/TownMap.png";

//キャラクタの画像のアドレス
let playerDownImage = new Image();
playerDownImage.src = "img/playerDown.png";
let playerUpImage = new Image();
playerUpImage.src = "img/playerUp.png";
let playerRightImage = new Image();
playerRightImage.src = "img/playerRight.png";
let playerLeftImage = new Image();
playerLeftImage.src = "img/playerLeft.png";



// キャラクタの画像を生成する
let player = new Sprite({
    position: {
        x: canvas.width / 2 - (186 / 4) / 2,
        y: canvas.height / 2 - (56 / 2),
    },
    image: playerDownImage,
    frames: {
        max: 4,
        speed: 10
    },
    sprites: {
        up: playerUpImage,
        down: playerDownImage,
        right: playerRightImage,
        left: playerLeftImage
    }
})


//地図の生成
let background = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    },
    image: img
});



//移動のボタン
let keys = {
    w: {
        pressed: false
    },
    s: {
        pressed: false
    },
    d: {
        pressed: false
    },
    a: {
        pressed: false
    }
}


let movables = [background, ...boundaries, ...battleZones]

//通れないところにぶつかったかどうか判定
function forbiddenZone({ object1, object2 }) {
    return (
        object1.position.x + object1.width >= object2.position.x &&
        object1.position.x <= object2.position.x + object2.width &&
        object1.position.y + object1.height / 2 <= object2.position.y + object2.height &&
        object1.position.y + object1.height >= object2.position.y
    )
}

//戦闘発生のスイッチ(true:戦闘発生した。地図上のキャラ動けない)
let battle = {
    initiated: false
}

//画面を出す関数
function animate() {
    let animationID = window.requestAnimationFrame(animate);
    background.draw();  //地図生成

    //通れないところ生成
    boundaries.forEach(Boundary => {
        Boundary.draw();
    })
    //戦闘エリア生成
    battleZones.forEach(battleZone => {
        battleZone.draw();
    })
    //キャラクタ生成
    player.draw();

    let moving = true;
    player.animate = false;

    //戦闘開始したら、ボタン押してもキャラ動かない
    if (battle.initiated) { return }

    //戦闘発生の判定
    if (keys.s.pressed || keys.a.pressed || keys.d.pressed || keys.w.pressed) {
        for (let i = 0; i < battleZones.length; i++) {
            let battleZone = battleZones[i];
            let overlappingArea =
                (
                    Math.min(player.position.x + player.width, battleZone.position.x + battleZone.width)
                    -
                    Math.max(player.position.x, battleZone.position.x)
                ) *
                (
                    Math.min(player.position.y + player.height, battleZone.position.y + battleZone.height)
                    -
                    Math.max(player.position.y, battleZone.position.y)
                );


            if (
                forbiddenZone({
                    object1: player,
                    object2: battleZone
                })
                &&
                overlappingArea > (player.width * player.height) / 2
                &&
                //モンスターの出現率
                Math.random() < 0.01
            ) {
                console.log("戦闘開始");
                // 戦闘開始前に動画(animate()関数)を停止する
                window.cancelAnimationFrame(animationID);


                //戦闘画面に遷移する
                audio.Town.stop();
                audio.Battle.play();
                battle.initiated = true;
                gsap.to("#transition", {
                    opacity: 1,
                    repeat: 4,
                    yoyo: true,
                    duration: 0.4,
                    onComplete() {
                        gsap.to("#transition", {
                            opacity: 1,
                            duration: 0.4,
                            onComplete() {
                                initBattle();
                                animateBattle();
                                gsap.to("#transition", {
                                    opacity: 0,
                                    duration: 0.4,
                                })
                            }
                        })


                    }
                })
                break;
            }
        }
    }



    //ボタン押すとキャラクタの移動
    if (keys.s.pressed && lastKey === "s") {
        player.animate = true;
        player.image = player.sprites.down;
        for (let i = 0; i < boundaries.length; i++) {
            let boundary = boundaries[i];
            if (
                forbiddenZone({
                    object1: player,
                    object2: {
                        ...boundary, position: {
                            x: boundary.position.x,
                            y: boundary.position.y - 3
                        }
                    }
                })
            ) {
                moving = false;
                break;
            }
        }


        //キャラクタ移動しても地図が動かない処理
        if (moving) {
            movables.forEach((movable) => {
                movable.position.y -= 4
            })
        }
    } else if (keys.a.pressed && lastKey === "a") {
        player.animate = true;
        player.image = player.sprites.left;
        for (let i = 0; i < boundaries.length; i++) {
            let boundary = boundaries[i];
            if (
                forbiddenZone({
                    object1: player,
                    object2: {
                        ...boundary, position: {
                            x: boundary.position.x + 3,
                            y: boundary.position.y
                        }
                    }
                })
            ) {
                moving = false;
                break;
            }
        }

        //キャラクタ移動しても地図が動かない処理
        if (moving) {
            movables.forEach((movable) => {
                movable.position.x += 4
            })
        }
    } else if (keys.d.pressed && lastKey === "d") {
        player.animate = true;
        player.image = player.sprites.right;
        for (let i = 0; i < boundaries.length; i++) {
            let boundary = boundaries[i];
            if (
                forbiddenZone({
                    object1: player,
                    object2: {
                        ...boundary, position: {
                            x: boundary.position.x - 4,
                            y: boundary.position.y
                        }
                    }
                })
            ) {
                moving = false;
                break;
            }
        }

        //キャラクタ移動しても地図が動かない処理
        if (moving) {
            movables.forEach((movable) => {
                movable.position.x -= 4
            })
        }
    } else if (keys.w.pressed && lastKey === "w") {
        player.animate = true;
        player.image = player.sprites.up;
        for (let i = 0; i < boundaries.length; i++) {
            let boundary = boundaries[i];
            if (
                forbiddenZone({
                    object1: player,
                    object2: {
                        ...boundary, position: {
                            x: boundary.position.x,
                            y: boundary.position.y + 4
                        }
                    }
                })
            ) {
                moving = false;
                break;
            }
        }

        //キャラクタ移動しても地図が動かない処理
        if (moving) {
            movables.forEach((movable) => {
                movable.position.y += 4
            })
        }
    }
};

animate();


//前の移動ボタン押していても、次の移動ボタンを押したらキャラクタも動ける処理
let lastKey = "";
window.addEventListener("keydown", (e) => {
    switch (e.key) {
        case "w":
            keys.w.pressed = true;
            lastKey = "w";
            break;
        case "s":
            keys.s.pressed = true;
            lastKey = "s";
            break;
        case "d":
            keys.d.pressed = true;
            lastKey = "d";
            break;
        case "a":
            keys.a.pressed = true;
            lastKey = "a";
            break;
    }

});

//移動ボタン押すと移動する処理
window.addEventListener("keyup", (e) => {
    switch (e.key) {
        case "w":
            keys.w.pressed = false;
            break;
        case "s":
            keys.s.pressed = false;
            break;
        case "d":
            keys.d.pressed = false;
            break;
        case "a":
            keys.a.pressed = false;
            break;
    }

});


let clicked = false

addEventListener("keydown", () => {
    if (!clicked) {
        audio.Town.play()
        clicked = true;
    }

})

