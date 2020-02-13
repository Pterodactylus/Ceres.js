#include "ceresjs.cpp"
#include <math.h>
#include <emscripten/bind.h>
#include <emscripten/val.h>
using namespace emscripten;

double f1(double const* const*  x){
	return (x[0][0]+10*x[0][1]);
};

double f2(double const* const*  x){
	return (sqrt(5)*(x[0][2]-x[0][3]));
};

double f3(double const* const*  x){
	return pow(x[0][1]-2*x[0][2],2);
};

double f4(double const* const*  x){
	return sqrt(10)*pow(x[0][0]-x[0][3],2);
};

//int main(int argc, char** argv) {
/*int test() {
	
	Ceresjs s;
	s.add_function(f1);
	s.add_function(f2);
	s.add_function(f3);
	s.add_function(f4);
	double xi[4] = {1.0, 1.0, 1, 1};
	s.solve(xi);
	
	return 0;
}*/

/*double test2(int arrPtr, int length) {
	double* dArr = reinterpret_cast<double*>(arrPtr);
	std::cout << "Test 2:  " << arrPtr << "\n";
	std::cout << "Test 2:  " << dArr[0] << "\n";
	return 0;
}*/

//double test2(val func_js) {
double test2(val func_js) {
	
	double pi[4] = {1.0, 1.0, 1, 1};
	//val params =  pi;
	
	//val xParams = val::global("xParams");
	
	double retval = func_js(*pi).as<double>();
	//std::cout << "Test 2:  " << retval << "\n";
	return 0;
}


// Binding code
EMSCRIPTEN_BINDINGS(test_example) {
    //function("test", &test);
	function("test2", &test2);
}