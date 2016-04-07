$(function() {
    var socket = io();

    // Selected Character Global
    var $curr_char;

    ///////////////
    // SCREEN FLOW
    ///////////////
	var start_view = nunjucks.render('/templates/start_view.html');
    var play_view = nunjucks.render('/templates/play_view.html');
	var spectator_view = nunjucks.render('/templates/spectator_view.html');

	// Initialize with start_view
    $('body').append($(start_view));

    $(document).on('click', '#player-button', function() {
    	$('.screen').replaceWith($(play_view));
        $curr_char = $();
    });

    $(document).on('click', '#spectator-button', function() {
    	$('.screen').replaceWith($(spectator_view));
    });

    $(document).on('click', '#forefeit-button', function() {
        console.log('click!');
    	$('.screen').replaceWith($(start_view));
    });


    /////////////
    // PLAY VIEW
    /////////////

    $(document).on('click', '.turn-arrow', function() {
        var $arrow_clicked = $(this);
        var curr_char_pos = $curr_char.getPosition();
        if (curr_char_pos) {
            var direction;
            if ($arrow_clicked.hasClass('turn-arrow-left')) {
                direction = [-1, 0];
            } else if ($arrow_clicked.hasClass('turn-arrow-right')) {
                direction = [1, 0];
            } else if ($arrow_clicked.hasClass('turn-arrow-up')) {
                direction = [0, -1];
            } else if ($arrow_clicked.hasClass('turn-arrow-down')) {
                direction = [0, 1];
            }

            socket.emit('update-game', {
                'objectPosition': curr_char_pos,
                'newHeading': direction,
                'type': 'turn',
            });
        }
        console.log('TURN ERROR - tried to turn without char');
    });

    $(document).on('click', '.attack-candidate', function() {
        var $attackable_square = $(this);
        var curr_char_pos = $curr_char.getPosition();
        if (curr_char_pos) {
            var attack_x = $attackable_square.data('x');
            var attack_y = $attackable_square.data('y');
            var target_pos = [attack_x, attack_y];
            socket.emit('update-game', {
                'objectPosition': curr_char_pos,
                'targetPosition': target_pos,
                'type': 'attack',
            });
        }
        console.log('ATTACK CANDIDATE ERROR - tried to attack without char');
    });

    $(document).on('click', '.move-candidate', function() {
        var $move_square = $(this);
        var curr_char_pos = $curr_char.getPosition();
        if (curr_char_pos) {
            var move_x = $move_square.data('x');
            var move_y = $move_square.data('y');
            var target_pos = [move_x, move_y];
            socket.emit('update-game', {
                'objectPosition': curr_char_pos,
                'targetPosition': target_pos,
                'type': 'move',
            });
        }
        console.log('MOVE CANDIDATE ERROR - tried to move without char');
    });

    $(document).on('click', '.sleep-button', function() {
        socket.emit('update-game', {'type': 'pass'});
    });
});
