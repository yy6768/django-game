class PyGamePlayGround{
    constructor(root){
        this.root = root;
        this.$playground = $(`<div>游戏界面</div>`);
        this.hide();
        this.root.$py_game.append(this.$playground);
        this.start();
    }

    start(){
        
    }
    //打开playground界面
    show(){
        this.$playground.show();
    }
    
    hide(){
        this.$playground.hide();
    }
}
