cc.Class({
    extends: cc.Component,

    properties: {
        accl:0,
        plane:{
            default:null,
            type:cc.Node
        }
    },
    setInputControl:function(){
        var self = this;
        var listener = {
            event:cc.EventListener.KEYBOARD,
            onKeyPressed:function(keyCode,event){
                switch(keyCode){
                    case cc.KEY.a:
                        self.accLeft= true;
                        break;
                    case cc.KEY.d:
                        self.accRight= true;
                        break;
                    case cc.KEY.w:
                        self.accUp= true;
                        break;
                    case cc.KEY.s:
                        self.accDown= true;
                        break;
                }
            },
            onKeyReleased:function(keyCode,event){
                switch(keyCode){
                    case cc.KEY.a:
                        self.accLeft= false;
                        break;
                    case cc.KEY.d:
                        self.accRight= false;
                        break;
                    case cc.KEY.w:
                        self.accUp= false;
                        break;
                    case cc.KEY.s:
                        self.accDown= false;
                        break;
                }
            }
            
        }
        cc.eventManager.addListener(listener, self.node)
    },

    // use this for initialization
    onLoad: function () {
        this.accLeft = false;
        this.accRight = false;
        this.accUp = false;
        this.accDoen = false;
        this.setInputControl();
    },

    update: function (dt) {
        if(this.accLeft){
            this.plane.x -=this.accl;
        }
        if(this.accRight){
            this.plane.x +=this.accl;
        }
        if(this.accUp){
            this.plane.y +=this.accl;
        }
        if(this.accDown){
            this.plane.y -=this.accl;
        }
     },
});
