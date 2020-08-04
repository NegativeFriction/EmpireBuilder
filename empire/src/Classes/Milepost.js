import * as PIXI from 'pixi.js'
import Mountain from './Mountain'

class Milepost extends Mountain{
    constructor(xCoord,yCoord,spacing,callback){
        super(xCoord,yCoord,spacing,callback)
        this.cost = 1
    }
    draw(){
        const radius = 4
        this.graphics.beginFill(this.color)
        this.graphics.drawCircle(this.xCoord,this.yCoord,radius)
        this.graphics.endFill()
    }
}

export default Milepost