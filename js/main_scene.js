TestThrow.prototype.gotoGameOverScene = function() {
    var game = this;
    var scene = new Scene();

    //"GAMEOVER"の文字の表示
    var image = this.assets[IMG_GAMEOVER];
    var gameover = new Sprite(image.width, image.height);
    var centerY = (this.height - gameover.height) / 2
    gameover.image = image;
    gameover.moveTo(this.width, centerY);
    gameover.tl.moveTo(0, centerY, 0.5 * this.fps, enchant.Easing.QUAD_EASYINOUT).delay(1.0 * this.fps).moveTo(-this.width, centerY, 0.5 * this.fps, enchant.Easing.QUAD_EASYINOUT).then(function() {
        game.removeScene(scene);
        game.gotoResultScene();
    });
    scene.addChild(gameover);

    this.pushScene(scene);
}

var MainScene = Class.create(Scene, {
    initialize: function(game) {
        Scene.call(this);
        this.game = game;
    }
});

const Paper_frame = {
    'SAIRI': 0,
    'MATH': 1,
    'ALC': 2,
    'REPORT': 3,
    'CRASH': 4,
};
const PAPER_DEFAULT_X = 60;
const PAPER_DEFAULT_Y = 90;
const PAPER_W = 200;
const PAPER_H = 300;

const THRS = 3;
const MOVE_TIME = 0.4;
const VELOCITY = -130;

MainScene.prototype.placeNewPaper = function() {
    var game = this.game;
    const PAPER_IMG_W = game.assets[IMG_PAPER].width / Object.keys(Paper_frame).length;
    const PAPER_IMG_H = game.assets[IMG_PAPER].height;
    var pic = new Sprite(PAPER_IMG_W, PAPER_IMG_H);
    pic.image = game.assets[IMG_PAPER];
    pic.frame = Math.floor(Math.random() * 3) % 3 + 1;

    var paper = this.paper;
    paper.sprite = new Group();
    paper.sprite.addChild(pic);
    paper.sprite.moveTo(game.width + PAPER_DEFAULT_X, PAPER_DEFAULT_Y);

    paper.state = "new";

    paper.score = Math.random(1) < 0.5;
    for (var i = 0; i < paper.numOfQuestion; i++) {
        var size = {
            'width': 60,
            'height': 44
        };
        var image = (paper.isSuccessed()) ? this.markOk : this.markNg;
        var sprite = new Sprite(image.width, image.height);
        sprite.image = image;
        sprite.fitToSize(size.width, size.height);
        sprite.moveTo(20, i * 80 + 20);

        paper.sprite.addChild(sprite);
    }

    var scene = this;
    scene.addChild(paper.sprite);
    var tl = paper.sprite.tl.moveTo(PAPER_DEFAULT_X, PAPER_DEFAULT_Y, Math.floor(MOVE_TIME * game.fps), enchant.Easing.QUINT_EASEOUT);

    if (game.stage == 0) {
        tl.exec(function() {
            var image = game.assets[IMG_CURSOR];
            var size = {
                width: image.width / 4,
                height: image.height / 4
            };
            if (scene.guide) scene.removeChild(scene.guide);
            scene.guide = new Sprite(image.width, image.height);
            scene.guide.image = image;
            if (paper.isSuccessed()) {
                scene.guide.rotation = -90;
                scene.guide.moveTo(PAPER_DEFAULT_X - 10 - size.width, PAPER_DEFAULT_Y + PAPER_H / 2 + size.height / 2);
            } else {
                scene.guide.moveTo(PAPER_DEFAULT_X + PAPER_W / 2 - size.width / 2, PAPER_DEFAULT_Y - 10 - size.height);
            }
            scene.guide.fitToSize(size.width, size.height);
            scene.addChild(scene.guide);
        });
    }
};

