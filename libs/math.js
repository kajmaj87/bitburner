export const findRoot = (f, eps = 0.001, min = 0, max = 1) => {
    var a = min, b = max, c = (a + b) / 2
    var error = f(c)
    if (!((f(a) > 0 && f(b) < 0) || (f(a) < 0 && f(b) > 0))) {
        throw Error(`Given function has the same signs at specified points, method cannot continue`)
    }
    while (Math.abs(error) > eps) {
        c = (a + b) / 2
        error = f(c)
        if (Math.sign(f(c)) == Math.sign(f(a))) {
            a = c
        } else {
            b = c
        }
    }
    return c;
}