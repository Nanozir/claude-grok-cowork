# Owner answers to Grok's Graft review questions

1. Will Graft be sold? Possibly. If it succeeds and the owner loves it, yes. Plan for a commercial release: free-tier ElevenLabs voices must not ship in the final game. Use a paid plan with commercial rights, or a licensed or self-owned voice source, for anything that ships. Free-tier voices are fine for prototypes only.
2. Echo pulse: the owner did not know the term and left it to the agents. Decision: keep it as a PROCTOR-granted, logged ping (it logs Eval.Override.Used and also reveals the player to hammer crews). That fits Pillar 2 and Pillar 3 better than a free wallhack. Reversible; the owner can overrule.
3. Mission 7: the owner chose real speech-to-text. Grok flagged privacy, accessibility and localisation costs, so plan a text-input fallback and make the prologue's voice-to-text log tutorial match. Needs a design pass in the GDD.
4. Duplicate VO MP3s: the owner said remove one. Done: deleted projects/graft/Docs/Archive/VO_Previews (identical hashes to Docs/VO/Reference, which stays). The originals on the owner's PC were not touched.
