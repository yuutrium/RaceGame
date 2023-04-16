class element {
    constructor({ tagName = 'div', position = 'auto', width, height, className} = {}) {
        if (typeof tagName !== 'string') { return; }
        const body = document.createElement(tagName);
        if(typeof width === 'number'||typeof width === 'string'){body.style.width = width;}
        if(typeof height === 'number'||typeof width === 'string'){body.style.height = height;}
        switch (position) {
            case 'relative':
                body.classList.add('rerative');
                break;
            case 'absolute':
                body.classList.add('absolute');
                break;
            default:
                break;
        }
        if(Array.isArray(className)){
            className.forEach((x) => {
                addClass(x)
            })
        }
        else{
            addClass(className);
        }
        function addClass(name) {
            if (typeof name === 'string'&&name.length > 0){
                body.classList.add(name);
            }
        }
        this.body = body;
    }
}
class loader extends element {
    constructor({ position = 'auto', width = 48, height = 48, className } = {}) {
        const classNameArray = ['loader'];
        super({
            tagName: 'span',
            position: position,
            width: width,
            height: height,
            className: classNameArray.concat(className)
        })
    }
}
class multiple extends element {
    constructor({ tagName = 'section', position = 'auto', width, height, className, child = { tagName: 'div', className },quantity = 2 } = {}) {
        const classNameArray = ['rerative'];
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
            section[i] = new element({
                tagName: child.tagName,
                position: 'rerative',
                className: child.className
            }).body
            body.appendChild(section[i]);
            
        }
        this.section = section
    }
}
class fullscreenLoader extends element {
    constructor({ tagName = 'section', position = 'absolute',className,child = { className,child:{className} } , innerHTML=''} = {}) {
        const classNameArray = ['centering'];
        super({
            tagName: tagName,
            position: position,
            width: '100%',
            height: '100vh',
            className: classNameArray.concat(className),
        })
        const body=this.body;
        const inner = new multiple({
            tagName: 'section',
            position: 'rerative',
            quantity: 2,
            className: child.className,
            child: {
                tagName: 'div',
                className:child.child.className
            }
        })
        const loderArea = inner.section[0];
        const textArea = inner.section[1];
        loderArea.appendChild(new loader().body)
        textArea.append(innerHTML);
        body.appendChild(inner.body);
    }
}
export {
    element, loader,multiple,fullscreenLoader
}
