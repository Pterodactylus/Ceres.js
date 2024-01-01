

//Ceres Helper JS

export class Ceres {
	constructor() {
		this.loaded = false
		this.fxn = []
		this.lowerbound = []
		this.upperbound = []
		this.callback = []
		
		// Create example data to test float_multiply_array
		this.varLength = 0
		this.maxLength = 1000
		this.data = new Float64Array(this.maxLength);
		
		this.promise = new Promise(function(resolve, reject){
			CeresModule().then(function(Module){
				this.instance = new Module.Ceresjs

				// Get data byte size, allocate memory on Emscripten heap, and get pointer
				let nDataBytes = this.data.length * this.data.BYTES_PER_ELEMENT;
				let dataPtr = Module._malloc(nDataBytes);

				// Copy data to Emscripten heap (directly accessed from Module.HEAPU8)
				this.dataHeap = new Float64Array(Module.HEAPF64.buffer, dataPtr, nDataBytes);
				this.dataHeap.set(new Float64Array(this.data.buffer));
				this.loaded = true
				resolve()
			}.bind(this))
		}.bind(this))
	}
	// Method
	addFunction(fn) {
		this.fxn.push(fn)
	}
	addFunctions(functions) {
        functions.forEach(fn => this.addFunction(fn));
    }
	// Method
	addLowerbound(xNumber, lowerBound) {
		this.lowerbound.push([xNumber, lowerBound])
	}
	// Method
	addUpperbound(xNumber, upperBound) {
		this.upperbound.push([xNumber, upperBound])
	}
	// Method
	addCallback(fn) {
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
				let x = new Float64Array(this.dataHeap.buffer, this.dataHeap.byteOffset, this.varLength);
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
				let x = new Float64Array(this.dataHeap.buffer, this.dataHeap.byteOffset, this.varLength);
				return this.callback[i](x, evaluate_jacobians, new_evaluation_point);
			}
			this.instance.add_callback(newfunc.bind(this));
		}
	}
	// Method
	solve(xi, max_numb_iterations = 2000, parameter_tolerance = 1e-10, function_tolerance = 1e-16, gradient_tolerance = 1e-16, max_solver_time_in_seconds = 100, initial_trust_region_radius = 1e4, max_trust_region_radius = 1e16, max_num_consecutive_invalid_steps = 5) {
		if(this.loaded == true){
			//if(this.varLength <= this.maxLength ){this.varLength = this.fxn.length}
			if(this.varLength <= this.maxLength ){this.varLength = xi.length}
			else{throw "Max number of vars exceeded"}
			
			this.load_fxns()
			
			for(let i = 0; i < xi.length; i++){
				this.dataHeap[i] = xi[i];
			}
			this.instance.setup_x(this.dataHeap.byteOffset, this.varLength);
			let max_num_iterations = max_numb_iterations
			let parameter_tol = parameter_tolerance
			let function_tol = function_tolerance
			let gradient_tol = gradient_tolerance
			let success = this.instance.solve(max_num_iterations, parameter_tol, function_tol, gradient_tol, max_solver_time_in_seconds, initial_trust_region_radius, max_trust_region_radius, max_num_consecutive_invalid_steps);
			let report = this.instance.get_report();
			let message = this.instance.get_message();
			//console.log(report)
			let x = new Float64Array(this.dataHeap.buffer, this.dataHeap.byteOffset, this.varLength)
			let normalArray = [].slice.call(x);
			let txt = "";
			for(let i=0; i<normalArray.length; i++){
				txt = txt + "\n" + "x" + i + " = " + normalArray[i]
			}
			
			console.log(message)
			return { success: success, message: message, x: normalArray, report: report+txt}
		}
		else{
			console.log("Warning the Ceres.js wasm has not been loaded yet.")
		}
		
	}
	remove(){
		this.loaded == false;
		this.instance.delete();
	}

	parseFunctionFromJson(jsonFunction, variablesMapping) {
        let parsedFunction = jsonFunction;

        // Replace variables with their corresponding indexed representations
        Object.keys(variablesMapping).forEach((varName, index) => {
            let regex = new RegExp('\\b' + varName + '\\b', 'g');
            parsedFunction = parsedFunction.replace(regex, `x[${index}]`);
        });

        return new Function('x', `return ${parsedFunction}`);
    }

	sanitizeInput(input) {
        // Return input without any potentially harmful JavaScript string
        return input.replace(/[<>]/g, "");
    }

    setSystemFromJson(jsonSystem) {
        // sanitize the input to prevent injection attacks
        jsonSystem.functions = jsonSystem.functions.map(this.sanitizeInput);
        jsonSystem.callbacks = jsonSystem.callbacks.map(this.sanitizeInput);
    
        jsonSystem.functions.forEach(jsonFunction => this.addFunction(this.parseFunctionFromJson(jsonFunction, jsonSystem.variables)));
        
        jsonSystem.callbacks.forEach(callback => this.addCallback(callback));

        Object.keys(jsonSystem.variables).forEach((varName, index) => {
            let variable = jsonSystem.variables[varName];
            if (variable.lowerbound || variable.lowerbound === 0) {
                this.addLowerbound(index, variable.lowerbound);
            }
            if (variable.upperbound || variable.upperbound === 0) {
                this.addUpperbound(index, variable.upperbound);
            }
        });
    }

    generateInitialGuess(variablesMapping) {
        return Object.keys(variablesMapping).map(varName => variablesMapping[varName].guess);
    }

	run(jsonSystem, max_numb_iterations = 2000, parameter_tolerance = 1e-10, function_tolerance = 1e-16, gradient_tolerance = 1e-16, max_solver_time_in_seconds = 100, initial_trust_region_radius = 1e4, max_trust_region_radius = 1e16, max_num_consecutive_invalid_steps = 5) {
        this.setSystemFromJson(jsonSystem);
        let initial_guess = this.generateInitialGuess(jsonSystem.variables);
		this.solve(initial_guess, max_numb_iterations, parameter_tolerance, function_tolerance, gradient_tolerance, max_solver_time_in_seconds, initial_trust_region_radius, max_trust_region_radius, max_num_consecutive_invalid_steps);
	}
}

