import React from 'react'
import * as PIXI from 'pixi.js'
import distanceFormula from './../utils/distanceFormula'
import {ContextMenu, MenuItem, ContextMenuTrigger} from 'react-contextmenu'
import Mountain from './../Classes/Mountain'
import Milepost from './../Classes/Milepost'

export default class GameBoard extends React.Component{
    constructor(props){
        super(props)
        this.state={
            mapWidth:1600,
            mapHeight: 800,
            board:{},
            startPoint:{},
            endPoint:{},
            cameraXLower:0,
            cameraXUpper: 250,
            cameraYLower:0,
            cameraYUpper:250,
            startPoint:'',
            endPoint:''

        }
    }

    render(){
        return <React.Fragment>
            <ContextMenuTrigger id='dropdownContextMenu'
            holdToDisplay={-1}>
                <div className='stageDiv'
                onMouseLeave={this.onBlur.bind(this)}
                onMouseUp={this.onMouseUp.bind(this)}
                onWheel={this.onWheel.bind(this)}
                ref={(el)=>{this.stageRef=el}}
                />
            </ContextMenuTrigger>

            <ContextMenu id='dropdownContextMenu'
            onShow = {this.onShow.bind(this)}
            >
                <MenuItem>
                    You sure opened the context menu, champ!
                </MenuItem>
            </ContextMenu>
        </React.Fragment>
    }

    componentDidMount(){
        const app = new PIXI.Application({
            backgroundColor: 0x008000,
            width: window.innerWidth * 0.8,
            height: window.innerHeight * 0.8,
            sharedLoader: true,
            sharedTicker: true,
            antialias:true
        })
        // app.renderer.plugins.interaction.on('mousemove',this.onMouseMove.bind(this)).on('mousedown',this.onClick.bind(this))
        this.stageRef.append(app.view)
        this.app = app
        app.stage.interactive = true
        app.stage.buttonMode = false
        this.createMap()
    }

    onBlur(){
        // console.log("on blur")
    }



    onMouseUp(){
        // console.log("Mouse up")
    }

    onWheel(){
        // console.log("Wheel scroll")
    }

    onShow(){
        // console.log("On show")
    }

    mouseOverCallback(key){
        if(this.state.startPoint){

        }
    }

    clickCallback(x,y){
        const key = x + ',' + y
        if(this.state.startPoint === key){
            this.setState({startPoint:''})
        }else if(!this.state.startPoint){
            this.setState({startPoint:key})
        }else if(!this.state.endPoint){
            this.setState({endPoint:key},()=>this.astar())
        }
    }

    astar(startPoint=this.state.startPoint,endPoint=this.state.endPoint){
        if(startPoint && endPoint){
            const board = this.state.board
            const startPoint = board[this.state.startPoint]
            startPoint.parent = ''
            const endPoint = board[this.state.endPoint]
            var openList = []
            let openListObj = {}
            let closedListObj = {
                [this.state.startPoint]:startPoint
            }
            const closedList = [startPoint]
            var lastPoint = startPoint
            let finished = false
            let neighbor,newestPoint,dist,bestPoint
            while(!finished){
                for(let n = 0;n<6;n++){
                    if(!lastPoint.paths[n])
                    neighbor = lastPoint.neighbors[n]
                    newestPoint = board[neighbor]
                    if(newestPoint && !openListObj[neighbor] && !closedListObj[neighbor]){
                        newestPoint.parent = lastPoint
                        dist = distanceFormula(endPoint.xCoord,newestPoint.xCoord,endPoint.yCoord,newestPoint.yCoord)
                        newestPoint.cashCost = lastPoint.cashCost + newestPoint.cost + lastPoint.rivers[n]
                        if(lastPoint.rivers[n]){
                            console.log("There's a river between",lastPoint.key,'and',newestPoint.key)
                        }
                        newestPoint.moveCost = 0
                        //  lastPoint.moveCost + 1
                        newestPoint.heuristic = newestPoint.cashCost + newestPoint.moveCost + dist + lastPoint.heuristic
                        openList.push(newestPoint)
                        openListObj[neighbor] = 1
                        
                    }
                }
            bestPoint = openList[0]
            openList.forEach((point)=>{
                if(bestPoint.heuristic > point.heuristic){
                    bestPoint = point
                }
            })
            lastPoint = bestPoint
            closedList.push(bestPoint)
            openList = openList.filter(function(e){ return e.key !== bestPoint.key})
            if(bestPoint.key === endPoint.key){
                break
            }
            }

            this.setState({startPoint:'',endPoint:''})
            let finalClosedList = [endPoint]
            console.log("The final cash cost is",endPoint.cashCost)
            var colorArray = [0x000000F]
            let colorIndex = Math.floor(Math.random() * colorArray.length)
            const color = colorArray[colorIndex]
            // console.log("Color index",colorIndex,"color",color)
            let p = endPoint
            while (1){
                if(p.parent){
                    finalClosedList.push(p.parent)
                    p = p.parent
                }else{
                    break
                }
            }
            
            console.log('closed list',closedList,'final closed list',finalClosedList)
            startPoint.toggleSelected()
            endPoint.toggleSelected()
            this.drawPath(finalClosedList,color)
        }
    }

