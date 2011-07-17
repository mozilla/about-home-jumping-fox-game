(function() {

    // -----------------------------------------------------------------
    // Configuration
    // -----------------------------------------------------------------

    var FOX = {
        'width' : 572,
        'height' : 120,
        'player' : null,
        'life' : 1,
        'score' : 0,
        'newHighScore' : false,
        'entities' : {
            'star' : {
                'attr' : {
                    'y' : 20,
                    'speed' : 5
                },
                'spawn' : {
                    'min' : 600,
                    'max' : 2000,
                    'next' : null
                },
                'sprite' : {
                    'size' : 16,
                    'src' : 'star.png'
                }
            },
            'enemy' : {
                'attr' : {
                    'y' : 84,
                    'speed' : 5,
                },
                'spawn' : {
                    'min' : 400,
                    'max' : 2000,
                    'next' : null
                },
                'sprite' : {
                    'size' : 16,
                    'src' : 'ie.png'
                }
            },
            'superEnemy' : {
                'attr' : {
                    'y' : 84,
                    'speed' : 8,
                },
                'spawn' : {
                    'min' : 3000,
                    'max' : 10000,
                    'next' : null
                },
                'sprite' : {
                    'size' : 16,
                    'src' : 'chrome.png'
                }
            },
            'player' : {
                'sprite' : {
                    'size' : 50,
                    'src' : 'foxsheet.png'
                }
            },
            'floor' : {
                'sprite' : {
                    'size' : 20,
                    'src' : 'floor.png'
                }
            },
            'sky' : {
                'sprite' : {
                    'src' : 'sky.jpg'
                }
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
            this.requires("2D, Canvas");

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

    Crafty.c("Enemy", {
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
    Crafty.canvas();

    var spritesImg = new Image();
    spritesImg.src = "iVBORw0KGgoAAAANSUhEUgAAAPoAAAAyCAIAAAD6NVGzAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A /wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9sGAhYNHV9ntjEAAAydSURBVHja 7Z1tTFTpFccPrhZJlpdAWspLYTCmUJih3QEcnd1oJ8haxzVEu6WlCQZfkIw7UhIbNEajRk0NiQkV lOi6hZVEDTFVapyNITgpdZFRuW6Zi0K7EXBxWJpilpfEdZuWfjhwfLzDXO7M3HtnjPd8MAPDMOee 83v+55znPoMRMzMzoJlmb4Yt0kKgmYa7ZpppuGummYa7ZpppuGummYb7m2FbizfqUlM0rzTcZc7f 1uKNYeiVs4fTvNJwl9+cPVwwxDfvtDTvtChHWHhqhIa7SiYvXk1t14Mh3mbWlZ91ZiclyutYU9t1 S54x3NZemHgVwoKsNu5K4DU08jQw4m1mXdXe/RP8zRWHLzfvtGQnJaJj8pr0XlmhtReGXoWqIC9S mXWF8ELi9T96298gOtqd+yorH/3lXHZS4vP83zwcHZNRSv/+2Z/qjtklCqo6ay8cvAphQVZb3ZXD a2jkaf21zrpj9gn3TYlRM+kz8LHrxiUAuM11Z2z8nYwXe/5ss19Sqlxwws2rUBVk9XBXAS8MYvWB Bl1qiueQvcVqFinlJn1GdlJiwndf44Os/Kyi/w0NXv+jxNUixfY0XKo+0ICbIeJ5VSE44eZVSAqy SrirgxcAxBrWOXs4S57R/MnVwgLjvMTrUlMOW3+MqpCdlLh545qs/CwAyMrPyk5KvFp/Ql6XyHwt P9WCE25eqV+QI1Q4AMzihVTRU/33+x+Ojm3avS/WsE7eIcySZ0QBK3k+VTs+iUktc3ShpK1JnMb8 sS+c0a2K1a8DANu7usauIblq2rffN9BuNzoTwuCEoVcT7ptYbbq2b+q4x2GORChCOcf0+evMYr8w ovnG2cNhMUKrSYgxmPQA4HbxgsAheQDTgqghXis+OLzCf7xO2kv3NFzy9ez6tCWfPfkP5vJobrrb xdvMuuiBZwaTvsVqPtg7XFFRlmFc+RygrbEWX5JmqwGAy5WVm1vPdd5uavx8yGaWjfg1idNOAADA dCodnNfOq1jDOmfPNizIXds3tVjN3sQLCjJ5lZWfBffhav2JTbtBCvF+qDs72SD3dcfs5882819N r0mcfj8pBwA67nFuFz+VGU+x0KWmVFSUvWdcCQBPBHj9oRrxOvrrS9LDd9Jeai2yONqdvoi3mXUA YNJnvDXywu3iP7RbH46OufjBqr37He3O+mudFRVls7py6gwAGEz6Ytv7/ff7m9q7Gz8fKt6ZCQAn Ptjzk+KdMg4tb428QDnA4LRYzW4X3xoVLW9wXlOvVCvIfqj70MhTmiqoDu6oLK8+0PDXsbcPO66i VADAf1MjcYJ2tKOCwG2uGwAmXDzi9Q580X+/HwCKUt5v6Nhd3JF5Yu9+iW5YiyzJy9KtRT63n/Cy axJiAGAqM/7h6BiqAr2K5/qWG3PYl6AzW4tW2t7VJQNU7d2fvCz9pL30S+4O/cKArbFrCJ0BAFx7 GJx/LXPCtU55g/OaeqVaQV7sl1u4Y4q2tXhj9YEGFn1S9w8LrErjlbws/VHbORGNp54KxX7T7n3k Uv1HRwCAXHK7+MyCNAB4ODqGnqBg7KiEuNzLANAYdDrRGZtZF/K1F7ZerU9bIizIAPmV5Y52J/QO y7X8ZBhVqXlw8YPRA8+mMuNN+gzECwA8j4fXf3TEkmdcbszB5gHlBPEybSglvCb4m3G5vwAAcZce tZ1LXpZOX3oeD+OQPjuw84OC0GPzg7n0PB7Gfx3tzoTvvsZGEH9M4Az6gz8pMicE1kIoF5zX2isq yLgRhDMopoD/ahqXH/WfqFAA0NTeDXPL7/zZZvHl5x/u7E5QqPDC34/ED1xpEjyLYzvr1Ul7KbZA jnbnjspyyii5RBeCIaNncYs6yDsMgiiF1doLT0VQdPlJwh3D4bpxyfsOVkjwetR2Dh9Mcbfm/QGc TYkwavoxo/gl3lxEMUCr2rsf72IEljwpUVpuXKXy2vO5bx1SRQjV8lsAd3EpDRVeImARW9lJiVjm TPqM8e/9EHPJBhHf+gePhwsLjACQfKQhgOJrMOnx5RPGXIlRIuIVXXu+QGdZEZQd9b0Sya9Cy88n 7izoaL4SiYMO5lJRvOZNIUu84H6yix/EHCNkOyrLz59tpi0ddK9p2++xF/R1d0O80QSA1qhoS57x +M/ScfcaJy2RKKkTHPFACbwCgL+NR6jplXhXrJxiiqn7gsSriZfEqJEnND0DgCcncnWkEa+FDkih YxipmoQY77tjEreK2W86e7hPG0/fKN/CEk9RQmfuwtLfGt9h2VIoOFL6K5W9ktgV28y65cZVSiw/ sY1IXDHe0Av8I7BYvJYDeB4PI/EsXomlGxAvWdJpjkuGkRe400/J8+REJr/KOruNw+YSAC5yD/Yw u5bBmLOHwxtYsVW7rpw6g7sHgigBAPCDdMtC0eDQPQrThlLBkCNg3aTPUNorpAg7k3nrDH3TZtbd haXA3XHMOWMtshDruPzcLt5g0pf574bUnRmaHubd9UOVZfFCNWV/g1yTDca9NSq65PkUtc60638l ZTy30PjvU3fQE/bx6shXlLjzBQcAI30RhQOeAHD3dXq2oqJs4tSZavsWcqnrGw8+pkJUz4+ilCo6 9p20lyJex3/+KwoUdVzZv8xDT1bAt+gYekWUy5WyALpi9AoFXsaCDHIdEcOtd3G8LnIPAKCnqz/I 92qxmtNsNbe5btqTYqHvuMf9Y8tsZHs7Zu9/jfRFCH5Jas4MPVUdFy846oOngwTngqRAX/J8ytul uoYLkac3AABFBt+XZcvR7pQrPoIbFMg6ABzsHRa4Wjs+idM21sarMx4MFDrGVnhZehiJXbGLH7wL S1NzZnwp5kXuQcBRChb34orM3MKXWCNhhBdRRTbSFxFMRj2H7OZPrmLP8PHHLZQzJAx1a2BzEku5 99vlmbPIt5G+iOtFa+saLhDuIifhJFYedIkEHgBsnnaMUm8HR16hG8QWVRu5iMdTtYj7wd5h9qLw SMxtrjvN1Umqj6Eb6YvAyJBayVVzfO3ysZ0VTat55iwkft6CfL1orcjZSUVwxxM8V1LGAYByySYM 08lyT8sg4Iwi7pg5Zw9HJ1fZzrIjM1nKu5B7GDsUeAHrMN/hWL/Qx0U4K/PfPPP2il178uKO6v7T 9dsEIzVeFzZdgsLodvEdmclKOCOxK/bODquYmX8eZR0OYFRdGHfqlUnnWqzmeWMkrqZkgfXK3qzD 3CdigumLWG2jXUX6/Udz04PcjqB1KHLJgmojV0tDR0frr3V6P4snsdjVSIYSphDuUgyl3bsRrY6L Z8FTRN1brOZbSxLKd2zHdtl7OsQWoiMz2Vdo6DQ8y5a/xOPJOBIqf9sMcSI3NF/Aq2uNimaBkGtD cMHsCr4jF2TsBwPYMWNo5Cnbd9G8gak0mPTiCVWNdcGSoxYxMNZByonIwgLjrS+G8TwaawQ6LLSR RyNRxz2usMCI0NNkTWkQwdebdRnjWzs+efzIPpR2+mbX9k3y3usRi/CAh905wZDKYmzbLQgvpQwf 4El3/E4AYiSjVcfFw9PZIiNgfd5aJDPuaF9yfc4ermSObymUixPvdvE1CTHYPCC+IltLbhdfAtAa FU2gyyXts1s9zMYFHtlXjXVWPpD44JMagJGog0x3IQIrs6/0Dvc498DLlY9hqWu4EMxbLJLSLtOX qH9ljq7a8Ul/g1I7Plnm6HK7+I573D/z18ZW7aJGGTsH8dey23wyso6X43bx6ACKusqs145PChRd xjtN0jkDgGr7FoNJr/K7z8u6oOOtSYhJs9U8Ma1WVt3pU4yyjIaYWl1qSsVca0RqvWABxWdrFQOu JiGmBJvCUAgbOsBKrJqcxVbtSjOuvFG+hXRUl5oir6ZIYd3t4kWmO2ynUXAteUb8867+OrnAqEpN s1yyig2MYIsA5j6SGFoL7Ead7BJbWGAMbJoPzPDDxDD3yQm25Mq4HyDuAJZumpW9GyoBNgF7KIa7 4D1kuXJMKi6hUHXJYWgose8ZV94o30K9+8HeYdVoExgOVLhZqfSq06WmfNp4Gu95iQwPAuWlkc8v MhdoZo7mpgtuPstiGugCa42Krpir1/i3ACx5RkteQmAl2y+jTUlaZrMN9NyRZhUML/xg7zBERdOE 5j1iAUN8YLtzC6g7RkEdmXmTLeQSG9rKRk3Egl2K55AdAGj7xN/gLF5wOgSAMo1HhS0cJDYcDP/g IUmAN/HYEXQxt338EoII7X/N1iysBF6gAvK+0WIt1pqF3GrHJw1WM7x6StlXEx+MaequWRgZtuYQ 6MEqDXfNNHtp2v+rqpmGu2aaabhrppmGu2aavR72fzssfqA2Je/PAAAAAElFTkSuQmCC";
    Crafty.assets[FOX.entities.player.sprite.src] = spritesImg;

    // Preload the needed assets
    Crafty.load([FOX.entities.player.sprite.src, FOX.entities.player.sprite.src], function() {
        // Splice the fox sprite
        Crafty.sprite(FOX.entities.player.sprite.size, FOX.entities.player.sprite.src, {
            fox: [0,0]
        });
        Crafty.sprite(FOX.entities.enemy.sprite.size, FOX.entities.enemy.sprite.src, {
            enemy: [0,0]
        });
        Crafty.sprite(FOX.entities.superEnemy.sprite.size, FOX.entities.superEnemy.sprite.src, {
            superEnemy: [0,0]
        });
        Crafty.sprite(FOX.entities.star.sprite.size, FOX.entities.star.sprite.src, {
            star: [0,0]
        });

        // Start the main scene when loaded
        Crafty.scene("start");
        //~ Crafty.scene("main");
    });

    // -----------------------------------------------------------------
    // Functions
    // -----------------------------------------------------------------

    function gameOver() {
        // Stop spawning
        clearInterval(FOX.entities.star.spawn.next);
        clearInterval(FOX.entities.enemy.spawn.next);
        clearInterval(FOX.entities.superEnemy.spawn.next);

        // Save score if highest
        FOX.newHighScore = false;
        if (window.localStorage) {
            if (FOX.player.score > window.localStorage.getItem("highscore")) {
                window.localStorage.setItem("highscore", FOX.player.score);
                FOX.newHighScore = true;
            }
        }

        // Go to game over scene
        Crafty.scene("gameover");
    }

    // -----------------------------------------------------------------
    // Scenes
    // -----------------------------------------------------------------

    Crafty.scene("start", function() {
        Crafty.background("url("+FOX.entities.sky.sprite.src+")");
        Crafty.e("2D, DOM, Text").text('<a href="#" id="play" onclick="Crafty.scene(\'main\'); return false;">Play</a>');
    });

    Crafty.scene("gameover", function() {
        var highScoreText = "";
        if (FOX.newHighScore) {
            highScoreText = "NEW High Score";
        }
        else {
            highScoreText = "High Score";
        }
        Crafty.background("url("+FOX.entities.sky.sprite.src+")");
        Crafty.e("2D, DOM, Text").text('<p><a href="#" id="play-again" onclick="Crafty.scene(\'main\'); return false;">Play again!</a></p>');
        Crafty.e("2D, DOM, Text").text('<p id="highscore">'+ highScoreText +': <span class="score">'+ window.localStorage.getItem("highscore") +'</span></p>');
        Crafty.e("2D, DOM, Text")
            .css("color", "red")
            .text('<p id="life">Life: ' + FOX.player.health + '</p>')
            ;
        Crafty.e("2D, DOM, Text")
            .text('<p id="score">' + FOX.player.score + '</p>')
            ;
    });

    Crafty.scene("main", function() {
        Crafty.background("url("+FOX.entities.sky.sprite.src+")");

        FOX.player = Crafty.e("2D, Canvas, fox, Animation, TwowayRunning, Gravity, Inside, Collision, Health, Score")
            .attr({
                x: 0,
                y: Crafty.viewport.height - FOX.entities.player.sprite.size - FOX.entities.floor.sprite.size,
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
                y: Crafty.viewport.height - FOX.entities.floor.sprite.size,
                w: Crafty.viewport.width,
                h: FOX.entities.floor.sprite.size
            })
        ;

        function spawn(type, components) {
            var entity = FOX.entities[type];
            clearInterval(entity.spawn.next);
            entity.spawn.next = setInterval(
                function() {
                    Crafty.e("Moving, " + components).attr(entity.attr);
                    spawn(type, components);
                },
                Math.floor(Math.random() * (entity.spawn.max - entity.spawn.min + 1)) + entity.spawn.min
            );
        }

        // Start generating enemies and stars
        spawn("enemy", "Enemy, enemy");
        spawn("star", "Star, star");
        spawn("superEnemy", "Enemy, superEnemy");
    });

})();
