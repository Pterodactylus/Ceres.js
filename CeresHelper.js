

//Ceres Helper JS

export class Ceres {
	constructor() {
		this.loaded = false
		this.fxn = []
		this.lowerbound = []
		this.upperbound = []
		this.callback = []
		
		CeresModule().then(function(Module){
			
			this.instance = new Module.Ceresjs
			
			// Create example data to test float_multiply_array
			this.fxnLength = 0
			this.length = 0
			this.maxLength = 1000
			this.data = new Float64Array(this.maxLength);

			// Get data byte size, allocate memory on Emscripten heap, and get pointer
			let nDataBytes = this.data.length * this.data.BYTES_PER_ELEMENT;
			let dataPtr = Module._malloc(nDataBytes);

			// Copy data to Emscripten heap (directly accessed from Module.HEAPU8)
			this.dataHeap = new Float64Array(Module.HEAPF64.buffer, dataPtr, nDataBytes);
			this.dataHeap.set(new Float64Array(this.data.buffer));
			this.loaded = true
			this.then()
		}.bind(this))
	}
	then(fxnCall){
		fxnCall();
	}
	// Method
	add_function(fn) {
		this.fxn.push(fn)
		this.fxnLength = this.fxnLength + 1;
	}
	// Method
	add_lowerbound(xNumber, lowerBound) {
		this.lowerbound.push([xNumber, lowerBound])
	}
	// Method
	add_upperbound(xNumber, upperBound) {
		this.upperbound.push([xNumber, upperBound])
	}
	// Method
	add_callback(fn) {
		this.callback.push(fn)
	}
	reset(){
		this.instance.reset();
		this.fxn = []
		this.lowerbound = []
		this.upperbound = []
		this.callback = []
		
	}
	//Method
	load_fxns(){
		for(let i = 0; i < this.fxn.length; i++){
			let newfunc = function f(){
				let x = new Float64Array(this.dataHeap.buffer, this.dataHeap.byteOffset, this.length);
				return this.fxn[i](x)
			}
			this.instance.add_function(newfunc.bind(this));
		}
		for(let i = 0; i < this.lowerbound.length; i++){
			this.instance.add_lowerbound(this.lowerbound[i][0], this.lowerbound[i][1]);
		}
		for(let i = 0; i < this.upperbound.length; i++){
			this.instance.add_upperbound(this.upperbound[i][0], this.upperbound[i][1]);
		}
		for(let i = 0; i < this.callback.length; i++){
			let newfunc = function f(evaluate_jacobians, new_evaluation_point){
				let x = new Float64Array(this.dataHeap.buffer, this.dataHeap.byteOffset, this.length);
				return this.callback[i](x, evaluate_jacobians, new_evaluation_point);
			}
			this.instance.add_callback(newfunc.bind(this));
		}
	}
	// Method
	solve(xi, max_numb_iterations = 2000, parameter_tolerance = 1e-10, function_tolerance = 1e-16, gradient_tolerance = 1e-16) {
		if(this.loaded == true){
			this.load_fxns()
			if(this.length <= this.maxLength ){this.length = this.fxnLength}
			else{throw "Max number of vars exceeded"}
			
			for(let i = 0; i < xi.length; i++){
				this.dataHeap[i] = xi[i];
			}
			this.instance.setup_x(this.dataHeap.byteOffset, this.length);
			let max_num_iterations = max_numb_iterations
			let parameter_tol = parameter_tolerance
			let function_tol = function_tolerance
			let gradient_tol = gradient_tolerance
			let success = this.instance.solve(max_num_iterations, parameter_tol, function_tol, gradient_tol);
			let report = this.instance.get_report();
			let message = this.instance.get_message();
			//console.log(report)
			let x = new Float64Array(this.dataHeap.buffer, this.dataHeap.byteOffset, this.length)
			let normalArray = [].slice.call(x);
			let txt = "";
			for(let i=0; i<normalArray.length; i++){
				txt = txt + "\n" + "x" + i + " = " + normalArray[i]
			}
			this.instance.delete();
			return { success: success, message: message, x: normalArray, report: report+txt}
		}
		else{
			console.log("Warning the Ceres.js wasm has not been loaded yet.")
		}
		
	}
}








