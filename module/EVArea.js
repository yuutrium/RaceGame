export class EventArea {
    constructor(element) {
        const drag = function (element, func = () => { }, options = {}) {
            let startPos = { clientX: null, clientY: null };
            let latestPos = { clientX: null, clientY: null };
            function mousedown(e) {
                element.removeEventListener('touchstart', touchstart);
                e.preventDefault();
                startPos.clientX = e.clientX;
                startPos.clientY = e.clientY;
                latestPos = Object.assign({}, startPos);
                document.addEventListener('mousemove', move);
                document.addEventListener('mouseup', mouseup);
            }
            function mouseup(e) {
                document.removeEventListener('mousemove', move);
                document.removeEventListener('mouseup', mouseup);
                element.addEventListener('touchstart', touchstart);
            };
            function touchstart(e) {
                element.removeEventListener('touchstart', touchstart);
                e.preventDefault();
                startPos.clientX = e.changedTouches[0].clientX;
                startPos.clientY = e.changedTouches[0].clientY;
                latestPos = Object.assign({}, startPos);
                element.addEventListener('touchmove', move);
                element.addEventListener('touchend', touchend);
            }
            function move(e) {
                if (typeof e.changedTouches !== 'undefined') {
                    let rangeArray = new Array(e.changedTouches.length);
                    for (let i = 0; i < e.changedTouches.length; i++) {
                        const range = Math.sqrt(Math.pow(latestPos.clientX - e.changedTouches[i].clientX, 2) + Math.pow(latestPos.clientY - e.changedTouches[i].clientY, 2));
                        rangeArray[i] = Math.abs(range);
                    }
                    const index = rangeArray.indexOf(Math.min(...rangeArray))
                    if (typeof e.changedTouches[index] === 'undefined') { index = 0 };
                    for (const Proname in e.changedTouches[index]) {
                        Object.defineProperty(e, Proname, {
                            value: e.changedTouches[index][Proname],
                        })
                    }
                }
                latestPos.clientX = e.clientX;
                latestPos.clientY = e.clientY;
                e.start = Object.assign({}, startPos);
                e.latest = Object.assign({}, latestPos);
                func(e);

            }
            function touchend(e) {
                element.removeEventListener('touchmove', move);
                element.removeEventListener('touchend', touchend);
                element.addEventListener('touchstart', touchstart);
            }
            return {
                add: () => {
                    element.addEventListener('touchstart', touchstart);
                    element.addEventListener('mousedown', mousedown);
                },
                remove: () => {
                    element.removeEventListener('touchstart', touchstart);
                    element.removeEventListener('mousedown', mousedown);
                }
            }
        }
        this.element = element;
        this.InfoMap = new Map([
            ['drag', { funcArray: new Array(), Listener: drag }],
            ['zoom', { funcArray: new Array(), Listener: undefined }],
            ['point', { funcArray: new Array(), Listener: undefined }],
        ]);
    }
    addListener(type, func, options = { movableArea: undefined }) {
        const EventMap = this.InfoMap.get(type);
        const EventMapListener = EventMap.Listener(this.element, func, options)
        EventMapListener.add();
        EventMap.funcArray.push([func, EventMapListener.remove]);

    }
    removeListener(type, func) {
        const EventMap = this.InfoMap.get(type);
        EventMap.funcArray.forEach(x => {
            if (x[0] === func) { x[1]() }
        })
    }
}


