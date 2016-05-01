$(function() {
    var socket = io('http://localhost:8000');

    // Selected Character Global
    var $curr_char;
    // Current Game ID
    var gameId;
    // Client Id
    var playerId;
    // team info
    var playerColor;
    var playerNumber;
    // Selected Characters
    var selectedCharacters = [];
    // floating character on placement screen
    var $to_place_character = $();
    var $placementSquare = $();
    // squares that are available for placement
    var validPlacementSquares;

    ///////////////
    // SCREEN FLOW
    ///////////////
	var start_view = nunjucks.render('/templates/start_view.html');
    var loading_view = nunjucks.render('/templates/loading_view.html');
    var table = nunjucks.render('/templates/table.html', {'width': 7, 'height': 7});
    var play_view = nunjucks.render('/templates/play_view.html');
	var spectator_view = nunjucks.render('/templates/spectator_view.html');
    var placement_view = nunjucks.render('/templates/placement_view.html');

	// Initialize with start_view
    $('body').append($(start_view));

    $(document).on('click', '#player-button', function() {
    	$('.screen').replaceWith($(loading_view));
        // socket.emit('team-selection');
        socket.emit('join-any');
    });

    $(document).on('click', '#loading-view #ready-button', function() {
        if (selectedCharacters.length == 3) {
            var $placement_view = $(placement_view);
            $placement_view.find('#ready-button').hide();
            //TODO: instead of hiding, make this a back button until placement is ready
            $('.screen').replaceWith($placement_view);

            validPlacementSquares.forEach(function(vec) {
                getSquare(vec).addClass('visible');
            });

            var $slots = $placement_view.find('.selected-character-slot');
            for (var i = 0; i < selectedCharacters.length; i++) {
                var $slot = $slots.eq(i);
                var character = selectedCharacters[i];
                $slot.css('background-image', "url('/img/characters/" + character + "/down/" + playerColor + ".png')")
                    .data('type', character);
            }
            $curr_char = $();
        } else {
            if (selectedCharacters.length < 3) {
                alert("You need to pick 3 characters!");
            }
        }
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
        $('#player-id').html(playerId);
        $curr_char = $();
    });

    $(document).on('click', '#spectator-button', function() {
        console.log('spectator button');
    	$('.screen').replaceWith($(spectator_view));
        socket.emit('observe-game');
    });

    $(document).on('click', '#forefeit-button', function() {
        console.log('click!');
    	$('.screen').replaceWith($(start_view));
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
        var $charList = $('#characters-list');
        for (var i = 0; i < message.gameParams.roster.length; i++) {
            var character = message.gameParams.roster[i];
            var $charCell = $('<div />')
                .addClass('roster-cell')
                .text(character.toLowerCase())
                .css('background-image', "url('/img/characters/" + character + "/down/" + message.gameParams.color + ".png')");
            $charList.append($charCell);
        }
    });

    /////////////////////////////////////////
    // LOAD VIEW INTERACTIONS
    /////////////////////////////////////////

    $(document).on('mouseover', ".roster-cell", function() {
        var hoverCell =  $(this);
        hoverCell.addClass('roster-cell-hover');
        //TODO: function to display stats here & make stats div on left
    });

    $(document).on('mouseout', ".roster-cell", function() {
        var hoverCell =  $(this);
        hoverCell.removeClass('roster-cell-hover');

    });

    $(document).on('click', '.roster-cell', function() {
        var cellClicked =  $(this);
        console.log("click!!!");
        if ( cellClicked.hasClass('selected-char') ) {
            cellClicked.removeClass('selected-char');
            // Remove character from roster

            // PROBLEM: indexOf assumes non-repeating characters
            // TODO: restruct indexing
            var selectedIndex = selectedCharacters.indexOf(cellClicked.text());
            if (selectedIndex > -1) {
                selectedCharacters.splice(selectedIndex, 1);
                var slot = cellClicked.parent().parent().find('#selected-character-slot-'+selectedIndex+'.selected-character-slot');
                slot.css('background-image', "none")
                    .data('type', ''); 
            }
        } else {
            if (selectedCharacters.length == 3) {
                alert("Max number of characters is 3!");
            } else {
                cellClicked.addClass('selected-char');

                // Add character to roster
                var slotIndex = selectedCharacters.length;
                var slot = cellClicked.parent().parent().find('#selected-character-slot-'+slotIndex+'.selected-character-slot');                
                slot.css('background-image', "url('/img/characters/" + cellClicked.text().toLowerCase() + "/down/" + playerColor + ".png')")
                    .data('type', cellClicked.text());

                selectedCharacters.push(cellClicked.text());
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
                .addClass('alive')
                .data('color', playerColor)
                .data('selection-slot', $this)
                /*.data('attack', _char.attack)
                .data('move', _char.move)
                .data('visibility', _char.visibility)*/
                .data('type', character_type.toLowerCase())
                .data('heading', 'down')
                .data('direction', default_direction)
                .css('background-image', "url('/img/characters/" + character_type.toLowerCase() + "/down/" + playerColor + ".png')")
                .css('top', evt.pageY - screen_pos.top)
                .css('left', evt.pageX - screen_pos.left)
                .attr('disabled', 'true');
        $this.data('character-obj', $char);
        $placement_view.append($char);
        $to_place_character = $char;
    });

    $(document).on('mousemove', '#placement-view', function(evt){
        if ($to_place_character.length) {
            var screen_pos = $(this).position();
            $to_place_character
                .css('top', evt.pageY - screen_pos.top)
                .css('left', evt.pageX - screen_pos.left);
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
            $curr_char.data('direction', direction).css('background-image', "url('/img/characters/" + $curr_char.data('type') + "/" + $curr_char.data('heading') + "/" + $curr_char.data('color') + ".png')")
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

                        .css('top', evt.pageY - screen_pos.top)
                        .css('left', evt.pageX - screen_pos.left)
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

    var animateArrow = function(animation, callback) {
        var $arrow = $('<sprite />').addClass('projectile').css('background-image', "url('/img/characters/archer/attack/red.png')");
        $arrow.animateProjectile($('.ghess-table'), animation.startPos, animation.endPos, 200, callback);
    };

    var animationFuncMap = {
        'arrow': animateArrow
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
                .data('heading', headingStr)
                .css('background-image', "url('/img/characters/" + _char.type.toLowerCase() + "/" + (_char.alive ? headingStr : 'dead') + "/" + _char.color + ".png')");

            if ($('#spectator-view').length){
                $char.addClass('mine')
                    _char.visibility.forEach(function(vec) {
                        var $square = getSquare(vec);
                        $square.addClass('visible');
                    });

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
                animationList.push(animationFuncMap[animations[i].attack].bind(null, animations[i], animationList[i+1] || callback));
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
        $curr_char = $();
        console.log('update-state', message);

        if (message.turn == playerId) {
            $('#play-view').css('background-color', 'green');
        } else {
            $('#play-view').css('background-color', '');
        }

        // Player Stat
        var selfChars = message.HUD.selfChars;
        for (var c = 0; c < selfChars.length; c++) {
            var $selfChar = $('<div />');
            var character = selfChars[c];
            $selfChar.addClass("selfCharCell");
            $selfChar.css('background-size', '100%');
            // $selfChar.css('background-image', "url('/img/characters/" + character.charType.toLowerCase() + "/down/red.png')");
            $selfChar.css('background-image', "url('/img/characters/" + character.charType.toLowerCase() + "/down/" + playerColor + ".png')");
            $("#player-stat").append($selfChar);
        }

        // Enemy Stat
        var enemyChars = message.HUD.enemyChars;
        var enemyColor;
        if (playerColor == 'red') {
            enemyColor = 'blue';
        } else {
            enemyColor = 'red';
        }
        
        for (var e = 0; e < enemyChars.length; e++) {
            var $enemyChar = $('<div />');
            // TODO: if we don't want to specify character type, we need a generic character image asset
            var enemy = enemyChars[e].charType;
            $enemyChar.addClass("enemyCharCell");
            $enemyChar.css('background-size', '100%');
            // $enemyChar.css('background-image', "url('/img/characters/" + enemy.toLowerCase() + "/down/blue.png')");
            $enemyChar.css('background-image', "url('/img/characters/" + enemy.toLowerCase() + "/down/" + enemyColor + ".png')");
            $("#enemy-stat").append($enemyChar);
        }

        handleAnimations(message.animations, function() {
            var $table = $(table);
            $('.ghess-table').replaceWith($table);
            handleCharacters($table, message.characters);
        });

    });

    socket.on('player-readied', function(message) {
        console.log('player-readied', message);
    });

    //////////////////////////////////
    // Play View Feedback
    //////////////////////////////////

    $(document).on('click', '#play-view sprite.character', function() {
        var $clicked = $(this);

        if ($clicked.hasClass('them') || $clicked.hasClass('dead')) {
            getSquare($clicked.data('position')).click();
        } else {
            cleanSquares();
            $('.glow').removeClass('glow');
            $curr_char = $clicked;
            $('.action-overlay').placeAt($curr_char.data('position'));
            $('.action-overlay').show();
            $curr_char.addClass('glow');
            $('.character-portrait').css('background-image', "url('/img/characters/" + $curr_char.data('type').toLowerCase() + "/down/" + $curr_char.data('color') + ".png')");
        }

        return false;
    });

    var cleanSquares = function() {

        $('.ghess-td')
            .removeClass('attack-candidate')
            .removeClass('move-candidate')
            .removeClass('visibility-hover');
        $('.turn-arrow-container').hide();
        $('.action-overlay').hide();
    };

    $(document).on('mouseover', 'sprite.alive.mine:not(.glow)', function() {
        $(this).data('visibility').forEach(function(vec) {
            var $square = getSquare(vec);
            $square.addClass('visibility-hover');
        });
    });

    $(document).on('mouseout', 'sprite.alive.mine', function() {
        $(this).data('visibility').forEach(function(vec) {
            var $square = getSquare(vec);
            $square.removeClass('visibility-hover');
        });
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

    $(document).on('click', '.attack-button', function() {
        cleanSquares();
        $curr_char.data('attack').forEach(function(vec) {
            var $square = getSquare(vec);
            $square.addClass('attack-candidate');
        });
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

    $(document).on('click', '.turn-button', function() {
        cleanSquares();
        if ($curr_char.length) {
            $('.turn-arrow-container').removeClass('transparent').placeAt($curr_char.data('position')).show();
        }
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

    $(document).on('click', '.move-button', function() {
        cleanSquares();
        $curr_char.data('move').forEach(function(vec) {
            var $square = getSquare(vec);
            $square.addClass('move-candidate');
        });
        return false;
    });

    $(document).on('click', '#play-view', function() {
        $curr_char = $();
        cleanSquares();
        $('.glow').removeClass('glow');
    });

///////////////////////////////////////////
//****************************************
// SPECTATOR VIEW
//****************************************
//////////////////////////////////////////

    socket.on('game-not-available', function(message) {
        console.log('No game available');
    });

    socket.on('waiting', function(message) {
        console.log('Waiting');
        gameId = message.gameId;
    });

});



