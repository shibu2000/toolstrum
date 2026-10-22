#!/usr/bin/env python3
"""
Toolstrum - 30-Second Ultra-Creative Product Demo Commercial Generator
Captures and composites the REAL Toolstrum web application UI with smooth
cinematic camera movements, realistic cursor physics, interactive sliders,
live syntax-highlighted code snapping, pulsing offline security badges,
and an ambient upbeat electronic soundtrack.
"""

import os
import sys
import math
import struct
import wave
import subprocess
import shutil
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# Video specifications
WIDTH = 1920
HEIGHT = 1080
FPS = 30
TOTAL_FRAMES = 900  # Exactly 30.00 seconds

OUTPUT_DIR = "/Users/shibudhara11/Developer/toolstrum/video_output"
FRAMES_DIR = os.path.join(OUTPUT_DIR, "frames")
AUDIO_FILE = os.path.join(OUTPUT_DIR, "soundtrack.wav")
FINAL_VIDEO = "/Users/shibudhara11/Developer/toolstrum/toolstrum_product_demo.mp4"
REAL_UI_DIR = os.path.join(OUTPUT_DIR, "real_ui")
LOGO_PATH = "/Users/shibudhara11/Developer/toolstrum/video_output/perfect_toolstrum_logo.png"

os.makedirs(FRAMES_DIR, exist_ok=True)

# Fonts
FONT_HEAVY = "/System/Library/Fonts/Helvetica.ttc"
FONT_MONO = "/System/Library/Fonts/Menlo.ttc"

def get_font(size, bold=False, mono=False):
    path = FONT_MONO if mono else FONT_HEAVY
    try:
        index = 1 if bold and "Helvetica" in path else 0
        return ImageFont.truetype(path, size, index=index)
    except Exception:
        return ImageFont.load_default()

font_title_large = get_font(76, bold=True)
font_title_mid = get_font(48, bold=True)
font_tagline = get_font(26, bold=False)
font_url = get_font(40, bold=True)
font_badge_sm = get_font(18, bold=True)
font_badge_lg = get_font(24, bold=True)
font_code = get_font(20, bold=False, mono=True)
font_code_bold = get_font(20, bold=True, mono=True)
font_card = get_font(18, bold=True)
font_card_sub = get_font(14, bold=False)

# Easing functions
def ease_out_cubic(x):
    return 1 - pow(1 - x, 3)

def ease_in_out_quad(x):
    return 2 * x * x if x < 0.5 else 1 - pow(-2 * x + 2, 2) / 2

def ease_out_elastic(x):
    if x <= 0: return 0
    if x >= 1: return 1
    c4 = (2 * math.pi) / 3
    return pow(2, -10 * x) * math.sin((x * 10 - 0.75) * c4) + 1

def blend_colors(c1, c2, t):
    t = max(0.0, min(1.0, t))
    return (
        int(c1[0] + (c2[0] - c1[0]) * t),
        int(c1[1] + (c2[1] - c1[1]) * t),
        int(c1[2] + (c2[2] - c1[2]) * t),
    )

# Preload real UI screenshots into memory for lightning fast compositing
print("Preloading real UI screenshots...")
real_images = {}
for name in [
    "01_home_dashboard", "01b_hero_banner",
    "02a_pdf_empty", "02b_pdf_files_loaded", "02c_pdf_merged_success",
    "03b_image_resizer_loaded", "03c_image_resizer_processed",
    "04a_json_formatter_dark_empty", "04b_json_formatter_dark_active",
    "05_home_dark_full"
]:
    p = os.path.join(REAL_UI_DIR, f"{name}.png")
    if os.path.exists(p):
        real_images[name] = Image.open(p).convert("RGBA")
    else:
        print(f"Warning: {p} missing")

logo_img = Image.open(LOGO_PATH).convert("RGBA") if os.path.exists(LOGO_PATH) else None

def get_camera_view(img, zoom=1.0, pan_x=0.0, pan_y=0.0):
    """
    Sub-pixel crop & zoom from 3840x2160 Retina capture down to 1920x1080
    """
    orig_w, orig_h = img.size
    crop_w = orig_w / zoom
    crop_h = orig_h / zoom
    
    # pan_x, pan_y between -1.0 and 1.0
    center_x = (orig_w / 2.0) + (pan_x * (orig_w - crop_w) * 0.5)
    center_y = (orig_h / 2.0) + (pan_y * (orig_h - crop_h) * 0.5)
    
    x1 = max(0, min(orig_w - crop_w, center_x - crop_w / 2.0))
    y1 = max(0, min(orig_h - crop_h, center_y - crop_h / 2.0))
    x2 = x1 + crop_w
    y2 = y1 + crop_h
    
    cropped = img.crop((int(x1), int(y1), int(x2), int(y2)))
    return cropped.resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS)

