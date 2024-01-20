#!/bin/bash
#sudo bash ./shortBuild.sh
#cd ~/Ceres.js
cwd=$(pwd)
bdir=$(pwd)/build

rm -r $bdir/Ceres.js
mkdir $bdir/Ceres.js
cd $bdir/Ceres.js

$bdir/emsdk/upstream/emscripten/emcmake cmake $cwd/ -DCMAKE_INSTALL_PREFIX=$bdir/installpkg
$bdir/emsdk/upstream/emscripten/emmake make
cat $cwd/evaluatex.min.js >> $bdir/Ceres.js/Ceres.js
cat $cwd/CeresHelper.js >> $bdir/Ceres.js/Ceres.js

cp --verbose $bdir/Ceres.js/Ceres.js $cwd/dist/ceres.js
#cp --verbose $bdir/Ceres.js/Ceres.wasm.map $cwd/Ceres.wasm.map

#~/emsdk/upstream/emscripten/emrun --browser "explorer.exe" ~/ceres.js-master/index.html
#$bdir/emsdk/upstream/emscripten/emrun --browser "explorer.exe" $cwd/docs/composite.html
