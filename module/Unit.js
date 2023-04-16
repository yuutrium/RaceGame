class Radian {
    constructor(degree) {
        (typeof (degree) === 'number') ? this.degree = degree : this.degree = NaN;
    }
    toAngle() {
        return new Unit.Angle(this.degree * (180 / Math.PI));
    }
}
class Angle {
    constructor(degree) {
        (typeof (degree) === 'number') ? this.degree = degree : this.degree = NaN;
    }
    toRadian() {
        return new Unit.Radian(this.degree * Math.PI / 180)
    }
}
export{
    Radian,Angle
}