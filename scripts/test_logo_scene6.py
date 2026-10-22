import os
from PIL import Image, ImageDraw, ImageFont

WIDTH = 1920
HEIGHT = 1080

logo_img = Image.open('/Users/shibudhara11/Developer/toolstrum/video_output/real_logo_512.png').convert("RGBA")
print(f"Loaded logo: {logo_img.size}, mode={logo_img.mode}")

# Create background
c_start = (72, 62, 229)    # #483EE5
c_end = (156, 72, 234)     # #9C48EA

base = Image.new("RGBA", (WIDTH, HEIGHT))
bdraw = ImageDraw.Draw(base, "RGBA")
for y in range(HEIGHT):
    t_grad = y / HEIGHT
    col = (
        int(c_start[0] + (c_end[0] - c_start[0]) * t_grad),
        int(c_start[1] + (c_end[1] - c_start[1]) * t_grad),
        int(c_start[2] + (c_end[2] - c_start[2]) * t_grad),
    )
    bdraw.line([(0, y), (WIDTH, y)], fill=col)

overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
draw = ImageDraw.Draw(overlay, "RGBA")

cx, cy = WIDTH // 2, HEIGHT // 2 - 50

# Draw logo
logo_sz = 220
logo_resized = logo_img.resize((logo_sz, logo_sz), Image.Resampling.LANCZOS)
lx = cx - logo_sz // 2
ly = cy - logo_sz // 2 - 70

# Outer soft ambient glow around logo
glow_r = int(logo_sz * 0.7)
for g in range(glow_r, 0, -6):
    g_alpha = int((1.0 - g / glow_r) * 40)
    draw.ellipse([cx - g, (ly + logo_sz // 2) - g, cx + g, (ly + logo_sz // 2) + g], fill=(255, 255, 255, g_alpha))

overlay.paste(logo_resized, (lx, ly), logo_resized)

# Font
try:
    font_title = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 76, index=1)
    font_tag = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 26, index=0)
    font_url = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 40, index=1)
    font_badge = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 18, index=1)
except Exception:
    font_title = font_tag = font_url = font_badge = ImageFont.load_default()

title_y = cy + 60
draw.text((cx - 170, title_y), "Toolstrum", font=font_title, fill=(255, 255, 255))

tag_y = title_y + 90
draw.text((cx - 190, tag_y), "Your Everyday Offline Toolkit", font=font_tag, fill=(224, 231, 255))

url_y = tag_y + 60
pill_w = 480
pill_h = 68
px1 = cx - pill_w // 2
py1 = url_y
px2 = cx + pill_w // 2
py2 = url_y + pill_h

draw.rounded_rectangle([px1, py1, px2, py2], radius=34, fill=(255, 255, 255, 255), outline=(199, 210, 254, 255), width=2)
draw.text((cx - 195, py1 + 14), "toolstrum.vercel.app", font=font_url, fill=(79, 70, 229, 255))

feat_y = url_y + 85
draw.text((cx - 240, feat_y), "300+ Local Tools  •  100% Client-Side  •  No Sign Up", font=font_badge, fill=(238, 242, 255, 220))

base.paste(overlay, (0, 0), overlay)
base.convert("RGB").save("/Users/shibudhara11/Developer/toolstrum/video_output/test_scene6_rendered.png")
print("Saved /Users/shibudhara11/Developer/toolstrum/video_output/test_scene6_rendered.png")
