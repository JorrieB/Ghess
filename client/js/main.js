$(function() {
	var start_view = nunjucks.render('/templates/start_view.html');
    var play_view = nunjucks.render('/templates/play_view.html');
    $('body').append($(start_view));
    $('#player-button').click(function () {
    	$('body').replaceWith($(play_view));
    });
    
});
