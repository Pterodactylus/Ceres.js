#!/bin/bash
cwd=$(pwd)

# Get the emsdk repo
git clone https://github.com/emscripten-core/emsdk.git

# Enter that directory
cd $cwd/emsdk

# Fetch the latest version of the emsdk (not needed the first time you clone)
git pull

# Download and install the latest SDK tools.
./emsdk install latest

# Make the "latest" SDK "active" for the current user. (writes ~/.emscripten file)
./emsdk activate latest

# Activate PATH and other environment variables in the current terminal
source ./emsdk_env.sh

mkdir $cwd/packages
cd $cwd/packages
git clone https://ceres-solver.googlesource.com/ceres-solver
git clone https://gitlab.com/libeigen/eigen.git

#rm -rf ~/ceres.js-master/buildpkg
mkdir $cwd/buildpkg

#rm -rf ~/ceres.js-master/installpkg
mkdir $cwd/installpkg


#rm -rf ~/ceres.js-master/buildpkg/glog
#mkdir ~/ceres.js-master/buildpkg/glog
#cd ~/ceres.js-master/buildpkg/glog
#~/emsdk/upstream/emscripten/emconfigure cmake ~/ceres.js-master/packages/glog -DCMAKE_INSTALL_PREFIX=~/ceres.js-master/installpkg
#~/emsdk/upstream/emscripten/emmake make
#make -j4 install

#rm -rf ~/ceres.js-master/buildpkg/eigen
mkdir $cwd/buildpkg/eigen
cd $cwd/buildpkg/eigen
$cwd/emsdk/upstream/emscripten/emconfigure cmake $cwd/packages/eigen -DCMAKE_INSTALL_PREFIX=$cwd/installpkg
$cwd/emsdk/upstream/emscripten/emmake make 
make -j4 install

#rm -rf ~/ceres.js-master/buildpkg/ceres-solver
mkdir $cwd/buildpkg/ceres-solver
cd $cwd/buildpkg/ceres-solver

#Turn Minilog On
#Turn sparse off
cp $cwd/CMakeListsCeres.txt $cwd/packages/ceres-solver/CMakeLists.txt
$cwd/emsdk/upstream/emscripten/emconfigure cmake $cwd/packages/ceres-solver -DCMAKE_INSTALL_PREFIX=$cwd/installpkg -DEigen3_DIR=$cwd/installpkg/share/eigen3/cmake
make -j4 install

#rm -rf ~/ceres.js-master/build
mkdir $cwd/build
cd $cwd/build
$cwd/emsdk/upstream/emscripten/emconfigure cmake $cwd/ -DCMAKE_INSTALL_PREFIX=$cwd/installpkg
$cwd/emsdk/upstream/emscripten/emmake make

cd $cwd/


#~/emsdk/upstream/emscripten/emrun --browser "explorer.exe" ~/ceres.js-master/index.html
#~/emsdk/upstream/emscripten/emrun --browser "explorer.exe" ~/ceres.js-master/test.html


