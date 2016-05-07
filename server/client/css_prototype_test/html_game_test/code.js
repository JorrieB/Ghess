$(function() {
    var $table = $('table');
    for (var i = 0; i < 10; i++) {
        var $row = $('<tr />');
        for (var j = 0; j < 10; j++) {
            var $square = $('<td />');
            $square.data('x', j);
            $square.data('y', i);
            $row.append($square);
        }
        $table.append($row);
    }

    var get_square = function(x, y) {
        return $('td').filter(function() {
            return ($(this).data('x') == x) && ($(this).data('y') == y);
        });
    };

    var dude_visibility = [[0,0], [0,1], [1,0], [-1,0], [0,-1]];
    var dude_x = 5;
    var dude_y = 5;
    get_square(dude_x, dude_y).attr('id', 'dude');

    $('#dude').hover(function(){
        dude_visibility.forEach(function(coords) {
            var x = coords[0];
            var y = coords[1];
            var $square = get_square(x + dude_x, y + dude_y);
            $square.addClass('glow');
        });
    }, function() {
        dude_visibility.forEach(function(coords) {
            var x = coords[0];
            var y = coords[1];
            var $square = get_square(x + dude_x, y + dude_y);
            $square.removeClass('glow');
        });
    });

    $('#shoot-arrow').click(function() {
        var start = [3,6];
        var end = [3,3];
        var $arrow = $('<arrow />');
        $arrow.animateProjectile($table, start, end, 200, function() {
            $arrow.remove();
        });
    })

    window.test_arrow = function(start, end){
        var $arrow = $('<arrow />');
        $arrow.animateProjectile($table, start, end, 200, function() {
            $arrow.remove();
        });
    };

});
