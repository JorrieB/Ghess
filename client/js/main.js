$(function() {
    var socket = io('http://localhost:8000');

    // Selected Character Global
    var $curr_char;
    // Current Game ID
    var gameId;
    // Client Id
    var playerId;

    ///////////////
    // SCREEN FLOW
    ///////////////
	var start_view = nunjucks.render('/templates/start_view.html');
    var loading_view = nunjucks.render('/templates/loading_view.html');
    var table = nunjucks.render('/templates/table.html', {'width': 7, 'height': 7});
    var play_view = nunjucks.render('/templates/play_view.html');
	var spectator_view = nunjucks.render('/templates/spectator_view.html');

	// Initialize with start_view
    $('body').append($(start_view));

    $(document).on('click', '#player-button', function() {
    	$('.screen').replaceWith($(loading_view));
        console.log("emit team-select");
        socket.emit('team-selection');
    });

    $(document).on('click', '#ready-button', function() {
        $('.screen').replaceWith($(play_view));
        $('#player-id').html(playerId);
        $curr_char = $();
        socket.emit('join-any');
    });

    $(document).on('click', '#spectator-button', function() {
    	$('.screen').replaceWith($(spectator_view));
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
        var numCol = 3;
        var roster = message.roster;
        // Each row has 3 cells
        for (var i = 0; i < Math.ceil(roster.length/numCol); i++) {
            var row = document.createElement("div");
            row.className = "roster-row";
            for (var j = 0; j < numCol; j++) {
                var character = roster[ numCol*i + j];
                var charCell = document.createElement("div");
                charCell.className = "roster-cell";
                charCell.innerText = character.toLowerCase();
                $(charCell).css('background-image', "url('/img/characters/"+character+"/down/red.png')");
                row.appendChild(charCell);
            }
            document.getElementById("characters-list").appendChild(row);
        }
    });

    /////////////////////////////////////////
    // LOAD VIEW INTERACTIONS
    /////////////////////////////////////////

    $(document).on('mouseover', ".roster-cell", function() {
        var cell =  $(this);
        cell.addClass('roster-cell-hover');
    });

    $(document).on('mouseout', ".roster-cell", function() {
        var cell =  $(this);
        cell.removeClass('roster-cell-hover');
    });

    $(document).on('click', ".roster-cell", function() {
        var cellClicked =  $(this);
        cellClicked.addClass('clicked-cell');
    });

///////////////////////////////////////////
//****************************************
// PLAY VIEW
//****************************************
//////////////////////////////////////////

    ////////////////////////////////////////
    // PLAY VIEW PLAYER INITIATED MESSAGING
    ////////////////////////////////////////

    $(document).on('click', '.turn-arrow', function() {
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

    $(document).on('click', '.attack-candidate', function() {
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

    $(document).on('click', '.move-candidate', function() {
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

    $(document).on('click', '.sleep-button', function() {
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
        socket.emit('ready-player');
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
                .css('background-image', "url('/img/characters/" + _char.type.toLowerCase() + "/" + headingStr + "/" + _char.color + ".png')");

            _char.visibility.forEach(function(vec) {
                var $square = getSquare(vec);
                $square.addClass('visible');
            });

            if (_char.team != playerId) {
                $char.addClass('them');
            } else {
                $char.addClass('mine');
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
        for (var c=0; c < selfChars; c++) {
            var selfChar = document.createElement("div");
            selfChar.className = "selfCharCell";
            selfChar.css('background-image', "url('/img/characters/" + selfChars[c].charType.toLowerCase() + "/down/red.png");
            $('#player-stat').html(selfChar);
        }

        // Enemy Stat
        $('#enemy-stat').html(message.HUD.enemyChars.length);

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

    $(document).on('click', 'sprite.character', function(evt) {
        var $clicked = $(this);

        if ($clicked.hasClass('them') || $clicked.hasClass('dead')) {
            $clicked.hide();
            real_clicked = document.elementFromPoint(evt.clientX, evt.clientY);
            $clicked.show();
            $(real_clicked).click();
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
});
