cmake_minimum_required(VERSION 3.20)
project(ObjectivePaperclips VERSION 1.0.0 LANGUAGES C CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Options
option(BUILD_TESTS "Build validation tests" ON)

# Include directories
include_directories(
    ${CMAKE_CURRENT_SOURCE_DIR}/engine/include
    ${CMAKE_CURRENT_SOURCE_DIR}/game
)

# Engine Source Files
set(ENGINE_SOURCES
    engine/src/OmniAudio.cpp
)

# Game Source Files
set(GAME_SOURCES
    game/GameMain.cpp
)

# Check for platform
if (WIN32)
    add_compile_definitions(OMNI_PLATFORM_WINDOWS)
elseif (APPLE)
    add_compile_definitions(OMNI_PLATFORM_MACOS)
elseif (ANDROID)
    add_compile_definitions(OMNI_PLATFORM_ANDROID)
elseif (EMSCRIPTEN)
    add_compile_definitions(OMNI_PLATFORM_WEB)
else()
    add_compile_definitions(OMNI_PLATFORM_LINUX)
endif()

# Executable target
add_executable(ObjectivePaperclips
    ${ENGINE_SOURCES}
    ${GAME_SOURCES}
)

if (BUILD_TESTS)
    enable_testing()
    # Add custom unit test targets if needed
endif()
