$(function() {
	var start_view = nunjucks.render('/templates/start_view.html');
    var play_view = nunjucks.render('/templates/play_view.html');
	var spectator_view = nunjucks.render('/templates/spectator_view.html');

	// Initialize with start_view
    $('body').append($(start_view));

    $('#player-button').click(function () {
    	$('body').replaceWith($(play_view));
    });

    $('#spectator-button').click(function () {
    	$('body').replaceWith($(spectator_view));
    });
    
    $('#forefeit-button').click(function () {
        console.log('click!');
    	$('body').replaceWith($(start_view));
    });
});
