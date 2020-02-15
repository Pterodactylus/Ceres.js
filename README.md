![Test Image 4](https://travis-ci.com/Pterodactylus/Ceres.js.svg?branch=master)

# Ceres.js
Ceres.js is a javascript port of the Ceres solver. Ceres Solver is an open source C++ library ported to javascript with emscripten for modeling and solving large, complicated optimization problems. It can be used to solve Non-linear Least Squares problems with bounds constraints and general unconstrained optimization problems. It is a mature, feature rich, and performant library.

## Website
Visit our website at https://pterodactylus.github.io/Ceres.js/

## Installation
You can install Ceres.js by including the Ceres.js file in your HTML or js code.

```HTML
<script src="https://cdn.jsdelivr.net/gh/Pterodactylus/Ceres.js@master/Ceres.js"></script>
```

## Basic Example
Ceres.js takes a vector of residual equations that are all equal to zero when the problem is solved. The equations can be non-linear. Here is a basic example.

```javascript
var Module = {
	onRuntimeInitialized: function() { //Wait for the script to load

		var fn1 = function f1(x){
			return (x[0]+10*x[1]-20); //this equation is of the form f1(x) = 0 
		}

		var fn2 = function f2(x){
			return (Math.sqrt(5)*x[0]-Math.pow(x[1], 2)); //this equation is of the form f2(x) = 0 
		}

		let solver = new Ceres() //Create a new Ceres solver instance.
		solver.add_function(fn1) //Add the first equation to the solver.
		solver.add_function(fn2) //Add the second equation to the solver.
		var x_guess = [1,2] //Guess the initial values of the solution.
		var s = solver.solve(x_guess) //Solve the equation
		solver.remove() //required to free the memory in C++

		var x = s.x //assign the calculated solution array to the variable x
		
		console.log(s.report);

	}
};
```

## Reference
The Ceres class starts an instance of the Ceres solver. It has four methods.

1. The `Ceres()` constructor method takes no inputs and creates a new Solver instance.
2. The `add_function(fxn_handle)` method takes a function that has input of an array of number equal in length to the total number of functions. Each of the function should return a residule. The residuals returned should equal zero at the solution point i.e. F(x) = 0.
3. The `solve(initial_guesses, max_num_iterations = 2000, parameter_tolerance = 1e-10, function_tolerance = 1e-16, gradient_tolerance = 1e-16)` function requires an array `initial_guesses = [x1_init, x2_init, etc.. ]` that defines the solver starting point.
4. The `remove()` function clears the memory associated with the problem. Forgetting to call this funtion will result in memory leaks. Once this function is called the Ceres class cannot be used again.