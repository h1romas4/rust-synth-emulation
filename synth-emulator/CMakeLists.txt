cmake_minimum_required(VERSION 3.0)
set(CMAKE_C_COMPILER "/usr/bin/clang" CACHE string "clang compiler" FORCE)
set(CMAKE_CXX_COMPILER "/usr/bin/clang++" CACHE string "clang++ compiler" FORCE)

include(./cmake/macros.cmake)
project(vgmplay C CXX)

header_directories(./src/c)

add_source_files(
    ./src/c/panning.c
    ./src/c/sn76489.c
    ./src/c/vgmplay.c
    ./src/c/ym3438.c
)

add_compile_flags(C
    -std=gnu11
    -g
)

set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ./bin)
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY ./bin)
set(CMAKE_ARCHIVE_OUTPUT_DIRECTORY ./bin)

add_executable(${PROJECT_NAME} ${SOURCE_FILES})

target_link_libraries(${PROJECT_NAME} m)
target_link_libraries(${PROJECT_NAME} gcc)
