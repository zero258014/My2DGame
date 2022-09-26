
//戦闘背景生成
let battleBackgroundImage = new Image();
battleBackgroundImage.src = "img/battlebackground.png"
let battlebackground = new Sprite({
    position: {
        x: 0,
        y: 0
    },
    image: battleBackgroundImage
});


let slime
let playerBattle
let renderedSprites
let queue
let battleAnimationId

//戦闘発生(キャラ、モンスター、スキルを生成)
function initBattle() {
    document.querySelector("#userInterface").style.display = "block"
    document.querySelector("#dialogue").style.display = "none"
    document.querySelector("#monsterHp").style.width = "100%"
    document.querySelector("#playerHp").style.width = "100%"
    document.querySelector("#skillSelect").replaceChildren()


    slime = new BattleAction(monsters.slime)
    playerBattle = new BattleAction(characters.characterA)
    renderedSprites = [playerBattle, slime];
    queue = [];

    //キャラのスキルを生成
    playerBattle.attacks.forEach((attack) => {
        let button = document.createElement("button")
        button.innerHTML = attack.name
        document.querySelector("#skillSelect").append(button)
    })

    //スキル選択のボタン(攻撃)
    document.querySelectorAll("button").forEach(button => {

        //スキル選択(ボタン押したら)攻撃
        button.addEventListener("click", (e) => {
            //playerの攻撃
            let selectedAttack = "";
            switch (e.currentTarget.innerHTML) {
                case "斬撃":
                    selectedAttack = attacks.slash;
                    break;
                case "ファイヤーボール":
                    selectedAttack = attacks.fireball;
                    break;
            }
            playerBattle.attack({
                attack: selectedAttack,
                recipient: slime,
                renderedSprites
            })

            // モンスター死んだ
            if (slime.hp <= 0) {
                queue.push(() => {
                    slime.die();
                })
                //マップに戻る
                queue.push(() => {
                    gsap.to("#transition", {
                        opacity: 1,
                        onComplete: () => {
                            cancelAnimationFrame(battleAnimationId);
                            animate();
                            document.querySelector("#userInterface").style.display = "none";
                            gsap.to("#transition", {
                                opacity: 0,
                            })
                            battle.initiated = false;
                            audio.Town.play()
                        }
                    })
                })
            }

            //モンスターの攻撃
            let randomAttack = slime.attacks[Math.floor(Math.random() * slime.attacks.length)]
            queue.push(() => {
                slime.attack({
                    attack: randomAttack,
                    recipient: playerBattle,
                    renderedSprites
                })
                //playerが死んだ
                if (playerBattle.hp <= 0) {
                    queue.push(() => {
                        playerBattle.die();
                    })
                    //マップに戻る
                    queue.push(() => {
                        gsap.to("#transition", {
                            opacity: 1,
                            onComplete: () => {
                                cancelAnimationFrame(battleAnimationId);
                                animate();
                                document.querySelector("#userInterface").style.display = "none";
                                gsap.to("#transition", {
                                    opacity: 0,
                                })
                                battle.initiated = false;
                                audio.Town.play()
                            }
                        })
                    })
                }
            })
        })

        //スキル説明
        button.addEventListener("mouseenter", (e) => {
            let selectedAttack = "";
            switch (e.currentTarget.innerHTML) {
                case "斬撃":
                    selectedAttack = attacks.slash;
                    break;
                case "ファイヤーボール":
                    selectedAttack = attacks.fireball;
                    break;
            }
            document.querySelector("#describe").style.alignItems = "flex-start";
            document.querySelector("#describe").innerHTML = "<br>スキル説明:<br>" + selectedAttack.describe
            document.querySelector("#describe").style.color = selectedAttack.color
        })
    })
}
//戦闘シーンの関数
function animateBattle() {
    battleAnimationId = window.requestAnimationFrame(animateBattle);
    battlebackground.draw();
    renderedSprites.forEach((sprite) => {
        sprite.draw();
    })
}

// animate();
// initBattle();
// animateBattle();






//player行動終了後、会話クリックしたら、モンスターの攻撃開始
document.querySelector("#dialogue").addEventListener("click", (e) => {
    if (queue.length > 0) {
        queue[0]();
        queue.shift();
    } else {
        e.currentTarget.style.display = "none"
    }
})
