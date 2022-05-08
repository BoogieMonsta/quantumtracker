# QuickTracker
A keyboard operated tracker sequencer made with [Vue 3](https://vuejs.org/) and [Elementary Audio](https://www.elementary.audio/).

<img width="1490" alt="quictracker-screeshot" src="https://user-images.githubusercontent.com/73052877/167270384-802d007f-f146-48c4-9904-9a1c7f3019de.png">

This is a work in progress, most major features are still missing; I'm still ironing out a bunch of bugs.

The idea is that eventually, the user will have the ability to program, play, stop and edit sequences of kicks, snares, hihats and additional samples without ever lifting their fingers off their keyboard.

## Roadmap
- sequence capture from keyboard input
- improved tracker
    - ability to extend the sequence up to 64 steps
    - vertical scroll during playback
    - highlight on “playhead” line
- ability to edit steps
    - volume (+/- dB)
    - pocket (+/- % of stepLength)
    - probability
    - conditionals
- more samples to choose from
- audio effects
- export to WAV file

For now, you can click steps, then either click on the "QuickTracker" logo, or press the 'space' bar to start/stop the audio.
There's also a basic slider in place to be able to change the tempo, but a better implementation is on the way.

Thank you for checking it out!
