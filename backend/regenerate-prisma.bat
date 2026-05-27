@echo off
cd /d "c:\Users\maroder\Desktop\coding\shoestore\shoestorereact2\backend"
echo Cleaning Prisma cache...
rmdir /s /q "node_modules\.prisma" 2>nul
rmdir /s /q ".prisma" 2>nul
echo Regenerating Prisma client...
call npx prisma generate
echo Done!
pause
