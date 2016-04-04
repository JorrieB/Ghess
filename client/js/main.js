$(function() {
    var play_view = nunjucks.render('/templates/play_view.html');
    $('body').append($(play_view));
});
