/*global __plugin, require, org, setTimeout, addUnloadHandler, exports, global, Packages*/
var utils = require('utils'),
  blocks = require('blocks'),
  bountiful = false,
  THOUSAND = 1000,
  MILLION = THOUSAND * THOUSAND;

if (__plugin.canary){
  bountiful = parseFloat(server.canaryModVersion) > 1.7;
}

/*********************************************************************
## Drone Plugin

The Drone is a convenience class for building. It can be used for...

 1. Building
 2. Copying and Pasting

It uses a fluent interface which means all of the Drone's methods return `this` and can be chained together like so...

    var theDrone = new Drone();
    theDrone.up().left().box(blocks.oak).down().fwd(3).cylinder0(blocks.lava,8); 

### Constructing a Drone Object

Drones can be created in any of the following ways...
    
 1. Calling any one of the methods listed below will return a Drone object. For example...
         
        var d = box( blocks.oak )

   ... creates a 1x1x1 wooden block at the cross-hairs or player's location and returns a Drone object. This might look odd (if you're familiar with Java's Object-dot-method syntax) but all of the Drone class's methods are also global functions that return new Drone objects. This is short-hand for creating drones and is useful for playing around with Drones at the in-game command prompt. It's shorter than typing ...
    
        var d = new Drone().box( blocks.oak ) 
        
   ... All of the Drone's methods return `this` so you can chain operations together like this...
        
        var d = box( blocks.oak )
                  .up()
                  .box( blocks.oak ,3,1,3)
                  .down()
                  .fwd(2)
                  .box( blocks.oak )
                  .turn()
                  .fwd(2)
                  .box( blocks.oak )
                  .turn()
                  .fwd(2)
                  .box( blocks.oak );
    
 2. Using the following form...

        d = new Drone()
    
    ...will create a new Drone. If the cross-hairs are pointing at a block at the time then, that block's location becomes the drone's starting point.  If the cross-hairs are _not_ pointing at a block, then the drone's starting location will be 2 blocks directly in front of the player.  TIP: Building always happens right and front of the drone's position...
    
    Plan View:

        ^
        |
        |
        D---->
      
    For convenience you can use a _corner stone_ to begin building. The corner stone should be located just above ground level. If the cross-hair is point at or into ground level when you create a new Drone(), then building begins at that point. You can get around this by pointing at a 'corner stone' just above ground level or alternatively use the following statement...
    
        d = new Drone().up();
          
    ... which will move the drone up one block as soon as it's created.

    ![corner stone](img/cornerstone1.png)

 3. Or by using the following form...
    
        d = new Drone(x,y,z,direction,world);

    This will create a new Drone at the location you specified using x, y, z In minecraft, the X axis runs west to east and the Z axis runs north to south.  The direction parameter says what direction you want the drone to face: 0 = east, 1 = south, 2 = west, 3 = north.  If the direction parameter is omitted, the player's direction is used instead. Both the `direction` and `world` parameters are optional.

 4. Create a new Drone based on a Bukkit Location object...

        d = new Drone(location);

    This is useful when you want to create a drone at a given `org.bukkit.Location` . The `Location` class is used throughout the bukkit API. For example, if you want to create a drone when a block is broken at the block's location you would do so like this...

        events.blockBreak( function( event ) { 
            var location = event.block.location;
            var drone = new Drone(location);
            // do more stuff with the drone here...
        });

#### Parameters

 * location (optional) : *NB* If an `org.bukkit.Location` object is provided as a parameter, then it should be the only parameter.
 * x (optional) : The x coordinate of the Drone
 * y (optional) : The y coordinate of the Drone
 * z (optional) : The z coordinate of the Drone
 * direction (optional) : The direction in which the Drone is
   facing. Possible values are 0 (east), 1 (south), 2 (west) or 3 (north)
 * world (optional) : The world in which the drone is created.
  
### Drone.box() method

the box() method is a convenience method for building things. (For the more performance-oriented method - see cuboid)

#### parameters

 * b - the block id - e.g. 6 for an oak sapling or '6:2' for a birch sapling. Alternatively you can use any one of the `blocks` values e.g. `blocks.sapling.birch`
 * w (optional - default 1) - the width of the structure 
 * h (optional - default 1) - the height of the structure 
 * d (optional - default 1) - the depth of the structure - NB this is not how deep underground the structure lies - this is how far away (depth of field) from the drone the structure will extend.

#### Example

To create a black structure 4 blocks wide, 9 blocks tall and 1 block long...
    
    box(blocks.wool.black, 4, 9, 1);

... or the following code does the same but creates a variable that can be used for further methods...

    var drone = new Drone();
    drone.box(blocks.wool.black, 4, 9, 1);

![box example 1](img/boxex1.png)
    
### Drone.box0() method

Another convenience method - this one creates 4 walls with no floor or ceiling.

#### Parameters

 * block - the block id - e.g. 6 for an oak sapling or '6:2' for a birch sapling. Alternatively you can use any one of the `blocks` values e.g. `blocks.sapling.birch`
 * width (optional - default 1) - the width of the structure 
 * height (optional - default 1) - the height of the structure 
 * length (optional - default 1) - the length of the structure - how far
   away (depth of field) from the drone the structure will extend.

#### Example

To create a stone building with the insided hollowed out 7 wide by 3 tall by 6 long...

    box0( blocks.stone, 7, 3, 6);

![example box0](img/box0ex1.png)
   
### Drone.boxa() method

Construct a cuboid using an array of blocks. As the drone moves first along the width axis, then the height (y axis) then the length, each block is picked from the array and placed.

#### Parameters

 * blocks - An array of blocks - each block in the array will be placed in turn.
 * width
 * height
 * length

#### Example

Construct a rainbow-colored road 100 blocks long...

    var rainbowColors = [blocks.wool.red, blocks.wool.orange, blocks.wool.yellow, blocks.wool.lime,
                         blocks.wool.lightblue, blocks.wool.blue, blocks.wool.purple];
    
    boxa(rainbowColors,7,1,30);

![boxa example](img/boxaex1.png)

### Chaining

All of the Drone methods return a Drone object, which means methods can be 'chained' together so instead of writing this...

    drone = new Drone(); 
    drone.fwd(3);
    drone.left(2);
    drone.box(2); // create a grass block 
    drone.up();
    drone.box(2); // create another grass block
    drone.down();

...you could simply write ...
    
    var drone = new Drone().fwd(3).left(2).box(2).up().box(2).down();

... since each Drone method is also a global function that constructs a drone if none is supplied, you can shorten even further to just...
    
    fwd(3).left(2).box(2).up().box(2).down()

The Drone object uses a [Fluent Interface][fl] to make ScriptCraft scripts more concise and easier to write and read.  Minecraft's in-game command prompt is limited to about 80 characters so chaining drone commands together means more can be done before hitting the command prompt limit. For complex building you should save your commands in a new script file and load it using /js load()

[fl]: http://en.wikipedia.org/wiki/Fluent_interface

### Drone Properties

 * x - The Drone's position along the west-east axis (x increases as you move east)
 * y - The Drone's position along the vertical axis (y increses as you move up)
 * z - The Drone's position along the north-south axis (z increases as you move south)
 * dir - The Drone's direction 0 is east, 1 is south , 2 is west and 3 is north.

### Extending Drone

The Drone object can be easily extended - new buidling recipes/blueprints can be added and can become part of a Drone's chain using the *static* method `Drone.extend`. 

### Drone.extend() static method

Use this method to add new methods (which also become chainable global functions) to the Drone object.

#### Parameters

 * name - The name of the new method e.g. 'pyramid'. 
 * function - The method body.

Alternatively if you provide just a function as a parameter, then the function name will be used as the new method name. For example the following two approaches are both valid.

#### Example 1 Using name and function as parameters

    // submitted by [edonaldson][edonaldson]
    Drone.extend('pyramid', function( block,height) { 
        this.chkpt('pyramid');
        for ( var i = height; i > 0; i -= 2) {
            this.box(block, i, 1, i).up().right().fwd();
        }
        return this.move('pyramid');      
    });

#### Example 2 Using just a named function as a parameter

    function pyramid( block,height) { 
        this.chkpt('pyramid');
        for ( var i = height; i > 0; i -= 2) {
            this.box(block, i, 1, i).up().right().fwd();
        }
        return this.move('pyramid');      
    }
    Drone.extend( pyramid );

Once the method is defined (it can be defined in a new pyramid.js file) it can be used like so...

    var d = new Drone();
    d.pyramid(blocks.brick.stone, 12);

... or simply ...

    pyramid(blocks.brick.stone, 12);

[edonaldson]: https://github.com/edonaldson

### Drone Constants

#### Drone.PLAYER_STAIRS_FACING

An array which can be used when constructing stairs facing in the Drone's direction...

    var d = new Drone();
    d.box(blocks.stairs.oak + ':' + Drone.PLAYER_STAIRS_FACING[d.dir]);

... will construct a single oak stair block facing the drone.

#### Drone.PLAYER_SIGN_FACING

An array which can be used when placing signs so they face in a given direction. This is used internally by the Drone.sign() method. It should also be used for placing any of the following blocks...

 * chest 
 * ladder
 * furnace
 * dispenser

To place a chest facing the Drone ...

    drone.box( blocks.chest + ':' + Drone.PLAYER_SIGN_FACING[drone.dir]);

#### Drone.PLAYER_TORCH_FACING

Used when placing torches so that they face towards the drone. 

    drone.box( blocks.torch + ':' + Drone.PLAYER_TORCH_FACING[drone.dir]);

***/

