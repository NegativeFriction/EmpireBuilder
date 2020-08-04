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
            width: window.innerWidth,
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
        console.log("on blur")
    }



    onMouseUp(){
        console.log("Mouse up")
    }

    onWheel(){
        console.log("Wheel scroll")
    }

    onShow(){
        console.log("On show")
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

    astar(){
        if(this.state.startPoint && this.state.endPoint){
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
            console.log('start',startPoint,'end',endPoint)
            while(!finished){
                for(let n = 0;n<6;n++){
                    if(!lastPoint.paths[n])
                    neighbor = lastPoint.neighbors[n]
                    newestPoint = board[neighbor]
                    if(newestPoint && !openListObj[neighbor] && !closedListObj[neighbor]){
                        newestPoint.parent = lastPoint
                        dist = distanceFormula(endPoint.xCoord,newestPoint.xCoord,endPoint.yCoord,newestPoint.yCoord)
                        newestPoint.cashCost = lastPoint.cashCost + newestPoint.cost + lastPoint.rivers[n]
                        newestPoint.moveCost = lastPoint.moveCost + 1
                        newestPoint.heuristic = newestPoint.cashCost + newestPoint.moveCost + dist + lastPoint.heuristic
                        openList.push(newestPoint)
                        openListObj[neighbor] = 1
                        
                        if(dist === 0 ){
                            closedList.push(newestPoint)
                            finished = true
                            break
                        }
                    }
                }
                if(dist ===0){
                    break
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
            console.log("At the end of this round, open list is:",openList,'closed list is',closedList)
            }

            console.log("Sweet, I exited! Closed list is",closedList)
            this.setState({startPoint:'',endPoint:''})
            let finalClosedList = [endPoint]
            
            var colorArray = [0xFF6633, 0xFFB399, 0xFF33FF, 0xFFFF99, 0x00B3E6, 
            0xE6B333, 0x3366E6, 0x999966, 0x99FF99, 0xB34D4D,
            0x80B300, 0x809900, 0xE6B3B3, 0x6680B3, 0x66991A, 
            0xFF99E6, 0xCCFF1A, 0xFF1A66, 0xE6331A, 0x33FFCC,
            0x66994D, 0xB366CC, 0x4D8000, 0xB33300, 0xCC80CC, 
            0x66664D, 0x991AFF, 0xE666FF, 0x4DB3FF, 0x1AB399,
            0xE666B3, 0x33991A, 0xCC9999, 0xB3B31A, 0x00E680, 
            0x4D8066, 0x809980, 0xE6FF80, 0x1AFF33, 0x999933,
            0xFF3380, 0xCCCC00, 0x66E64D, 0x4D80CC, 0x9900B3, 
            0xE64D66, 0x4DB380, 0xFF4D4D, 0x99E6E6, 0x6666FF]
            let colorIndex = Math.floor(Math.random() * colorArray.length)
            const color = colorArray[colorIndex]
            console.log("Color index",colorIndex,"color",color)
            let p = endPoint
            while (1){
                if(p.parent){
                    finalClosedList.push(p.parent)
                    p = p.parent
                }else{
                    break
                }
            }
            // console.log('start',startPoint.key,'end',endPoint.key)
            // console.log('closed list',closedList,'final closed list',finalClosedList)
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
        const xSpacing = 2*17
        const ySpacing = 17
        const xRange = 200
        const yRange = 100
        var boardContainer = new PIXI.Container()
        boardContainer.x = 0
        boardContainer.y = 0
        boardContainer.width = xRange * xSpacing
        boardContainer.height = yRange * ySpacing

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
                    newMilePost = new Milepost(xCoord,yCoord,xSpacing,this.clickCallback.bind(this))
                }else{
                    newMilePost = new Mountain(xCoord,yCoord,xSpacing,this.clickCallback.bind(this))
                }
                newMilePost.initialize()
                boardContainer.addChild(newMilePost.graphics)
                board[key] = newMilePost            
            }
        }
        this.setState({board})
        this.boardContainer = boardContainer
        this.app.stage.addChild(boardContainer)
    }

}