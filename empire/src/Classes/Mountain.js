import * as PIXI from 'pixi.js'

class Mountain{
    constructor(xCoord,yCoord,xSpacing,ySpacing,callback){
        this.selected = false
        this.xCoord= xCoord
        this.yCoord = yCoord
        this.key = xCoord + ',' + yCoord
        this.callback = callback
        this.xSpacing = xSpacing
        this.ySpacing = ySpacing
        this.parent = ''
        this.heuristic = 0
        this.radius = 5
        this.draw = this.draw.bind(this)
        this.graphics = new PIXI.Graphics()
        this.graphics.interactive = true
        this.graphics.hitArea = new PIXI.Circle(xCoord,yCoord,this.radius*1.3)
        this.graphics.on('click',this.onClick.bind(this)).on('pointerOver',this.onMouseOver.bind(this))
        this.neighbors=[]
        this.cost = 10
        this.cashCost = 0
        this.moveCost = 0
        this.initialize = this.initialize.bind(this)
        this.toggleSelected = this.toggleSelected.bind(this)
        // rivers, neighbors, and paths all function on the assumption that the 0 index item is straight north,
        // and all subsequent indexes move clockwise around the point. IE index 1 is northeast, index 2 is southeast, etc.
        this.rivers = [0,0,0,0,0,0]
        this.neighbors = ['','','','','','']
        this.paths=['','','','','','']
        this.color=0xffffff
    }
    initialize(){
        //Calculate where all neighbors are and store them as strings. In the main program, these strings will be the keys that represent 
        //each point. We can access them using the strings stored in this.neighbors
        this.neighbors[0] = this.xCoord + ',' + (this.yCoord - 2*this.ySpacing)
        this.neighbors[1] = this.xCoord + this.xSpacing + ',' + (this.yCoord - this.ySpacing)
        this.neighbors[2] = this.xCoord + this.xSpacing + ',' + (this.yCoord + this.ySpacing)
        this.neighbors[3] = this.xCoord + ',' + (this.yCoord +  2*this.ySpacing)
        this.neighbors[4] = this.xCoord - this.xSpacing + ',' + (this.yCoord + this.ySpacing)
        this.neighbors[5] = this.xCoord - this.xSpacing + ',' + (this.yCoord - this.ySpacing)

        this.draw()
    }
    onClick(){
        console.log(this.key)
        this.cashCost = 0
        this.heuristic = 0
        this.moveCost = 0
        this.toggleSelected()
        this.callback(this.xCoord,this.yCoord)
    }

    toggleSelected(){
        this.selected = !this.selected
        this.color=this.selected?0x000000:0xffffff
        this.radius = this.selected?this.radius * 1.4:this.radius/1.4
        this.draw()
    }
    draw(){
        this.graphics.clear()
        this.graphics.beginFill(this.color)
        this.graphics.moveTo(this.xCoord,this.yCoord-this.radius)
        this.graphics.lineTo(this.xCoord - (Math.sqrt(3)/2)*this.radius,this.yCoord + this.radius/2)
        this.graphics.lineTo(this.xCoord + (Math.sqrt(3)/2)*this.radius,this.yCoord + this.radius/2)
        this.graphics.lineTo(this.xCoord,this.yCoord - this.radius)
        this.graphics.endFill()

        this.graphics.mouseOver = function(){
            this.onMouseOver()
        }
        // this.graphics.lineStyle(1,0xffffff)
        // this.graphics.drawCircle(this.xCoord,this.yCoord,radius)
    }
    onMouseOver(){
        this.radius = this.radius * 1.4
        this.draw()
    }


}

export default Mountain