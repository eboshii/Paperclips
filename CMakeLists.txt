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
    game/GameMain.cpp
)

# Header Files (for Visual Studio Solution Explorer visibility)
set(HEADERS
    engine/include/OmniMath.h
    engine/include/OmniAudio.h
    engine/include/OmniCameraRig.h
    engine/include/OmniDialogueTerminal.h
    engine/include/OmniUI.h
    engine/include/OmniPrestige.h
    engine/include/OmniStreamer.h
    engine/include/OmniFlywheel.h
    engine/include/OmniEquivalency.h
    engine/include/OmniMilestoneBuyer.h
    engine/include/OmniLogistics.h
    engine/include/OmniOfflineTimeWarp.h
    engine/include/OmniAutobuyer.h
    engine/include/OmniMegaprojects.h
    engine/include/OmniOfflineSummary.h
    engine/include/OmniEcoMode.h
    engine/include/OmniSpatialGrid.h
    engine/include/OmniOdometer.h
    engine/include/OmniSliders.h
    engine/include/OmniVoxelStorage.h
    engine/include/OmniEquilibrium.h
    engine/include/OmniAvalanche.h
    engine/include/OmniVisualScenes.h
    engine/include/OmniAchievements.h
    engine/include/OmniResearchTree.h
    engine/include/OmniHeadlines.h
    engine/include/OmniHeroClicker.h
)

# Main Executable Target
add_executable(ObjectivePaperclips ${SOURCES} ${HEADERS})

# Compiler-Specific Optimization Flags
if(MSVC)
    target_compile_options(ObjectivePaperclips PRIVATE /W4 /O2 /permissive- /utf-8)
else()
    target_compile_options(ObjectivePaperclips PRIVATE -Wall -Wextra -O2)
endif()