//
// Implementation
// ==============
// 
// There is no need to read any further unless you want to understand how the Drone object works.
//
function getDirFromRotation( location ) { 
  // 0 = east, 1 = south, 2 = west, 3 = north
  // 46 to 135 = west
  // 136 to 225 = north
  // 226 to 315 = east
  // 316 to 45 = south
  var r;
  if (__plugin.canary ) {
    r = location.rotation;
  } 
  if (__plugin.bukkit) { 
    r = location.yaw;
  }
    
  // west = -270
  // north = -180
  // east = -90
  // south = 0
  
  r = (r + 360 ) % 360; // east could be 270 or -90

  if ( r > 45 && r <= 135 )
    return 2; // west
  if ( r > 135 && r <= 225 )
    return 3; // north
  if ( r > 225 && r <= 315 )
    return 0; // east
  return 1; // south
}
/*
 certain block-types in Minecraft 1.8 have properties which must be set. The old
 data value is deprecated.
*/
function bountifulPutBlock(block, blockId, metadata, dir){
  var prop = require('blockhelper').property;
  var BlockType = Packages.net.canarymod.api.world.blocks.BlockType;
  block.type = BlockType.fromId(blockId);
  switch (blockId)
  {
    /*
     dyed materials
     */
  case blocks.wool.white:
  case blocks.stained_clay.white:
  case blocks.stained_glass.white:
  case blocks.carpet.white:
    prop(block).set('color',metadata);
    block.update();
    return true;
    /*
     torches
     */
  case blocks.torch:
    if (metadata >= 1 && metadata <= 4){
      prop(block).set('facing', (dir + 2) % 4);
    }
    block.update();
    return true;
    /*
     doors
     */
  case blocks.door_wood:
  case blocks.door_iron:
    switch (metadata){
    case 8:
      prop(block).set('hinge','left');
      prop(block).set('half','upper');  
      break;
    case 9:
      prop(block).set('hinge','right');
      prop(block).set('half','upper');  
      break;
    default:
      prop(block).set('facing',metadata);
      prop(block).set('half','lower');
    }
    block.update();
    return true;
    /* 
     stairs
     */
  case blocks.stairs.oak:
  case blocks.stairs.cobblestone:
  case blocks.stairs.brick:
  case blocks.stairs.stone:
  case blocks.stairs.nether:
  case blocks.stairs.sandstone:
  case blocks.stairs.spruce:
  case blocks.stairs.jungle:
  case blocks.stairs.quartz:
    prop(block).set('facing', dir);
    block.update();
    return true;
    /*
     ladder
     */
  case blocks.ladder:
    prop(block).set('facing',dir);
    block.update();
    return true;
    /*
     signs
     */
  case blocks.sign:
    // facing
    prop(block).set('facing', (dir+2) % 4);
    block.update();
    return true;
  case blocks.sign_post:
    // rotation
    if (metadata !== 0)
      prop(block).set('rotation', new Packages.java.lang.Integer(metadata));
    block.update();
    return true;
  }
  return false;
}
function putBlock( x, y, z, blockId, metadata, world, dir ) {
  if ( typeof metadata == 'undefined' ) {
    metadata = 0;
  }
  var block = world.getBlockAt( x, y, z ),
      placed = false;
      
  if ( block.typeId != blockId || block.data != metadata ) {
    if (__plugin.canary) {
      if ( bountiful){ 
	placed = bountifulPutBlock(block, blockId, metadata, dir);
      } 
      if (!placed){
	world.setBlockAt(x, y, z, blockId, metadata);
      }
    }
    if (__plugin.bukkit) {
      block.setTypeIdAndData( blockId, metadata, false );
      block.data = metadata;
    }
  }
}