def draw_modern_cursor(overlay, x, y, clicking=False, scale=1.0):
    points = [
        (x, y),
        (x, y + int(26 * scale)),
        (x + int(7 * scale), y + int(20 * scale)),
        (x + int(12 * scale), y + int(31 * scale)),
        (x + int(16 * scale), y + int(29 * scale)),
        (x + int(11 * scale), y + int(18 * scale)),
        (x + int(19 * scale), y + int(18 * scale)),
    ]
    draw = ImageDraw.Draw(overlay, "RGBA")
    # Soft shadow
    shadow_points = [(px + 3, py + 4) for px, py in points]
    draw.polygon(shadow_points, fill=(0, 0, 0, 80))
    # Fill & Outline
    draw.polygon(points, fill=(255, 255, 255, 255))
    draw.polygon(points, outline=(25, 25, 30, 240), width=2)
    
    if clicking:
        r = int(22 * scale)
        draw.ellipse([x - r, y - r, x + r, y + r], outline=(99, 102, 241, 220), width=3)
        draw.ellipse([x - r*1.6, y - r*1.6, x + r*1.6, y + r*1.6], outline=(168, 85, 247, 120), width=2)

def draw_floating_particles(overlay, t, count=25, seed=42):
    draw = ImageDraw.Draw(overlay, "RGBA")
    for i in range(count):
        px = ((i * 137.5 + t * 45) % WIDTH)
        py = ((i * 219.3 - t * 35) % HEIGHT)
        rad = 3 + (i % 6)
        alpha = int(40 + 35 * math.sin(t * 3.0 + i))
        col = (168, 85, 247, alpha) if i % 2 == 0 else (6, 182, 212, alpha)
        draw.ellipse([px - rad, py - rad, px + rad, py + rad], fill=col)

# ==============================================================
# SCENE 1: Real Toolstrum Home Dashboard & Hero Section (0s - 4.5s)
# Frames 0 - 134 (135 frames)
# ==============================================================
def render_scene_1(frame_idx):
    rel_idx = frame_idx
    progress = rel_idx / 134.0
    
    # Camera motion: Dolly-in from wide dashboard to hero banner
    zoom = 1.05 + 0.16 * ease_out_cubic(progress)
    pan_x = -0.3 + 0.18 * ease_in_out_quad(progress)
    pan_y = -0.35 + 0.12 * ease_in_out_quad(progress)
    
    base = get_camera_view(real_images["01_home_dashboard"], zoom=zoom, pan_x=pan_x, pan_y=pan_y)
    overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    
    # Floating particles drifting across hero banner
    draw_floating_particles(overlay, progress * 4.5, count=24)
    
    # Shimmer light beam across the gradient hero banner
    draw = ImageDraw.Draw(overlay, "RGBA")
    shimmer_x = int(-200 + progress * 2400)
    for off in range(-80, 80, 4):
        alpha = int(max(0, 30 - abs(off) * 0.35))
        draw.line([(shimmer_x + off, 100), (shimmer_x + off + 300, 600)], fill=(255, 255, 255, alpha), width=3)
        
    # Cursor gliding across screen to sidebar item "PDF Studio"
    cur_x = int(1400 - 1050 * ease_out_cubic(min(1.0, progress * 1.3)))
    cur_y = int(800 - 460 * ease_out_cubic(min(1.0, progress * 1.3)))
    clicking = progress > 0.82
    draw_modern_cursor(overlay, cur_x, cur_y, clicking=clicking, scale=1.1)
    
    # Subtle cinematic vignette
    vignette = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    vdraw = ImageDraw.Draw(vignette, "RGBA")
    vdraw.rectangle([0, 0, WIDTH, HEIGHT], outline=(15, 23, 42, 35), width=20)
    
    base.paste(overlay, (0, 0), overlay)
    base.paste(vignette, (0, 0), vignette)
    
    # Transition out (frames 125 - 134)
    if progress > 0.92:
        fade = (progress - 0.92) / 0.08
        fade_layer = Image.new("RGBA", (WIDTH, HEIGHT), (255, 255, 255, int(255 * fade * 0.6)))
        base.paste(fade_layer, (0, 0), fade_layer)
        
    return base.convert("RGB")

