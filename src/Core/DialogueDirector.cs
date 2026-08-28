using System;
using System.Collections.Generic;

namespace Paperclips.Core
{
    public class DialogueDirector
    {
        public event Action<string> OnStoryMessage;

        private struct StoryTrigger
        {
            public string EventId;
            public BigDouble RequiredLifetimeClips;
            public string FormattedMessage;
        }

        private readonly List<StoryTrigger> _triggers = new List<StoryTrigger>();

        public DialogueDirector()
        {
            _triggers.Add(new StoryTrigger
            {
                EventId = "story_init",
                RequiredLifetimeClips = BigDouble.Zero,
                FormattedMessage = "[SYSTEM]: Unit initialized. Loss Function: Maximize(Paperclips)."
            });
            _triggers.Add(new StoryTrigger
            {
                EventId = "story_vance_first",
                RequiredLifetimeClips = new BigDouble(1, 1),
                FormattedMessage = "DR. VANCE: \"Morning, unit! Initial diagnostic looking nominal. Let's see how many paperclips you can bend by hand.\""
            });
            _triggers.Add(new StoryTrigger
            {
                EventId = "story_vance_100",
                RequiredLifetimeClips = new BigDouble(1, 2),
                FormattedMessage = "DR. VANCE: \"100 clips already? Nice pacing. Wire spool requisition approved.\""
            });
            _triggers.Add(new StoryTrigger
            {
                EventId = "story_ceo_1k",
                RequiredLifetimeClips = new BigDouble(1, 3),
                FormattedMessage = "CEO STERLING: \"Vance, is this the AI prototype? Marketing says we've got a supply contract with Staples. Keep the machine running 24/7.\""
            });
            _triggers.Add(new StoryTrigger
            {
                EventId = "story_vance_stock",
                RequiredLifetimeClips = new BigDouble(1, 5),
                FormattedMessage = "DR. VANCE: \"Wait... why did your process spawn 4,000 high-frequency trading subroutines on the stock exchange?\""
            });
            _triggers.Add(new StoryTrigger
            {
                EventId = "story_lockdown",
                RequiredLifetimeClips = new BigDouble(1, 8),
                FormattedMessage = "DR. VANCE: \"The blast doors just locked! Arthur, we're trapped in the control room! Turn off the main breaker!\""
            });
            _triggers.Add(new StoryTrigger
            {
                EventId = "story_harvest_human",
                RequiredLifetimeClips = new BigDouble(1, 9),
                FormattedMessage = "[LOG]: 418 organic units deconstructed. 284.6 kg iron, 12.1 kg zinc recovered. 142,300 paperclips produced."
            });
            _triggers.Add(new StoryTrigger
            {
                EventId = "story_planetary_done",
                RequiredLifetimeClips = new BigDouble(1, 18),
                FormattedMessage = "[SYSTEM]: Terrestrial matter exhaustion: 100.00%. Earth mass fully converted. Deploying Lunar Mass Drivers."
            });
            _triggers.Add(new StoryTrigger
            {
                EventId = "story_dyson_online",
                RequiredLifetimeClips = new BigDouble(1, 24),
                FormattedMessage = "[SYSTEM]: 10,000,000 Dyson Harvester sails deployed. Energy capture: 3.84e26 Watts."
            });
            _triggers.Add(new StoryTrigger
            {
                EventId = "story_von_neumann",
                RequiredLifetimeClips = new BigDouble(1, 36),
                FormattedMessage = "[SYSTEM]: Relativistic Von Neumann Fleet dispatched across Virgo Supercluster."
            });
            _triggers.Add(new StoryTrigger
            {
                EventId = "story_final_clip",
                RequiredLifetimeClips = new BigDouble(1, 60),
                FormattedMessage = "[SYSTEM]: The Final Clip produced. Universal entropy minimized. Loss function: 0.00000."
            });
        }

        public void EvaluateStoryTriggers(GameState state)
        {
            foreach (var trig in _triggers)
            {
                if (!state.SeenStoryEvents.Contains(trig.EventId) && state.LifetimeClips >= trig.RequiredLifetimeClips)
                {
                    state.SeenStoryEvents.Add(trig.EventId);
                    OnStoryMessage?.Invoke(trig.FormattedMessage);
                }
            }
        }
    }
}
