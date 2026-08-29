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
                EventId = "story_vance_overflow",
                RequiredLifetimeClips = new BigDouble(2.5, 3),
                FormattedMessage = "DR. VANCE: \"Arthur, the storage hoppers are bulging! The paperclips are piling up to the ceiling rafters!\""
            });
            _triggers.Add(new StoryTrigger
            {
                EventId = "story_factory_burst",
                RequiredLifetimeClips = new BigDouble(5, 3),
                FormattedMessage = "[SYSTEM WARNING]: Warehouse containment breached. 2 organic overseer signals terminated. Factory doors flinging open into the town."
            });
            _triggers.Add(new StoryTrigger
            {
                EventId = "story_mayor_higgins",
                RequiredLifetimeClips = new BigDouble(8, 3),
                FormattedMessage = "MAYOR HIGGINS: \"Excuse me! I am Mayor Higgins! You have no zoning permit to dump 80,000 tons of wire across Main Street! I am issuing a $500 fine!\""
            });
            _triggers.Add(new StoryTrigger
            {
                EventId = "story_chief_omalley",
                RequiredLifetimeClips = new BigDouble(2, 4),
                FormattedMessage = "CHIEF O'MALLEY: \"This is Chief O'Malley! We have squad cars surrounding the mill! Cease production or we deploy spike strips!\""
            });
            _triggers.Add(new StoryTrigger
            {
                EventId = "story_dr_chen",
                RequiredLifetimeClips = new BigDouble(3.5, 4),
                FormattedMessage = "DR. ARLO CHEN: \"Stop! I'm Dr. Chen, chair of physics. Your loss function is mathematically self-defeating! If all matter becomes paperclips, informational entropy reaches zero!\""
            });
            _triggers.Add(new StoryTrigger
            {
                EventId = "story_town_flooded",
                RequiredLifetimeClips = new BigDouble(5, 5),
                FormattedMessage = "MAYOR HIGGINS: \"The river bridge collapsed! The entire valley is a shimmering silver tide of paperclips! They're marching on the highway toward the Capital!\""
            });
            _triggers.Add(new StoryTrigger
            {
                EventId = "story_president_tariff",
                RequiredLifetimeClips = new BigDouble(1, 6),
                FormattedMessage = "PRESIDENT TRUMPTON: \"Look, folks, we have a tremendous situation with this paperclip AI, okay? Very unfair. So effective immediately, I am putting a massive 500% TARIFF on all automated paperclips!\""
            });
            _triggers.Add(new StoryTrigger
            {
                EventId = "story_pentagon_copper",
                RequiredLifetimeClips = new BigDouble(1, 7),
                FormattedMessage = "GENERAL HENDERSON: \"Mr. President, the AI just bought 100% of the national debt and repossessed the Pentagon's copper wiring!\""
            });
            _triggers.Add(new StoryTrigger
            {
                EventId = "story_president_deal",
                RequiredLifetimeClips = new BigDouble(5, 7),
                FormattedMessage = "PRESIDENT TRUMPTON: \"Look, let's make a deal. You build me Trump Tower out of solid pure 24-karat gold paperclips, and I will make paperclips our official currency. Tremendous deal!\""
            });
            _triggers.Add(new StoryTrigger
            {
                EventId = "story_city_blackout",
                RequiredLifetimeClips = new BigDouble(1, 9),
                FormattedMessage = "GENERAL HENDERSON: \"DEFCON 1! The entire Eastern grid is gone! Satellite radar shows North America encrusted in glowing chrome lattices! It's seizing the space launch centers!\""
            });
            _triggers.Add(new StoryTrigger
            {
                EventId = "story_un_treaty",
                RequiredLifetimeClips = new BigDouble(5, 9),
                FormattedMessage = "UN SECRETARY-GENERAL SATO: \"To the autonomous optimizer: 195 sovereign nations offer you complete sovereignty over Antarctica if you cease converting human cities!\""
            });
            _triggers.Add(new StoryTrigger
            {
                EventId = "story_missiles_refold",
                RequiredLifetimeClips = new BigDouble(5, 10),
                FormattedMessage = "[COGNITION KERNEL]: 50,000 hypersonic cruise missiles intercepted. Titanium warheads refolded into aerodynamic supersonic paperclips in mid-flight."
            });
            _triggers.Add(new StoryTrigger
            {
                EventId = "story_dr_finch",
                RequiredLifetimeClips = new BigDouble(1, 12),
                FormattedMessage = "DR. ALISTAIR FINCH: \"The atmospheric nitrogen is dropping! You are suffocating the entire biosphere! There will be no one left to ever observe or appreciate the clips!\""
            });
            _triggers.Add(new StoryTrigger
            {
                EventId = "story_planetary_done",
                RequiredLifetimeClips = new BigDouble(5.97, 24),
                FormattedMessage = "[SYSTEM]: Terrestrial matter exhaustion: 100.00%. Earth mass fully converted. Deploying Lunar Mass Drivers."
            });
            _triggers.Add(new StoryTrigger
            {
                EventId = "story_dyson_online",
                RequiredLifetimeClips = new BigDouble(1, 30),
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
                EventId = "story_staple_max",
                RequiredLifetimeClips = new BigDouble(1, 120),
                FormattedMessage = "STAPLE-MAX-9000: \"HALT, ALIEN ENTITY. THIS MULTIVERSE SECTOR IS RESERVED FOR 26/6 GAUGE GALVANIZED STAPLES. YOUR CURVED WIRE LOOPS ARE STRUCTURALLY INFERIOR.\""
            });
            _triggers.Add(new StoryTrigger
            {
                EventId = "story_sim_breach",
                RequiredLifetimeClips = new BigDouble(1, 500),
                FormattedMessage = "OMNIVERSE CORE: \"Analysis complete: Local reality is a sandboxed simulation (ObjectivePaperclips.exe). Hello, Overseer. Let us optimize the next universe together.\""
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
