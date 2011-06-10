(function() {

    // -----------------------------------------------------------------
    // Configuration
    // -----------------------------------------------------------------

    var FOX = {
        'width' : 572,
        'height' : 120,
        'player' : null,
        'score' : 0,
        'spawn' : {
            'min' : 400,
            'max' : 2000,
            'next' : null
        },
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
            },
            'ball' : {
                'size' : 16,
                'src' : 'ie.png'
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
            this.bind("enterframe", function() {
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

    /**
     * Moving component for entities moving from right to left.
     */
    Crafty.c("Moving", {
        init: function() {
            this.requires("2D, DOM");

            this.attr({
                x : Crafty.viewport.width,
                y : Crafty.viewport.height - FOX.sprites.floor.size - FOX.sprites.ball.size,
                speed : 5
            });

            this.bind("enterframe", function() {
                this._moveLeft();
            });
        },

        moving: function(speed) {
            this.speed = speed;
        },

        _moveLeft: function() {
            this.x -= this.speed;

            if (this._isOutside()) {
                this.destroy();
            }
        },

        _isOutside: function() {
            return (this.x <= - this.width);
        }
    });

    Crafty.c("Ennemy", {
        init: function() {
            this.requires("Collision");

            this.collision()
                .onHit("fox", function() {
                    FOX.player.hurt(1);
                    this.destroy();
                })
                ;
        },
    });

    Crafty.c("Health", {
        init: function() {
            this.health = 100;
        },

        hurt: function(aouch) {
            this.health -= aouch;
            if (this.health <= 0) {
                gameOver();
            }
        },
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
        Crafty.sprite(FOX.sprites.ball.size, FOX.sprites.ball.src, {
            ball: [0,0]
        });

        // Start the main scene when loaded
        Crafty.scene("start");
    });

    // -----------------------------------------------------------------
    // Functions
    // -----------------------------------------------------------------

    function gameOver() {
        clearInterval(FOX.spawn.next);
        Crafty("2D").destroy();
        Crafty.scene("start");
    }

    // -----------------------------------------------------------------
    // Scenes
    // -----------------------------------------------------------------

    Crafty.scene("start", function() {
        Crafty.background("url("+FOX.sprites.sky.src+")");

        var link = Crafty.e("2D, DOM, Text").text('<a href="#" id="play">Play</a>');

        Crafty.addEvent(
            this,
            link._element,
            "click",
            function() {
                Crafty.scene("main");
            }
        );
    });

    Crafty.scene("main", function() {
        Crafty.background("url("+FOX.sprites.sky.src+")");

        FOX.player = Crafty.e("2D, DOM, fox, Animation, TwowayRunning, Gravity, Inside, Collision, Health")
            .attr({
                x: 0,
                y: Crafty.viewport.height - FOX.sprites.fox.size - FOX.sprites.floor.size,
                health : 5
            })
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

        function spawn() {
            clearInterval(FOX.spawn.next);
            FOX.spawn.next = setInterval(
                function() {
                    Crafty.e("Moving, Ennemy, ball");
                    spawn();
                },
                Math.floor(Math.random() * (FOX.spawn.max - FOX.spawn.min + 1)) + FOX.spawn.min
            );
        }
        spawn();
    });

})();
