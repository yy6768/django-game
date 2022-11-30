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