function Drone( x, y, z, dir, world ) {
  this.record = false;
  var usePlayerCoords = false;
  var player = (typeof self !== 'undefined' ? self : null);
  var playerPos;
  if ( x.location && x.name) {
    player = x;
  } 
  playerPos = x.location;

  var that = this;
  var populateFromLocation = function( loc ) {
    that.x = loc.x;
    that.y = loc.y;
    that.z = loc.z;
    that.dir = getDirFromRotation(loc);
    that.world = loc.world;
  };
  var mp = utils.getMousePos( player );
  if ( typeof x == 'undefined' || x.location ) {
    if ( mp ) {
      populateFromLocation( mp );
      if ( playerPos ) {
        this.dir = getDirFromRotation(playerPos);
      }
    } else {
      // base it on the player's current location
      usePlayerCoords = true;
      //
      // it's possible that drone.js could be loaded by a non-playing op 
      // (from the server console)
      //
      if ( !playerPos ) {
        return null;
      }
      populateFromLocation( playerPos );
    }
  } else {
    if ( arguments[0].x && arguments[0].y && arguments[0].z ) {
      populateFromLocation( arguments[ 0 ] );
    } else {
      this.x = x;
      this.y = y;
      this.z = z;
      if ( typeof dir == 'undefined' ) {
        this.dir = getDirFromRotation( playerPos);
      } else {
        this.dir = dir%4;
      }
      if ( typeof world == 'undefined' ) {
        this.world = playerPos.world;
      } else {
        this.world = world;
      }
    }
  }

  if ( usePlayerCoords ) {
    this.fwd( 3 );
  }
  this.chkpt( 'start' );
  this.record = true;
  this.history = [];
  this.player = player;
  return this;
}

