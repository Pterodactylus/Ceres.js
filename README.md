
# Ceres.js
Ceres.js is a javascript port of the Ceres solver. Ceres Solver is an open source C++ library ported to javascript with emscripten for modeling and solving large, complicated optimization problems. It can be used to solve Non-linear Least Squares problems with bounds constraints and general unconstrained optimization problems. It is a mature, feature rich, and performant library.

## Website
Visit our website at https://pterodactylus.github.io/Ceres.js/

## Installation
You can install Ceres.js by including the Ceres.js file in your HTML or js code. The best way to do this using the ES6 module system is:

```HTML
<script>
	async function ceresLoading() {
		const {Ceres} = await import('https://cdn.jsdelivr.net/gh/Pterodactylus/Ceres.js@master/dist/ceres.min.js');

		//Your Code Here
	}
	ceresLoading()
</script>
```

## Basic Example (New Syntax)
Recently in 2024 we have introduced a new syntax for the Ceres js engine.

```html
<script>

	async function ceresLoading() {
		const {Ceres} = await import('https://cdn.jsdelivr.net/gh/Pterodactylus/Ceres.js@master/dist/ceres.min.js');
		var solver = new Ceres();

		let jsonSystem = {
			"variables": {
				"a": {
					"lowerbound": -3,
					"guess": 1,
				}, 
				"b": {
					"upperbound": 5,
					"guess": 2,
				},
			},
			"functions": [
				"a + 10 * b - 20",
				"sqrt(5) * a - b * b"
			]
		};
		
		solver.run(jsonSystem);
	}

	ceresLoading()

</script>
```


## Basic Example (Old Syntax)
Ceres.js takes a vector of residual equations that are all equal to zero when the problem is solved. The equations can be non-linear. Here is a basic example.

```html
<script>
	async function ceresLoading() {
		const {Ceres} = await import('https://cdn.jsdelivr.net/gh/Pterodactylus/Ceres.js@master/dist/ceres.min.js'); //Always imported via ES6 import

		var fn1 = function f1(x){
			return (x[0]+10*x[1]-20); //this equation is of the form f1(x) = 0 
		}

		var fn2 = function f2(x){
			return (Math.sqrt(5)*x[0]-Math.pow(x[1], 2)); //this equation is of the form f2(x) = 0 
		}
		var c1 = function callback1(x, evaluate_jacobians, new_evaluation_point){
				console.log(x);
		}

		var solver = new Ceres();
		solver.addFunction(fn1) //Add the first equation to the solver.
		solver.addFunction(fn2) //Add the second equation to the solver.
		solver.addCallback(c1) //Add the callback to the solver.
		//solver.addLowerbound(0,1.6) //Add a lower bound to the x[0] variable
		//solver.addUpperbound(1,1.7) //Add a upper bound to the x[1] variable
		var x_guess = [1,2] //Guess the initial values of the solution.
		let s = await solver.solve(x_guess) //Solve the equation
		var x = s.x //assign the calculated solution array to the variable x
		console.log(s.report); //Print solver report
		solver.remove() //required to free the memory in C++
	}
	ceresLoading()
</script>
```

## More Examples
A full list of examples is avalible on our website https://pterodactylus.github.io/Ceres.js/

## Reference
The Ceres class starts an instance of the Ceres solver. It has 5 methods.

1. The `Ceres()` constructor method takes no inputs and creates a new Solver instance.
2. The `addFunction(fxn_handle)` method takes a function that has input of an array of numbers equal in length to the total number of functions. Each of the function should return a residule. The residuals returned should equal zero at the solution point i.e. F(x) = 0.
3. The `addCallback(callback_handle)` method takes a function that has input of an array of number equal in length to the total number of functions. This callback function is run every time before a function evaluation. You can use it to print intermediate results.
4. The `solve(initial_guesses, max_num_iterations = 2000, parameter_tolerance = 1e-10, function_tolerance = 1e-16, gradient_tolerance = 1e-16, max_solver_time_in_seconds = 100, initial_trust_region_radius = 1e4, max_trust_region_radius = 1e16, max_num_consecutive_invalid_steps = 5)` function requires an array `initial_guesses = [x1_init, x2_init, etc.. ]` that defines the solver starting point. This function returns an `x` solution array and a `report` variable with a full report of the solver output.
5. The `reset()` removes the loaded functions and allows new functions to be assigned to the same object.
