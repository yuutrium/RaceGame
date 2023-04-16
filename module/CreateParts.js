export const CreateParts = {
    loader: class {
        constructor({ position = 'rerative', size = 48, addclass = '' }={}) {
            const loader = document.createElement('span');
            loader.classList.add('loader');
            loader.style.width = size;
            loader.style.height = size;
            addClass(loader, addclass);
            addPosDetail(loader, position,);
            this.bodyNode = loader;
        }
    },
    fullscreen: class {
        constructor({ position = 'absolute', addclass = '' }={}) {
            const div = document.createElement('div')
            div.classList.add('fullscreen');
            addClass(div, addclass);
            addPosDetail(div, position);
            this.bodyNode = div;
        }
    },
    fullscreenLoader: class {
        constructor({ position = 'absolute', innerHTML = "", addclass = '',ColorStyle='black'}={}) {
            //2カラムのインナー作成
            const inner = new CreateParts.Division({ divisionCount: 2, addclass: 'centering' })
            //1カラム目,2カラム目にアイコン,ノードを追加
            const loderArea = inner.mainSection[0];
            const textArea = inner.mainSection[1];
            const mainSection=inner.bodyNode;
            loderArea.appendChild(new CreateParts.loader().bodyNode);
            textArea.append(innerHTML)
            //全画面のdiv作成
            const body = new CreateParts.fullscreen({ addclass: 'centering' }).bodyNode;
            //全画面のdivに子ノードとして追加
            body.appendChild(mainSection);
            addClass(body, addclass);
            addPosDetail(body, position);
            this.bodyNode = body;
            this.mainSection = mainSection;
            this.TextArea = textArea;
            this.addColorStyle(ColorStyle);
        }
        addColorStyle(type) {
            switch (type) {
                case 'black':
                    this.TextArea.classList.add('white', 'title');
                    this.bodyNode.classList.add('bac-black');
                    break;
                case 'white':
                    this.TextArea.classList.add('black', 'title');
                    this.bodyNode.classList.add('bac-white');
            }
        }
    },
    Division: class {
        constructor({ position = 'rerative', divisionCount = 2, addclass = '' }={}) {
            const pearent = document.createElement('div')
            this.mainSection = new Array(divisionCount);
            for (let i = 0; i < divisionCount; i++) {
                this.mainSection[i] = document.createElement('div')
                pearent.appendChild(this.mainSection[i]);
            }
            addClass(pearent, addclass);
            addPosDetail(pearent, position);
            this.bodyNode = pearent
        }
    }
}
function addPosDetail(element, type) {
    switch (type) {
        case 'relative':
            element.classList.add('rerative');
            break;
        case 'absolute':
            element.classList.add('absolute');
            break;
        default:
            element.classList.add('rerative');

    }
}
function addClass(element, addedClass='') {
    if (typeof addedClass === 'string') {
        if(addedClass.length>0){
            element.classList.add(addedClass);
        }
    }
    else if (Array.isArray(addedClass)) {
        addedClass.forEach((x) => {
            element.classList.add(x)
        })
    }
}
const _CreateParts={
    element:class{
        constructor({tagName='div',position='rerative',width,height,classname}){
            const body=document.createElement(tagName);
            if(typeof width==='number'){body.style.width=width;}
            if(typeof height==='number'){body.style.height=height;}
            switch (position) {
                case 'relative':
                    body.classList.add('rerative');
                    break;
                case 'absolute':
                    body.classList.add('absolute');
                    break;
                default:
                    body.classList.add('rerative');
            }
            if (typeof classname === 'string') {
                addClass(classname);
            }
            else if (Array.isArray(classname)) {
                classname.forEach((x) => {
                    addClass(x)
                })
            }
            function addClass(name){
                if(name.length>0){
                    body.classList.add(name);
                }
            }
            this.body=body;
        }
    },
    loader:class extends _CreateParts.element{
        constructor(){

        }
    }

}
