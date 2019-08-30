function calculatePositions(parentWidth, parentHeight){
    let side = Math.min(parentWidth, parentHeight),
    str = "M" + ((side + (parentWidth - side)) / 2) + "," + (parentHeight - side) / 2,
    ax = 0.15, 
    bx = (1 - 2 * ax)/2, 
    cx = 0.3,
    dx = 0.5, 
    ay = 0.3, by = 0.25, 
    cy = (1 - ay - by), 
    dy = 0.3;
    str += " l" + (ax * side) + "," + (ay * side);
    str += " h" + (bx * side);
    str += " l-" + (cx * side) + "," + (by * side);
    str += " l" + (cx * side) + "," + (cy * side);
    str += " l-" + (dx * side) + ",-" + (dy * side);
    str += " l-" + (dx * side) + "," + (dy * side);
    str += " l" + (cx * side) + ",-" + (cy * side);
    str += " l-" + (cx * side) + ",-" + (by * side);
    str += " h" + (bx * side);
    str += " z"; 
    return str;
}

function createStar(parentElement, width, height, styles){
    let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"),
    star = document.createElementNS("http://www.w3.org/2000/svg", "path"),
    styleStr = '';
    svg.setAttribute("height", height);
    svg.setAttribute("width", width);
    star.setAttribute("d", calculatePositions(width, height));
    for(let attrib in styles){
        styleStr += attrib + ':' + styles[attrib] + ';';
    }
    star.setAttribute("style", styleStr);
    svg.appendChild(star);
    parentElement.appendChild(svg);
}