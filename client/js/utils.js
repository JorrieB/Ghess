$.fn.allPosition = function() {
    var position = this.position();
    position.bottom = this.height() + position.top;
    position.right = this.width() + position.left;
    return position;
};

$.fn.getPosition = function() {
    var $square = this.closest('.ghess-td');
    if ($square.length == 1) {
        $square = $square.eq(0);
        var x = $square.data('x');
        var y = $square.data('y');
        return [x, y];
    }
    return null;
};

$.fn.rotate = function(degrees) {
    this.css('-webkit-transform', 'rotate(' + degrees + 'deg)')
        .css('-moz-transform', 'rotate(' + degrees + 'deg)')
        .css('-ms-transform', 'rotate(' + degrees + 'deg)')
        .css('-o-transform', 'rotate(' + degrees + 'deg)')
        .css('transform', 'rotate(' + degrees + 'deg)');
    return this;
};

getSquare = function(vec) {
    return $('.ghess-td').filter(function() {
        return ($(this).data('x') == vec.x) && ($(this).data('y') == vec.y);
    });
};

$.fn.placeAt = function(vec) {
    var $square = getSquare(vec);
    var pos = $square.position();
    this.css('top', pos.top).css('left', pos.left);
    return this;
}

dirToDegrees = {'up': 0, 'down': 180, 'left': 270, 'right': 90};

getHeadingStrFromVec = function(vec) {
    if ((vec.x == 0) && (vec.y == 1)) {
        return 'down';
    } else if ((vec.x == 0) && (vec.y == -1)) {
        return 'up';
    } else if ((vec.x == 1) && (vec.y == 0)) {
        return 'right';
    } else if ((vec.x == -1) && (vec.y == 0)) {
        return 'left';
    }
    console.log('Bad heading passed in', vec);
}


// returns []
// animates from start element to end element with reference values:
// ..._vert = 'top' or 'bottom', ..._horiz = 'left' or 'right'
var getAnimCoords = function($start_elem, $end_elem,
    start_vert, start_horiz, end_vert, end_horiz) {
    var start_pos = $start_elem.allPosition();
    var end_pos = $end_elem.allPosition();
    return {
        'start_top': start_pos[start_vert],
        'start_left': start_pos[start_horiz],
        'end_top': end_pos[end_vert],
        'end_left': end_pos[end_horiz]};
};

// get vector direction 'up', 'down', 'left', 'right'

var getDirAndLen = function(start, end) {
    var vert = end.y - start.y;
    var horiz = end.x - start.x;
    var out = {'len': Math.abs(vert || horiz)};
    if (vert > 0) {
        out.dir = 'down';
        out.next = {
            'x': start.x,
            'y': start.y + 1
        };
    } else if (vert < 0) {
        out.dir = 'up';
        out.next = {
            'x': start.x,
            'y': start.y - 1
        };
    } else if (horiz < 0) {
        out.dir = 'left';
        out.next = {
            'x': start.x - 1,
            'y': start.y
        };
    } else if (horiz > 0) {
        out.dir = 'right';
        out.next = {
            'x': start.x + 1,
            'y': start.y
        };
    } else {
        throw 'no direction';
    }
    return out;
};

$.fn.animateProjectile = function($targetContainer, start, end, speed, callback) {
    this.hide();
    $targetContainer.append(this);

    var dl = getDirAndLen(start, end);
    var direction = dl.dir;
    var length = dl.len;
    this.rotate(dirToDegrees[direction]);

    var $start = getSquare(dl.next);
    var $end = getSquare(end);

    var start_vert = direction=='up' ? 'bottom' : 'top';
    var end_vert = direction=='down' ? 'bottom' : 'top';
    var start_horiz = direction=='left' ? 'right' : 'left';
    var end_horiz = direction=='right' ? 'right' : 'left';
    var animCoords = getAnimCoords($start, $end, start_vert, start_horiz, end_vert, end_horiz);

    this.css('top', animCoords.start_top)
        .css('left', animCoords.start_left);
    this.show();
    this.animate({
        'top': animCoords.end_top,
        'left': animCoords.end_left,
    }, speed*length, 'linear', callback);
    return this;
};