    drawPath(closedList,color){
        let line = new PIXI.Graphics
        line.lineStyle(3,color,1)
        let p = closedList[0]
        line.moveTo(p.xCoord,p.yCoord)
        for(let n = 1; n<closedList.length;n++){
            p = closedList[n]
            line.lineTo(p.xCoord,p.yCoord)
        }
        this.boardContainer.addChild(line)
    }

    createMap(){
        const xSpacing = Math.floor(Math.sqrt(3)*17)
        const ySpacing = 17
        const xRange = window.innerWidth * 0.8/xSpacing
        const yRange = window.innerHeight* 0.8/ySpacing
        var boardContainer = new PIXI.Container()
        boardContainer.x = 0
        boardContainer.y = 0
        boardContainer.width = xRange * xSpacing
        boardContainer.height = yRange * ySpacing
        console.log('x range',xRange)
        // For posterity: Spacing is kinda weird in the coordinate plane. If I were 100% geometrically accurate,
        // x spacing would be a factor of 2 times the squart root of three, and y spacing would be a factor of the square root of 3. 
        // I'm not entirely accurate, and that's just fine. 

        const board = {}
        let xOffset = 0
        let xCoord,yCoord,key,newMilePost
        for(let y = 0; y<yRange; y++){
            xOffset = xOffset?0:1
            for(let x = 0; x<xRange;x+=2){
                xCoord = (x + xOffset) * xSpacing
                yCoord = y*ySpacing
                key = xCoord + ',' + yCoord
                if(Math.floor(Math.random()*3)){
                    newMilePost = new Milepost(xCoord,yCoord,xSpacing,ySpacing,this.clickCallback.bind(this))
                }else{
                    newMilePost = new Mountain(xCoord,yCoord,xSpacing,ySpacing,this.clickCallback.bind(this))
                }
                newMilePost.initialize()
                boardContainer.addChild(newMilePost.graphics)
                board[key] = newMilePost            
            }
        }
        this.setState({board},()=>{
            this.boardContainer = boardContainer
            this.app.stage.addChild(boardContainer)
            let rivers = this.createRivers()
            this.drawRivers(rivers)
        })
    }

    createRivers(){
        // console.log('create Rivers')
        const board = this.state.board
        let keys = Object.keys(board)
        let rivers = []
        let river = []
        let randomKey = keys[Math.floor(Math.random() * keys.length)]
        // console.log('board',board,'keys',keys,'random key',randomKey)
        let randomPoint = board[randomKey]
        let [randomNeighbor,randomNumber] = this.getRandomNeighbor(randomPoint)
        randomNeighbor = board[randomNeighbor]
        let riverPoint = {
            xCoord: (randomPoint.xCoord + randomNeighbor.xCoord)/2,
            yCoord: (randomPoint.yCoord + randomNeighbor.yCoord)/2
        }
        river.push(riverPoint)
        randomPoint.rivers[randomNumber] = 100
        randomNumber = randomNumber + 3 < 5?randomNumber + 3: randomNumber - 3
        randomNeighbor.rivers[randomNumber] = 100
        randomPoint = randomNeighbor
        let superDumbExtraVariable
        for(let n = 0;n<10;n++){
            superDumbExtraVariable = this.getRandomNeighbor(randomPoint,randomNumber)
            randomNeighbor = superDumbExtraVariable[0]
            randomNumber = superDumbExtraVariable[1]
            randomNeighbor = this.state.board[randomNeighbor]
            riverPoint = {
                xCoord: (randomPoint.xCoord + randomNeighbor.xCoord)/2,
                yCoord: (randomPoint.yCoord + randomNeighbor.yCoord)/2
            }
            river.push(riverPoint)
            randomPoint.rivers[randomNumber] = 100
            randomNumber = randomNumber + 3 < 5?randomNumber + 3: randomNumber - 3
            randomNeighbor.rivers[randomNumber] = 100
            randomPoint = randomNeighbor
        }
        this.setState({board})
        rivers.push(river)
        return(rivers)
    }

    getRandomNeighbor(randomPoint,previousRandomNumber=Math.floor(Math.random()*5)){
        let randomNumber = Math.floor(Math.random()*2)
        if(randomNumber){
            if(this.state.board[randomPoint.neighbors[previousRandomNumber+1]]){
                randomNumber = previousRandomNumber + 1
            }else{
                randomNumber = previousRandomNumber - 1
            }
        }else{
            if(this.state.board[randomPoint.neighbors[previousRandomNumber-1]]){
                randomNumber= previousRandomNumber - 1
            }else{
                randomNumber = previousRandomNumber + 1
            }
        }
        
        let randomNeighbor = randomPoint.neighbors[randomNumber]
        return [randomNeighbor,randomNumber]

    }

    drawRivers(rivers){
        console.log("Draw rivers",rivers)
        let line = new PIXI.Graphics
        let river
        line.lineStyle(2,0xADD8E6,1)
        for (let n=0;n<rivers.length;n++){
            river = rivers[n]
            line.moveTo(river[0].xCoord,river[0].yCoord)
            for(let i = 1;i<river.length;i++){
                line.lineTo(river[i].xCoord,river[i].yCoord)
            }
        }
        this.boardContainer.addChild(line)
    }
}