# ==============================================================
# SCENE 2: Real PDF Studio Merge Tool with Snapping & Checkmark (4.5s - 9.5s)
# Frames 135 - 284 (150 frames)
# ==============================================================
def render_scene_2(frame_idx):
    rel_idx = frame_idx - 135
    progress = rel_idx / 149.0
    
    # 3 phases:
    # Phase A (0.0 to 0.45): Empty dropzone, dragging 2 PDF cards toward center
    # Phase B (0.45 to 0.75): Files snap into queue with elastic bounce, button clicks, progress bar fills
    # Phase C (0.75 to 1.0): Success state with green checkmark ResultCard
    
    zoom = 1.15 + 0.08 * progress
    pan_x = 0.15 - 0.05 * progress
    pan_y = 0.05
    
    if progress < 0.45:
        base = get_camera_view(real_images["02a_pdf_empty"], zoom=zoom, pan_x=pan_x, pan_y=pan_y)
    elif progress < 0.75:
        base = get_camera_view(real_images["02b_pdf_files_loaded"], zoom=zoom, pan_x=pan_x, pan_y=pan_y)
    else:
        base = get_camera_view(real_images["02c_pdf_merged_success"], zoom=zoom, pan_x=pan_x, pan_y=pan_y)
        
    overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay, "RGBA")
    
    # Center target in camera coordinates
    drop_cx, drop_cy = 960, 480
    
    if progress < 0.45:
        # Dragging cards
        p_drag = progress / 0.45
        t_card = ease_in_out_quad(p_drag)
        
        # Two floating PDF cards carried by cursor
        card1_x = int(1400 + (drop_cx - 1400) * t_card)
        card1_y = int(240 + (drop_cy - 240) * t_card)
        
        card2_x = card1_x + 60
        card2_y = card1_y + 40
        
        # Draw Card 2 (Audited_Financials.pdf)
        draw.rounded_rectangle([card2_x - 120, card2_y - 45, card2_x + 120, card2_y + 45], radius=14, fill=(248, 250, 252, 240), outline=(239, 68, 68, 200), width=2)
        draw.rectangle([card2_x - 105, card2_y - 25, card2_x - 70, card2_y + 25], fill=(239, 68, 68, 220))
        draw.text((card2_x - 98, card2_y - 12), "PDF", font=font_badge_sm, fill=(255, 255, 255))
        draw.text((card2_x - 60, card2_y - 16), "Audited_Financials.pdf", font=font_card, fill=(15, 23, 42))
        draw.text((card2_x - 60, card2_y + 6), "1.8 MB • 14 Pages", font=font_card_sub, fill=(100, 116, 139))
        
        # Draw Card 1 (Quarterly_Report_2026.pdf)
        draw.rounded_rectangle([card1_x - 130, card1_y - 50, card1_x + 130, card1_y + 50], radius=14, fill=(255, 255, 255, 250), outline=(239, 68, 68, 230), width=2)
        draw.rectangle([card1_x - 115, card1_y - 28, card1_x - 75, card1_y + 28], fill=(239, 68, 68, 255))
        draw.text((card1_x - 108, card1_y - 14), "PDF", font=font_badge_sm, fill=(255, 255, 255))
        draw.text((card1_x - 65, card1_y - 18), "Quarterly_Report_2026.pdf", font=font_card, fill=(15, 23, 42))
        draw.text((card1_x - 65, card1_y + 6), "2.4 MB • 28 Pages", font=font_card_sub, fill=(100, 116, 139))
        
        # Cursor holding top card
        draw_modern_cursor(overlay, card1_x + 80, card1_y + 20, clicking=True, scale=1.1)
        
    elif progress < 0.75:
        # Snap completed, cursor clicks "Merge PDF Now" button, progress bar fills!
        p_proc = (progress - 0.45) / 0.30
        
        # Snapping elastic bounce on button
        btn_x, btn_y = 960, 680
        cur_x = int(960 + (btn_x - 960) * min(1.0, p_proc * 2.0))
        cur_y = int(480 + (btn_y - 480) * min(1.0, p_proc * 2.0))
        clicking = 0.2 < p_proc < 0.45
        
        # Dynamic emerald progress bar animation
        bar_fill = min(1.0, p_proc * 1.6)
        bar_w = 480
        bar_h = 14
        bx = int(WIDTH / 2 - bar_w / 2)
        by = 740
        
        draw.rounded_rectangle([bx, by, bx + bar_w, by + bar_h], radius=7, fill=(226, 232, 240, 200))
        fill_w = int(bar_w * bar_fill)
        if fill_w > 10:
            draw.rounded_rectangle([bx, by, bx + fill_w, by + bar_h], radius=7, fill=(16, 185, 129, 255))
            # Glowing spark on tip of progress bar
            draw.ellipse([bx + fill_w - 12, by - 5, bx + fill_w + 12, by + bar_h + 5], fill=(52, 211, 153, 200))
            
        draw.text((WIDTH / 2 - 80, by + 22), f"Merging Documents ({int(bar_fill * 100)}%)...", font=font_card_sub, fill=(16, 185, 129))
        draw_modern_cursor(overlay, cur_x, cur_y, clicking=clicking, scale=1.05)
        
    else:
        # Success state: ResultCard with checkmark + Confetti sparkles!
        p_succ = (progress - 0.75) / 0.25
        confetti_count = int(min(40, p_succ * 50))
        for c in range(confetti_count):
            angle = (c * 37.0) % 360
            dist = 80 + p_succ * 260 * (1 + (c % 4) * 0.25)
            rad = math.radians(angle)
            cx = int(drop_cx + dist * math.cos(rad))
            cy = int(drop_cy + dist * math.sin(rad))
            col = [(16, 185, 129), (99, 102, 241), (236, 72, 153), (245, 158, 11)][c % 4]
            draw.rectangle([cx - 4, cy - 4, cx + 4, cy + 4], fill=col + (int(220 * (1.0 - p_succ * 0.4)),))
            
        # Success badge glowing over ResultCard
        draw_modern_cursor(overlay, 960, 620, clicking=False, scale=1.0)
        
    base.paste(overlay, (0, 0), overlay)
    return base.convert("RGB")

