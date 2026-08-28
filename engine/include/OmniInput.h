#pragma once
#include <cstdint>

#ifdef _WIN32
#ifndef WIN32_LEAN_AND_MEAN
#define WIN32_LEAN_AND_MEAN
#endif
#ifndef NOMINMAX
#define NOMINMAX
#endif
#include <conio.h>
#include <windows.h>
#else
#include <termios.h>
#include <unistd.h>
#include <fcntl.h>
#include <sys/select.h>
#endif

namespace OmniEngine {

/// <summary>
/// Cross-platform non-blocking terminal input controller.
/// Works seamlessly on Windows 11 (MSVC/MinGW) and Linux.
/// </summary>
class NonBlockingInput {
public:
    static void EnableRawMode() {
#ifndef _WIN32
        struct termios t;
        tcgetattr(STDIN_FILENO, &t);
        t.c_lflag &= ~(ICANON | ECHO);
        tcsetattr(STDIN_FILENO, TCSANOW, &t);
        fcntl(STDIN_FILENO, F_SETFL, fcntl(STDIN_FILENO, F_GETFL) | O_NONBLOCK);
#endif
    }

    static void DisableRawMode() {
#ifndef _WIN32
        struct termios t;
        tcgetattr(STDIN_FILENO, &t);
        t.c_lflag |= (ICANON | ECHO);
        tcsetattr(STDIN_FILENO, TCSANOW, &t);
#endif
    }

    static bool KeyPressed() {
#ifdef _WIN32
        return _kbhit() != 0;
#else
        struct timeval tv = { 0L, 0L };
        fd_set fds;
        FD_ZERO(&fds);
        FD_SET(STDIN_FILENO, &fds);
        return select(STDIN_FILENO + 1, &fds, NULL, NULL, &tv) > 0;
#endif
    }

    static char ReadKey() {
#ifdef _WIN32
        if (_kbhit()) {
            return static_cast<char>(_getch());
        }
        return 0;
#else
        char c = 0;
        if (read(STDIN_FILENO, &c, 1) > 0) {
            return c;
        }
        return 0;
#endif
    }

    static void ClearScreen() {
        std::cout << "\033[2J\033[H";
    }
};

} // namespace OmniEngine
