;(function( $ ){

  $.fn.lightUp = function( options ) {

    // returns a whole number between a given min and max value
    // max > min
    function wholeRandBetween(min, max){
      return Math.floor(Math.random() * (max - min)) + min;
    }

    //default arguments
    var settings = $.extend( {
      type: 'slot',
      colors: ['blue', 'green', 'red', 'yellow'],
      amountPerScreen: 1,
      deleteClassName: '_dltl8er',
      className: '_r34l',
      randomNumberGenerator: wholeRandBetween,
      align: 'center'
    }, options);

    // only allow divs
    var self = this.filter("div");

    // takes in readSpot string and returns useable pixel value
    function alignGame(tileHeight){
      if(settings.align === 'top'){
        return 0;
      }
      else if(settings.align === 'bottom'){
        return tileHeight * (settings.amountPerScreen - 1);
      }
      else {
        return tileHeight * (settings.amountPerScreen/2) - (tileHeight/2);
      }
    }

    if(settings.type === 'slot'){

      //function for setting up the basic styling properties of the slot
      function setUpSlot(me){
        var height = me.height();
        //amount of children in slot
        var contentAmt = me.children().length
        // set the overflow of the parent div to hidden
        me.css('overflow', 'hidden');
        // fix the height of the div a t the height it currently is
        me.height(height);
        // height of each tile
        var eachTileHeight = height / settings.amountPerScreen;
        // go through each of the immediate children
        me.children().each(function(){
          //set each child to the height divided by  of the parent box
          $(this).height(eachTileHeight);
          // add class of main elements
          $(this).addClass(settings.className);
          // pick a random color for the box from the color array
          $(this).css('background-color', settings.colors[settings.randomNumberGenerator(0, settings.colors.length)]);
        });
        // wrap all the tiles in a div
        me.children().wrapAll( "<div/>");
        // add margin for later on to align game to center top or bottom
        var addedMargin = alignGame(eachTileHeight);
        // subtract the height from the added margin to remove odd whitespace
        me.children().css('margin-top', addedMargin - height);
        // this piece of code buffers tiles on both sides of original set to avoid white spaces
        var extraTiles = 0;
        var spaceTiles = settings.amountPerScreen - contentAmt
        // if the size of the box is the same as the amount of tiles or they are one away from
        // each other make one extra tile;
        if(spaceTiles === 0 || Math.abs(spaceTiles) === 1){
          extraTiles = 1;
        }
        // if the difference between the size of the box and the space is greater than
        // one make the extra tiles equal to the difference between spaces and tiles
        else if(spaceTiles > 1){
          extraTiles = spaceTiles
        }
        // to make things easier for us copy all the current tiles ahead and behind. 
        // so that no white space can be seen when messing with alignment
        extraTiles = Math.ceil(extraTiles / settings.amountPerScreen);
        var movementBox = me.children();
        var uniqueTiles = movementBox.children();
        for(var i = 0; i < extraTiles; i++) {
          uniqueTiles.clone(true).prependTo(movementBox).removeClass(settings.className);
          uniqueTiles.clone(true).appendTo(movementBox).removeClass(settings.className);
        }
        return {tiles: contentAmt, extraTiles: extraTiles * settings.amountPerScreen, addedMargin: addedMargin};
      }

      //populate the slot with the appropriate tiles
      // tiles -> amount of tiles to traverse
      function populateSlot(me, tiles, scroll) {
        var movementBox = me.children();
        var uniqueTiles = movementBox.children("." + settings.className);
        var uniqueTilesAmt = uniqueTiles.length;
        for(var i = 0; i < tiles / uniqueTilesAmt; i++) {
          if(scroll === 'up'){
            uniqueTiles.clone(true).appendTo(movementBox).addClass(settings.deleteClassName);
          }
          else {
            uniqueTiles.clone(true).prependTo(movementBox).addClass(settings.deleteClassName);
          }
        }
      }

      // spin the slot the apropriate number of tiles
      function spinX(input) {
        var spinInput = $.extend( {
          //me, 
          //tiles,
          //extraTiles,
          //pos,
          //addedMargin,
          //callback
          animation: 'linear',
          //scroll: 'up'
        }, input);
        //total pixel distance nessisary to travel
        var totalDist;
        var pxDist;
        // if the slot is scrolling down change the margin to animate positively and place 
        // the start at the bottom
        if(spinInput.scroll === 'down'){
          totalDist = spinInput.me.children().children("." + settings.className + ":first").height() * (spinInput.pos + spinInput.extraTiles) - spinInput.addedMargin;
          pxDist = totalDist + "px";
          //move to the bottom to move upward
          returnTo(spinInput.me, spinInput.tiles, spinInput.extraTiles, spinInput.addedMargin);
        }
        else {
          totalDist = spinInput.me.children().children("." + settings.className + ":first").height() * (spinInput.tiles + spinInput.pos + spinInput.extraTiles) - spinInput.addedMargin;
          pxDist = "-" + totalDist + "px";
        }
        spinInput.me.children().animate({
          'margin-top': pxDist,
        }, 500, spinInput.animation, function() {
          // return to set postion
          returnTo(spinInput.me, spinInput.pos, spinInput.extraTiles, spinInput.addedMargin);
          // remove extra tiles to avoid cluttering up dom
          depopulateSlot(spinInput.me);
          // callback
          if(spinInput.callback){
            spinInput.callback(spinInput.pos);
          }
        });
      }

      //de-populate the slot
      function depopulateSlot(me) {
        me.children().children("." + settings.deleteClassName).remove(); 
      }

      // return to correct position
      function returnTo(me, pos, extra, addedMargin){
        var totalDist = me.children().children("." + settings.className + ":first").height() * (pos + extra) - addedMargin;
        me.children().css("margin-top", -totalDist);
      }

      // run a spin on a slot
      // arguments instead of $.extend because all arguments are needed
      function slotSpin(input) {
        var spinOptions = $.extend({
          // me,
          goTo: settings.randomNumberGenerator(0, this.tiles),
          // tiles,
          // extraTiles,
          // addedMargin,
          // scroll,
          // callback
        },input);
        // find how many complete rotations the slot should make
        var totalSpins = settings.randomNumberGenerator(3, 10);
        // how many total tiles are traversed in this situation
        var tilesTraversed = (totalSpins * spinOptions.tiles);
        // fills the area with filler tiles to make the slot seem infinite
        populateSlot(spinOptions.me, tilesTraversed, spinOptions.scroll);
        // spins the slot x amount of times
        spinX({
          me: spinOptions.me,
          tiles: tilesTraversed,
          extraTiles: spinOptions.extraTiles,
          pos: spinOptions.goTo,
          addedMargin: spinOptions.addedMargin,
          callback: spinOptions.callback,
          scroll: spinOptions.scroll
        });
        return spinOptions.goTo;
      }

      // if there are 1 or 0 slots
      if(self.length === 1){
        var childInfo = setUpSlot(self);
        return {
          spin: function( input ) {
            var spinDefaults = $.extend( {
              // select the tile to finish on
              to: settings.randomNumberGenerator(0, childInfo.tiles),
              // callback when spin is finished
              // done: undefined,
              scroll: 'up'
            }, input);

            // make sure the slot isnt already animated
            if( !self.children().is(":animated") ) {
              //spin slot
              slotSpin({
                me: self, 
                goTo: spinDefaults.to, 
                tiles: childInfo.tiles, 
                extraTiles: childInfo.extraTiles, 
                addedMargin: childInfo.addedMargin, 
                scroll: spinDefaults.scroll, 
                callback: function(val) {
                  if(spinDefaults.done){
                    spinDefaults.done(val);
                  }
                }
              });
            }
          }
        }
      }
      // if there are more than 1 slot
      else {
        var childrenInfo = [];
        self.each(function() {
          childrenInfo.push( setUpSlot($(this)) );
        });
        return {
          spin: function( input ) {
            var spinDefaults = $.extend( {
              // select the tile to finish on
              // to: undefined
              // callback when spin is finished
              // done: undefined
              scroll: 'up'
            }, input);
            var outputArr = [];
            var i = 0;
            // make sure the slot isnt already animated
            if( !self.children().is(":animated") ) {
              self.each(function() {
                var goTo = spinDefaults.to || settings.randomNumberGenerator(0, childrenInfo[i].tiles);
                // spin slots
                outputArr.push(slotSpin({
                  me: $(this), 
                  goTo: goTo, 
                  tiles: childrenInfo[i].tiles, 
                  extraTiles: childrenInfo[i].extraTiles, 
                  addedMargin: childrenInfo[i].addedMargin, 
                  scroll: spinDefaults.scroll
                }));
                i++;
              });
              // wait for all the animations to finish and then call the callback
              var wait = setInterval(function() {
                if( !self.children().is(":animated") ) {
                  clearInterval(wait);
                  if(spinDefaults.done){
                    spinDefaults.done(outputArr);
                  }
                }
              }, 100);
            }
          }
        }
      }
    }
  };
})( jQuery );