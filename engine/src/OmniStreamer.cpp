#include "../include/OmniStreamer.h"
#include <sstream>
#include <iomanip>

namespace OmniEngine {

StreamerSuite::StreamerSuite() {
    // Initialize standard Speedrun splits
    m_splits.push_back({ "1 Million Clips", 0.0, false });
    m_splits.push_back({ "Earth Fully Deconstructed", 0.0, false });
    m_splits.push_back({ "Dyson Solar Ring Online", 0.0, false });
    m_splits.push_back({ "Observable Universe Maximized", 0.0, false });
    m_splits.push_back({ "4th-Wall Simulation Breached", 0.0, false });
}

void StreamerSuite::StartTwitchPoll(const std::string& title, const std::vector<std::pair<std::string, std::string>>& options, float durationSec) {
    m_activePoll.pollTitle = title;
    m_activePoll.timeRemainingSeconds = durationSec;
    m_activePoll.isActive = true;
    m_activePoll.options.clear();

    for (const auto& opt : options) {
        m_activePoll.options.push_back({ opt.first, opt.second, 0 });
    }

    std::cout << "\n[TWITCH POLL STARTED]: \"" << title << "\" (Duration: " << durationSec << "s)\n";
    for (const auto& opt : m_activePoll.options) {
        std::cout << "  -> Type '" << opt.command << "' for: " << opt.description << "\n";
    }
}

void StreamerSuite::RegisterChatVote(const std::string& chatterUsername, const std::string& voteCommand) {
    if (!m_activePoll.isActive) return;

    for (auto& opt : m_activePoll.options) {
        if (opt.command == voteCommand) {
            opt.voteCount++;
            return;
        }
    }
}

void StreamerSuite::EnqueueChatterHarvest(const std::string& chatterUsername) {
    m_chatHarvestQueue.push(chatterUsername);
}

std::string StreamerSuite::DequeueHarvestedChatterLog() {
    if (m_chatHarvestQueue.empty()) return "";

    std::string user = m_chatHarvestQueue.front();
    m_chatHarvestQueue.pop();

    std::ostringstream ss;
    ss << "[LOG]: Twitch viewer @" << user << " deconstructed -> +42,000 Paperclips.";
    return ss.str();
}

void StreamerSuite::Update(float dt) {
    if (m_activePoll.isActive) {
        m_activePoll.timeRemainingSeconds -= dt;
        if (m_activePoll.timeRemainingSeconds <= 0.0f) {
            m_activePoll.isActive = false;

            // Determine winning option
            int highestVotes = -1;
            std::string winningCommand = "None";
            for (const auto& opt : m_activePoll.options) {
                if (opt.voteCount > highestVotes) {
                    highestVotes = opt.voteCount;
                    winningCommand = opt.command;
                }
            }

            std::cout << "\n[TWITCH POLL ENDED]: Winning Policy: " << winningCommand 
                      << " with " << highestVotes << " votes!\n";
        }
    }
}

void StreamerSuite::RecordTimelapseKeyframe(float timeSec, int scaleTier, float camDist, double matterPct, const BigDouble& clips) {
    TimelapseFrame frame;
    frame.timestampSeconds = timeSec;
    frame.scaleTier = scaleTier;
    frame.cameraDistance = camDist;
    frame.matterConversionPercent = matterPct;
    frame.totalClips = clips;
    m_timelapseFrames.push_back(frame);
}

std::string StreamerSuite::ExportTimelapseDataJSON() const {
    std::ostringstream ss;
    ss << "{\n  \"TimelapseFormat\": \"9:16 Vertical Cinematic\",\n  \"KeyframeCount\": " 
       << m_timelapseFrames.size() << ",\n  \"Frames\": [\n";

    for (size_t i = 0; i < m_timelapseFrames.size(); ++i) {
        const auto& f = m_timelapseFrames[i];
        ss << "    { \"Time\": " << f.timestampSeconds 
           << ", \"Tier\": " << f.scaleTier 
           << ", \"CamDist\": " << f.cameraDistance 
           << ", \"MatterPct\": " << std::fixed << std::setprecision(2) << f.matterConversionPercent 
           << ", \"Clips\": \"" << f.totalClips.toShortScale() << "\" }"
           << (i + 1 < m_timelapseFrames.size() ? ",\n" : "\n");
    }
    ss << "  ]\n}";
    return ss.str();
}

void StreamerSuite::CheckSpeedrunMilestone(const std::string& milestoneName, double currentPlaytime) {
    for (auto& split : m_splits) {
        if (split.milestoneName == milestoneName && !split.achieved) {
            split.achieved = true;
            split.splitTimeSeconds = currentPlaytime;
            int mins = static_cast<int>(currentPlaytime / 60.0);
            int secs = static_cast<int>(currentPlaytime) % 60;
            std::cout << "\n\033[92m[SPEEDRUN SPLIT]: " << milestoneName << " -> " 
                      << mins << "m " << secs << "s\033[0m\n";
        }
    }
}

} // namespace OmniEngine
