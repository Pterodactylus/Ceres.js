#!/bin/bash
#cd ~/Ceres.js
cwd=$(pwd)
bdir=$(pwd)/build

echo $bdir
# Get the emsdk repo
git clone https://github.com/emscripten-core/emsdk.git $bdir/emsdk

# Enter that directory
cd $bdir/emsdk

# Fetch the latest version of the emsdk (not needed the first time you clone)
git pull

# Download and install the latest SDK tools.
$bdir/emsdk/upstream/emscripten/em++ -v || ./emsdk install latest

# Make the "latest" SDK "active" for the current user. (writes ~/.emscripten file)
./emsdk activate latest

# Activate PATH and other environment variables in the current terminal
source ./emsdk_env.sh

mkdir $bdir/packages
cd $bdir/packages
git clone -b "2.0.0" https://ceres-solver.googlesource.com/ceres-solver $bdir/packages/ceres-solver
git clone https://gitlab.com/libeigen/eigen.git $bdir/packages/eigen

#rm -rf ~/ceres.js-master/buildpkg
mkdir $bdir/buildpkg

#rm -rf ~/ceres.js-master/installpkg
mkdir $bdir/installpkg


#rm -rf ~/ceres.js-master/buildpkg/glog
#mkdir ~/ceres.js-master/buildpkg/glog
#cd ~/ceres.js-master/buildpkg/glog
#~/emsdk/upstream/emscripten/emconfigure cmake ~/ceres.js-master/packages/glog -DCMAKE_INSTALL_PREFIX=~/ceres.js-master/installpkg
#~/emsdk/upstream/emscripten/emmake make
#make -j4 install

#rm -rf ~/ceres.js-master/buildpkg/eigen
mkdir $bdir/buildpkg/eigen
cd $bdir/buildpkg/eigen
#$bdir/emsdk/upstream/emscripten/emconfigure cmake $bdir/packages/eigen -DCMAKE_INSTALL_PREFIX=$bdir/installpkg
$bdir/emsdk/upstream/emscripten/emcmake cmake $bdir/packages/eigen -DCMAKE_INSTALL_PREFIX=$bdir/installpkg
$bdir/emsdk/upstream/emscripten/emmake make 
make -j4 install

#rm -rf ~/ceres.js-master/buildpkg/ceres-solver
mkdir $bdir/buildpkg/ceres-solver
cd $bdir/buildpkg/ceres-solver

#Turn Minilog On
#Turn sparse off
cp --verbose $cwd/CMakeListsCeres.txt $bdir/packages/ceres-solver/CMakeLists.txt
#$bdir/emsdk/upstream/emscripten/emconfigure cmake $bdir/packages/ceres-solver -DCMAKE_INSTALL_PREFIX=$bdir/installpkg -DEigen3_DIR=$bdir/installpkg/share/eigen3/cmake
$bdir/emsdk/upstream/emscripten/emcmake cmake $bdir/packages/ceres-solver -DCMAKE_INSTALL_PREFIX=$bdir/installpkg -DEigen3_DIR=$bdir/installpkg/share/eigen3/cmake
make -j4 install

#rm -r $bdir/Ceres.js
mkdir $bdir/Ceres.js
cd $bdir/Ceres.js

#This line is returning an error due to problems with the ceres solver. The sed command is a workaround.
sed -i 's/include(CeresCodeGeneration)/# include(CeresCodeGeneration)/' $bdir/installpkg/lib/cmake/Ceres/CeresConfig.cmake
#$bdir/emsdk/upstream/emscripten/emconfigure cmake $cwd/ -DCMAKE_INSTALL_PREFIX=$bdir/installpkg
$bdir/emsdk/upstream/emscripten/emcmake cmake $cwd/ -DCMAKE_INSTALL_PREFIX=$bdir/installpkg
$bdir/emsdk/upstream/emscripten/emmake make
cp --verbose $bdir/Ceres.js/Ceres.js $cwd/Ceres-v1.5.1.js

#~/emsdk/upstream/emscripten/emrun --browser "explorer.exe" ~/ceres.js-master/index.html
#~/emsdk/upstream/emscripten/emrun --browser "explorer.exe" ~/ceres.js-master/test.html


