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
