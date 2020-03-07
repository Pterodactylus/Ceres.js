

//Ceres Helper JS

export class Ceres {
	constructor() {
		this.asyncFunctions = []
		this.loaded = new Promise(function(resolve,reject){
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
				
				resolve()
			}.bind(this))
		}.bind(this))
	}
	// Method
	async add_function(fn, upperBound = null, lowerBound = null) {
		this.asyncFunctions.push(new Promise(function(resolve,reject){
			await this.loaded
			let newfunc = function f(){
				let x = new Float64Array(this.dataHeap.buffer, this.dataHeap.byteOffset, this.length);
				return fn(x)
			}
			this.instance.add_function(newfunc.bind(this));
			this.fxnLength = this.fxnLength + 1;
			resolve()
		}.bind(this)))
	}
	// Method
	async add_lowerbound(xNumber, lowerBound) {
		this.asyncFunctions.push(new Promise(function(resolve,reject){
			await this.loaded
			this.instance.add_lowerbound(xNumber, lowerBound);
			resolve()
		}.bind(this)))
	}
	// Method
	async add_upperbound(xNumber, upperBound) {
		this.asyncFunctions.push(new Promise(function(resolve,reject){
			await this.loaded
			this.instance.add_upperbound(xNumber, upperBound);
			resolve()
		}.bind(this)))
	}
	// Method
	async add_callback(fn) {
		this.asyncFunctions.push(new Promise(function(resolve,reject){
			await this.loaded
			let newfunc = function f(evaluate_jacobians, new_evaluation_point){
				let x = new Float64Array(this.dataHeap.buffer, this.dataHeap.byteOffset, this.length);
				return fn(x, evaluate_jacobians, new_evaluation_point);
			}
			this.instance.add_callback(newfunc.bind(this));
			resolve()
		}.bind(this)))
	}
	
	// Method
	async solve(xi, max_numb_iterations = 2000, parameter_tolerance = 1e-10, function_tolerance = 1e-16, gradient_tolerance = 1e-16) {
		await this.loaded
		for (var i = 0; i < this.asyncFunctions.length; i++) {
			var result = await this.asyncFunctions[i];
			//console.log(result);
		}
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
		return { success: success, message: message, x: normalArray, report: report+txt}
		
	}
	async remove (){
		await this.loaded
		this.instance.delete();
	}
}








