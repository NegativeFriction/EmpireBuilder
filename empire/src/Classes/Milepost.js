import * as PIXI from 'pixi.js'
import Mountain from './Mountain'

class Milepost extends Mountain{
    constructor(xCoord,yCoord,xSpacing,ySpacing,callback){
        super(xCoord,yCoord,xSpacing,ySpacing,callback)
        this.cost = 1
        this.radius = this.radius*0.8
    }
    draw(){
        
        this.graphics.clear()
        this.graphics.beginFill(this.color)
        this.graphics.drawCircle(this.xCoord,this.yCoord,this.radius)
        this.graphics.endFill()
    }
}

export default Milepost