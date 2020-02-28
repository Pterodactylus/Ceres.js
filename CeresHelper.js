class Ceres {
	constructor() {
		this.instance = new Module.Ceresjs();
		
		// Create example data to test float_multiply_array
		this.fxnLength = 0
		this.length = 0
		this.maxLength = 1000
		this.data = new Float64Array(this.maxLength);

		// Get data byte size, allocate memory on Emscripten heap, and get pointer
		var nDataBytes = this.data.length * this.data.BYTES_PER_ELEMENT;
		var dataPtr = Module._malloc(nDataBytes);

		// Copy data to Emscripten heap (directly accessed from Module.HEAPU8)
		this.dataHeap = new Float64Array(Module.HEAPF64.buffer, dataPtr, nDataBytes);
		this.dataHeap.set(new Float64Array(this.data.buffer));
	  
	}
	// Method
	add_function(fn) {
		let newfunc = function f(){
			var x = new Float64Array(this.dataHeap.buffer, this.dataHeap.byteOffset, this.length);
			return fn(x)
		}
		this.instance.add_function(newfunc.bind(this));
		this.fxnLength = this.fxnLength + 1
	}
	// Method
	add_callback(fn) {
		let newfunc = function f(){
			var x = new Float64Array(this.dataHeap.buffer, this.dataHeap.byteOffset, this.length);
			return fn(x)
		}
		this.instance.add_callback(newfunc.bind(this));
	}
	// Method
	solve(xi, max_num_iterations = 2000, parameter_tolerance = 1e-10, function_tolerance = 1e-16, gradient_tolerance = 1e-16) {
		
		if(this.length <= this.maxLength ){this.length = this.fxnLength}
		else{throw "Max number of vars exceeded"}
		
		for(let i = 0; i < xi.length; i++){
			this.dataHeap[i] = xi[i];
		}
		this.instance.setup_x(this.dataHeap.byteOffset, this.length);
		var max_num_iterations = max_num_iterations
		var parameter_tolerance = parameter_tolerance
		var function_tolerance = function_tolerance
		var gradient_tolerance = gradient_tolerance
		var success = this.instance.solve(max_num_iterations, parameter_tolerance, function_tolerance, gradient_tolerance);
		var report = this.instance.get_report();
		var message = this.instance.get_message();
		//console.log(report)
		var x = new Float64Array(this.dataHeap.buffer, this.dataHeap.byteOffset, this.length)
		var normalArray = [].slice.call(x);
		var txt = "";
		for(let i=0; i<normalArray.length; i++){
			txt = txt + "\n" + "x" + i + " = " + normalArray[i]
		}
		return { success: success, message: message, x: normalArray, report: report+txt}
		
	}
	remove (){
		this.instance.delete();
	}
}











