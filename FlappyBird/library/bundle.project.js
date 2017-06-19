require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"Background":[function(require,module,exports){
"use strict";
cc._RFpush(module, '4a8a8g8fIlLSZ5xoRWc4YRl', 'Background');
// Scripts/Background.js

var Constant = require('Constant');

var Background = cc.Class({
    'extends': cc.Component,

    properties: {
        // 地板节点数组
        groundNode: {
            'default': [],
            type: [cc.Node]
        },
        // 地板图片对象
        groundImg: {
            'default': null,
            type: cc.Sprite
        }
    },

    // use this for initialization
    onLoad: function onLoad() {
        // 获取屏幕尺寸
        this._size = cc.winSize;
        // 获取地板图片的宽度
        this._width = this.groundImg.spriteFrame.getRect().width;
        // 启动“地板移动控制”计时器
        this.schedule(this.onGroundMove, Constant.GROUND_MOVE_INTERVAL);
    },

    onGroundMove: function onGroundMove() {
        this.groundNode[0].x += Constant.GROUND_VX;
        this.groundNode[1].x += Constant.GROUND_VX;
        if (this.groundNode[0].x + this._width / 2 < -this._size.width / 2) {
            this.groundNode[0].x = this.groundNode[1].x + this._width - 5;
        }
        if (this.groundNode[1].x + this._width / 2 < -this._size.width / 2) {
            this.groundNode[1].x = this.groundNode[0].x + this._width - 5;
        }
    }
});
// called every frame, uncomment this function to activate update callback
// update: function (dt) {

// },

cc._RFpop();
},{"Constant":"Constant"}],"Bird":[function(require,module,exports){
"use strict";
cc._RFpush(module, 'dba40+MKV5FjpALbo9uDYLc', 'Bird');
// Scripts/Bird.js

cc.Class({
    'extends': cc.Component,

    properties: {
        // 小鸟重力值
        gravity: 0.5,
        // 小鸟弹跳值
        birdJump: 6.6,
        // 动画名称
        AnimName: '',
        // 弹跳音效
        jumpAudio: {
            'default': null,
            url: cc.AudioClip
        }
    },

    // use this for initialization
    onLoad: function onLoad() {
        // 获取本身的cc.Animation对象，并播放AnimName动画
        this.getComponent(cc.Animation).play(this.AnimName);
        // 初始化速度为0
        this.velocity = 0;
    },

    onStartDrop: function onStartDrop() {
        this.schedule(this.onDrop, 0.01);
    },

    onDrop: function onDrop() {
        this.node.y += this.velocity;
        this.velocity -= this.gravity;
    },

    onJump: function onJump() {
        // 弹跳时，重设向上的速度
        this.velocity = this.birdJump;
        // 播放弹跳音效
        cc.audioEngine.playEffect(this.jumpAudio, false);
    }

});
// called every frame, uncomment this function to activate update callback
// update: function (dt) {

// },

cc._RFpop();
},{}],"Constant":[function(require,module,exports){
"use strict";
cc._RFpush(module, '1f331Khw8ZPUpFSgo3Y95tw', 'Constant');
// Scripts/Constant.js

var Constant = cc.Enum({
    // 地板移动时间间隔
    GROUND_MOVE_INTERVAL: 0.05,
    // 单位时间地板移动速度
    GROUND_VX: -5,
    // 上端管道序号为0
    PIPE_UP: 0,
    // 下端管道序号为1
    PIPE_DOWN: 1,
    // 游戏失败文字
    GAMEOVER_TXT: 'GAME OVER',
    // 最高分文字
    HIGHSCORE_TXT: 'HighScore: '
});

module.exports = Constant;

cc._RFpop();
},{}],"Game":[function(require,module,exports){
"use strict";
cc._RFpush(module, '6bb266V8atHdb56fl6sfmwu', 'Game');
// Scripts/Game.js

var Bird = require('Bird');
var Background = require('Background');
var Constant = require('Constant');

var Storage = require('Storage');

var Game = cc.Class({
    'extends': cc.Component,

    properties: {
        // 管道纵向最大偏移值
        pipeMaxOffsetY: 150,
        // 上下管道间最小间隙
        pipeMinGap: 80,
        // 上下管道间最大间隙
        pipeMaxGap: 150,
        // 管道生成时间间隔
        pipeSpawnInterval: 4.5,
        // 管道生成时，屏幕外横向偏移位置
        pipeSpawnOffsetX: 30,
        // 重新刷新时间
        gameReflashTime: 5,
        // 形变动画播放间隔
        scoreScaleDuration: 0.2,
        // 游戏菜单节点
        gameMenu: {
            'default': null,
            type: cc.Node
        },
        // 小鸟对象
        bird: {
            'default': null,
            type: Bird
        },
        // 管道创建节点
        pipesNode: {
            'default': null,
            type: cc.Node
        },
        // 管道预制数组
        pipePrefabs: {
            'default': [],
            type: [cc.Prefab]
        },
        // 地板对象
        background: {
            'default': null,
            type: Background
        },
        // 游戏失败文字标签
        gameOverText: {
            'default': null,
            type: cc.Label
        },
        // 当前分数标签
        scoreText: {
            'default': null,
            type: cc.Label
        },
        // 最高分标签
        highScoreText: {
            'default': null,
            type: cc.Label
        }
    },

    // use this for initialization
    onLoad: function onLoad() {
        // 初始化触摸事件
        this.setInputControl();
        // 初始化管道数组
        this.pipes = [];
        // 获取屏幕尺寸
        this.size = cc.winSize;
        // 获取地板的包围盒
        var groundBox = this.background.groundNode[0].getBoundingBox();
        // 获取地板顶部的纵坐标
        this.groundTop = groundBox.y + groundBox.height / 2;
        // 初始化游戏失败标志位
        this.isGameOver = false;
        // 初始化当前分数
        this.curScore = 0;
        // 开始游戏界面，如有历史最高分则显示该成绩
        if (Storage.getHighScore() > 0) {
            this.highScoreText.string = Constant.HIGHSCORE_TXT + Storage.getHighScore();
        }
    },

    setInputControl: function setInputControl() {
        var self = this;
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            onTouchBegan: self._onTouchBegan.bind(self)
        }, self.node);
    },

    _onTouchBegan: function _onTouchBegan(touch, event) {
        if (this.isGameOver === true) return;
        this.bird.onJump();
    },

    onStartGame: function onStartGame() {
        // 关闭菜单节点显示
        this.gameMenu.active = false;
        // 小鸟开始下落
        this.bird.onStartDrop();
        // 从0开始显示分数
        this.scoreText.string = "" + this.curScore;
        // 启动管道生成定时器
        this.schedule(this.spawnPipes, this.pipeSpawnInterval);
        // 启动游戏逻辑更新定时器
        this.schedule(this.gameUpdate, Constant.GROUND_MOVE_INTERVAL);
    },

    spawnPipes: function spawnPipes() {
        // 从管道预制（上端），生成管道实例
        var pipeUp = cc.instantiate(this.pipePrefabs[Constant.PIPE_UP]);
        // 定义为上端类型
        pipeUp.getComponent('Pipe').init(Constant.PIPE_UP);
        // 获取管道的高度（上端与上端的相同）
        var pipeHeight = pipeUp.getComponent('cc.Sprite').spriteFrame.getRect().height;
        // 设置上端管道的横向起始位置（屏幕右端另加一定偏移）
        pipeUp.x = this.size.width / 2 + this.pipeSpawnOffsetX;
        // 设置上端管道的纵向起始位置（随机取偏移量）
        pipeUp.y = Math.floor(Math.random() * this.pipeMaxOffsetY) + pipeHeight / 2;
        // 下端生成逻辑基本与上端相同
        var pipeDown = cc.instantiate(this.pipePrefabs[Constant.PIPE_DOWN]);
        pipeDown.getComponent('Pipe').init(Constant.PIPE_DOWN);
        pipeDown.x = this.size.width / 2 + this.pipeSpawnOffsetX;
        // 随机生成上端与下端管道之间的间隙值（pipeMinGap与pipeMaxGap之间）
        var pipeGap = Math.floor(Math.random() * (this.pipeMaxGap - this.pipeMinGap)) + this.pipeMinGap;
        pipeDown.y = pipeUp.y - pipeGap - pipeHeight;
        // 添加管道到pipes节点上
        this.pipesNode.addChild(pipeUp);
        this.pipesNode.addChild(pipeDown);
        // 添加管道到管道数组中
        this.pipes.push(pipeUp);
        this.pipes.push(pipeDown);
    },

    gameUpdate: function gameUpdate() {
        for (var i = 0; i < this.pipes.length; i++) {
            // 获取当前管道对象节点
            var curPipeNode = this.pipes[i];
            // 对管道进行移动操作
            curPipeNode.x += Constant.GROUND_VX;

            // 获取小鸟的包围盒
            var birdBox = this.bird.node.getBoundingBox();
            // 获取当前管道的包围盒
            var pipeBox = curPipeNode.getBoundingBox();
            // var birdRect = new cc.Rect(birdBox.x - birdBox.width / 2, birdBox.y - birdBox.height / 2,
            //     birdBox.width, birdBox.height);
            // var pipeRect = new cc.Rect(pipeBox.x - pipeBox.width / 2, pipeBox.y - pipeBox.height / 2,
            //     pipeBox.width, pipeBox.height);
            // 根据两个矩形范围判断是否相交
            if (cc.Intersection.rectRect(birdBox, pipeBox)) {
                this.onGameOver();
                return;
            }

            // 获取当前管道对象
            var curPipe = curPipeNode.getComponent('Pipe');
            // 判断小鸟是否顺利通过管道，是则加分
            if (curPipeNode.x < this.bird.node.x && curPipe.isPassed === false && curPipe.type === Constant.PIPE_UP) {
                curPipe.isPassed = true;
                this.addScore();
            }

            // 超出屏幕范围的管道，从数组中移除，并从节点上删除
            if (curPipeNode.x < -(this.size.width / 2 + Constant.PIPE_SPAWN_OFFSET_X)) {
                this.pipes.splice(i, 1);
                this.pipesNode.removeChild(curPipeNode, true);
            }
        }

        // 小鸟触地，则死亡
        if (this.bird.node.y < this.groundTop) {
            this.onGameOver();
        }
    },

    addScore: function addScore() {
        // 加分
        this.curScore++;
        // 显示当前分数
        this.scoreText.string = "" + this.curScore;
        var action1 = cc.scaleTo(this.scoreScaleDuration, 1.1, 0.6);
        var action2 = cc.scaleTo(this.scoreScaleDuration, 0.8, 1.2);
        var action3 = cc.scaleTo(this.scoreScaleDuration, 1, 1);
        // 播放形变动画
        this.scoreText.node.runAction(cc.sequence(action1, action2, action3));
    },

    onGameOver: function onGameOver() {
        // 设置游戏失败标志位
        this.isGameOver = true;
        // 游戏失败，如超过最高分则成绩
        if (this.curScore > Storage.getHighScore()) {
            Storage.setHighScore(this.curScore);
        }
        // 死亡时，显示“Game Over”
        this.gameOverText.string = Constant.GAMEOVER_TXT;
        // 关闭所有定时器
        this.bird.unscheduleAllCallbacks();
        this.background.unscheduleAllCallbacks();
        this.unscheduleAllCallbacks();
        // 一定时间后，重新刷新游戏到开始状态
        this.schedule(function () {
            cc.director.loadScene('game');
        }, this.gameReflashTime);
    }

});
// called every frame, uncomment this function to activate update callback
// update: function (dt) {

