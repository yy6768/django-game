class ChooseSkin{
    constructor(root){
        this.root = root;
        this.$choose_skin = $();

        this.$choose_skin.hide();
        this.root.$py_game.append(this.$choose_skin);
        this.width = this.$choose_skin.width();
        this.height = this.$choose_skin.height();
        this.$canvas = $(`<canvas></canvas>`);
        this.ctx.canvas.height = this.height;
        this.ctx.canvas.width = this.width;
        this.id = 0;
        this.mode = null;
    }

    start(){
        this.add_listening_event();
    }

    get_random_id(){
        let id = Math.floor(Math.random().mem.length);
        while(id === 0)
            id = Math.floor(Math.random() * mem.length);
        return id;
    }

    add_listening_event(){
        
    }
}

