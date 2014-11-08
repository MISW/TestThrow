enchant();

window.onload = function() {
    var game = new Game(320, 480);
    game.preload('./img/paper.png', './img/trash.png',
                 './img/title_1.png', './img/title_2.png',
                 './img/pause.png',
                 './img/pause_continue.png', './img/pause_giveup.png',
                 './img/1-1.png', './img/1-2.png', './img/2-1.png', './img/2-2.png',
                 './img/3-1.png', './img/3-2.png', './img/4-1.png', './img/4-2.png');

    game.onload = function() {
        game.replaceScene(createResultScene(game));
    };
    game.start();
};