// },

cc._RFpop();
},{"Background":"Background","Bird":"Bird","Constant":"Constant","Storage":"Storage"}],"Pipe":[function(require,module,exports){
"use strict";
cc._RFpush(module, 'fc122qToQhByr8kag01h1T3', 'Pipe');
// Scripts/Pipe.js

cc.Class({
    "extends": cc.Component,

    properties: {
        // 小鸟通过管道与否的标志位
        isPassed: false
    },

    // use this for initialization
    onLoad: function onLoad() {},

    init: function init(type) {
        // 设置管道的类型（上或下）
        this.type = type;
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});

cc._RFpop();
},{}],"Storage":[function(require,module,exports){
"use strict";
cc._RFpush(module, '66102528YBJXJl8YVn9PiMH', 'Storage');
// Scripts/Storage.js

var Storage = {
    getHighScore: function getHighScore() {
        var score = cc.sys.localStorage.getItem('HighScore') || 0;
        return parseInt(score);
    },

    setHighScore: function setHighScore(score) {
        cc.sys.localStorage.setItem('HighScore', score);
    }
};

module.exports = Storage;

cc._RFpop();
},{}]},{},["Background","Bird","Constant","Game","Pipe","Storage"])

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL0FwcGxpY2F0aW9ucy9Db2Nvc0NyZWF0b3IuYXBwL0NvbnRlbnRzL1Jlc291cmNlcy9hcHAuYXNhci9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiYXNzZXRzL1NjcmlwdHMvQmFja2dyb3VuZC5qcyIsImFzc2V0cy9TY3JpcHRzL0JpcmQuanMiLCJhc3NldHMvU2NyaXB0cy9Db25zdGFudC5qcyIsImFzc2V0cy9TY3JpcHRzL0dhbWUuanMiLCJhc3NldHMvU2NyaXB0cy9QaXBlLmpzIiwiYXNzZXRzL1NjcmlwdHMvU3RvcmFnZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7QUNBQTtBQUNBO0FBQ0E7QUFDSTtBQUNKO0FBQ0k7QUFDSjtBQUNRO0FBQ0k7QUFDQTtBQUNaO0FBQ0E7QUFDUTtBQUNJO0FBQ0E7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNJO0FBQ0o7QUFDUTtBQUNSO0FBQ1E7QUFDUjtBQUNRO0FBQ1I7QUFDQTtBQUNJO0FBQ0k7QUFDQTtBQUNBO0FBQ0k7QUFDWjtBQUNRO0FBQ0k7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDSTtBQUNKO0FBQ0k7QUFDSjtBQUNRO0FBQ1I7QUFDUTtBQUNSO0FBQ1E7QUFDUjtBQUNRO0FBQ0k7QUFDQTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0k7QUFDSjtBQUNRO0FBQ1I7QUFDUTtBQUNSO0FBQ0E7QUFDSTtBQUNJO0FBQ1I7QUFDQTtBQUNJO0FBQ0k7QUFDQTtBQUNSO0FBQ0E7QUFDSTtBQUNKO0FBQ1E7QUFDUjtBQUNRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDSTtBQUNKO0FBQ0k7QUFDSjtBQUNJO0FBQ0o7QUFDSTtBQUNKO0FBQ0k7QUFDSjtBQUNJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNJO0FBQ0o7QUFDSTtBQUNKO0FBQ1E7QUFDUjtBQUNRO0FBQ1I7QUFDUTtBQUNSO0FBQ1E7QUFDUjtBQUNRO0FBQ1I7QUFDUTtBQUNSO0FBQ1E7QUFDUjtBQUNRO0FBQ0k7QUFDQTtBQUNaO0FBQ0E7QUFDUTtBQUNJO0FBQ0E7QUFDWjtBQUNBO0FBQ1E7QUFDSTtBQUNBO0FBQ1o7QUFDQTtBQUNRO0FBQ0k7QUFDQTtBQUNaO0FBQ0E7QUFDUTtBQUNJO0FBQ0E7QUFDWjtBQUNBO0FBQ1E7QUFDSTtBQUNBO0FBQ1o7QUFDQTtBQUNRO0FBQ0k7QUFDQTtBQUNaO0FBQ0E7QUFDUTtBQUNJO0FBQ0E7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNJO0FBQ0o7QUFDUTtBQUNSO0FBQ1E7QUFDUjtBQUNRO0FBQ1I7QUFDUTtBQUNSO0FBQ1E7QUFDUjtBQUNRO0FBQ1I7QUFDUTtBQUNSO0FBQ1E7QUFDSTtBQUNaO0FBQ0E7QUFDQTtBQUNJO0FBQ0k7QUFDQTtBQUNJO0FBQ0E7QUFDWjtBQUNBO0FBQ0E7QUFDSTtBQUNJO0FBRUE7QUFBUjtBQUNBO0FBRUk7QUFBSjtBQUVRO0FBQVI7QUFFUTtBQUFSO0FBRVE7QUFBUjtBQUVRO0FBQVI7QUFFUTtBQUFSO0FBQ0E7QUFFSTtBQUFKO0FBRVE7QUFBUjtBQUVRO0FBQVI7QUFFUTtBQUFSO0FBRVE7QUFBUjtBQUVRO0FBQVI7QUFFUTtBQUNBO0FBQ0E7QUFBUjtBQUVRO0FBQ0E7QUFBUjtBQUVRO0FBQ0E7QUFBUjtBQUVRO0FBQ0E7QUFBUjtBQUNBO0FBRUk7QUFDSTtBQUFSO0FBRVk7QUFBWjtBQUVZO0FBQVo7QUFDQTtBQUVZO0FBQVo7QUFFWTtBQUFaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFWTtBQUNJO0FBQ0E7QUFBaEI7QUFDQTtBQUNBO0FBRVk7QUFBWjtBQUVZO0FBRUk7QUFDQTtBQURoQjtBQUNBO0FBQ0E7QUFHWTtBQUNJO0FBQ0E7QUFEaEI7QUFDQTtBQUNBO0FBQ0E7QUFHUTtBQUNJO0FBRFo7QUFDQTtBQUNBO0FBR0k7QUFESjtBQUdRO0FBRFI7QUFHUTtBQUNBO0FBQ0E7QUFDQTtBQURSO0FBR1E7QUFEUjtBQUNBO0FBR0k7QUFESjtBQUdRO0FBRFI7QUFHUTtBQUNJO0FBRFo7QUFDQTtBQUdRO0FBRFI7QUFHUTtBQUNBO0FBQ0E7QUFEUjtBQUdRO0FBQ0k7QUFEWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9OQTtBQUNJO0FBQ0o7QUFDSTtBQUNKO0FBQ1E7QUFDUjtBQUNBO0FBQ0E7QUFDSTtBQUNKO0FBR0k7QUFESjtBQUdRO0FBRFI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0k7QUFDSTtBQUNBO0FBQ1I7QUFDQTtBQUNJO0FBQ0k7QUFDUjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBDb25zdGFudCA9IHJlcXVpcmUoJ0NvbnN0YW50Jyk7XHJcblxyXG52YXIgQmFja2dyb3VuZCA9IGNjLkNsYXNzKHtcclxuICAgIGV4dGVuZHM6IGNjLkNvbXBvbmVudCxcclxuXHJcbiAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgLy8g5Zyw5p2/6IqC54K55pWw57uEXHJcbiAgICAgICAgZ3JvdW5kTm9kZToge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBbXSxcclxuICAgICAgICAgICAgdHlwZTogW2NjLk5vZGVdXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDlnLDmnb/lm77niYflr7nosaFcclxuICAgICAgICBncm91bmRJbWc6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogY2MuU3ByaXRlXHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcblxyXG4gICAgLy8gdXNlIHRoaXMgZm9yIGluaXRpYWxpemF0aW9uXHJcbiAgICBvbkxvYWQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAvLyDojrflj5blsY/luZXlsLrlr7hcclxuICAgICAgICB0aGlzLl9zaXplID0gY2Mud2luU2l6ZTtcclxuICAgICAgICAvLyDojrflj5blnLDmnb/lm77niYfnmoTlrr3luqZcclxuICAgICAgICB0aGlzLl93aWR0aCA9IHRoaXMuZ3JvdW5kSW1nLnNwcml0ZUZyYW1lLmdldFJlY3QoKS53aWR0aDtcclxuICAgICAgICAvLyDlkK/liqjigJzlnLDmnb/np7vliqjmjqfliLbigJ3orqHml7blmahcclxuICAgICAgICB0aGlzLnNjaGVkdWxlKHRoaXMub25Hcm91bmRNb3ZlLCBDb25zdGFudC5HUk9VTkRfTU9WRV9JTlRFUlZBTCk7XHJcbiAgICB9LFxyXG5cclxuICAgIG9uR3JvdW5kTW92ZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5ncm91bmROb2RlWzBdLnggKz0gQ29uc3RhbnQuR1JPVU5EX1ZYO1xyXG4gICAgICAgIHRoaXMuZ3JvdW5kTm9kZVsxXS54ICs9IENvbnN0YW50LkdST1VORF9WWDtcclxuICAgICAgICBpZiAodGhpcy5ncm91bmROb2RlWzBdLnggKyB0aGlzLl93aWR0aC8yIDwgLSB0aGlzLl9zaXplLndpZHRoLzIpIHtcclxuICAgICAgICAgICAgdGhpcy5ncm91bmROb2RlWzBdLnggPSB0aGlzLmdyb3VuZE5vZGVbMV0ueCArIHRoaXMuX3dpZHRoIC0gNTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuZ3JvdW5kTm9kZVsxXS54ICsgdGhpcy5fd2lkdGgvMiA8IC0gdGhpcy5fc2l6ZS53aWR0aC8yKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ3JvdW5kTm9kZVsxXS54ID0gdGhpcy5ncm91bmROb2RlWzBdLnggKyB0aGlzLl93aWR0aCAtIDU7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIGNhbGxlZCBldmVyeSBmcmFtZSwgdW5jb21tZW50IHRoaXMgZnVuY3Rpb24gdG8gYWN0aXZhdGUgdXBkYXRlIGNhbGxiYWNrXHJcbiAgICAvLyB1cGRhdGU6IGZ1bmN0aW9uIChkdCkge1xyXG5cclxuICAgIC8vIH0sXHJcbn0pO1xyXG4iLCJjYy5DbGFzcyh7XHJcbiAgICBleHRlbmRzOiBjYy5Db21wb25lbnQsXHJcblxyXG4gICAgcHJvcGVydGllczoge1xyXG4gICAgICAgIC8vIOWwj+m4n+mHjeWKm+WAvFxyXG4gICAgICAgIGdyYXZpdHk6IDAuNSxcclxuICAgICAgICAvLyDlsI/puJ/lvLnot7PlgLxcclxuICAgICAgICBiaXJkSnVtcDogNi42LFxyXG4gICAgICAgIC8vIOWKqOeUu+WQjeensFxyXG4gICAgICAgIEFuaW1OYW1lOiAnJyxcclxuICAgICAgICAvLyDlvLnot7Ppn7PmlYhcclxuICAgICAgICBqdW1wQXVkaW86IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdXJsOiBjYy5BdWRpb0NsaXBcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIC8vIHVzZSB0aGlzIGZvciBpbml0aWFsaXphdGlvblxyXG4gICAgb25Mb2FkOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgLy8g6I635Y+W5pys6Lqr55qEY2MuQW5pbWF0aW9u5a+56LGh77yM5bm25pKt5pS+QW5pbU5hbWXliqjnlLtcclxuICAgICAgICB0aGlzLmdldENvbXBvbmVudChjYy5BbmltYXRpb24pLnBsYXkodGhpcy5BbmltTmFtZSk7XHJcbiAgICAgICAgLy8g5Yid5aeL5YyW6YCf5bqm5Li6MFxyXG4gICAgICAgIHRoaXMudmVsb2NpdHkgPSAwO1xyXG4gICAgfSxcclxuICAgIFxyXG4gICAgb25TdGFydERyb3A6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLnNjaGVkdWxlKHRoaXMub25Ecm9wLDAuMDEpO1xyXG4gICAgfSxcclxuICAgIFxyXG4gICAgb25Ecm9wOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLm5vZGUueSArPSB0aGlzLnZlbG9jaXR5O1xyXG4gICAgICAgIHRoaXMudmVsb2NpdHkgLT0gdGhpcy5ncmF2aXR5O1xyXG4gICAgfSxcclxuICAgIFxyXG4gICAgb25KdW1wOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyDlvLnot7Pml7bvvIzph43orr7lkJHkuIrnmoTpgJ/luqZcclxuICAgICAgICB0aGlzLnZlbG9jaXR5ID0gdGhpcy5iaXJkSnVtcDtcclxuICAgICAgICAvLyDmkq3mlL7lvLnot7Ppn7PmlYhcclxuICAgICAgICBjYy5hdWRpb0VuZ2luZS5wbGF5RWZmZWN0KHRoaXMuanVtcEF1ZGlvLCBmYWxzZSk7XHJcbiAgICB9LFxyXG4gICAgXHJcbiAgICBcclxuICAgIC8vIGNhbGxlZCBldmVyeSBmcmFtZSwgdW5jb21tZW50IHRoaXMgZnVuY3Rpb24gdG8gYWN0aXZhdGUgdXBkYXRlIGNhbGxiYWNrXHJcbiAgICAvLyB1cGRhdGU6IGZ1bmN0aW9uIChkdCkge1xyXG5cclxuICAgIC8vIH0sXHJcbn0pO1xyXG4iLCJ2YXIgQ29uc3RhbnQgPSBjYy5FbnVtKHtcclxuICAgIC8vIOWcsOadv+enu+WKqOaXtumXtOmXtOmalFxyXG4gICAgR1JPVU5EX01PVkVfSU5URVJWQUw6IDAuMDUsXHJcbiAgICAvLyDljZXkvY3ml7bpl7TlnLDmnb/np7vliqjpgJ/luqZcclxuICAgIEdST1VORF9WWDogLTUsXHJcbiAgICAvLyDkuIrnq6/nrqHpgZPluo/lj7fkuLowXHJcbiAgICBQSVBFX1VQOiAwLFxyXG4gICAgLy8g5LiL56uv566h6YGT5bqP5Y+35Li6MVxyXG4gICAgUElQRV9ET1dOOiAxLFxyXG4gICAgLy8g5ri45oiP5aSx6LSl5paH5a2XXHJcbiAgICBHQU1FT1ZFUl9UWFQ6ICdHQU1FIE9WRVInLFxyXG4gICAgLy8g5pyA6auY5YiG5paH5a2XXHJcbiAgICBISUdIU0NPUkVfVFhUOiAnSGlnaFNjb3JlOiAnLFxyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ29uc3RhbnQ7XHJcblxyXG4iLCJjb25zdCBCaXJkID0gcmVxdWlyZSgnQmlyZCcpO1xyXG5jb25zdCBCYWNrZ3JvdW5kID0gcmVxdWlyZSgnQmFja2dyb3VuZCcpO1xyXG5jb25zdCBDb25zdGFudCA9IHJlcXVpcmUoJ0NvbnN0YW50Jyk7IFxyXG5cclxudmFyIFN0b3JhZ2UgPSByZXF1aXJlKCdTdG9yYWdlJyk7XHJcblxyXG52YXIgR2FtZSA9IGNjLkNsYXNzKHtcclxuICAgIGV4dGVuZHM6IGNjLkNvbXBvbmVudCxcclxuXHJcbiAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgLy8g566h6YGT57q15ZCR5pyA5aSn5YGP56e75YC8XHJcbiAgICAgICAgcGlwZU1heE9mZnNldFk6IDE1MCxcclxuICAgICAgICAvLyDkuIrkuIvnrqHpgZPpl7TmnIDlsI/pl7TpmplcclxuICAgICAgICBwaXBlTWluR2FwOiA4MCxcclxuICAgICAgICAvLyDkuIrkuIvnrqHpgZPpl7TmnIDlpKfpl7TpmplcclxuICAgICAgICBwaXBlTWF4R2FwOiAxNTAsXHJcbiAgICAgICAgLy8g566h6YGT55Sf5oiQ5pe26Ze06Ze06ZqUXHJcbiAgICAgICAgcGlwZVNwYXduSW50ZXJ2YWw6IDQuNSxcclxuICAgICAgICAvLyDnrqHpgZPnlJ/miJDml7bvvIzlsY/luZXlpJbmqKrlkJHlgY/np7vkvY3nva5cclxuICAgICAgICBwaXBlU3Bhd25PZmZzZXRYOiAzMCxcclxuICAgICAgICAvLyDph43mlrDliLfmlrDml7bpl7RcclxuICAgICAgICBnYW1lUmVmbGFzaFRpbWU6IDUsXHJcbiAgICAgICAgLy8g5b2i5Y+Y5Yqo55S75pKt5pS+6Ze06ZqUXHJcbiAgICAgICAgc2NvcmVTY2FsZUR1cmF0aW9uOiAwLjIsXHJcbiAgICAgICAgLy8g5ri45oiP6I+c5Y2V6IqC54K5XHJcbiAgICAgICAgZ2FtZU1lbnU6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogY2MuTm9kZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g5bCP6bif5a+56LGhXHJcbiAgICAgICAgYmlyZDoge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBCaXJkXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDnrqHpgZPliJvlu7roioLngrlcclxuICAgICAgICBwaXBlc05vZGU6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogY2MuTm9kZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g566h6YGT6aKE5Yi25pWw57uEXHJcbiAgICAgICAgcGlwZVByZWZhYnM6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogW10sXHJcbiAgICAgICAgICAgIHR5cGU6IFtjYy5QcmVmYWJdXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDlnLDmnb/lr7nosaFcclxuICAgICAgICBiYWNrZ3JvdW5kOiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IEJhY2tncm91bmRcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOa4uOaIj+Wksei0peaWh+Wtl+agh+etvlxyXG4gICAgICAgIGdhbWVPdmVyVGV4dDoge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBjYy5MYWJlbFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g5b2T5YmN5YiG5pWw5qCH562+XHJcbiAgICAgICAgc2NvcmVUZXh0OiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IGNjLkxhYmVsXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDmnIDpq5jliIbmoIfnrb5cclxuICAgICAgICBoaWdoU2NvcmVUZXh0OiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IGNjLkxhYmVsXHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcblxyXG4gICAgLy8gdXNlIHRoaXMgZm9yIGluaXRpYWxpemF0aW9uXHJcbiAgICBvbkxvYWQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAvLyDliJ3lp4vljJbop6bmkbjkuovku7ZcclxuICAgICAgICB0aGlzLnNldElucHV0Q29udHJvbCgpO1xyXG4gICAgICAgIC8vIOWIneWni+WMlueuoemBk+aVsOe7hFxyXG4gICAgICAgIHRoaXMucGlwZXMgPSBbXTtcclxuICAgICAgICAvLyDojrflj5blsY/luZXlsLrlr7hcclxuICAgICAgICB0aGlzLnNpemUgPSBjYy53aW5TaXplO1xyXG4gICAgICAgIC8vIOiOt+WPluWcsOadv+eahOWMheWbtOebklxyXG4gICAgICAgIHZhciBncm91bmRCb3ggPSB0aGlzLmJhY2tncm91bmQuZ3JvdW5kTm9kZVswXS5nZXRCb3VuZGluZ0JveCgpO1xyXG4gICAgICAgIC8vIOiOt+WPluWcsOadv+mhtumDqOeahOe6teWdkOagh1xyXG4gICAgICAgIHRoaXMuZ3JvdW5kVG9wID0gZ3JvdW5kQm94LnkgKyBncm91bmRCb3guaGVpZ2h0LzI7XHJcbiAgICAgICAgLy8g5Yid5aeL5YyW5ri45oiP5aSx6LSl5qCH5b+X5L2NXHJcbiAgICAgICAgdGhpcy5pc0dhbWVPdmVyID0gZmFsc2U7XHJcbiAgICAgICAgLy8g5Yid5aeL5YyW5b2T5YmN5YiG5pWwXHJcbiAgICAgICAgdGhpcy5jdXJTY29yZSA9IDA7XHJcbiAgICAgICAgLy8g5byA5aeL5ri45oiP55WM6Z2i77yM5aaC5pyJ5Y6G5Y+y5pyA6auY5YiG5YiZ5pi+56S66K+l5oiQ57upXHJcbiAgICAgICAgaWYgKCBTdG9yYWdlLmdldEhpZ2hTY29yZSgpID4gMCApIHtcclxuICAgICAgICAgICAgdGhpcy5oaWdoU2NvcmVUZXh0LnN0cmluZyA9IENvbnN0YW50LkhJR0hTQ09SRV9UWFQgKyBTdG9yYWdlLmdldEhpZ2hTY29yZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgc2V0SW5wdXRDb250cm9sOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgY2MuZXZlbnRNYW5hZ2VyLmFkZExpc3RlbmVyKHtcclxuICAgICAgICAgICAgZXZlbnQ6IGNjLkV2ZW50TGlzdGVuZXIuVE9VQ0hfT05FX0JZX09ORSxcclxuICAgICAgICAgICAgb25Ub3VjaEJlZ2FuOiBzZWxmLl9vblRvdWNoQmVnYW4uYmluZChzZWxmKVxyXG4gICAgICAgIH0sIHNlbGYubm9kZSk7XHJcbiAgICB9LFxyXG4gICAgXHJcbiAgICBfb25Ub3VjaEJlZ2FuOiBmdW5jdGlvbiggdG91Y2gsIGV2ZW50ICkge1xyXG4gICAgICAgIGlmICggdGhpcy5pc0dhbWVPdmVyID09PSB0cnVlIClcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMuYmlyZC5vbkp1bXAoKTtcclxuICAgIH0sICAgIFxyXG4gICAgXHJcbiAgICBvblN0YXJ0R2FtZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIC8vIOWFs+mXreiPnOWNleiKgueCueaYvuekulxyXG4gICAgICAgIHRoaXMuZ2FtZU1lbnUuYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgLy8g5bCP6bif5byA5aeL5LiL6JC9XHJcbiAgICAgICAgdGhpcy5iaXJkLm9uU3RhcnREcm9wKCk7XHJcbiAgICAgICAgLy8g5LuOMOW8gOWni+aYvuekuuWIhuaVsFxyXG4gICAgICAgIHRoaXMuc2NvcmVUZXh0LnN0cmluZyA9IFwiXCIgKyB0aGlzLmN1clNjb3JlO1xyXG4gICAgICAgIC8vIOWQr+WKqOeuoemBk+eUn+aIkOWumuaXtuWZqFxyXG4gICAgICAgIHRoaXMuc2NoZWR1bGUodGhpcy5zcGF3blBpcGVzLCB0aGlzLnBpcGVTcGF3bkludGVydmFsKTtcclxuICAgICAgICAvLyDlkK/liqjmuLjmiI/pgLvovpHmm7TmlrDlrprml7blmahcclxuICAgICAgICB0aGlzLnNjaGVkdWxlKHRoaXMuZ2FtZVVwZGF0ZSwgQ29uc3RhbnQuR1JPVU5EX01PVkVfSU5URVJWQUwpO1xyXG4gICAgfSxcclxuXHJcbiAgICBzcGF3blBpcGVzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyDku47nrqHpgZPpooTliLbvvIjkuIrnq6/vvInvvIznlJ/miJDnrqHpgZPlrp7kvotcclxuICAgICAgICB2YXIgcGlwZVVwID0gY2MuaW5zdGFudGlhdGUodGhpcy5waXBlUHJlZmFic1tDb25zdGFudC5QSVBFX1VQXSk7XHJcbiAgICAgICAgLy8g5a6a5LmJ5Li65LiK56uv57G75Z6LXHJcbiAgICAgICAgcGlwZVVwLmdldENvbXBvbmVudCgnUGlwZScpLmluaXQoQ29uc3RhbnQuUElQRV9VUCk7XHJcbiAgICAgICAgLy8g6I635Y+W566h6YGT55qE6auY5bqm77yI5LiK56uv5LiO5LiK56uv55qE55u45ZCM77yJXHJcbiAgICAgICAgdmFyIHBpcGVIZWlnaHQgPSBwaXBlVXAuZ2V0Q29tcG9uZW50KCdjYy5TcHJpdGUnKS5zcHJpdGVGcmFtZS5nZXRSZWN0KCkuaGVpZ2h0O1xyXG4gICAgICAgIC8vIOiuvue9ruS4iuerr+euoemBk+eahOaoquWQkei1t+Wni+S9jee9ru+8iOWxj+W5leWPs+err+WPpuWKoOS4gOWumuWBj+enu++8iVxyXG4gICAgICAgIHBpcGVVcC54ID0gdGhpcy5zaXplLndpZHRoIC8gMiArIHRoaXMucGlwZVNwYXduT2Zmc2V0WDtcclxuICAgICAgICAvLyDorr7nva7kuIrnq6/nrqHpgZPnmoTnurXlkJHotbflp4vkvY3nva7vvIjpmo/mnLrlj5blgY/np7vph4/vvIlcclxuICAgICAgICBwaXBlVXAueSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHRoaXMucGlwZU1heE9mZnNldFkpICsgcGlwZUhlaWdodC8yO1xyXG4gICAgICAgIC8vIOS4i+err+eUn+aIkOmAu+i+keWfuuacrOS4juS4iuerr+ebuOWQjFxyXG4gICAgICAgIHZhciBwaXBlRG93biA9IGNjLmluc3RhbnRpYXRlKHRoaXMucGlwZVByZWZhYnNbQ29uc3RhbnQuUElQRV9ET1dOXSk7XHJcbiAgICAgICAgcGlwZURvd24uZ2V0Q29tcG9uZW50KCdQaXBlJykuaW5pdChDb25zdGFudC5QSVBFX0RPV04pO1xyXG4gICAgICAgIHBpcGVEb3duLnggPSB0aGlzLnNpemUud2lkdGggLyAyICsgdGhpcy5waXBlU3Bhd25PZmZzZXRYO1xyXG4gICAgICAgIC8vIOmaj+acuueUn+aIkOS4iuerr+S4juS4i+err+euoemBk+S5i+mXtOeahOmXtOmameWAvO+8iHBpcGVNaW5HYXDkuI5waXBlTWF4R2Fw5LmL6Ze077yJXHJcbiAgICAgICAgdmFyIHBpcGVHYXAgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAodGhpcy5waXBlTWF4R2FwIC0gdGhpcy5waXBlTWluR2FwKSkgKyB0aGlzLnBpcGVNaW5HYXA7XHJcbiAgICAgICAgcGlwZURvd24ueSA9IHBpcGVVcC55IC0gcGlwZUdhcCAtIHBpcGVIZWlnaHQ7XHJcbiAgICAgICAgLy8g5re75Yqg566h6YGT5YiwcGlwZXPoioLngrnkuIpcclxuICAgICAgICB0aGlzLnBpcGVzTm9kZS5hZGRDaGlsZChwaXBlVXApO1xyXG4gICAgICAgIHRoaXMucGlwZXNOb2RlLmFkZENoaWxkKHBpcGVEb3duKTtcclxuICAgICAgICAvLyDmt7vliqDnrqHpgZPliLDnrqHpgZPmlbDnu4TkuK1cclxuICAgICAgICB0aGlzLnBpcGVzLnB1c2gocGlwZVVwKTtcclxuICAgICAgICB0aGlzLnBpcGVzLnB1c2gocGlwZURvd24pO1xyXG4gICAgfSxcclxuXHJcbiAgICBnYW1lVXBkYXRlOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBmb3IgKCB2YXIgaSA9IDA7IGkgPCB0aGlzLnBpcGVzLmxlbmd0aDsgaSArKyApIHtcclxuICAgICAgICAgICAgLy8g6I635Y+W5b2T5YmN566h6YGT5a+56LGh6IqC54K5XHJcbiAgICAgICAgICAgIHZhciBjdXJQaXBlTm9kZSA9IHRoaXMucGlwZXNbaV07XHJcbiAgICAgICAgICAgIC8vIOWvueeuoemBk+i/m+ihjOenu+WKqOaTjeS9nFxyXG4gICAgICAgICAgICBjdXJQaXBlTm9kZS54ICs9IENvbnN0YW50LkdST1VORF9WWDtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIOiOt+WPluWwj+m4n+eahOWMheWbtOebklxyXG4gICAgICAgICAgICB2YXIgYmlyZEJveCA9IHRoaXMuYmlyZC5ub2RlLmdldEJvdW5kaW5nQm94KCk7XHJcbiAgICAgICAgICAgIC8vIOiOt+WPluW9k+WJjeeuoemBk+eahOWMheWbtOebklxyXG4gICAgICAgICAgICB2YXIgcGlwZUJveCA9IGN1clBpcGVOb2RlLmdldEJvdW5kaW5nQm94KCk7XHJcbiAgICAgICAgICAgIC8vIHZhciBiaXJkUmVjdCA9IG5ldyBjYy5SZWN0KGJpcmRCb3gueCAtIGJpcmRCb3gud2lkdGggLyAyLCBiaXJkQm94LnkgLSBiaXJkQm94LmhlaWdodCAvIDIsXHJcbiAgICAgICAgICAgIC8vICAgICBiaXJkQm94LndpZHRoLCBiaXJkQm94LmhlaWdodCk7XHJcbiAgICAgICAgICAgIC8vIHZhciBwaXBlUmVjdCA9IG5ldyBjYy5SZWN0KHBpcGVCb3gueCAtIHBpcGVCb3gud2lkdGggLyAyLCBwaXBlQm94LnkgLSBwaXBlQm94LmhlaWdodCAvIDIsXHJcbiAgICAgICAgICAgIC8vICAgICBwaXBlQm94LndpZHRoLCBwaXBlQm94LmhlaWdodCk7XHJcbiAgICAgICAgICAgIC8vIOagueaNruS4pOS4quefqeW9ouiMg+WbtOWIpOaWreaYr+WQpuebuOS6pFxyXG4gICAgICAgICAgICBpZiAoY2MuSW50ZXJzZWN0aW9uLnJlY3RSZWN0KGJpcmRCb3gsIHBpcGVCb3gpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9uR2FtZU92ZXIoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8g6I635Y+W5b2T5YmN566h6YGT5a+56LGhXHJcbiAgICAgICAgICAgIHZhciBjdXJQaXBlID0gY3VyUGlwZU5vZGUuZ2V0Q29tcG9uZW50KCdQaXBlJyk7XHJcbiAgICAgICAgICAgIC8vIOWIpOaWreWwj+m4n+aYr+WQpumhuuWIqemAmui/h+euoemBk++8jOaYr+WImeWKoOWIhlxyXG4gICAgICAgICAgICBpZiAoIGN1clBpcGVOb2RlLnggPCB0aGlzLmJpcmQubm9kZS54ICYmIGN1clBpcGUuaXNQYXNzZWQgPT09IGZhbHNlIFxyXG4gICAgICAgICAgICAgICAgJiYgY3VyUGlwZS50eXBlID09PSBDb25zdGFudC5QSVBFX1VQKSB7XHJcbiAgICAgICAgICAgICAgICBjdXJQaXBlLmlzUGFzc2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYWRkU2NvcmUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8g6LaF5Ye65bGP5bmV6IyD5Zu055qE566h6YGT77yM5LuO5pWw57uE5Lit56e76Zmk77yM5bm25LuO6IqC54K55LiK5Yig6ZmkXHJcbiAgICAgICAgICAgIGlmICggY3VyUGlwZU5vZGUueCA8IC0odGhpcy5zaXplLndpZHRoLzIgKyBDb25zdGFudC5QSVBFX1NQQVdOX09GRlNFVF9YKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5waXBlcy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBpcGVzTm9kZS5yZW1vdmVDaGlsZChjdXJQaXBlTm9kZSwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIH0gXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIOWwj+m4n+inpuWcsO+8jOWImeatu+S6oVxyXG4gICAgICAgIGlmICh0aGlzLmJpcmQubm9kZS55IDwgdGhpcy5ncm91bmRUb3AgKSB7XHJcbiAgICAgICAgICAgIHRoaXMub25HYW1lT3ZlcigpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcclxuICAgIGFkZFNjb3JlOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAvLyDliqDliIZcclxuICAgICAgICB0aGlzLmN1clNjb3JlICsrO1xyXG4gICAgICAgIC8vIOaYvuekuuW9k+WJjeWIhuaVsFxyXG4gICAgICAgIHRoaXMuc2NvcmVUZXh0LnN0cmluZyA9IFwiXCIgKyB0aGlzLmN1clNjb3JlO1xyXG4gICAgICAgIHZhciBhY3Rpb24xID0gY2Muc2NhbGVUbyh0aGlzLnNjb3JlU2NhbGVEdXJhdGlvbiwgMS4xLCAwLjYpO1xyXG4gICAgICAgIHZhciBhY3Rpb24yID0gY2Muc2NhbGVUbyh0aGlzLnNjb3JlU2NhbGVEdXJhdGlvbiwgMC44LCAxLjIpO1xyXG4gICAgICAgIHZhciBhY3Rpb24zID0gY2Muc2NhbGVUbyh0aGlzLnNjb3JlU2NhbGVEdXJhdGlvbiwgMSwgMSk7XHJcbiAgICAgICAgLy8g5pKt5pS+5b2i5Y+Y5Yqo55S7XHJcbiAgICAgICAgdGhpcy5zY29yZVRleHQubm9kZS5ydW5BY3Rpb24oY2Muc2VxdWVuY2UoYWN0aW9uMSwgYWN0aW9uMiwgYWN0aW9uMykpO1xyXG4gICAgfSxcclxuICAgIFxyXG4gICAgb25HYW1lT3ZlcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8g6K6+572u5ri45oiP5aSx6LSl5qCH5b+X5L2NXHJcbiAgICAgICAgdGhpcy5pc0dhbWVPdmVyID0gdHJ1ZTtcclxuICAgICAgICAvLyDmuLjmiI/lpLHotKXvvIzlpoLotoXov4fmnIDpq5jliIbliJnmiJDnu6lcclxuICAgICAgICBpZiAoIHRoaXMuY3VyU2NvcmUgPiBTdG9yYWdlLmdldEhpZ2hTY29yZSgpICkge1xyXG4gICAgICAgICAgICBTdG9yYWdlLnNldEhpZ2hTY29yZSh0aGlzLmN1clNjb3JlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8g5q275Lqh5pe277yM5pi+56S64oCcR2FtZSBPdmVy4oCdXHJcbiAgICAgICAgdGhpcy5nYW1lT3ZlclRleHQuc3RyaW5nID0gQ29uc3RhbnQuR0FNRU9WRVJfVFhUO1xyXG4gICAgICAgIC8vIOWFs+mXreaJgOacieWumuaXtuWZqFxyXG4gICAgICAgIHRoaXMuYmlyZC51bnNjaGVkdWxlQWxsQ2FsbGJhY2tzKCk7XHJcbiAgICAgICAgdGhpcy5iYWNrZ3JvdW5kLnVuc2NoZWR1bGVBbGxDYWxsYmFja3MoKTtcclxuICAgICAgICB0aGlzLnVuc2NoZWR1bGVBbGxDYWxsYmFja3MoKTtcclxuICAgICAgICAvLyDkuIDlrprml7bpl7TlkI7vvIzph43mlrDliLfmlrDmuLjmiI/liLDlvIDlp4vnirbmgIFcclxuICAgICAgICB0aGlzLnNjaGVkdWxlKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBjYy5kaXJlY3Rvci5sb2FkU2NlbmUoJ2dhbWUnKTtcclxuICAgICAgICB9LCB0aGlzLmdhbWVSZWZsYXNoVGltZSk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8vIGNhbGxlZCBldmVyeSBmcmFtZSwgdW5jb21tZW50IHRoaXMgZnVuY3Rpb24gdG8gYWN0aXZhdGUgdXBkYXRlIGNhbGxiYWNrXHJcbiAgICAvLyB1cGRhdGU6IGZ1bmN0aW9uIChkdCkge1xyXG5cclxuICAgIC8vIH0sXHJcbn0pO1xyXG4iLCJjYy5DbGFzcyh7XHJcbiAgICBleHRlbmRzOiBjYy5Db21wb25lbnQsXHJcblxyXG4gICAgcHJvcGVydGllczoge1xyXG4gICAgICAgIC8vIOWwj+m4n+mAmui/h+euoemBk+S4juWQpueahOagh+W/l+S9jVxyXG4gICAgICAgIGlzUGFzc2VkOiBmYWxzZSxcclxuICAgIH0sXHJcblxyXG4gICAgLy8gdXNlIHRoaXMgZm9yIGluaXRpYWxpemF0aW9uXHJcbiAgICBvbkxvYWQ6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGluaXQ6IGZ1bmN0aW9uICh0eXBlKSB7XHJcbiAgICAgICAgLy8g6K6+572u566h6YGT55qE57G75Z6L77yI5LiK5oiW5LiL77yJXHJcbiAgICAgICAgdGhpcy50eXBlID0gdHlwZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBjYWxsZWQgZXZlcnkgZnJhbWUsIHVuY29tbWVudCB0aGlzIGZ1bmN0aW9uIHRvIGFjdGl2YXRlIHVwZGF0ZSBjYWxsYmFja1xyXG4gICAgLy8gdXBkYXRlOiBmdW5jdGlvbiAoZHQpIHtcclxuXHJcbiAgICAvLyB9LFxyXG59KTtcclxuIiwidmFyIFN0b3JhZ2UgPSB7XHJcbiAgICBnZXRIaWdoU2NvcmU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBzY29yZSA9IGNjLnN5cy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnSGlnaFNjb3JlJykgfHwgMDtcclxuICAgICAgICByZXR1cm4gcGFyc2VJbnQoc2NvcmUpO1xyXG4gICAgfSxcclxuICAgIFxyXG4gICAgc2V0SGlnaFNjb3JlOiBmdW5jdGlvbihzY29yZSkge1xyXG4gICAgICAgIGNjLnN5cy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnSGlnaFNjb3JlJywgc2NvcmUpO1xyXG4gICAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTdG9yYWdlO1xyXG5cclxuIl19