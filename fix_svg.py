import pathlib
p=pathlib.Path('src/components/learning/chess/ChessPieceSvg.tsx')
s=p.read_text()
# add pieceSet to interface
s=s.replace(
"""interface ChessPieceSvgProps {
  type: PieceType;
  color: Color;
  className?: string;
  size?: number | string;
}""",
"""interface ChessPieceSvgProps {
  type: PieceType;
  color: Color;
  className?: string;
  size?: number | string;
  pieceSet?: 'classic' | 'fun';
}""")
# remove stray interface-style line from destructure
s=s.replace("  pieceSet?: 'classic' | 'fun';\n","")
p.write_text(s)
print('ok')