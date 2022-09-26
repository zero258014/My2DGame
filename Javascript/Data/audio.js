let audio = {
    Town: new Howl({
        src: "audio/town.mp3",
        html5: true,
        volume: 0.5,
        loop: true
    }),
    Battle: new Howl({
        src: "audio/battle.mp3",
        html5: true,
        volume: 0.1,
        loop: true
    }),
    FireballHit: new Howl({
        src: "audio/fireball.mp3",
        html5: true,
        volume: 0.6
    }),
    PoisonHit: new Howl({
        src: "audio/poison.mp3",
        html5: true,
        volume: 0.6
    }),
    SlashHit: new Howl({
        src: "audio/slash.mp3",
        html5: true,
        volume: 0.6
    }),
    TackleHit: new Howl({
        src: "audio/tackle.mp3",
        html5: true,
        volume: 0.6
    }),
    Victory: new Howl({
        src: "audio/victory.mp3",
        html5: true,
        volume: 0.4
    }),
}