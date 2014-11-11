TestThrow.prototype.gotoGameOverScene = function() {
    var thi$ = this;
    var scene = new Scene();

    //"GAMEOVER"の文字の表示
    var image = this.assets[IMG_GAMEOVER];
    var gameover = new Sprite(image.width, image.height);
    var centerY = (this.height - gameover.height) / 2
    gameover.image = image;
    gameover.moveTo(this.width, centerY);
    gameover.tl.moveTo(0, centerY, 0.5 * this.fps, enchant.Easing.QUAD_EASYINOUT).delay(1.0 * this.fps).moveTo(-this.width, centerY, 0.5 * this.fps, enchant.Easing.QUAD_EASYINOUT).then(function() {
        thi$.removeScene(scene);
        thi$.gotoResultScene();
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

MainScene.prototype.becomeCurrentScene = function() {
    console.log("Main Scene");

    // initialize
    var thi$ = this.game;
    var scene = new Scene();

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
    const PAPER_IMG_W = thi$.assets[IMG_PAPER].width / Object.keys(Paper_frame).length;
    const PAPER_IMG_H = thi$.assets[IMG_PAPER].height;
    var paper = {
        sprite: null,
        state: "new",
        numOfQuestion: 3,
        score: 0,
        isSuccessed: function() {
            return this.score;
        }
    };

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
    const THRS = 3;
    const MOVE_TIME = 0.4;
    const VELOCITY = -130;

    var scores = {
        ok: 0,
        okMax: 0,
        ng: 0,
        ngMax: 0
    };

    var wasteSound = thi$.assets[SND_WASTE]; //クシャっとするときの効果音
    var flySound = thi$.assets[SND_FLY];
    var passSound = thi$.assets[SND_PASS];

    var markOk = thi$.assets[IMG_MARK_CIRCLE];
    var markNg = thi$.assets[IMG_MARK_X];

    var guide = null;

    function placeNewPaper() {
        var pic = new Sprite(PAPER_IMG_W, PAPER_IMG_H);
        pic.image = thi$.assets[IMG_PAPER];
        pic.frame = Math.floor(Math.random() * 3) % 3 + 1;

        paper.sprite = new Group();
        paper.sprite.addChild(pic);
        paper.sprite.moveTo(thi$.width + PAPER_DEFAULT_X, PAPER_DEFAULT_Y);

        paper.state = "new";

        paper.score = Math.random(1) < 0.5;
        for (var i = 0; i < paper.numOfQuestion; i++) {
            var size = {
                'width': 60,
                'height': 44
            };
            var image = (paper.isSuccessed()) ? markOk : markNg;
            var sprite = new Sprite(image.width, image.height);
            sprite.image = image;
            sprite.fitToSize(size.width, size.height);
            sprite.moveTo(20, i * 80 + 20);

            paper.sprite.addChild(sprite);
        }

        scene.addChild(paper.sprite);
        var tl = paper.sprite.tl.moveTo(PAPER_DEFAULT_X, PAPER_DEFAULT_Y, Math.floor(MOVE_TIME * thi$.fps), enchant.Easing.QUINT_EASEOUT);

        if (thi$.stage == 0) {
            tl.exec(function() {
                var image = thi$.assets[IMG_CURSOR];
                var size = {
                    width: image.width / 4,
                    height: image.height / 4
                };
                if (guide) scene.removeChild(guide);
                guide = new Sprite(image.width, image.height);
                guide.image = image;
                if (paper.isSuccessed()) {
                    guide.rotation = -90;
                    guide.moveTo(PAPER_DEFAULT_X - 10 - size.width, PAPER_DEFAULT_Y + PAPER_H / 2 + size.height / 2);
                } else {
                    guide.moveTo(PAPER_DEFAULT_X + PAPER_W / 2 - size.width / 2, PAPER_DEFAULT_Y - 10 - size.height);
                }
                guide.fitToSize(size.width, size.height);
                scene.addChild(guide);
            });
        }
    };

    var background = new Group();

    var image = thi$.assets[IMG_TRASH];
    var bgImage = new Sprite(image.width, image.height);
    bgImage.image = image;
    bgImage.fitToSize(thi$.width, thi$.height);
    background.addChild(bgImage);

    var bgLayer = new Sprite(thi$.width, thi$.height);
    bgLayer.backgroundColor = '#FFF';
    bgLayer.opacity = 0.5;
    background.addChild(bgLayer);

    var timer = new Timer(thi$.fps);
    timer.moveTo(250, 10);

    //"START"の文字の表示
    var startScene = new Scene();
    var l_start = new Sprite(GAMESTART_IMG_WIDTH, GAMESTART_IMG_HEIGHT);
    var labelSize = {
        'width': 320,
        'height': 80
    };
    l_start.image = thi$.assets[IMG_GAMESTART];
    l_start.scaleX = labelSize.width / GAMESTART_IMG_WIDTH;
    l_start.scaleY = labelSize.height / GAMESTART_IMG_HEIGHT;
    l_start.moveTo(0, thi$.width / 2 - GAMESTART_IMG_HEIGHT / 2);
    l_start.tl.rotateTo(45, 1).scaleTo(5, 1).scaleTo(0.9, 20).and().rotateTo(0, 20).delay(10).fadeOut(10).and().moveBy(0, -50, 10).then(function() {
        l_start.visible = false;
        thi$.popScene();
        //player.canclick = true;

        // After 30 seconds, game is over.
        timer.after(30).then(function() {
            thi$.scores = scores;
            thi$.gotoGameOverScene();
        });
        this.parentNode.removeChild(l_start);
        placeNewPaper();
    });
    startScene.addChild(l_start);

    // pause menu
    var pauseImage = thi$.assets[BTN_PAUSE];
    var pauseSize = {
        'width': 60,
        'height': 60
    };
    var pauseButton = new Button(pauseImage.width, pauseImage.height);
    pauseButton.image = pauseImage;
    pauseButton.fitToSize(pauseSize.width, pauseSize.height);
    pauseButton.moveTo(10, 10);
    pauseButton.addEventListener('tap', function() {
        thi$.gotoPauseScene();
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

        if (guide) scene.removeChild(guide);
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
            wasteSound.play();

            paper.state = "wasted";
            var sprite = new Sprite(PAPER_IMG_W, PAPER_IMG_H);
            sprite.image = thi$.assets[IMG_PAPER];
            sprite.frame = Paper_frame.CRASH;

            var group = new Group();
            group.addChild(sprite);
            group.moveTo(paper.sprite.x, paper.sprite.y);

            scene.addChild(group);

            scene.removeChild(paper.sprite);
            paper.sprite = group;

            paper.sprite.tl.moveTo(PAPER_DEFAULT_X, PAPER_DEFAULT_Y, Math.floor(.25 * thi$.fps), enchant.Easing.QUINT_EASEOUT);
            return;
        }

        if (paper.state == "wasted" && touch.velocity.y < -THRS) {
            paper.state = "throw";

            // throw old paper away
            var sprite = paper.sprite;
            sprite.tl.moveBy(0, VELOCITY * MOVE_TIME * thi$.fps, Math.floor(MOVE_TIME * thi$.fps)).removeFromScene();
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

            placeNewPaper();
        } else if (paper.state == "new" && touch.velocity.x < -THRS) {
            paper.state = "get";

            // save old paper
            var sprite = paper.sprite;
            sprite.tl.moveBy(VELOCITY * MOVE_TIME * thi$.fps, 0, Math.floor(MOVE_TIME * thi$.fps)).removeFromScene();

            passSound.play(); //効果音を再生

            if (paper.isSuccessed()) {
                scores.ok++;
            }

            if (paper.isSuccessed()) {
                scores.okMax++;
            } else {
                scores.ngMax++;
            }

            placeNewPaper();
        } else {
            paper.sprite.tl.moveTo(PAPER_DEFAULT_X, PAPER_DEFAULT_Y, Math.floor(.25 * thi$.fps), enchant.Easing.QUINT_EASEOUT);
        }

    });

    thi$.replaceScene(scene);
    thi$.pushScene(startScene);
};

TestThrow.prototype.gotoMainScene = function() {
    new MainScene(this).becomeCurrentScene();
};