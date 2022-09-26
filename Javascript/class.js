
//通れないところ(壁とか)のクラス(object、生成して使う)
class Boundary {
    static width = 48;
    static height = 48;
    constructor({ position }) {
        this.position = position;
        this.width = 48
        this.height = 48
    }

    draw() {
        c.fillStyle = "rgba(255,0,0,0)"; //透明する
        c.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
}


//画像を生成するクラス(object、生成して使う)

class Sprite {
    //コンストラクタ
    constructor({
        position,
        image,
        frames = { max: 1, speed: 10 },
        sprites,
        animate = false,
        rotation = 0,

    }) {
        this.position = position;
        this.image = new Image();
        this.frames = { ...frames, val: 0, elapsed: 0 };

        this.image.onload = () => {
            this.width = this.image.width / frames.max;
            this.height = this.image.height;
        }

        this.image.src = image.src

        this.animate = animate;
        this.sprites = sprites;
        this.opacity = 1;

        this.rotation = rotation;

    }

    //メソッド
    draw() {
        c.save();
        c.translate(this.position.x + this.width / 2, this.position.y + this.height / 2);
        c.rotate(this.rotation);
        c.translate(-this.position.x - this.width / 2, -this.position.y - this.height / 2);
        c.globalAlpha = this.opacity;
        c.drawImage(
            this.image,
            this.frames.val * this.width,
            0,
            this.image.width / this.frames.max,
            this.image.height,
            this.position.x,
            this.position.y,
            this.image.width / this.frames.max,
            this.image.height,
        )
        c.restore();


        //キャラクタ移動の動画
        if (this.animate) {
            if (this.frames.max > 1) {
                this.frames.elapsed++;
            }

            if (this.frames.elapsed % this.frames.speed === 0) {
                if (this.frames.val < this.frames.max - 1) {
                    this.frames.val++;
                } else {
                    this.frames.val = 0;
                }
            }
        }
    }

}

//戦闘中の行動と攻撃の設定クラス(object,生成して使う)
class BattleAction extends Sprite {

    constructor({
        position,
        image,
        frames = { max: 1, speed: 10 },
        sprites,
        animate = false,
        rotation = 0,
        hp,
        totalhp,
        isEnemy = false,
        name,
        attacks
    }) {
        super({
            position,
            image,
            frames,
            sprites,
            animate,
            rotation,
        })
        this.name = name;
        this.isEnemy = isEnemy;
        this.hp = hp;
        this.totalhp = totalhp;
        this.attacks = attacks;
    }

    die() {
        document.querySelector("#dialogue").innerHTML = this.name + "が倒された！"
        gsap.to(this.position, {
            y: this.position.y + 20
        })
        gsap.to(this, {
            opacity: 0
        })
        audio.Battle.stop()
        audio.Victory.play()
    }

    //+ attack.name + "を使って"
    attack({ attack, recipient, renderedSprites }) {
        document.querySelector("#dialogue").style.display = "block";
        document.querySelector("#dialogue").innerHTML = this.name + "が" + attack.name + "を使って" + recipient.name + "に攻撃した！"
        let HpBar = "#monsterHp";
        if (this.isEnemy) {
            HpBar = "#playerHp"
        }

        let rotation = 0
        if (this.isEnemy) {
            rotation = -3.2
        }
        recipient.hp -= attack.damage;

        switch (attack.name) {
            case "斬撃":
                let tl = gsap.timeline();

                let movementDistance = 20
                if (this.isEnemy) {
                    movementDistance = -20
                }
                tl.to(this.position, {
                    x: this.position.x - movementDistance
                }).to(this.position, {
                    x: this.position.x + movementDistance * 2,
                    duration: 0.1,
                    onComplete: () => {
                        audio.SlashHit.play()
                        //ダメージを受けた
                        gsap.to(HpBar, {
                            width: recipient.hp / recipient.totalhp * 100 + "%"
                        })
                        if (recipient.hp <= 0) {
                            gsap.to(HpBar, {
                                width: 0
                            })
                        }

                        gsap.to(recipient.position, {
                            x: recipient.position.x + 10,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.07
                        })

                        gsap.to(recipient, {
                            opacity: 0,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.07
                        })
                    }
                }).to(this.position, {
                    x: this.position.x
                })
                break;

            case "ファイヤーボール":
                audio.FireballHit.play()
                let fireballImage = new Image()
                fireballImage.src = "img/fireball.png"
                let fireball = new Sprite({
                    position: {
                        x: this.position.x,
                        y: this.position.y
                    },
                    image: fireballImage,
                    frames: {
                        max: 4,
                        speed: 10
                    },
                    animate: true,
                    rotation
                })

                renderedSprites.splice(1, 0, fireball)

                gsap.to(fireball.position, {
                    x: recipient.position.x - 50,
                    y: recipient.position.y,
                    onComplete: () => {

                        //ダメージを受けた
                        gsap.to(HpBar, {
                            width: recipient.hp / recipient.totalhp * 100 + "%"
                        })
                        if (recipient.hp <= 0) {
                            gsap.to(HpBar, {
                                width: 0
                            })
                        }

                        gsap.to(recipient.position, {
                            x: recipient.position.x + 10,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.07
                        })

                        gsap.to(recipient, {
                            opacity: 0,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.07
                        })

                        renderedSprites.splice(1, 1);
                    }
                })
                break;

            case "たいあたり":
                let tl2 = gsap.timeline();

                let movementDistance2 = 20
                if (this.isEnemy) {
                    movementDistance2 = -20
                }
                tl2.to(this.position, {
                    x: this.position.x - movementDistance2
                }).to(this.position, {
                    x: this.position.x + movementDistance2 * 2,
                    duration: 0.1,
                    onComplete: () => {
                        audio.TackleHit.play()
                        //ダメージを受けた
                        gsap.to(HpBar, {
                            width: recipient.hp / recipient.totalhp * 100 + "%"
                        })

                        if (recipient.hp <= 0) {
                            gsap.to(HpBar, {
                                width: 0
                            })
                        }

                        gsap.to(recipient.position, {
                            x: recipient.position.x + 10,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.07
                        })

                        gsap.to(recipient, {
                            opacity: 0,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.07
                        })
                    }
                }).to(this.position, {
                    x: this.position.x
                })
                break;

            case "毒ガス":
                let poisonImage = new Image()
                poisonImage.src = "img/poison.png"
                let poison = new Sprite({
                    position: {
                        x: recipient.position.x,
                        y: recipient.position.y
                    },
                    image: poisonImage,
                    frames: {
                        max: 4,
                        speed: 10
                    },
                    animate: true,
                    rotation
                })

                renderedSprites.splice(1, 0, poison)

                gsap.to(poison.position, {
                    x: recipient.position.x - 60,
                    y: recipient.position.y - 60,
                    onComplete: () => {
                        audio.PoisonHit.play();
                        //ダメージを受けた
                        gsap.to(HpBar, {
                            width: recipient.hp / recipient.totalhp * 100 + "%"
                        })
                        if (recipient.hp <= 0) {
                            gsap.to(HpBar, {
                                width: 0
                            })
                        }

                        gsap.to(recipient.position, {
                            x: recipient.position.x + 10,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.07
                        })

                        gsap.to(recipient, {
                            opacity: 0,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.07
                        })

                        renderedSprites.splice(1, 1);
                    }
                })
                break;
        }
    }
}