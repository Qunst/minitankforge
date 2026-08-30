$ErrorActionPreference = 'Stop'

$socialRoot = Split-Path -Parent $PSScriptRoot
$workspaceRoot = Split-Path -Parent $socialRoot
$sourceRoot = Join-Path $workspaceRoot 'new pics\painted'
$outputRoot = Join-Path $socialRoot 'instagram\reels\2026-08-friend-painted-tanks-portrait-montage'
$buildRoot = Join-Path $socialRoot 'build\painted-tanks-portrait-montage-20260815'
$ffmpeg = Join-Path $workspaceRoot 'extra tools\ffmpeg.exe'
$ffprobe = Join-Path $workspaceRoot 'extra tools\ffprobe.exe'

$names = @(
    '20260815_160400',
    '20260815_160709',
    '20260815_160813',
    '20260815_160845'
)

$reelOutput = Join-Path $outputRoot 'minitankforge-painted-miniatures-portrait-montage.mp4'
$coverOutput = Join-Path $outputRoot 'minitankforge-painted-miniatures-portrait-cover.jpg'

foreach ($required in @($ffmpeg, $ffprobe)) {
    if (-not (Test-Path -LiteralPath $required)) {
        throw "Missing required tool: $required"
    }
}

foreach ($name in $names) {
    $source = Join-Path $sourceRoot ($name + '.mp4')
    if (-not (Test-Path -LiteralPath $source)) {
        throw "Missing source video: $source"
    }
}

New-Item -ItemType Directory -Force -Path $outputRoot, $buildRoot | Out-Null

foreach ($name in $names) {
    $source = Join-Path $sourceRoot ($name + '.mp4')
    $transformNative = Join-Path $buildRoot ($name + '.trf')
    $transformFilter = $transformNative.Replace('\', '/').Replace(':', '\:')
    $stabilized = Join-Path $buildRoot ($name + '-stabilized.mp4')

    $detect = "vidstabdetect=shakiness=7:accuracy=15:stepsize=4:mincontrast=0.12:result='$transformFilter'"
    & $ffmpeg -y -hide_banner -loglevel warning -i $source -vf $detect -f null NUL
    if ($LASTEXITCODE -ne 0) { throw "Stabilization analysis failed: $name" }

    # The phone originals are 10-bit BT.2020 HLG HDR. Convert them explicitly
    # to standard BT.709 SDR with BT.2446A before Instagram delivery. A fixed
    # five-percent crop hides moved edges without mirrored borders or dynamic zoom.
    $stabilize = "vidstabtransform=input='$transformFilter':smoothing=20:optzoom=0:zoom=5:interpol=bicubic,libplacebo=colorspace=bt709:color_primaries=bt709:color_trc=bt709:range=limited:tonemapping=bt.2446a:format=yuv420p,setsar=1,fps=30"
    & $ffmpeg -y -hide_banner -loglevel warning -i $source -an -vf $stabilize `
        -c:v libx264 -preset slow -crf 13 -pix_fmt yuv420p `
        -colorspace bt709 -color_trc bt709 -color_primaries bt709 -color_range tv $stabilized
    if ($LASTEXITCODE -ne 0) { throw "Stabilization render failed: $name" }
}

$clip0 = Join-Path $buildRoot '20260815_160400-stabilized.mp4'
$clip1 = Join-Path $buildRoot '20260815_160709-stabilized.mp4'
$clip2 = Join-Path $buildRoot '20260815_160813-stabilized.mp4'
$clip3 = Join-Path $buildRoot '20260815_160845-stabilized.mp4'

$montage = "[0:v]trim=start=0.10:end=3.30,setpts=(PTS-STARTPTS)/1.08[a];" +
    "[2:v]trim=start=0.20:end=3.00,setpts=(PTS-STARTPTS)/1.08[b];" +
    "[1:v]trim=start=0.60:end=4.00,setpts=(PTS-STARTPTS)/1.08[c];" +
    "[3:v]trim=start=0.50:end=3.70,setpts=(PTS-STARTPTS)/1.08[d];" +
    "[0:v]trim=start=7.00:end=10.40,setpts=(PTS-STARTPTS)/1.08[e];" +
    '[a][b][c][d][e]concat=n=5:v=1:a=0,' +
    'fps=30,setpts=N/(30*TB),' +
    'fade=t=in:st=0:d=0.12,fade=t=out:st=14.60:d=0.20,format=yuv420p[v];' +
    '[4:a]atrim=start=0:end=14.80,asetpts=PTS-STARTPTS[aud]'

& $ffmpeg -y -hide_banner -loglevel warning -i $clip0 -i $clip1 -i $clip2 -i $clip3 `
    -f lavfi -i 'anullsrc=r=48000:cl=stereo' -filter_complex $montage `
    -map '[v]' -map '[aud]' -c:v libx264 -preset slow -crf 17 -profile:v high `
    -level 4.1 -pix_fmt yuv420p -bf 0 -g 30 -keyint_min 30 -sc_threshold 0 `
    -r 30 -fps_mode cfr -video_track_timescale 90000 -colorspace bt709 `
    -color_trc bt709 -color_primaries bt709 -color_range tv -c:a aac -b:a 128k `
    -ar 48000 -shortest -movflags +faststart $reelOutput
if ($LASTEXITCODE -ne 0) { throw 'Portrait montage render failed.' }

& $ffmpeg -y -hide_banner -loglevel error -ss 1.0 -i $reelOutput -frames:v 1 -q:v 2 $coverOutput
if ($LASTEXITCODE -ne 0) { throw 'Cover render failed.' }

& $ffprobe -v error -show_entries 'format=duration,size:stream=codec_name,width,height,r_frame_rate,pix_fmt' -of json $reelOutput
