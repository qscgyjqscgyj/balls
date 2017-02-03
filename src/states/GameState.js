import RainbowText from 'objects/RainbowText';

class GameState extends Phaser.State {
    startGame() {
        this.startButton.destroy();
        this.game.physics.arcade.checkCollision.down = false;
        this.playing = true;
    }

    initBricks() {
        this.brickInfo = {
            width: 50,
            height: 20,
            count: {
                row: 7,
                col: 10
            },
            offset: {
                top: 50,
                left: 60
            },
            padding: 10
        };
        this.bricks = this.game.add.group();
        for(let c = 0; c < this.brickInfo.count.col; c++) {
            for(let r = 0; r < this.brickInfo.count.row; r++) {
                let brickX = (r * (this.brickInfo.width + this.brickInfo.padding)) + this.brickInfo.offset.left;
                let brickY = (c * (this.brickInfo.height + this.brickInfo.padding)) + this.brickInfo.offset.top;
                let newBrick = this.game.add.sprite(brickX, brickY, 'brick');
                this.game.physics.enable(newBrick, Phaser.Physics.ARCADE);
                newBrick.body.immovable = true;
                newBrick.anchor.set(0.5);
                this.bricks.add(newBrick);            }
        }
    }

    ballHitPaddle(ball, paddle) {
        this.ball.animations.play('wobble');
        this.ball.body.velocity.x = -1 * 5 * (this.paddle.x - this.ball.x);
    }

    ballHitBrick(ball, brick) {
        if(this.playing) {
            let killTween = this.game.add.tween(brick.scale);
            killTween.to({x: 0, y: 0}, 200, Phaser.Easing.Linear.None);
            killTween.onComplete.addOnce(function(){
                brick.kill();
            }, this);
            killTween.start();
            this.score += 10;
            this.scoreText.setText('Points: ' + this.score);
            if(this.score === this.brickInfo.count.row * this.brickInfo.count.col * 10) {
                alert('You won the game, congratulations!');
                location.reload();
            }
        }
    }

    ballLeaveScreen() {
        this.lives--;
        if(this.lives) {
            this.livesText.setText('Lives: ' + this.lives);
            this.lifeLostText.visible = true;
            this.ball.reset(this.game.world.width*0.5, this.game.world.height-25);
            this.paddle.reset(this.game.world.width*0.5, this.game.world.height-5);
            this.game.input.onDown.addOnce(function(){
                this.lifeLostText.visible = false;
                this.ball.body.velocity.set(350, -350);
            }, this);
        }
        else {
            alert('You lost, game over!');
            location.reload();
        }
    }

	preload() {
		this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.game.scale.pageAlignHorizontally = true;
        this.game.scale.pageAlignVertically = true;
        this.game.stage.backgroundColor = '#eee';

        this.game.load.spritesheet('button', 'img/button.png', 120, 40);
        this.game.load.spritesheet('ball', 'img/wobble.png', 20, 20);
        this.game.load.image('paddle', 'img/paddle.png');
        this.game.load.image('brick', 'img/brick.png');
        this.textStyle = { font: '18px Arial', fill: '#0095DD' };
	}

	create() {
        this.game.physics.startSystem(Phaser.Physics.ARCADE);

        this.playing = false;
        this.startButton = this.game.add.button(this.game.world.width*0.5, this.game.world.height*0.5, 'button', this.startGame.bind(this), this, 1, 0, 2);
        this.startButton.anchor.set(0.5);

        this.ball = this.game.add.sprite(50, 250, 'ball');
        this.ball.animations.add('wobble', [0, 1, 0, 2, 0, 1, 0, 2, 0], 24);
        this.game.physics.enable(this.ball, Phaser.Physics.ARCADE);

        this.paddle = this.game.add.sprite(this.game.world.width*0.5, this.game.world.height-5, 'paddle');
        this.game.physics.enable(this.paddle, Phaser.Physics.ARCADE);

        this.score = 0;
        this.lives = 3;
        this.scoreText = this.game.add.text(5, 5, 'Points: 0', this.textStyle);
        this.livesText = this.game.add.text(this.game.world.width-5, 5, 'Lives: ' + this.lives, this.textStyle);
        this.lifeLostText = this.game.add.text(this.game.world.width*0.5, this.game.world.height*0.5, 'Life lost, click to continue', this.textStyle);
        this.livesText.anchor.set(1, 0);
        this.lifeLostText.anchor.set(0.5);
        this.lifeLostText.visible = false;

        this.ball.body.velocity.set(350, -350);
        this.ball.body.collideWorldBounds = true;
        this.ball.body.bounce.set(1);
        this.ball.anchor.set(0.5);
        this.ball.checkWorldBounds = true;
        this.ball.events.onOutOfBounds.add(this.ballLeaveScreen.bind(this));

        this.paddle.anchor.set(0.5,1);
        this.paddle.body.immovable = true;
        this.initBricks();
	}

	update() {
        this.game.physics.arcade.collide(this.ball, this.paddle, this.ballHitPaddle.bind(this));
        this.game.physics.arcade.collide(this.ball, this.bricks, this.ballHitBrick.bind(this));
        if(this.playing) {
            this.paddle.x = this.game.input.x || this.game.world.width*0.5;
        }
	}
}

export default GameState;
