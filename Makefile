# folders
BIN = bin/
TMP = tmp/

# files
PROG = $(BIN)index.html
IMAGES = $(TMP)images.js
SPRITE = sprites.png

all : $(PROG)

$(PROG) : $(IMAGES)

$(IMAGES) :
	echo "var img = new Image();" > $(IMAGES)
	echo "img.src = '`base64 $(SPRITE)`';" >> $(IMAGES)
	echo "img.alt = '';" >> $(IMAGES)
	echo "Crafty.assets['sprites.png'] = img;" >> $(IMAGES)

clean :
	rm -rf $(BIN)*
	rm -rf $(TMP)*
