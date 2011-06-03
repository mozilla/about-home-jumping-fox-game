(function() {

    // -----------------------------------------------------------------
    // Configuration
    // -----------------------------------------------------------------

    var FOX = {
        'width' : 572,
        'height' : 120,
        'sprites' : {
            'fox' : {
                'size' : 50,
                'src' : 'foxsheet.png'
            },
            'floor' : {
                'size' : 20,
                'src' : 'floor.png'
            },
            'sky' : {
                'src' : 'sky.jpg'
            }
        }
    }

    // -----------------------------------------------------------------
    // Components
    // -----------------------------------------------------------------

    /**
     * Eternal animation.
     */
    Crafty.c("Animation", {
        init: function() {
            // If the "animate" component is not added to this one, then add it
            this.requires("Animate");

            // Bind the "enterframe" event, called every time the frame is displayed
            this.bind("enterframe", function() {
                // If the animation is not playing anymore, then reload it
                if (!this.isPlaying("walk"))
                {
                    this.sprite(0, 0, 1, 1);        // Go back to the first sprite of the animation
                    this.animate("walk", 10);       // Launch the animation, changing sprite every 20ms
                }
            });
        },
    });

    /**
     * Twoway component but the caracter goes faster left than right.
     * This is used to simulate the moving ground.
     */
    Crafty.c("TwowayRunning", {
        _speed: 3,
        _up: false,

        init: function() {
            this.requires("controls");
        },

        twoway: function(speed,jump) {
            if(speed) this._speed = speed;
            jump = jump || this._speed * 2;

            this.bind("enterframe", function() {
                if (this.disableControls) return;
                if(this.isDown("RIGHT_ARROW") || this.isDown("D")) {
                    this.x += this._speed;
                }
                if(this.isDown("LEFT_ARROW") || this.isDown("A")) {
                    this.x -= this._speed * 2;
                }
                if(this._up) {
                    this.y -= jump;
                    this._falling = true;
                }
            }).bind("keydown", function() {
                if(this.isDown("UP_ARROW") || this.isDown("W")) this._up = true;
            });

            return this;
        }
    });

    /**
     * Inside component to make sure an entity cannot go outside the stage.
     */
    Crafty.c("Inside", {
        init: function() {
            this.requires("controls");
            this.bind("enterframe", function(speed,jump) {
                if (this.x < 0) {
                    this.x = 0;
                }
                if (this.x > Crafty.viewport.width - this.w) {
                    this.x = Crafty.viewport.width - this.w
                }

                return this;
            });
        }
    });

    // -----------------------------------------------------------------
    // Loading sprites
    // -----------------------------------------------------------------

    // Init the game
    Crafty.init(FOX.width, FOX.height);

    // Preload the needed assets
    Crafty.load([FOX.sprites.fox.src, FOX.sprites.sky.src], function() {
        // Splice the fox sprite
        Crafty.sprite(FOX.sprites.fox.size, FOX.sprites.fox.src, {
            fox: [0,0]
        });

        // Start the main scene when loaded
        Crafty.scene("main");
    });

    // -----------------------------------------------------------------
    // Scenes
    // -----------------------------------------------------------------

    Crafty.scene("main", function() {
        Crafty.background("url("+FOX.sprites.sky.src+")");

        var player = Crafty.e("2D, DOM, fox, Animation, TwowayRunning, Gravity, Inside")
            .attr({x: 0, y: Crafty.viewport.height - FOX.sprites.fox.size - FOX.sprites.floor.size})
            .animate("walk", 1, 0, 4)
            .twoway(0, 7)
            .gravity("floor")
        ;

        Crafty.e("2D, floor")
            .attr({
                x: 0,
                y: Crafty.viewport.height - FOX.sprites.floor.size,
                w: Crafty.viewport.width,
                h: FOX.sprites.floor.size
            })
        ;
    });

    console.log(FOX);

})();
