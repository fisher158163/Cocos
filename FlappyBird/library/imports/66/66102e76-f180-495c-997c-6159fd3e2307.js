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