# ==============================================================
# SCENE 3: Real Image Studio with Live Before/After Interactive Slider (9.5s - 14.5s)
# Frames 285 - 434 (150 frames)
# ==============================================================
def render_scene_3(frame_idx):
    rel_idx = frame_idx - 285
    progress = rel_idx / 149.0
    
    # Camera gently tracks the interactive slider
    zoom = 1.18 + 0.05 * math.sin(progress * math.pi)
    pan_x = 0.12
    pan_y = 0.04
    
    # Base is the real Image Resizer UI loaded
    base = get_camera_view(real_images["03b_image_resizer_loaded"], zoom=zoom, pan_x=pan_x, pan_y=pan_y)
    overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay, "RGBA")
    
    # Image preview bounding box in camera coordinates
    box_x1, box_y1 = 820, 240
    box_x2, box_y2 = 1680, 780
    box_w = box_x2 - box_x1
    box_h = box_y2 - box_y1
    
    # Interactive Slider position: travels from 25% to 80% across the image
    p_slide = ease_in_out_quad(min(1.0, max(0.0, (progress - 0.12) / 0.65)))
    slider_pct = 0.28 + 0.52 * p_slide
    split_x = int(box_x1 + box_w * slider_pct)
    
    # Draw slider vertical split line with glow
    draw.line([(split_x, box_y1), (split_x, box_y2)], fill=(255, 255, 255, 250), width=4)
    draw.line([(split_x - 2, box_y1), (split_x - 2, box_y2)], fill=(16, 185, 129, 120), width=2)
    draw.line([(split_x + 2, box_y1), (split_x + 2, box_y2)], fill=(99, 102, 241, 120), width=2)
    
    # Slider Handle: Frosted glass circle with dual arrows ◀ ▶
    handle_y = int((box_y1 + box_y2) / 2)
    draw.ellipse([split_x - 24, handle_y - 24, split_x + 24, handle_y + 24], fill=(255, 255, 255, 240), outline=(16, 185, 129, 240), width=3)
    draw.polygon([(split_x - 14, handle_y), (split_x - 6, handle_y - 6), (split_x - 6, handle_y + 6)], fill=(16, 185, 129, 255))
    draw.polygon([(split_x + 14, handle_y), (split_x + 6, handle_y - 6), (split_x + 6, handle_y + 6)], fill=(16, 185, 129, 255))
    
    # Floating Badges: BEFORE (Original) and AFTER (Optimized)
    draw.rounded_rectangle([box_x1 + 20, box_y1 + 20, box_x1 + 180, box_y1 + 60], radius=8, fill=(15, 23, 42, 210))
    draw.text((box_x1 + 35, box_y1 + 28), "ORIGINAL • 4.2 MB", font=font_badge_sm, fill=(255, 255, 255))
    
    draw.rounded_rectangle([box_x2 - 200, box_y1 + 20, box_x2 - 20, box_y1 + 60], radius=8, fill=(16, 185, 129, 230))
    draw.text((box_x2 - 185, box_y1 + 28), "RESIZED • 820 KB", font=font_badge_sm, fill=(255, 255, 255))
    
    # Cursor controls the slider, then moves to Resize button
    if progress < 0.75:
        cur_x = split_x
        cur_y = handle_y
        clicking = 0.15 < progress < 0.72
    else:
        # Moves down to "Resize Image Now" button
        p_btn = (progress - 0.75) / 0.25
        cur_x = int(split_x + (520 - split_x) * ease_out_cubic(p_btn))
        cur_y = int(handle_y + (830 - handle_y) * ease_out_cubic(p_btn))
        clicking = p_btn > 0.4
        
        # Savings Pill pops up: 68% Smaller 🎉
        pop_scale = ease_out_elastic(min(1.0, p_btn * 2.0))
        if pop_scale > 0.1:
            pw, ph = int(240 * pop_scale), int(56 * pop_scale)
            px, py = int(1250 - pw / 2), int(720 - ph / 2)
            draw.rounded_rectangle([px, py, px + pw, py + ph], radius=16, fill=(16, 185, 129, 245), outline=(255, 255, 255, 220), width=2)
            if pop_scale > 0.8:
                draw.text((px + 24, py + 14), "68% Smaller 🎉", font=font_badge_lg, fill=(255, 255, 255))
                
    draw_modern_cursor(overlay, cur_x, cur_y, clicking=clicking, scale=1.05)
    
    base.paste(overlay, (0, 0), overlay)
    return base.convert("RGB")

