$(function() {
    // auto-resize
    var $screenContainer = $('.screen-container');
    var screenContainer = $screenContainer[0];
    var zoom = 1.0;
    var resizeGame = function() {
        var $window = $(this);
        zoom = Math.min($window.width() / screenContainer.clientWidth, $window.height() / screenContainer.clientHeight);
        $screenContainer.css('zoom', zoom);
    };
    resizeGame();
    $(window).resize(resizeGame);

    // var socket = io('http://18.111.7.191:8000');
    var socket = io('http://localhost:8000');

    // Selected Character Global
    var $curr_char;
    // Current stamina
    var currentStamina;
    // Current Game ID
    var gameId;
    // Client Id
    var playerId;
    // team info
    var playerColor;
    var playerNumber;
    // Selected Characters
    var $selectedCharacters;
    // floating character on placement screen
    var $to_place_character = $();
    var $placementSquare = $();
    // squares that are available for placement
    var validPlacementSquares;

    ///////////////
    // SOUNDS
    ///////////////

    // FIX SO THAT SOUNDS CAN BE PLAYED EVEN WHEN THEY ARE ALREADY PLAYING
    var getSound = function(src) {
        var sound = new buzz.sound(src);
        var supported = buzz.isSupported();
        var play_orig = sound.play;
        sound.play = function() {
            if (!supported) {
                return sound;
            }
            sound.setTime(0);
            sound.sound.play();
            return sound;
        };
        return sound;
    };

    var snd_menu = getSound("/client/audio/MenuLoop.wav");
    var snd_gameplay = getSound("/client/audio/GameplayLoop.wav");
    var snd_click = getSound("/client/audio/sfx_button_press.wav");
    var snd_invalid = getSound("/client/audio/sfx_invalid_action.wav");
    var snd_walk = getSound("/client/audio/sfx_walk.wav");
    var snd_turn = getSound("/client/audio/sfx_turn.wav");
    var snd_sword = getSound("/client/audio/sfx_sword.wav");
    var snd_arrow_fire = getSound("/client/audio/sfx_arrow_fire.wav");
    var snd_arrow_hit_char = getSound("/client/audio/sfx_arrow_character.wav");
    var snd_arrow_hit_shield = getSound("/client/audio/sfx_arrow_shield.wav");
    var snd_arrow_hit_wall = getSound("/client/audio/sfx_arrow_wall.wav");
    buzz.all().load();

    $(document).on('click', '#toggle-sound', function() {
        var $this = $(this);
        buzz.all().toggleMute();
        $this.toggleClass('sound-on').toggleClass('sound-off');
    });

    ///////////////
    // SCREEN FLOW
    ///////////////
	var start_view = nunjucks.render('client/templates/start_view.html');
    var loading_view = nunjucks.render('client/templates/loading_view.html');
    var table = nunjucks.render('client/templates/table.html', {'width': 7, 'height': 7});
    var play_view = nunjucks.render('client/templates/play_view.html');
	var spectator_view = nunjucks.render('client/templates/spectator_view.html');
    var placement_view = nunjucks.render('client/templates/placement_view.html');

	// Initialize with start_view
    $screenContainer.append($(start_view));
    snd_menu.loop().play();

    $(document).on('click', '#player-button', function() {
    	$('.screen').replaceWith($(loading_view));
        socket.emit('join-any');
    });

    $(document).on('click', '#loading-view #ready-button', function() {
        var $placement_view = $(placement_view);
        $placement_view.find('#ready-button').hide();
        //TODO: instead of hiding, make this a back button until placement is ready
        var selectedCharacters = $selectedCharacters.map(function() {
            return $(this).data('type');
        });
        $('.screen').replaceWith($placement_view);

        validPlacementSquares.forEach(function(vec) {
            getSquare(vec).addClass('visible');
        });

        var $slots = $placement_view.find('.selected-character-slot');
        for (var i = 0; i < $selectedCharacters.length; i++) {
            var $slot = $slots.eq(i);
            var character = selectedCharacters[i];
            $slot.data('type', character)
                .css('background-image', "url('/client/img/characters/" + character + "/down/" + playerColor + ".png')");
        }
        $curr_char = $();
    });

    $(document).on('click', '#placement-view #ready-button', function() {
        var $placementView = $('#placement-view');
        var $chars = $placementView.find('sprite.character');
        var charList = []
        for (var i = 0; i < $chars.length; i++) {
            var $char = $chars.eq(i);
            charList.push({
                'type': $char.data('type'),
                'position': $char.data('position'),
                'heading': $char.data('direction'),
            });
        }
        socket.emit('ready-player', {'characters': charList});
        $('.screen').replaceWith($(play_view));
        snd_menu.stop();
        snd_gameplay.loop().play();
        $('#player-id').html(playerId);
        $curr_char = $();
    });

    $(document).on('click', '#spectator-button', function() {
        console.log('spectator button');
        playerColor = 'blue';
    	$('.screen').replaceWith($(spectator_view));
        snd_menu.stop();
        snd_gameplay.loop().play();
        socket.emit('observe-game');
    });

    $(document).on('click', '.main-menu-button', function() {
        socket.disconnect();
        $('.screen').replaceWith($(start_view));
        snd_gameplay.stop();
        snd_menu.loop().play();
        socket.connect();
    });

///////////////////////////////////////////
//****************************************
// START VIEW
//****************************************
///////////////////////////////////////////
    $(document).on('mouseenter', '#start-view button', function() {
        $('#game-title').stop().fadeIn(700);
    });

    $(document).on('mouseleave', '#start-view button', function() {
        $('#game-title').stop().fadeOut(700);

    });


    $(document).on('mouseenter', '#start-view .see-credits', function() {
        $('#credits').stop().fadeIn(700);
    });

    $(document).on('mouseleave', '#start-view .see-credits', function() {
        $('#credits').stop().fadeOut(700);
    });


///////////////////////////////////////////
//****************************************
// LOAD VIEW
//****************************************
//////////////////////////////////////////

    /////////////////////////////////////////
    // LOAD VIEW MESSAGE HANDLING FROM SERVER
    /////////////////////////////////////////
    socket.on('team-selection', function(message) {
        console.log('team select', message);
        var roster = message.roster;
        playerColor = message.gameParams.color;
        playerNumber = message.gameParams.playerNumber;
        validPlacementSquares = message.gameParams.validSquares;
        // Default stat info to Archer (first character in characters-list)
        $('#selected-stat').css('background-image', "url('/client/img/characters/archer/stat/" + playerColor + "-stat.png')");
        var $charList = $('#characters-list');
        for (var i = 0; i < message.gameParams.roster.length; i++) {
            var character = message.gameParams.roster[i];
            var $charCell = $('<div />')
                .addClass('roster-cell')
                .text(character.toLowerCase())
                .data('type', character.toLowerCase())
                .css('background-image', "url('/client/img/characters/" + character + "/down/" + message.gameParams.color + ".png')");
            $charList.append($charCell);
        }
    });

    /////////////////////////////////////////
    // LOAD VIEW INTERACTIONS
    /////////////////////////////////////////

    $(document).on('mouseover', '#loading-view .roster-cell', function() {
        var $cellClicked =  $(this);
        $('#selected-stat').css('background-image', "url('/client/img/characters/" + $cellClicked.data('type') + "/stat/" + playerColor + "-stat.png')");
    });

    $(document).on('click', '#loading-view .roster-cell', function() {
        var $cellClicked =  $(this);
        $selectedCharacters = $('.selected-character-slot.selected');
        if ( $cellClicked.hasClass('selected-char') ) {
            $cellClicked.removeClass('selected-char');
            var $slot = $cellClicked.data('slot');
            $slot.css('background-image', 'none')
                .data('type', '')
                .removeClass('selected');
            $('#ready-button').hide();
        } else {
            if ($selectedCharacters.length == 3) {
                // TODO maybe add negative sound here
            } else {

                // Add character to roster
                var $slot = $('#loading-view').find('.selected-character-slot:not(.selected)').eq(0);
                $slot.css('background-image', "url('/client/img/characters/" + $cellClicked.data('type') + "/down/" + playerColor + ".png')")
                    .data('type', $cellClicked.data('type'))
                    .addClass('selected');
                $cellClicked.addClass('selected-char')
                    .data('slot', $slot);
                $selectedCharacters = $('.selected-character-slot.selected');
                if ($selectedCharacters.length == 3) {
                    $('#ready-button').show();
                };

            }
        }
    });

///////////////////////////////////////////
//****************************************
// PLACEMENT VIEW
//****************************************
///////////////////////////////////////////

    var cleanUpFloatingChar = function($floating) {
        var $slot = $($floating.data('selection-slot'));
        $slot.css('background-image', $slot.data('img'));
        $floating.remove();
        $placementSquare.removeClass('placement-square');
        $placementSquare.data('character', '');
        $placementSquare = $();
        $('#ready-button').hide();
    };

    $(document).on('click', '#placement-view .selected-character-slot', function(evt) {
        cleanUpFloatingChar($('.floating'));
        var $this = $(this);
        $($this.data('character-obj')).remove();
        $this
            .data('img', $this.css('background-image'))
            .css('background-image', '');
        var character_type = $this.data('type');
        var $placement_view = $('#placement-view');
        var screen_pos = $placement_view.position();
        var default_direction = {'x': 0, 'y': 1};
        var $char = $('<sprite>')
                .addClass('character')
                .addClass('floating')
                .data('color', playerColor)
                .data('selection-slot', $this)
                /*.data('attack', _char.attack)
                .data('move', _char.move)
                .data('visibility', _char.visibility)*/
                .data('type', character_type.toLowerCase())
                .data('heading', 'down')
                .data('direction', default_direction)
                .css('background-image', "url('/client/img/characters/" + character_type.toLowerCase() + "/down/" + playerColor + ".png')");

        $this.data('character-obj', $char);
        $placement_view.append($char);
        $char.css('top', (evt.pageY - screen_pos.top)/zoom - $char.height()/2.0)
                .css('left', (evt.pageX - screen_pos.left)/zoom - $char.width()/2.0)
                .attr('disabled', 'true');
        $to_place_character = $char;
    });

    $(document).on('mousemove', '#placement-view', function(evt){
        if ($to_place_character.length) {
            var screen_pos = $(this).position();
            $to_place_character
                .css('top', (evt.pageY - screen_pos.top)/zoom - $to_place_character.height()/2.0)
                .css('left', (evt.pageX - screen_pos.left)/zoom - $to_place_character.width()/2.0);
            $placementSquare.removeClass('placement-square');
            $placementSquare = $(document.elementsFromPoint(evt.clientX, evt.clientY)).filter('.ghess-td.visible').addClass('placement-square');
        }
        return false;
    });

    $(document).on('click', '#placement-view .floating', function(evt){
        var $this = $(this);
        if ($placementSquare) {
            $placementSquare.click();
        } else {
            cleanUpFloatingChar($this);
        }
    });

    $(document).on('click', '.placement-square', function(){
        var $existingChar = $($placementSquare.data('character'));
        var $slot = $($existingChar.data('selection-slot'));
        $slot.css('background-image', $slot.data('img'));
        $existingChar.remove();

        var $char = $to_place_character;
        $to_place_character = $();


        $('.ghess-table').append($char);
        $char.data('position', {
            'x': $placementSquare.data('x'),
            'y': $placementSquare.data('y')
        });

        $char
            .placeAt($char.data('position'))
            .removeClass('floating');

        $('.turn-arrow-container').placeAt($char.data('position')).show();
        $('.character-roster').hide();
        $curr_char = $char;
        $placementSquare.data('character', $char);
        $placementSquare.removeClass('placement-square');
        $placementSquare = $();
    });

    $(document).on('click', '#placement-view .turn-arrow', function() {
        var $arrow_clicked = $(this);
        var curr_char_pos = $curr_char.data('position');
        if (curr_char_pos) {
            var direction;
            if ($arrow_clicked.hasClass('turn-arrow-left')) {
                direction = {'x': -1, 'y': 0};
            } else if ($arrow_clicked.hasClass('turn-arrow-right')) {
                direction = {'x': 1, 'y': 0};
            } else if ($arrow_clicked.hasClass('turn-arrow-up')) {
                direction = {'x': 0, 'y': -1};
            } else if ($arrow_clicked.hasClass('turn-arrow-down')) {
                direction = {'x': 0, 'y': 1};
            }
            $curr_char.data('heading', getHeadingStrFromVec(direction));
            $curr_char.data('direction', direction).css('background-image', "url('/client/img/characters/" + $curr_char.data('type') + "/" + $curr_char.data('heading') + "/" + $curr_char.data('color') + ".png')")
            $curr_char = $();
            $('.character-roster').show();
            $('.turn-arrow-container').hide();
            if ($('.selected-character-slot').length == $('sprite:not(.floating)').length) {
                $('#ready-button').show();
            } else {
                $('#ready-button').hide();
            }
        } else {
            console.log('TURN ERROR - tried to turn without char');
        }
        return false;
    });

    $(document).on('click', '#placement-view sprite:not(.floating)', function(evt) {
        if ($('.turn-arrow-container:visible').length == 0) {
            var $this = $(this);
            if ($to_place_character.length == 0) {
                getSquare($this.data('position')).data('character', '');
                $to_place_character = $this;
                var $placementView = $('#placement-view');
                var screen_pos = $placementView.position();
                $this.addClass('floating')

                        .css('top', (evt.pageY - screen_pos.top)/zoom - $this.height()/2.0)
                        .css('left', (evt.pageX - screen_pos.left)/zoom - $this.width()/2.0)
                $placementView.append($this);
                $('#ready-button').hide();
            } else {
                getSquare($this.data('position')).click();
            }
        }
    });



///////////////////////////////////////////
//****************************************
// PLAY VIEW
//****************************************
//////////////////////////////////////////

    ////////////////////////////////////////
    // PLAY VIEW PLAYER INITIATED MESSAGING
    ////////////////////////////////////////

    $(document).on('click', '#play-view .turn-arrow', function() {
        var $arrow_clicked = $(this);
        var curr_char_pos = $curr_char.data('position');
        if (curr_char_pos) {
            var direction;
            if ($arrow_clicked.hasClass('turn-arrow-left')) {
                direction = {'x': -1, 'y': 0};
            } else if ($arrow_clicked.hasClass('turn-arrow-right')) {
                direction = {'x': 1, 'y': 0};
            } else if ($arrow_clicked.hasClass('turn-arrow-up')) {
                direction = {'x': 0, 'y': -1};
            } else if ($arrow_clicked.hasClass('turn-arrow-down')) {
                direction = {'x': 0, 'y': 1};
            }

            socket.emit('update-game', {
                'objectPosition': curr_char_pos,
                'newHeading': direction,
                'type': 'turn',
            });
        } else {
            console.log('TURN ERROR - tried to turn without char');
        }
        return false;
    });

    $(document).on('click', '#play-view .attack-candidate', function() {
        var $attackable_square = $(this);
        var curr_char_pos = $curr_char.data('position');
        if (curr_char_pos) {
            var attack_x = $attackable_square.data('x');
            var attack_y = $attackable_square.data('y');
            var target_pos = {'x': attack_x, 'y': attack_y};
            socket.emit('update-game', {
                'objectPosition': curr_char_pos,
                'targetPosition': target_pos,
                'type': 'attack',
            });
        } else {
            console.log('ATTACK CANDIDATE ERROR - tried to attack without char');
        }
        return false;
    });

    $(document).on('click', '#play-view .move-candidate', function() {
        var $move_square = $(this);
        var curr_char_pos = $curr_char.data('position');
        if (curr_char_pos) {
            var move_x = $move_square.data('x');
            var move_y = $move_square.data('y');
            var target_pos = {'x': move_x, 'y': move_y};
            socket.emit('update-game', {
                'objectPosition': curr_char_pos,
                'targetPosition': target_pos,
                'type': 'move',
            });
        } else {
            console.log('MOVE CANDIDATE ERROR - tried to move without char');
        }
        return false;
    });

    $(document).on('click', '#play-view .sleep-button', function() {
        socket.emit('update-game', {'type': 'pass'});
        return false;
    });

    /////////////////////////////////////////
    // PLAY VIEW ANIMATIONS
    /////////////////////////////////////////

    function signalInvalidAction() {
        snd_invalid.play();
        $('.stamina-meter').addClass('not-enough');
        var t = setInterval(function() {
            $('.stamina-meter').toggleClass('not-enough');
        }, 150);
        setTimeout(function() {
            clearInterval(t);
            $('.stamina-meter').removeClass('not-enough');
        }, 1500);
    }

    var animateArrow = function(animation, callback) {
        var $arrow = $('<sprite />')
            .addClass('projectile')
            .css('background-image', "url('/client/img/characters/archer/attack/red.png')");
        snd_arrow_fire.play();
        $arrow.animateProjectile($('.ghess-table'), animation.startPos, animation.endPos, 300, function() {
            $arrow.remove();
            callback();
        });
    };

    var animateSword = function(animation, callback) {
        var $sword = $('<sprite />')
            .addClass('projectile')
            .css('background-image', "url('/client/img/characters/swordsman/attack/red.png')")
            .hide();
        $('.ghess-table').append($sword);
        $sword.placeAt(animation.endPos);
        snd_sword.play();
        $sword.fadeIn({
            duration: 600,
            step: function(t) {
                $sword.rotate(30*t);
            },
            complete: function() {
                $sword.fadeOut({
                    duration: 600,
                    step: function(t) {
                        $sword.rotate(30*t);
                    },
                    complete: function() {
                        $sword.remove();
                        callback();
                    }
                });
            }
        });
    };

    var animateJavelin = function(animation, callback) {
        var $javelin = $('<sprite />')
            .addClass('projectile')
            .css('background-image', "url('/client/img/characters/javelinthrower/attack/red.png')");
        snd_arrow_fire.play();
        $javelin.animateDiagProjectile($('.ghess-table'), animation.startPos, animation.endPos, 300, function() {
            $javelin.remove();
            callback();
        });
    };

    var animateShield = function(animation, callback) {
        var $shield = $('<sprite />')
            .addClass('projectile')
            .css('background-image', "url('/client/img/characters/swordsman/defend/red.png')")
            .hide();
        $('.ghess-table').append($shield);
        $shield.placeAt(animation.startPos);
        snd_arrow_hit_shield.play();
        $shield.fadeIn(600, function(){
            $shield.fadeOut(600, function() {
                $shield.remove();
                callback();
            });
        });

    };

    var animateMove = function(animation, callback) {
        snd_walk.play();
        callback();
    };

    var animateTurn = function(animation, callback) {
        snd_turn.play();
        callback();
    };

    var animationFuncMap = {
        'arrow': animateArrow,
        'sword': animateSword,
        'shield': animateShield,
        'javelin': animateJavelin,
        'move': animateMove,
        'turn': animateTurn
    };

    /////////////////////////////////////////
    // PLAY VIEW MESSAGE HANDLING FROM SERVER
    /////////////////////////////////////////
    socket.on('connected', function(message) {
        console.log('connected', message);
        playerId = message.playerId;
    });

    socket.on('game-created', function(message) {
        console.log('game-created', message);
    });

    socket.on('game-joined', function(message) {
        console.log('game-joined', message);
        gameId = message.gameId;
    });

    var handleCharacters = function($table, chars) {
        for (var i = 0; i < chars.length; i++) {
            var _char = chars[i];
            var headingStr = getHeadingStrFromVec(_char.heading);
            var $char = $('<sprite>')
                .addClass('character')
                .addClass(_char.alive ? 'alive' : 'dead')
                .data('color', _char.color)
                .data('attack', _char.attack)
                .data('move', _char.move)
                .data('position', _char.position)
                .data('visibility', _char.visibility)
                .data('type', _char.type.toLowerCase())
                .data('attack-cost', _char.costInfo.attack)
                .data('move-cost', _char.costInfo.move)
                .data('turn-cost', _char.costInfo.turn)
                .data('heading', headingStr)
                .css('background-image', "url('/client/img/characters/" + _char.type.toLowerCase() + "/" + (_char.alive ? headingStr : 'dead') + "/" + _char.color + ".png')");

            if ($('#spectator-view').length){
                $char.addClass('mine');
                var setting = ($('.toggle-visibility').data('visibility') || 0)%3;
                if (setting == 0 || ($char.data('color')=='blue' && setting==1) || ($char.data('color')=='red' && setting==2)) {
                    $char.data('visibility').forEach(function(vec) {
                        var $square = getSquare(vec);
                        $square.addClass('visible');
                    });
                }
            } else {
                if (_char.team != playerId) {
                    $char.addClass('them');
                } else {
                    $char.addClass('mine');
                    _char.visibility.forEach(function(vec) {
                        var $square = getSquare(vec);
                        $square.addClass('visible');
                    });
                }
            }

            $table.append($char);
            $char.placeAt(_char.position);
        };
    };

    var handleAnimations = function(animations, callback) {
        cleanSquares();
        var animationList = [];
        for (var i = animations.length - 1; i > -1; i--) {
            try {
                animationList.push(animationFuncMap[animations[i].attack].bind(null, animations[i], animationList[animationList.length-1] || callback));
            } catch(err) {
            }
        }
        if (animationList.length) {
            animationList[animationList.length-1]();
        } else {
            callback();
        }
    };

    socket.on('update-state', function(message) {
        $('.waiting-message').hide();
        $curr_char = $();
        console.log('update-state', message);

        // Enemy Stat
        var enemyChars = message.HUD.enemyChars;
        var enemyColor;
        if (playerColor == 'red') {
            enemyColor = 'blue';
        } else {
            enemyColor = 'red';
        }

        // Show who's turn

        if (playerColor == message.color || $('#spectator-view').length) {
            var turnColor = 'turn-'+message.color;
            $("#turn-standard").addClass('turn-standard-'+playerColor);
            $("#enemy-turn-standard").removeClass('turn-standard-'+enemyColor);
        } else {
            var turnColor = 'turn-gray';
            $("#enemy-turn-standard").addClass('turn-standard-'+enemyColor);
            $("#turn-standard").removeClass('turn-standard-'+playerColor);
        }

        if ($('#spectator-view').length) {
            if (message.color == 'blue') {
                $("#turn-standard").addClass('turn-standard-blue');
                $("#enemy-turn-standard").removeClass('turn-standard-red');
            } else {
                $("#enemy-turn-standard").addClass('turn-standard-red');
                $("#turn-standard").removeClass('turn-standard-blue');
            }
        }
        $('#stamina-title').removeClass().addClass(turnColor);
        $('#stamina-level').removeClass().addClass(turnColor);
        $('#stamina-count').removeClass().addClass(turnColor);

        // Show stamina info
        var levelPercent = Math.round((message.stamina.current/message.stamina.max)*100)/100;
        var meterWidth = $('.stamina-meter').width();
        var animateSpeed = 2500;
        if (message.stamina == false) {
            levelPercent = 0;
            animateSpeed = 2000;
        }
        currentStamina = message.stamina.current;
        $('#stamina-count').html(message.stamina.current);
        $('#stamina-level').animate({
            width: levelPercent * meterWidth
        }, animateSpeed);

        // Player Stat
        var selfChars = message.HUD.selfChars;
        $('#player-stat .stat-cell').remove();
        for (var c = 0; c < selfChars.length; c++) {
            var $selfChar = $('<div />');
            var character = selfChars[c];
            var alive = character.alive;
            $selfChar.addClass('stat-cell');
            $selfChar.css('background-image', "url('/client/img/characters/" + character.charType.toLowerCase() + (alive ? "/down/" : "/dead/") + playerColor + ".png')");
            $('#player-stat').append($selfChar);
        }

        $('#enemy-stat .stat-cell').remove();
        for (var e = 0; e < enemyChars.length; e++) {
            var $enemyChar = $('<div />');
            // TODO: if we don't want to specify character type, we need a generic character image asset
            $enemyChar.addClass('stat-cell');
            var enemy = enemyChars[e].charType;
            var alive = enemyChars[e].alive;
            if (enemy != 'undefined') {
                $enemyChar.css('background-image', "url('/client/img/characters/" + enemy.toLowerCase() + (alive ? "/down/" : "/dead/") + enemyColor + ".png')");
            } else {
                $enemyChar.addClass('unknown-'+enemyColor);
            }
            $('#enemy-stat').append($enemyChar);
        }

        handleAnimations(message.animations, function() {
            var $table = $(table);
            $('.ghess-table').replaceWith($table);
            handleCharacters($table, message.characters);
            if (message.turn != playerId) {
                $('.ghess-table').find('.action-button').addClass('disabled not-turn');
            }
        });

    });

    socket.on('player-readied', function(message) {
        console.log('player-readied', message);
    });

    socket.on('game-over', function(message) {
        console.log('game-over', message);
        $('#forfeit-button').text('Leave');
        if (message.winner == playerId) {
            $('.win-message').fadeIn();
        } else {
            $('.lose-message').fadeIn();
        }
        if ($('#spectator-view').length) {
            var $message = $('.win-message');
            $message.find('.h1').text(message.winner.toUpperCase() + ' Won!');
            var $message = $('.win-message').fadeIn();
        }
    });

    //////////////////////////////////
    // Play View Feedback
    //////////////////////////////////

    $(document).on('click', '#forfeit-button', function() {
        $('.forfeit-confirmation').fadeIn();
    });

    $(document).on('click', '.hide-message', function() {
        $('.message').fadeOut();
    });

    var selectCharacter = function($clicked) {
        if (!$('#spectator-view').length) {
            if ($clicked.hasClass('mine')) {
                $('.ghess-table').find('.action-button').removeClass('disabled');
            } else {
                $('.ghess-table').find('.action-button').addClass('disabled');
            }
        }
        cleanSquares();
        $('.glow').removeClass('glow');
        $curr_char = $clicked;
        $('.action-overlay').placeAt($curr_char.data('position'));
        $('.attack-button').attr('data-cost', '-'+$curr_char.data('attack-cost'));
        $('.turn-button').attr('data-cost', '-'+$curr_char.data('turn-cost'));
        $('.move-button').attr('data-cost', '-'+$curr_char.data('move-cost'));
        $('.action-overlay').show();
        $curr_char.addClass('glow');
        $('.character-portrait').css('background-image', "url('/client/img/characters/" + $curr_char.data('type').toLowerCase() + "/stat/" + $curr_char.data('color') + "-stat.png')");
    };

    $(document).on('click', '#play-view sprite.character, #spectator-view sprite.character', function() {
        var $clicked = $(this);

        if ($clicked.hasClass('them') || $clicked.hasClass('dead')) {
            var $square = getSquare($clicked.data('position')).click();
            if ($square.hasClass('move-candidate') || $square.hasClass('attack-candidate')) {
                $square.click();
            } else {
                if (!$clicked.hasClass('dead')) {
                    selectCharacter($clicked);
                }
            }
        } else {
            selectCharacter($clicked);
        }
        snd_click.play();

        return false;
    });

    var cleanSquares = function() {

        $('.ghess-td')
            .removeClass('attack-candidate')
            .removeClass('attack-candidate-hover')
            .removeClass('move-candidate')
            .removeClass('move-candidate-hover')
            .removeClass('visibility-hover');
        $('.turn-arrow-container').hide();
        $('.action-overlay').hide();
    };

    $(document).on('mouseover', 'sprite.alive:not(.glow)', function() {
        if (!$('.move-candidate').length && !$('.attack-candidate').length) {
            $(this).data('visibility').forEach(function(vec) {
                var $square = getSquare(vec);
                $square.addClass('visibility-hover');
            });
            //$('.character-portrait').css('background-image', "url('/client/img/characters/" + $(this).data('type').toLowerCase() + "/stat/" + $(this).data('color') + "-stat.png')");
        }
    });

    $(document).on('mouseout', 'sprite.alive', function() {
        $(this).data('visibility').forEach(function(vec) {
            var $square = getSquare(vec);
            $square.removeClass('visibility-hover');
        });
        // $('.character-portrait').css('background-image', "");
    });


    $(document).on('mouseover', '.attack-button', function() {
        $curr_char.data('attack').forEach(function(vec) {
            var $square = getSquare(vec);
            $square.addClass('attack-candidate-hover');
        });
    });

    $(document).on('mouseout', '.attack-button', function() {
        $curr_char.data('attack').forEach(function(vec) {
            var $square = getSquare(vec);
            $square.removeClass('attack-candidate-hover');
        });
    });

    $(document).on('click', '.attack-button:not(.disabled, .not-turn)', function() {
        cleanSquares();
        if ($curr_char.data('attack-cost') > currentStamina) {
            signalInvalidAction();
            return false;
        }
        $curr_char.data('attack').forEach(function(vec) {
            var $square = getSquare(vec);
            $square.addClass('attack-candidate');
        });
        snd_click.play();
        return false;
    });

    $(document).on('mouseover', '.turn-button', function() {
        $('.turn-arrow-container').placeAt($curr_char.data('position')).addClass('transparent').show();
    });

    $(document).on('mouseout', '.turn-button', function() {
        var $turn_arrow_container = $('.turn-arrow-container');
        if ($turn_arrow_container.hasClass('transparent')) {
            $('.turn-arrow-container').hide().removeClass('transparent');
        }
    });

    $(document).on('click', '.turn-button:not(.disabled, .not-turn)', function() {
        cleanSquares();
        if ($curr_char.length) {
            if ($curr_char.data('turn-cost') > currentStamina) {
                signalInvalidAction();
                return false;
            }
            $('.turn-arrow-container').removeClass('transparent').placeAt($curr_char.data('position')).show();
        }
        snd_click.play();
        return false;
    });

    $(document).on('mouseover', '.move-button', function() {
        $curr_char.data('move').forEach(function(vec) {
            var $square = getSquare(vec);
            $square.addClass('move-candidate-hover');
        });
    });

    $(document).on('mouseout', '.move-button', function() {
        $curr_char.data('move').forEach(function(vec) {
            var $square = getSquare(vec);
            $square.removeClass('move-candidate-hover');
        });
    });

    $(document).on('click', '.move-button:not(.disabled, .not-turn)', function() {
        cleanSquares();
        if ($curr_char.data('move-cost') > currentStamina) {
            signalInvalidAction();
            return false;
        }
        $curr_char.data('move').forEach(function(vec) {
            var $square = getSquare(vec);
            $square.addClass('move-candidate');
        });
        snd_click.play();
        return false;
    });

    $(document).on('click', '#play-view, #spectator-view', function() {
        $curr_char = $();
        cleanSquares();
        $('.glow').removeClass('glow');
    });

///////////////////////////////////////////
//****************************************
// SPECTATOR VIEW
//****************************************
//////////////////////////////////////////
    $(document).on('click', '#spectator-view .toggle-visibility', function() {
        var $this = $(this);
        $this.data('visibility', ($this.data('visibility') || 0) + 1);
        var setting = $this.data('visibility')%3;
        if (setting == 0) {
            $this.css('background-color', '');
        } else if (setting == 1) {
            $this.css('background-color', 'blue');
        } else if (setting == 2) {
            $this.css('background-color', 'red');
        }

        $('.ghess-td').removeClass('visible');
        $('.character.alive').each(function() {
            var $char = $(this);
            if (setting == 0 || ($char.data('color')=='blue' && setting==1) || ($char.data('color')=='red' && setting==2)) {
                $char.data('visibility').forEach(function(vec) {
                    var $square = getSquare(vec);
                    $square.addClass('visible');
                });
            }
        });
    });

    socket.on('game-not-available', function(message) {
        console.log('No game available');
        $('.message').hide();
        $('.none-available-message').show();
    });

    socket.on('waiting', function(message) {
        console.log('Waiting');
        gameId = message.gameId;
    });

});



