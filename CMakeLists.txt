cmake_minimum_required(VERSION 3.20)
project(ObjectivePaperclips LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Include Directories
include_directories(engine/include)

# Source Files
set(SOURCES
    engine/src/OmniAudio.cpp
    engine/src/OmniCameraRig.cpp
    engine/src/OmniDialogueTerminal.cpp
    engine/src/OmniUI.cpp
    engine/src/OmniStreamer.cpp
    engine/src/OmniSpatialGrid.cpp
    engine/src/OmniResearchTree.cpp
    engine/src/OmniHeadlines.cpp
    engine/src/OmniGLWindow.cpp
    engine/src/OmniFont.cpp
    game/GameMain.cpp
)

# Main Executable Target
add_executable(ObjectivePaperclips ${SOURCES})

# Platform-Specific Libraries
if(WIN32)
    target_link_libraries(ObjectivePaperclips PRIVATE opengl32 gdi32 user32)
    if(MSVC)
        target_compile_options(ObjectivePaperclips PRIVATE /W4 /O2 /permissive- /utf-8)
    else()
        target_compile_options(ObjectivePaperclips PRIVATE -Wall -Wextra -O2)
    endif()
else()
    target_compile_options(ObjectivePaperclips PRIVATE -Wall -Wextra -O2)
endif()
