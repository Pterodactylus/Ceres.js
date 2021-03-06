cmake_minimum_required(VERSION 2.8.0)
#set(CMAKE_CXX_FLAGS -std=c++11)
set(CMAKE_CXX_STANDARD 17)
project(ceres-js)

set(Eigen3_DIR ${CMAKE_INSTALL_PREFIX}/share/eigen3/cmake)
#set(Ceres_DIR ~/ceres.js-master/installpkg/lib/cmake/Ceres)
#find_package(Ceres REQUIRED HINTS ${Ceres_DIR})
#include_directories(${CERES_INCLUDE_DIRS})



set(Ceres_DIR ${CMAKE_INSTALL_PREFIX}/lib/cmake/Ceres)
find_package(Ceres REQUIRED HINTS ${Ceres_DIR})
include_directories(${CERES_INCLUDE_DIRS})



add_executable(Ceres ${CMAKE_CURRENT_SOURCE_DIR}/src/ceresjs.cpp)
#add_executable(Test src/test.cpp)

target_link_libraries(Ceres ${CERES_LIBRARIES})
#target_link_libraries(Test ${CERES_LIBRARIES})

# set compiler and flags
SET(CMAKE_C_COMPILER emcc)
SET(CMAKE_CPP_COMPILER em++)
SET_TARGET_PROPERTIES(Ceres PROPERTIES LINK_FLAGS -g)
#string(CONCAT HELPERJS "" "")
#string(CONCAT HELPERJS "--post-js " "${CMAKE_CURRENT_SOURCE_DIR}/CeresHelper.js")
#set( CMAKE_CXX_FLAGS "-O3 -s --bind -s ASSERTIONS=1 -s MODULARIZE=1 -s EXPORT_NAME=Ceresjs -s SINGLE_FILE=1 ${HELPERJS}" )
set( CMAKE_CXX_FLAGS "-O3 -s --bind -s MODULARIZE=2 -s ALLOW_TABLE_GROWTH=1 -s EXPORT_NAME=CeresModule -s FILESYSTEM=0 -s SINGLE_FILE=1" )
#set( CMAKE_CXX_FLAGS "-O3 -s --bind -s ALLOW_TABLE_GROWTH=1 -s EXPORT_NAME=CeresModule -s FILESYSTEM=0 -s SINGLE_FILE=1 ${HELPERJS}" )
#set( CMAKE_CXX_FLAGS "-O3 -s --bind -s MODULARIZE=2 -s ALLOW_TABLE_GROWTH=1 -s EXPORT_NAME=CeresModule -s FILESYSTEM=0 -s SINGLE_FILE=1 ${HELPERJS}" )
#set( CMAKE_CXX_FLAGS "-O3 -s --bind -s ASSERTIONS=1 -s MODULARIZE=2 -s ALLOW_TABLE_GROWTH=1 -s EXPORT_NAME=CeresModule -s FILESYSTEM=0 -s SINGLE_FILE=1 ${HELPERJS}" )
#set( CMAKE_CXX_FLAGS "-O2 -s --bind -s ALLOW_TABLE_GROWTH=1 -s ASSERTIONS=1 -s SINGLE_FILE=1 ${HELPERJS}" )


#set( CMAKE_CXX_FLAGS "-O1 -g4 --source-map-base -s --bind -s ALLOW_TABLE_GROWTH=1 -s SINGLE_FILE=1 ${HELPERJS}" )