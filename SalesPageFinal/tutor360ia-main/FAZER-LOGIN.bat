@echo off
echo ==================================================
echo      VAMOS FAZER O LOGIN NA VERCEL!
echo ==================================================
echo.
echo 1. Quando aparecer a opcao, use as setas do teclado.
echo 2. Escolha "Continue with GitHub" ou "Email".
echo 3. O navegador vai abrir para confirmar.
echo.
echo Pressione qualquer tecla para comecar...
pause >nul

call npm install -g vercel
call vercel login

echo.
echo ==================================================
echo      LOGIN CONCLUIDO (Se deu tudo certo)
echo      Agora avise o AGENTE para continuar!
echo ==================================================
pause
