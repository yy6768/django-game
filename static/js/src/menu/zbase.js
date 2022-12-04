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
            退出
        </div>
    </div>
</div>`);
        this.$menu.hide();
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
            that.root.playground.show("single mode");
        });
        this.$multi_mode.click(function(){
            that.hide();
            that.root.playground.show("multi mode");
        });

        this.$settings_mode.click(function(){
            that.root.settings.logout_on_remote();
            
        });
    }

    show(){
        this.$menu.show();
    }

    hide(){
        this.$menu.hide();
    }
}
