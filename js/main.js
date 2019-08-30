class SVGElement {
    constructor(){
        this.attributes = {}
    }
    getMe(tagName){
        let elem = document.createElementNS("http://www.w3.org/2000/svg", tagName);
        for(let attributeName in this.attributes){
            if(Array.isArray(this.attributes)){
                elem.setAttribute(attributeName, this.attributes[attributeName].map(point => point.trim()).join(" "));
            }else{
                elem.setAttribute(attributeName, this.attributes[attributeName]);
            }
        }
        return elem;
    }
}

class Star extends SVGAElement{
    constructor(){
        super();
        this.attributes = {
            d: [
                "M25,25",
                "l20,0"
            ]
        }
    }

    getElement(){
        return getMe("path");
    }
}