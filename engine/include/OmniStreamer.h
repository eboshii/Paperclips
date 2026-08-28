#pragma once
#include <string>
#include <vector>
#include <queue>
#include <chrono>
#include <iostream>
#include "OmniMath.h"

namespace OmniEngine {

struct TwitchVoteOption {
    std::string command;
    std::string description;
    int voteCount = 0;
};

struct TwitchVotePoll {
    std::string pollTitle;
    float timeRemainingSeconds = 60.0f;
    bool isActive = false;
    std::vector<TwitchVoteOption> options;
};

struct SpeedrunSplit {
    std::string milestoneName;
    double splitTimeSeconds;
    bool achieved = false;
};

struct TimelapseFrame {
    float timestampSeconds;
    int scaleTier;
    float cameraDistance;
    double matterConversionPercent;
    BigDouble totalClips;
};

/// <summary>
/// Streamer & Virality Suite:
/// 1. Twitch Chat Voting & Viewer Deconstruction Logging
/// 2. 1-Click 3D TikTok/Shorts Video Timelapse Exporter
/// 3. Speedrun Mode with Split Times
/// </summary>
class StreamerSuite {
public:
    StreamerSuite();

    // --- Twitch Integration ---
    void StartTwitchPoll(const std::string& title, const std::vector<std::pair<std::string, std::string>>& options, float durationSec = 60.0f);
    void RegisterChatVote(const std::string& chatterUsername, const std::string& voteCommand);
    void EnqueueChatterHarvest(const std::string& chatterUsername);
    std::string DequeueHarvestedChatterLog();
    void Update(float dt);

    const TwitchVotePoll& GetCurrentPoll() const { return m_activePoll; }

    // --- TikTok / Shorts 3D Timelapse Exporter ---
    void RecordTimelapseKeyframe(float timeSec, int scaleTier, float camDist, double matterPct, const BigDouble& clips);
    std::string ExportTimelapseDataJSON() const;

    // --- Speedrun Split Timer ---
    void CheckSpeedrunMilestone(const std::string& milestoneName, double currentPlaytime);
    const std::vector<SpeedrunSplit>& GetSpeedrunSplits() const { return m_splits; }

private:
    TwitchVotePoll m_activePoll;
    std::queue<std::string> m_chatHarvestQueue;
    std::vector<TimelapseFrame> m_timelapseFrames;
    std::vector<SpeedrunSplit> m_splits;
};

} // namespace OmniEngine
