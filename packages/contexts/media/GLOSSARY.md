# Media

Recordings people upload and the app plays back: one file per Video, playable on every phone.

## Language

### Videos

**Video**:
A recording a User uploaded, as the app shows it: Processing, then Ready or Failed, for good.
_Avoid_: Clip, movie, media (alone), file

**Owner**:
The User who uploaded a Video, known by id only. Only the Owner sees their Videos.
_Avoid_: Author, uploader, user (in code)

**Video upload**:
A file an Owner sent for a new Video and the system has not kept yet. Checked before it is kept;
forgotten after a day if never used.
_Avoid_: Pending video, temp file

**Status**:
Where a Video is in its life: `PROCESSING` while it is transcoded, `READY` once it can be played,
`FAILED` when it never will be.
_Avoid_: State, phase

**Failure reason**:
Why a Video Failed: `unreadable` (no video the system can read), `too-long` (more than ten
minutes), `processing-failed` (Transcoding kept failing).
_Avoid_: Error, cause

### Files

**Source**:
The file as the Owner sent it: an MP4 or MOV of at most 2 GB. Kept only while the Video is
Processing, never shown, deleted once the Video is Ready or Failed.
_Avoid_: Original, raw file, input

**Playable file**:
The file a Ready Video is played from, and the only file it keeps: H.264 High, 8-bit 4:2:0,
SDR BT.709, AAC audio, in an MP4 whose index comes first.
_Avoid_: Output, rendition, version, transcode (as a noun)

**Transcoding**:
Turning a Source into the Playable file, at visually lossless quality: rotation applied, HDR
tone mapped to SDR, metadata (the recording's location included) dropped.
_Avoid_: Conversion (in code), encoding (alone), processing (as a noun for this step)