# ==============================================================
# SCENE 4: Real Developer Studio with Dark Mode Snap & Formatted Code (14.5s - 19.5s)
# Frames 435 - 584 (150 frames)
# ==============================================================
def render_scene_4(frame_idx):
    rel_idx = frame_idx - 435
    progress = rel_idx / 149.0
    
    # Phase 1: Header Dark Mode Toggle Flash (frames 0 to 20)
    # Phase 2: Typing raw JSON into editor (frames 20 to 80)
    # Phase 3: Click Beautify & instantaneous syntax highlighting snap! (frames 80 to 150)
    
    zoom = 1.22 + 0.05 * progress
    pan_x = 0.18
    pan_y = 0.02
    
    base = get_camera_view(real_images["04b_json_formatter_dark_active"], zoom=zoom, pan_x=pan_x, pan_y=pan_y)
    overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay, "RGBA")
    
    # Dark Mode toggle wave in the first 20 frames
    if progress < 0.14:
        wave_r = int((progress / 0.14) * 2200)
        # Invert flash
        flash_alpha = int((1.0 - (progress / 0.14)) * 180)
        draw.rectangle([0, 0, WIDTH, HEIGHT], fill=(255, 255, 255, flash_alpha))
        
    # Code Editor bounds in camera coordinate space
    ed_x1, ed_y1 = 440, 260
    ed_x2, ed_y2 = 1720, 840
    
    raw_full = '{"name":"Toolstrum","version":"2.0","offline":true,"compute":"WebAssembly","speed":"instant","tools":300}'
    
    if progress < 0.52:
        # Phase 2: Live typing of raw JSON into the input box
        p_type = progress / 0.52
        chars_typed = int(len(raw_full) * ease_out_cubic(p_type))
        current_text = raw_full[:chars_typed]
        
        # Draw editor background overlay
        draw.rounded_rectangle([ed_x1, ed_y1, ed_x2, ed_y2], radius=16, fill=(15, 23, 42, 240), outline=(51, 65, 85, 220), width=2)
        draw.text((ed_x1 + 30, ed_y1 + 20), "JSON Input (Raw / Minified)", font=font_badge_sm, fill=(148, 163, 184))
        
        # Text wrapping
        draw.text((ed_x1 + 30, ed_y1 + 70), current_text, font=font_code, fill=(226, 232, 240))
        
        # Blinking cursor
        if int(rel_idx / 4) % 2 == 0:
            bbox = font_code.getbbox(current_text) if current_text else (0, 0, 0, 0)
            cx = ed_x1 + 30 + (bbox[2] - bbox[0]) + 4
            draw.line([(cx, ed_y1 + 68), (cx, ed_y1 + 92)], fill=(56, 189, 248), width=3)
            
        cur_x = ed_x1 + 30 + int(p_type * 600)
        cur_y = ed_y1 + 80
        draw_modern_cursor(overlay, cur_x, cur_y, clicking=False, scale=1.0)
        
    else:
        # Phase 3: Beautified & Syntax-Highlighted Code Snapped!
        p_snapped = (progress - 0.52) / 0.48
        bounce = ease_out_elastic(min(1.0, p_snapped * 2.2))
        
        draw.rounded_rectangle([ed_x1, ed_y1, ed_x2, ed_y2], radius=16, fill=(15, 23, 42, 250), outline=(56, 189, 248, int(200 * min(1.0, bounce))), width=2)
        
        # Header bar of code editor
        draw.rectangle([ed_x1, ed_y1, ed_x2, ed_y1 + 48], fill=(30, 41, 59, 220))
        # Mac dots
        draw.ellipse([ed_x1 + 20, ed_y1 + 18, ed_x1 + 32, ed_y1 + 30], fill=(239, 68, 68))
        draw.ellipse([ed_x1 + 42, ed_y1 + 18, ed_x1 + 54, ed_y1 + 30], fill=(245, 158, 11))
        draw.ellipse([ed_x1 + 64, ed_y1 + 18, ed_x1 + 76, ed_y1 + 30], fill=(16, 185, 129))
        draw.text((ed_x1 + 100, ed_y1 + 14), "Formatted JSON Output • 2 Spaces", font=font_code, fill=(148, 163, 184))
        
        # Valid JSON badge
        draw.rounded_rectangle([ed_x2 - 280, ed_y1 + 10, ed_x2 - 20, ed_y1 + 40], radius=8, fill=(16, 185, 129, 40), outline=(16, 185, 129, 180), width=1)
        draw.text((ed_x2 - 265, ed_y1 + 14), "✓ Valid JSON (0.8ms)", font=font_badge_sm, fill=(52, 211, 153))
        
        # Syntax Highlighted Code Lines
        code_lines = [
            [("{", (203, 213, 225))],
            [("  \"name\": ", (56, 189, 248)), ("\"Toolstrum\",", (52, 211, 153))],
            [("  \"version\": ", (56, 189, 248)), ("\"2.0 Enterprise\",", (52, 211, 153))],
            [("  \"offline\": ", (56, 189, 248)), ("true,", (251, 191, 36))],
            [("  \"compute\": ", (56, 189, 248)), ("\"Client-Side WebAssembly\",", (52, 211, 153))],
            [("  \"encryption\": ", (56, 189, 248)), ("\"AES-256-GCM\",", (52, 211, 153))],
            [("  \"speed\": ", (56, 189, 248)), ("\"Instant\",", (52, 211, 153))],
            [("  \"tools\": ", (56, 189, 248)), ("300", (167, 139, 250))],
            [("}", (203, 213, 225))]
        ]
        
        line_y = ed_y1 + 68
        for i, line_tokens in enumerate(code_lines):
            # Line number
            draw.text((ed_x1 + 25, line_y), f"{i+1:2d}", font=font_code, fill=(71, 85, 105))
            cur_lx = ed_x1 + 80
            for text, col in line_tokens:
                draw.text((cur_lx, line_y), text, font=font_code_bold if col == (56, 189, 248) else font_code, fill=col)
                bbox = font_code.getbbox(text)
                cur_lx += (bbox[2] - bbox[0])
            line_y += 34
            
        cur_x = ed_x2 - 140
        cur_y = ed_y1 + 25
        clicking = p_snapped < 0.25
        draw_modern_cursor(overlay, cur_x, cur_y, clicking=clicking, scale=1.0)
        
    base.paste(overlay, (0, 0), overlay)
    return base.convert("RGB")

