# QuantumTracker
A keyboard operated tracker sequencer made with [Vue 3](https://vuejs.org/) and [Elementary Audio](https://www.elementary.audio/).

You can demo the live version [HERE](https://www.sesameaudio.com/), but be aware _this is a work in progress_: most major features are still missing, and I'm still optimizing the audio engine implementation.

[![Netlify Status](https://api.netlify.com/api/v1/badges/2d4b5d87-d733-47d9-967a-bec95d5d567b/deploy-status)](https://app.netlify.com/sites/quantumtracker/deploys)

For now, you can click steps, then either click on the "QuantumTracker" logo, or press the 'space' bar to start/stop the audio.
There's also a basic slider in place to be able to change the tempo, but a better implementation is on the way.

## The Concept
QuantumTracker was made to create **drum sequences with a distinct human feel** to them
- musically expressive
- subtly unpredictable
- prone to "happy accidents"

And specifically, to be able to control all of this while **keeping your fingers on the computer keyboard** at all times, to
- maximize workflow efficiency
- minimize distractions from the creative process
- enhance the musical experience by keeping a tactile approach

<img width="1658" alt="quantumtracker-preview" src="https://user-images.githubusercontent.com/73052877/168418996-632172e6-1e4f-4eca-b34f-0c6c7a7ebd09.png">

## Roadmap
### fully controllable from keyboard input
- step selection & editing
    - volume (+/- dB)
    - pocket (+/- % of stepLength)
    - note repeat
    - probability
    - conditionals
- sequence capture
- multi-step editing from user code
### improved tracker
- ability to extend the sequence up to 64 steps
- vertical scroll during playback
- highlight on “playhead” line
- step playback from anywhere in the sequence
### advanced humanization features
- rhythmic displacement
- sample "articulation"
- snare & hihat rolls
### more drum samples to choose from
- custom designed to be complimentary
- varying levels of attitude
- opinionated, yet genre-agnostic
### export from QuantumTracker
- as one stereo WAV file mixdown
- as four separate stereo WAV files
- as a MIDI file
### audio effects
- tone: eq/filter
- thickness: saturation/compression
- timbre: pitch/formant

***

Thank you for checking it out!
