@echo off
setlocal
cd /d "%~dp0"
where py >nul 2>&1
if %ERRORLEVEL% EQU 0 (
  start "" "http://localhost:8765"
  echo StudioWeb aberto em http://localhost:8765
  echo Para encerrar, pressione Ctrl+C nesta janela.
  py -3 -m http.server 8765
  goto :EOF
)
where python >nul 2>&1
if %ERRORLEVEL% EQU 0 (
  start "" "http://localhost:8765"
  echo StudioWeb aberto em http://localhost:8765
  echo Para encerrar, pressione Ctrl+C nesta janela.
  python -m http.server 8765
  goto :EOF
)
echo Python 3 nao encontrado. Abrindo arquivo local no navegador.
start "" "%~dp0index.html"
