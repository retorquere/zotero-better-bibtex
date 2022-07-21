
import math

size = 20
strokeWidth = 2
radius = (size - strokeWidth) / 2
circumference = radius * math.pi * 2

states = list(range(101))

with open('skin/progress.svg', 'w') as svg:
  print('<?xml version="1.0" encoding="UTF-8" standalone="no"?>', file=svg)
  print(f'<svg xmlns="http://www.w3.org/2000/svg" width="{size * len(states)}" height="{size}" viewBox="0 0 {size * len(states)} {size}">', file=svg)
  for i, progress in enumerate(states):
    print(progress)
    dash = (progress * circumference) / 100
    print(f'<circle fill="none" stroke="#ccc" cx="{size / 2}" cy="{size / 2}" r="{radius}" stroke-width="{strokeWidth}px" transform="translate({i * 20} 0)"></circle>', file=svg)
    print(f'<circle fill="none" stroke="green" cx="{size / 2}" cy="{size / 2}" r="{radius}" stroke-width="{strokeWidth}px" transform="translate({i * 20} 0) rotate(-90 {size/ 2} {size/ 2})" stroke-dasharray="{dash},{circumference - dash}" stroke-linecap="round"></circle>', file=svg)
  print('</svg>', file=svg)
