export const CreateParts={
    loader:class{
        constructor(position,size,){
            const loader = document.createElement('span');
            loader.classList.add('loader');
            loader.style.width = size;
            loader.style.height = size;
            this.bodyNode=loader;
        }
    },
    fullscreen:class{
        constructor(position='absolute'){
            const div = document.createElement('div')
            div.classList.add('fullscreen');
            this.bodyNode=div;
            addPosDetail(this.bodyNode,position);
        }
    },
    fullscreenLoader:class{
        constructor(positon='absolute',innerHTML={}){
            this.bodyNode= new CreateParts.fullscreen().bodyNode;
            this.bodyNode.classList.add('centering');
            this.loaderIcon=new CreateParts.loader().bodyNode;
            this.textArea=document.createElement('div');
            this.textArea.append(innerHTML.textArea);
            const inner=document.createDocumentFragment()
            inner.append(this.loaderIcon);
            inner.append(this.textArea);
            this.mainSection=document.createElement('div');
            this.mainSection.append(inner);
            this.bodyNode.appendChild(this.mainSection);
            addPosDetail(this.bodyNode,positon);
        }
    }
}
function addPosDetail(element, type, defaultValue = 'rerative') {
    switch (type) {
        case undefined:
            element.classList.add(defaultValue);
            break;
        case 'relative':
            element.classList.add('rerative');
            break;
        case 'absolute':
            element.classList.add('absolute');

    }
}