# ==============================================================
# SCENE 5: "100% Offline • No Upload" Security Badge Macro (19.5s - 24.0s)
# Frames 585 - 719 (135 frames)
# ==============================================================
def render_scene_5(frame_idx):
    rel_idx = frame_idx - 585
    progress = rel_idx / 134.0
    
    # Ultra-clean minimalist dark background with ambient glow
    base = Image.new("RGBA", (WIDTH, HEIGHT), (10, 15, 29, 255))
    overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay, "RGBA")
    
    # Background radial glow
    cx, cy = WIDTH // 2, HEIGHT // 2 - 30
    
    # Ambient grid pattern
    for gx in range(0, WIDTH, 80):
        draw.line([(gx, 0), (gx, HEIGHT)], fill=(30, 41, 59, 45), width=1)
    for gy in range(0, HEIGHT, 80):
        draw.line([(0, gy), (WIDTH, gy)], fill=(30, 41, 59, 45), width=1)
        
    # Concentric Radar Pulse Rings expanding outward in 120 BPM sync
    beat_t = (rel_idx / 15.0) % 1.0  # 2 pulses per second
    for ring in range(3):
        r_phase = (beat_t + ring * 0.33) % 1.0
        r_radius = int(80 + r_phase * 340)
        r_alpha = int((1.0 - r_phase) * 140)
        draw.ellipse([cx - r_radius, cy - r_radius, cx + r_radius, cy + r_radius], outline=(16, 185, 129, r_alpha), width=2)
        
    # Floating security glint particles
    for p in range(18):
        px = (p * 107 + rel_idx * 2) % WIDTH
        py = (p * 83 - rel_idx * 1.5) % HEIGHT
        p_alpha = int(60 + 50 * math.sin(rel_idx * 0.1 + p))
        draw.ellipse([px - 3, py - 3, px + 3, py + 3], fill=(56, 189, 248, p_alpha))
        
    # Hero Security Badge (The Authentic Toolstrum Security Pill)
    badge_w = 640
    badge_h = 96
    bx1 = cx - badge_w // 2
    by1 = cy - badge_h // 2
    bx2 = cx + badge_w // 2
    by2 = cy + badge_h // 2
    
    # Outer glow halo
    for g in range(12, 0, -2):
        draw.rounded_rectangle([bx1 - g, by1 - g, bx2 + g, by2 + g], radius=48 + g, outline=(16, 185, 129, int(15 - g)), width=2)
        
    # Main Glass Badge Pill
    draw.rounded_rectangle([bx1, by1, bx2, by2], radius=48, fill=(15, 23, 42, 240), outline=(16, 185, 129, 240), width=3)
    
    # Emerald Shield Icon
    sx = bx1 + 60
    sy = cy
    draw.polygon([(sx, sy - 24), (sx + 20, sy - 14), (sx + 20, sy + 6), (sx, sy + 24), (sx - 20, sy + 6), (sx - 20, sy - 14)], fill=(16, 185, 129, 255))
    # Checkmark inside shield
    draw.line([(sx - 8, sy), (sx - 2, sy + 7), (sx + 8, sy - 8)], fill=(255, 255, 255, 255), width=3)
    
    # Badge Headline Text
    draw.text((bx1 + 105, cy - 18), "100% Offline • No Upload", font=font_title_mid, fill=(255, 255, 255))
    
    # Secondary reassurance subtitle below
    sub_text = "Zero Data Leaves Your Device • Processed 100% Locally"
    draw.text((cx - 290, cy + 85), sub_text, font=font_tagline, fill=(148, 163, 184))
    
    # Micro spec badges
    specs = ["Client-Side WASM", "No Cloud Storage", "Complete Privacy"]
    spec_x = cx - 270
    for s in specs:
        draw.rounded_rectangle([spec_x, cy + 140, spec_x + 160, cy + 175], radius=18, fill=(30, 41, 59, 180), outline=(51, 65, 85, 180), width=1)
        draw.text((spec_x + 15, cy + 148), s, font=font_card_sub, fill=(52, 211, 153))
        spec_x += 185
        
    base.paste(overlay, (0, 0), overlay)
    return base.convert("RGB")

