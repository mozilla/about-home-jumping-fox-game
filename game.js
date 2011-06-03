    Crafty.init(572, 120);
    //preload the needed assets
    Crafty.load(["foxsheet.png"], function() {
        //splice the spritemap
        Crafty.sprite(50, "foxsheet.png", {
            cat: [0,0]
        });

        //start the main scene when loaded
        Crafty.scene("main");
    });

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

    Crafty.scene("main", function() {

        var player = Crafty.e("2D, DOM, cat, Animation, Twoway, Gravity, Inside")
            .attr({x: 0, y: Crafty.viewport.height - 50 - 20})
            .animate("walk", 1, 0, 4)
            .twoway(0, 7)
            .gravity("floor")
        ;

        Crafty.e("2D, floor")
            .attr({
                x: 0,
                y: Crafty.viewport.height - 20,
                w: Crafty.viewport.width,
                h: 20
            })
        ;
    });
