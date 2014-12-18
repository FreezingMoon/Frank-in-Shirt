var time = 666;
var display;
var clothing = [];
var useful = [];
var damageAmplifier = 1;
var takingDamage = false;
var standing = true;
playTime = true;

var roomState = {
	preload: function() {
		// Load graphics
		// Levels
		// Bedroom
		game.load.image('room', 'assets/rooms/Room2.jpg');
		game.load.image('door', 'assets/doors/BedRoomDoorOpen.png');

		// Characters
		game.load.spritesheet('Frank', 'assets/chars/Frank_movement.png', 155, 235);
		game.load.image('naked', 'assets/chars/Frank_naked.png');
		game.load.image('snake', 'assets/chars/snake.png');

		// Items
		game.load.image('shirt', 'assets/items/shirt.png');
		game.load.image('boots', 'assets/items/boots.png');
		game.load.image('potion', 'assets/items/potion.png');

		// Load audio
		game.load.audio('damage', 'sounds/damage.wav');
		game.load.audio('pick', 'sounds/pick.mp3');
		game.load.audio('laugh', 'sounds/laugh.mp3');
	},

	create: function() {
		// Create graphical objects
		bedroom = game.add.group();
		this.room = bedroom.create(0, 0, 'room');
		this.door = bedroom.create(150, 500, 'door');
		this.door.anchor.setTo(0.5, 0.7);

		// Create audio objects
		damage = game.add.audio('damage');
		pickStuff = game.add.audio('pick');
		this.laugh = game.add.audio('laugh');

		// Default group for vertical sorting
		group = game.add.group();

		// TODO: Spawn Frank at a position with a direction
		this.Frank = group.create(700, 550, 'Frank');
		this.Frank.anchor.setTo(0.5, 0.95);
		this.Frank.direction = 'right';
		this.Frank.animations.add('walk-left', [1, 2, 3, 4, 5, 6, 7, 8], 8, true);
		this.Frank.animations.add('walk-right', [1, 2, 3, 4, 5, 6, 7, 8], 8, true);
		this.Frank.animations.add('walk-up', [19, 20, 21, 22, 23, 24, 25, 26], 8, true);
		this.Frank.animations.add('walk-down', [10, 11, 12, 13, 14, 15, 16, 17], 8, true);

		// Have Frank collide with stuff
		this.physics.arcade.enableBody(this.Frank);
		this.Frank.body.setSize(70, 20);
		this.Frank.body.collideWorldBounds = true;

		// Room margins
		roomLeftSide = new Phaser.Line(250, 375, 0, 720);
		roomRightSide = new Phaser.Line(1045, 375, 1280, 720);

		// Enable keys to move Frank
		this.cursor = this.input.keyboard.createCursorKeys();
		this.wasd = {
			left: this.input.keyboard.addKey(Phaser.Keyboard.A),
			right: this.input.keyboard.addKey(Phaser.Keyboard.D),
			up: this.input.keyboard.addKey(Phaser.Keyboard.W),
			down: this.input.keyboard.addKey(Phaser.Keyboard.S)
		};

		// Time remaining
		second = game.time.create();
		second.loop(100, this.remainingTime, this);
		second.start(1000);

		this.displayTime = game.add.text(game.world.centerX, 4 , time,
			{ font: '60px Arial', fill: '#FF0000', stroke: '#000000', strokeThickness: 3 });
		this.displayTime.anchor.set(0.5, 0);

		// Other chars

		// Add snake
		this.snake = group.create(250, 500, 'snake');
		game.physics.arcade.enable(this.snake);
		this.snake.body.height = 20;
		this.snake.anchor.setTo(0.5, 1);

		// Items

		// Add shirt
		this.shirt = group.create(32, 64, 'shirt');
		this.shirt.alpha = 0;
		this.shirt.anchor.setTo(0.5, 1);
		this.add.tween(this.shirt).to( { alpha: 1 }, 400, "Linear", true, 200, 4, true);
		clothing.push(this.shirt);

		// TODO: make a function to automate items
		// Add boots
		this.boots = group.create(600, 600, 'boots');
		game.physics.arcade.enable(this.boots);
		this.boots.body.height = 20;
		this.boots.anchor.setTo(0.5, 1);
		this.boots.myType = 'clothing';

		// Add potion
		this.potion = group.create(300, 600, 'potion');
		game.physics.arcade.enable(this.potion);
		this.potion.body.height = 20;
		this.potion.anchor.setTo(0.5, 1);
		this.potion.myType = 'useful';
	},

	update: function() {
		if(time > 0) {
			FrankLine = new Phaser.Line(this.Frank.body.position.x,
				this.Frank.body.position.y + this.Frank.body.height,
				this.Frank.body.position.x + this.Frank.body.width,
				this.Frank.body.position.y + this.Frank.body.height);
			leftMargin = FrankLine.intersects(roomLeftSide, true);
			rightMargin = FrankLine.intersects(roomRightSide, true);
			group.sort('y', Phaser.Group.SORT_ASCENDING);
			this.moveFrank();

			// Set Frank to normal
			this.Frank.blendMode = 0;

			damageAmplifier = 1;
			takingDamage = false;

			this.snakeMove();

			// Take damage
			game.physics.arcade.overlap(this.snake, this.Frank, this.takeDamage, null, this);

			// Pick items
			game.physics.arcade.overlap(this.boots, this.Frank, this.pickItem, null, this);
			game.physics.arcade.overlap(this.potion, this.Frank, this.pickItem, null, this);
		} else {this.gameOver();}
	},

	moveFrank: function() {
		var speed = 6;

		// TODO: improve directions
		// Left
		if (!leftMargin && (this.cursor.left.isDown || this.wasd.left.isDown) && (this.cursor.up.isUp && this.wasd.up.isUp) && (this.cursor.down.isUp && this.wasd.down.isUp)) {
			this.Frank.body.x -= speed;
			this.Frank.scale.x = -1;
			this.Frank.animations.play('walk-left');
			this.Frank.direction = 'left';
		}
		// Right
		else if (!rightMargin && (this.cursor.right.isDown || this.wasd.right.isDown) && (this.cursor.up.isUp && this.wasd.up.isUp) && (this.cursor.down.isUp && this.wasd.down.isUp)) {
			this.Frank.body.x += speed;
			this.Frank.scale.x = 1;
			this.Frank.animations.play('walk-right');
			this.Frank.direction = 'right';
		}
		// Up
		if (!(leftMargin || rightMargin) && (this.Frank.body.position.y > 375) && (this.cursor.up.isDown || this.wasd.up.isDown)) {
			this.Frank.body.y -= speed;
			this.Frank.animations.play('walk-up');
			this.Frank.direction = 'up';
		}
		// Down
		else if (this.cursor.down.isDown || this.wasd.down.isDown) {
			this.Frank.body.y += speed;
			this.Frank.animations.play('walk-down');
			this.Frank.direction = 'down';
		}
		else {
			if (this.cursor.left.isUp && this.wasd.left.isUp && this.Frank.direction == 'left') {
				this.Frank.scale.x = -1;
				this.Frank.frame = 0;
			}
			else if (this.cursor.right.isUp && this.wasd.right.isUp && this.Frank.direction == 'right') {
				this.Frank.scale.x = 1;
				this.Frank.frame = 0;
			}
			else if (this.cursor.up.isUp && this.wasd.up.isUp && this.Frank.direction == 'up') {
				this.Frank.scale.x = 1;
				this.Frank.frame = 18;
			}
			else if (this.cursor.down.isUp && this.wasd.down.isUp && this.Frank.direction == 'down') {
				this.Frank.scale.x = 1;
				this.Frank.frame = 9;
			}
		}
	},

	pickItem: function(item) {
		// When something is picked, add it to the UI and array based on it's type
		if(item.myType === 'clothing') {
			clothing.push(item);
			var placement = clothing.length * 64 - 32;

		} else {
			useful.push(item);
			var placement = 1280 - useful.length * 64 + 32;
		}
			item.anchor.setTo(0.5, 1);
			item.body.destroy();
			this.add.tween(item).to({ x: placement, y: 64 }, 1000).start();
			pickStuff.play();
	},

	remainingTime: function() {
		time = time - 0.1 * damageAmplifier;
		display = Math.floor(time);
		this.displayTime.setText(display);
	},

	snakeMove: function() {
		// pseudo code
		// constantly squeeze and stretch while moving, eventually turning back
		//var direction = right;
		//this.snake.anchor.setTo(1,1);
		//this.snake.scale.x = 0.5;
		if(standing) {
			standing = false;
			var ratio = 200;
			var delay = 800;
			var moves = 7;
			var moveRight = this.add.tween(this.snake).to( { x: '+100' }, ratio, "Linear", false, delay, moves);
			//moveRight = this.add.tween(this.snake.scale).to( { x: 1 }, 100);
			var moveLeft = this.add.tween(this.snake).to( { x: '-100' }, ratio, "Linear", false, delay, moves);
			//moveLeft = this.add.tween(this.snake.scale).to( { x: -1 });
			var turnLeft = this.add.tween(this.snake.scale).to( { x: -1 }, 0);
			moveRight.chain(turnLeft).chain(moveLeft).start();
		}



		//this.moveRight.onCompleteCallback(this.moveLeft);

		//this.moveLeft = this.add.tween(this.snake).to( { x: -600 }, 300, "Linear", true);
		//this.moveleft.onCompleteCallback(this.moveRight).start(500);
		//this.moveLeft.start();
	},

	takeDamage: function() {
		this.Frank.blendMode = 1;
		damageAmplifier = 5;
		takingDamage = true;
		if(!damage.isPlaying && takingDamage) {
			damage.play();
		}
	},

	gameOver: function() {
		this.naked = game.add.image(this.Frank.x, this.Frank.y, 'naked');
		this.Frank.destroy();

		if(!this.laugh.isPlaying && playTime) {
			this.laugh.play();
			this.laugh.onStop.addOnce(function() {
 				playTime = false;
			}, this);
		}
		
		this.naked.anchor.setTo(0.5, 0.95);
		this.displayTime.setText('GAME OVER');

		// Fade all the level stuff at once
		var fadingTime = 400;
		this.add.tween(bedroom).to( { alpha: 0 }, fadingTime, "Linear", true);
		this.add.tween(group).to( { alpha: 0 }, fadingTime, "Linear", true);
		this.add.tween(this.displayTime).to( { y: 130 }, fadingTime, "Linear", true);

		// Exit to menu
		if (playTime) {
			game.input.onUp.addOnce(function() {
				playTime = false;
				game.state.clearCurrentState();
 				game.state.start("main");
			});
			game.input.keyboard.onUpCallback = function () {
				playTime = false;
				game.state.clearCurrentState();
				game.state.start("main");
			}
		}
	},

	render: function() {
		if (debug) {
			// Collision debugger showing all bodies within group
			group.forEachAlive(this.renderGroup, this);
			game.debug.geom(roomLeftSide, 'rgb(255, 0, 0)');
			game.debug.geom(roomRightSide, 'rgb(255, 0, 0)');
			game.debug.geom(FrankLine, 'rgb(255, 0, 0)');
			//game.debug.text(roomLeftSide.x  + ' ' +  roomLeftSide.y, 300, 300, 'rgb(255, 0, 0)');
			//game.debug.text(roomRightSide.x + ' ' + roomRightSide.y, 300, 400, 'rgb(255, 0, 0)');
			game.debug.text('Frank\'s position: ' + FrankLine.x  + ' ' + FrankLine.y, game.world.centerX-120, 70, 'rgb(255, 0, 0)');
		}
	},

	renderGroup: function(member) {
		game.debug.body(member);
	},

	shutdown: function() {
		//game.input.onDown.removeAll();
		//game.input.onDown.dispose();
		//game.input.onUp.removeAll();
		//game.input.onUp.dispose();
	}
};

game.state.add('room', roomState);
