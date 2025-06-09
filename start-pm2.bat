@echo off
cd /d "D:\Random-FN"
pm2 start server.js --name "random-fn"
pm2 save