exports.Drone = Drone;
/* 
 because this is a plugin, any of its exports will be exported globally.
 Since 'blocks' is a module not a plugin it is convenient to export it via 
 the Drone module.
 */
exports.blocks = blocks;
Drone.getDirFromRotation = getDirFromRotation;
Drone.queue = [];

Drone.opsPerSec = 10;
Drone.processQueue = function(){
  var process,
    i = 0,
    queues = getAllQueues();

  for ( ; i < queues.length; i++ ) {  
    process = queues[i].shift();
    if (process){
      try { 
        process();
      } catch( e ) { 
        console.log('Drone build error: ' +  e + ' while processing ' + process);
	e.printStackTrace(java.lang.System.out);
      } 
    }
  }
  setTimeout( Drone.processQueue, 1000 / Drone.opsPerSec );
};
setTimeout( Drone.processQueue, 1000 / Drone.opsPerSec );

addUnloadHandler( function() {
  var pendingBuildOps = 0;
  var allQueues = getAllQueues();
  for (var i = 0; i < allQueues.length; i++){
    pendingBuildOps += allQueues[i].length;
  }
  if (pendingBuildOps > 0){
    console.warn('There were ' + pendingBuildOps + ' pending build operations which were cancelled');
  }
});
//
// add custom methods to the Drone object using this function
//
Drone.extend = function( name, func ) {
  if (arguments.length == 1){
    func = name;
    if ( !func.name ){
      throw 'A Drone extension function must have a name!';
    }
    name = func.name;
  }
  Drone.prototype[ '_' + name ] = func;
  Drone.prototype[ name ] = function( ) {
    if ( this.record ) {
      this.history.push( [ name, arguments ] );
    }
    var oldVal = this.record;
    this.record = false;
    this[ '_' + name ].apply( this, arguments );    
    this.record = oldVal;
    return this;
  };
  
  global[name] = function( ) {
    var result = new Drone( self );
    result[name].apply( result, arguments );
    return result;
  };
};

