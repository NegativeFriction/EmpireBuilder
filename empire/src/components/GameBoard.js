import React from 'react'
import * as PIXI from 'pixi.js'
import {ContextMenu, MenuItem, ContextMenuTrigger} from 'react-contextmenu'
import Mountain from './../Classes/Mountain'

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
            sharedTicker: true
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
            console.log("I have",this.state.startPoint,this.state.endPoint)
            console.log(this.state.board[this.state.startPoint],this.state.board[this.state.endPoint])
        }
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
                newMilePost = new Mountain(xCoord,yCoord,xSpacing,this.clickCallback.bind(this))
                newMilePost.initialize()
                boardContainer.addChild(newMilePost.graphics)
                board[key] = newMilePost            
            }
        }
        this.setState({board})
        this.app.stage.addChild(boardContainer)
    }

}