"""
Colorize the downloaded mosque icon:
- Green dome
- White minarets  
- Gold crescents
- Dark purple background
"""
from PIL import Image, ImageDraw
import os

def colorize_mosque():
    src = Image.open('public/mosque-downloaded.png').convert('RGBA')
    s = 256
    img = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Dark purple background
    draw.rounded_rectangle([0, 0, s-1, s-1], radius=48, fill=(18, 12, 40))
    
    # Convert source to numpy-like access
    src_data = src.load()
    
    # The downloaded icon is black silhouette on white
    # Let's trace the shapes and redraw with colors
    # Actually let's just create a clean mosque from scratch - clear shapes
    
    # LEFT MINARET (white body)
    draw.rounded_rectangle([28, 45, 52, 195], radius=3, fill=(240, 240, 245))
    # Left minaret top (green)
    draw.ellipse([24, 32, 56, 55], fill=(0, 200, 130))
    # Left crescent
    draw.ellipse([33, 18, 47, 32], fill=(240, 200, 50))
    draw.ellipse([35, 16, 49, 30], fill=(18, 12, 40))
    
    # RIGHT MINARET (white body)
    draw.rounded_rectangle([204, 45, 228, 195], radius=3, fill=(240, 240, 245))
    # Right minaret top (green)
    draw.ellipse([200, 32, 232, 55], fill=(0, 200, 130))
    # Right crescent
    draw.ellipse([209, 18, 223, 32], fill=(240, 200, 50))
    draw.ellipse([211, 16, 225, 30], fill=(18, 12, 40))
    
    # MAIN DOME (green, centered)
    draw.ellipse([55, 55, 201, 155], fill=(0, 210, 130))
    
    # Dome crescent (gold)
    draw.ellipse([118, 40, 138, 56], fill=(240, 200, 50))
    draw.ellipse([120, 38, 140, 52], fill=(18, 12, 40))
    
    # BASE WALL (green, connects minarets)
    draw.rounded_rectangle([40, 140, 216, 195], radius=4, fill=(0, 180, 120))
    
    # DOOR (dark arch)
    draw.rounded_rectangle([108, 150, 148, 195], radius=18, fill=(18, 12, 40))
    
    # Left window (small dark)
    draw.ellipse([75, 155, 100, 180], fill=(18, 12, 40))
    # Right window (small dark)  
    draw.ellipse([156, 155, 181, 180], fill=(18, 12, 40))
    
    # Save all sizes
    out_dir = 'public'
    sizes = [16, 24, 32, 48, 64, 128, 256]
    images = []
    
    for sz in sizes:
        resized = img.resize((sz, sz), Image.Resampling.LANCZOS)
        resized.save(os.path.join(out_dir, 'favicon-{}.png'.format(sz)), 'PNG')
        print('  favicon-{}.png'.format(sz))
        images.append(resized)
    
    # Save main favicon.png
    img.save(os.path.join(out_dir, 'favicon.png'), 'PNG')
    print('  favicon.png (256)')
    
    # Save ICO
    ico_path = os.path.join(out_dir, 'favicon.ico')
    images[0].save(ico_path, format='ICO',
        sizes=[(sz, sz) for sz in sizes],
        append_images=images[1:])
    print('  favicon.ico ({} KB)'.format(round(os.path.getsize(ico_path)/1024, 1)))

if __name__ == '__main__':
    colorize_mosque()