/**************************************************************************
### Drone.times() Method

The times() method makes building multiple copies of buildings
easy. It's possible to create rows or grids of buildings without
resorting to `for` or `while` loops.

#### Parameters

 * numTimes (optional - default 2) : The number of times you want to repeat the preceding statements.

#### Example

Say you want to do the same thing over and over. You have a couple of options...

 * You can use a for loop...

    d = new Drone(); for ( var i =0;i < 4; i++) {  d.cottage().right(8); }

While this will fit on the in-game prompt, it's awkward. You need to
declare a new Drone object first, then write a for loop to create the
4 cottages. It's also error prone, even the `for` loop is too much
syntax for what should really be simple.

 * You can use a while loop...
   
    d = new Drone(); var i=4; while (i--) {  d.cottage().right(8); }

... which is slightly shorter but still too much syntax. Each of the
above statements is fine for creating a 1-dimensional array of
structures. But what if you want to create a 2-dimensional or
3-dimensional array of structures? Enter the `times()` method.

The `times()` method lets you repeat commands in a chain any number of
times. So to create 4 cottages in a row you would use the following
statement...

    cottage().right(8).times(4);

...which will build a cottage, then move right 8 blocks, then do it
again 4 times over so that at the end you will have 4 cottages in a
row. What's more the `times()` method can be called more than once in
a chain. So if you wanted to create a *grid* of 20 houses ( 4 x 5 ),
you would do so using the following statement...

    cottage().right(8).times(4).fwd(8).left(32).times(5);

... breaking it down...

 1. The first 3 calls in the chain ( `cottage()`, `right(8)`, `times(4)` ) build a single row of 4 cottages.

 2. The last 3 calls in the chain ( `fwd(8)`, `left(32)`, `times(5)` ) move the drone forward 8 then left 32 blocks (4 x 8) to return to the original x coordinate, then everything in the chain is repeated again 5 times so that in the end, we have a grid of 20 cottages, 4 x 5.  Normally this would require a nested loop but the `times()` method does away with the need for loops when repeating builds.

Another example: This statement creates a row of trees 2 by 3 ...

    oak().right(10).times(2).left(20).fwd(10).times(3)

... You can see the results below.

![times example 1](img/times-trees.png)

***/
Drone.prototype.times = function( numTimes, commands ) {
  if ( typeof numTimes == 'undefined' ) {
    numTimes = 2;
  }
  if ( typeof commands == 'undefined' ) {
    commands = this.history.concat();
  }
  
  this.history = [ [ 'times', [ numTimes + 1, commands ] ] ];
  var oldVal = this.record;
  this.record = false;
  for ( var j = 1; j < numTimes; j++ ) {
    for ( var i = 0; i < commands.length; i++) {
      var command = commands[i];
      var methodName = command[0];
      var args = command[1];
      this[ methodName ].apply( this, args );
    }
  }
  this.record = oldVal;
  return this;
};


Drone.prototype.getBlock = function(){
  return this.world.getBlockAt(this.x,this.y,this.z);
};
Drone.prototype.setBlock = function(blockType, data, ox, oy, oz){
  if (typeof ox == 'undefined')
    ox = 0;
  if (typeof oy == 'undefined')
    oy = 0;
  if (typeof oz == 'undefined')
    oz = 0;
  putBlock(this.x + ox, this.y + oy, this.z + oz, blockType, data, this.world, this.dir);
};
Drone.prototype.bountiful = bountiful;
Drone.prototype.traverseWidth = function(width, callback){
  _traverse[this.dir].width(this, width, callback);
};
Drone.prototype.traverseHeight = function(height, callback){
  traverseHeight(this, height, callback);
};
Drone.prototype.traverseDepth = function(depth, callback){
  _traverse[this.dir].depth(this, depth, callback);
};
//
// building
//

