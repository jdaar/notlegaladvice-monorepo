export class Objects {
	public static requireNonNull<T>(a: T){
		if (a != null && a != undefined) {
			return a
		}
		throw Error("null value not allowed");
	}

	public static isNull<T>(a: T){
		return a == null || a == undefined;
	}
}

