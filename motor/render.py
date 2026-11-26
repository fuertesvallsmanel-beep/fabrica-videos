import subprocess, sys, pathlib
from playwright.sync_api import sync_playwright

html = pathlib.Path(sys.argv[1]).resolve()
out = sys.argv[2]
dur = float(sys.argv[3]) if len(sys.argv) > 3 else 14.0
fps = 30
frames_only = sys.argv[4:]  # optional list of times for preview stills

with sync_playwright() as p:
    b = p.chromium.launch(executable_path=('/usr/bin/google-chrome' if __import__('os').path.exists('/usr/bin/google-chrome') else None), args=["--force-device-scale-factor=1"])
    pg = b.new_page(viewport={"width": 1920, "height": 1080})
    pg.goto(html.as_uri())
    pg.wait_for_timeout(500)
    if frames_only:
        for t in frames_only:
            pg.evaluate(f"render({float(t)})")
            pg.screenshot(path=f"{out}_{t}.png")
    else:
        ff = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", str(fps),
                               "-c:v", "mjpeg", "-i", "-", "-c:v", "libx264", "-preset", "veryfast", "-crf", "18",
                               "-pix_fmt", "yuv420p", "-movflags", "+faststart", out], stdin=subprocess.PIPE)
        n = int(dur * fps)
        for i in range(n):
            pg.evaluate(f"render({i / fps})")
            ff.stdin.write(pg.screenshot(type="jpeg", quality=92))
        ff.stdin.close()
        ff.wait()
    b.close()
