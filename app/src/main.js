import {Ceres} from '../../Ceres-v2.0.0.mjs' //Always imported via ES6 import

let jsonSystem = {
    "variables": {
        "a": {
            "lowerbound": 1.6,
            "guess": 1,
        }, 
        "b": {
            "upperbound": 1.7,
            "guess": 2,
        },
    },
    "functions": [
        "a + 10 * b - 20",
        "Math.sqrt(5) * a - b * b"
    ],
    "callbacks": [
        "console.log(x)"
    ]
};

var solver = new Ceres();
solver.run(jsonSystem);