@echo off
cd /d "c:\Users\maroder\Desktop\coding\shoestore\shoestorereact2\backend"
echo Installing dependencies...
call npm install
echo Generating Prisma client...
call npx prisma generate
pause