//"START"の文字の表示
MainScene.prototype.createStartScene = function() {
    var scene = this;
    var game = this.game;
    var startScene = new Scene();
    var l_start = new Sprite(GAMESTART_IMG_WIDTH, GAMESTART_IMG_HEIGHT);
    var labelSize = {
        'width': 320,
        'height': 80
    };
    l_start.image = game.assets[IMG_GAMESTART];
    l_start.scaleX = labelSize.width / GAMESTART_IMG_WIDTH;
    l_start.scaleY = labelSize.height / GAMESTART_IMG_HEIGHT;
    l_start.moveTo(0, game.width / 2 - GAMESTART_IMG_HEIGHT / 2);
    l_start.tl.rotateTo(45, 1).scaleTo(5, 1).scaleTo(0.9, 20).and().rotateTo(0, 20).delay(10).fadeOut(10).and().moveBy(0, -50, 10).then(function() {
        game.popScene();

        // After 30 seconds, game is over.
        scene.timer.after(30).then(function() {
            game.scores = scene.scores;
            game.gotoGameOverScene();
        });
        this.parentNode.removeChild(l_start);
        scene.placeNewPaper();
    });
    startScene.addChild(l_start);
    return startScene;
};

MainScene.prototype.crumple = function() {
    var paper = this.paper;
    var game = this.game;
    var scene = this;
    const PAPER_IMG_W = game.assets[IMG_PAPER].width / Object.keys(Paper_frame).length;
    const PAPER_IMG_H = game.assets[IMG_PAPER].height;

    this.wasteSound.play();

    paper.state = "wasted";
    var sprite = new Sprite(PAPER_IMG_W, PAPER_IMG_H);
    sprite.image = game.assets[IMG_PAPER];
    sprite.frame = Paper_frame.CRASH;

    var group = new Group();
    group.addChild(sprite);
    group.moveTo(paper.sprite.x, paper.sprite.y);

    scene.removeChild(paper.sprite);
    scene.addChild(group);
    paper.sprite = group;

    paper.sprite.tl.moveTo(PAPER_DEFAULT_X, PAPER_DEFAULT_Y, Math.floor(.25 * game.fps), enchant.Easing.QUINT_EASEOUT);
};

// throw old paper away
MainScene.prototype.throwAway = function() {
    var paper = this.paper;
    var game = this.game;
    var scene = this;
    var flySound = this.flySound;
    var scores = this.scores;
    var sprite = paper.sprite;
    sprite.tl.moveBy(0, VELOCITY * MOVE_TIME * game.fps, Math.floor(MOVE_TIME * game.fps)).removeFromScene();
    scene.addChild(sprite);

    flySound.play(); //効果音を再生

    if (!paper.isSuccessed()) {
        scores.ng++;
    }

    if (paper.isSuccessed()) {
        scores.okMax++;
    } else {
        scores.ngMax++;
    }
};

// save old paper
MainScene.prototype.keep = function() {
    var paper = this.paper;
    var game = this.game;
    var passSound = this.passSound;
    var scores = this.scores;
    var sprite = paper.sprite;
    sprite.tl.moveBy(VELOCITY * MOVE_TIME * game.fps, 0, Math.floor(MOVE_TIME * game.fps)).removeFromScene();

    passSound.play(); //効果音を再生

    if (paper.isSuccessed()) {
        scores.ok++;
    }

    if (paper.isSuccessed()) {
        scores.okMax++;
    } else {
        scores.ngMax++;
    }
};

