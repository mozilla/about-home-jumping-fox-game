(function() {

    // -----------------------------------------------------------------
    // Configuration
    // -----------------------------------------------------------------

    var FOX = {
        'width' : 572,
        'height' : 120,
        'player' : null,
        'life' : 5,
        'score' : 10,
        'spawn' : {
            'star' : {
                'min' : 600,
                'max' : 2000,
                'y' : 20,
                'speed' : 5,
                'next' : null
            },
            'ennemy' : {
                'min' : 400,
                'max' : 2000,
                'y' : 84,
                'speed' : 5,
                'next' : null
            },
            'superEnnemy' : {
                'min' : 3000,
                'max' : 10000,
                'y' : 84,
                'speed' : 8,
                'next' : null
            }
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
            'ennemy' : {
                'size' : 16,
                'src' : 'ie.png'
            },
            'superEnnemy' : {
                'size' : 16,
                'src' : 'ball.png'
            },
            'star' : {
                'size' : 16,
                'src' : 'star.png'
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
                    FOX.player.losing(2);
                    this.destroy();
                })
                ;
        },
    });

    Crafty.c("Star", {
        init: function() {
            this.requires("Collision");

            this.collision()
                .onHit("fox", function() {
                    FOX.player.winning(10);
                    this.destroy();
                })
                ;
        },
    });

    Crafty.c("Health", {
        init: function() {
            this.health = FOX.life;
        },

        hurt: function(aouch) {
            this.health -= aouch;
            if (this.health <= 0) {
                gameOver();
            }
        },
    });

    Crafty.c("Score", {
        init: function() {
            this.score = FOX.score;
        },

        winning: function(points) {
            this.score += points;
        },

        losing: function(points) {
            this.score -= points;
            if (this.score <= 0) {
                this.score = 0;
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
        Crafty.sprite(FOX.sprites.ennemy.size, FOX.sprites.ennemy.src, {
            ennemy: [0,0]
        });
        Crafty.sprite(FOX.sprites.superEnnemy.size, FOX.sprites.superEnnemy.src, {
            superEnnemy: [0,0]
        });
        Crafty.sprite(FOX.sprites.star.size, FOX.sprites.star.src, {
            star: [0,0]
        });

        // Start the main scene when loaded
        //~ Crafty.scene("start");
        Crafty.scene("main");
    });

    // -----------------------------------------------------------------
    // Functions
    // -----------------------------------------------------------------

    function gameOver() {
        clearInterval(FOX.spawn.star.next);
        clearInterval(FOX.spawn.ennemy.next);
        clearInterval(FOX.spawn.superEnnemy.next);
        Crafty.scene("gameover");
    }

    // -----------------------------------------------------------------
    // Scenes
    // -----------------------------------------------------------------

    Crafty.scene("start", function() {
        Crafty.background("url("+FOX.sprites.sky.src+")");
        Crafty.e("2D, DOM, Text").text('<a href="#" id="play" onclick="Crafty.scene(\'main\');">Play</a>');
    });

    Crafty.scene("gameover", function() {
        Crafty.background("url("+FOX.sprites.sky.src+")");
        Crafty.e("2D, DOM, Text").text('<a href="#" id="play" onclick="Crafty.scene(\'main\');">Play again?</a>');
        Crafty.e("2D, DOM, Text")
            .css("color", "red")
            .text('<p id="life">Life: ' + FOX.player.health + '</p>')
            ;
        Crafty.e("2D, DOM, Text")
            .text('<p id="score">' + FOX.player.score + '</p>')
            ;

    });

    Crafty.scene("main", function() {
        Crafty.background("url("+FOX.sprites.sky.src+")");

        FOX.player = Crafty.e("2D, DOM, fox, Animation, TwowayRunning, Gravity, Inside, Collision, Health, Score")
            .attr({
                x: 0,
                y: Crafty.viewport.height - FOX.sprites.fox.size - FOX.sprites.floor.size,
                health : FOX.life
            })
            .animate("walk", 1, 0, 4)
            .twoway(0, 7)
            .gravity("floor")
        ;

        // Life text
        Crafty.e("2D, DOM, Text")
            .css("color", "red")
            .bind("enterframe", function() {
                this.text('<p id="life">Life: ' + FOX.player.health + '</p>');
            })
            ;
        // Score text
        Crafty.e("2D, DOM, Text")
            .bind("enterframe", function() {
                this.text('<p id="score">' + FOX.player.score + '</p>');
            })
            ;

        // Floor (mainly for gravity)
        Crafty.e("2D, floor")
            .attr({
                x: 0,
                y: Crafty.viewport.height - FOX.sprites.floor.size,
                w: Crafty.viewport.width,
                h: FOX.sprites.floor.size
            })
        ;

        function spawn(type, components) {
            var spawnData = FOX.spawn[type];
            clearInterval(spawnData.next);
            spawnData.next = setInterval(
                function() {
                    Crafty.e("Moving, " + components).attr({y : spawnData.y, speed : spawnData.speed});
                    spawn(type, components);
                },
                Math.floor(Math.random() * (spawnData.max - spawnData.min + 1)) + spawnData.min
            );
        }
        spawn("ennemy", "Ennemy, ennemy");
        spawn("star", "Star, star");
        spawn("superEnnemy", "Ennemy, superEnnemy");
    });

})();
