    Crafty.init();
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
            if (!this.has("Animate"))
            {
                this.addComponent("Animate");
            }

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


    Crafty.scene("main", function() {

        var player = Crafty.e("2D, DOM, cat, Animation")
            .attr({x: Crafty.viewport.width / 2, y: Crafty.viewport.height / 2})
            .animate("walk", 1, 0, 4);

        console.log(player.isPlaying());
    });
