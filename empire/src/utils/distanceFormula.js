const distanceFormula = function(x1,x2,y1,y2){
    // const dist = Math.sqrt(Math.pow((x1-x2),2) + Math.pow((y1-y2),2))
    const xSpacing = Math.floor(Math.sqrt(3)*17)
    const ySpacing = 17
    // const dist = Math.abs((x1-x2)) + Math.abs((y1-y2))
    // let dist
    const dx = Math.abs(x1-x2)
    let dy = Math.abs(y1-y2)
    
    const diag_horizontal_dist = xSpacing/2
    const diag_vertical_dist = ySpacing
    const vert_vertical_dist = 2*ySpacing
    let numMoves = 0
    numMoves = Math.round(dx/diag_horizontal_dist)
    let vd = numMoves * diag_vertical_dist
    if(vd > dy){
        return numMoves
    }else{
        dy = dy - vd
        numMoves+= Math.round(dy/vert_vertical_dist)
        return numMoves
    }
}

export default distanceFormula