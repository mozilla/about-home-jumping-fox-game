# folders
BIN = bin/
TMP = tmp/

# files
PROG = $(BIN)index.html
INDEXIN = index.html
IMAGEOUT = $(TMP)images.js
SPRITE = sprites.png
CRAFTYSRC = crafty.js
GAMESRC = game.js
JSOUT = $(TMP)compiled.js

all : folders $(PROG)

folders :
	[ -d $(BIN) ] || mkdir $(BIN)
	[ -d $(TMP) ] || mkdir $(TMP)

$(PROG) : $(INDEXIN) $(IMAGEOUT) $(JSOUT)
	./scripts/replace_script_tags.py $(INDEXIN) $(JSOUT) > $(PROG)

# encode image to base64 and include it in a js file
$(IMAGEOUT) : $(SPRITE)
	echo "var img = new Image();" > $(IMAGEOUT)
	echo "img.src = '`base64 $(SPRITE) | tr -d '\n'`';" >> $(IMAGEOUT)
	echo "img.alt = '';" >> $(IMAGEOUT)
	echo "Crafty.assets['$(SPRITE)'] = img;" >> $(IMAGEOUT)

# minify and concatenate js files
$(JSOUT) : $(CRAFTYSRC) $(IMAGEOUT) $(GAMESRC)
	./scripts/compile.py $^ > $(JSOUT)

clean :
	rm -rf $(BIN)*
	rm -rf $(TMP)*
