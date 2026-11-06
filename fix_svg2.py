import pathlib
p=pathlib.Path('src/components/learning/chess/ChessPieceSvg.tsx')
s=p.read_text()
s=s.replace("  size?: number | string;\n", "  size?: number | string;\n  pieceSet?: 'classic' | 'fun';\n", 1)
p.write_text(s)
print('ok')