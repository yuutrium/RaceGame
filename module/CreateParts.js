const css = document.createElement("link");
css.setAttribute("rel", "stylesheet");
css.setAttribute("href", "module/css/CreateParts_style.css");
document.getElementsByTagName("head")[0].appendChild(css);
class element {
    constructor({ tagName = 'div', position = 'auto', width, height, className, mainInnerHTML } = {}) {
        const body = typeof tagName === 'string' ? document.createElement(tagName) : document.createElement('div');
        if (typeof width === 'number' || typeof width === 'string') { body.style.width = width; }
        if (typeof height === 'number' || typeof width === 'string') { body.style.height = height; }
        switch (position) {
            case 'relative':
                body.classList.add('crP-posOP-rerative');
                break;
            case 'absolute':
                body.classList.add('crP-posOP-absolute');
                break;
            default:
                break;
        }
        if (Array.isArray(className)) {
            className.forEach((x) => {
                addClass(x)
            })
        }
        else {
            addClass(className);
        }
        function addClass(name) {
            if (typeof name === 'string' && name.length > 0) {
                body.classList.add(name);
            }
        }
        this.body = body;
        this.mainInner = body;
        if (mainInnerHTML) {
            this.mainInner.append(mainInnerHTML);
        }
    }
    resize(width, height) {
        const body = this.body;
        if (typeof width === 'number' || typeof width === 'string') { body.style.width = width; }
        if (typeof height === 'number' || typeof width === 'string') { body.style.height = height; }
    }
    move(top, left) {
        const body = this.body;
        if (typeof top === 'number' || typeof top === 'string') { body.style.top = top; }
        if (typeof left === 'number' || typeof left === 'string') { body.style.left = left; }
    }
}
class loader extends element {
    constructor({ position = 'auto', width = 48, height = 48, className } = {}) {
        super({
            tagName: 'span',
            position: position,
            width: width,
            height: height,
            className: className
        })
        const root = this.body.attachShadow({
            mode: 'open'
        });
        root.innerHTML = `
        <style>
        :host {
            display: block;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            animation: rotate 1s linear infinite;
        }
        
        :host::before,
        :host::after {
            content: "";
            box-sizing: border-box;
            inset: 0px;
            position: absolute;
            border-radius: 50%;
            border: 5px solid #FFF;
            animation: prixClipFix 2s linear infinite;
        }
        
        :host::after {
            border-color: #00f8a5;
            animation: prixClipFix 2s linear infinite, rotate 0.5s linear infinite reverse;
            inset: 6px;
        }
        @keyframes rotate {
            0% {transform: rotate(0deg)}
            100% {transform: rotate(360deg)}
        }
        @keyframes prixClipFix {
            0% {clip-path: polygon(50% 50%, 0 0, 0 0, 0 0, 0 0, 0 0)}
            25% {clip-path: polygon(50% 50%, 0 0, 100% 0, 100% 0, 100% 0, 100% 0)}
            50% {clip-path: polygon(50% 50%, 0 0, 100% 0, 100% 100%, 100% 100%, 100% 100%)}
            75% {clip-path: polygon(50% 50%, 0 0, 100% 0, 100% 100%, 0 100%, 0 100%)}
            100% { clip-path: polygon(50% 50%, 0 0, 100% 0, 100% 100%, 0 100%, 0 0)}
        }
        </style>
        `;
    }
}
class multiple extends element {
    constructor({
        tagName = 'section',
        position = 'auto',
        width, height, className,
        child = {
            tagName: 'div',
            className,
            position: 'auto',
            width, height,
        },
        quantity = 2
    } = {}) {
        const classNameArray = ['crP-posOP-rerative'];
        super({
            tagName: tagName,
            position: position,
            width: width,
            height: height,
            className: classNameArray.concat(className),
        })
        const body = this.body;
        const section = new Array(quantity);
        for (let i = 0; i < quantity; i++) {
            section[i] = new element(child).body
            body.appendChild(section[i]);
        }
        this.mainInner=section;
    }
}
class fullscreenLoader extends element {
    constructor({
        tagName = 'section',
        position = 'absolute',
        className,
        child = {
            className,
            tagName: 'section',
            position: 'rerative',
            width, height,
            child: {
                className,
                tagName: 'div',
                position: 'auto',
                width, height,
            }
        },
        mainInnerHTML='',
    } = {}) {
        const classNameArray = ['crP-posOP-centering'];
        super({
            tagName: tagName,
            position: position,
            width: '100%',
            height: '100vh',
            className: classNameArray.concat(className),
        })
        this.move(0,0);
        const body = this.body;
        const inner = new multiple(
            Object.assign({quantity:2,},child)
        )
        const loderArea = inner.mainInner[0];
        const textArea = inner.mainInner[1];
        loderArea.appendChild(new loader().body)
        textArea.append(mainInnerHTML);
        body.appendChild(inner.body);
        this.mainInner=textArea;
    }
}
export {
    element, loader, multiple, fullscreenLoader
}
