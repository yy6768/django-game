class PyGameMenu{
    constructor(root){
        this.root = root
        this.$menu = $(`
<div class ="py-game-menu">
    <div class="py-game-menu-field">
        <div class="py-game-menu-field-item py-game-menu-field-item-single-mode">
            单人模式
        </div>
        <br>
        <div class="py-game-menu-field-item py-game-menu-field-item-multi-mode">
            多人模式
        </div>
        <br>
        <div class="py-game-menu-field-item py-game-menu-field-item-settings-mode">
            设置
        </div>
    </div>
</div>`);
        this.root.$py_game.append(this.$menu);
        this.$single_mode = this.$menu.find('.py-game-menu-field-item-single-mode');
        this.$multi_mode = this.$menu.find('.py-game-menu-field-item-multi-mode');
        this.$settings_mode = this.$menu.find('.py-game-menu-field-item-settings-mode');
        this.start();
    }

    start(){
        this.add_listening_events();
    }

    add_listening_events(){
        let that = this;
        this.$single_mode.click(function(){
            that.hide();
            that.root.playground.show();
        });
        this.$multi_mode.click(function(){
            console.log("click multi mode");
        });

        this.$settings_mode.click(function(){
            console.log("click settings mode");
        });
    }

    show(){
        this.$menu.show();
    }

    hide(){
        this.$menu.hide();
    }
}
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
class PyGame{
    constructor(id){
        this.id = id;
        this.$py_game = $('#'+id);
        this.menu = new PyGameMenu(this);
        this.playground = new PyGamePlayGround(this);
        this.start();
    }

    start(){
   
    }
    
}
