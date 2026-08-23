"""Compress previous-member photos into small progressive JPEGs for /team."""

from __future__ import annotations

import json
import re
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path("public")
JSON_PATH = ROOT / "previous_members.json"
OUT_DIR = ROOT / "images" / "team-opt"
OUT_DIR.mkdir(parents=True, exist_ok=True)

MAX_EDGE = 900
JPEG_QUALITY = 78


def normalize(p: str) -> str:
    p = (p or "").strip()
    if not p:
        return "/placeholder.svg"
    if not (p.startswith("/") or p.startswith("http") or p.startswith("data:")):
        p = "/" + p
    return p


def safe_stem(path: str) -> str:
    stem = Path(path).stem
    stem = re.sub(r"[^A-Za-z0-9._-]+", "_", stem).strip("_")
    return stem[:80] or "member"


def main() -> None:
    data = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    seen: dict[str, str] = {}
    stats = {
        "optimized": 0,
        "missing": 0,
        "failed": 0,
        "bytes_in": 0,
        "bytes_out": 0,
    }

    def optimize(src_url: str) -> str:
        src_url = normalize(src_url)
        if src_url in seen:
            return seen[src_url]
        if src_url.startswith("http") or src_url == "/placeholder.svg":
            seen[src_url] = src_url
            return src_url

        src_path = ROOT / src_url.lstrip("/")
        if not src_path.exists():
            print("MISSING", src_url)
            stats["missing"] += 1
            seen[src_url] = src_url
            return src_url

        size = src_path.stat().st_size
        stats["bytes_in"] += size
        out_name = safe_stem(src_url) + ".jpg"
        out_path = OUT_DIR / out_name

        try:
            with Image.open(src_path) as im:
                im = ImageOps.exif_transpose(im)
                im = im.convert("RGB")
                w, h = im.size
                scale = min(1.0, MAX_EDGE / max(w, h))
                if scale < 1.0:
                    im = im.resize(
                        (max(1, int(w * scale)), max(1, int(h * scale))),
                        Image.Resampling.LANCZOS,
                    )
                im.save(
                    out_path,
                    format="JPEG",
                    quality=JPEG_QUALITY,
                    optimize=True,
                    progressive=True,
                )
            out_size = out_path.stat().st_size
            stats["bytes_out"] += out_size
            stats["optimized"] += 1
            dest = f"/images/team-opt/{out_name}"
            print(
                f"OK {src_url} {size/1024:.0f}KB -> {dest} {out_size/1024:.0f}KB"
            )
            seen[src_url] = dest
            return dest
        except Exception as exc:  # noqa: BLE001
            print("FAIL", src_url, exc)
            stats["failed"] += 1
            stats["bytes_out"] += size
            seen[src_url] = src_url
            return src_url

    for _tenure, payload in data.items():
        if not isinstance(payload, dict):
            continue
        for _key, members in payload.items():
            if not isinstance(members, list):
                continue
            for member in members:
                if isinstance(member, dict) and "image" in member:
                    member["image"] = optimize(member["image"])

    JSON_PATH.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print("---")
    print(stats)
    print(
        f"total in {stats['bytes_in']/1024/1024:.1f}MB -> "
        f"out {stats['bytes_out']/1024/1024:.1f}MB"
    )
    print("unique mapped", len(seen))


if __name__ == "__main__":
    main()
