# Ceres.js
Ceres.js is a javascript port of the Ceres solver. Ceres Solver is an open source C++ library ported to javascript with emscripten for modeling and solving large, complicated optimization problems. It can be used to solve Non-linear Least Squares problems with bounds constraints and general unconstrained optimization problems. It is a mature, feature rich, and performant library.
![Test Image 4](https://travis-ci.com/Pterodactylus/Ceres.js.svg?branch=master)

## Website
Visit our website at https://pterodactylus.github.io/Ceres.js/

## Installation
You can install Ceres.js by including the Ceres.js file in your HTML or js code.

```HTML
<script src="https://cdn.jsdelivr.net/gh/Pterodactylus/Ceres.js@master/build/Ceres.js"></script>
```

## Basic Example
Ceres.js takes a vector of residual equations that are all equal to zero when the problem is solved. The equations can be non-linear. Here is a basic example.

```javascript
var Module = {
	onRuntimeInitialized: function() { //Wait for the script to load

		var fn1 = function f1(x){
			return (x[0]+10*x[1]-20); //this equation is of the for f1(x) = 0 
		}

		var fn2 = function f2(x){
			return (Math.sqrt(5)*x[0]-Math.pow(x[1], 2)); //this equation is of the for f2(x) = 0 
		}

		let solver = new Ceres() //Create a new Ceres solver instance.
		solver.add_function(fn1) //Add the first equation to the solver.
		solver.add_function(fn2) //Add the second equation to the solver.
		var x_guess = [1,2] //Guess the initial values of the solution.
		var s = solver.solve(x_guess) //Solve the equation
		solver.remove() //required to free the memory in C++

		var x = s.x
		
		console.log(s.report);

	}
};
```