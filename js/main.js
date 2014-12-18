// Boolean: true of false
var debug = false;
var musicOn = true;
var playTime = false;

var mainState = {
	preload: function() {
		// Center the game canvas
		this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.scale.pageAlignHorizontally = true;
		this.scale.pageAlignVertically = true;
		this.scale.refresh();

		this.load.image('background', 'assets/menu/background.jpg');
		this.load.image('Frank', 'assets/menu/Frank.png');
		this.load.image('title', 'assets/menu/title.png');
		this.load.image('press', 'assets/menu/press.png');
		this.load.image('wasd', 'assets/menu/wasd.png');
		this.load.image('arrows', 'assets/menu/arrows.png');

		this.load.audio('music', 'sounds/track.mp3');
	},

	create: function() {
		this.physics.startSystem(Phaser.Physics.ARCADE);
		this.world.setBounds(0, 0, 1280, 720);

		// Music
		music = this.add.audio('music');
		if(musicOn) music.play();

		var background = this.add.sprite(0, 0, 'background');

		var Frank = this.add.sprite(440, 65, 'Frank');
		Frank.alpha = 0;
		this.add.tween(Frank).to( { alpha: 1 }, 3000, null, true, 500);

		var inside = game.add.text(770, 150 , 'in',
			{ font: '60px Arial', fill: '#ffffff'});
		inside.alpha = 0;
		this.add.tween(inside).to( { alpha: 1 }, 3000, null, true, 2000);

		var title = this.add.sprite(843, 129, 'title');
		title.alpha = 0;
		this.add.tween(title).to( { alpha: 1 }, 3000, null, true, 3500);

		var press = this.add.sprite(350, 400, 'press');
		press.alpha = 0;
		this.add.tween(press).to( { alpha: 1 }, 800, null, true, 6000).to( { alpha: 0 }, 800, null, true, 100, Number.MAX_VALUE, true);

		var loc = {'x': 335, 'y': 465};
		var arrow_keys = this.add.sprite(loc['x'], loc['y'], 'arrows');
		var wasd_keys = this.add.sprite(loc['x'], loc['y'], 'wasd');
		wasd_keys.alpha = 0;
		arrow_keys.alpha = 0;
		var show_keys = this.add.tween(wasd_keys).to( { alpha: 1 }, 400, null, false, 3000, Number.MAX_VALUE, true);
		this.add.tween(arrow_keys).to( { alpha: 1 }, 400, null, true, 6000, 0, false).chain(show_keys);

		this.cursor = this.input.keyboard.createCursorKeys();
		this.wasd = {
			left: this.input.keyboard.addKey(Phaser.Keyboard.A),
			right: this.input.keyboard.addKey(Phaser.Keyboard.D),
			up: this.input.keyboard.addKey(Phaser.Keyboard.W),
			down: this.input.keyboard.addKey(Phaser.Keyboard.S)
		}
	},

	update: function() {
		// For Debug purposes only
		if(debug) this.state.start('room');
		if(this.cursor.left.isDown || this.cursor.right.isDown || this.cursor.up.isDown || this.cursor.down.isDown || this.wasd.left.isDown || this.wasd.right.isDown || this.wasd.up.isDown || this.wasd.down.isDown) {
			this.state.start('room');
		}
	}
};

var game = new Phaser.Game(1280, 720, Phaser.AUTO, 'game');
game.state.add('main', mainState);
game.state.start('main');
