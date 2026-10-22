#!/usr/bin/env python3
"""
Test generator for 6 preview scenes using real Toolstrum web UI screenshots.
"""
import os
import sys
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

REAL_UI_DIR = "/Users/shibudhara11/Developer/toolstrum/video_output/real_ui"
OUT_DIR = "/Users/shibudhara11/Developer/toolstrum/video_output/preview_scenes"
os.makedirs(OUT_DIR, exist_ok=True)

WIDTH = 1920
HEIGHT = 1080

def get_font(size, bold=False, mono=False):
    path = "/System/Library/Fonts/Menlo.ttc" if mono else "/System/Library/Fonts/Helvetica.ttc"
    index = 1 if bold and "Helvetica" in path else 0
    try:
        return ImageFont.truetype(path, size, index=index)
    except Exception:
        return ImageFont.load_default()

font_title = get_font(72, bold=True)
font_sub = get_font(28, bold=False)
font_badge = get_font(20, bold=True)
font_code = get_font(22, bold=False, mono=True)
font_code_bold = get_font(22, bold=True, mono=True)
font_url = get_font(42, bold=True)

# Helper: Draw smooth modern cursor
def draw_cursor(draw, x, y, clicking=False, scale=1.0):
    # macOS style arrow pointer
    points = [
        (x, y),
        (x, y + int(24 * scale)),
        (x + int(6 * scale), y + int(19 * scale)),
        (x + int(11 * scale), y + int(29 * scale)),
        (x + int(15 * scale), y + int(27 * scale)),
        (x + int(10 * scale), y + int(17 * scale)),
        (x + int(18 * scale), y + int(17 * scale)),
    ]
    # Drop shadow
    shadow_points = [(px + 2, py + 3) for px, py in points]
    draw.polygon(shadow_points, fill=(0, 0, 0, 90))
    # Fill & Outline
    draw.polygon(points, fill=(255, 255, 255, 255))
    draw.polygon(points, outline=(20, 20, 25, 240), width=2)
    
    if clicking:
        # Click ripple ring
        r = int(18 * scale)
        draw.ellipse([x - r, y - r, x + r, y + r], outline=(99, 102, 241, 200), width=3)

# Helper: Crop & scale real UI capture with pan and zoom
def get_camera_frame(image_path, zoom=1.0, pan_x=0.0, pan_y=0.0):
    img = Image.open(image_path).convert("RGBA")
    orig_w, orig_h = img.size
    
    crop_w = orig_w / zoom
    crop_h = orig_h / zoom
    
    center_x = (orig_w / 2.0) + (pan_x * (orig_w - crop_w) * 0.5)
    center_y = (orig_h / 2.0) + (pan_y * (orig_h - crop_h) * 0.5)
    
    x1 = max(0, min(orig_w - crop_w, center_x - crop_w / 2.0))
    y1 = max(0, min(orig_h - crop_h, center_y - crop_h / 2.0))
    x2 = x1 + crop_w
    y2 = y1 + crop_h
    
    cropped = img.crop((int(x1), int(y1), int(x2), int(y2)))
    return cropped.resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS)

print("Testing camera framing on real UI...")
f1 = get_camera_frame(f"{REAL_UI_DIR}/01_home_dashboard.png", zoom=1.1, pan_x=-0.2, pan_y=-0.1)
f1.convert("RGB").save(f"{OUT_DIR}/test_scene1.jpg", quality=95)

f2 = get_camera_frame(f"{REAL_UI_DIR}/02b_pdf_files_loaded.png", zoom=1.25, pan_x=0.2, pan_y=0.1)
f2.convert("RGB").save(f"{OUT_DIR}/test_scene2.jpg", quality=95)

f3 = get_camera_frame(f"{REAL_UI_DIR}/03b_image_resizer_loaded.png", zoom=1.2, pan_x=0.15, pan_y=0.05)
f3.convert("RGB").save(f"{OUT_DIR}/test_scene3.jpg", quality=95)

f4 = get_camera_frame(f"{REAL_UI_DIR}/04b_json_formatter_dark_active.png", zoom=1.2, pan_x=0.2, pan_y=0.05)
f4.convert("RGB").save(f"{OUT_DIR}/test_scene4.jpg", quality=95)

print("Test preview frames generated successfully!")
