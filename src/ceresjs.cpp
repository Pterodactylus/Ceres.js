#include "ceres/ceres.h"
using ceres::DynamicNumericDiffCostFunction;
using ceres::CENTRAL;
using ceres::CostFunction;
using ceres::Problem;
using ceres::Solver;
using ceres::Solve;
#include <iostream>
#include <vector>
#include <emscripten/bind.h>
#include <emscripten/val.h>
using namespace emscripten;
typedef double (*func_t)(double const* const* );


class Ceresjs {
	std::vector<double> x;
	std::vector<double> xi;
	//std::vector<func_t> f
	std::vector<val> f;
	double* xArray;
	int xArrayLen;
	//vector<CostFunction*> functor;
	//vector<DynamicNumericDiffCostFunction<CostFunctor, CENTRAL>*> functor;
	int size = 0;
	std::vector<val> callbackFn;
	std::string report;
	std::string message;
	std::vector<int> lowerbound;
	std::vector<double> lowerboundValue;
	std::vector<int> upperbound;
	std::vector<double> upperboundValue;
	
  public:
    Ceresjs() {
		
	}
	void setup_x(int arrPtr, int length){
		this->xArray = reinterpret_cast<double*>(arrPtr);
		this->xArrayLen = length;
	}
	class CostFunctor {
		
		std::vector<val> f;
		double* xArray;
		int xArrayLen;
		
		public:
			CostFunctor(std::vector<val> fn, double* xArray, int xArrayLen){
				this->f = fn;
				this->xArray = xArray;
				this->xArrayLen = xArrayLen;
			}
			double call_js_function(int i, double const* const* x) const {
				for(int i=0; i<this->xArrayLen; i++){
					this->xArray[i] = x[0][i];
				}
				double retval = this->f[i]().as<double>();
				return retval;
			}
			bool operator()(double const* const* x, double* residual) const {
				for(int i=0; i<this->f.size(); i++){
					residual[i] = this->call_js_function(i, x);
				}
				return true;
			}
	};
	class CallbackFxn : public ceres::EvaluationCallback {
		std::vector<val> f;
		
		public:
			CallbackFxn(std::vector<val> fn){
				this->f = fn;
			}
			void PrepareForEvaluation(bool evaluate_jacobians, bool new_evaluation_point){
				for(int i=0; i<this->f.size(); i++){
					this->f[i](evaluate_jacobians, new_evaluation_point);
				} 
			}
	}; 
	void add_function(val fn){
		this->f.push_back (fn);
		this->x.push_back (0);
		this->xi.push_back (0);
		this->size++;
	}
	void add_callback(val fx){
		this->callbackFn.push_back(fx);
	}
	void add_lowerbound(int index, double value){
		this->lowerbound.push_back(index);
		this->lowerboundValue.push_back(value);
	}
	void add_upperbound(int index, double value){
		this->upperbound.push_back(index);
		this->upperboundValue.push_back(value);
	}
	bool solve(val max_num_iterations, val parameter_tolerance, val function_tolerance, val gradient_tolerance){
		
		std::stringstream buffer;
		std::streambuf * old = std::cout.rdbuf(buffer.rdbuf());
		
		std::stringstream Errbuffer;
		std::streambuf * Errold = std::cerr.rdbuf(Errbuffer.rdbuf());
		
		double x[this->size];
		double xi[this->size];
		
		for(int i=0; i<this->size; i++){
			xi[i] = this->xArray[i];
			x[i] = this->xArray[i];
		}
		
		Solver::Options options;
		options.parameter_tolerance = parameter_tolerance.as<double>();
		options.function_tolerance = function_tolerance.as<double>();
		options.gradient_tolerance = gradient_tolerance.as<double>();
		options.max_num_iterations = max_num_iterations.as<double>();
		options.minimizer_progress_to_stdout = true;
		
		options.update_state_every_iteration = true;
		CallbackFxn* callback = new CallbackFxn(this->callbackFn);
		Problem::Options poptions;
		poptions.evaluation_callback = callback;
		
		Problem problem = Problem(poptions);
		
		CostFunctor* cfunctor = new CostFunctor(this->f, this->xArray, this->xArrayLen);
		DynamicNumericDiffCostFunction<CostFunctor, CENTRAL>* functor = new DynamicNumericDiffCostFunction<CostFunctor, CENTRAL> (cfunctor);
		functor->AddParameterBlock(this->size);
		functor->SetNumResiduals(this->size);
		problem.AddResidualBlock(functor, NULL, x);
		
		for(int i=0; i<this->lowerbound.size(); i++){
			//problem.SetParameterLowerBound(&x[this->lowerbound[i]], this->lowerbound[i], this->lowerboundValue[i]);
			problem.SetParameterLowerBound(x, this->lowerbound[i], this->lowerboundValue[i]);
		}
		
		for(int i=0; i<this->upperbound.size(); i++){
			problem.SetParameterUpperBound(x, this->upperbound[i], this->upperboundValue[i]);
		}
		
		Solver::Summary summary;
		Solve(options, &problem, &summary);
		//std::cout << summary.BriefReport() << "\n"; 
		
		for(int i=0; i<this->xArrayLen; i++){
			this->xArray[i] = x[i];
		}

		std::string text2 = Errbuffer.str();
		this->report = buffer.str();
		this->report += summary.FullReport();
		this->message = summary.message;
		
		return summary.IsSolutionUsable();
	}
	std::string get_report(){
		return this->report;
	}
	std::string get_message(){
		return this->message;
	}
};


// Binding code
EMSCRIPTEN_BINDINGS(my_class_example) {
  class_<Ceresjs>("Ceresjs")
	.constructor()
	.function("setup_x", &Ceresjs::setup_x)
    .function("add_function", &Ceresjs::add_function)
	.function("add_callback", &Ceresjs::add_callback)
	.function("add_upperbound", &Ceresjs::add_upperbound)
	.function("add_lowerbound", &Ceresjs::add_lowerbound)
	.function("solve", &Ceresjs::solve)
	.function("get_report", &Ceresjs::get_report)
	.function("get_message", &Ceresjs::get_message)
    ;
}