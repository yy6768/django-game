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
const PY_GAME_OBJECTS = []

class PyGameObject{
    constructor(){
        PY_GAME_OBJECTS.push(this);
        

        //两帧间隔
        this.timestamp = 0;
        //是否执行过start函数
        this.has_called_start = false;
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
        this.eps = 0.1;
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
        this.ctx.beginPath();
        this.ctx.arc(this.x,this.y,this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}
class Player extends PyGameObject {
    constructor(playground, x, y, radius,color, speed, is_me){
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx; 
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.is_me = is_me;
        this.vx = 0;
        this.vy = 0;
        this.damage_x = 0;
        this.damage_y = 0;
        this.damage_speed = 0;
        this.move_length = 0;
        this.eps = 0.1;

        //冷静期
        this.spent_time = 0;

        //摩擦力
        this.friction = 0.9;

        this.cur_skill = null;
    }

    start(){
        if(this.is_me){
            this.add_listening_events();
        } else {
            let tx = Math.random() * this.playground.width;
            let ty = Math.random() * this.playground.height;
            this.move_to(tx,ty);
        }
    }

    add_listening_events(){
        this.playground.game_map.$canvas.on("contextmenu", function(){
            return false;
        });
        let that = this;
        this.playground.game_map.$canvas.mousedown(function(e){
            if(e.which ===3){
                that.move_to(e.clientX,e.clientY);
            } else if(e.which === 1){
                if(that.cur_skill === "fireball"){
                    that.shoot_fireball(e.clientX, e.clientY);
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
        let radius = this.playground.height * 0.01;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let color = "orange";
        let speed = this.playground.height * 0.5;
        let move_length = this.playground.height * 1;
        new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, this.playground.height * 0.01);
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
        if(this.radius < 10){
            this.destroy();
            return false;
        }
        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        this.damage_speed = damage * 100;
        this.speed *= 0.8;


    }

    update(){
        this.spent_time += this.timedelta / 1000;

        if(!this.is_me && this.spent_time > 4 && Math.random() < 1 / 300.0){
            let player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
            let tx = player.x + player.vx * player.speed * this.timedelta / 1000 * 0.3;
            let ty = player.y + player.vy * player.speed * this.timedelta / 1000 * 0.3;
            this.shoot_fireball(tx, ty);
        }

        if(this.damage_speed > 10){
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
                if(!this.is_me){
                    let tx = Math.random() * this.playground.width;
                    let ty = Math.random() * this.playground.height;
                    this.move_to(tx,ty);
                }
            } else {
                let moved = Math.min(this.speed * this.timedelta / 1000, this.move_length);
                this.x += this.vx * moved;
                this.y += this.vy * moved;
                this.move_length -= moved;
            }
        }
        this.render();

    }

    render(){

        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
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
        this.eps = 0.1;
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
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}
class PyGamePlayGround{
    constructor(root){
        this.root = root;
        this.$playground = $(`<div class="py-game-playground"></div>`);
        // this.hide();
        this.root.$py_game.append(this.$playground);
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        
        this.game_map = new GameMap(this);
        this.players = [];
        this.players.push(new Player(this, this.width/2, this.height/2, this.height * 0.05, "white", this.height*0.15, true));
        for(let i = 0; i < 5; i++){
            this.players.push(new Player(this, this.width/2, this.height/2, this.height * 0.05, this.get_random_color(), this.height*0.15, false));
        }
        this.start();
    }

    start(){
        
    }

    get_random_color(){
        let colors = ["blue", "red", "pink", "grey", "green"];
        return colors[Math.floor(Math.random() * 5)];
    }
    //打开playground界面
    show(){
        this.$playground.show();
    }
    
    hide(){
        this.$playground.hide();
    }
}
export class PyGame{
    constructor(id){
        this.id = id;
        this.$py_game = $('#'+id);
        // this.menu = new PyGameMenu(this);
        this.playground = new PyGamePlayGround(this);
        this.start();
    }

    start(){
   
    }
    
}
