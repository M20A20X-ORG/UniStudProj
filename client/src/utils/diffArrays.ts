export type TGetPropCallback<T, R> = (elem: T) => R;
type TParam<T, I> = [T[], TGetPropCallback<T, I>?];

export const diffArrays = <X, I, Y>([arrX, getPropX]: TParam<X, I>, [arrY, getPropY]: TParam<Y, I>): X[] => {
    const requireFindCallback = (a: X) => (b: Y) => (getPropX ? getPropX(a) : a) === (getPropY ? getPropY(b) : b);
    return arrX.filter((a) => !arrY.find(requireFindCallback(a)));
};