MainScene.prototype.becomeCurrentScene = function() {
    console.log("Main Scene");



    // initialize
    var game = this.game;
    var scene = this;

    const PAPER_IMG_W = game.assets[IMG_PAPER].width / Object.keys(Paper_frame).length;
    const PAPER_IMG_H = game.assets[IMG_PAPER].height;

    this.paper = {
        sprite: null,
        state: "new",
        numOfQuestion: 3,
        score: 0,
        isSuccessed: function() {
            return this.score;
        }
    };
    var paper = this.paper;

    function TouchProperty() {
        this.x = 0;
        this.y = 0;
        return this;
    }

    var moved = false;
    var touching = false;
    var touch = {
        'begin': new TouchProperty(),
        'end': new TouchProperty(),
        velocity: {
            x: 0,
            y: 0
        }
    };

    var prevPoint = new TouchProperty();
    var from = new TouchProperty();

    var scores = {
        ok: 0,
        okMax: 0,
        ng: 0,
        ngMax: 0
    };
    this.scores = scores;

    var wasteSound = game.assets[SND_WASTE]; //クシャっとするときの効果音
    var flySound = game.assets[SND_FLY];
    var passSound = game.assets[SND_PASS];

    this.wasteSound = wasteSound;
    this.flySound = flySound;
    this.passSound = passSound;

    var markOk = game.assets[IMG_MARK_CIRCLE];
    var markNg = game.assets[IMG_MARK_X];

    this.markOk = markOk;
    this.markNg = markNg;

    var background = new Group();

    var image = game.assets[IMG_TRASH];
    var bgImage = new Sprite(image.width, image.height);
    bgImage.image = image;
    bgImage.fitToSize(game.width, game.height);
    background.addChild(bgImage);

    var bgLayer = new Sprite(game.width, game.height);
    bgLayer.backgroundColor = '#FFF';
    bgLayer.opacity = 0.5;
    background.addChild(bgLayer);

    var timer = new Timer(game.fps);
    timer.moveTo(250, 10);
    this.timer = timer;

    var startScene = this.createStartScene();

    // pause menu
    var pauseImage = game.assets[BTN_PAUSE];
    var pauseSize = {
        'width': 60,
        'height': 60
    };
    var pauseButton = new Button(pauseImage.width, pauseImage.height);
    pauseButton.image = pauseImage;
    pauseButton.fitToSize(pauseSize.width, pauseSize.height);
    pauseButton.moveTo(10, 10);
    pauseButton.addEventListener('tap', function() {
        game.gotoPauseScene();
    });

    // drawing
    scene.addChild(background);
    scene.addChild(pauseButton);
    scene.addChild(timer);

    // game main
    scene.addEventListener(Event.TOUCH_START, function(e) {
        if (e.y < 70 /* pauseButton.y + pauseButton.height */ ) return;

        touch.begin = e;
        from.x = paper.sprite.x;
        from.y = paper.sprite.y;
        prevPoint = e;
        touching = true;
        moved = false;

        if (scene.guide) scene.removeChild(scene.guide);
    });
    scene.addEventListener(Event.TOUCH_MOVE, function(e) {
        if (!touching) return;

        touch.velocity.x = e.x - prevPoint.x;
        touch.velocity.y = e.y - prevPoint.y;
        prevPoint = e;
        if (touching) {
            if (paper.state == "wasted") {
                paper.sprite.moveTo(from.x, from.y + e.y - touch.begin.y);
            } else if (paper.state == "new") {
                paper.sprite.moveTo(from.x + e.x - touch.begin.x, from.y);
            }
        }
        moved = true;
    });
    scene.addEventListener(Event.TOUCH_END, function(e) {
        // for debug
        // gameOver();

        if (!touching) return;

        touching = false;

        if (!moved) {
            scene.crumple();
            return;
        }

        if (paper.state == "wasted" && touch.velocity.y < -THRS) {
            scene.throwAway();
            scene.placeNewPaper();
        } else if (paper.state == "new" && touch.velocity.x < -THRS) {
            scene.keep();
            scene.placeNewPaper();
        } else {
            paper.sprite.tl.moveTo(PAPER_DEFAULT_X, PAPER_DEFAULT_Y, Math.floor(.25 * game.fps), enchant.Easing.QUINT_EASEOUT);
        }

    });

    game.replaceScene(scene);
    game.pushScene(startScene);
};

TestThrow.prototype.gotoMainScene = function() {
    new MainScene(this).becomeCurrentScene();
};