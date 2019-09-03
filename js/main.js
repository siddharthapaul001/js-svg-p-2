var N = 5,
    allowedStyles = [
        {
            "styleName": "stroke-width",
            "regex": /\d+(px)*$/g,
            "err": "stroke-width value unit must be in pixels."
        },
        {
            "styleName": "stroke",
            "regex": /(^#[A-Fa-f0-9]{6}|^#[A-Fa-f0-9]{3}|none)$/g,
            "err": "Only hex color code and none value is supported.",
            default: {
                'rated': 'none',
                'nonrated': 'none'
            }
        },
        {
            "styleName": "fill",
            "regex": /(^#[A-Fa-f0-9]{6}|^#[A-Fa-f0-9]{3}|none)$/g,
            "err": "Only hex color code and none value is supported.",
            default: {
                'rated': '#ff0',
                'nonrated': '#ddd'
            }
        }
    ],
    customAttributes = [
        {
            "styleName": "justify-content",
            "regex": /^(streach|center)$/g,
            "err": "justify-content allowes only streach or center"
        },
        {
            "styleName": "direction",
            "regex": /^(row|column)$/g,
            "err": "direction can be either row or column."
        }
    ];

function calculatePositions(parentWidth, parentHeight, strokeWidth, unit, xShift = 0, yShift = 0, direction = 'row') {
    if (unit == '%') {
        //strokeWidth = Math.min(parentWidth, parentHeight) * (strokeWidth / 25);
        console.error('Must provide stroke width in pixels');
        return;
    }
    let h = direction == 'row' ? parentWidth / N : parentWidth;
    let w = direction == 'column' ? parentHeight / N : parentHeight;
    let side = Math.min(h, w) - Math.max(strokeWidth * 4, 4),
        str = "M" + (xShift + (parentWidth / 2)) + "," + (yShift + (parentHeight - side) / 2),
        ax = 0.15,
        bx = (1 - 2 * ax) / 2,
        cx = 0.3,
        dx = 0.5,
        ex = 0.3,
        ay = 0.3, by = 0.3,
        cy = (1 - ay - by),
        dy = 0.25,
        am = ax / ay;
    cx = (am * cy);
    ex = ex * am;
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

function pluckSize(size) {
    let num = (size + '').match(/\d+/g),
        unit = (size + '').match(/px|%|vh|vw/g) || [''];
    if (!num) {
        console.error("error in size value");
        return;
    }
    return {
        num: +num[0],
        unit: unit[0]
    };
}

function isFraction(num) {
    return !(Math.abs(num - Math.floor(num)) < Number.EPSILON);
}


function createStar(parentElement, width = 0, height = 0, rating, N, styles = {}) {
    let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"),
        stars = [],
        styleStr = { 'rated': '', 'nonrated': '', 'partial': '' },
        xShift = 0, yShift = 0,
        direction = styles['direction'],
        strokeWidth = styles["stroke-width"] ? pluckSize(styles["stroke-width"]) : 0;

    if (!(parentElement instanceof HTMLElement)) {
        console.error("First argument must be a html element");
        return;
    }

    if (isNaN(+N)) {
        console.error("Number of stars must be in numeric value");
        return;
    }
    if (!strokeWidth.num) {
        strokeWidth = {
            "num": 0,
            "unit": ''
        }
    }
    if (strokeWidth.num > 0 && isFraction(rating)) {
        console.warn("Stroke can result incorrect visualization of fractional rating");
    }

    if (!styles['rated']) {
        styles['rated'] = {};
    }
    if (!styles['nonrated']) {
        styles['nonrated'] = {};
    }
    styles['rated']['stroke-width'] = strokeWidth.num + strokeWidth.unit;
    styles['nonrated']['stroke-width'] = strokeWidth.num + strokeWidth.unit;
    globalThis.N = +N;
    rating = +rating;

    if (N <= 0) {
        console.error('N must be a positive number > 0');
        return;
    }

    if (isNaN(rating)) {
        console.error('Expecting rating as number');
        return;
    }
    if (rating > N || rating < 0) {
        console.error("rating must be a positive number less than or equals to number of stars");
        return;
    }

    for (let i = 0; i < N; i++) {
        stars.push(document.createElementNS("http://www.w3.org/2000/svg", "path"));
    }

    if(!pluckSize(height) || !pluckSize(width)){
        console.error("Put the height width correctly.");
        return;
    }

    svg.setAttribute("height", height);
    svg.setAttribute("width", width);
    parentElement.appendChild(svg);

    for (let i in customAttributes) {
        if (styles.hasOwnProperty(customAttributes[i].styleName)) {
            if (!styles[customAttributes[i].styleName].match(customAttributes[i].regex)) {
                console.error(customAttributes[i].err);
                return;
            }
        }
    }


    if (direction == 'row') {
        if (strokeWidth.num > Math.min(svg.clientWidth / (10 * N), svg.clientHeight / 10)) {
            console.error("Incorrect value of stroke width");
            return;
        }
    } else if (direction == 'column') {
        if (strokeWidth.num > Math.min(svg.clientHeight / (10 * N), svg.clientWidth / 10)) {
            console.error("Incorrect value of stroke width");
            return;
        }
    }

    //create definitions
    if (isFraction(rating)) {
        let defs = document.createElementNS("http://www.w3.org/2000/svg", "defs"),
            linearGradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient"),
            RatedStart = document.createElementNS("http://www.w3.org/2000/svg", "stop"),
            RatedEnd = document.createElementNS("http://www.w3.org/2000/svg", "stop"),
            NonRatedStart = document.createElementNS("http://www.w3.org/2000/svg", "stop"),
            NonRatedEnd = document.createElementNS("http://www.w3.org/2000/svg", "stop"),
            ratedFill = allowedStyles[2].default['rated'],
            nonratedFill = allowedStyles[2].default['nonrated'];

        if (styles['rated'] && styles['rated'].hasOwnProperty('fill')) {
            if (styles['rated']['fill'].match(allowedStyles[2].regex)) {
                ratedFill = styles['rated']['fill'];
            } else {
                console.error(allowedStyles[i].err);
                return;
            }
        }
        if (styles['nonrated'] && styles['nonrated'].hasOwnProperty('fill')) {
            if (styles['nonrated']['fill'].match(allowedStyles[2].regex)) {
                nonratedFill = styles['nonrated']['fill'];
            } else {
                console.error(allowedStyles[i].err);
                return;
            }
        }

        linearGradient.setAttribute("id", "partial-fill");
        linearGradient.setAttribute("x1", "0%");
        if (direction == 'row') {
            linearGradient.setAttribute("x2", "100%");
        } else if (direction == 'column') {
            linearGradient.setAttribute("x2", "0%");
        }
        linearGradient.setAttribute("y1", "0%");
        if (direction == 'column') {
            linearGradient.setAttribute("y2", "100%");
        } else if (direction == 'row') {
            linearGradient.setAttribute("y2", "0%");
        }

        RatedStart.setAttribute("offset", "0%");
        RatedEnd.setAttribute("offset", ((rating - Math.floor(rating)).toFixed(2) * 100) + "%");
        NonRatedStart.setAttribute("offset", ((rating - Math.floor(rating)).toFixed(2) * 100) + "%");
        NonRatedEnd.setAttribute("offset", "100%");
        RatedStart.setAttribute("style", "stop-color:" + ratedFill + ";stop-opacity:1;");
        RatedEnd.setAttribute("style", "stop-color:" + ratedFill + ";stop-opacity:1;");
        NonRatedStart.setAttribute("style", "stop-color:" + nonratedFill + ";stop-opacity:1;");
        NonRatedEnd.setAttribute("style", "stop-color:" + nonratedFill + ";stop-opacity:1;");

        linearGradient.appendChild(RatedStart);
        linearGradient.appendChild(RatedEnd);
        linearGradient.appendChild(NonRatedStart);
        linearGradient.appendChild(NonRatedEnd);
        defs.appendChild(linearGradient);
        svg.appendChild(defs);
    }



    if (direction == 'row') {
        if (N > svg.clientWidth / (2 * N)) {
            console.error("Reduce number of stars.");
            return;
        }
    } else if (direction == 'column') {
        if (N > svg.clientHeight / (2 * N)) {
            console.error("Reduce number of stars.");
            return;
        }
    }

    if (direction == 'row') {
        if (styles["justify-content"] == "streach") {
            xShift = svg.clientWidth / N;
        } else {
            xShift = Math.min(svg.clientWidth / N, svg.clientHeight);
        }
    } else if (direction == 'column') {
        if (styles["justify-content"] == "streach") {
            yShift = svg.clientHeight / N;
        } else {
            // if(styles["justify-content"] == "center")
            yShift = Math.min(svg.clientHeight / N, svg.clientWidth);
        }
    } else {
        console.error('Must provide a direction value either row or column');
        return;
    }

    for (let i = 0; i < stars.length; i++) {
        if (N % 2 == 0) {
            stars[i].setAttribute("d", calculatePositions(svg.clientWidth, svg.clientHeight, strokeWidth.num, strokeWidth.unit, xShift * (i - (Math.floor(N / 2)) + 0.5), yShift * (i - (Math.floor(N / 2)) + 0.5), direction));
        } else {
            stars[i].setAttribute("d", calculatePositions(svg.clientWidth, svg.clientHeight, strokeWidth.num, strokeWidth.unit, xShift * (i - (Math.floor(N / 2))), yShift * (i - (Math.floor(N / 2))), direction));
        }
    }

    for (let i in allowedStyles) {
        if (styles['rated'] && styles['rated'].hasOwnProperty(allowedStyles[i].styleName)) {
            if (styles['rated'][allowedStyles[i].styleName].match(allowedStyles[i].regex)) {
                styleStr['rated'] += allowedStyles[i].styleName + ':' + styles['rated'][allowedStyles[i].styleName] + ';';
                styleStr['partial'] += allowedStyles[i].styleName == 'fill' ? '' : allowedStyles[i].styleName + ':' + styles['rated'][allowedStyles[i].styleName] + ';';
            } else {
                console.error(allowedStyles[i].err);
                return;
            }
        } else if (allowedStyles[i].hasOwnProperty('default')) {
            styleStr['rated'] += allowedStyles[i].styleName + ':' + allowedStyles[i].default['rated'] + ';';
        }
        if (styles['nonrated'] && styles['nonrated'].hasOwnProperty(allowedStyles[i].styleName)) {
            if (styles['nonrated'][allowedStyles[i].styleName].match(allowedStyles[i].regex)) {
                styleStr['nonrated'] += allowedStyles[i].styleName + ':' + styles['nonrated'][allowedStyles[i].styleName] + ';';
            } else {
                console.error(allowedStyles[i].err);
                return;
            }
        } else if (allowedStyles[i].hasOwnProperty('default')) {
            styleStr['nonrated'] += allowedStyles[i].styleName + ':' + allowedStyles[i].default['nonrated'] + ';';
        }
    }
    for (let i = 0; i < stars.length; i++) {
        if (isFraction(rating) && Math.ceil(rating) == i + 1) {
            stars[i].setAttribute("fill", "url(#partial-fill)");
            stars[i].setAttribute("style", styleStr['partial']);
        } else {
            stars[i].setAttribute("style", i < Math.ceil(rating) ? styleStr['rated'] : styleStr['nonrated']);
        }
        svg.appendChild(stars[i]);
    }
    parentElement.appendChild(svg);
}