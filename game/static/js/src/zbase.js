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
