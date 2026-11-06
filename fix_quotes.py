import pathlib
p=pathlib.Path('src/components/learning/chess/ChessGame.tsx')
s=p.read_text()
s=s.replace('\\"','"')
p.write_text(s)
print('ok')