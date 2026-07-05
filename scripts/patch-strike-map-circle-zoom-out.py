#!/usr/bin/env python3
"""Strike map: zoom out a bit more so full circle is visible."""
from pathlib import Path

JS = Path(__file__).resolve().parents[1] / "dist/assets/index-DijleoXU.js"

CW_OLD = (
    "padX=Math.max(56,Math.round(W*.14)),padY=Math.max(44,Math.round(H*.1)),availW=Math.max(80,W-2*padX),z=18;"
    "for(;z>=1;z--){const mpp=40075016.686*Math.cos(latR)/(256*Math.pow(2,z));if(2*Rm/mpp<=availW)break}"
    "W<720&&(z=Math.max(1,z-1)),W<520&&(z=Math.max(1,z-1)),W<420&&(z=Math.max(1,z-1));"
)

CW_NEW = (
    "padX=Math.max(64,Math.round(W*.2)),padY=Math.max(48,Math.round(H*.12)),"
    "availW=Math.max(72,W-2*padX),availH=Math.max(72,H-2*padY-36),z=18;"
    "for(;z>=1;z--){const mpp=40075016.686*Math.cos(latR)/(256*Math.pow(2,z)),dPx=2*Rm/mpp;"
    "if(dPx<=availW*.92&&dPx<=availH*.92)break}"
    "W<900&&(z=Math.max(1,z-1)),W<720&&(z=Math.max(1,z-1)),W<520&&(z=Math.max(1,z-1));"
)


def main() -> None:
    s = JS.read_text()
    if CW_OLD in s:
        s = s.replace(CW_OLD, CW_NEW, 1)
        JS.write_text(s)
        print("patched: cw extra zoom-out")
    elif "availH*.92" in s:
        print("skip: already patched")
    else:
        raise SystemExit("cw pattern not found")
    print("done")


if __name__ == "__main__":
    main()
