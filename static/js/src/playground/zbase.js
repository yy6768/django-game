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
