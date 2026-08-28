@echo off
setlocal enabledelayedexpansion

echo =================================================================
echo   OBJECTIVE: PAPERCLIPS - WINDOWS 11 1-CLICK BUILD & RUN SCRIPT
echo =================================================================
echo.

:: 1. Check for MSVC (cl.exe in Developer Command Prompt / VS 2022)
where cl >nul 2>nul
if %errorlevel% equ 0 (
    echo [FOUND] MSVC Compiler (cl.exe). Compiling with C++20 /O2 optimization...
    cl /std:c++20 /O2 /utf-8 /Iengine/include ^
       engine/src/OmniAudio.cpp ^
       engine/src/OmniCameraRig.cpp ^
       engine/src/OmniDialogueTerminal.cpp ^
       engine/src/OmniUI.cpp ^
       engine/src/OmniStreamer.cpp ^
       engine/src/OmniSpatialGrid.cpp ^
       engine/src/OmniResearchTree.cpp ^
       engine/src/OmniHeadlines.cpp ^
       game/GameMain.cpp ^
       /Fe:ObjectivePaperclips.exe

    if %errorlevel% equ 0 (
        echo.
        echo [SUCCESS] Build succeeded: ObjectivePaperclips.exe
        echo [RUNNING] Launching game...
        echo.
        ObjectivePaperclips.exe
        goto :done
    ) else (
        echo [ERROR] MSVC compilation failed.
        goto :done
    )
)

:: 2. Check for MinGW-w64 (g++.exe)
where g++ >nul 2>nul
if %errorlevel% equ 0 (
    echo [FOUND] MinGW-w64 G++ Compiler. Compiling with C++20 -O2...
    g++ -std=c++20 -O2 -Iengine/include ^
        engine/src/OmniAudio.cpp ^
        engine/src/OmniCameraRig.cpp ^
        engine/src/OmniDialogueTerminal.cpp ^
        engine/src/OmniUI.cpp ^
        engine/src/OmniStreamer.cpp ^
        engine/src/OmniSpatialGrid.cpp ^
        engine/src/OmniResearchTree.cpp ^
        engine/src/OmniHeadlines.cpp ^
        game/GameMain.cpp ^
        -o ObjectivePaperclips.exe

    if %errorlevel% equ 0 (
        echo.
        echo [SUCCESS] Build succeeded: ObjectivePaperclips.exe
        echo [RUNNING] Launching game...
        echo.
        ObjectivePaperclips.exe
        goto :done
    ) else (
        echo [ERROR] MinGW G++ compilation failed.
        goto :done
    )
)

:: 3. Check for CMake
where cmake >nul 2>nul
if %errorlevel% equ 0 (
    echo [FOUND] CMake. Configuring and building build/ directory...
    mkdir build 2>nul
    cd build
    cmake ..
    cmake --build . --config Release
    if %errorlevel% equ 0 (
        echo.
        echo [SUCCESS] CMake build succeeded!
        if exist Release\ObjectivePaperclips.exe (
            Release\ObjectivePaperclips.exe
        ) else if exist ObjectivePaperclips.exe (
            ObjectivePaperclips.exe
        )
        goto :done
    )
)

echo [ERROR] No C++20 compiler found! 
echo Please open "Developer Command Prompt for VS 2022" or install MinGW-w64 / Clang.

:done
echo.
pause
