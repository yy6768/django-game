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
const PY_GAME_OBJECTS = []

class PyGameObject{
    constructor(){
        PY_GAME_OBJECTS.push(this);
        

        //两帧间隔
        this.timestamp = 0;
        //是否执行过start函数
        this.has_called_start = false;
        this.uuid = this.create_uuid();

    }

    create_uuid(){
        let res = "";
        for(let i = 0; i < 8; i++){
            let x = parseInt(Math.floor(Math.random() * 10));
            res += x;
        }
        return res;
    }

    start(){ //第一次执行时执行
    }

    update(){ //每一帧都会执行一次

    }
    
    on_destroy(){
        
    }

    destroy(){ //删掉当前物体
        this.on_destroy();

        for(let i = 0; i < PY_GAME_OBJECTS.length; i++){
            if(PY_GAME_OBJECTS[i] === this)
            {
                PY_GAME_OBJECTS.splice(i, 1);
                break;
            }
        }
    }
}

//上一帧的时间戳
let last_timestamp;
//每一帧的执行函数
let PY_GAME_ANIMATION = function(timestamp) {
    for(let i = 0; i < PY_GAME_OBJECTS.length; i++){
        let obj = PY_GAME_OBJECTS[i];
        if(!obj.has_called_start){
            obj.start();
            obj.has_called_start = true;
        } else {
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }

    last_timestamp = timestamp;
    requestAnimationFrame(PY_GAME_ANIMATION);
}

requestAnimationFrame(PY_GAME_ANIMATION);
class GameMap extends PyGameObject{
    constructor(playground){
        super();
        this.playground = playground;
        this.$canvas = $(`<canvas></canvas>`);
        this.ctx = this.$canvas[0].getContext(`2d`);
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.playground.$playground.append(this.$canvas);
        
    }


    start(){

    } 
    resize(){
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.ctx.fillStyle = "rgba(0, 0, 0, 1)";
        this.ctx.fillRect(0,0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
    
    update(){
        this.render();
       
    }

    render(){
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        this.ctx.fillRect(0,0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}
class Partical extends PyGameObject{
    constructor(playground, x, y, radius, vx, vy, color, speed, move_length){
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.speed = speed;
        this.friction = 0.9;
        this.move_length = move_length;
        this.eps = 0.01;
    }

    start(){
    }

    update(){
        if(this.speed < this.eps || this.move_length < this.eps){
            this.destroy();
            return false;
        }
        let moved = Math.min(this.speed * this.timedelta / 1000, this.move_length);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.speed *= this.friction;
        this.move_length -= moved;
        this.render();
    }

    render(){
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale,this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}
class Player extends PyGameObject {
    constructor(playground, x, y, radius,color, speed, character,username, photo){
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx; 
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.character = character;
        this.username = username;
        this.photo = photo;
        this.vx = 0;
        this.vy = 0;
        this.damage_x = 0;
        this.damage_y = 0;
        this.damage_speed = 0;
        this.move_length = 0;
        this.eps = 0.01;

        //冷静期
        this.spent_time = 0;

        //摩擦力
        this.friction = 0.9;

        this.cur_skill = null;

        if(this.character !== 'robot') {
            this.img = new Image();
            this.img.src = this.photo;
        }
    }

    start(){
        if(this.character === 'me'){
            this.add_listening_events();
        } else if(this.character ==='robot'){
            let tx = Math.random() * this.playground.width / this.playground.scale;
            let ty = Math.random() * this.playground.height / this.playground.scale;
            this.move_to(tx,ty);
        }
    }

    add_listening_events(){
        this.playground.game_map.$canvas.on("contextmenu", function(){
            return false;
        });
        let that = this;
        this.playground.game_map.$canvas.mousedown(function(e){
            const rect = that.ctx.canvas.getBoundingClientRect();
            if(e.which ===3){
                that.move_to((e.clientX -rect.left)/that.playground.scale , (e.clientY- rect.top) / that.playground.scale);
            } else if(e.which === 1){
                if(that.cur_skill === "fireball"){
                    that.shoot_fireball((e.clientX - rect.left) / that.playground.scale, (e.clientY - rect.top) / that.playground.scale );
                }

                that.cur_skill = null;
            }
        });

        $(window).keydown(function(e){ 
            if(e.which === 81) {
                that.cur_skill = "fireball";
                return false;
            }
        });
    }

    shoot_fireball(tx ,ty){
        let x = this.x, y = this.y;
        let radius =  0.01;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let color = "orange";
        let speed = 0.5;
        let move_length = 1;
        new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length,  0.01);
    }

    get_dist(x1,x2,y1,y2){
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    move_to(tx , ty){
        this.move_length = this.get_dist(this.x, tx, this.y, ty);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
    }

    is_attacked(angle,damage){
        for(let i = 0;  i < 20 + Math.random() * 10; i++){
            let x = this.x;
            let y = this.y;
            let radius = this.radius * Math.random() * 0.1;
            let angle = Math.random() *  Math.PI *2;
            let vx = Math.cos(angle), vy = Math.sin(angle);
            let color = this.color;
            let speed = this.speed * 10;
            let move_length = this.radius * Math.random() * 5;
            new Partical(this.playground, x, y, radius, vx, vy, color, speed, move_length);
        }
        this.radius -= damage;
        if(this.radius < this.eps){
            this.destroy();
            return false;
        }
        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        this.damage_speed = damage * 100;
        this.speed *= 0.8;


    }

    //更新移动
    update_move(){
        this.spent_time += this.timedelta / 1000;

        if(this.character === 'robot' && this.spent_time > 4 && Math.random() < 1 / 300.0){
            let player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
            let tx = player.x + player.vx * player.speed * this.timedelta / 1000 * 0.3;
            let ty = player.y + player.vy * player.speed * this.timedelta / 1000 * 0.3;
            this.shoot_fireball(tx, ty);
        }

        if(this.damage_speed > this.eps){
            this.vx = this.vy = 0;
            this.move_length = 0;
            this.x += this.damage_x * this.damage_speed * this.timedelta / 1000;
            this.y += this.damage_y * this.damage_speed * this.timedelta / 1000;
            this.damage_speed *= this.friction;
        }else{
            if(this.move_length < this.eps){
                this.move_length = 0;
                this.vx = 0;
                this.vy = 0;
                if(this.character === 'robot'){
                    let tx = Math.random() * this.playground.width / this.playground.scale;
                    let ty = Math.random() * this.playground.height /  this.playground.scale;
                    this.move_to(tx,ty);
                }
            } else {
                let moved = Math.min(this.speed * this.timedelta / 1000, this.move_length);
                this.x += this.vx * moved;
                this.y += this.vy * moved;
                this.move_length -= moved;
            }
        }
    }

    update(){
        this.update_move();
        this.render();

    }

    render(){
        const  scale = this.playground.scale;
        if(this.character !== 'robot'){
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, (this.x - this.radius) * scale, (this.y - this.radius) * scale, this.radius * 2 * scale, this.radius * 2 * scale); 
            this.ctx.restore();
        } else {
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }
    }

    on_destroy(){
        for(let i = 0; i < this.playground.players.length; i++){
            if(this.playground.players[i] === this){
                this.playground.players.splice(i, 1);
            }
        }
    }
}
class FireBall extends PyGameObject{
    constructor(playground, player, x, y, radius, vx, vy, color, speed,move_length, damage){
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.player = player;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        this.damage = damage;
        this.eps = 0.01;
    }


    start(){

    }

    update(){
        if(this.move_length < this.eps){
            this.destroy();
            return false;
        } 
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;

        //判断碰撞
        for(let i = 0; i < this.playground.players.length; i++)
        {
            let player = this.playground.players[i];
            if(this.player !== player && this.is_collision(player)){
                
                this.attack(player);
            }
        }

        this.render();
    }

    get_dist(x1,x2,y1,y2){
        let dx = x1 - x2;
        let dy = y1 - y2;
        return  Math.sqrt(dx * dx + dy * dy);
    }


    is_collision(player){
        let distance = this.get_dist(this.x ,player.x, this.y, player.y);
        if(distance < this.radius + player.radius)
            return true;
        return false;
    }

    attack(player){
       let angle = Math.atan2(player.y - this.y, player.x - this.x);
       player.is_attacked(angle, this.damage); 
       this.destroy();
    }

    render(){
        let scale  = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}
class MultiPlayerSocket{
    constructor(playground){
        this.playground = playground;
        this.ws = new WebSocket("ws://124.220.18.48:8000/wss/multiplayer/");

        this.start();
    }
    start(){
      this.receive();  
    }

    receive(){
        let that = this;

        this.ws.onmessage = function(msg){
            let data = JSON.parse(msg.data);
            let uuid = data.uuid;
            if(uuid === that.uuid) return false;
            let event = data.event;
            if(event === 'create_player'){
                that.receive_create_player(uuid,data.username,data.photo);        
            }
        };
    }

    send_create_player(username, photo){
        let that = this;
        this.ws.send(JSON.stringify({
            'event':'create_player',
            'uuid':that.uuid,
            'username':username,
            'photo':photo
        }));   
    }

    receive_create_player(uuid,username,photo){
        let player = new Player(
            this.playground,
            this.playground.width / 2 /this.playground.scale,
            0.5,
            0.05,
            "white",
            0.15,
            "enemy",
            username,
            photo,
        );
        player.uuid = uuid;
        this.playground.players.push(player);
    }
}
class PyGamePlayGround{
    constructor(root){
        this.root = root;
        this.$playground = $(`<div class="py-game-playground"></div>`);
        this.hide();
        this.root.$py_game.append(this.$playground);
        this.start();
    }

    start(){
        let that = this;
        $(window).resize(function(){
            that.resize();
        });
    }

    get_random_color(){
        let colors = ["blue", "red", "pink", "grey", "green"];
        return colors[Math.floor(Math.random() * 5)];
    }
    //打开playground界面
    show(mode){
        this.$playground.show();
        this.root.$py_game.append(this.$playground);
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.resize();
        let that = this;
        this.game_map = new GameMap(this);
        this.players = [];
        console.log(this.root.settings.username);
        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, "white", 0.15, "me",this.root.settings.username, this.root.settings.photo));
        if(mode === "single mode"){
            for(let i = 0; i < 5; i++){
                this.players.push(new Player(this, this.width / 2 /this.scale, 0.5, 0.05, this.get_random_color(), 0.15, "robot"));
            }
        } else if(mode ==="multi mode"){
            this.mps = new MultiPlayerSocket(this);
            this.mps.uuid = this.players[0].uuid;

            this.mps.ws.onopen = function(){
               that.mps.send_create_player(that.root.settings.username,that.root.settings.photo); 
            }
            
        }
    }

    resize(){

        this.width = this.$playground.width();
        this.height = this.$playground.height();
        let unit =Math.min(this.width / 16, this.height / 9);
        this.width  = unit * 16;
        this.height = unit * 9;
        this.scale =  this.height;

        if(this.game_map) this.game_map.resize();
    }


    hide(){
        this.$playground.hide();
    }
}
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
export class PyGame{
    constructor(id, OS){
        this.id = id;
        this.$py_game = $('#'+id);
        this.OS = OS;
        this.settings = new Settings(this); 
        this.menu = new PyGameMenu(this);
        this.playground = new PyGamePlayGround(this);
        this.start();
        
    }

    start(){
   
    }
    
}
