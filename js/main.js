var clickButtonBegin;
var tutorialScene;
var score = 0;
var timedEvent;
var timeDone = false;
var scoreText;
var createTarget;
var timerBar;
var bgBar;
var timerText;
var scoreboardText;
var targets;
var bgmusic;

class Tutorial extends Phaser.Scene{
    preload(){
      this.load.image('target', 'assets/target.png');
      this.load.image('bg', 'assets/bg.png');
      this.load.image('score', 'assets/score.png');
      this.load.image('retry', 'assets/retry.png');
      this.load.audio('click_sfx', 'assets/button.mp3');
      this.load.audio('spawn', 'assets/spawn.mp3');
      this.load.audio('kill', 'assets/kill.mp3');
      this.load.audio('dissapear', 'assets/dissapear.mp3');
    }
    create(){
      //var reset
      timeDone = false;
      score = 0;

      //Background
      this.add.image(0, 0, 'bg').setOrigin(0, 0);

      //Timer
      timedEvent = this.time.delayedCall(15000, this.endGame, [], this);

      //TimerBar
      bgBar = this.add.graphics();
      bgBar.x = 20;
      bgBar.y = 15;
      bgBar.fillStyle(0x000000, 1);
      bgBar.fillRect(0,0,610,60);
      timerBar = this.add.graphics(500,50);
      timerBar.x = 25;
      timerBar.y = 20;
      timerBar.fillStyle(0xFF0000, 1);
      timerBar.fillRect(0,0,600,50);
      timerText = this.add.text(25, 20, 'TIMER', {fontSize: '50px', fill: '#FFFFFF',});

      //Target Creation
      targets = this.physics.add.group({});
      createTarget = this.time.addEvent({delay: 400, callback: this.targetMake, callbackScope: this, repeat: -1});
      this.input.on('gameobjectdown', this.onClicked.bind(this));

      //Score
      scoreText = this.add.text(700, 20, '', {fontSize: '48px', color: '#000000'});
    }
    update(){//Update Score and TimerBar
      scoreText.setText('Score: ' + score);
      this.setValue(timerBar,timedEvent.getProgress());
    }
    onClicked(pointer, objectClicked){
        score += 10;
        this.sound.play('kill');
        objectClicked.setTint(0x990000);
        this.tweens.add({
            targets: objectClicked,
            alpha: {from:  1, to: 0},
            ease: 'linear',
            duration: 100,
        });
        let clearTarget = this.time.addEvent({ delay: 100, callback: function(){objectClicked.destroy();}, callbackScope: this});
    }
    endGame() {
     timeDone = true;
     targets.clear(true, true);
     this.add.image(500, 500, 'score').setOrigin(0.5, 0.5);
     scoreboardText = this.add.text(500, 450, 'Score: ' + score, {fontSize: '48px', color: '#000000'}).setOrigin(0.5, 0.5);
     this.add.image(500, 575, 'retry').setOrigin(0.5, 0.5).setScale(0.7).setInteractive().on('pointerdown', ()=>this.retry());
    }
    targetMake(){
      if(targets.countActive() <= 3 && timeDone == false)
      {
        let player = targets.create(Phaser.Math.Between(100, 900), Phaser.Math.Between(100, 900), 'target').setOrigin(0, 0).setInteractive();
        this.sound.play('spawn');
        player.setCollideWorldBounds(true);
        player.body.allowGravity = false;
        player.setBounce(1);
        player.setVelocityX(this.generateVelocity());
        player.setVelocityY(this.generateVelocity());
        let targetClear = this.time.addEvent({ delay: Phaser.Math.Between(5000, 10000), callback: function(){this.dissapearTarget(player)}, callbackScope: this});
      }
    }
    dissapearTarget(player){
      if(player.scene != undefined)
      {
        this.sound.play('dissapear');
        this.tweens.add({
            targets: player,
            alpha: {from:  1, to: 0},
            ease: 'linear',
            duration: 100,
        });
        let clearTarget = this.time.addEvent({ delay: 100, callback: function(){player.destroy();}, callbackScope: this});
      }
    }
    setValue(bar, percent){
      this.tweens.add({
          targets:  bar,
          scaleX:   1-(percent/1),
          duration: 100
      });
    }
    retry(){
        this.sound.play('click_sfx');
        this.scene.restart();
    }
    generateVelocity(){
      var posneg = Phaser.Math.RoundAwayFromZero(Phaser.Math.Between(-1, 1));
      if(posneg == 0)
      {
        posneg = 1;
      }
      return posneg*Phaser.Math.Between(300, 600);
    }
}

class MainMenu extends Phaser.Scene {
    preload(){
        this.load.image('title', 'assets/title.png');
        this.load.image('start', 'assets/start.png');
        this.load.audio('click_sfx', 'assets/button.mp3');
        this.load.audio('music', 'assets/music.mp3');
    }
    create(){
        bgmusic = this.sound.add('music',{
          loop: true,
          delay: 0,
          volume: 0.7
        });
        bgmusic.play();
        this.add.image(0, 0, 'title').setOrigin(0, 0);
        clickButtonBegin = this.add.image(500, 650, 'start').setOrigin(0.5,0.5).
          setInteractive().on('pointerdown',
          ()=>this.onClicked());
    }

    onClicked(){
        this.scene.remove('Tutorial');
        this.sound.play('click_sfx');
        clickButtonBegin.setTint(0x206900);
        tutorialScene = this.scene.add('Tutorial', Tutorial, true);
        clickButtonBegin.disableInteractive();
        this.scene.remove('MainMenu');
    }
}

var config = {
    type: Phaser.AUTO,
    width: 1000,
    height: 1000,
    backgroundColor: "#5D0505",
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
          default: 'arcade',
          arcade: {
              gravity: {y:800},
              //debug: true
              debug: false
          }
      },
    scene: [MainMenu],
};
var game = new Phaser.Game(config);