var playerQueues = {};
/*
 if the drone has an associated player, then use that player's queue otherwise
 use the global queue.
*/
function getQueue( drone ){
  if ( drone.player ) {
    var playerName = ''+drone.player.name;
    var result = playerQueues[playerName];
    if (result === undefined){
      playerQueues[playerName] = [];
      return playerQueues[playerName];
    }
    return result;
  } else {
    return Drone.queue;
  }
}
function getAllQueues() {
  var result = [ Drone.queue ];
  for (var pq in playerQueues) {
    result.push(playerQueues[pq]) ;
  }
  return result;
} 
Drone.prototype.cuboida = function(/* Array */ blocks, w, h, d, overwrite, immediate ) {
  //
  // wph 20140823 make a copy because don't want to modify array in background
  // 
  var blocksForBuild = blocks.slice();
  var len = blocksForBuild.length,
    i = 0;

  if ( !immediate ) { 
    for ( ; i < len; i++ ) {
      blocksForBuild[i] = this._getBlockIdAndMeta( blocksForBuild[ i ] );
    }
    var clone = Drone.clone(this);
    var impl = this.cuboida.bind(clone, blocksForBuild, w, h, d, overwrite, true);
    getQueue(this).push( function cuboida(){ impl(); });
    return this;
  }
  if ( typeof overwrite == 'undefined' ) { 
    overwrite = true;
  }
  if ( typeof h == 'undefined' ) {
    h = 1;
  }
  if ( typeof d == 'undefined' ) {
    d = 1;
  }
  if ( typeof w == 'undefined' ) {
    w = 1;
  }
  var bi = 0;

  traverseDHW( this, d,h,w, function traverseWidthCallback( ) { 
    var properBlock = blocksForBuild[ bi % len ];
    this.setBlock(properBlock[0], properBlock[1]);
    bi++;
  });
  return this;
};
Drone.MAX_VOLUME = 1 * MILLION;
Drone.MAX_SIDE = 1 * THOUSAND;

var tooBig = function(w, h, d ) {
  return ( w * h * d ) >= Drone.MAX_VOLUME || 
    ( w >= Drone.MAX_SIDE ) || 
    ( h >= Drone.MAX_SIDE ) ||
    ( d >= Drone.MAX_SIDE );
};
/*
 faster cuboid because blockid, meta and world must be provided 
 use this method when you need to repeatedly place blocks
 */
Drone.prototype.cuboidX = function( blockType, meta, w, h, d, immediate ) {

  if ( typeof h == 'undefined' ) {
    h = 1;
  }
  if ( typeof d == 'undefined' ) {
    d = 1;
  }
  if ( typeof w == 'undefined' ) {
    w = 1;
  }
  if ( tooBig( w, h, d ) ) {
    this.sign([
      'Build too Big!',
      'width:' + w,
      'height:' + h,
      'depth:' + d
    ], 68);
    console.warn('Build too big! ' + w + ' X ' + h + ' X ' + d);
    return this;
  }
  if ( !immediate ) {
    var clone = Drone.clone(this);
    var impl = this.cuboidX.bind(clone, blockType, meta, w, h, d, true);
    getQueue(this).push(function cuboidX(){ impl(); });
    return this;
  }
  traverseDHW( this, d,h,w, function( ) {
    this.setBlock( blockType, meta );
  });
  return this;
  
};
/*
 deferred execution of a drone method
*/
Drone.prototype.then = function( next ){
  getQueue(this).push( next.bind( Drone.clone(this) ) );
};
Drone.prototype.cuboid = function( block, w, h, d ) {
  var bm = this._getBlockIdAndMeta( block );
  return this.cuboidX( bm[0], bm[1], w, h, d );
};

Drone.prototype.cuboid0 = function( block, w, h, d ) {
  this.chkpt( 'start_point' );
  
  // Front wall
  this.cuboid( block, w, h, 1 );
  // Left wall
  this.cuboid( block, 1, h, d );
  // Right wall
  this.right( w - 1 ).cuboid( block, 1, h, d ).left( w - 1 );
  // Back wall
  this.fwd( d - 1 ).cuboid( block, w, h, 1 );
  
  return this.move( 'start_point' );
};



// player dirs: 0 = east, 1 = south, 2 = west,   3 = north
// block dirs:  0 = east, 1 = west,  2 = south , 3 = north
// sign dirs:   5 = east, 3 = south, 4 = west, 2 = north
Drone.PLAYER_STAIRS_FACING = [ 0, 2, 1, 3 ];

