var playState = {
    
	create: function () {
        game.time.advancedTiming = true;
        game.renderer.antialias = false;
        game.time.desiredfps = 30;
        
        var tempKey = {
            left: Phaser.Keyboard.A,
            right: Phaser.Keyboard.D,
            up: Phaser.Keyboard.W,
            down: Phaser.Keyboard.S,
            jump: Phaser.Keyboard.W,
        };
        
        this.input = new this.PlayerControl(tempKey);
        
        this.bg = this.game.add.image(0, 0, 'bg');
        this.bg.smoothed = false;
        this.bg.width *= 6;
        this.bg.height *= 6;
        this.bg.visibility = 0;
        game.world.setBounds(0, 0, this.bg.width, this.bg.height);
        
//        this.wm = game.make.bitmapData(game.world.width, game.world.height);
//        this.wm.draw('wm', 0,0);
//        this.wm.update();
//        this.wm.addToWorld();
//        console.log(this.wm.getFirstPixel(0));
//        console.log(this.wm.getFirstPixel(1));
//        console.log(this.wm.getFirstPixel(2));
//        console.log(this.wm.getFirstPixel(3));
        //console.log(this.wm.getPixel(game.world.centerX + 10, game.world.centerY + 10).r);
        
        this.player = this.game.add.sprite(game.world.centerX/2, -20 + game.world.centerY, 'demoman');
        game.physics.arcade.enable(this.player);
        
        this.tempGround = this.game.add.sprite(0, game.world.centerY+87, null);
        game.physics.arcade.enable(this.tempGround);
        this.tempGround.body.immovable = true;
        this.tempGround.body.setSize(game.world.width, 40);
        this.tempGround.body.friction = new Phaser.Point(1, 1);
        
        this.player.anchor.setTo(0.5, 0.5);
        this.player.smoothed = false;
        this.player.scale.setTo(2, 2);
        
        this.player.body.setSize(9, 18, 0, 12);
        this.player.body.collideWorldBounds = true;
        this.player.body.maxVelocity = new Phaser.Point(450, 450);
        
        game.camera.follow(this.player);
        game.camera.bounds = null;
        
        this.input = new this.PlayerControl(tempKey);
        this.player.stat = new this.CharacterStat();
        this.characterController = new this.CharacterControl(this.input, this.player.body, this.player.stat);
        
        this.createWallmask = function(mapName) {
            wm = game.make.bitmapData(0,0);
            wm.load(mapName);
//            console.log(wm.getFirstPixel(0));
//            console.log(wm.width + '\t' + wm.height);
//            
//            this.spriteWm = game.add.group();
//            this.spriteWm.enableBody = true;
//            
//            this.map = game.add.tilemap('map');
//            this.map.addTilesetImage('tileset');
//            this.map.create('layer', wm.width, wm.height, 6, 6);
//            this.layer = this.map.createLayer('Tile Layer 1');
//            this.layer.resizeWorld();
//            this.map.setCollision(1);
//            this.walls.putTile(1, game.world.centerX/2, -20 + game.world.centerY, this.layer);
            
            for (var incHeight = 100; incHeight < 140; incHeight++) {
                for (var incWidth = 100; incWidth < 150; incWidth++) {
                    if (wm.getPixelRGB(incWidth, incHeight).r === 0) {
//                        this.walls.putTile(0, incWidth, incHeight, this.layer);
//                        wall = game.add.sprite(incWidth * 6, incHeight * 6, 'testTile', 0, this.spriteWm);
//                        wall.body.setSize(6,6);
                    }
                }
            }
//            this.walls.setAll('body.immovable', true);
        }
        
        this.createWallmask('wm');
	},
 
	update: function () {
        game.physics.arcade.collide(this.player, this.layer);
        game.physics.arcade.collide(this.player, this.tempGround);
        this.input.update();
        this.characterController.update();
	},
    
    render: function () {
        game.debug.text("fps: " + game.time.fps, 16, 16);
//        game.debug.text("elapsed: " + game.time.elapsed, 16, 32);
//
//        game.debug.text("physicsElapsed: " + game.time.physicsElapsed, 16, 48);
//        
//        game.debug.cameraInfo(game.camera, 32, 32);
//        
//        game.debug.body(this.player);
//        game.debug.body(this.tempGround);

        game.debug.text("velocity.x: " + this.player.body.velocity.x, 432, 64);
        game.debug.text("velocity.y: " + this.player.body.velocity.y, 432, 80);
//        game.debug.text("gravity: " + this.player.body.gravity.y, 432, 80);
//        game.debug.text("jumpInitialVelocity: " + this.player.stat.jumpInitialVelocity, 432, 96);
//        game.debug.text("jumpsRemaining: " + this.characterController.jumpsRemaining, 432, 112);
//        game.debug.text("jumpKeyCleared: " + this.input.jumpKeyCleared, 432, 96);
        game.debug.text("acceleration.x: " + this.player.body.acceleration.x, 432, 32);
    },
    
    CharacterStat: function () {
        this.update = function (newStats) {
            this.VELOCITY_MAX = newStats.VELOCITY_MAX ? newStats.VELOCITY_MAX : 170999;
            this.ACCELERATION_MAX = newStats.ACCELERATION_MAX ? newStats.ACCELERATION_MAX : 76599;
            this.FRICTION_MULTIPLIER = newStats.FRICTION_MULTIPLIER ? newStats.FRICTION_MULTIPLIER : 0;
        }
        this.convertGG2Parameters = function (runPower, controlFactor, frictionFactor, tickRate) {
            // The maximum value velocity reaches is when the velocity lost from "body.velocity.x /= frictionFactor"
            // is equal to the acceleration "runPower * controlFactor * 30fps"
            // When runPower === 1, this value is 195.5 pixels per second
            // The maximum velocity actually applied is (195.5 / frictionFactor), or 170 pixels per second
            var stat = {};
            stat.FRICTION_MULTIPLIER = (frictionFactor - 1) / frictionFactor * tickRate;
            stat.ACCELERATION_MAX = runPower * controlFactor * Math.pow(tickRate, 2);
            stat.VELOCITY_MAX = runPower * controlFactor / (frictionFactor - 1) * tickRate;
            // Compensate for (velocity loss from friction per frame) by raising VELOCITY_MAX by that amount
            stat.VELOCITY_MAX += stat.VELOCITY_MAX * stat.FRICTION_MULTIPLIER * game.time.physicsElapsed;
            return stat;
        }
        this.gg2Stats = this.convertGG2Parameters(51, 0.85, 1.15, 30);
        this.update(this.gg2Stats);

        // All values expressed in pixels and seconds unless otherwise noted.
        this.JUMP_HEIGHT = 60;
        this.JUMP_TIME = 0.915;
        this.GRAVITY = 2 * this.JUMP_HEIGHT / Math.pow(0.5 * this.JUMP_TIME, 2); 
        this.JUMP_VELOCITY = this.JUMP_TIME * 0.5 * this.GRAVITY;
        this.VELOCITY_TERMINAL = 300;
        this.JUMP_MAX = 1;  // Unitless, -1 indicates infinite
    },
    
    PlayerControl: function (userMoveKey) {        
        this.update = function () {
            // If opposite keys are held down we don't want to move in either direction. So check that the opposite key isn't down.
            this.moveLeft = this.key.left.isDown && !this.key.right.isDown;
            this.moveRight = !this.key.left.isDown && this.key.right.isDown;
            this.moveUp = this.key.up.isDown && !this.key.down.isDown;
            this.moveDown = !this.key.up.isDown && this.key.down.isDown;
            
            this.moveJump = this.key.jump.isDown && !this.moveJumpPrev;
            this.moveJumpPrev = this.key.jump.isDown;
        }
        
        // imma put key mapping stuff here later i guess
        
        this.key = {
            left: game.input.keyboard.addKey(userMoveKey.left),
            right: game.input.keyboard.addKey(userMoveKey.right),
            up: game.input.keyboard.addKey(userMoveKey.up),
            down: game.input.keyboard.addKey(userMoveKey.down),
            jump: game.input.keyboard.addKey(userMoveKey.jump)
        };
        
        // addKeyCapture stops keypresses from being sent to browser, eg. arrow keys scroll the page. Doesn't do anything in chrome right now.
        for (key in userMoveKey) {
            game.input.keyboard.addKeyCapture(key);
        }
    },
    
    CharacterControl: function (input, body, stat) {
        
        body.gravity.y = stat.GRAVITY;
        // Give character all available jumps on spawn
        this.jumpsRemaining = stat.JUMP_MAX;
        
        this.update = function () {
            // Why are we applying friction every frame regardless of input?
            // <wareya> because that puts a soft cap on the speed
            // Unfortunately that soft cap increases linearly with physics framerate.
            // So to fix that we calculate a cap on velocity that doesn't change when physics slows down.
            // Its a soft cap because addUntilMax() doesn't touch acceleration when velocity is over the maximum.
            body.acceleration.x = -body.velocity.x * stat.FRICTION_MULTIPLIER;
            
            if (input.moveLeft)
                body.acceleration.x -= this.addUntilMax(-body.velocity.x, stat.ACCELERATION_MAX, stat.VELOCITY_MAX);
            else if (input.moveRight)
                body.acceleration.x += this.addUntilMax(body.velocity.x, stat.ACCELERATION_MAX, stat.VELOCITY_MAX);
            
            if (Math.abs(body.velocity.x) < 5) body.velocity.x = 0;
            
            
            if (body.touching.down || body.onFloor())
                this.jumpsRemaining = stat.JUMP_MAX;
            else if (this.jumpsRemaining === stat.JUMP_MAX)
                this.jumpsRemaining--;  // Remove a jump if character becomes airborne without jumping.
            
            if (input.moveJump && this.jumpsRemaining !== 0){
                body.velocity.y = -stat.JUMP_VELOCITY;
                this.jumpsRemaining--;
            }
            
            body.gravity.y = this.addUntilMax(body.velocity.y, stat.GRAVITY, stat.VELOCITY_TERMINAL);
        }
        
        // Add inc to total, keeping total <= max. Use positive numbers.
        this.addUntilMax = function (total, inc, max) {
            if (total > max)
                return 0;
            if (total + inc * game.time.physicsElapsed <= max)
                return inc;
            else
                return (max - total) / game.time.physicsElapsed;
        }
    },
};