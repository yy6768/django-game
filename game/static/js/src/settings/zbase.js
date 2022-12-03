class Settings{
    constructor(root){
        this.root = root;
        this.platform  = "WEB";
        if(this.root.OS) this.platform ="ACAPP";
        this.username = "";
        this.photo = "";
        this.$settings = $(`
            <div class="py-game-settings">
               <div class="py-game-settings-login">
                    <div class="py-game-settings-title">
                        登录
                    </div>
                    <div class = "py-game-settings-username">
                        <div class = "py-game-settings-item">
                            <input type="text" placeholder="用户名">
                        </div>
                    </div>
                    <div class="py-game-settings-password">
                        <div class = "py-game-settings-item">
                            <input type="password" placeholder="密码">
                        </div>
                    </div>
                    <div class= "py-game-settings-submit">
                        <div class="py-game-settings-item">
                            <button>登录</button>
                        </div>
                    </div>
                    <div class="py-game-settings-error-message">
                    </div>
                    <div class="py-game-settings-option">
                        注册
                    </div>

               </div>
               <div class="py-game-settings-register">
                    <div class="py-game-settings-title">
                        注册
                    </div>
                    <div class = "py-game-settings-username">
                        <div class = "py-game-settings-item">
                            <input type="text" placeholder="用户名">
                        </div>
                    </div>
                    <div class="py-game-settings-password py-game-settings-password-first">
                        <div class = "py-game-settings-item">
                            <input type="password" placeholder="密码">
                        </div>
                    </div>
                    <div class="py-game-settings-password py-game-settings-password-second">
                        <div class = "py-game-settings-item">
                            <input type="password" placeholder="确认密码">
                        </div>
                    </div>
                    <div class= "py-game-settings-submit">
                        <div class="py-game-settings-item">
                            <button>注册</button>
                        </div>
                    </div>
                    <div class="py-game-settings-error-message">
                    </div>
                    <div class="py-game-settings-option">
                        登录
                    </div>
                    <br>
                    <div class="py-game-settings-logo">
                        <img width="30" alt="" src="https://app3333.acapp.acwing.com.cn/static/image/settings/acwing_logo.png" >
                        <br>
                        <div>Acwing一键登录</div>
                    </div>
               </div>
            <div>
        `);  
        this.$login = this.$settings.find(".py-game-settings-login");
        this.$login_username = this.$login.find(".py-game-settings-username input");
        this.$login_password = this.$login.find(".py-game-settings-password input");
        this.$login_submit = this.$login.find(".py-game-settings-submit button");
        this.$login_error_message = this.$login.find(".py-game-settings-error-message");
        this.$login_register = this.$login.find(".py-game-settings-option");
        this.$register = this.$settings.find(".py-game-settings-register");
        this.$register_username = this.$register.find(".py-game-settings-username input");
        this.$register_password = this.$register.find(".py-game-settings-password-first input");
        this.$register_password_confirm = this.$register.find(".py-game-settings-password-second input");
        this.$register_submit = this.$register.find(".py-game-settings-submit button");
        this.$register_error_message = this.$register.find(".py-game-settings-error-message");
        this.$register_login = this.$register.find(".py-game-settings-option");
        this.$login.hide();
        this.$register.hide();
        this.root.$py_game.append(this.$settings);
        this.start();
    }

    start(){
        this.getinfo();
        this.add_listening_events();
    }

    add_listening_events(){
        this.add_listening_events_login();
        this.add_listening_events_register();
    }

    add_listening_events_login(){
        let that = this;
        this.$login_register.click(function(){
            that.register();
        });
        this.$login_submit.click(function(){
            that.login_on_remote();
        });
    }

    add_listening_events_register(){
        let that = this;
        this.$register_login.click(function(){
            that.login();
        });
        this.$register_submit.click(function(){
            that.register_on_remote();
        });
    }

    login_on_remote(){//登录远程服务器
        let username = this.$login_username.val();
        let password = this.$login_password.val();
        this.$login_error_message.empty();
        let that = this;
        $.ajax({
            url:'http://124.220.18.48:8000/settings/login/',
            type:"GET",
            data:{
                username:username,
                password:password
            },
            success:function(res){
                console.log(res);
                if(res.result === 'success') {
                    location.reload();
                } else {
                    that.$login_error_message.html(res.result);
                }
            }
        })
    }

    register_on_remote(){ //在远程服务器上注册
        let that = this;
        let username = this.$register_username.val();
        let password = this.$register_password.val();
        let password_confirm = this.$register_password_confirm.val();
        this.$register_error_message.empty();

        $.ajax({
            url:'http://124.220.18.48:8000/settings/register/',
            type:'GET',
            data:{
                username:username,
                password:password,
                password_confirm:password_confirm
            },
            success:function(res){
                console.log(res);
                if(res.result === 'success') {
                    location.reload();
                } else {
                    that.$register_error_message.html(res.result);
                }
            }
        });
    }

    logout_on_remote(){
        if(this.platform === 'ACAPP'){
            return false;
        }
        $.ajax({
            url:"http://124.220.18.48:8000/settings/logout/",
            type:"GET",
            success:function(res){
                console.log(res.result);
                if(res.result === 'success')
                    location.reload();
            }
        })
    }

    register(){ //打开注册界面
        this.$login.hide();
        this.$register.show();
    }

    login() { //打开登录界面
        
        this.$register.hide();
        this.$login.show();
    }

    getinfo(){
        let that = this;

        $.ajax({
            url: "http://124.220.18.48:8000/settings/getinfo/",
            type:"GET",
            data: {
                platform:that.platform,
            },
            success:function(res) {
                console.log(res);
                if(res.result === "success"){
                   that.username = res.username;
                   that.photo = res.photo;
                   that.hide();
                   that.root.menu.show();
                } else {
                    that.login();

                }
            }
        })
    }

    hide(){
        this.$settings.hide();
    }

    show(){
        this.$settings.show();
    }
}