// for blocks 68 (wall signs) 65 (ladders) 61,62 (furnaces) 23 (dispenser) and 54 (chest)
Drone.PLAYER_SIGN_FACING = [ 4, 2, 5, 3 ]; 
Drone.PLAYER_TORCH_FACING = [ 2, 4, 1, 3 ];

Drone.extend('box', Drone.prototype.cuboid );
Drone.extend('box0',Drone.prototype.cuboid0 );
Drone.extend('boxa',Drone.prototype.cuboida );
//
// show the Drone's position and direction 
//
Drone.prototype.toString = function( ) { 
  var dirs = ['east','south','west','north'];
  return 'x: ' + this.x + ' y: '+this.y + ' z: ' + this.z + ' dir: ' + this.dir  + ' '+dirs[this.dir];
};
Drone.prototype.debug = function( ) { 
  console.log(this.toString( ) );
  return this;
};

function _getBlockIdAndMeta( b ) { 
  var defaultMeta = 0,
    i = 0,
    bs,
    md,
    sp;
  if ( typeof b == 'string' ) { 
    bs = b;
    sp = bs.indexOf(':' );
    if ( sp == -1 ) { 
      b = parseInt(bs );
      // wph 20130414 - use sensible defaults for certain blocks e.g. stairs
      // should face the drone.
      for ( i in blocks.stairs ) { 
        if ( blocks.stairs[i] === b ) { 
          defaultMeta = Drone.PLAYER_STAIRS_FACING[this.dir];
          break;
        }
      }
      return [ b, defaultMeta ];
    }
    b = parseInt(bs.substring(0,sp ) );
    md = parseInt(bs.substring(sp+1,bs.length ) );
    return [b,md];
  }else{
    // wph 20130414 - use sensible defaults for certain blocks e.g. stairs
    // should face the drone.
    for ( i in blocks.stairs ) { 
      if ( blocks.stairs[i] === b ) { 
        defaultMeta = Drone.PLAYER_STAIRS_FACING[this.dir];
        break;
      }
    }
    return [ b, defaultMeta ];
  }
};
var _traverse = [{},{},{},{}];
// east
function walkWidthEast( drone, n,callback ) { 
  var s = drone.z, e = s + n;
  for ( ; drone.z < e; drone.z++ ) { 
    callback.call(drone ,drone.z-s );
  }
  drone.z = s;
}
function walkDepthEast( drone,n,callback ) { 
  var s = drone.x, e = s+n;
  for ( ;drone.x < e;drone.x++ ) { 
    callback.call(drone, drone.x-s );
  }
  drone.x = s;
}
function walkWidthSouth( drone,n,callback ) { 
  var s = drone.x, e = s-n;
  for ( ;drone.x > e;drone.x-- ) { 
    callback.call(drone, s-drone.x );
  }
  drone.x = s;
}
function walkWidthWest( drone,n,callback ) { 
  var s = drone.z, e = s-n;
  for ( ;drone.z > e;drone.z-- ) { 
    callback.call(drone, s-drone.z );
  }
  drone.z = s;
}
_traverse[0].width = walkWidthEast;
_traverse[0].depth = walkDepthEast;
// south
_traverse[1].width = walkWidthSouth;
_traverse[1].depth = walkWidthEast;
// west
_traverse[2].width = walkWidthWest;
_traverse[2].depth = walkWidthSouth;
// north
_traverse[3].width = walkDepthEast;
_traverse[3].depth = walkWidthWest;
function traverseHeight( drone,n,callback ) { 
  var s = drone.y, e = s + n;
  for ( ; drone.y < e; drone.y++ ) { 
    callback.call(drone, drone.y-s );
  }
  drone.y = s;
};
function traverseDHW( drone, d,h,w, callback ){
  _traverse[drone.dir].depth( drone, d, function traverseDepthCallback( ) { 
    traverseHeight( this, h, function traverseHeightCallback( ) { 
      _traverse[this.dir].width( this, w, callback);
    });
  });
}

Drone.clone = function(origin) {
  var result = new Drone(origin.x,origin.y,origin.z, origin.dir, origin.world);
  return result;
};
//
// wph 20130130 - make this a method - extensions can use it.
//
Drone.prototype._getBlockIdAndMeta = _getBlockIdAndMeta;