/*
class CeresGrad {
	constructor() {
		this.loaded = false
		this.fxn = []
		this.lowerbound = []
		this.upperbound = []
		this.callback = []
		
		// Create example data to test float_multiply_array
		this.varLength = 0
		this.maxLength = 1000
		this.data = new Float64Array(this.maxLength);
		
		this.promise = new Promise(function(resolve, reject){
			CeresModule().then(function(Module){
				this.instance = new Module.CeresjsGrad

				// Get data byte size, allocate memory on Emscripten heap, and get pointer
				let nDataBytes = this.data.length * this.data.BYTES_PER_ELEMENT;
				let dataPtr = Module._malloc(nDataBytes);

				// Copy data to Emscripten heap (directly accessed from Module.HEAPU8)
				this.dataHeap = new Float64Array(Module.HEAPF64.buffer, dataPtr, nDataBytes);
				this.dataHeap.set(new Float64Array(this.data.buffer));
				this.loaded = true
				resolve()
			}.bind(this))
		}.bind(this))
	}
	// Method
	add_function(fn) {
		this.fxn.push(fn)
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
				let x = new Float64Array(this.dataHeap.buffer, this.dataHeap.byteOffset, this.varLength);
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
				let x = new Float64Array(this.dataHeap.buffer, this.dataHeap.byteOffset, this.varLength);
				return this.callback[i](x, evaluate_jacobians, new_evaluation_point);
			}
			this.instance.add_callback(newfunc.bind(this));
		}
	}
	// Method
	solve(xi, max_numb_iterations = 2000, parameter_tolerance = 1e-10, function_tolerance = 1e-16, gradient_tolerance = 1e-16, max_solver_time_in_seconds = 100) {
		if(this.loaded == true){
			this.varLength = xi.length
			this.load_fxns()
			
			for(let i = 0; i < xi.length; i++){
				this.dataHeap[i] = xi[i];
			}
			this.instance.setup_x(this.dataHeap.byteOffset, this.varLength);
			
			let success = this.instance.solve(max_numb_iterations, parameter_tolerance, function_tolerance, gradient_tolerance, max_solver_time_in_seconds);
			let report = this.instance.get_report();
			let message = this.instance.get_message();
			
			let x = new Float64Array(this.dataHeap.buffer, this.dataHeap.byteOffset, this.varLength)
			let normalArray = [].slice.call(x);
			let txt = "";
			for(let i=0; i<normalArray.length; i++){
				txt = txt + "\n" + "x" + i + " = " + normalArray[i]
			}
			
			return { success: success, message: message, x: normalArray, report: report+txt}
		}
		else{
			console.log("Warning the Ceres.js wasm has not been loaded yet.")
		}
	}
	remove(){
	}
}
*/