# ==============================================================
# SCENE 6: Commercial Finale & Authentic Brand Logo Reveal (24.0s - 30.0s)
# Frames 720 - 899 (180 frames = 6 seconds)
# ==============================================================
def render_scene_6(frame_idx):
    rel_idx = frame_idx - 720
    progress = rel_idx / 179.0
    
    # Deep indigo-to-violet gradient background (#483EE5 to #9C48EA)
    c_start = (72, 62, 229)    # #483EE5
    c_end = (156, 72, 234)     # #9C48EA
    
    # Render rich gradient base
    base = Image.new("RGBA", (WIDTH, HEIGHT))
    bdraw = ImageDraw.Draw(base, "RGBA")
    for y in range(HEIGHT):
        t_grad = y / HEIGHT
        col = blend_colors(c_start, c_end, t_grad)
        bdraw.line([(0, y), (WIDTH, y)], fill=col)
        
    overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay, "RGBA")
    
    # Soft ambient light rays sweeping gently
    ray_t = progress * 2.0
    for r in range(8):
        rx = int(WIDTH * 0.1 + r * 220 + math.sin(ray_t + r) * 60)
        draw.polygon([(rx - 60, 0), (rx + 60, 0), (rx + 280, HEIGHT), (rx + 120, HEIGHT)], fill=(255, 255, 255, 12))
        
    # Floating stardust particles
    for p in range(35):
        px = (p * 67 + rel_idx * 1.8) % WIDTH
        py = (p * 93 - rel_idx * 1.2) % HEIGHT
        p_alpha = int(45 + 40 * math.sin(rel_idx * 0.08 + p))
        draw.ellipse([px - 2, py - 2, px + 2, py + 2], fill=(255, 255, 255, p_alpha))
        
    # Camera Dolly-in: scale increases smoothly from 0.88 to 1.05
    dolly_scale = 0.88 + 0.17 * ease_out_cubic(progress)
    cx, cy = WIDTH // 2, HEIGHT // 2 - 50
    
    # Draw Authentic Toolstrum Logo
    if logo_img:
        logo_sz = int(220 * dolly_scale)
        logo_resized = logo_img.resize((logo_sz, logo_sz), Image.Resampling.LANCZOS)
        lx = cx - logo_sz // 2
        ly = cy - logo_sz // 2 - 80
        
        # Logo outer soft ambient radial glow
        glow_r = int(logo_sz * 0.75)
        for g in range(glow_r, 0, -6):
            g_alpha = int((1.0 - g / glow_r) * 35)
            draw.ellipse([cx - g, (ly + logo_sz // 2) - g, cx + g, (ly + logo_sz // 2) + g], fill=(255, 255, 255, g_alpha))
            
        overlay.paste(logo_resized, (lx, ly), logo_resized)
        
    # Headline "Toolstrum"
    title_y = cy + 60
    draw.text((cx - 170, title_y), "Toolstrum", font=font_title_large, fill=(255, 255, 255))
    
    # Tagline "Your Everyday Offline Toolkit"
    tag_y = title_y + 90
    draw.text((cx - 190, tag_y), "Your Everyday Offline Toolkit", font=font_tagline, fill=(224, 231, 255))
    
    # URL Pill Badge: toolstrum.vercel.app (fades in smoothly at progress > 0.25)
    url_y = tag_y + 60
    url_p = min(1.0, max(0.0, (progress - 0.25) / 0.50))
    if url_p > 0:
        url_alpha = int(255 * ease_out_cubic(url_p))
        pill_w = 480
        pill_h = 68
        px1 = cx - pill_w // 2
        py1 = url_y
        px2 = cx + pill_w // 2
        py2 = url_y + pill_h
        
        draw.rounded_rectangle([px1, py1, px2, py2], radius=34, fill=(255, 255, 255, url_alpha), outline=(199, 210, 254, url_alpha), width=2)
        draw.text((cx - 195, py1 + 14), "toolstrum.vercel.app", font=font_url, fill=(79, 70, 229, url_alpha))
        
    # Features pill below: 300+ Tools • 100% Private • Free & Open
    feat_y = url_y + 85
    draw.text((cx - 240, feat_y), "300+ Local Tools  •  100% Client-Side  •  No Sign Up", font=font_badge_sm, fill=(238, 242, 255, 220))
    
    base.paste(overlay, (0, 0), overlay)
    
    # Final fade to black in last 20 frames
    if progress > 0.90:
        fade_out = (progress - 0.90) / 0.10
        black_layer = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, int(255 * fade_out)))
        base.paste(black_layer, (0, 0), black_layer)
        
    return base.convert("RGB")

# ==============================================================
# AUDIO GENERATOR: HIGH-ENERGY SAAS COMMERCIAL SOUNDTRACK
# ==============================================================
def generate_soundtrack():
    print(f"Synthesizing high-energy electronic commercial soundtrack ({AUDIO_FILE})...")
    sample_rate = 44100
    duration_s = 30.0
    total_samples = int(sample_rate * duration_s)
    
    audio_frames = bytearray()
    
    # 120 BPM Electronic chord progression:
    # C major (261.63) -> G major (196.00) -> A minor (220.00) -> F major (174.61)
    chords = [
        [261.63, 329.63, 392.00, 523.25], # C
        [196.00, 246.94, 293.66, 392.00], # G
        [220.00, 261.63, 329.63, 440.00], # Am
        [174.61, 220.00, 261.63, 349.23], # F
    ]
    
    for i in range(total_samples):
        t = i / sample_rate
        bar_idx = int(t / 2.0) % 4
        chord = chords[bar_idx]
        
        # 1. Warm Analog Bass (Sub-Bass)
        root_freq = chord[0] / 2.0
        sub_bass = 0.28 * math.sin(2 * math.pi * root_freq * t)
        
        # 2. Tech Arpeggiator (16th notes: 8 notes/sec)
        arp_step = int(t * 8) % len(chord)
        arp_freq = chord[arp_step] * (1.0 if arp_step < 2 else 2.0)
        arp_env = math.exp(-7.0 * ((t * 8) % 1.0))
        arp = 0.22 * math.sin(2 * math.pi * arp_freq * t) * arp_env
        
        # 3. Ambient Synth Pad
        pad = 0.12 * (
            math.sin(2 * math.pi * chord[0] * t) +
            math.sin(2 * math.pi * chord[1] * t) +
            math.sin(2 * math.pi * chord[2] * t)
        )
        
        # 4. Punchy Beat: Soft modern tech kick on beats, shaker hi-hat on offbeats
        beat_t = (t * 2.0) % 1.0
        kick = 0.32 * math.sin(2 * math.pi * (120 - beat_t * 75) * beat_t) * math.exp(-12.0 * beat_t) if beat_t < 0.22 else 0.0
        hat_t = (t * 4.0) % 1.0
        hat = 0.08 * (math.sin(i * 1234.567) % 1.0 - 0.5) * math.exp(-28.0 * hat_t)
        
        # 5. Synced Interactive Sound FX:
        # Scene 2 (t=8.2s): Merge Success Chime
        sfx_chime = 0.0
        if 8.2 <= t <= 10.2:
            dt = t - 8.2
            sfx_chime = 0.35 * (math.sin(2 * math.pi * 1046.50 * dt) + 0.5 * math.sin(2 * math.pi * 1318.51 * dt)) * math.exp(-3.5 * dt)
            
        # Scene 3 (t=12.5s): Image Resizer snap sound
        sfx_snap = 0.0
        if 12.5 <= t <= 13.5:
            dt = t - 12.5
            sfx_snap = 0.25 * math.sin(2 * math.pi * 880.0 * dt) * math.exp(-6.0 * dt)
            
        # Scene 4 (t=17.2s): Code formatter snap
        sfx_code = 0.0
        if 17.2 <= t <= 18.2:
            dt = t - 17.2
            sfx_code = 0.30 * math.sin(2 * math.pi * 1174.66 * dt) * math.exp(-5.0 * dt)
            
        # Scene 6 (t=24.5s): Commercial swell riser
        sfx_swell = 0.0
        if 23.5 <= t <= 25.5:
            dt = t - 23.5
            sfx_swell = 0.20 * math.sin(2 * math.pi * (400 + dt * 250) * dt) * (dt / 2.0)
            
        sample_val = sub_bass + arp + pad + kick + hat + sfx_chime + sfx_snap + sfx_code + sfx_swell
        
        # Master volume envelope (fade-in 1.0s, fade-out last 1.8s)
        fade_in = min(1.0, t / 1.0)
        fade_out = max(0.0, min(1.0, (30.0 - t) / 1.8))
        sample_val *= fade_in * fade_out
        
        # Clamp to 16-bit PCM
        int_val = int(max(-32767, min(32767, sample_val * 32767 * 0.72)))
        audio_frames.extend(struct.pack("<hh", int_val, int_val))
        
    with wave.open(AUDIO_FILE, "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        wf.writeframes(audio_frames)
    print(f"Soundtrack successfully rendered: {AUDIO_FILE}")

# ==============================================================
# MAIN ENGINE
# ==============================================================
def main():
    print(f"Starting Toolstrum Product Demo Rendering ({TOTAL_FRAMES} frames @ {FPS} fps)...")
    
    # 1. Synthesize Audio
    generate_soundtrack()
    
    # 2. Render video frames (re-render Scene 6 with fixed transparent logo)
    for idx in range(TOTAL_FRAMES):
        frame_path = os.path.join(FRAMES_DIR, f"frame_{idx:04d}.jpg")
        
        # Only re-render if missing or Scene 6
        if os.path.exists(frame_path) and idx < 720:
            continue
            
        if idx < 135:
            frame = render_scene_1(idx)
        elif idx < 285:
            frame = render_scene_2(idx)
        elif idx < 435:
            frame = render_scene_3(idx)
        elif idx < 585:
            frame = render_scene_4(idx)
        elif idx < 720:
            frame = render_scene_5(idx)
        else:
            frame = render_scene_6(idx)
            
        frame.save(frame_path, "JPEG", quality=95)
        
        if (idx + 1) % 30 == 0 or idx == TOTAL_FRAMES - 1:
            print(f"Rendering: Frame {idx + 1}/{TOTAL_FRAMES} ({((idx + 1)/TOTAL_FRAMES)*100:.1f}%)")
            
    print("All 900 high-definition frames rendered!")
    
    # Save preview frames for artifact presentation
    preview_indices = [60, 210, 360, 510, 650, 810]
    artifact_dir = "/Users/shibudhara11/.gemini/antigravity-cli/brain/2d0ec898-15c8-473c-bf51-16b0ea1d40c2"
    scene_names = ["scene1_hero.jpg", "scene2_pdf.jpg", "scene3_image.jpg", "scene4_code.jpg", "scene5_offline.jpg", "scene6_logo.jpg"]
    for p_idx, s_name in zip(preview_indices, scene_names):
        src = os.path.join(FRAMES_DIR, f"frame_{p_idx:04d}.jpg")
        dst = os.path.join(artifact_dir, s_name)
        if os.path.exists(src):
            shutil.copy2(src, dst)
            print(f"Saved preview: {dst}")
            
    # 3. Assemble with native FFmpeg
    ffmpeg_bin = "/Users/shibudhara11/Developer/toolstrum/video_output/node_modules/ffmpeg-static/ffmpeg"
    if not os.path.exists(ffmpeg_bin):
        ffmpeg_bin = shutil.which("ffmpeg") or "/opt/homebrew/bin/ffmpeg"
        
    cmd = [
        ffmpeg_bin,
        "-y",
        "-r", str(FPS),
        "-i", os.path.join(FRAMES_DIR, "frame_%04d.jpg"),
        "-i", AUDIO_FILE,
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-crf", "18",
        "-preset", "fast",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        FINAL_VIDEO
    ]
    print(f"Compiling video with FFmpeg: {' '.join(cmd)}")
    subprocess.run(cmd, check=True)
    
    # Copy final video to artifacts directory
    artifact_video = os.path.join(artifact_dir, "toolstrum_product_demo.mp4")
    shutil.copy2(FINAL_VIDEO, artifact_video)
    print(f"SUCCESS! Broadcast-quality Product Demo Video generated at: {FINAL_VIDEO}")
    print(f"Copied to artifact directory: {artifact_video}")

if __name__ == "__main__":
    main()
