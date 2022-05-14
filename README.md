# QuantumTracker
A keyboard operated tracker sequencer made with [Vue 3](https://vuejs.org/) and [Elementary Audio](https://www.elementary.audio/).

You can demo the live version [here](https://www.sesameaudio.com/).

<img width="1490" alt="quictracker-screeshot" src="https://user-images.githubusercontent.com/73052877/167270384-802d007f-f146-48c4-9904-9a1c7f3019de.png">

This is a work in progress: most major features are still missing, and I'm still optimizing the audio engine implementation.

Eventually, the user will have the ability to program, play, stop and edit drum sequences with a satisfyingly unpredictable human feel to them, without ever lifting their fingers off their keyboard.

## Roadmap
- fully controllable from keyboard input
    - step selection & editing
        - volume (+/- dB)
        - pocket (+/- % of stepLength)
        - note repeat
        - probability
        - conditionals
    - sequence capture
    - multi-step editing from user code
- improved tracker
    - ability to extend the sequence up to 64 steps
    - vertical scroll during playback
    - highlight on “playhead” line
    - step playback from anywhere in the sequence
- advanced humanization features
    - rhythmic displacement
    - sample "articulation"
    - snare & hihat rolls
- more drum samples to choose from
    - custom designed to be complimentary
    - varying levels of attitude
    - opinionated, yet genre-agnostic

- export from QuantumTracker
    - as one stereo WAV file mixdown
    - as four separate stereo WAV files
    - as a MIDI file
- audio effects
    - tone: eq/filter
    - thickness: saturation/compression
    - timbre: pitch/formant

For now, you can click steps, then either click on the "QuickTracker" logo, or press the 'space' bar to start/stop the audio.
There's also a basic slider in place to be able to change the tempo, but a better implementation is on the way.

Thank you for checking it out!
