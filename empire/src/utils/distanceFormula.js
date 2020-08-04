const distanceFormula = function(x1,x2,y1,y2){
    const dist = Math.pow(x1-x2,2) + Math.pow(y1-y2,2)
    return dist
}

export default distanceFormula